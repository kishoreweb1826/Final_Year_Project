package com.organicfarm.backend.service;

import com.organicfarm.backend.dto.AuthDTO;
import com.organicfarm.backend.exception.DuplicateResourceException;
import com.organicfarm.backend.model.User;
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

    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        UserDetailsImpl principal = (UserDetailsImpl) auth.getPrincipal();
        String token = jwtUtils.generateToken(auth);
        return new AuthDTO.AuthResponse(token, principal.getId(), principal.getName(),
                principal.getEmail(), principal.getRole().name().toLowerCase(),
                principal.isEmailVerified());
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

        User.UserRole role = "farmer".equalsIgnoreCase(req.getUserType())
                ? User.UserRole.FARMER
                : User.UserRole.CUSTOMER;

        User user = User.builder()
                .name(req.getName())
                .email(normalizedEmail)
                .phone(req.getPhone())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(role)
                .emailVerified(false)
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
                user.getEmail(), user.getRole().name().toLowerCase(), false);
    }
}
