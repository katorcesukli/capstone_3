const BASE_URL = "http://localhost:8080/api";

const form = document.getElementById('registerForm');
const message = document.getElementById('message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        message.textContent = 'Username and password are required';
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message || 'Registration failed';
            return;
        }

        alert('Registration successful!');
        window.location.href = 'login.html';

    } catch (err) {
        message.textContent = 'Server error';
    }
});
