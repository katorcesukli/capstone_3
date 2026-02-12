package org.example.capstone3.Service;

import lombok.RequiredArgsConstructor;
import org.example.capstone3.Model.Transaction;
import org.example.capstone3.Repository.TransactionRepository;
import org.example.capstone3.Service.AccountService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountService accountService;

    // CREATE TRANSACTION (with balance update)
    public Transaction createTransaction(Transaction transaction) {

        var sourceAccount = transaction.getSourceAccount();
        var destinationAccount = transaction.getDestinationAccount();

        // Load full account details
        sourceAccount = accountService.getAccountById(sourceAccount.getId());
        destinationAccount = accountService.getAccountById(destinationAccount.getId());

        if (sourceAccount.getBalance() < transaction.getTransferAmount()) {
            throw new RuntimeException("Insufficient balance");
        }

        // Deduct
        sourceAccount.setBalance(
                sourceAccount.getBalance() - transaction.getTransferAmount()
        );

        // Add
        destinationAccount.setBalance(
                destinationAccount.getBalance() + transaction.getTransferAmount()
        );

        accountService.updateAccount(sourceAccount.getId(), sourceAccount);
        accountService.updateAccount(destinationAccount.getId(), destinationAccount);

        transaction.setDate(LocalDate.now());
        transaction.setSourceAccount(sourceAccount);
        transaction.setDestinationAccount(destinationAccount);

        return transactionRepository.save(transaction);
    }

    // GET ALL
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }
}
