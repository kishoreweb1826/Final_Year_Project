# ── Stage 1: Build ──────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -Dspring-boot.build-info.skip=true

# ── Stage 2: Runtime ────────────────────────────
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

RUN groupadd -r appuser && useradd -r -g appuser appuser

COPY --from=build /app/target/organic-farm-backend-1.0.0.jar app.jar

RUN mkdir -p ./uploads/certificates && chown -R appuser:appuser /app

USER appuser

ENTRYPOINT ["java", \
  "-XX:MaxRAMPercentage=75.0", \
  "-XX:+UseG1GC", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
