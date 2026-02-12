package org.example.capstone3.Service;

import lombok.RequiredArgsConstructor;
import org.example.capstone3.Model.Transaction;
import org.example.capstone3.Repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    @Autowired
    private final TransactionRepository transactionRepository;
    @Autowired
    private final AccountService accountService;

    // CREATE TRANSACTION (with balance update)
    public Transaction createTransaction(Transaction transaction) {

        var sourceAccount = accountService
                .getAllAccounts()
                .stream()
                .filter(acc -> acc.getUsername().equals(transaction.getSource_account()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Source account not found"));

        var destinationAccount = accountService
                .getAllAccounts()
                .stream()
                .filter(acc -> acc.getUsername().equals(transaction.getDestination_account()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Destination account not found"));

        if (sourceAccount.getBalance() < transaction.getTransfer_amount()) {
            throw new RuntimeException("Insufficient balance");
        }

        // Deduct
        sourceAccount.setBalance(
                sourceAccount.getBalance() - transaction.getTransfer_amount()
        );

        // Add
        destinationAccount.setBalance(
                destinationAccount.getBalance() + transaction.getTransfer_amount()
        );

        accountService.createAccount(sourceAccount);
        accountService.createAccount(destinationAccount);

        transaction.setDate(LocalDate.now());

        return transactionRepository.save(transaction);
    }

    // GET ALL
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }
}
