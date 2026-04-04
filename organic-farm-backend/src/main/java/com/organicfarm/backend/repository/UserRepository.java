package com.organicfarm.backend.repository;

import com.organicfarm.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRoleAndFarmerApproved(User.UserRole role, Boolean farmerApproved);

    List<User> findByRole(User.UserRole role);
}
