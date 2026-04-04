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
                .emailVerified(true)
                .farmerApproved(true)
                .build();
        userRepository.save(admin);
        log.info("✅ Admin user seeded: admin@organicfarm.com / Admin@123");

        // Demo farmer account
        User farmer = User.builder()
                .name("Green Valley Farm")
                .email("farmer@organicfarm.com")
                .password(passwordEncoder.encode("Farmer@123"))
                .role(User.UserRole.FARMER)
                .emailVerified(true)
                .farmerApproved(true)
                .build();
        userRepository.save(farmer);
        log.info("✅ Demo farmer seeded: farmer@organicfarm.com / Farmer@123");

        // Demo customer
        User customer = User.builder()
                .name("Demo Customer")
                .email("customer@organicfarm.com")
                .password(passwordEncoder.encode("Customer@123"))
                .role(User.UserRole.CUSTOMER)
                .emailVerified(true)
                .farmerApproved(true)
                .build();
        userRepository.save(customer);
        log.info("✅ Demo customer seeded: customer@organicfarm.com / Customer@123");
    }

    private void seedProducts() {
        if (productRepository.count() > 0)
            return;

        List<Product> seeds = List.of(
                // ── VEGETABLES ──────────────────────────────────
                Product.builder().name("Organic Tomatoes").price(new BigDecimal("60"))
                        .category(Product.ProductCategory.VEGETABLES)
                        .imageUrl("https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400")
                        .rating(new BigDecimal("4.5")).description("Farm-fresh organic tomatoes grown without pesticides. Rich in lycopene and vitamins.")
                        .farmerName("Green Valley Farm").certified(true).build(),

                Product.builder().name("Organic Spinach").price(new BigDecimal("40"))
                        .category(Product.ProductCategory.VEGETABLES)
                        .imageUrl("https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400")
                        .rating(new BigDecimal("4.6")).description("Fresh leafy spinach packed with iron and nutrients. Pesticide-free and hand-picked.")
                        .farmerName("Sunrise Organic").certified(true).build(),

                Product.builder().name("Fresh Basil").price(new BigDecimal("30"))
                        .category(Product.ProductCategory.VEGETABLES)
                        .imageUrl("https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=400")
                        .rating(new BigDecimal("4.7")).description("Aromatic fresh basil perfect for Italian and Thai dishes.")
                        .farmerName("Herb Garden").certified(true).build(),

                Product.builder().name("Organic Carrots").price(new BigDecimal("45"))
                        .category(Product.ProductCategory.VEGETABLES)
                        .imageUrl("https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400")
                        .rating(new BigDecimal("4.4")).description("Crunchy organic carrots rich in beta-carotene. Great for juicing or cooking.")
                        .farmerName("Green Valley Farm").certified(true).build(),

                Product.builder().name("Fresh Broccoli").price(new BigDecimal("70"))
                        .category(Product.ProductCategory.VEGETABLES)
                        .imageUrl("https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400")
                        .rating(new BigDecimal("4.3")).description("Organically grown broccoli loaded with vitamins C and K.")
                        .farmerName("Nature's Best").certified(true).build(),

                Product.builder().name("Organic Potatoes").price(new BigDecimal("35"))
                        .category(Product.ProductCategory.VEGETABLES)
                        .imageUrl("https://images.unsplash.com/photo-1518977676601-b53f82ber5f7?w=400")
                        .rating(new BigDecimal("4.5")).description("Farm-fresh organic potatoes, perfect for curries and fries. No chemical fertilizers.")
                        .farmerName("Golden Harvest").certified(true).build(),

                Product.builder().name("Green Capsicum").price(new BigDecimal("55"))
                        .category(Product.ProductCategory.VEGETABLES)
                        .imageUrl("https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400")
                        .rating(new BigDecimal("4.2")).description("Crisp green capsicum grown organically. Rich in vitamin C.")
                        .farmerName("Fresh Fields").certified(true).build(),

                Product.builder().name("Organic Beetroot").price(new BigDecimal("50"))
                        .category(Product.ProductCategory.VEGETABLES)
                        .imageUrl("https://images.unsplash.com/photo-1585829777433-2af0c3ff10b1?w=400")
                        .rating(new BigDecimal("4.6")).description("Sweet and earthy organic beetroot. Excellent for salads and juices.")
                        .farmerName("Green Valley Farm").certified(true).build(),

                Product.builder().name("Fresh Lemon").price(new BigDecimal("20"))
                        .category(Product.ProductCategory.VEGETABLES)
                        .imageUrl("https://images.unsplash.com/photo-1587486914589-98317a3ee369?w=400")
                        .rating(new BigDecimal("4.8")).description("Zesty organic lemons, rich in Vitamin C. Ideal for refreshing drinks.")
                        .farmerName("Sunrise Organic").certified(true).build(),

                // ── FRUITS ──────────────────────────────────────
                Product.builder().name("Fresh Strawberries").price(new BigDecimal("120"))
                        .category(Product.ProductCategory.FRUITS)
                        .imageUrl("https://images.unsplash.com/photo-1518635017498-87f514b751ba?w=400")
                        .rating(new BigDecimal("4.8")).description("Juicy sweet strawberries hand-picked from organic farms in Mahabaleshwar.")
                        .farmerName("Berry Farms").certified(true).build(),

                Product.builder().name("Red Apples").price(new BigDecimal("150"))
                        .category(Product.ProductCategory.FRUITS)
                        .imageUrl("https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400")
                        .rating(new BigDecimal("4.7")).description("Crisp and sweet Shimla apples. Naturally grown without wax coating.")
                        .farmerName("Apple Valley").certified(true).build(),

                Product.builder().name("Organic Bananas").price(new BigDecimal("40"))
                        .category(Product.ProductCategory.FRUITS)
                        .imageUrl("https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400")
                        .rating(new BigDecimal("4.6")).description("Sweet organic bananas from Kerala. Rich in potassium and naturally ripened.")
                        .farmerName("Tropical Farms").certified(true).build(),

                Product.builder().name("Alphonso Mangoes").price(new BigDecimal("250"))
                        .category(Product.ProductCategory.FRUITS)
                        .imageUrl("https://images.unsplash.com/photo-1553279768-865429fa0078?w=400")
                        .rating(new BigDecimal("4.9")).description("Premium Ratnagiri Alphonso mangoes. Naturally ripened, carbide-free.")
                        .farmerName("Konkan Orchards").certified(true).build(),

                Product.builder().name("Organic Pomegranate").price(new BigDecimal("130"))
                        .category(Product.ProductCategory.FRUITS)
                        .imageUrl("https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400")
                        .rating(new BigDecimal("4.5")).description("Ruby-red pomegranate seeds bursting with antioxidants and flavor.")
                        .farmerName("Nature's Best").certified(true).build(),

                Product.builder().name("Fresh Guava").price(new BigDecimal("60"))
                        .category(Product.ProductCategory.FRUITS)
                        .imageUrl("https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=400")
                        .rating(new BigDecimal("4.4")).description("Crunchy, sweet guava from organic orchards of Allahabad.")
                        .farmerName("Sunrise Organic").certified(true).build(),

                Product.builder().name("Organic Grapes").price(new BigDecimal("90"))
                        .category(Product.ProductCategory.FRUITS)
                        .imageUrl("https://images.unsplash.com/photo-1537640538966-79f369b41e8f?w=400")
                        .rating(new BigDecimal("4.5")).description("Seedless black grapes grown organically in Nashik.")
                        .farmerName("Grape Estates").certified(true).build(),

                Product.builder().name("Fresh Papaya").price(new BigDecimal("55"))
                        .category(Product.ProductCategory.FRUITS)
                        .imageUrl("https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400")
                        .rating(new BigDecimal("4.3")).description("Sweet and ripe organic papaya, perfect for healthy breakfast.")
                        .farmerName("Tropical Farms").certified(true).build(),

                // ── GRAINS & PULSES ──────────────────────────────────────
                Product.builder().name("Brown Rice").price(new BigDecimal("80"))
                        .category(Product.ProductCategory.GRAINS)
                        .imageUrl("https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400")
                        .rating(new BigDecimal("4.7")).description("Whole grain brown rice from organic paddy fields of Tamil Nadu.")
                        .farmerName("Golden Harvest").certified(true).build(),

                Product.builder().name("Organic Quinoa").price(new BigDecimal("280"))
                        .category(Product.ProductCategory.GRAINS)
                        .imageUrl("https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400")
                        .rating(new BigDecimal("4.6")).description("Premium organic quinoa — a complete protein superfood for healthy meals.")
                        .farmerName("Health Harvest").certified(true).build(),

                Product.builder().name("Finger Millet (Ragi)").price(new BigDecimal("65"))
                        .category(Product.ProductCategory.GRAINS)
                        .imageUrl("https://images.unsplash.com/photo-1631209121750-a9f656d30838?w=400")
                        .rating(new BigDecimal("4.5")).description("Organic ragi — calcium-rich ancient grain. Perfect for porridge and dosa.")
                        .farmerName("Southern Farms").certified(true).build(),

                Product.builder().name("Organic Wheat Flour").price(new BigDecimal("55"))
                        .category(Product.ProductCategory.GRAINS)
                        .imageUrl("https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400")
                        .rating(new BigDecimal("4.4")).description("Stone-ground whole wheat flour from Punjab's organic wheat fields.")
                        .farmerName("Golden Harvest").certified(true).build(),

                Product.builder().name("Organic Moong Dal").price(new BigDecimal("140"))
                        .category(Product.ProductCategory.GRAINS)
                        .imageUrl("https://images.unsplash.com/photo-1585914966084-71fbf9167c7e?w=400")
                        .rating(new BigDecimal("4.8")).description("High-protein organic yellow moong dal, easy to digest and delicious.")
                        .farmerName("Southern Farms").certified(true).build(),

                Product.builder().name("Kashmiri Rajma").price(new BigDecimal("190"))
                        .category(Product.ProductCategory.GRAINS)
                        .imageUrl("https://images.unsplash.com/photo-1536304918768-e3bc64be5a2d?w=400")
                        .rating(new BigDecimal("4.7")).description("Authentic organic red kidney beans from the hills of Kashmir.")
                        .farmerName("Hilltop Organics").certified(true).build(),

                // ── DAIRY ───────────────────────────────────────
                Product.builder().name("A2 Cow Milk").price(new BigDecimal("70"))
                        .category(Product.ProductCategory.DAIRY)
                        .imageUrl("https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400")
                        .rating(new BigDecimal("4.8")).description("Fresh A2 milk from indigenous Gir cows. Hormone-free and farm-direct.")
                        .farmerName("Desi Dairy Farm").certified(true).build(),

                Product.builder().name("Organic Paneer").price(new BigDecimal("220"))
                        .category(Product.ProductCategory.DAIRY)
                        .imageUrl("https://images.unsplash.com/photo-1631452180539-96aca7b34d30?w=400")
                        .rating(new BigDecimal("4.7")).description("Fresh cottage cheese made from A2 cow milk. No preservatives added.")
                        .farmerName("Desi Dairy Farm").certified(true).build(),

                Product.builder().name("Pure Desi Ghee").price(new BigDecimal("550"))
                        .category(Product.ProductCategory.DAIRY)
                        .imageUrl("https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=400")
                        .rating(new BigDecimal("4.9")).description("Bilona method A2 ghee made from Sahiwal cow milk. Rich aroma and golden color.")
                        .farmerName("Heritage Dairy").certified(true).build(),

                Product.builder().name("Organic Curd").price(new BigDecimal("60"))
                        .category(Product.ProductCategory.DAIRY)
                        .imageUrl("https://images.unsplash.com/photo-1485962307416-993e145b0d0d?w=400")
                        .rating(new BigDecimal("4.6")).description("Thick and creamy organic curd made from farm-fresh cow milk.")
                        .farmerName("Desi Dairy Farm").certified(true).build(),

                // ── OILS & SPICES ───────────────────────────────────────
                Product.builder().name("Organic Honey").price(new BigDecimal("200"))
                        .category(Product.ProductCategory.OTHER)
                        .imageUrl("https://images.unsplash.com/photo-1587049352846-4a222e784acc?w=400")
                        .rating(new BigDecimal("4.9")).description("Pure raw organic honey from forest beehives. Unprocessed and unfiltered.")
                        .farmerName("Bee Happy Farms").certified(true).build(),

                Product.builder().name("Organic Turmeric Powder").price(new BigDecimal("180"))
                        .category(Product.ProductCategory.OTHER)
                        .imageUrl("https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400")
                        .rating(new BigDecimal("4.7")).description("High-curcumin Lakadong turmeric from Meghalaya. Lab-tested for purity.")
                        .farmerName("Spice Valley").certified(true).build(),

                Product.builder().name("Cold-Pressed Coconut Oil").price(new BigDecimal("320"))
                        .category(Product.ProductCategory.OTHER)
                        .imageUrl("https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400")
                        .rating(new BigDecimal("4.8")).description("Virgin cold-pressed coconut oil from Kerala. Great for cooking and skincare.")
                        .farmerName("Tropical Farms").certified(true).build(),

                Product.builder().name("Organic Jaggery").price(new BigDecimal("90"))
                        .category(Product.ProductCategory.OTHER)
                        .imageUrl("https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400")
                        .rating(new BigDecimal("4.5")).description("Chemical-free sugarcane jaggery from Maharashtra. Natural sweetener packed with minerals.")
                        .farmerName("Sweet Fields").certified(true).build(),

                Product.builder().name("Cold-Pressed Mustard Oil").price(new BigDecimal("210"))
                        .category(Product.ProductCategory.OTHER)
                        .imageUrl("https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400")
                        .rating(new BigDecimal("4.7")).description("Strong and pungent cold-pressed mustard oil, extracted naturally.")
                        .farmerName("Golden Harvest").certified(true).build(),

                Product.builder().name("Organic Cumin Seeds").price(new BigDecimal("120"))
                        .category(Product.ProductCategory.OTHER)
                        .imageUrl("https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=400")
                        .rating(new BigDecimal("4.6")).description("Aromatic organic cumin seeds, hand-harvested and sun-dried.")
                        .farmerName("Spice Valley").certified(true).build()

        );

        productRepository.saveAll(seeds);
        log.info("✅ {} seed products created", seeds.size());
    }
}
