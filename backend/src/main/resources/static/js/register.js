/**
 * Registration Controller for Mini Banking System
 * Author: Baldano, Estrellado, & Tan
 * Version: 2026.02.12
 */

app.controller('RegisterController', function($scope, $http, $window) {
    // Configuration
    const BASE_URL = "http://localhost:8082/api";

    // Initialize scope variables
    $scope.regData = {
        username: '',
        password: ''
    };
    $scope.errorMessage = '';
    $scope.isSubmitting = false;

    // ================= REGISTER FUNCTION =================
    $scope.register = function() {
        // 1. Basic Length Validation
        if ($scope.regData.username.length < 3) {
            $scope.errorMessage = 'Username must be at least 3 characters.';
            return;
        }

        if ($scope.regData.password.length < 4) {
            $scope.errorMessage = 'Password must be at least 4 characters.';
            return;
        }

        // 2. Submitting State
        $scope.isSubmitting = true;
        $scope.errorMessage = '';

        // Prepare the payload
        const payload = {
            username: $scope.regData.username,
            password: $scope.regData.password,
            role: 'USER' // Default role for new registrations
        };

        console.log("Registering user:", payload.username);

        // Path updated to match @PostMapping("/accounts/register") or similar in Backend
        $http.post(`${BASE_URL}/accounts/register`, payload)
            .then(function(response) {
                alert('Registration successful! You can now log in.');
                $window.location.href = 'login.html';
            })
            .catch(function(error) {
                console.error("Registration Error:", error);

                if (error.status === -1) {
                    $scope.errorMessage = "Server unreachable. Check if Spring Boot is running.";
                } else if (error.status === 400 || error.status === 409) {
                    $scope.errorMessage = (error.data && error.data.message)
                                          ? error.data.message
                                          : "Username is already taken.";
                } else {
                    $scope.errorMessage = "Registration failed. Try a different username.";
                }
            })
            .finally(function() {
                $scope.isSubmitting = false;
            });
    };

    // Helper to clear error when user types
    $scope.clearError = function() {
        $scope.errorMessage = '';
    };
});