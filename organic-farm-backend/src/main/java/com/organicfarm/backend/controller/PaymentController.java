package com.organicfarm.backend.controller;

import com.organicfarm.backend.dto.PaymentDTO;
import com.organicfarm.backend.security.UserDetailsImpl;
import com.organicfarm.backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * POST /api/payments/initiate
     * Called by the frontend before opening the gateway payment widget.
     * Returns a gatewayOrderId that the SDK needs.
     */
    @PostMapping("/initiate")
    public ResponseEntity<PaymentDTO.InitiateResponse> initiatePayment(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody PaymentDTO.InitiateRequest req) {
        return ResponseEntity.ok(paymentService.initiateOnlinePayment(req.getOrderId(), user.getId()));
    }

    /**
     * POST /api/payments/verify
     * Called after the user completes payment in the gateway.
     * Backend validates the HMAC signature and marks the order as CONFIRMED.
     */
    @PostMapping("/verify")
    public ResponseEntity<PaymentDTO.VerifyResponse> verifyPayment(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody PaymentDTO.VerifyRequest req) {
        return ResponseEntity.ok(paymentService.verifyOnlinePayment(req, user.getId()));
    }
}
