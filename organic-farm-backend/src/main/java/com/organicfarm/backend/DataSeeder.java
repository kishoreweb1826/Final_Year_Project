package com.organicfarm.backend;

import com.organicfarm.backend.model.Product;
import com.organicfarm.backend.model.User;
import com.organicfarm.backend.repository.ProductRepository;
import com.organicfarm.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Seeds initial data on first startup if the tables are empty.
 * Products match the seed data from the React AppContext.
 * Also creates a default admin user for testing.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdminUser();
        seedProducts();
    }

    private void seedAdminUser() {
        if (userRepository.existsByEmail("admin@organicfarm.com"))
            return;

        User admin = User.builder()
                .name("Admin")
                .email("admin@organicfarm.com")
                .password(passwordEncoder.encode("Admin@123"))
                .role(User.UserRole.ADMIN)
                .build();
        userRepository.save(admin);
        log.info("✅ Admin user seeded: admin@organicfarm.com / Admin@123");

        // Demo farmer account
        User farmer = User.builder()
                .name("Green Valley Farm")
                .email("farmer@organicfarm.com")
                .password(passwordEncoder.encode("Farmer@123"))
                .role(User.UserRole.FARMER)
                .build();
        userRepository.save(farmer);
        log.info("✅ Demo farmer seeded: farmer@organicfarm.com / Farmer@123");

        // Demo customer
        User customer = User.builder()
                .name("Demo Customer")
                .email("customer@organicfarm.com")
                .password(passwordEncoder.encode("Customer@123"))
                .role(User.UserRole.CUSTOMER)
                .build();
        userRepository.save(customer);
        log.info("✅ Demo customer seeded: customer@organicfarm.com / Customer@123");
    }

    private void seedProducts() {
        if (productRepository.count() > 0)
            return;

        List<Product> seeds = List.of(
                Product.builder().name("Organic Tomatoes").price(new BigDecimal("60"))
                        .category(Product.ProductCategory.VEGETABLES)
                        .imageUrl("https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400")
                        .rating(new BigDecimal("4.5")).description("Farm-fresh organic tomatoes.")
                        .farmerName("Green Valley Farm").certified(true).build(),

                Product.builder().name("Fresh Strawberries").price(new BigDecimal("120"))
                        .category(Product.ProductCategory.FRUITS)
                        .imageUrl("https://images.unsplash.com/photo-1518635017498-87f514b751ba?w=400")
                        .rating(new BigDecimal("4.8")).description("Juicy sweet strawberries.")
                        .farmerName("Berry Farms").certified(true).build(),

                Product.builder().name("Organic Spinach").price(new BigDecimal("40"))
                        .category(Product.ProductCategory.VEGETABLES)
                        .imageUrl("https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400")
                        .rating(new BigDecimal("4.6")).description("Fresh leafy spinach.").farmerName("Sunrise Organic")
                        .certified(true).build(),

                Product.builder().name("Brown Rice").price(new BigDecimal("80"))
                        .category(Product.ProductCategory.GRAINS)
                        .imageUrl("https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400")
                        .rating(new BigDecimal("4.7")).description("Whole grain brown rice.")
                        .farmerName("Golden Harvest").certified(true).build(),

                Product.builder().name("Red Apples").price(new BigDecimal("150"))
                        .category(Product.ProductCategory.FRUITS)
                        .imageUrl("https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400")
                        .rating(new BigDecimal("4.7")).description("Crisp and sweet apples.").farmerName("Apple Valley")
                        .certified(true).build(),

                Product.builder().name("Organic Honey").price(new BigDecimal("200"))
                        .category(Product.ProductCategory.OTHER)
                        .imageUrl("https://images.unsplash.com/photo-1587049352846-4a222e784acc?w=400")
                        .rating(new BigDecimal("4.9")).description("Pure raw organic honey.")
                        .farmerName("Bee Happy Farms").certified(true).build(),

                Product.builder().name("Fresh Basil").price(new BigDecimal("30"))
                        .category(Product.ProductCategory.VEGETABLES)
                        .imageUrl("https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=400")
                        .rating(new BigDecimal("4.7")).description("Aromatic fresh basil.").farmerName("Herb Garden")
                        .certified(true).build(),

                Product.builder().name("Organic Apples").price(new BigDecimal("120"))
                        .category(Product.ProductCategory.FRUITS)
                        .imageUrl("https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400")
                        .rating(new BigDecimal("4.8")).description("Fresh organic apples.").farmerName("Apple Valley")
                        .certified(true).build());

        productRepository.saveAll(seeds);
        log.info("✅ {} seed products created", seeds.size());
    }
}
