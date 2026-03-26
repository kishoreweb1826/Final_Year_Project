package com.organicfarm.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Contact message submitted through the Contact page.
 */
@Entity
@Table(name = "contact_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false)
    private String name;

    @NotBlank
    @Email
    @Column(nullable = false, length = 150)
    private String email;

    @Column(length = 15)
    private String phone;

    @NotBlank
    @Column(nullable = false, length = 50)
    private String subject;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    /** Whether the admin has responded */
    @Column(nullable = false)
    @Builder.Default
    private boolean responded = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
