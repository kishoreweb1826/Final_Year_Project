# 🌿 OrganicFarm Backend

Spring Boot REST API backend for the OrganicFarm React application.

## Tech Stack

- **Framework**: Spring Boot 3.2
- **Database**: PostgreSQL 14+
- **ORM**: Spring Data JPA / Hibernate
- **Security**: Spring Security + JWT (HS256)
- **Build**: Maven

## Quick Start

### 1. Create PostgreSQL Database
```sql
CREATE DATABASE organicfarm_db;
```

### 2. Configure Credentials
Edit `src/main/resources/application.properties`:
```properties
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD
```

### 3. Run
```bash
mvn spring-boot:run
```
Server starts at **http://localhost:8080**

### 4. Default Test Accounts (auto-seeded)
| Email | Password | Role |
|---|---|---|
| admin@organicfarm.com | Admin@123 | Admin |
| farmer@organicfarm.com | Farmer@123 | Farmer |
| customer@organicfarm.com | Customer@123 | Customer |

## API Endpoints

| Resource | Endpoint |
|---|---|
| Auth | `POST /api/auth/login`, `POST /api/auth/register` |
| Products | `GET/POST /api/products`, `PUT/DELETE /api/products/{id}` |
| Orders | `POST /api/orders`, `GET /api/orders` |
| Farmers | `POST /api/farmers/register` |
| Contact | `POST /api/contact` |
| AI Tools | `POST /api/ai-tools/crop-recommendation` etc. |

## AI Tools (Placeholder Ready)

The four AI endpoints currently use rule-based logic matching the existing frontend.
Each method in `AIToolService.java` has clear `// TODO` comments showing where to
plug in your real ML model (Python microservice, Hugging Face, OpenWeatherMap, etc.)

All usage is logged to `ai_tool_logs` table for future model training data.
