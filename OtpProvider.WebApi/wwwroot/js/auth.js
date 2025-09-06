// Adjust base URL according to your backend API
const BASE_URL = "http://localhost:5169/api/auth";

function registerUser(e) {
    e.preventDefault();
    const user = {
        username: $("#username").val(),
        email: $("#email").val(),
        password: $("#password").val()
    };

    apiRequest(BASE_URL + "/register", "POST", user,
        function (res) {
            $("#message").text("Registration successful! Please login.");
        },
        function (err) {
            $("#message").text("Registration failed: " + err.responseText);
        });
}

function loginUser(e) {
    e.preventDefault();
    const credentials = {
        username: $("#username").val(),
        password: $("#password").val()
    };

    apiRequest(BASE_URL + "/token", "POST", credentials,
        function (res) {
            localStorage.setItem("token", res.token);
            window.location.href = "index.html";
        },
        function (err) {
            $("#message").text("Login failed: " + err.responseText);
        });
}
