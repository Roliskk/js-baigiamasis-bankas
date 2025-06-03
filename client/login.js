document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!username || !password) {
    alert('Užpildykite visus laukus!');
    return;
  }

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

      localStorage.setItem('loggedInUser', data.username);

      alert('Prisijungimas sėkmingas!');
      window.location.href = 'index.html';
    } else {
      alert(data.error || 'Prisijungimas nepavyko.');
    }

  } catch (err) {
    console.error('Prisijungimo klaida:', err);
    alert('Serverio klaida. Bandykite vėliau.');
  }
});
