package com.organicfarm.backend.controller;

import com.organicfarm.backend.dto.ContactMessageDTO;
import com.organicfarm.backend.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    /**
     * POST /api/contact
     * Public. Saves a contact form message from the Contact page.
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> sendMessage(@Valid @RequestBody ContactMessageDTO dto) {
        contactService.save(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "status", "success",
                "message", "Message sent successfully! We will get back to you soon."));
    }
}
