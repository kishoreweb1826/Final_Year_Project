package com.organicfarm.backend.controller;

import com.organicfarm.backend.dto.AdminDTO;
import com.organicfarm.backend.model.FarmerRegistration;
import com.organicfarm.backend.model.User;
import com.organicfarm.backend.repository.FarmerRegistrationRepository;
import com.organicfarm.backend.repository.UserRepository;
import com.organicfarm.backend.service.EmailVerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

/**
 * Admin endpoints for managing farmer approvals and viewing registrations.
 * In production, secure these with @PreAuthorize("hasRole('ADMIN')").
 */
@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final FarmerRegistrationRepository farmerRegistrationRepository;
    private final EmailVerificationService emailVerificationService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    // ═══════════════════════════════════════════════════════
    // FARMER APPROVAL
    // ═══════════════════════════════════════════════════════

    /**
     * GET /api/admin/pending-farmers
     * Returns all farmer accounts that are not yet approved, enriched with
     * registration details (farm info, certificate, etc.) when available.
     * 
     * OPTIMIZATION: Uses single query to fetch all data (no N+1 problem)
     */
    @GetMapping("/pending-farmers")
    public ResponseEntity<List<Map<String, Object>>> getPendingFarmers() {
        log.info("Fetching pending farmers for admin approval");
        try {
            // Single query: directly fetch all pending farmers with their registrations
            List<User> pending = userRepository.findByRoleAndFarmerApproved(
                    User.UserRole.FARMER, false);
            
            log.info("Found {} pending farmers", pending.size());
            
            // Build response DTO with cached registrations to avoid N+1
            Map<String, FarmerRegistration> registrationCache = new java.util.HashMap<>();
            if (!pending.isEmpty()) {
                List<String> emails = pending.stream()
                        .map(User::getEmail)
                        .toList();
                // Fetch all registrations in single bulk query
                farmerRegistrationRepository.findByEmailIn(emails)
                        .forEach(reg -> registrationCache.put(reg.getEmail(), reg));
            }
            
            List<Map<String, Object>> result = pending.stream().map(u -> {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", u.getId());
                map.put("name", u.getName());
                map.put("email", u.getEmail());
                map.put("phone", u.getPhone() != null ? u.getPhone() : "");
                map.put("createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : "");
                map.put("farmerApproved", u.getFarmerApproved());

                // Use cached registration instead of querying per user
                FarmerRegistration reg = registrationCache.get(u.getEmail());
                if (reg != null) {
                    map.put("registrationId", reg.getId());
                    map.put("farmName", reg.getFarmName());
                    map.put("farmAddress", reg.getFarmAddress());
                    map.put("city", reg.getCity());
                    map.put("state", reg.getState());
                    map.put("pincode", reg.getPincode());
                    map.put("farmSize", reg.getFarmSize());
                    map.put("certificationNumber", reg.getCertificationNumber());
                    map.put("certificationDate",
                            reg.getCertificationDate() != null ? reg.getCertificationDate().toString() : "");
                    map.put("certifyingAuthority", reg.getCertifyingAuthority());
                    map.put("certificateFilePath", reg.getCertificateFilePath());
                    map.put("cropTypes", reg.getCropTypes());
                    map.put("registrationStatus", reg.getStatus().name());
                    map.put("rejectionReason", reg.getRejectionReason() != null ? reg.getRejectionReason() : "");
                }

                return map;
            }).toList();
            
            log.info("Successfully built response for {} pending farmers", result.size());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error fetching pending farmers", e);
            throw e;
        }
    }

    /**
     * GET /api/admin/all-farmers
     * Returns all farmer users with their approval status.
     */
    @GetMapping("/all-farmers")
    public ResponseEntity<List<Map<String, Object>>> getAllFarmers() {
        List<User> farmers = userRepository.findByRole(User.UserRole.FARMER);
        List<Map<String, Object>> result = farmers.stream().map(u -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getName());
            map.put("email", u.getEmail());
            map.put("phone", u.getPhone() != null ? u.getPhone() : "");
            map.put("farmerApproved", u.getFarmerApproved());
            map.put("enabled", u.isEnabled());
            map.put("createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : "");

            farmerRegistrationRepository.findByEmail(u.getEmail()).ifPresent(reg -> {
                map.put("farmName", reg.getFarmName());
                map.put("certificationNumber", reg.getCertificationNumber());
                map.put("registrationStatus", reg.getStatus().name());
            });

            return map;
        }).toList();
        return ResponseEntity.ok(result);
    }

    /**
     * POST /api/admin/approve-farmer/{id}
     * Approves a farmer's certificate so they can log in.
     * Also updates the registration status to APPROVED.
     */
    @PostMapping("/approve-farmer/{id}")
    public ResponseEntity<Map<String, String>> approveFarmer(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() != User.UserRole.FARMER) {
            return ResponseEntity.badRequest().body(Map.of("error", "User is not a farmer"));
        }
        user.setFarmerApproved(true);
        userRepository.save(user);

        // Also update registration status
        farmerRegistrationRepository.findByEmail(user.getEmail()).ifPresent(reg -> {
            reg.setStatus(FarmerRegistration.RegistrationStatus.APPROVED);
            farmerRegistrationRepository.save(reg);

            // Notify the farmer
            emailVerificationService.sendApprovalEmail(user.getEmail(), user.getName());
        });

        return ResponseEntity.ok(Map.of("message", "Farmer " + user.getName() + " has been approved successfully"));
    }

    /**
     * Rejects a farmer but DOES NOT disable their account entirely.
     * Updates the registration status to REJECTED and saves a reason.
     */
    @PostMapping("/reject-farmer/{id}")
    public ResponseEntity<Map<String, String>> rejectFarmer(
            @PathVariable Long id,
            @RequestBody AdminDTO.RejectRequest req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setFarmerApproved(false);
        // We keep the account enabled so they can log in to see the reason
        userRepository.save(user);

        // Also update registration status
        farmerRegistrationRepository.findByEmail(user.getEmail()).ifPresent(reg -> {
            reg.setStatus(FarmerRegistration.RegistrationStatus.REJECTED);
            reg.setRejectionReason(req.getReason());
            farmerRegistrationRepository.save(reg);

            // Notify the farmer
            emailVerificationService.sendRejectionEmail(user.getEmail(), user.getName(), req.getReason());
        });

        return ResponseEntity.ok(
                Map.of("message", "Farmer " + user.getName() + " has been rejected with reason: " + req.getReason()));
    }

    /**
     * GET /api/admin/certificate/{filename}
     * Serves the uploaded certificate file for admin review.
     */
    @GetMapping("/certificate/{filename:.+}")
    public ResponseEntity<Resource> getCertificate(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                String contentType = "application/octet-stream";
                if (filename.endsWith(".pdf"))
                    contentType = "application/pdf";
                else if (filename.endsWith(".jpg") || filename.endsWith(".jpeg"))
                    contentType = "image/jpeg";
                else if (filename.endsWith(".png"))
                    contentType = "image/png";

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ═══════════════════════════════════════════════════════
    // DASHBOARD STATS
    // ═══════════════════════════════════════════════════════

    /**
     * GET /api/admin/stats
     * Returns dashboard statistics for admin panel.
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        long totalUsers = userRepository.count();
        long pendingFarmers = userRepository.findByRoleAndFarmerApproved(User.UserRole.FARMER, false).size();
        long approvedFarmers = userRepository.findByRoleAndFarmerApproved(User.UserRole.FARMER, true).size();

        return ResponseEntity.ok(Map.of(
                "totalUsers", totalUsers,
                "pendingFarmers", pendingFarmers,
                "approvedFarmers", approvedFarmers));
    }
}
