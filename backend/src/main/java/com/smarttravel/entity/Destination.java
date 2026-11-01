package com.smarttravel.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "destinations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Destination {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 100)
    private String country;

    @Column(nullable = false, length = 50)
    private String continent;

    @Column(nullable = false, length = 255)
    private String image;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(name = "budget_level", length = 10)
    private String budgetLevel;

    @Column(name = "best_season", length = 100)
    private String bestSeason;

    @Column(length = 20)
    private String currency;

    @Column(name = "avg_daily_cost", precision = 10, scale = 2)
    private BigDecimal avgDailyCost;

    @Column(precision = 3, scale = 2)
    private BigDecimal rating;

    @Column(length = 20)
    private String status;
}
