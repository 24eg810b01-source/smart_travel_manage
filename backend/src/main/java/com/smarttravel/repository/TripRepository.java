package com.smarttravel.repository;

import com.smarttravel.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, String> {
    List<Trip> findByUserId(String userId);
    Optional<Trip> findByShareCode(String shareCode);
}
