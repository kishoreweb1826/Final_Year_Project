package com.organicfarm.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Farmer registration application submitted through the Farmers page.
 * Includes personal, farm, certification, and bank details.
 * Status tracks the approval workflow.
 */
@Entity
@Table(name = "farmer_registrations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmerRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Personal Info ──────────────────────────────────────────
    @NotBlank
    @Column(nullable = false, length = 80)
    private String firstName;

    @NotBlank
    @Column(nullable = false, length = 80)
    private String lastName;

    @NotBlank
    @Email
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @NotBlank
    @Pattern(regexp = "^[6-9]\\d{9}$")
    @Column(nullable = false, length = 10)
    private String phone;

    // ── Farm Info ─────────────────────────────────────────────
    @NotBlank
    @Column(nullable = false)
    private String farmName;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String farmAddress;

    @NotBlank
    @Column(nullable = false)
    private String city;

    @NotBlank
    @Column(nullable = false)
    private String state;

    @Pattern(regexp = "^\\d{6}$")
    @Column(nullable = false, length = 6)
    private String pincode;

    @Column(precision = 8, scale = 2)
    private java.math.BigDecimal farmSize;

    @ElementCollection
    @CollectionTable(name = "farmer_crop_types", joinColumns = @JoinColumn(name = "registration_id"))
    @Column(name = "crop_type")
    @Builder.Default
    private List<String> cropTypes = new ArrayList<>();

    // ── Certification ─────────────────────────────────────────
    @NotBlank
    @Column(nullable = false)
    private String certificationNumber;

    private LocalDate certificationDate;

    @NotBlank
    @Column(nullable = false)
    private String certifyingAuthority;

    /** Path/filename of uploaded certificate document */
    @Column(length = 500)
    private String certificateFilePath;

    // ── Bank Details ──────────────────────────────────────────
    @Column(length = 100)
    private String bankName;

    @Column(length = 20)
    private String accountNumber;

    @Column(length = 11)
    private String ifscCode;

    @Column(length = 100)
    private String accountHolderName;

    // ── Workflow Status ───────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private RegistrationStatus status = RegistrationStatus.PENDING;

    /** FK to User account once approved and account created */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum RegistrationStatus {
        PENDING, UNDER_REVIEW, APPROVED, REJECTED
    }
}
