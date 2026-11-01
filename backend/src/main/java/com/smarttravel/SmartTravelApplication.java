package com.smarttravel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SmartTravelApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartTravelApplication.class, args);
        System.out.println(">>> Smart Travel Management System Spring Boot Backend is running on port 8080! <<<");
    }

}
