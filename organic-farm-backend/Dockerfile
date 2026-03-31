# ─────────────────────────────────────────────
# Stage 1: Build the application using Maven
# ─────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the pom.xml and download dependencies (caches them for faster future builds)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy the source code and build the .jar file
COPY src ./src
RUN mvn clean package -DskipTests

# ─────────────────────────────────────────────
# Stage 2: Create a lightweight runtime image
# ─────────────────────────────────────────────
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the generated .jar from the build stage
COPY --from=build /app/target/organic-farm-backend-1.0.0.jar app.jar

# Expose port 8080
EXPOSE 8080

# Command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
