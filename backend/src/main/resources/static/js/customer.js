const BASE_URL = "/api";
const sessionKey = "loggedUser";

// ================= INIT PAGE =================
window.onload = async function () {
    const user = JSON.parse(localStorage.getItem(sessionKey));
    if (!user) {
        window.location.href = "login.html";
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

    const response = await fetch(`${BASE_URL}/accounts`);
    const accounts = await response.json();

    const user = JSON.parse(localStorage.getItem(sessionKey));

    const sourceSelect = document.getElementById("sourceAccount");
    const destSelect = document.getElementById("destinationAccount");
    const depositSelect = document.getElementById("depositAccount");
    const withdrawSelect = document.getElementById("withdrawAccount");

    sourceSelect.innerHTML = "";
    destSelect.innerHTML = "";
    depositSelect.innerHTML = "";
    withdrawSelect.innerHTML = "";

    accounts.forEach(acc => {

        // Source = logged in user only
        if (acc.username === user.username) {
            sourceSelect.innerHTML += `
                <option value="${acc.id}">
                    ${acc.username} (₱${acc.balance})
                </option>`;

            depositSelect.innerHTML += `
                <option value="${acc.id}">
                    ${acc.username}
                </option>`;

            withdrawSelect.innerHTML += `
                <option value="${acc.id}">
                    ${acc.username}
                </option>`;
        }

        // Destination = everyone except self
        if (acc.username !== user.username) {
            destSelect.innerHTML += `
                <option value="${acc.id}">
                    ${acc.username}
                </option>`;
        }
    });
}

// ================= TRANSFER =================
async function transferMoney() {

    const sourceId = parseInt(document.getElementById("sourceAccount").value);
    const destId = parseInt(document.getElementById("destinationAccount").value);
    const amount = parseFloat(document.getElementById("amount").value);

    if (!amount || amount <= 0) {
        alert("Enter valid amount");
        return;
    }

    if (sourceId === destId) {
        alert("Cannot transfer to same account");
        return;
    }

    const transaction = {
        transfer_amount: amount, // FIXED FIELD NAME
        sourceAccount: { id: sourceId },
        destinationAccount: { id: destId }
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
    await refreshUser(sourceId);
}

// ================= DEPOSIT =================
async function depositMoney() {

    const accountId = parseInt(document.getElementById("depositAccount").value);
    const amount = parseFloat(document.getElementById("depositAmount").value);

    if (!amount || amount <= 0) {
        alert("Enter valid amount");
        return;
    }

    const response = await fetch(
        `${BASE_URL}/transactions/deposit?accountId=${accountId}&amount=${amount}`,
        { method: "POST" }
    );

    if (!response.ok) {
        const errorText = await response.text();
        alert("Deposit failed: " + errorText);
        return;
    }

    alert("Deposit successful!");
    await refreshUser(accountId);
}

// ================= WITHDRAW =================
async function withdrawMoney() {

    const accountId = parseInt(document.getElementById("withdrawAccount").value);
    const amount = parseFloat(document.getElementById("withdrawAmount").value);

    if (!amount || amount <= 0) {
        alert("Enter valid amount");
        return;
    }

    const response = await fetch(
        `${BASE_URL}/transactions/withdraw?accountId=${accountId}&amount=${amount}`,
        { method: "POST" }
    );

    if (!response.ok) {
        const errorText = await response.text();
        alert("Withdraw failed: " + errorText);
        return;
    }

    alert("Withdraw successful!");
    await refreshUser(accountId);
}

// ================= REFRESH USER DATA =================
async function refreshUser(accountId) {

    const updatedUser = await fetch(`${BASE_URL}/accounts/${accountId}`)
        .then(r => r.json());

    localStorage.setItem(sessionKey, JSON.stringify(updatedUser));

    document.getElementById("balance").textContent = updatedUser.balance;

    await loadAccounts();
    await loadTransactions();
}

// ================= LOAD TRANSACTIONS =================
async function loadTransactions() {

    const response = await fetch(`${BASE_URL}/transactions`);
    const transactions = await response.json();

    const table = document.getElementById("transactionTable");
    table.innerHTML = "";

    const user = JSON.parse(localStorage.getItem(sessionKey));

    transactions.forEach(tx => {

        const sourceUser = tx.sourceAccount ? tx.sourceAccount.username : "-";
        const destUser = tx.destinationAccount ? tx.destinationAccount.username : "-";

        // Only show if user involved
        if (
            (tx.sourceAccount && tx.sourceAccount.username === user.username) ||
            (tx.destinationAccount && tx.destinationAccount.username === user.username)
        ) {
            table.innerHTML += `
                <tr>
                    <td>${tx.id}</td>
                    <td>${sourceUser}</td>
                    <td>${destUser}</td>
                    <td>${tx.transfer_amount}</td>
                    <td>${tx.date}</td>
                </tr>`;
        }
    });
}
