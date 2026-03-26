package com.organicfarm.backend.service;

import com.organicfarm.backend.dto.ContactMessageDTO;
import com.organicfarm.backend.model.ContactMessage;
import com.organicfarm.backend.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactMessageRepository contactMessageRepository;

    @Transactional
    public ContactMessage save(ContactMessageDTO dto) {
        ContactMessage msg = ContactMessage.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .subject(dto.getSubject())
                .message(dto.getMessage())
                .build();
        return contactMessageRepository.save(msg);
    }
}
