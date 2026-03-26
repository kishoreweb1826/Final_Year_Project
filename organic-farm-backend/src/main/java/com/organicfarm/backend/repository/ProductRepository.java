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

    @Query("""
            SELECT p FROM Product p
            WHERE p.active = true
              AND (:category IS NULL OR p.category = :category)
              AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))
                                  OR LOWER(p.farmerName) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<Product> search(
            @Param("category") Product.ProductCategory category,
            @Param("search") String search,
            Pageable pageable);

    List<Product> findByFarmer_IdAndActiveTrue(Long farmerId);
}
