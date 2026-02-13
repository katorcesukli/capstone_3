/**
 * Login Controller for Mini Banking System
 * Author: Baldano, Estrellado, & Tan
 * Version: 2026.02.12
 */

app.controller('LoginController', function($scope, $http, $window) {
    // Configuration
    const BASE_URL = "http://localhost:8082/api";
    const sessionKey = "loggedUser";

    // Initialize scope variables
    $scope.loginData = {
        username: '',
        password: ''
    };
    $scope.errorMessage = '';
    $scope.isSubmitting = false;

    // ================= AUTO-REDIRECT IF LOGGED IN =================
    $scope.checkSession = function() {
        const savedUser = localStorage.getItem(sessionKey);
        if (savedUser) {
            const user = JSON.parse(savedUser);
            if (user.role && user.role.toUpperCase() === 'ADMIN') {
                $window.location.href = 'admin.html';
            } else {
                $window.location.href = 'customer.html';
            }
        }
    };

    // ================= LOGIN FUNCTION =================
    $scope.login = function() {
        // Basic validation
        if (!$scope.loginData.username || !$scope.loginData.password) {
            $scope.errorMessage = "Please enter both username and password.";
            return;
        }

        // Reset state
        $scope.isSubmitting = true;
        $scope.errorMessage = '';

        console.log("Attempting login for:", $scope.loginData.username);

        $http.post(`${BASE_URL}/accounts/login`, $scope.loginData)
            .then(function(response) {
                const user = response.data;

                // 1. Save user session to localStorage
                localStorage.setItem(sessionKey, JSON.stringify(user));

                // 2. Success Feedback
                console.log("Login successful. Role:", user.role);

                // 3. Redirect based on role
                if (user.role && user.role.toUpperCase() === 'ADMIN') {
                    $window.location.href = 'admin.html';
                } else {
                    $window.location.href = 'customer.html';
                }
            })
            .catch(function(error) {
                console.error("Login Error:", error);

                if (error.status === -1) {
                    $scope.errorMessage = "Cannot connect to server. Is the Backend running?";
                } else if (error.status === 401) {
                    // Matches the UNAUTHORIZED status from AccountController.login
                    $scope.errorMessage = (error.data && error.data.message) 
                                          ? error.data.message 
                                          : "Invalid username or password.";
                } else {
                    $scope.errorMessage = "An unexpected error occurred. Please try again.";
                }
            })
            .finally(function() {
                $scope.isSubmitting = false;
            });
    };

    // Run session check on load
    $scope.checkSession();
});