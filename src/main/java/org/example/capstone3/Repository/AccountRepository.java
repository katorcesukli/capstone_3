package org.example.capstone3.Repository;

import org.example.capstone3.Model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {

    Account findTopByOrderByIdDesc();

    Optional<Account> findByUsername(String username);

    Optional<Account> findByAccountId(Integer accountId);
}
