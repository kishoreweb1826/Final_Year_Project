package com.organicfarm.backend.config;

import com.organicfarm.backend.model.User;
import com.organicfarm.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@organicfarm.com".toLowerCase();
        
        if (!userRepository.existsByEmail(adminEmail)) {
            log.info("Seeding default ADMIN account...");
            User admin = User.builder()
                    .name("System Administrator")
                    .email(adminEmail)
                    .phone("9999999999")
                    .password(passwordEncoder.encode("Admin@1234"))
                    .role(User.UserRole.ADMIN)
                    .emailVerified(true)
                    .farmerApproved(true)
                    .build();
            userRepository.save(admin);
            log.info("ADMIN account seeded successfully! Email: {} | Password: {}", adminEmail, "Admin@1234");
        } else {
            // Update password just in case they messed it up previously
            User admin = userRepository.findByEmail(adminEmail).get();
            admin.setPassword(passwordEncoder.encode("Admin@1234"));
            admin.setEmailVerified(true);
            admin.setFarmerApproved(true);
            admin.setRole(User.UserRole.ADMIN);
            userRepository.save(admin);
            log.info("ADMIN account verified and updated. Password is set to 'Admin@1234'");
        }
    }
}
