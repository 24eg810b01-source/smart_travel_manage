package com.smarttravel.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "expenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "trip_id", nullable = false, length = 36)
    private String tripId;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(length = 10)
    private String currency;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "paid_by", length = 120)
    private String paidBy;

    @Column(name = "receipt_ref", length = 50)
    private String receiptRef;

    @Column(length = 30)
    private String status; // PAID, PENDING, REIMBURSED, SPLIT

    @Column(columnDefinition = "TEXT")
    private String notes;
}
