package com.organicfarm.backend.controller;

import com.organicfarm.backend.dto.OrderDTO;
import com.organicfarm.backend.security.UserDetailsImpl;
import com.organicfarm.backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * POST /api/orders
     * Authenticated users only. Places an order from the cart.
     */
    @PostMapping
    public ResponseEntity<OrderDTO.Response> placeOrder(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody OrderDTO.PlaceOrderRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.placeOrder(user.getId(), req));
    }

    /**
     * GET /api/orders
     * Returns paginated order history for the logged-in user.
     */
    @GetMapping
    public ResponseEntity<Page<OrderDTO.Response>> getMyOrders(
            @AuthenticationPrincipal UserDetailsImpl user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getUserOrders(user.getId(), page, size));
    }

    /**
     * GET /api/orders/{id}
     * Returns a specific order belonging to the logged-in user.
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO.Response> getOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(orderService.getOrderById(id, user.getId()));
    }
}
