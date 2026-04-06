package com.organicfarm.backend.service;

import com.organicfarm.backend.dto.ProductDTO;
import com.organicfarm.backend.exception.ResourceNotFoundException;
import com.organicfarm.backend.model.Product;
import com.organicfarm.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public Page<ProductDTO.Response> getProducts(String search, String category, String sort, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        String cat = null;
        if (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category)) {
            try {
                cat = Product.ProductCategory.valueOf(category.toUpperCase()).name();
            } catch (IllegalArgumentException ignored) {
            }
        }

        String searchParam = (search != null && !search.isBlank()) ? search : null;

        return productRepository.search(cat, searchParam, pageable)
                .map(ProductDTO.Response::from);
    }

    public ProductDTO.Response getById(Long id) {
        return ProductDTO.Response.from(
                productRepository.findById(id)
                        .filter(Product::isActive)
                        .orElseThrow(() -> new ResourceNotFoundException("Product", id)));
    }

    @Transactional
    public ProductDTO.Response create(ProductDTO.Request req) {
        Product product = Product.builder()
                .name(req.getName())
                .price(req.getPrice())
                .category(req.getCategory())
                .imageUrl(req.getImageUrl())
                .rating(req.getRating())
                .description(req.getDescription())
                .farmerName(req.getFarmerName())
                .certified(req.isCertified())
                .build();
        return ProductDTO.Response.from(productRepository.save(product));
    }

    @Transactional
    public ProductDTO.Response update(Long id, ProductDTO.Request req) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        product.setName(req.getName());
        product.setPrice(req.getPrice());
        product.setCategory(req.getCategory());
        product.setImageUrl(req.getImageUrl());
        product.setRating(req.getRating());
        product.setDescription(req.getDescription());
        product.setFarmerName(req.getFarmerName());
        product.setCertified(req.isCertified());
        return ProductDTO.Response.from(productRepository.save(product));
    }

    @Transactional
    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        product.setActive(false);
        productRepository.save(product);
    }
}