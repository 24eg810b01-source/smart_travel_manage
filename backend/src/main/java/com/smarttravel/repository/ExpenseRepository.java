package com.smarttravel.repository;

import com.smarttravel.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, String> {
    List<Expense> findByTripId(String tripId);
    List<Expense> findByUserId(String userId);
    List<Expense> findByCategory(String category);
}
