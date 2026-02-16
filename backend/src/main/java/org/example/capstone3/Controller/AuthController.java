package org.example.capstone3.Controller;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.example.capstone3.Model.Account;
import org.example.capstone3.Service.AccountService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"}, allowCredentials = "true")
public class AuthController {

    private final AccountService accountService;

    // ================= REGISTER =================
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Account account) {
        try {
            Account created = accountService.register(account);
            return ResponseEntity.ok(Map.of(
                    "username", created.getUsername(),
                    "role", created.getRole()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData,
                                   HttpSession session) {
        try {
            String username = loginData.get("username");
            String password = loginData.get("password");

            Account account = accountService.login(username, password);
            session.setAttribute("loggedUser", account);

            // Return role info to frontend for redirect
            return ResponseEntity.ok(Map.of(
                    "username", account.getUsername(),
                    "role", account.getRole() // "ADMIN" or "CUSTOMER"
            ));

        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // ================= LOGOUT =================
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }

    // ================= CHECK SESSION =================
    @GetMapping("/me")
    public ResponseEntity<?> currentUser(HttpSession session) {
        Account account = (Account) session.getAttribute("loggedUser");

        if (account == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Not logged in"));
        }

        return ResponseEntity.ok(Map.of(
                "username", account.getUsername(),
                "role", account.getRole()
        ));
    }
}
