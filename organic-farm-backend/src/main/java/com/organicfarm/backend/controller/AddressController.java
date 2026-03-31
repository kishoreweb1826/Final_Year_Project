package com.organicfarm.backend.controller;

import com.organicfarm.backend.dto.AddressDTO;
import com.organicfarm.backend.security.UserDetailsImpl;
import com.organicfarm.backend.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    /** GET /api/addresses — list all saved addresses for logged-in user */
    @GetMapping
    public ResponseEntity<List<AddressDTO.Response>> getAddresses(
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(addressService.getUserAddresses(user.getId()));
    }

    /** POST /api/addresses — save a new address */
    @PostMapping
    public ResponseEntity<AddressDTO.Response> saveAddress(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody AddressDTO.SaveRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(addressService.saveAddress(user.getId(), req));
    }

    /** DELETE /api/addresses/{id} — delete a saved address */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl user) {
        addressService.deleteAddress(user.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
