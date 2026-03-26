package com.organicfarm.backend.controller;

import com.organicfarm.backend.dto.AuthDTO;
import com.organicfarm.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/login
     * Returns a JWT token and user info on success.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthDTO.AuthResponse> login(@Valid @RequestBody AuthDTO.LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    /**
     * POST /api/auth/register
     * Creates a new user account (customer or farmer) and returns a JWT.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthDTO.AuthResponse> register(@Valid @RequestBody AuthDTO.RegisterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(req));
    }
}
