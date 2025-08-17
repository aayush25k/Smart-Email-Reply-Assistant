# ---------- Build Stage ----------
# Use Maven with JDK 21 to build the app
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml and download dependencies first (better caching)
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn
RUN ./mvnw -B dependency:go-offline

# Copy source and build the Spring Boot jar
COPY src ./src
RUN ./mvnw -B clean package -DskipTests

# ---------- Run Stage ----------
# Use a lightweight JRE 21 image to run the app
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Render assigns a dynamic port via $PORT (default 10000)
EXPOSE 10000

# Run the Spring Boot app, binding to $PORT
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-10000} -Dserver.address=0.0.0.0 -jar /app/app.jar"]
