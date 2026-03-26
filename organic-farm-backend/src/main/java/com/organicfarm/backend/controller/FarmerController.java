package com.organicfarm.backend.controller;

import com.organicfarm.backend.dto.FarmerRegistrationDTO;
import com.organicfarm.backend.model.FarmerRegistration;
import com.organicfarm.backend.service.FarmerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/farmers")
@RequiredArgsConstructor
public class FarmerController {

    private final FarmerService farmerService;

    /**
     * POST /api/farmers/register
     * Public endpoint. Accepts multipart/form-data with farmer details +
     * certificate file.
     *
     * Frontend sends:
     * - data: JSON blob (FarmerRegistrationDTO)
     * - certificate: the uploaded file (PDF/JPG/PNG)
     */
    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> register(
            @RequestPart("data") @Valid FarmerRegistrationDTO dto,
            @RequestPart(value = "certificate", required = false) MultipartFile certificate) throws IOException {
        FarmerRegistration saved = farmerService.register(dto, certificate);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message",
                "Registration submitted successfully! Our team will verify your certification within 24-48 hours.",
                "registrationId", saved.getId(),
                "status", saved.getStatus().name().toLowerCase()));
    }

    /**
     * GET /api/farmers/registration/{id}
     * Get registration status by ID.
     */
    @GetMapping("/registration/{id}")
    public ResponseEntity<Map<String, Object>> getStatus(@PathVariable Long id) {
        FarmerRegistration reg = farmerService.getById(id);
        return ResponseEntity.ok(Map.of(
                "id", reg.getId(),
                "status", reg.getStatus().name().toLowerCase(),
                "name", reg.getFirstName() + " " + reg.getLastName(),
                "farmName", reg.getFarmName()));
    }
}
