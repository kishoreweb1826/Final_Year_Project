package com.organicfarm.backend.controller;

import com.organicfarm.backend.dto.ProductDTO;
import com.organicfarm.backend.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    /**
     * GET /api/products
     * Public. Supports query params: search, category, sort, page, size
     */
    @GetMapping
    public ResponseEntity<Page<ProductDTO.Response>> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(productService.getProducts(search, category, sort, page, size));
    }

    /**
     * GET /api/products/{id}
     * Public.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO.Response> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    /**
     * POST /api/products
     * Requires ADMIN or FARMER role.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FARMER')")
    public ResponseEntity<ProductDTO.Response> create(@Valid @RequestBody ProductDTO.Request req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(req));
    }

    /**
     * PUT /api/products/{id}
     * Requires ADMIN or FARMER role.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FARMER')")
    public ResponseEntity<ProductDTO.Response> update(@PathVariable Long id,
            @Valid @RequestBody ProductDTO.Request req) {
        return ResponseEntity.ok(productService.update(id, req));
    }

    /**
     * DELETE /api/products/{id}
     * Soft delete. Requires ADMIN or FARMER role.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FARMER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
