const BASE_URL = "http://localhost:8080/api";

// ================= CREATE ACCOUNT =================
async function createAccount() {

    const account = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value,
        role: document.getElementById("role").value,
        balance: parseFloat(document.getElementById("balance").value)
    };

    await fetch(`${BASE_URL}/accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(account)
    });

    alert("Account created!");
    loadAccounts();
}

// ================= LOAD ACCOUNTS =================
async function loadAccounts() {

    const response = await fetch(`${BASE_URL}/accounts`);
    const accounts = await response.json();

    const table = document.getElementById("accountTable");
    table.innerHTML = "";

    const sourceSelect = document.getElementById("sourceAccount");
    const destSelect = document.getElementById("destinationAccount");

    sourceSelect.innerHTML = "";
    destSelect.innerHTML = "";

    accounts.forEach(acc => {
        table.innerHTML += `
            <tr>
                <td>${acc.id}</td>
                <td>${acc.username}</td>
                <td>${acc.role}</td>
                <td>${acc.balance}</td>
                <td>
                    <button onclick="updateAccount(${acc.id})">Edit</button>
                    <button onclick="deleteAccount(${acc.id})">Delete</button>
                </td>
            </tr>
        `;

        sourceSelect.innerHTML += `<option value="${acc.id}">${acc.username}</option>`;
        destSelect.innerHTML += `<option value="${acc.id}">${acc.username}</option>`;
    });
}

// ================= TRANSFER =================
async function transferMoney() {

    const sourceId = parseInt(document.getElementById("sourceAccount").value);
    const destinationId = parseInt(document.getElementById("destinationAccount").value);
    const amount = parseFloat(document.getElementById("amount").value);

    if (sourceId === destinationId) {
        alert("Cannot transfer to same account!");
        return;
    }
    if (!amount || amount <= 0) {
        alert("Enter valid amount");
        return;
    }

    const transaction = {
        transfer_amount: amount, // matches backend field
        sourceAccount: { id: sourceId },
        destinationAccount: { id: destinationId }
    };

    const response = await fetch(`${BASE_URL}/transactions/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction)
    });

    if (!response.ok) {
        const errorText = await response.text();
        alert("Transfer failed: " + errorText);
        return;
    }

    alert("Transfer successful!");
    await loadAccounts();
    await loadTransactions();
}

// ================= LOAD TRANSACTIONS =================
async function loadTransactions() {

    const response = await fetch(`${BASE_URL}/transactions`);
    const transactions = await response.json();

    const table = document.getElementById("transactionTable");
    table.innerHTML = "";

    transactions.forEach(tx => {

        const sourceUser = tx.sourceAccount ? tx.sourceAccount.username : "-";
        const destUser = tx.destinationAccount ? tx.destinationAccount.username : "-";

        table.innerHTML += `
            <tr>
                <td>${tx.id}</td>
                <td>${sourceUser}</td>
                <td>${destUser}</td>
                <td>${tx.transfer_amount}</td>
                <td>${tx.date}</td>
            </tr>
        `;
    });
}

// ================= UPDATE ACCOUNT =================
async function updateAccount(id) {
    const newUsername = prompt("Enter new username:");
    if (!newUsername) return;

    const newPassword = prompt("Enter new password:");
    if (!newPassword) return;

    const newRole = prompt("Enter role:");
    if (!newRole) return;

    const newBalance = parseFloat(prompt("Enter balance:"));
    if (isNaN(newBalance)) return;

    const updatedAccount = {
        username: newUsername,
        password: newPassword,
        role: newRole,
        balance: newBalance
    };

    const response = await fetch(`${BASE_URL}/accounts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedAccount)
    });

    if (!response.ok) {
        alert("Update failed");
        return;
    }

    alert("Account updated!");
    loadAccounts();
}

// ================= DELETE ACCOUNT =================
async function deleteAccount(id) {
    if (!confirm("Are you sure you want to delete this account?")) return;

    // Soft delete: backend will sanitize account
    const response = await fetch(`${BASE_URL}/accounts/disable/${id}`, {
        method: "PUT"
    });

    if (!response.ok) {
        const errorText = await response.text();
        alert("Delete failed: " + errorText);
        return;
    }

    alert("Account deleted (sanitized)!");
    loadAccounts();
}



// Auto load on page open
window.onload = function () {
    loadAccounts();
    loadTransactions();
};
