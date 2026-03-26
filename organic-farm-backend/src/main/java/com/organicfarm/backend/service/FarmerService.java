package com.organicfarm.backend.service;

import com.organicfarm.backend.dto.FarmerRegistrationDTO;
import com.organicfarm.backend.exception.DuplicateResourceException;
import com.organicfarm.backend.exception.ResourceNotFoundException;
import com.organicfarm.backend.model.FarmerRegistration;
import com.organicfarm.backend.repository.FarmerRegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FarmerService {

    private final FarmerRegistrationRepository farmerRegistrationRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Transactional
    public FarmerRegistration register(FarmerRegistrationDTO dto, MultipartFile certificateFile) throws IOException {
        if (farmerRegistrationRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("A registration already exists for email: " + dto.getEmail());
        }

        // Save uploaded certificate
        String certPath = null;
        if (certificateFile != null && !certificateFile.isEmpty()) {
            certPath = saveCertificateFile(certificateFile);
        }

        FarmerRegistration reg = FarmerRegistration.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .farmName(dto.getFarmName())
                .farmAddress(dto.getFarmAddress())
                .city(dto.getCity())
                .state(dto.getState())
                .pincode(dto.getPincode())
                .farmSize(dto.getFarmSize())
                .cropTypes(dto.getCropTypes())
                .certificationNumber(dto.getCertificationNumber())
                .certificationDate(dto.getCertificationDate())
                .certifyingAuthority(dto.getCertifyingAuthority())
                .certificateFilePath(certPath)
                .bankName(dto.getBankName())
                .accountNumber(dto.getAccountNumber())
                .ifscCode(dto.getIfscCode())
                .accountHolderName(dto.getAccountHolderName())
                .status(FarmerRegistration.RegistrationStatus.PENDING)
                .build();

        return farmerRegistrationRepository.save(reg);
    }

    private String saveCertificateFile(MultipartFile file) throws IOException {
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);
        Files.copy(file.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
        return filename;
    }

    public FarmerRegistration getById(Long id) {
        return farmerRegistrationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FarmerRegistration", id));
    }
}
