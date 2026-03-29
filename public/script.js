// HELPER: Get the current logged-in user
const currentUser = localStorage.getItem('loggedInUser');

// --- 1. LOGIN LOGIC ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.onsubmit = async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUser').value;
        const password = document.getElementById('loginPass').value;

        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('loggedInUser', data.username);
            window.location.href = 'index.html';
        } else {
            alert(data.message);
        }
    };
}

// --- 2. REGISTER LOGIC ---
const regForm = document.getElementById('regForm');
if (regForm) {
    regForm.onsubmit = async (e) => {
        e.preventDefault();
        const username = document.getElementById('regUser').value;
        const password = document.getElementById('regPass').value;

        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (res.ok) {
            alert("Success! Please login.");
            window.location.href = 'login.html';
        } else {
            alert("Registration failed.");
        }
    };
}

// --- 3. SUBMISSION LOGIC (In submit.html) ---
const submitForm = document.getElementById('uploadForm');
if (submitForm) {
    // Fill in the name automatically if logged in
    if (currentUser) {
        document.getElementById('studentName').value = currentUser;
    }

    submitForm.onsubmit = async (e) => {
        e.preventDefault();
        const urlParams = new URLSearchParams(window.location.search);
        
        const submissionData = {
            studentName: document.getElementById('studentName').value,
            homeworkId: urlParams.get('hw'),
            fileName: document.getElementById('hwFile').files[0].name
        };

        const res = await fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submissionData)
        });

        if (res.ok) {
            alert("Homework Submitted!");
            window.location.href = 'index.html';
        }
    };
}

// --- 4. DASHBOARD LOGIC (In index.html) ---
const welcomeMsg = document.getElementById('welcome-user');
if (welcomeMsg && currentUser) {
    welcomeMsg.innerText = `Welcome back, ${currentUser}!`;
}

async function loadNavbar() {
    const placeholder = document.getElementById('navbar-placeholder');
    if (!placeholder) return; // Exit if the div doesn't exist on this page

    try {
        // Use a cache-buster to ensure we aren't getting an old empty version
        const response = await fetch('navbar.html?v=' + Date.now());
        
        if (!response.ok) {
            console.error("Server found the file but returned error:", response.status);
            return;
        }

        const navHtml = await response.text();
        
        if (navHtml.trim().length === 0) {
            console.error("Success! But navbar.html is EMPTY. Check the file content.");
            return;
        }

        placeholder.innerHTML = navHtml;
        
        // ONLY call updateNavbar AFTER the HTML is injected
        updateNavbar(); 
        
    } catch (err) {
        console.error("Fetch process failed entirely:", err);
    }
}

// ONLY ONE LISTENER - Start the chain here
document.addEventListener('DOMContentLoaded', loadNavbar);

function updateNavbar() {
    const authStatus = document.getElementById('auth-status');
    const user = localStorage.getItem('loggedInUser');

    if (user) {
        // If logged in, show username and Logout button
        authStatus.innerHTML = `
            <span>Welcome, <strong>${user}</strong></span>
            <a href="index.html">Dashboard</a>
            <button onclick="logout()" class="logout-btn">Logout</button>
        `;
    } else {
        // If NOT logged in, show Login/Register
        authStatus.innerHTML = `
            <a href="login.html">Login</a>
            <a href="register.html">Register</a>
        `;
    }
}

function logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
}
