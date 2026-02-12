package org.example.capstone3.Service;

import jakarta.transaction.Transactional;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.example.capstone3.Model.Account;
import org.example.capstone3.Model.Transaction;
import org.example.capstone3.Repository.AccountRepository;
import org.example.capstone3.Repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Data
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    @Transactional
    public Transaction createTransaction(Transaction transaction) {

        // Validate accounts
        if (transaction.getSourceAccount() == null || transaction.getDestinationAccount() == null) {
            throw new IllegalArgumentException("Source and destination accounts are required");
        }

        Account sourceAccount = accountRepository.findById(transaction.getSourceAccount().getId())
                .orElseThrow(() -> new RuntimeException("Source account not found"));

        Account destinationAccount = accountRepository.findById(transaction.getDestinationAccount().getId())
                .orElseThrow(() -> new RuntimeException("Destination account not found"));

        if (sourceAccount.getBalance() < transaction.getTransfer_amount()) {
            throw new RuntimeException("Insufficient balance");
        }

        // Update balances
        sourceAccount.setBalance(sourceAccount.getBalance() - transaction.getTransfer_amount());
        destinationAccount.setBalance(destinationAccount.getBalance() + transaction.getTransfer_amount());

        // Save accounts
        accountRepository.save(sourceAccount);
        accountRepository.save(destinationAccount);

        // Set transaction date
        transaction.setDate(LocalDate.now());

        return transactionRepository.save(transaction);
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }
}
