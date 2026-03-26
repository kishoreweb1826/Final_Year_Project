package com.organicfarm.backend.service;

import com.organicfarm.backend.dto.AuthDTO;
import com.organicfarm.backend.exception.DuplicateResourceException;
import com.organicfarm.backend.model.User;
import com.organicfarm.backend.repository.UserRepository;
import com.organicfarm.backend.security.JwtUtils;
import com.organicfarm.backend.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        UserDetailsImpl principal = (UserDetailsImpl) auth.getPrincipal();
        String token = jwtUtils.generateToken(auth);
        return new AuthDTO.AuthResponse(token, principal.getId(), principal.getName(),
                principal.getEmail(), principal.getRole().name().toLowerCase());
    }

    @Transactional
    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest req) {
        if (!req.getPassword().equals(req.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + req.getEmail());
        }

        User.UserRole role = "farmer".equalsIgnoreCase(req.getUserType())
                ? User.UserRole.FARMER
                : User.UserRole.CUSTOMER;

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(role)
                .build();

        userRepository.save(user);

        String token = jwtUtils.generateTokenFromEmail(user.getEmail(), user.getId());
        return new AuthDTO.AuthResponse(token, user.getId(), user.getName(),
                user.getEmail(), user.getRole().name().toLowerCase());
    }
}
