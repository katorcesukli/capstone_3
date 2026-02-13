const BASE_URL = "http://localhost:8080/api";
const sessionKey = "loggedUser";

document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
            credentials: "include"
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Login failed");
            return;
        }

        // Save user locally
        localStorage.setItem(sessionKey, JSON.stringify(data));

        // Redirect based on role
        if (data.role === "admin") {
        window.location.href = "admin.html";
         }  else if (data.role === "customer") {
        window.location.href = "customer.html";
        } else {
        alert("Unknown role");
        }

    } catch (error) {
        alert("Server error");
    }
});
