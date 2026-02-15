/**
 * Customer Controller for Mini Banking System
 * Author: Baldano, Estrellado, & Tan
 * Version: 2026.02.12
 */

app.controller('CustomerController', function($scope, $http, $window) {
    // Configuration
    const BASE_URL = "http://localhost:8080/api";
    const sessionKey = "loggedUser";

    // Scope variables
    $scope.user = JSON.parse(localStorage.getItem(sessionKey));
    $scope.accounts = [];
    $scope.transactions = [];

    // ================= DATA MODELS (FIXED) =================
    // Separated these to prevent numbers appearing in both fields simultaneously
    $scope.transferData = { amount: 0, sourceId: null, destId: null };
    $scope.depositData = { amount: 0 };
    $scope.withdrawData = { amount: 0 };

    // ================= INIT & AUTH CHECK =================
    $scope.init = function() {
        if (!$scope.user) {
            $window.location.href = "login.html";
            return;
        }
        // Sync internal ID
        $scope.transferData.sourceId = $scope.user.id;
        $scope.loadAccounts();
        $scope.loadTransactions();
    };

    // ================= LOGOUT =================
    $scope.logout = function() {
        localStorage.removeItem(sessionKey);
        $window.location.href = "login.html";
    };

    // ================= LOAD ACCOUNTS =================
    $scope.loadAccounts = function() {
        $http.get(`${BASE_URL}/accounts`)
            .then(function(response) {
                // Filter out current user for the destination dropdown
                $scope.accounts = response.data.filter(acc => acc.id !== $scope.user.id);
            })
            .catch(function(err) {
                console.error("Failed to load accounts", err);
            });
    };

    // ================= DEPOSIT =================
    $scope.depositMoney = function() {
        if (!$scope.depositData.amount || $scope.depositData.amount <= 0) {
            alert("Please enter a valid amount to deposit.");
            return;
        }

        $http.post(`${BASE_URL}/transactions/deposit?accountId=${$scope.user.id}&amount=${$scope.depositData.amount}`)
            .then(function(response) {
                alert("Deposit successful!");
                $scope.depositData.amount = 0; // Clear specific deposit input
                $scope.updateDashboard();
                $scope.loadTransactions();
            })
            .catch(function(err) {
                alert("Deposit failed: " + (err.data || "Server Error"));
            });
    };

    // ================= WITHDRAW =================
    $scope.withdrawMoney = function() {
        if (!$scope.withdrawData.amount || $scope.withdrawData.amount <= 0) {
            alert("Please enter a valid amount to withdraw.");
            return;
        }

        if ($scope.withdrawData.amount > $scope.user.balance) {
            alert("Insufficient funds! Your current balance is ₱" + $scope.user.balance);
            return;
        }

        $http.post(`${BASE_URL}/transactions/withdraw?accountId=${$scope.user.id}&amount=${$scope.withdrawData.amount}`)
            .then(function(response) {
                alert("Withdrawal successful!");
                $scope.withdrawData.amount = 0; // Clear specific withdraw input
                $scope.updateDashboard();
                $scope.loadTransactions();
            })
            .catch(function(err) {
                alert("Withdrawal failed: " + (err.data || "Server Error"));
            });
    };

    // ================= TRANSFER MONEY =================
    $scope.transferMoney = function() {
        if (!$scope.transferData.amount || $scope.transferData.amount <= 0) {
            alert("Enter a valid amount to transfer.");
            return;
        }

        if (!$scope.transferData.destId) {
            alert("Please select a recipient account.");
            return;
        }

        const transaction = {
            transfer_amount: $scope.transferData.amount,
            sourceAccount: { id: $scope.user.id },
            destinationAccount: { id: $scope.transferData.destId }
        };

        $http.post(`${BASE_URL}/transactions/transfer`, transaction)
            .then(function(response) {
                alert("Transfer successful!");
                $scope.transferData.amount = 0;
                $scope.transferData.destId = null;
                $scope.updateDashboard();
                $scope.loadTransactions();
            })
            .catch(function(err) {
                alert("Transfer failed: " + (err.data || "Check your balance or recipient ID"));
            });
    };

    // ================= UPDATE DASHBOARD BALANCE =================
    $scope.updateDashboard = function() {
        $http.get(`${BASE_URL}/accounts/${$scope.user.id}`)
            .then(function(response) {
                $scope.user = response.data;
                localStorage.setItem(sessionKey, JSON.stringify($scope.user));
            });
    };

    // ================= LOAD TRANSACTIONS =================
    $scope.loadTransactions = function() {
        $http.get(`${BASE_URL}/transactions`)
            .then(function(response) {
                $scope.transactions = response.data.filter(tx => {
                    let isSource = tx.sourceAccount && tx.sourceAccount.id === $scope.user.id;
                    let isDest = tx.destinationAccount && tx.destinationAccount.id === $scope.user.id;
                    return isSource || isDest;
                });
            })
            .catch(function(err) {
                console.error("Failed to load transactions", err);
            });
    };

    $scope.init();
});