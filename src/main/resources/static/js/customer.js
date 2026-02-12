const BASE_URL = "/api";
const sessionKey = "loggedUser"; // same key we used in login.js

// ================= INIT PAGE =================
window.onload = async function() {
    const user = JSON.parse(localStorage.getItem(sessionKey));
    if (!user) {
        window.location.href = "login.html"; // redirect if not logged in
        return;
    }

    document.getElementById("username").textContent = user.username;
    document.getElementById("balance").textContent = user.balance;

    await loadAccounts();
    await loadTransactions();
};

// ================= LOGOUT =================
function logout() {
    localStorage.removeItem(sessionKey);
    window.location.href = "login.html";
}

// ================= LOAD ACCOUNTS =================
async function loadAccounts() {
    try {
        const response = await fetch(`${BASE_URL}/accounts`);
        const accounts = await response.json();

        const sourceSelect = document.getElementById("sourceAccount");
        const destSelect = document.getElementById("destinationAccount");

        sourceSelect.innerHTML = "";
        destSelect.innerHTML = "";

        const user = JSON.parse(localStorage.getItem(sessionKey));

        // Populate dropdowns
        accounts.forEach(acc => {
            // Only allow source dropdown to select **logged-in user**
            if (acc.username === user.username) {
                sourceSelect.innerHTML += `<option value="${acc.id}">${acc.username} (Balance: ₱${acc.balance})</option>`;
            }
            // Destination dropdown should include all other accounts
            if (acc.username !== user.username) {
                destSelect.innerHTML += `<option value="${acc.id}">${acc.username}</option>`;
            }
        });

    } catch (err) {
        console.error(err);
        alert("Failed to load accounts");
    }
}

// ================= TRANSFER MONEY =================
async function transferMoney() {
    const sourceId = document.getElementById("sourceAccount").value;
    const destId = document.getElementById("destinationAccount").value;
    const amount = parseFloat(document.getElementById("amount").value);

    if (!amount || amount <= 0) {
        alert("Enter a valid amount");
        return;
    }

    if (sourceId === destId) {
        alert("Cannot transfer to same account");
        return;
    }

    const transaction = {
        transferAmount: amount,
        sourceAccount: { id: sourceId },
        destinationAccount: { id: destId }
    };

    try {
        const response = await fetch(`${BASE_URL}/transactions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(transaction)
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            alert(data.message || "Transfer failed");
            return;
        }

        alert("Transfer successful!");
        // Reload accounts and transactions
        await loadAccounts();
        await loadTransactions();

        // Update user balance in dashboard
        const updatedUser = await fetch(`${BASE_URL}/accounts/${sourceId}`).then(r => r.json());
        localStorage.setItem(sessionKey, JSON.stringify(updatedUser));
        document.getElementById("balance").textContent = updatedUser.balance;

    } catch (err) {
        console.error(err);
        alert("Server error during transfer");
    }
}

// ================= LOAD TRANSACTIONS =================
async function loadTransactions() {
    try {
        const response = await fetch(`${BASE_URL}/transactions`);
        const transactions = await response.json();

        const table = document.getElementById("transactionTable");
        table.innerHTML = "";

        const user = JSON.parse(localStorage.getItem(sessionKey));

        // Only show transactions where logged-in user is involved
        transactions.forEach(tx => {
            if (tx.sourceAccount.username === user.username || tx.destinationAccount.username === user.username) {
                table.innerHTML += `
                    <tr>
                        <td>${tx.id}</td>
                        <td>${tx.sourceAccount.username}</td>
                        <td>${tx.destinationAccount.username}</td>
                        <td>${tx.transferAmount}</td>
                        <td>${tx.date}</td>
                    </tr>
                `;
            }
        });
    } catch (err) {
        console.error(err);
        alert("Failed to load transactions");
    }
}
