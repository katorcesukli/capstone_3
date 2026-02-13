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
    $scope.actionData = { accountId: null, amount: 0 };
    $scope.errorMessage = "";

    // Search and Pagination State
    $scope.searchUser = "";
    $scope.accPage = 0;
    $scope.txPage = 0;

    // Modal State
    $scope.showEditModal = false;
    $scope.editingAcc = {};
    $scope.modalData = {};

    // Watcher: Reset account page to 0 whenever search query changes
    $scope.$watch('searchUser', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            $scope.accPage = 0;
        }
    });

    // ================= AUTH & SESSION =================
    $scope.adminLogout = function() {
        localStorage.removeItem('loggedUser');
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

    $scope.openEditModal = function(acc) {
        $scope.editingAcc = acc;
        $scope.modalData = {
            username: "",
            password: "",
            role: "",
            balance: null
        };
        $scope.showEditModal = true;
    };

    $scope.closeModal = function() {
        $scope.showEditModal = false;
        $scope.editingAcc = {};
    };

    $scope.saveModalEdit = function() {
        const updatedAccount = {
            username: ($scope.modalData.username && $scope.modalData.username.trim() !== "")
                      ? $scope.modalData.username : $scope.editingAcc.username,
            password: ($scope.modalData.password && $scope.modalData.password.trim() !== "")
                      ? $scope.modalData.password : $scope.editingAcc.password,
            role: ($scope.modalData.role && $scope.modalData.role.trim() !== "")
                  ? $scope.modalData.role.toUpperCase() : $scope.editingAcc.role,
            balance: ($scope.modalData.balance !== null && $scope.modalData.balance !== undefined)
                     ? parseFloat($scope.modalData.balance) : $scope.editingAcc.balance
        };

        $http.put(BASE_URL + '/accounts/' + $scope.editingAcc.id, updatedAccount)
            .then(function() {
                alert("Account updated successfully!");
                $scope.closeModal();
                $scope.loadAccounts();
            })
            .catch(function(err) {
                alert("Update failed: " + (err.data || "Server Error"));
            });
    };

    // DISABLE / SANITIZE (Soft Delete)
    $scope.deleteAccount = function(id) {
        if (!confirm("Are you sure? This will disable the account and sanitize sensitive data.")) return;

        $http.put(BASE_URL + '/accounts/disable/' + id)
            .then(function() {
                alert("Account disabled successfully!");
                $scope.loadAccounts();
            })
            .catch(function(err) {
                alert("Action failed: " + (err.data || "Server Error"));
            });
    };

    // REACTIVATE / ENABLE
    $scope.enableAccount = function(id) {
        if (!confirm("Reactivate this account?")) return;

        $http.put(BASE_URL + '/accounts/enable/' + id)
            .then(function() {
                alert("Account reactivated successfully!");
                $scope.loadAccounts();
            })
            .catch(function(err) {
                alert("Enable failed: " + (err.data || "Server Error"));
            });
    };

    // ================= TRANSACTION ACTIONS =================

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
                alert("Transfer failed: " + (err.data || "Check balance"));
            });
    };

    // Initial Load
    $scope.loadAccounts();
    $scope.loadTransactions();
});