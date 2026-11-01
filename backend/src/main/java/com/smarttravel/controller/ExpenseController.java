package com.smarttravel.controller;

import com.smarttravel.entity.Expense;
import com.smarttravel.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {

    @Autowired
    private ExpenseRepository expenseRepository;

    @GetMapping
    public List<Expense> getAllExpenses(
            @RequestParam(required = false) String tripId,
            @RequestParam(required = false) String category) {
        if (tripId != null && !tripId.isEmpty()) {
            return expenseRepository.findByTripId(tripId);
        }
        if (category != null && !category.isEmpty()) {
            return expenseRepository.findByCategory(category);
        }
        return expenseRepository.findAll();
    }

    @PostMapping
    public Expense createExpense(@RequestBody Expense expense) {
        return expenseRepository.save(expense);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable String id) {
        expenseRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
