const form = document.getElementById('registerForm');
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

    if (username.length < 3) {
        message.textContent = 'Username must be at least 3 characters';
        return;
    }

    if (password.length < 4) {
        message.textContent = 'Password must be at least 4 characters';
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/accounts/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }) // role is defaulted in backend
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            message.textContent = errorData.message || 'Registration failed';
            return;
        }

        alert('Registration successful! Please login.');
        window.location.href = 'login.html';

    } catch (err) {
        console.error(err);
        message.textContent = 'Server error';
    }
});
