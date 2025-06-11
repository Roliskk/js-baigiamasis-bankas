document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:8000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      // 🟢 Suderinam su script.js laukiamais raktais:
      localStorage.setItem('username', data.user.username);
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('userId', data.user._id);

      // 🔐 Jei naudoji JWT, įrašyk jį. Jei nenaudoji – priskirk "fake":
      localStorage.setItem('token', data.token || 'fakeToken');

      alert('Prisijungimas sėkmingas.');
      window.location.href = 'index.html';
    } else {
      alert(data.message || 'Prisijungimas nepavyko.');
    }
  } catch (error) {
    console.error('Klaida:', error);
    alert('Įvyko klaida bandant prisijungti.');
  }
});
