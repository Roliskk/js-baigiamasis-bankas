document.addEventListener('DOMContentLoaded', () => {
     async function populateUserDropdown() {
        const dropdown = document.getElementById('accountUserIdDropdown');

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Autentifikacijos žetonas nerastas.');

            const response = await fetch('http://localhost:8000/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Nepavyko gauti klaidos pranešimo.' }));
                throw new Error(errorData.message || `Serverio klaida: ${response.status}`);
            }

            const users = await response.json();

            dropdown.innerHTML = '<option value="">Pasirinkite vartotoją</option>';

            if (users && Array.isArray(users)) {
                users.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user._id;
                    option.textContent = `${user.username}`;
                    dropdown.appendChild(option);
                });
            }

            dropdown.addEventListener('change', () => {
                const manualInput = document.getElementById('accountUserId');
                if (manualInput) {
                    manualInput.value = dropdown.value;
                }
            });

        } catch (error) {
            console.error('Klaida gaunant vartotojus išskleidžiamam meniu:', error);
            if (dropdown) {
                dropdown.innerHTML = '<option value="">Nepavyko užkrauti vartotojų</option>';
            }
        }
    }

    // 👇 Tiesiog palik šią eilutę kur nors tame pačiame bloke (pvz., po visais const):
    populateUserDropdown();

    // Navigacijos elementai
    const loginLink = document.getElementById('loginLink');
    const logoutLink = document.getElementById('logoutLink');

    const adminSection = document.getElementById('adminSection');
    const userSection = document.getElementById('userSection');
    const registerUserSection = document.getElementById('registerUserSection');
    const createAccountSection = document.getElementById('createAccountSection');
    const accountsOverviewSection = document.getElementById('accountsOverviewSection');
    const transferFundsSection = document.getElementById('transferFundsSection');
    const welcomeMessage = document.getElementById('welcomeMessage');

    const registerForm = document.getElementById('registerForm');
    const createAccountForm = document.getElementById('createAccountForm');
    const transferFundsForm = document.getElementById('transferFundsForm');
    const loginForm = document.getElementById('loginForm');

    const accountsTableBody = document.getElementById('accountsTableBody');

    // Redagavimo modalas ir forma
    const editAccountModal = document.getElementById('editAccountModal');
    const closeEditModal = document.querySelector('.close-button');
    const editAccountForm = document.getElementById('editAccountForm');

    const fetchAccounts = async () => {
        console.log('Bandau gauti sąskaitas...');
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('role');
        const loggedInUserId = localStorage.getItem('userId');

        if (!token) {
            accountsTableBody.innerHTML = '<tr><td colspan="7">Prašome prisijungti, kad pamatytumėte sąskaitas.</td></tr>';
            if (transferFundsSection) transferFundsSection.style.display = 'none';
            return;
        }

        let url = 'http://localhost:8000/api/accounts';
        if (userRole === 'user' && loggedInUserId) {
            url = `http://localhost:8000/api/accounts?userId=${loggedInUserId}`;
            console.log(`Filtruojama sąskaitas vartotojui su ID: ${loggedInUserId}`);
        } else if (userRole === 'admin') {
            console.log('Administratorius: rodomos visos sąskaitos.');
        } else {
            accountsTableBody.innerHTML = '<tr><td colspan="7">Klaida: Nepažįstama rolė.</td></tr>';
            if (transferFundsSection) transferFundsSection.style.display = 'none';
            return;
        }

        try {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('Atsakymas iš serverio:', response);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Klaida gaunant sąskaitas: HTTP statusas', response.status, 'Atsakymas:', errorText);
                accountsTableBody.innerHTML = '<tr><td colspan="7">Klaida įkeliant sąskaitas.</td></tr>';
                if (transferFundsSection) transferFundsSection.style.display = 'none';
                return;
            }

            const accounts = await response.json();
            console.log('Sąskaitos gautos ir iššifruotos:', accounts);

            accountsTableBody.innerHTML = '';

            if (accounts.length === 0) {
                accountsTableBody.innerHTML = '<tr><td colspan="7">Nėra sukurtų sąskaitų.</td></tr>';
                if (transferFundsSection) transferFundsSection.style.display = 'none';
            } else {
                if (transferFundsSection) transferFundsSection.style.display = 'block';
                accounts.forEach(account => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${account.firstName}</td>
                        <td>${account.lastName}</td>
                        <td>${account.personalId}</td>
                        <td>${account.accountNumber}</td>
                        <td>${parseFloat(account.balance).toFixed(2)} €</td>
                        <td class="actions-cell"></td> <td>${account.passportCopy ? 'Yra' : 'Nėra'}</td>
                    `;

                    const actionsCell = row.querySelector('.actions-cell');

                    if (userRole === 'admin') {
                        const editButton = document.createElement('button');
                        editButton.textContent = 'Redaguoti';
                        editButton.classList.add('edit-button');
                        editButton.onclick = () => openEditModal(account);
                        actionsCell.appendChild(editButton);

                        const deleteButton = document.createElement('button');
                        deleteButton.textContent = 'Trinti';
                        deleteButton.classList.add('delete-button');
                        deleteButton.onclick = () => deleteAccount(account._id);
                        actionsCell.appendChild(deleteButton);
                    } else {
                        actionsCell.textContent = 'Nėra veiksmų';
                    }
                    accountsTableBody.appendChild(row);
                });
            }
        } catch (error) {
            console.error('Bendroji klaida gaunant sąskaitas:', error);
            accountsTableBody.innerHTML = '<tr><td colspan="7">Klaida įkeliant sąskaitas.</td></tr>';
            if (transferFundsSection) transferFundsSection.style.display = 'none';
        }
    };

    function openEditModal(account) {
        document.getElementById('editAccountId').value = account._id;
        document.getElementById('editFirstName').value = account.firstName;
        document.getElementById('editLastName').value = account.lastName;
        document.getElementById('editPersonalId').value = account.personalId;
        document.getElementById('editAccountNumber').value = account.accountNumber;
        document.getElementById('editBalance').value = account.balance;
        document.getElementById('editPassportCopy').checked = account.passportCopy;

        editAccountModal.style.display = 'block';
    }

    async function deleteAccount(id) {
        if (!confirm('Ar tikrai norite ištrinti šią sąskaitą?')) {
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Nėra prisijungimo žetono. Prašome prisijungti.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/api/accounts/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                fetchAccounts();
            } else {
                alert(`Klaida trinant sąskaitą: ${data.message || response.statusText}`);
            }
        } catch (error) {
            console.error('Klaida trinant sąskaitą:', error);
            alert('Klaida trinant sąskaitą. Bandykite dar kartą.');
        }
    }

    function updateUIForUser(userRole, username) {
        if (adminSection) adminSection.style.display = 'none';
        if (userSection) userSection.style.display = 'none';
        if (registerUserSection) registerUserSection.style.display = 'none';
        if (createAccountSection) createAccountSection.style.display = 'none';
        if (accountsOverviewSection) accountsOverviewSection.style.display = 'none';
        if (transferFundsSection) transferFundsSection.style.display = 'none';
        if (loginLink) loginLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'none';
        if (welcomeMessage) welcomeMessage.style.display = 'none';


        if (userRole === 'admin') {
            if (adminSection) adminSection.style.display = 'block';
            if (registerUserSection) registerUserSection.style.display = 'block';
            if (createAccountSection) createAccountSection.style.display = 'block';
            if (accountsOverviewSection) accountsOverviewSection.style.display = 'block';
            if (transferFundsSection) transferFundsSection.style.display = 'block';
            if (loginLink) loginLink.style.display = 'none';
            if (logoutLink) logoutLink.style.display = 'block';
            if (welcomeMessage) {
                welcomeMessage.textContent = `Sveiki, Administratoriau (${username})!`;
                welcomeMessage.style.display = 'block';
            }
            populateUserDropdown();
        } else if (userRole === 'user') {
            if (userSection) userSection.style.display = 'block';
            if (accountsOverviewSection) accountsOverviewSection.style.display = 'block';
            if (transferFundsSection) transferFundsSection.style.display = 'block';
            if (loginLink) loginLink.style.display = 'none';
            if (logoutLink) logoutLink.style.display = 'block';
            if (welcomeMessage) {
                welcomeMessage.textContent = `Sveiki, ${username}!`;
                welcomeMessage.style.display = 'block';
            }
        } else {
            // Jei rolė nenustatyta arba nežinoma, paslėpti viską ir parodyti prisijungimo nuorodą
            if (loginLink) loginLink.style.display = 'block';
            if (logoutLink) logoutLink.style.display = 'none';
            if (welcomeMessage) welcomeMessage.style.display = 'none';
        }
        fetchAccounts();
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('registerUsername').value;
            const password = document.getElementById('registerPassword').value;
            const role = document.getElementById('registerRole').value;

            try {
                const response = await fetch('http://localhost:8000/api/users/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password, role }),
                });
                const data = await response.json();
                if (response.ok) {
                    alert(data.message);
                    registerForm.reset();
                } else {
                    alert(data.message || 'Nepavyko užregistruoti vartotojo.');
                }
            } catch (error) {
                console.error('Klaida registruojant vartotoją:', error);
                alert('Nepavyko užregistruoti vartotojo. Žr. konsolę.');
            }
        });
    }

    if (createAccountForm) {
        createAccountForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const personalId = document.getElementById('personalId').value;
            const balance = parseFloat(document.getElementById('balance').value);
            const userId = document.getElementById('accountUserId').value;

            const token = localStorage.getItem('token');
            if (!token) {
                alert('Nėra prisijungimo žetono. Prašome prisijungti.');
                return;
            }

            try {
                const response = await fetch('http://localhost:8000/api/accounts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ firstName, lastName, personalId, balance, userId })
                });
                const data = await response.json();
                if (response.ok) {
                    alert('Sąskaita sėkmingai sukurta!');
                    createAccountForm.reset();
                    fetchAccounts();
                } else {
                    alert(data.message || 'Nepavyko sukurti sąskaitos.');
                }
            } catch (error) {
                console.error('Klaida kuriant sąskaitą:', error);
                alert('Nepavyko sukurti sąskaitos. Žr. konsolę.');
            }
        });
    }

    if (transferFundsForm) {
        transferFundsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fromAccountNumber = document.getElementById('fromAccountNumber').value;
            const toAccountNumber = document.getElementById('toAccountNumber').value;
            const amount = parseFloat(document.getElementById('amount').value);

            const token = localStorage.getItem('token');
            if (!token) {
                alert('Nėra prisijungimo žetono. Prašome prisijungti.');
                return;
            }

            try {
                const response = await fetch('http://localhost:8000/api/accounts/transfer', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ fromAccountNumber, toAccountNumber, amount })
                });
                const data = await response.json();
                if (response.ok) {
                    alert(data.message);
                    transferFundsForm.reset();
                    fetchAccounts();
                } else {
                    alert(data.message || 'Lėšų pervedimas nepavyko.');
                }
            } catch (error) {
                console.error('Klaida pervedant lėšas:', error);
                alert('Lėšų pervedimas nepavyko. Žr. konsolę.');
            }
        });
    }

    if (editAccountForm) {
        editAccountForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const accountId = document.getElementById('editAccountId').value;
            const firstName = document.getElementById('editFirstName').value;
            const lastName = document.getElementById('editLastName').value;
            const personalId = document.getElementById('editPersonalId').value;
            const accountNumber = document.getElementById('editAccountNumber').value;
            const balance = parseFloat(document.getElementById('editBalance').value);
            const passportCopy = document.getElementById('editPassportCopy').checked;

            const token = localStorage.getItem('token');
            if (!token) {
                alert('Nėra prisijungimo žetono. Prašome prisijungti.');
                return;
            }

            try {
                const response = await fetch(`http://localhost:8000/api/accounts/${accountId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ firstName, lastName, personalId, accountNumber, balance, passportCopy })
                });
                const data = await response.json();
                if (response.ok) {
                    alert('Sąskaita sėkmingai atnaujinta!');
                    editAccountModal.style.display = 'none';
                    fetchAccounts();
                } else {
                    alert(data.message || 'Nepavyko atnaujinti sąskaitos.');
                }
            } catch (error) {
                console.error('Klaida atnaujinant sąskaitą:', error);
                alert('Nepavyko atnaujinti sąskaitos. Žr. konsolę.');
            }
        });
    }

    if (closeEditModal) {
        closeEditModal.onclick = () => {
            editAccountModal.style.display = 'none';
        };
    }

    window.onclick = (event) => {
        if (event.target === editAccountModal) {
            editAccountModal.style.display = 'none';
        }
    };

    // Prisijungimo formos tvarkytuvas (tik jei elementas egzistuoja, t.y. login.html)
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://localhost:8000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await response.json();

                if (response.ok) {
                    alert(data.message);
                    localStorage.setItem('token', data.token);
                    console.log('Tokenas nustatytas localStorage:', localStorage.getItem('token'));
                    localStorage.setItem('role', data.role);
                    console.log('Rolė nustatyta localStorage:', localStorage.getItem('role'));
                    localStorage.setItem('username', data.username);
                    console.log('Vartotojo vardas nustatytas localStorage:', localStorage.getItem('username'));
                    localStorage.setItem('userId', data.userId);
                    console.log('Vartotojo ID nustatytas localStorage:', localStorage.getItem('userId'));
                    // Po sėkmingo prisijungimo, tiesiog nukreipiame
                    console.log('Nukreipiama į index.html...');
                    window.location.href = 'index.html';
                } else {
                    alert(data.message || 'Nepavyko prisijungti.');
                }
            } catch (error) {
                console.error('Klaida prisijungiant:', error);
                alert('Nepavyko prisijungti. Žr. konsolę.');
            }
        });
    }

    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('username');
            localStorage.removeItem('userId');
            alert('Sėkmingai atsijungėte.');
            window.location.href = 'login.html';
        });
    }

    // Pagrindinė funkcija, kuri patikrina prisijungimo būseną ir atnaujina UI
    function checkLoginStatus() {
        console.log('checkLoginStatus funkcija iškviesta.');
        const token = localStorage.getItem('token');
        console.log('checkLoginStatus - tokenas:', token);
        const userRole = localStorage.getItem('role');
        console.log('checkLoginStatus - rolė:', userRole);
        const username = localStorage.getItem('username');
        console.log('checkLoginStatus - vartotojo vardas:', username);
        const userId = localStorage.getItem('userId');
        console.log('checkLoginStatus - vartotojo ID:', userId);

        // Jei vartotojas jau yra prisijungęs (turi tokeną) ir bando pasiekti login.html,
        // nukreipiame jį į index.html, kad nebūtų "užstrigęs" prisijungimo puslapyje.
        if (window.location.pathname.endsWith('login.html')) {
            console.log('Dabartinis puslapis: login.html');
            if (token) { // Jei login.html ir YRA tokenas
                console.log('checkLoginStatus: login.html, bet tokenas RASTAS, nukreipiama į index.html.');
                window.location.href = 'index.html';
            } else {
                console.log('checkLoginStatus: login.html, tokeno NĖRA. Leidžiama pasirodyti login.html.');
            }
            return;
        }

        // Ši dalis vykdoma tik tada, kai esame index.html (arba bet kuriame kitame apsaugotame puslapyje)
        // ir tikriname, ar vartotojas turi būti prisijungęs.
        console.log('Dabartinis puslapis: index.html (arba kitas apsaugotas puslapis)');
        if (token && userRole && username && userId) {
            console.log('checkLoginStatus: Tokenas ir rolė RASTI. Atnaujinama UI.');
            updateUIForUser(userRole, username);
        } else {
            console.log('checkLoginStatus: Tokeno ar rolės NĖRA. Peradresuojama į login.html.');
            alert('Jūs neprisijungęs. Prašome prisijungti.');
            window.location.href = 'login.html';
        }
    }
    // Iškviesti funkciją puslapio įkrovimo metu
    
