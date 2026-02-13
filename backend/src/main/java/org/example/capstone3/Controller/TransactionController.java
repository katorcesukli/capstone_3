package org.example.capstone3.Controller;

import lombok.RequiredArgsConstructor;
import org.example.capstone3.Model.Transaction;
import org.example.capstone3.Service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class TransactionController {

    private final TransactionService transactionService;


    // CREATE
    @PostMapping("/transfer")
    public ResponseEntity<?> createTransaction(@RequestBody Transaction transaction) {
        try {
            Transaction savedTransaction = transactionService.createTransaction(transaction);
            return ResponseEntity.ok(savedTransaction);
        } catch (RuntimeException e) {
            // Return proper error message instead of 500
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET ALL
    @GetMapping
    public List<Transaction> getAllTransactions() {
        return transactionService.getAllTransactions();
    }

    //deposit and withdraw block
    @PostMapping("/deposit")
    public ResponseEntity<?> deposit(
            @RequestParam Long accountId,
            @RequestParam Double amount) {

        try {
            Transaction transaction = transactionService.deposit(accountId, amount);
            return ResponseEntity.ok(transaction);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/withdraw")
    public ResponseEntity<?> withdraw(
            @RequestParam Long accountId,
            @RequestParam Double amount) {

        try {
            Transaction transaction = transactionService.withdraw(accountId, amount);
            return ResponseEntity.ok(transaction);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
