package com.smarttravel.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, unique = true, length = 180)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false, length = 30)
    private String role; // USER, ADMIN, CO_PLANNER

    @Column(length = 255)
    private String avatar;

    @Column(length = 30)
    private String phone;

    @Column(length = 100)
    private String department;

    @Column(name = "member_since")
    private LocalDate memberSince;
}