// 🟢 Užpildyti vartotojų sąrašą (dropdown) sąskaitos kūrimo formoje
async function populateUserDropdown() {
const dropdown = document.getElementById('accountUserIdDropdown');

try {
    // 1. Gaukite 'token' iš localStorage
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Autentifikacijos žetonas nerastas.');
    }

    // 2. Pridėkite 'Authorization' antraštę į užklausą
    const response = await fetch('http://localhost:8000/api/users', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    // 3. Patikrinkite, ar serveris atsakė sėkmingai (statusas 200-299)
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Nepavyko gauti klaidos pranešimo.' }));
        throw new Error(errorData.message || `Serverio klaida: ${response.status}`);
    }

    // 4. Tik jei viskas gerai, apdorokite atsakymą
    const users = await response.json();

    // Išvalyti senus pasirinkimus
    dropdown.innerHTML = '<option value="">Pasirinkite vartotoją</option>';

    // Saugiai užpildome dropdown'ą
    if (users && Array.isArray(users)) {
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user._id; // Naudosime vartotojo ID kaip vertę
            option.textContent = `${user.username}`; // Rodysime vartotojo vardą
            dropdown.appendChild(option);
        });
    }

} catch (error) {
    // Sugaukite bet kokias klaidas (tinklo, autorizacijos, ir t.t.) ir parodykite jas konsolėje
    console.error('Klaida gaunant vartotojus išskleidžiamam meniu:', error);
    // Atnaujiname UI, kad vartotojas matytų problemą
    if (dropdown) {
        dropdown.innerHTML = '<option value="">Nepavyko užkrauti vartotojų</option>';
    }
}
}

});
document.addEventListener("DOMContentLoaded", () => {
    const userRole = localStorage.getItem("userRole"); // Gauname vartotojo rolę iš localStorage

    if (userRole === "admin") {
        document.getElementById("adminSection").style.display = "block"; // Rodome admin sekciją
        document.getElementById("createAccountSection").style.display = "block"; // Rodome sąskaitos kūrimo formą
    }
});
