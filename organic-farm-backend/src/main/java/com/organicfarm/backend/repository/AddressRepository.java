package com.organicfarm.backend.repository;

import com.organicfarm.backend.model.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUser_IdOrderByIsDefaultDescCreatedAtDesc(Long userId);
}
