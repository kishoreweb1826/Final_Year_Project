package com.organicfarm.backend.service;

import com.organicfarm.backend.dto.AddressDTO;
import com.organicfarm.backend.exception.ResourceNotFoundException;
import com.organicfarm.backend.model.Address;
import com.organicfarm.backend.model.User;
import com.organicfarm.backend.repository.AddressRepository;
import com.organicfarm.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public List<AddressDTO.Response> getUserAddresses(Long userId) {
        return addressRepository.findByUser_IdOrderByIsDefaultDescCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressDTO.Response saveAddress(Long userId, AddressDTO.SaveRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // If this address is set as default, clear other defaults
        if (req.isDefault()) {
            addressRepository.findByUser_IdOrderByIsDefaultDescCreatedAtDesc(userId)
                    .forEach(a -> { a.setDefault(false); addressRepository.save(a); });
        }

        Address address = Address.builder()
                .user(user)
                .fullName(req.getFullName())
                .addressLine(req.getAddressLine())
                .city(req.getCity())
                .state(req.getState())
                .pincode(req.getPincode())
                .phone(req.getPhone())
                .isDefault(req.isDefault())
                .build();

        return toResponse(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", addressId));
        if (!address.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Address", addressId);
        }
        addressRepository.delete(address);
    }

    private AddressDTO.Response toResponse(Address a) {
        AddressDTO.Response r = new AddressDTO.Response();
        r.setId(a.getId());
        r.setFullName(a.getFullName());
        r.setAddressLine(a.getAddressLine());
        r.setCity(a.getCity());
        r.setState(a.getState());
        r.setPincode(a.getPincode());
        r.setPhone(a.getPhone());
        r.setDefault(a.isDefault());
        r.setCreatedAt(a.getCreatedAt());
        return r;
    }
}
