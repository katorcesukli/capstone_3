package org.example.capstone3.Service;

import lombok.RequiredArgsConstructor;
import org.example.capstone3.Model.Account;
import org.example.capstone3.Repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountService {

    @Autowired //changed to autowired for automatic bean creation #rian
    private final AccountRepository accountRepository;

    // CREATE
    public Account createAccount(Account account) {

        Account lastAccount = accountRepository.findTopByOrderByIdDesc();

        // next number (1 if DB empty)
        long nextId = (lastAccount != null) ? lastAccount.getId() + 1 : 1;

        //create and format employeeId as 4 digits
        account.setAccountId(String.format("%04d", nextId));

        // save to DB
        return accountRepository.save(account);
    }

    // GET ALL
    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    // GET BY ID
    public Account getAccountById(Long id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));
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

    // DELETE
    public void deleteAccount(Long id) {
        accountRepository.deleteById(id);
    }


//Register and login.html methods
public Account register(Account account) {

    // Check if username already exists
    if (accountRepository.findByUsername(account.getUsername()).isPresent()) {
        throw new RuntimeException("Username already exists");
    }

    // Default role
    account.setRole("customer");

    // Generate accountId
    account.setAccountId(UUID.randomUUID().toString());

    // Default balance
    account.setBalance(0.0);

    return accountRepository.save(account);
}

    public Account login(String username, String password) {

        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!account.getPassword().equals(password)) {
            throw new RuntimeException("Invalid password");
        }

        return account;
    }
}
