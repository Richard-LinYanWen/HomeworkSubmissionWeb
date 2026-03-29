// public/navbar.js

const navbarHTML = `
<nav class="navbar">
    <div class="nav-logo">
        <a href="index.html">Homework Portal</a>
    </div>
    <div id="auth-status" class="nav-links">
        </div>
</nav>
`;

function injectNavbar() {
    const placeholder = document.getElementById('navbar-placeholder');
    if (placeholder) {
        placeholder.innerHTML = navbarHTML;
        
        // After painting the HTML, update the login status
        const authStatus = document.getElementById('auth-status');
        const user = localStorage.getItem('loggedInUser');

        if (user) {
            authStatus.innerHTML = `
                <span>Welcome, <strong>${user}</strong></span>
                <button onclick="logout()" class="logout-btn">Logout</button>
            `;
        } else {
            authStatus.innerHTML = `
                <a href="login.html">Login</a>
                <a href="register.html">Register</a>
            `;
        }
    }
}

function logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
}

// Run immediately when this script loads
injectNavbar();