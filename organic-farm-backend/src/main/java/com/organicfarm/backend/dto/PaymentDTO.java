package com.organicfarm.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTOs for the Payment initiation and verification flow.
 *
 * COD flow:  No extra API call needed — order placement itself creates a
 *            PENDING payment record.
 *
 * Online flow:
 *   1. POST /api/payments/initiate  → returns InitiateResponse (gateway order id)
 *   2. Frontend SDK collects card/UPI details, returns paymentId + signature
 *   3. POST /api/payments/verify    → backend validates, marks order CONFIRMED
 *
 * To plug in Razorpay: implement the TODOs in PaymentService.
 * To plug in Stripe:   same structure, different SDK methods.
 */
public class PaymentDTO {

    /** Request body for POST /api/payments/initiate */
    @Data
    public static class InitiateRequest {
        @NotNull
        private Long orderId;
    }

    /** Response from POST /api/payments/initiate */
    @Data
    public static class InitiateResponse {
        private Long paymentId;          // Internal DB id
        private String gatewayOrderId;   // Razorpay order_id / Stripe payment_intent id
        private BigDecimal amount;
        private String currency;
        private String status;
    }

    /** Request body for POST /api/payments/verify */
    @Data
    public static class VerifyRequest {
        @NotNull
        private Long orderId;

        /** Gateway-assigned payment transaction id */
        @NotBlank
        private String gatewayPaymentId;

        /** Gateway-provided signature for HMAC verification */
        @NotBlank
        private String gatewaySignature;

        /** The gatewayOrderId originally returned by /initiate */
        @NotBlank
        private String gatewayOrderId;
    }

    /** Response from POST /api/payments/verify */
    @Data
    public static class VerifyResponse {
        private boolean success;
        private String status;     // SUCCESS | FAILED
        private String message;
        private String orderRef;
        private String transactionId;
    }

    /** Payment record response (embedded in OrderDTO.Response) */
    @Data
    public static class PaymentResponse {
        private Long id;
        private String status;
        private String method;
        private String transactionId;
        private String gatewayOrderId;
        private String failureReason;
        private LocalDateTime createdAt;
    }
}
