# ============================================================
# Multi-Stage Dockerfile for Spring Boot Food Ordering Backend
# ============================================================

# Stage 1: Build the JAR
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copy POM and Maven settings
COPY pom.xml settings.xml ./
COPY .mvn ./.mvn

# Copy source code and build application JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal Production JRE Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root system user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create directory for image uploads
RUN mkdir -p /app/uploads/food-images && chown -R appuser:appgroup /app

# Copy JAR from builder stage
COPY --from=builder /app/target/food-ordering-backend-1.0.0.jar app.jar
RUN chown appuser:appgroup app.jar

USER appuser

EXPOSE 8080

ENV PORT=8080 \
    SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC -XX:+ExitOnOutOfMemoryError"

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
