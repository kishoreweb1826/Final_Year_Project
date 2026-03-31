package com.organicfarm.backend.service;

import com.organicfarm.backend.dto.PaymentDTO;
import com.organicfarm.backend.exception.BusinessException;
import com.organicfarm.backend.exception.ResourceNotFoundException;
import com.organicfarm.backend.model.Order;
import com.organicfarm.backend.model.Payment;
import com.organicfarm.backend.repository.OrderRepository;
import com.organicfarm.backend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Handles online payment lifecycle.
 *
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  GATEWAY INTEGRATION GUIDE                                        │
 * │                                                                    │
 * │  To plug in Razorpay:                                             │
 * │    1. Add dependency: com.razorpay:razorpay-java:1.4.5            │
 * │    2. Store keys in application.properties:                       │
 * │         app.razorpay.key-id=rzp_test_XXXX                        │
 * │         app.razorpay.key-secret=XXXX                              │
 * │    3. In initiateOnlinePayment(): call                            │
 * │         RazorpayClient client = new RazorpayClient(keyId, secret) │
 * │         JSONObject opts = new JSONObject();                       │
 * │         opts.put("amount", order.getTotal().multiply(100).intValue())│
 * │         opts.put("currency", "INR");                              │
 * │         opts.put("receipt", order.getOrderRef());                 │
 * │         com.razorpay.Order rOrder = client.orders.create(opts);   │
 * │         return rOrder.get("id");  // "order_XXXXX"               │
 * │    4. In verifyOnlinePayment(): validate HMAC-SHA256 signature:   │
 * │         Utils.verifyPaymentSignature(Map.of(                      │
 * │             "razorpay_order_id", req.getGatewayOrderId(),          │
 * │             "razorpay_payment_id", req.getGatewayPaymentId()),    │
 * │             req.getGatewaySignature(), secret)                    │
 * │                                                                    │
 * │  To plug in Stripe:                                               │
 * │    1. Add dependency: com.stripe:stripe-java:23.x                 │
 * │    2. Stripe.apiKey = System.getenv("STRIPE_SECRET_KEY");         │
 * │    3. Create PaymentIntent, return client_secret to frontend.     │
 * │    4. In verify: use constructEvent() with webhook secret.        │
 * └────────────────────────────────────────────────────────────────────┘
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    /**
     * Called before showing the payment gateway UI.
     * Creates (or reuses) a PENDING payment record and returns the
     * gateway order ID that the frontend SDK needs.
     */
    @Transactional
    public PaymentDTO.InitiateResponse initiateOnlinePayment(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Order", orderId);
        }
        if (order.getStatus() == Order.OrderStatus.CONFIRMED ||
                order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new BusinessException("This order has already been paid.");
        }

        // Re-use the existing pending payment record if present
        Payment payment = paymentRepository.findByOrder_IdOrderByCreatedAtDesc(orderId)
                .stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.PENDING
                          || p.getStatus() == Payment.PaymentStatus.FAILED)
                .findFirst()
                .orElseGet(() -> {
                    Payment p = Payment.builder()
                            .order(order)
                            .amount(order.getTotal())
                            .method(Payment.PaymentMethod.ONLINE)
                            .status(Payment.PaymentStatus.PENDING)
                            .build();
                    return paymentRepository.save(p);
                });

        // ── TODO: Replace this stub with real gateway call ─────────────
        // String gatewayOrderId = razorpayClient.orders.create(opts).get("id");
        String gatewayOrderId = "DEMO_GW_ORDER_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        // ── End stub ───────────────────────────────────────────────────

        payment.setGatewayOrderId(gatewayOrderId);
        payment.setStatus(Payment.PaymentStatus.PENDING);
        paymentRepository.save(payment);

        order.setStatus(Order.OrderStatus.PAYMENT_PENDING);
        orderRepository.save(order);

        PaymentDTO.InitiateResponse resp = new PaymentDTO.InitiateResponse();
        resp.setPaymentId(payment.getId());
        resp.setGatewayOrderId(gatewayOrderId);
        resp.setAmount(order.getTotal());
        resp.setCurrency("INR");
        resp.setStatus("pending");
        return resp;
    }

    /**
     * Called after the user completes payment in the gateway SDK.
     * Verifies the signature and marks the order CONFIRMED or FAILED.
     */
    @Transactional
    public PaymentDTO.VerifyResponse verifyOnlinePayment(PaymentDTO.VerifyRequest req, Long userId) {
        Order order = orderRepository.findById(req.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", req.getOrderId()));

        if (!order.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Order", req.getOrderId());
        }

        Payment payment = paymentRepository.findByGatewayOrderId(req.getGatewayOrderId())
                .orElseThrow(() -> new BusinessException("Payment record not found for this order."));

        // ── TODO: Replace stub with real HMAC verification ─────────────
        // boolean valid = Utils.verifyPaymentSignature(Map.of(
        //     "razorpay_order_id", req.getGatewayOrderId(),
        //     "razorpay_payment_id", req.getGatewayPaymentId()),
        //     req.getGatewaySignature(), keySecret);
        //
        // For DEMO mode, we accept any non-null signature:
        boolean isValid = req.getGatewaySignature() != null && !req.getGatewaySignature().isBlank();
        // ── End stub ───────────────────────────────────────────────────

        PaymentDTO.VerifyResponse resp = new PaymentDTO.VerifyResponse();
        resp.setOrderRef(order.getOrderRef());

        if (isValid) {
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            payment.setTransactionId(req.getGatewayPaymentId());
            payment.setGatewaySignature(req.getGatewaySignature());
            paymentRepository.save(payment);

            order.setStatus(Order.OrderStatus.CONFIRMED);
            orderRepository.save(order);

            resp.setSuccess(true);
            resp.setStatus("success");
            resp.setMessage("Payment verified successfully. Your order is confirmed!");
            resp.setTransactionId(req.getGatewayPaymentId());
            log.info("Payment verified for order {} | txn={}", order.getOrderRef(), req.getGatewayPaymentId());
        } else {
            payment.setStatus(Payment.PaymentStatus.FAILED);
            payment.setFailureReason("Signature verification failed");
            paymentRepository.save(payment);

            order.setStatus(Order.OrderStatus.PAYMENT_FAILED);
            orderRepository.save(order);

            resp.setSuccess(false);
            resp.setStatus("failed");
            resp.setMessage("Payment verification failed. Please try again or choose Cash on Delivery.");
            log.warn("Payment verification FAILED for order {}", order.getOrderRef());
        }

        return resp;
    }
}
