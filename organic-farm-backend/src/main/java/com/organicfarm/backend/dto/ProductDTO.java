package com.organicfarm.backend.dto;

import com.organicfarm.backend.model.Product;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTOs for Product CRUD operations
 */
public class ProductDTO {

    @Data
    public static class Request {
        @NotBlank
        @Size(max = 200)
        private String name;

        @NotNull
        @DecimalMin("0.01")
        private BigDecimal price;

        @NotNull
        private Product.ProductCategory category;

        @Size(max = 500)
        private String imageUrl;

        @DecimalMin("0.0")
        @DecimalMax("5.0")
        private BigDecimal rating;

        @Size(max = 1000)
        private String description;

        @Size(max = 200)
        private String farmerName;

        private boolean certified;
    }

    @Data
    public static class Response {
        private Long id;
        private String name;
        private BigDecimal price;
        private String category;
        private String imageUrl;
        private BigDecimal rating;
        private String description;
        private String farmerName;
        private boolean certified;
        private boolean active;
        private LocalDateTime createdAt;

        public static Response from(Product p) {
            Response r = new Response();
            r.id = p.getId();
            r.name = p.getName();
            r.price = p.getPrice();
            r.category = p.getCategory() != null ? p.getCategory().name().toLowerCase() : null;
            r.imageUrl = p.getImageUrl();
            r.rating = p.getRating();
            r.description = p.getDescription();
            r.farmerName = p.getFarmerName();
            r.certified = p.isCertified();
            r.active = p.isActive();
            r.createdAt = p.getCreatedAt();
            return r;
        }
    }
}
