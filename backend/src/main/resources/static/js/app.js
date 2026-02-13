/**
 * Main AngularJS Module for Mini Banking System
 * Author: Baldano, Estrellado, & Tan
 * Version: 2026.02.12
 */

var app = angular.module('miniBankingApp', []);

// Global Configuration - Ensure port matches your Spring Boot server.port
app.constant('BASE_URL', 'http://localhost:8082/api');

app.controller('BankingController', function($scope, $http, BASE_URL) {
    
    // Model Initialization
    $scope.accounts = [];
    $scope.transactions = [];
    $scope.newAccount = { username: '', password: '', role: 'USER', balance: 0 };
    $scope.transferData = {};
    $scope.actionData = { accountId: null, amount: 0 }; // For Deposit/Withdraw
    $scope.errorMessage = "";

    // ================= AUTH & SESSION =================
    $scope.adminLogout = function() {
        // Clear session data
        localStorage.removeItem('loggedUser');
        // Redirect to login
        window.location.href = 'login.html';
    };

    // ================= LOAD DATA =================
    $scope.loadAccounts = function() {
        $http.get(BASE_URL + '/accounts')
            .then(function(response) {
                $scope.accounts = response.data;
            })
            .catch(function(err) {
                console.error("Error loading accounts", err);
            });
    };

    $scope.loadTransactions = function() {
        $http.get(BASE_URL + '/transactions')
            .then(function(response) {
                $scope.transactions = response.data;
            })
            .catch(function(err) {
                console.error("Error loading transactions", err);
            });
    };

    // ================= ACCOUNT ACTIONS =================
    $scope.createAccount = function() {
        // Ensure role is sent in uppercase for Spring Boot Enums
        var accountToCreate = angular.copy($scope.newAccount);
        accountToCreate.role = accountToCreate.role.toUpperCase();

        $http.post(BASE_URL + '/accounts', accountToCreate)
            .then(function() {
                alert("Account created successfully!");
                $scope.newAccount = { username: '', password: '', role: 'USER', balance: 0 };
                $scope.loadAccounts();
            })
            .catch(function(err) {
                alert("Creation failed: " + (err.data.message || "Server Error"));
            });
    };

    // ================= TRANSACTION ACTIONS =================

    // TRANSFER
    $scope.transferMoney = function() {
        if (!$scope.transferData.sourceId || !$scope.transferData.destinationId) {
            alert("Please select both accounts.");
            return;
        }

        if ($scope.transferData.sourceId === $scope.transferData.destinationId) {
            alert("Cannot transfer to the same account!");
            return;
        }

        var transaction = {
            transfer_amount: $scope.transferData.amount,
            sourceAccount: { id: $scope.transferData.sourceId },
            destinationAccount: { id: $scope.transferData.destinationId }
        };

        $http.post(BASE_URL + '/transactions/transfer', transaction)
            .then(function() {
                alert("Transfer successful!");
                $scope.transferData = {}; 
                $scope.loadAccounts();
                $scope.loadTransactions();
            })
            .catch(function(err) {
                alert("Transfer failed: " + (err.data || "Check balance or account IDs"));
            });
    };

    // DEPOSIT
    $scope.depositMoney = function() {
        $http({
            url: BASE_URL + '/transactions/deposit',
            method: "POST",
            params: { 
                accountId: $scope.actionData.accountId, 
                amount: $scope.actionData.amount 
            }
        }).then(function() {
            alert("Deposit successful!");
            $scope.actionData = { accountId: null, amount: 0 };
            $scope.loadAccounts();
            $scope.loadTransactions();
        }).catch(function(err) {
            alert("Deposit failed: " + (err.data || "Error"));
        });
    };

    // WITHDRAW
    $scope.withdrawMoney = function() {
        $http({
            url: BASE_URL + '/transactions/withdraw',
            method: "POST",
            params: { 
                accountId: $scope.actionData.accountId, 
                amount: $scope.actionData.amount 
            }
        }).then(function() {
            alert("Withdrawal successful!");
            $scope.actionData = { accountId: null, amount: 0 };
            $scope.loadAccounts();
            $scope.loadTransactions();
        }).catch(function(err) {
            alert("Withdrawal failed: " + (err.data || "Insufficient funds"));
        });
    };

    // Initial Load
    $scope.loadAccounts();
    $scope.loadTransactions();
});