document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      // 🟢 Išsaugome vartotojo vardą localStorage
      localStorage.setItem('loggedInUser', data.username);

      alert('Prisijungimas sėkmingas!');
      window.location.href = 'index.html'; // Nukreipiam į pagrindinį puslapį
    } else {
      alert(data.error || 'Prisijungimas nepavyko.');
    }

  } catch (err) {
    console.error('Prisijungimo klaida:', err);
    alert('Serverio klaida. Bandykite vėliau.');
  }
});
