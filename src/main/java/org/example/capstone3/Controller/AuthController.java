package org.example.capstone3.Controller;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.example.capstone3.Model.Account;
import org.example.capstone3.Service.AccountService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequiredArgsConstructor
public class AuthController {

    private final AccountService accountService;

    @GetMapping("/")
    public String rootPage(){
        return "redirect:login.html";
    }

    // ================= LOGIN =================
    @GetMapping("/login")
    public String loginPage() {
        return "login";
    }

    @PostMapping("/login")
    public String login(@RequestParam String username,
                        @RequestParam String password,
                        HttpSession session,
                        Model model) {

        try {
            Account account = accountService.login(username, password);
            session.setAttribute("loggedUser", account);

            if (account.getRole().equalsIgnoreCase("ADMIN")) {
                return "redirect:/admin";
            } else {
                return "redirect:/customer";
            }

        } catch (RuntimeException e) {
            model.addAttribute("error", e.getMessage());
            return "login";
        }
    }

    // ================= REGISTER =================
    @GetMapping("/register")
    public String registerPage() {
        return "register";
    }

    @PostMapping("/register")
    public String register(@ModelAttribute Account account,
                           Model model) {

        try {
            accountService.register(account);
            return "redirect:/login";
        } catch (RuntimeException e) {
            model.addAttribute("error", e.getMessage());
            return "register";
        }
    }

    // ================= LOGOUT =================
    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/login";
    }

    // ================= CUSTOMER PAGE =================
    @GetMapping("/customer")
    public String customerPage(HttpSession session) {

        Account account = (Account) session.getAttribute("loggedUser");

        if (account == null ||
                !account.getRole().equalsIgnoreCase("CUSTOMER")) {
            return "redirect:/login";
        }

        return "customer";
    }
}
