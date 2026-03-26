package com.organicfarm.backend.dto;

import com.organicfarm.backend.model.Order;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTOs for Order placement and retrieval
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

        // Delivery address
        @NotBlank
        @Size(max = 100)
        private String deliveryName;

        @NotBlank
        private String deliveryAddress;

        @NotBlank
        private String deliveryCity;

        @Pattern(regexp = "^[6-9]\\d{9}$")
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
        private String deliveryCity;
        private String paymentMethod;
        private String status;
        private LocalDateTime createdAt;
    }
}
