# ===========================
# Build Stage
# ===========================
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml and download dependencies (for caching)
COPY pom.xml .
RUN mvn -B dependency:go-offline

# Copy the entire project source
COPY src ./src

# Package the application (skip tests for faster build)
RUN mvn clean package -DskipTests

# ===========================
# Runtime Stage
# ===========================
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
