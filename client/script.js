document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:8000/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        console.log(response);

        // if (!response.ok) {
        //     const errorData = await response.json();
        //     throw new Error(errorData.message || 'Registracija nepavyko dėl nežinomos priežasties.');
        // }

        // const data = await response.json();
        // console.log(data);



        alert('Registracija sėkminga!');
        // localStorage.setItem('loggedInUser', username);
        // window.location.href = 'index.html';

    } catch (error) {
        console.error('Klaida registruojant:', error);
        alert('Registracija nepavyko! ' + error.message);
    }
});

const logoutBtn = document.getElementById('logoutBtn');
const welcomeMessage = document.getElementById('welcomeMessage');

// if (loggedInUser) {
//     const loggedInUser = localStorage.getItem('loggedInUser');

//     if (welcomeMessage) {
//         welcomeMessage.textContent = `Sveiki, ${loggedInUser}!`;
//     }
//     logoutBtn.style.display = 'inline';
// } else {

//     logoutBtn.style.display = 'none';

//     if (welcomeMessage) {
//         welcomeMessage.textContent = '';
//     }
// }

logoutBtn.addEventListener('click', function () {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
});