package com.organicfarm.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Tracks a payment attempt for an Order.
 * A single order can have multiple payment attempts (e.g., first attempt
 * failed, user retried).
 *
 * For Cash on Delivery, a single Payment row is created immediately with
 * status PENDING and gatewayOrderId = null.
 *
 * For Online Payment, the flow is:
 *   1. POST /api/payments/initiate  → creates row with status PENDING,
 *      returns gatewayOrderId for the frontend SDK.
 *   2. Frontend completes payment via gateway SDK.
 *   3. POST /api/payments/verify    → backend verifies signature, sets
 *      status SUCCESS or FAILED.
 */
@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentMethod method;

    /**
     * ID assigned by payment gateway (Razorpay order_id / Stripe PaymentIntent id).
     * NULL for COD.
     */
    @Column(length = 200)
    private String gatewayOrderId;

    /**
     * Transaction ID returned by gateway after successful payment.
     * NULL for COD or failed payments.
     */
    @Column(length = 200)
    private String transactionId;

    /** Raw gateway signature for verification (kept for audit). */
    @Column(columnDefinition = "TEXT")
    private String gatewaySignature;

    /** Human-readable failure reason, if any. */
    @Column(length = 500)
    private String failureReason;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum PaymentStatus {
        PENDING, SUCCESS, FAILED, CANCELLED, REFUNDED
    }

    public enum PaymentMethod {
        COD, ONLINE
    }
}
