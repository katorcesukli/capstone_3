package org.example.capstone3.Service;

import lombok.RequiredArgsConstructor;
import org.example.capstone3.Model.Account;
import org.example.capstone3.Repository.AccountRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;

    // CREATE
    public Account createAccount(Account account) {
        // Simple logic to generate the next 4-digit ID string based on the primary key
        Account lastAccount = accountRepository.findTopByOrderByIdDesc();
        long nextId = (lastAccount != null) ? lastAccount.getId() + 1 : 1;
        account.setAccountId(String.format("%04d", nextId));

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

        account.setUsername(updatedAccount.getUsername());
        account.setPassword(updatedAccount.getPassword());
        account.setRole(updatedAccount.getRole());
        account.setBalance(updatedAccount.getBalance());

        return accountRepository.save(account);
    }

    // DISABLE ACCOUNT (Soft Delete)
    public void disableAccount(Long id) {
        Account account = getAccountById(id);
        // Prevent disabling the main admin (assuming ID 1 is Admin)
        if (id == 1) throw new RuntimeException("Cannot disable primary administrator");

        account.setRole("DISABLED");
        // Optional: Sanitize sensitive data if needed
        // account.setPassword("SUSPENDED-" + UUID.randomUUID().toString().substring(0,8));
        accountRepository.save(account);
    }

    // ENABLE ACCOUNT (Reactivate)
    public void enableAccount(Long id) {
        Account account = getAccountById(id);
        account.setRole("CUSTOMER"); // Or restore to CUSTOMER
        accountRepository.save(account);
    }

    // PHYSICAL DELETE
    public void deleteAccount(Long id) {
        if (!accountRepository.existsById(id)) {
            throw new RuntimeException("Cannot delete: Account does not exist");
        }
        accountRepository.deleteById(id);
    }

    // REGISTRATION
    public Account register(Account account) {
        if (accountRepository.findByUsername(account.getUsername()).isPresent()) {
            throw new RuntimeException("Username '" + account.getUsername() + "' is already taken");
        }

        account.setRole("CUSTOMER"); // Standard role name for frontend consistency
        account.setAccountId(UUID.randomUUID().toString().substring(0, 8));
        account.setBalance(0.0);

        return accountRepository.save(account);
    }

    // LOGIN
    public Account login(String username, String password) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if ("DISABLED".equalsIgnoreCase(account.getRole())) {
            throw new RuntimeException("This account has been disabled. Please contact support.");
        }

        if (!account.getPassword().equals(password)) {
            throw new RuntimeException("Invalid username or password");
        }

        return account;
    }
}