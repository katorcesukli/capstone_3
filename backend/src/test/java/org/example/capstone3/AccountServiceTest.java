package org.example.capstone3.Service;

import org.example.capstone3.Model.Account;
import org.example.capstone3.Repository.AccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private AccountService accountService;

    private Account account1;
    private Account account2;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        account1 = new Account();
        account1.setId(1L);
        account1.setUsername("user1");
        account1.setPassword("pass1");
        account1.setRole("CUSTOMER");
        account1.setBalance(100.0);
        account1.setAccountId("0001");

        account2 = new Account();
        account2.setId(2L);
        account2.setUsername("user2");
        account2.setPassword("pass2");
        account2.setRole("CUSTOMER");
        account2.setBalance(200.0);
        account2.setAccountId("0002");
    }


    @Test
    void testGetAllAccounts() {
        when(accountRepository.findAll()).thenReturn(Arrays.asList(account1, account2));
        List<Account> accounts = accountService.getAllAccounts();

        assertEquals(2, accounts.size());
    }

    @Test
    void testGetAccountByIdFound() {
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account1));

        Account found = accountService.getAccountById(1L);
        assertEquals("user1", found.getUsername());
    }

    @Test
    void testGetAccountByIdNotFound() {
        when(accountRepository.findById(3L)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class, () -> accountService.getAccountById(3L));
        assertEquals("Account ID 3 not found", ex.getMessage());
    }

    @Test
    void testUpdateAccount() {
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account1));
        when(accountRepository.save(any(Account.class))).thenReturn(account1);

        Account updates = new Account();
        updates.setUsername("updatedUser");
        updates.setBalance(500.0);

        Account updated = accountService.updateAccount(1L, updates);

        assertEquals("updatedUser", updated.getUsername());
        assertEquals(500.0, updated.getBalance());
    }

    @Test
    void testDisableAccount() {
        when(accountRepository.findById(2L)).thenReturn(Optional.of(account2));

        accountService.disableAccount(2L);

        ArgumentCaptor<Account> captor = ArgumentCaptor.forClass(Account.class);
        verify(accountRepository).save(captor.capture());

        assertEquals("DISABLED", captor.getValue().getRole());
    }

    @Test
    void testDisableAccountAdminThrows() {
        RuntimeException ex = assertThrows(RuntimeException.class, () -> accountService.disableAccount(1L));
        assertEquals("Security Violation: The primary Administrator account cannot be disabled.", ex.getMessage());
    }

    @Test
    void testLoginSuccess() {
        when(accountRepository.findByUsername("user1")).thenReturn(Optional.of(account1));
        Account loggedIn = accountService.login("user1", "pass1");
        assertEquals("user1", loggedIn.getUsername());
    }

    @Test
    void testLoginWrongPassword() {
        when(accountRepository.findByUsername("user1")).thenReturn(Optional.of(account1));
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> accountService.login("user1", "wrong"));
        assertEquals("Invalid username or password", ex.getMessage());
    }

    @Test
    void testLoginDisabledUser() {
        account1.setRole("DISABLED");
        when(accountRepository.findByUsername("user1")).thenReturn(Optional.of(account1));
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> accountService.login("user1", "pass1"));
        assertEquals("This account has been disabled. Please contact support.", ex.getMessage());
    }

    @Test
    void testEnableAccount() {
        account2.setRole("DISABLED");
        when(accountRepository.findById(2L)).thenReturn(Optional.of(account2));

        accountService.enableAccount(2L);

        ArgumentCaptor<Account> captor = ArgumentCaptor.forClass(Account.class);
        verify(accountRepository).save(captor.capture());

        assertEquals("CUSTOMER", captor.getValue().getRole());
    }

    @Test
    void testDeleteAccountSuccess() {
        when(accountRepository.existsById(2L)).thenReturn(true);
        doNothing().when(accountRepository).deleteById(2L);

        assertDoesNotThrow(() -> accountService.deleteAccount(2L));
        verify(accountRepository, times(1)).deleteById(2L);
    }

    @Test
    void testDeleteAccountNotFound() {
        when(accountRepository.existsById(3L)).thenReturn(false);
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> accountService.deleteAccount(3L));
        assertEquals("Cannot delete: Account does not exist", ex.getMessage());
    }

    @Test
    void testRegisterSuccess() {
        when(accountRepository.findByUsername("newuser")).thenReturn(Optional.empty());
        when(accountRepository.findTopByOrderByIdDesc()).thenReturn(account2);

        Account newAccount = new Account();
        newAccount.setUsername("newuser");
        newAccount.setPassword("newpass");

        when(accountRepository.save(any(Account.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Account registered = accountService.register(newAccount);

        assertEquals("0003", registered.getAccountId());
        assertEquals("CUSTOMER", registered.getRole());
        assertEquals(0.0, registered.getBalance());
    }

    @Test
    void testRegisterUsernameTaken() {
        when(accountRepository.findByUsername("user1")).thenReturn(Optional.of(account1));

        Account duplicate = new Account();
        duplicate.setUsername("user1");
        duplicate.setPassword("whatever");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> accountService.register(duplicate));

        assertEquals("Username 'user1' is already taken", ex.getMessage());
    }

}
