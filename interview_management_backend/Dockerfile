FROM openjdk:17-jdk-alpine
LABEL authors="nguye"
ARG JAR_FILE=target/*.jar
COPY ./target/InterviewManagement.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]