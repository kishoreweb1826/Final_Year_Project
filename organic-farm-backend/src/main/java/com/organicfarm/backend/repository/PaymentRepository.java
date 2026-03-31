package com.organicfarm.backend.repository;

import com.organicfarm.backend.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByOrder_IdOrderByCreatedAtDesc(Long orderId);

    Optional<Payment> findByGatewayOrderId(String gatewayOrderId);
}
