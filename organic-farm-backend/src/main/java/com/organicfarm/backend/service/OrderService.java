package com.organicfarm.backend.service;

import com.organicfarm.backend.dto.OrderDTO;
import com.organicfarm.backend.exception.ResourceNotFoundException;
import com.organicfarm.backend.model.*;
import com.organicfarm.backend.repository.*;
import lombok.RequiredArgsConstructor;
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
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    // Promo codes — in production, store these in the DB
    private static final Map<String, BigDecimal> PROMO_CODES = new HashMap<>() {
        {
            put("ORGANIC10", new BigDecimal("0.10")); // 10% discount
            put("FIRST20", new BigDecimal("0.20")); // 20% discount
            put("SAVE50", new BigDecimal("50.00")); // flat ₹50 off (stored as > 1 means flat)
        }
    };

    private static final BigDecimal FREE_DELIVERY_THRESHOLD = new BigDecimal("500");
    private static final BigDecimal DELIVERY_CHARGE = new BigDecimal("40");

    @Transactional
    public OrderDTO.Response placeOrder(Long userId, OrderDTO.PlaceOrderRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Build order items and compute subtotal
        BigDecimal subtotal = BigDecimal.ZERO;
        Order order = Order.builder()
                .user(user)
                .orderRef("#ORG" + System.currentTimeMillis())
                .deliveryName(req.getDeliveryName())
                .deliveryAddress(req.getDeliveryAddress())
                .deliveryCity(req.getDeliveryCity())
                .deliveryPhone(req.getDeliveryPhone())
                .paymentMethod(req.getPaymentMethod())
                .promoCode(req.getPromoCode())
                .build();

        for (OrderDTO.CartItemRequest ci : req.getItems()) {
            Product product = productRepository.findById(ci.getProductId())
                    .filter(Product::isActive)
                    .orElseThrow(() -> new ResourceNotFoundException("Product", ci.getProductId()));

            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity()));
            subtotal = subtotal.add(lineTotal);

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .productName(product.getName())
                    .productImage(product.getImageUrl())
                    .unitPrice(product.getPrice())
                    .quantity(ci.getQuantity())
                    .lineTotal(lineTotal)
                    .build();
            order.getItems().add(item);
        }

        // Delivery charge
        BigDecimal delivery = subtotal.compareTo(FREE_DELIVERY_THRESHOLD) >= 0
                ? BigDecimal.ZERO
                : DELIVERY_CHARGE;

        // Discount from promo code
        BigDecimal discount = BigDecimal.ZERO;
        if (req.getPromoCode() != null && PROMO_CODES.containsKey(req.getPromoCode().toUpperCase())) {
            BigDecimal promoValue = PROMO_CODES.get(req.getPromoCode().toUpperCase());
            discount = promoValue.compareTo(BigDecimal.ONE) < 0
                    ? subtotal.multiply(promoValue) // percentage
                    : promoValue; // flat amount
        }

        BigDecimal total = subtotal.add(delivery).subtract(discount).max(BigDecimal.ZERO);
        order.setSubtotal(subtotal);
        order.setDeliveryCharge(delivery);
        order.setDiscount(discount);
        order.setTotal(total);

        order = orderRepository.save(order);
        return toResponse(order);
    }

    public Page<OrderDTO.Response> getUserOrders(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return orderRepository.findByUser_Id(userId, pageable).map(this::toResponse);
    }

    public OrderDTO.Response getOrderById(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        if (!order.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Order", orderId);
        }
        return toResponse(order);
    }

    private OrderDTO.Response toResponse(Order o) {
        OrderDTO.Response r = new OrderDTO.Response();
        r.setId(o.getId());
        r.setOrderRef(o.getOrderRef());
        r.setSubtotal(o.getSubtotal());
        r.setDeliveryCharge(o.getDeliveryCharge());
        r.setDiscount(o.getDiscount());
        r.setTotal(o.getTotal());
        r.setPromoCode(o.getPromoCode());
        r.setDeliveryName(o.getDeliveryName());
        r.setDeliveryCity(o.getDeliveryCity());
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
        return r;
    }
}
