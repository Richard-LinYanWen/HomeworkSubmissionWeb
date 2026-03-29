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
document.getElementById('regForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('regUser').value;
    const password = document.getElementById('regPass').value;
    const confirmPass = document.getElementById('regPassConfirm').value;
    const errorMsg = document.getElementById('error-msg');

    // 1. Client-side Validation: Do they match?
    if (password !== confirmPass) {
        errorMsg.innerText = "Passwords do not match!";
        errorMsg.style.display = "block";
        return; // Stop the function here
    }

    // Hide error if they do match
    errorMsg.style.display = "none";

    try {
        const response = await fetch('http://localhost:5000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        if(response.ok) {
            alert("Registration successful! Redirecting to login...");
            window.location.href = 'login.html';
        } else {
            const data = await response.json();
            alert(data.message || "Registration failed");
        }
    } catch (err) {
        alert("Server connection failed.");
    }
};

// --- 3. SUBMISSION LOGIC (In submit.html) ---
// This ensures the script waits for the HTML to be fully 'drawn'
document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');

    if (!uploadForm) {
        console.error("❌ ERROR: Could not find the form! Check your HTML ID.");
        return;
    }

    uploadForm.addEventListener('submit', async (event) => {
        // 1. COMPLETELY KILL THE REFRESH
        event.preventDefault();
        event.stopImmediatePropagation();
        
        console.log("✅ Success! The page did NOT refresh.");

        const fileInput = document.getElementById('hwFile');
        const username = localStorage.getItem('loggedInUser');

        if (!username) {
            alert("Please login first.");
            return;
        }

        if (!fileInput.files[0]) {
            alert("Please select a file.");
            return;
        }

        // 2. Prepare Data
        const formData = new FormData();
        const params = new URLSearchParams(window.location.search);
        const hwValue = params.get('hw') || '0'; 
        formData.append('username', username);
        formData.append('hwNumber', hwValue); 
        formData.append('homeworkFile', fileInput.files[0]);

        try {
            console.log("📡 Sending to server...");
            const response = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert("Upload Successful!");
                window.location.href = 'index.html';
            } else {
                alert("Server rejected the upload.");
            }
        } catch (err) {
            console.error("📡 Fetch Error:", err);
            alert("Could not connect to server.");
        }
    });
});

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
