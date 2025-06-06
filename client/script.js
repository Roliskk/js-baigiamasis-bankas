document.addEventListener('DOMContentLoaded', () => {
    // Navigacijos elementai
    const loginLink = document.getElementById('loginLink');
    const logoutLink = document.getElementById('logoutLink');

    // Sekcijos
    const adminSection = document.getElementById('adminSection');
    const userSection = document.getElementById('userSection');
    const registerUserSection = document.getElementById('registerUserSection');
    const createAccountSection = document.getElementById('createAccountSection');
    const accountsOverviewSection = document.getElementById('accountsOverviewSection');
    const transferFundsSection = document.getElementById('transferFundsSection');

    // Formos
    const registerForm = document.getElementById('registerForm');
    const createAccountForm = document.getElementById('createAccountForm');
    const transferFundsForm = document.getElementById('transferFundsForm');

    // Lentelės
    const accountsTableBody = document.getElementById('accountsTableBody');

    // Redagavimo modalas ir forma
    const editAccountModal = document.getElementById('editAccountModal');
    const closeEditModal = document.querySelector('.close-button');
    const editAccountForm = document.getElementById('editAccountForm');
    const editAccountId = document.getElementById('editAccountId');
    const editFirstName = document.getElementById('editFirstName');
    const editLastName = document.getElementById('editLastName');
    const editPersonalId = document.getElementById('editPersonalId');
    const editAccountNumber = document.getElementById('editAccountNumber');
    const editBalance = document.getElementById('editBalance');
    const editPassportCopy = document.getElementById('editPassportCopy');


    // --- Funkcijos ---

    // Funkcija sąskaitų duomenims gauti ir atvaizduoti
  // Pakeiskite visą esamą 'fetchAccounts' FUNKCIJOS DEFINICIJĄ šiuo kodu:
const fetchAccounts = async () => {
    console.log('Bandau gauti sąskaitas...');
    const userRole = localStorage.getItem('userRole');
    const loggedInUserId = localStorage.getItem('loggedInUserId'); // Gaukite prisijungusio vartotojo ID

    let url = 'http://localhost:8000/api/accounts';
    // Jei vartotojo rolė yra "user", filtruojame sąskaitas pagal jo ID
    if (userRole === 'user' && loggedInUserId) {
        url = `http://localhost:8000/api/accounts?userId=${loggedInUserId}`; // Siunčiame userId kaip užklausos parametrą
        console.log(`Filtruojama sąskaitas vartotojui su ID: ${loggedInUserId}`);
    } else if (userRole === 'admin') {
        console.log('Administratorius: rodomos visos sąskaitos.');
    } else {
        // Nėra prisijungęs arba nežinoma rolė, nerodome sąskaitų.
        accountsTableBody.innerHTML = '<tr><td colspan="7">Prašome prisijungti, kad pamatytumėte sąskaitas.</td></tr>';
        // Taip pat paslepiame pervedimo sekciją, jei niekas neprisijungęs
        if (transferFundsSection) transferFundsSection.style.display = 'none'; // <-- Nauja eilutė
        return;
    }


    try {
        const response = await fetch(url);
        console.log('Atsakymas iš serverio:', response);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Klaida gaunant sąskaitas: HTTP statusas', response.status, 'Atsakymas:', errorText);
            accountsTableBody.innerHTML = '<tr><td colspan="7">Klaida įkeliant sąskaitas.</td></tr>';
            if (transferFundsSection) transferFundsSection.style.display = 'none'; // <-- Nauja eilutė
            return;
        }

        const accounts = await response.json();
        console.log('Sąskaitos gautos ir iššifruotos:', accounts);

        accountsTableBody.innerHTML = ''; // Išvalo esamas eilutes

        if (accounts.length === 0) {
            accountsTableBody.innerHTML = '<tr><td colspan="7">Nėra sukurtų sąskaitų.</td></tr>';
            if (transferFundsSection) transferFundsSection.style.display = 'none'; // <-- PRIDĖTA ŠI EILUTĖ (sąskaitų nėra, paslepiam pervedimą)
        } else {
            // Jei yra sąskaitų, įsitikiname, kad pervedimo sekcija yra matoma
            if (transferFundsSection) transferFundsSection.style.display = 'block'; // <-- PRIDĖTA ŠI EILUTĖ (sąskaitos yra, parodom pervedimą)
            accounts.forEach(account => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${account.firstName}</td>
                    <td>${account.lastName}</td>
                    <td>${account.personalId}</td>
                    <td>${account.accountNumber}</td>
                    <td>${parseFloat(account.balance).toFixed(2)} €</td>
                    <td>
                        <button onclick="editAccount('${account._id}')">Redaguoti</button>
                        <button onclick="deleteAccount('${account._id}')">Ištrinti</button>
                    </td>
                    <td>${account.passportCopy ? 'Yra' : 'Nėra'}</td>
                `;
                accountsTableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Bendroji klaida gaunant sąskaitas:', error);
        accountsTableBody.innerHTML = '<tr><td colspan="7">Klaida įkeliant sąskaitas.</td></tr>';
        if (transferFundsSection) transferFundsSection.style.display = 'none'; // <-- Nauja eilutė
    }
};

    // Funkcija, kuri parodo sąskaitos redagavimo modalą
    window.editAccount = async (id) => { // Padaryta globalia, kad būtų pasiekiama iš onclick
        try {
            const response = await fetch(`http://localhost:8000/api/accounts/${id}`);
            const account = await response.json();

            if (response.ok) {
                editAccountId.value = account._id;
                editFirstName.value = account.firstName;
                editLastName.value = account.lastName;
                editPersonalId.value = account.personalId;
                editAccountNumber.value = account.accountNumber;
                editBalance.value = account.balance;
                editPassportCopy.checked = account.passportCopy;

                editAccountModal.style.display = 'block';
            } else {
                alert(`Klaida gaunant sąskaitą: ${account.message || response.statusText}`);
            }
        } catch (error) {
            console.error('Klaida gaunant sąskaitą redagavimui:', error);
            alert('Klaida gaunant sąskaitą redagavimui.');
        }
    };

    // Funkcija sąskaitai ištrinti
    window.deleteAccount = async (id) => { // Padaryta globalia
        if (!confirm('Ar tikrai norite ištrinti šią sąskaitą?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/api/accounts/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                fetchAccounts(); // Atnaujinti sąskaitų sąrašą
            } else {
                alert(`Klaida trinant sąskaitą: ${data.message || response.statusText}`);
            }
        } catch (error) {
            console.error('Klaida trinant sąskaitą:', error);
            alert('Klaida trinant sąskaitą. Bandykite dar kartą.');
        }
    };


    // Funkcija, kuri patikrina vartotojo būseną ir parodo/paslepia elementus
    function checkUserStatus() {
        console.log('Tikrinama vartotojo būsena...');
        const loggedInUser = localStorage.getItem('loggedInUser');
        const userRole = localStorage.getItem('userRole');

      if (adminSection) adminSection.style.display = 'none';
        if (userSection) userSection.style.display = 'none';
        if (registerUserSection) registerUserSection.style.display = 'none';
        if (createAccountSection) createAccountSection.style.display = 'none';
        if (accountsOverviewSection) accountsOverviewSection.style.display = 'none';
        if (transferFundsSection) transferFundsSection.style.display = 'none';
        
        // Priklausomai nuo prisijungimo būsenos ir rolės
        if (loggedInUser) {
            // Prisijungęs
            if (loginLink) loginLink.style.display = 'none';
            if (logoutLink) logoutLink.style.display = 'block';

            if (userRole === 'admin') {
                if (adminSection) adminSection.style.display = 'block';
                if (registerUserSection) registerUserSection.style.display = 'block';
                if (createAccountSection) createAccountSection.style.display = 'block';
                if (accountsOverviewSection) accountsOverviewSection.style.display = 'block';
                if (transferFundsSection) transferFundsSection.style.display = 'block';
                fetchAccounts(); // Įkelia sąskaitas, jei esame administratorius
            } else if (userRole === 'user') {
                if (userSection) userSection.style.display = 'block';
                if (accountsOverviewSection) accountsOverviewSection.style.display = 'block';
                if (transferFundsSection) transferFundsSection.style.display = 'block';
                // Paprastas vartotojas neturi matyti registracijos ir sąskaitos kūrimo formų
                if (registerUserSection) registerUserSection.style.display = 'none'; // Paslėpti
                if (createAccountSection) createAccountSection.style.display = 'none'; // Paslėpti
                fetchAccounts(); // Įkelia sąskaitas, jei esame vartotojas
            }
        } else {
            // Nėra prisijungęs
            if (loginLink) loginLink.style.display = 'block';
            if (logoutLink) logoutLink.style.display = 'none';
        }
    }


    // --- Įvykių klausytojai (Event Listeners) ---

    // Registracijos formos tvarkytuvas
    if (registerForm) { // Patikrinti, ar elementas egzistuoja
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('registerUsername').value;
            const password = document.getElementById('registerPassword').value;
            const role = document.getElementById('registerRole').value;

            try {
                const response = await fetch('http://localhost:8000/api/users/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password, role }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.message);
                    registerForm.reset();
                } else {
                    alert(`Klaida registruojant: ${data.message || response.statusText}`);
                }
            } catch (error) {
                console.error('Klaida registruojant vartotoją:', error);
                alert('Klaida registruojant vartotoją. Bandykite dar kartą.');
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
            // GAUNAME VARTOTOJO ID IŠ NAUJO LAUKELIO
            const accountUserId = document.getElementById('accountUserId').value; // <-- PRIDĖTA

            const userId = accountUserId || null; // Nustatome ID. Jei laukelis tuščias, bus null.

            try {
                const response = await fetch('http://localhost:8000/api/accounts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    // PERDUODAME userId Į SERVERĮ
                    body: JSON.stringify({ firstName, lastName, personalId, balance, userId }), 
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.message);
                    createAccountForm.reset();
                    fetchAccounts(); // Atnaujinti sąskaitų sąrašą
                } else {
                    alert(`Klaida kuriant sąskaitą: ${data.message || response.statusText}`);
                }
            } catch (error) {
                console.error('Klaida kuriant sąskaitą:', error);
                alert('Klaida kuriant sąskaitą. Bandykite dar kartą.');
            }
        });
    }

    // Lėšų pervedimo formos tvarkytuvas
    if (transferFundsForm) {
        transferFundsForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const fromAccountNumber = document.getElementById('fromAccountNumber').value;
            const toAccountNumber = document.getElementById('toAccountNumber').value;
            const amount = parseFloat(document.getElementById('amount').value);

            try {
                const response = await fetch('http://localhost:8000/api/accounts/transfer', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ fromAccountNumber, toAccountNumber, amount }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.message);
                    transferFundsForm.reset();
                    fetchAccounts(); // Atnaujinti sąskaitų sąrašą po pervedimo
                } else {
                    alert(`Klaida pervedant lėšas: ${data.message || response.statusText}`);
                }
            } catch (error) {
                console.error('Klaida pervedant lėšas:', error);
                alert('Klaida pervedant lėšas. Bandykite dar kartą.');
            }
        });
    }

    // Redagavimo formos tvarkytuvas
    if (editAccountForm) {
        editAccountForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const id = editAccountId.value;
            const updatedData = {
                firstName: editFirstName.value,
                lastName: editLastName.value,
                personalId: editPersonalId.value,
                accountNumber: editAccountNumber.value,
                balance: parseFloat(editBalance.value),
                passportCopy: editPassportCopy.checked
            };

            try {
                const response = await fetch(`http://localhost:8000/api/accounts/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedData),
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.message);
                    editAccountModal.style.display = 'none'; // Uždaryti modalą
                    fetchAccounts(); // Atnaujinti sąskaitų sąrašą
                } else {
                    alert(`Klaida atnaujinant sąskaitą: ${data.message || response.statusText}`);
                }
            } catch (error) {
                console.error('Klaida atnaujinant sąskaitą:', error);
                alert('Klaida atnaujinant sąskaitą. Bandykite dar kartą.');
            }
        });
    }

    // Modalo uždarymas
    if (closeEditModal) {
        closeEditModal.addEventListener('click', () => {
            editAccountModal.style.display = 'none';
        });
    }

    window.onclick = (event) => {
        if (event.target == editAccountModal) {
            editAccountModal.style.display = 'none';
        }
    };


    // Atsijungimo funkcionalumas
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('userRole');
            localStorage.removeItem('loggedInUserId'); // Išvalyti ID atsijungiant
            alert('Sėkmingai atsijungėte!');
            window.location.href = 'login.html'; // Nukreipti į prisijungimo puslapį
        });
    }

    // Pradiniam puslapio įkrovimui
    checkUserStatus();

});