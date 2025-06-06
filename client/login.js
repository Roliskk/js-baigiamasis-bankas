document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://localhost:8000/api/users/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.message);
                    localStorage.setItem('loggedInUser', data.user.username);
                    localStorage.setItem('userRole', data.user.role);
                    localStorage.setItem('loggedInUserId', data.user._id); // <-- PRIDĖTA ŠI EILUTĖ

                    window.location.href = 'index.html';
                } else {
                    alert(`Prisijungti nepavyko: ${data.message || response.statusText}`);
                }
            } catch (error) {
                console.error('Klaida prisijungiant:', error);
                alert('Klaida prisijungiant. Bandykite dar kartą.');
            }
        });
    }
});