package com.organicfarm.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Tracks OTP-based email verification for a user.
 * One row per user; updated on every send/resend.
 */
@Entity
@Table(name = "email_verifications", indexes = {
        @Index(name = "idx_ev_user_id", columnList = "user_id"),
        @Index(name = "idx_ev_otp", columnList = "otp_code")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** FK to users.id — stored as plain Long to avoid circular entity dependency */
    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    /** The email address we sent the OTP to */
    @Column(nullable = false, length = 150)
    private String email;

    /** 6-digit OTP (hashed with BCrypt in the service) */
    @Column(name = "otp_code", length = 255)
    private String otpCode;

    /** When the OTP expires */
    @Column(name = "verification_expires_at")
    private LocalDateTime verificationExpiresAt;

    /** When the last OTP email was sent — used for resend cooldown */
    @Column(name = "verification_sent_at")
    private LocalDateTime verificationSentAt;

    /** True once the user enters the correct OTP */
    @Column(name = "email_verified", nullable = false)
    @Builder.Default
    private boolean emailVerified = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
