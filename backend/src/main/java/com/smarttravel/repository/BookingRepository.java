package com.smarttravel.repository;

import com.smarttravel.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByTripId(String tripId);
    List<Booking> findByUserId(String userId);
    List<Booking> findByStatus(String status);
}
