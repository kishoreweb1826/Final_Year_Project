package com.organicfarm.backend.repository;

import com.organicfarm.backend.model.FarmerRegistration;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FarmerRegistrationRepository extends JpaRepository<FarmerRegistration, Long> {

    boolean existsByEmail(String email);

    Optional<FarmerRegistration> findByEmail(String email);

    Page<FarmerRegistration> findByStatus(FarmerRegistration.RegistrationStatus status, Pageable pageable);
}
