package com.smarttravel.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "trip_id", nullable = false, length = 36)
    private String tripId;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Column(nullable = false, length = 30)
    private String type; // FLIGHT, HOTEL, TRAIN, ACTIVITY, CAR_RENTAL

    @Column(nullable = false, length = 150)
    private String provider;

    @Column(name = "confirmation_code", nullable = false, length = 50)
    private String confirmationCode;

    @Column(name = "reference_no", nullable = false, length = 50)
    private String referenceNo;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "start_date_time", nullable = false)
    private LocalDateTime startDateTime;

    @Column(name = "end_date_time", nullable = false)
    private LocalDateTime endDateTime;

    @Column(precision = 10, scale = 2)
    private BigDecimal cost;

    @Column(length = 10)
    private String currency;

    @Column(nullable = false, length = 30)
    private String status; // PENDING, CONFIRMED, IN_TRANSIT, COMPLETED, CANCELLED

    @Column(name = "seat_or_room", length = 50)
    private String seatOrRoom;

    @Column(name = "terminal_gate", length = 50)
    private String terminalGate;
}
