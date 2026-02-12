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

        // Table
        table.innerHTML += `
            <tr>
                <td>${acc.id}</td>
                <td>${acc.username}</td>
                <td>${acc.role}</td>
                <td>${acc.balance}</td>
            </tr>
        `;

        // Dropdowns
        sourceSelect.innerHTML += `
            <option value="${acc.id}">${acc.username}</option>
        `;

        destSelect.innerHTML += `
            <option value="${acc.id}">${acc.username}</option>
        `;
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

    const transaction = {
        transfer_amount: amount, // matches backend field
        sourceAccount: { id: sourceId },
        destinationAccount: { id: destinationId }
    };

    const response = await fetch(`${BASE_URL}/transactions`, {
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

        table.innerHTML += `
            <tr>
                <td>${tx.id}</td>
                <td>${tx.sourceAccount.username}</td>
                <td>${tx.destinationAccount.username}</td>
                <td>${tx.transfer_amount}</td>
                <td>${tx.date}</td>
            </tr>
        `;
    });
}

// Auto load on page open
window.onload = function () {
    loadAccounts();
    loadTransactions();
};
