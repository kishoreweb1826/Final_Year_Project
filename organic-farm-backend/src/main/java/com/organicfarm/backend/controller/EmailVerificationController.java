package com.organicfarm.backend.controller;

import com.organicfarm.backend.dto.VerificationDTO;
import com.organicfarm.backend.exception.OtpSendException;
import com.organicfarm.backend.service.EmailVerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for OTP-based email verification.
 *
 * POST /api/verification/send    — Send/resend OTP to email
 * POST /api/verification/verify  — Submit OTP to verify email
 * GET  /api/verification/status  — Check if an email is verified
 */
@Slf4j
@RestController
@RequestMapping("/api/verification")
@RequiredArgsConstructor
public class EmailVerificationController {

    private final EmailVerificationService verificationService;

    /**
     * Send or resend OTP.
     * Body:
     * {
     *   "email": "user@example.com"
     * }
     */
    @PostMapping("/send")
    public ResponseEntity<VerificationDTO.MessageResponse> send(
            @Valid @RequestBody VerificationDTO.SendRequest req) {

        try {
            String email = req.getEmail().trim().toLowerCase();

            VerificationDTO.MessageResponse response =
                    verificationService.sendVerificationOtp(email);

            return ResponseEntity.ok(response);

        } catch (OtpSendException e) {

            log.error("OTP send failed: {}", e.getMessage());

            VerificationDTO.MessageResponse response =
                    new VerificationDTO.MessageResponse(
                            "Unable to send verification email right now. Please try again later.",
                            false
                    );

            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(response);

        } catch (IllegalArgumentException e) {

            VerificationDTO.MessageResponse response =
                    new VerificationDTO.MessageResponse(
                            e.getMessage(),
                            false
                    );

            return ResponseEntity.badRequest().body(response);

        } catch (Exception e) {

            log.error("Unexpected error while sending OTP", e);

            VerificationDTO.MessageResponse response =
                    new VerificationDTO.MessageResponse(
                            "An unexpected error occurred.",
                            false
                    );

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(response);
        }
    }

    /**
     * Verify OTP.
     * Body:
     * {
     *   "email": "user@example.com",
     *   "otp": "123456"
     * }
     */
    @PostMapping("/verify")
    public ResponseEntity<VerificationDTO.MessageResponse> verify(
            @Valid @RequestBody VerificationDTO.VerifyRequest req) {

        try {
            String email = req.getEmail().trim().toLowerCase();

            VerificationDTO.MessageResponse response =
                    verificationService.verifyOtp(email, req.getOtp());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {

            VerificationDTO.MessageResponse response =
                    new VerificationDTO.MessageResponse(
                            e.getMessage(),
                            false
                    );

            return ResponseEntity.badRequest().body(response);

        } catch (Exception e) {

            log.error("Unexpected error while verifying OTP", e);

            VerificationDTO.MessageResponse response =
                    new VerificationDTO.MessageResponse(
                            "Verification failed.",
                            false
                    );

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(response);
        }
    }

    /**
     * Returns verification status by email query param.
     */
    @GetMapping("/status")
    public ResponseEntity<VerificationDTO.StatusResponse> status(
            @RequestParam String email) {

        try {
            return ResponseEntity.ok(
                    verificationService.getStatus(email)
            );

        } catch (Exception e) {

            log.error("Status check failed", e);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new VerificationDTO.StatusResponse(false, email));
        }
    }
}