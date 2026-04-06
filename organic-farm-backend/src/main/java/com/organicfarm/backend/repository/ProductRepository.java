package com.organicfarm.backend.repository;

import com.organicfarm.backend.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByActiveTrue();

    Page<Product> findByActiveTrue(Pageable pageable);

    List<Product> findByCategoryAndActiveTrue(Product.ProductCategory category);

    @Query(value = """
            SELECT * FROM products p
            WHERE p.active = true
              AND (CAST(:category AS text) IS NULL OR p.category = CAST(:category AS text))
              AND (CAST(:search AS text) IS NULL
                   OR LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%'))
                   OR LOWER(p.farmer_name) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%')))
            ORDER BY p.created_at DESC
            """,
            countQuery = "SELECT COUNT(*) FROM products WHERE active = true",
            nativeQuery = true)
    Page<Product> search(
            @Param("category") String category,
            @Param("search") String search,
            Pageable pageable);

    List<Product> findByFarmer_IdAndActiveTrue(Long farmerId);
}
