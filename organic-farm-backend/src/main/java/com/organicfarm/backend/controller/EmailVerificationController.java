package com.organicfarm.backend.controller;

import com.organicfarm.backend.dto.VerificationDTO;
import com.organicfarm.backend.service.EmailVerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for OTP-based email verification.
 *
 * POST /api/verification/send    — Send/resend OTP to email
 * POST /api/verification/verify  — Submit OTP to verify email
 * GET  /api/verification/status  — Check if an email is verified
 */
@RestController
@RequestMapping("/api/verification")
@RequiredArgsConstructor
public class EmailVerificationController {

    private final EmailVerificationService verificationService;

    /** Send or resend OTP. Body: { "email": "user@example.com" } */
    @PostMapping("/send")
    public ResponseEntity<VerificationDTO.MessageResponse> send(
            @Valid @RequestBody VerificationDTO.SendRequest req) {
        VerificationDTO.MessageResponse response = verificationService.sendVerificationOtp(
                req.getEmail().trim().toLowerCase());
        return ResponseEntity.ok(response);
    }

    /** Verify OTP. Body: { "email": "user@example.com", "otp": "123456" } */
    @PostMapping("/verify")
    public ResponseEntity<VerificationDTO.MessageResponse> verify(
            @Valid @RequestBody VerificationDTO.VerifyRequest req) {
        VerificationDTO.MessageResponse response = verificationService.verifyOtp(
                req.getEmail().trim().toLowerCase(), req.getOtp());
        return ResponseEntity.ok(response);
    }

    /** Returns verification status by email query param. */
    @GetMapping("/status")
    public ResponseEntity<VerificationDTO.StatusResponse> status(
            @RequestParam String email) {
        return ResponseEntity.ok(verificationService.getStatus(email));
    }
}
