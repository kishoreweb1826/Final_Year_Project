package com.organicfarm.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Organic product listed on the platform.
 * Category enum aligns with the React frontend values.
 */
@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 200)
    @Column(nullable = false)
    private String name;

    @NotNull
    @DecimalMin(value = "0.01")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ProductCategory category;

    @Column(length = 500)
    private String imageUrl;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "5.0")
    @Column(precision = 3, scale = 1)
    @Builder.Default
    private BigDecimal rating = BigDecimal.ZERO;

    @Size(max = 1000)
    @Column(columnDefinition = "TEXT")
    private String description;

    @Size(max = 200)
    private String farmerName;

    @Column(nullable = false)
    @Builder.Default
    private boolean certified = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    /**
     * Reference to the farmer user who owns this product (nullable for admin-seeded
     * products)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id")
    private User farmer;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum ProductCategory {
        VEGETABLES, FRUITS, GRAINS, DAIRY, OTHER
    }
}
