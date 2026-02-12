const form = document.getElementById('loginForm');
const message = document.getElementById('message');
const BASE_URL = "http://localhost:8080/api";

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        message.textContent = 'Username and password are required';
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/accounts/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            message.textContent = errorData.message || 'Login failed';
            return;
        }

        const user = await response.json();

        // Save user in localStorage/sessionStorage
        localStorage.setItem('loggedUser', JSON.stringify(user));

        // Redirect based on role
        if (user.role.toLowerCase() === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'customer.html';
        }

    } catch (err) {
        console.error(err);
        message.textContent = 'Server error';
    }
});
