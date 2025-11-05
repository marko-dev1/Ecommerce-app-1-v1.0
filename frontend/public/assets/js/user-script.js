// const API_BASE = '/api/users';

// let currentToken = null;

// function showMessage(message, type = 'success') {
//     const messageDiv = document.getElementById('message');
//     messageDiv.textContent = message;
//     messageDiv.className = `message ${type}`;
//     messageDiv.style.display = 'block';
    
//     setTimeout(() => {
//         messageDiv.style.display = 'none';
//     }, 5000);
// }

// function showRegister() {
//     document.getElementById('register-form').classList.add('active');
//     document.getElementById('login-form').classList.remove('active');
//     document.getElementById('profile-section').style.display = 'none';
//     clearForms();
// }

// function showLogin() {
//     document.getElementById('login-form').classList.add('active');
//     document.getElementById('register-form').classList.remove('active');
//     document.getElementById('profile-section').style.display = 'none';
//     clearForms();
// }

// function showProfile() {
//     document.getElementById('register-form').classList.remove('active');
//     document.getElementById('login-form').classList.remove('active');
//     document.getElementById('profile-section').style.display = 'block';
// }

// function clearForms() {
//     document.getElementById('registerForm').reset();
//     document.getElementById('loginForm').reset();
// }

// // Registration
// document.getElementById('registerForm').addEventListener('submit', async (e) => {
//     e.preventDefault();
    
//     const formData = new FormData(e.target);
//     const userData = {
//         name: formData.get('name'),
//         email: formData.get('email'),
//         phone_number: formData.get('phone_number'),
//         password: formData.get('password')
//     };

//     try {
//         const response = await fetch('api/users', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(userData)
//         });

//         const data = await response.json();

//         if (response.ok) {
//             currentToken = data.token;
//             showMessage('Registration successful!');
//             showLogin(); // Switch to login form after registration
//         } else {
//             showMessage(data.error, 'error');
//         }
//     } catch (error) {
//         showMessage('Registration failed. Please try again.', 'error');
//     }
// });

// // Login
// document.getElementById('loginForm').addEventListener('submit', async (e) => {
//     e.preventDefault();
    
//     const formData = new FormData(e.target);
//     const loginData = {
//         login: formData.get('login'),
//         password: formData.get('password')
//     };

//     try {
//         const response = await fetch('api/users/login', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(loginData)
//         });

//         const data = await response.json();

//         if (response.ok) {
//             currentToken = data.token;
//             localStorage.setItem('token', currentToken);
//             await loadProfile();
//             showProfile();
//             showMessage('Login successful!');
           

//         } else {
//             showMessage(data.error, 'error');
//         }
//     } catch (error) {
//         showMessage('Login failed. Please try again.', 'error');
//     }
// });

// // Load Profile
// async function loadProfile() {
//     try {
//         const response = await fetch(`${API_BASE}/profile`, {
//             method: 'GET',
//             headers: {
//                 'Authorization': `Bearer ${currentToken}`
//             }
//         });

//         const data = await response.json();

//         if (response.ok) {
//             const profileInfo = document.getElementById('profile-info');
//             profileInfo.innerHTML = `
//                 <p><strong>Name:</strong> ${data.user.name}</p>
//                 <p><strong>Email:</strong> ${data.user.email}</p>
//                 <p><strong>Phone Number:</strong> ${data.user.phone_number}</p>
//             `;
//         } else {
//             showMessage(data.error, 'error');
//         }
//     } catch (error) {
//         showMessage('Failed to load profile', 'error');
//     }
// }

// // Logout
// function logout() {
//     currentToken = null;
//     localStorage.removeItem('token');
//     showLogin();
//     showMessage('Logged out successfully');
// }

// // Check for existing token on page load
// document.addEventListener('DOMContentLoaded', async () => {
//     const savedToken = localStorage.getItem('token');
//     if (savedToken) {
//         currentToken = savedToken;
//         try {
//             await loadProfile();
//             showProfile();
//         } catch (error) {
//             localStorage.removeItem('token');
//             showLogin();
//         }
//     } else {
//         showRegister();
//     }
// });

// function continueToHome() {
//     // Redirect user to main page or dashboard
    
// }



const API_BASE = '/api/users';
let currentToken = null;

function showMessage(message, type = 'success') {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

function showRegister() {
    document.getElementById('register-form').classList.add('active');
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('profile-section').style.display = 'none';
    clearForms();
}

function showLogin() {
    document.getElementById('login-form').classList.add('active');
    document.getElementById('register-form').classList.remove('active');
    document.getElementById('profile-section').style.display = 'none';
    clearForms();
}

function showProfile() {
    document.getElementById('register-form').classList.remove('active');
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('profile-section').style.display = 'block';
}

function clearForms() {
    document.getElementById('registerForm').reset();
    document.getElementById('loginForm').reset();
}

// ✅ Registration - FIXED
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        password: formData.get('password')
    };

    console.log('Registration data:', userData); // Debug

    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Registration successful!');
            showLogin();
        } else {
            showMessage(data.message || 'Registration failed.', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('Registration failed. Please try again.', 'error');
    }
});

// ✅ Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const loginData = {
        email: formData.get('login'),
        password: formData.get('password')
    };

    console.log('Login data:', loginData); // Debug

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });

        const data = await response.json();

        if (response.ok) {
            currentToken = data.token;
            localStorage.setItem('token', currentToken);
            await loadProfile();
            showProfile();
            showMessage('Login successful!');
        } else {
            showMessage(data.message || 'Login fled.', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Login failed. Please try again.', 'error');
    }
});

// ✅ Load Profile
async function loadProfile() {
    try {
        const response = await fetch(`${API_BASE}/profile`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });

        const data = await response.json();

        if (response.ok) {
            const profileInfo = document.getElementById('profile-info');
            profileInfo.innerHTML = `
                <p><strong>Name:</strong> ${data.user.name}</p>
                <p><strong>Email:</strong> ${data.user.email}</p>
                <p><strong>Phone Number:</strong> ${data.user.phone_number || 'N/A'}</p>
            `;
        } else {
            showMessage(data.message || 'Failed to load profile.', 'error');
        }
    } catch (error) {
        showMessage('Failed to load profile.', 'error');
    }
}

// ✅ Logout
function logout() {
    currentToken = null;
    localStorage.removeItem('token');
    showLogin();
    showMessage('Logged out successfully');
}

// ✅ On Page Load
document.addEventListener('DOMContentLoaded', async () => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
        currentToken = savedToken;
        try {
            await loadProfile();
            showProfile();
        } catch (error) {
            localStorage.removeItem('token');
            showLogin();
        }
    } else {
        showRegister();
    }
});

function continueToHome() {
    window.location.href = '/index.html';
}