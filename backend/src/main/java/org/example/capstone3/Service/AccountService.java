package org.example.capstone3.Service;

import lombok.RequiredArgsConstructor;
import org.example.capstone3.Model.Account;
import org.example.capstone3.Repository.AccountRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Authors: Baldano, Estrellado, & Tan
 * Version: 2026.02.12
 */
@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;

    // Helper method to generate the next formatted Account ID string (e.g., 0001, 0002)
    private String generateNextAccountId() {
        Account lastAccount = accountRepository.findTopByOrderByIdDesc();
        long nextId = (lastAccount != null) ? lastAccount.getId() + 1 : 1;
        return String.format("%04d", nextId);
    }

    // CREATE (Used by Admin Dashboard)
    public Account createAccount(Account account) {
        account.setAccountId(generateNextAccountId());
        // Default to CUSTOMER if no role is provided
        if (account.getRole() == null) {
            account.setRole("CUSTOMER");
        }
        return accountRepository.save(account);
    }

    // GET ALL
    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    // GET BY ID
    public Account getAccountById(Long id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account ID " + id + " not found"));
    }

    // UPDATE
    public Account updateAccount(Long id, Account updatedAccount) {
        Account account = getAccountById(id);

        // Only update fields if they are provided in the request
        if (updatedAccount.getUsername() != null) account.setUsername(updatedAccount.getUsername());
        if (updatedAccount.getPassword() != null) account.setPassword(updatedAccount.getPassword());
        if (updatedAccount.getRole() != null) account.setRole(updatedAccount.getRole());
        if (updatedAccount.getBalance() != null) account.setBalance(updatedAccount.getBalance());

        return accountRepository.save(account);
    }

    // DISABLE ACCOUNT (Soft Delete)
    public void disableAccount(Long id) {
        // Validation: Prevent the Admin (ID 1) from disabling themselves
        if (id == 1) {
            throw new RuntimeException("Security Violation: The primary Administrator account cannot be disabled.");
        }

        Account account = getAccountById(id);
        account.setRole("DISABLED");
        accountRepository.save(account);
    }

    // ENABLE ACCOUNT (Reactivate)
    public void enableAccount(Long id) {
        Account account = getAccountById(id);
        account.setRole("CUSTOMER");
        accountRepository.save(account);
    }

    // PHYSICAL DELETE
    public void deleteAccount(Long id) {
        if (!accountRepository.existsById(id)) {
            throw new RuntimeException("Cannot delete: Account does not exist");
        }
        accountRepository.deleteById(id);
    }

    // REGISTRATION (Standardized to 4-digit ID logic)
    public Account register(Account account) {
        // Validation: Unique Username
        if (accountRepository.findByUsername(account.getUsername()).isPresent()) {
            throw new RuntimeException("Username '" + account.getUsername() + "' is already taken");
        }

        account.setRole("CUSTOMER");
        // FIX: Replaced UUID logic with the formatted sequence logic
        account.setAccountId(generateNextAccountId());

        // Ensure balance is 0 for new registrations if not specified
        if (account.getBalance() == null) {
            account.setBalance(0.0);
        }

        return accountRepository.save(account);
    }

    // LOGIN
    public Account login(String username, String password) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        // Validation: Prevent login for disabled users
        if ("DISABLED".equalsIgnoreCase(account.getRole())) {
            throw new RuntimeException("This account has been disabled. Please contact support.");
        }

        if (!account.getPassword().equals(password)) {
            throw new RuntimeException("Invalid username or password");
        }

        return account;
    }
}