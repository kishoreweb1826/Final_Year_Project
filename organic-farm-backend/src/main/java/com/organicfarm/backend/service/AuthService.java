package com.organicfarm.backend.service;

import com.organicfarm.backend.dto.AuthDTO;
import com.organicfarm.backend.exception.DuplicateResourceException;
import com.organicfarm.backend.model.FarmerRegistration;
import com.organicfarm.backend.model.User;
import com.organicfarm.backend.repository.FarmerRegistrationRepository;
import com.organicfarm.backend.repository.UserRepository;
import com.organicfarm.backend.security.JwtUtils;
import com.organicfarm.backend.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final EmailVerificationService emailVerificationService;
    private final FarmerRegistrationRepository farmerRegistrationRepository;

    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest req) {
        String normalizedEmail = req.getEmail().trim().toLowerCase();
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, req.getPassword()));
        UserDetailsImpl principal = (UserDetailsImpl) auth.getPrincipal();

        // Block login for unapproved farmers
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        
        if (user.getRole() == User.UserRole.FARMER && !Boolean.TRUE.equals(user.getFarmerApproved())) {
            String message = "Your farmer application is currently being reviewed by our authorities. " +
                             "You will be able to login once your certificate is approved. " +
                             "Please check back later or contact support for more information.";
            
            // Check if there is a rejection reason
            var registration = farmerRegistrationRepository.findByEmail(normalizedEmail);
            if (registration.isPresent() && registration.get().getStatus() == FarmerRegistration.RegistrationStatus.REJECTED) {
                message = "Your farmer application was rejected. Reason: " + 
                          (registration.get().getRejectionReason() != null ? registration.get().getRejectionReason() : "Incomplete documentation") + 
                          ". Please contact support to resolve this.";
            }
            
            throw new com.organicfarm.backend.exception.BusinessException(message);
        }

        String token = jwtUtils.generateToken(auth);
        return new AuthDTO.AuthResponse(token, principal.getId(), principal.getName(),
                principal.getEmail(), principal.getRole().name().toLowerCase(),
                principal.isEmailVerified(), Boolean.TRUE.equals(user.getFarmerApproved()));
    }

    @Transactional
    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest req) {
        if (!req.getPassword().equals(req.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        String normalizedEmail = req.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateResourceException("An account with this email already exists.");
        }

        User.UserRole role;
        boolean isFarmerApproved;
        boolean isEmailVerified;

        // Unique admin registration logic
        if ("admin@organicfarm.com".equalsIgnoreCase(normalizedEmail)) {
            role = User.UserRole.ADMIN;
            isFarmerApproved = true; // Admins don't need farmer approval
            isEmailVerified = true;  // Fake email doesn't need OTP!
        } else {
            role = "farmer".equalsIgnoreCase(req.getUserType())
                    ? User.UserRole.FARMER
                    : User.UserRole.CUSTOMER;
            isFarmerApproved = (role != User.UserRole.FARMER);
            isEmailVerified = false;
        }

        User user = User.builder()
                .name(req.getName())
                .email(normalizedEmail)
                .phone(req.getPhone())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(role)
                .emailVerified(isEmailVerified)
                .farmerApproved(isFarmerApproved)
                .build();

        userRepository.save(user);

        // Auto-send OTP after registration; log error but don't fail registration
        try {
            emailVerificationService.sendVerificationOtp(normalizedEmail);
        } catch (Exception e) {
            log.warn("Could not auto-send OTP after registration for {}: {}", normalizedEmail, e.getMessage());
        }

        String token = jwtUtils.generateTokenFromEmail(user.getEmail(), user.getId());
        return new AuthDTO.AuthResponse(token, user.getId(), user.getName(),
                user.getEmail(), user.getRole().name().toLowerCase(), false,
                Boolean.TRUE.equals(user.getFarmerApproved()));
    }
}
