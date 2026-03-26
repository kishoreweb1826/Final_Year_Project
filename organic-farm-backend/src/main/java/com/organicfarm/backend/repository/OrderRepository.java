package com.organicfarm.backend.repository;

import com.organicfarm.backend.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUser_IdOrderByCreatedAtDesc(Long userId);

    Page<Order> findByUser_Id(Long userId, Pageable pageable);

    Optional<Order> findByOrderRef(String orderRef);

    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);
}
