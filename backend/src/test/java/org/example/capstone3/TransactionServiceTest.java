package org.example.capstone3.Service;

import org.example.capstone3.Model.Account;
import org.example.capstone3.Model.Transaction;
import org.example.capstone3.Repository.AccountRepository;
import org.example.capstone3.Repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private TransactionService transactionService;

    private Account sourceAccount;
    private Account destinationAccount;

    @BeforeEach
    void setUp() {
        sourceAccount = new Account();
        sourceAccount.setId(1L);
        sourceAccount.setBalance(1000.0);

        destinationAccount = new Account();
        destinationAccount.setId(2L);
        destinationAccount.setBalance(500.0);
    }

    // ================= TRANSFER SUCCESS =================
    @Test
    void createTransaction_shouldTransferMoneySuccessfully() {

        Transaction transaction = new Transaction();
        transaction.setSourceAccount(sourceAccount);
        transaction.setDestinationAccount(destinationAccount);
        transaction.setTransfer_amount(200.0);

        when(accountRepository.findById(1L)).thenReturn(Optional.of(sourceAccount));
        when(accountRepository.findById(2L)).thenReturn(Optional.of(destinationAccount));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(transaction);

        Transaction result = transactionService.createTransaction(transaction);

        assertEquals(800.0, sourceAccount.getBalance());
        assertEquals(700.0, destinationAccount.getBalance());
        verify(accountRepository, times(1)).save(sourceAccount);
        verify(accountRepository, times(1)).save(destinationAccount);
    }

    // ================= TRANSFER INSUFFICIENT BALANCE =================
    @Test
    void createTransaction_shouldThrowException_whenInsufficientBalance() {

        Transaction transaction = new Transaction();
        transaction.setSourceAccount(sourceAccount);
        transaction.setDestinationAccount(destinationAccount);
        transaction.setTransfer_amount(2000.0);

        when(accountRepository.findById(1L)).thenReturn(Optional.of(sourceAccount));
        when(accountRepository.findById(2L)).thenReturn(Optional.of(destinationAccount));

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                transactionService.createTransaction(transaction));

        assertEquals("Insufficient balance", exception.getMessage());
    }

    // ================= DEPOSIT SUCCESS =================
    @Test
    void deposit_shouldIncreaseBalance() {

        when(accountRepository.findById(1L)).thenReturn(Optional.of(sourceAccount));
        when(transactionRepository.save(any(Transaction.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        transactionService.deposit(1L, 300.0);

        assertEquals(1300.0, sourceAccount.getBalance());
        verify(accountRepository).save(sourceAccount);
    }

    // ================= WITHDRAW SUCCESS =================
    @Test
    void withdraw_shouldDecreaseBalance() {

        when(accountRepository.findById(1L)).thenReturn(Optional.of(sourceAccount));
        when(transactionRepository.save(any(Transaction.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        transactionService.withdraw(1L, 400.0);

        assertEquals(600.0, sourceAccount.getBalance());
        verify(accountRepository).save(sourceAccount);
    }

    // ================= WITHDRAW INSUFFICIENT BALANCE =================
    @Test
    void withdraw_shouldThrowException_whenInsufficientBalance() {

        when(accountRepository.findById(1L)).thenReturn(Optional.of(sourceAccount));

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                transactionService.withdraw(1L, 2000.0));

        assertEquals("Insufficient balance", exception.getMessage());
    }
}
