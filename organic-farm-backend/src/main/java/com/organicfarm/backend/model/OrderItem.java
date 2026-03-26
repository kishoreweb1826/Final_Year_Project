package com.organicfarm.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * A single line item inside an Order.
 * Stores a snapshot of price/name in case the product changes later.
 */
@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    /** Snapshot fields — kept even if product is deleted */
    @NotBlank
    @Column(nullable = false)
    private String productName;

    @Column(length = 500)
    private String productImage;

    @NotNull
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Min(1)
    @Max(50)
    @Column(nullable = false)
    private Integer quantity;

    @NotNull
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal lineTotal;
}
