package com.organicfarm.backend.dto;

import com.organicfarm.backend.model.Order;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTOs for Order placement and retrieval.
 * Prices are NEVER accepted from the client — the backend computes
 * all prices from the DB to prevent fraud.
 */
public class OrderDTO {

    @Data
    public static class CartItemRequest {
        @NotNull
        private Long productId;

        @Min(1)
        @Max(50)
        private Integer quantity;
    }

    @Data
    public static class PlaceOrderRequest {
        @NotEmpty
        @Valid
        private List<CartItemRequest> items;

        @Size(max = 30)
        private String promoCode;

        // Delivery address (typed in or pre-filled from saved address)
        @NotBlank
        @Size(max = 100)
        private String deliveryName;

        @NotBlank
        private String deliveryAddress;

        @NotBlank
        @Size(max = 100)
        private String deliveryCity;

        @Size(max = 100)
        private String deliveryState;

        @Size(max = 10)
        private String deliveryPincode;

        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit Indian mobile number")
        private String deliveryPhone;

        @NotNull
        private Order.PaymentMethod paymentMethod;
    }

    @Data
    public static class OrderItemResponse {
        private Long id;
        private String productName;
        private String productImage;
        private BigDecimal unitPrice;
        private Integer quantity;
        private BigDecimal lineTotal;
    }

    @Data
    public static class Response {
        private Long id;
        private String orderRef;
        private List<OrderItemResponse> items;
        private BigDecimal subtotal;
        private BigDecimal deliveryCharge;
        private BigDecimal discount;
        private BigDecimal total;
        private String promoCode;
        private String deliveryName;
        private String deliveryAddress;
        private String deliveryCity;
        private String deliveryState;
        private String deliveryPincode;
        private String deliveryPhone;
        private String paymentMethod;
        private String status;
        private LocalDateTime createdAt;
        // Latest payment info (if any)
        private PaymentDTO.PaymentResponse latestPayment;
    }
}
