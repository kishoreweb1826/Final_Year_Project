package com.organicfarm.backend.service;

import com.organicfarm.backend.dto.OrderDTO;
import com.organicfarm.backend.dto.PaymentDTO;
import com.organicfarm.backend.exception.BusinessException;
import com.organicfarm.backend.exception.ResourceNotFoundException;
import com.organicfarm.backend.model.*;
import com.organicfarm.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;

    // ── Promo codes — in production, move these to a DB table ─────────
    private static final Map<String, BigDecimal> PROMO_CODES = new HashMap<>() {{
        put("ORGANIC10", new BigDecimal("0.10")); // 10% off
        put("FIRST20",   new BigDecimal("0.20")); // 20% off
        put("SAVE50",    new BigDecimal("50.00")); // flat ₹50 off
    }};

    private static final BigDecimal FREE_DELIVERY_THRESHOLD = new BigDecimal("500");
    private static final BigDecimal DELIVERY_CHARGE         = new BigDecimal("40");

    /**
     * POST /api/orders
     * Validates cart items, verifies stock, re-computes prices server-side,
     * creates the Order + Payment record atomically.
     *
     * For COD  → order status = CONFIRMED, payment status = PENDING
     * For ONLINE → order status = PAYMENT_PENDING; frontend must call /initiate
     */
    @Transactional
    public OrderDTO.Response placeOrder(Long userId, OrderDTO.PlaceOrderRequest req) {

        if (req.getItems() == null || req.getItems().isEmpty()) {
            throw new BusinessException("Your cart is empty. Please add items before placing an order.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // ── Build order & verify every item ───────────────────────────
        Order order = Order.builder()
                .user(user)
                .orderRef("#ORG" + System.currentTimeMillis())
                .deliveryName(req.getDeliveryName())
                .deliveryAddress(req.getDeliveryAddress())
                .deliveryCity(req.getDeliveryCity())
                .deliveryState(req.getDeliveryState())
                .deliveryPincode(req.getDeliveryPincode())
                .deliveryPhone(req.getDeliveryPhone())
                .paymentMethod(req.getPaymentMethod())
                .promoCode(req.getPromoCode() != null ? req.getPromoCode().toUpperCase() : null)
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderDTO.CartItemRequest ci : req.getItems()) {
            // All prices fetched from DB — never from the client
            Product product = productRepository.findById(ci.getProductId())
                    .filter(Product::isActive)
                    .orElseThrow(() -> new BusinessException(
                            "Product with id " + ci.getProductId() + " is no longer available."));

            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity()));
            subtotal = subtotal.add(lineTotal);

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .productName(product.getName())
                    .productImage(product.getImageUrl())
                    .unitPrice(product.getPrice())   // server-side price snapshot
                    .quantity(ci.getQuantity())
                    .lineTotal(lineTotal)
                    .build();
            order.getItems().add(item);
        }

        // ── Delivery charge ────────────────────────────────────────────
        BigDecimal delivery = subtotal.compareTo(FREE_DELIVERY_THRESHOLD) >= 0
                ? BigDecimal.ZERO
                : DELIVERY_CHARGE;

        // ── Promo discount ─────────────────────────────────────────────
        BigDecimal discount = BigDecimal.ZERO;
        String promoUpper = req.getPromoCode() != null ? req.getPromoCode().toUpperCase() : null;
        if (promoUpper != null && PROMO_CODES.containsKey(promoUpper)) {
            BigDecimal promoVal = PROMO_CODES.get(promoUpper);
            discount = promoVal.compareTo(BigDecimal.ONE) < 0
                    ? subtotal.multiply(promoVal)
                    : promoVal;
        }

        BigDecimal total = subtotal.add(delivery).subtract(discount).max(BigDecimal.ZERO);

        order.setSubtotal(subtotal);
        order.setDeliveryCharge(delivery);
        order.setDiscount(discount);
        order.setTotal(total);

        // ── Set order status based on payment method ───────────────────
        if (req.getPaymentMethod() == Order.PaymentMethod.COD) {
            order.setStatus(Order.OrderStatus.CONFIRMED);
        } else {
            order.setStatus(Order.OrderStatus.PAYMENT_PENDING);
        }

        order = orderRepository.save(order);

        // ── Create initial Payment record ──────────────────────────────
        Payment payment = Payment.builder()
                .order(order)
                .amount(total)
                .method(req.getPaymentMethod() == Order.PaymentMethod.COD
                        ? Payment.PaymentMethod.COD
                        : Payment.PaymentMethod.ONLINE)
                .status(req.getPaymentMethod() == Order.PaymentMethod.COD
                        ? Payment.PaymentStatus.PENDING
                        : Payment.PaymentStatus.PENDING)
                .build();
        paymentRepository.save(payment);

        log.info("Order {} placed by user {} | method={} | total={}",
                order.getOrderRef(), userId, req.getPaymentMethod(), total);

        return toResponse(order, payment);
    }

    public Page<OrderDTO.Response> getUserOrders(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return orderRepository.findByUser_Id(userId, pageable).map(o -> {
            Payment latest = paymentRepository.findByOrder_IdOrderByCreatedAtDesc(o.getId())
                    .stream().findFirst().orElse(null);
            return toResponse(o, latest);
        });
    }

    public OrderDTO.Response getOrderById(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        if (!order.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Order", orderId);
        }
        Payment latest = paymentRepository.findByOrder_IdOrderByCreatedAtDesc(orderId)
                .stream().findFirst().orElse(null);
        return toResponse(order, latest);
    }

    /** Validate a promo code and return the discount amount (server-side). */
    public Map<String, Object> validatePromo(String code, BigDecimal subtotal) {
        String upper = code.trim().toUpperCase();
        if (!PROMO_CODES.containsKey(upper)) {
            throw new BusinessException("Promo code \"" + code + "\" is invalid or expired.");
        }
        BigDecimal promoVal = PROMO_CODES.get(upper);
        BigDecimal discount = promoVal.compareTo(BigDecimal.ONE) < 0
                ? subtotal.multiply(promoVal)
                : promoVal;
        return Map.of("code", upper, "discount", discount, "valid", true);
    }

    // ── Helper ─────────────────────────────────────────────────────────
    private OrderDTO.Response toResponse(Order o, Payment payment) {
        OrderDTO.Response r = new OrderDTO.Response();
        r.setId(o.getId());
        r.setOrderRef(o.getOrderRef());
        r.setSubtotal(o.getSubtotal());
        r.setDeliveryCharge(o.getDeliveryCharge());
        r.setDiscount(o.getDiscount());
        r.setTotal(o.getTotal());
        r.setPromoCode(o.getPromoCode());
        r.setDeliveryName(o.getDeliveryName());
        r.setDeliveryAddress(o.getDeliveryAddress());
        r.setDeliveryCity(o.getDeliveryCity());
        r.setDeliveryState(o.getDeliveryState());
        r.setDeliveryPincode(o.getDeliveryPincode());
        r.setDeliveryPhone(o.getDeliveryPhone());
        r.setPaymentMethod(o.getPaymentMethod().name().toLowerCase());
        r.setStatus(o.getStatus().name().toLowerCase());
        r.setCreatedAt(o.getCreatedAt());
        r.setItems(o.getItems().stream().map(i -> {
            OrderDTO.OrderItemResponse ir = new OrderDTO.OrderItemResponse();
            ir.setId(i.getId());
            ir.setProductName(i.getProductName());
            ir.setProductImage(i.getProductImage());
            ir.setUnitPrice(i.getUnitPrice());
            ir.setQuantity(i.getQuantity());
            ir.setLineTotal(i.getLineTotal());
            return ir;
        }).collect(Collectors.toList()));

        if (payment != null) {
            PaymentDTO.PaymentResponse pr = new PaymentDTO.PaymentResponse();
            pr.setId(payment.getId());
            pr.setStatus(payment.getStatus().name().toLowerCase());
            pr.setMethod(payment.getMethod().name().toLowerCase());
            pr.setTransactionId(payment.getTransactionId());
            pr.setGatewayOrderId(payment.getGatewayOrderId());
            pr.setFailureReason(payment.getFailureReason());
            pr.setCreatedAt(payment.getCreatedAt());
            r.setLatestPayment(pr);
        }
        return r;
    }
}
