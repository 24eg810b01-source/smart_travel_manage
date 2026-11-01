package com.smarttravel.repository;

import com.smarttravel.entity.Destination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DestinationRepository extends JpaRepository<Destination, String> {
    List<Destination> findByContinent(String continent);
    List<Destination> findByCategory(String category);
    List<Destination> findByStatus(String status);
}
