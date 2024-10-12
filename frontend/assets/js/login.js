// Start Form Switch

function toggleVisibility(showElement, hideElement) {
    hideElement.classList.replace('show', 'hide');
    showElement.classList.replace('hide', 'show');
}

const login = document.getElementById("login");
const register = document.getElementById("register");

// Switch Form on click

document.getElementById("login_input").onclick = () => toggleVisibility(login, register);
document.getElementById("register_input").onclick = () => toggleVisibility(register, login);

// End Form Switch


// Start Password Validation

const passwordInput = document.getElementById("register_password");
const passwordInputFeedback = document.getElementById("register_password_feedback");

const confirmPasswordInput = document.getElementById("register_password_confirm");
const confirmPasswordInputFeedback = document.getElementById("register_password_confirm_feedback");

const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/;

// Validate if password == passwordConfirm
confirmPasswordInput.addEventListener('blur', function () {
    confirmPassword()
});

// Validate if password == passwordConfirm
passwordInput.addEventListener('blur', function () {
    if (confirmPasswordInput.value != "") {
        confirmPassword()
    }
});

// Validate if password is secure
function securePassword(input, feedback) {
    if (passRegex.test(input.value)) {
        passwordInput.setCustomValidity("");
    } else {
        input.setCustomValidity("The password doesn't meet the criteria.");
        feedback.innerText = "The password doesn't meet the criteria.";
    }
}

//Validate if password is equal to the passwordConfirm
function confirmPassword() {
    if (passwordInput.value === confirmPasswordInput.value) {
        confirmPasswordInput.setCustomValidity("");
    } else {
        confirmPasswordInput.setCustomValidity("The passwords don't match.");
        confirmPasswordInputFeedback.innerText = "The passwords don't match.";
    }
}

passwordInput.addEventListener('blur', function () {
    securePassword(passwordInput, passwordInputFeedback);
});

confirmPasswordInput.addEventListener('blur', function () {
    securePassword(confirmPasswordInput, confirmPasswordInputFeedback);
});

// End Password Validation


// Start Form Submit

document.addEventListener("DOMContentLoaded", function () {
    const forms = document.querySelectorAll("form");

    forms.forEach(form => {
        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            event.stopPropagation();

            if (form.checkValidity()) {
                form.id === "login_form" ? await loginUser() : await registerUser();
            }
            form.classList.add("was-validated");
        });
    });
});

// End Form Submit

// Function to login
async function loginUser() {
    const loginData = {
        email: document.getElementById("login_email").value,
        password: document.getElementById("login_password").value,
    };

    try {
        const response = await fetch("http://localhost:3001/api/user/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginData),
        });

        if (!response.ok) {
            throw new Error("Network response was not ok.");
        }

        const data = await response.json();
        localStorage.setItem("token", data.token);
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Failed to log in:", error);
    }
}

// Function to register
async function registerUser() {
    const newUser = {
        name: document.getElementById("register_name").value,
        email: document.getElementById("register_email").value,
        password: document.getElementById("register_password").value
    };

    try {
        const response = await fetch("http://localhost:3001/api/user/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser),
        });

        if (!response.ok) throw new Error("Network response was not ok.");

        document.getElementById("register_form").reset(); // Clear the register form
        toggleVisibility(login, register); // Switch back to login form after registration
    } catch (error) {
        console.error("Failed to register the user:", error);
    }
}