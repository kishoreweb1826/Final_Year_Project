package com.organicfarm.backend.service;

import com.organicfarm.backend.dto.VerificationDTO;
import com.organicfarm.backend.model.EmailVerification;
import com.organicfarm.backend.model.User;
import com.organicfarm.backend.repository.EmailVerificationRepository;
import com.organicfarm.backend.repository.UserRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Handles the full OTP-based email-verification lifecycle:
 *   1. Generate a secure 6-digit OTP
 *   2. BCrypt-hash it before storing in DB
 *   3. Send the plain OTP via email
 *   4. Verify the submitted OTP against the stored hash
 *   5. Mark the user's email as verified on success
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final EmailVerificationRepository verificationRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.verification.otp-expiry-minutes:10}")
    private int otpExpiryMinutes;

    @Value("${app.verification.resend-cooldown-seconds:60}")
    private int resendCooldownSeconds;

    @Value("${app.verification.from-email}")
    private String fromEmail;

    @Value("${app.verification.from-name:OrganicFarm}")
    private String fromName;

    // ── Simple in-memory rate limit: max 5 send attempts per email per hour ──
    private final Map<String, AtomicInteger> rateLimitMap = new ConcurrentHashMap<>();
    private final Map<String, Long> rateLimitResetMap = new ConcurrentHashMap<>();
    private static final int MAX_SENDS_PER_HOUR = 5;

    private final SecureRandom secureRandom = new SecureRandom();

    // ─────────────────────────────────────────────────────────────────────────
    //  Public API
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Sends (or resends) a verification OTP to the given email.
     * - Finds the user; throws if not found.
     * - Enforces resend cooldown.
     * - Rate-limits to MAX_SENDS_PER_HOUR per email.
     * - Stores BCrypt-hashed OTP with expiry in DB.
     * - Sends the plain OTP via email.
     *
     * @return VerificationDTO.MessageResponse indicating success/failure
     */
    @Transactional
    public VerificationDTO.MessageResponse sendVerificationOtp(String email) {
        String normalizedEmail = email.trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("No account found. Please register first."));

        if (user.isEmailVerified()) {
            return new VerificationDTO.MessageResponse("Email is already verified.", true);
        }

        // Enforce resend cooldown
        EmailVerification existing = verificationRepository.findByUserId(user.getId()).orElse(null);
        if (existing != null && existing.getVerificationSentAt() != null) {
            long secondsElapsed = java.time.Duration.between(
                    existing.getVerificationSentAt(), LocalDateTime.now()).getSeconds();
            long remaining = resendCooldownSeconds - secondsElapsed;
            if (remaining > 0) {
                VerificationDTO.MessageResponse res = new VerificationDTO.MessageResponse(
                        "Please wait before requesting another code.", false);
                res.setCooldownSeconds(remaining);
                return res;
            }
        }

        // Rate limit check
        checkRateLimit(normalizedEmail);

        // Generate and store OTP
        String plainOtp = generateOtp();
        String hashedOtp = passwordEncoder.encode(plainOtp);

        if (existing == null) {
            existing = EmailVerification.builder()
                    .userId(user.getId())
                    .email(normalizedEmail)
                    .build();
        }
        existing.setOtpCode(hashedOtp);
        existing.setVerificationExpiresAt(LocalDateTime.now().plusMinutes(otpExpiryMinutes));
        existing.setVerificationSentAt(LocalDateTime.now());
        verificationRepository.save(existing);

        // Send email (async-safe: any exception is logged but not re-thrown here
        // so the DB state is already committed)
        try {
            sendOtpEmail(normalizedEmail, user.getName(), plainOtp);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", normalizedEmail, e.getMessage());
            return new VerificationDTO.MessageResponse(
                    "Could not send verification email. Please try again later.", false);
        }

        return new VerificationDTO.MessageResponse("Verification code sent to your email.", true);
    }

    /**
     * Verifies the OTP submitted by the user.
     * - Looks up the verification record.
     * - Checks expiry.
     * - BCrypt-matches the submitted OTP.
     * - Marks user.emailVerified = true on success.
     * - Clears OTP from DB on success to prevent replay.
     */
    @Transactional
    public VerificationDTO.MessageResponse verifyOtp(String email, String otp) {
        String normalizedEmail = email.trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired verification code."));

        if (user.isEmailVerified()) {
            return new VerificationDTO.MessageResponse("Email already verified.", true);
        }

        EmailVerification record = verificationRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired verification code."));

        // Check expiry
        if (record.getVerificationExpiresAt() == null ||
                LocalDateTime.now().isAfter(record.getVerificationExpiresAt())) {
            return new VerificationDTO.MessageResponse("Invalid or expired verification code.", false);
        }

        // BCrypt match
        if (!passwordEncoder.matches(otp, record.getOtpCode())) {
            return new VerificationDTO.MessageResponse("Invalid or expired verification code.", false);
        }

        // Mark verified
        user.setEmailVerified(true);
        userRepository.save(user);

        // Clear OTP to prevent replay
        record.setOtpCode(null);
        record.setVerificationExpiresAt(null);
        record.setEmailVerified(true);
        verificationRepository.save(record);

        return new VerificationDTO.MessageResponse("Email verified successfully!", true);
    }

    /**
     * Returns the verification status for a given email (used by the frontend
     * to poll status without leaking whether an email is registered).
     */
    public VerificationDTO.StatusResponse getStatus(String email) {
        String normalizedEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail).orElse(null);
        if (user == null) {
            // Return false without leaking that the email doesn't exist
            return new VerificationDTO.StatusResponse(false, normalizedEmail);
        }
        return new VerificationDTO.StatusResponse(user.isEmailVerified(), normalizedEmail);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Internal helpers
    // ─────────────────────────────────────────────────────────────────────────

    private String generateOtp() {
        int otp = 100_000 + secureRandom.nextInt(900_000);
        return String.valueOf(otp);
    }

    private void checkRateLimit(String email) {
        long now = System.currentTimeMillis();
        long oneHourMs = 3_600_000L;

        Long resetTime = rateLimitResetMap.get(email);
        if (resetTime == null || now > resetTime) {
            rateLimitMap.put(email, new AtomicInteger(0));
            rateLimitResetMap.put(email, now + oneHourMs);
        }

        AtomicInteger counter = rateLimitMap.computeIfAbsent(email, k -> new AtomicInteger(0));
        if (counter.incrementAndGet() > MAX_SENDS_PER_HOUR) {
            throw new IllegalStateException("Too many verification requests. Please try again later.");
        }
    }

    private void sendOtpEmail(String toEmail, String userName, String otp) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        try {
            helper.setFrom(fromEmail, fromName);
        } catch (java.io.UnsupportedEncodingException e) {
            helper.setFrom(fromEmail);
        }
        helper.setTo(toEmail);
        helper.setSubject("Your OrganicFarm Verification Code: " + otp);

        String html = buildEmailHtml(userName, otp);
        helper.setText(html, true);

        mailSender.send(message);
        log.info("OTP email sent to {}", toEmail);
    }

    private String buildEmailHtml(String name, String otp) {
        return """
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"></head>
                <body style="margin:0;padding:0;background:#f4f7f6;font-family:Arial,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;padding:30px 0;">
                    <tr><td align="center">
                      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
                        <tr>
                          <td style="background:linear-gradient(135deg,#2d6a4f,#40916c);padding:30px;text-align:center;">
                            <h1 style="color:#ffffff;margin:0;font-size:26px;">🌿 OrganicFarm</h1>
                            <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px;">Email Verification</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:36px 40px;">
                            <p style="color:#333;font-size:16px;margin:0 0 10px;">Hi <strong>%s</strong>,</p>
                            <p style="color:#555;font-size:15px;margin:0 0 24px;">Use the code below to verify your email address. It expires in <strong>10 minutes</strong>.</p>
                            <div style="text-align:center;margin:30px 0;">
                              <span style="display:inline-block;background:#f0faf4;border:2px dashed #40916c;border-radius:10px;padding:18px 40px;font-size:38px;font-weight:bold;letter-spacing:10px;color:#2d6a4f;">%s</span>
                            </div>
                            <p style="color:#888;font-size:13px;margin:0;">If you did not request this, please ignore this email. Never share this code with anyone.</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="background:#f9f9f9;padding:16px 40px;text-align:center;">
                            <p style="color:#aaa;font-size:12px;margin:0;">© 2025 OrganicFarm. All rights reserved.</p>
                          </td>
                        </tr>
                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
                """.formatted(name, otp);
    }
}
