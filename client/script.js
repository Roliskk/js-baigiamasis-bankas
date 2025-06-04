document.addEventListener('DOMContentLoaded', () => {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const logoutBtn = document.getElementById('logoutBtn');
    const loggedInContent = document.getElementById('loggedInContent');
    const adminSection = document.getElementById('adminSection');

    const adminRegisterForm = document.getElementById('registerForm');
    const adminUsernameInput = document.getElementById('adminUsername');
    const adminPasswordInput = document.getElementById('adminPassword');

    const createAccountForm = document.getElementById('createAccountForm');
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const personalIdInput = document.getElementById('personalId');
    const balanceInput = document.getElementById('balance');
    const accountsTableBody = document.querySelector('#accountsTable tbody');

    const editModal = document.getElementById('editAccountModal');
    const editForm = document.getElementById('editAccountForm');
    const editFirstNameInput = document.getElementById('editFirstName');
    const editLastNameInput = document.getElementById('editLastName');
    const editPersonalIdInput = document.getElementById('editPersonalId');
    const editBalanceInput = document.getElementById('editBalance');
    const editAccountIdInput = document.getElementById('editAccountId');
    const closeModalBtn = document.querySelector('.close-button');

    const checkUserStatus = () => {
        const loggedInUser = localStorage.getItem('loggedInUser');
        const userRole = localStorage.getItem('userRole');

        if (loggedInUser) {
            welcomeMessage.textContent = `Sveiki, ${loggedInUser}!`;
            logoutBtn.style.display = 'block';
            loggedInContent.style.display = 'block';

            if (userRole === 'admin') {
                adminSection.style.display = 'block';
                fetchAccounts();
            } else {
                adminSection.style.display = 'none';
            }
        } else {
            window.location.href = 'login.html';
        }
    };

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('userRole');
        window.location.href = 'login.html';
    });

    adminRegisterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = adminUsernameInput.value;
        const password = adminPasswordInput.value;

        try {
            const response = await fetch('http://localhost:8000/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                adminUsernameInput.value = '';
                adminPasswordInput.value = '';
            } else {
                alert(data.message || 'Registracija nepavyko.');
            }
        } catch (error) {
            console.error('Klaida registruojant:', error);
            alert('Serverio klaida registruojant.');
        }
    });

    createAccountForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const firstName = firstNameInput.value;
        const lastName = lastNameInput.value;
        const personalId = personalIdInput.value;
        const balance = parseFloat(balanceInput.value);

        try {
            const response = await fetch('http://localhost:8000/api/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, personalId, balance })
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                firstNameInput.value = '';
                lastNameInput.value = '';
                personalIdInput.value = '';
                balanceInput.value = '0';
                fetchAccounts();
            } else {
                alert(data.message || 'Sąskaitos sukurti nepavyko.');
            }
        } catch (error) {
            console.error('Klaida kuriant sąskaitą:', error);
            alert('Serverio klaida kuriant sąskaitą.');
        }
    });

    const fetchAccounts = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/accounts');
            const accounts = await response.json();

            accountsTableBody.innerHTML = '';

            if (accounts.length === 0) {
                accountsTableBody.innerHTML = '<tr><td colspan="6">Nėra sukurtų sąskaitų.</td></tr>';
                return;
            }

            accounts.forEach(account => {
                const row = accountsTableBody.insertRow();
                row.innerHTML = `
                    <td>${account.firstName}</td>
                    <td>${account.lastName}</td>
                    <td>${account.personalId}</td>
                    <td>${account.accountNumber}</td>
                    <td>${account.balance.toFixed(2)} €</td>
                    <td>
                        <button onclick="window.editAccount('${account._id}')">Redaguoti</button>
                        <button onclick="window.deleteAccount('${account._id}')">Ištrinti</button>
                    </td>
                `;
            });
        } catch (error) {
            console.error('Klaida gaunant sąskaitas:', error);
            accountsTableBody.innerHTML = '<tr><td colspan="6">Nepavyko įkelti sąskaitų.</td></tr>';
        }
    };

    window.editAccount = async (id) => {
        try {
            const response = await fetch(`http://localhost:8000/api/accounts/${id}`);
            const account = await response.json();

            if (response.ok) {
                editFirstNameInput.value = account.firstName;
                editLastNameInput.value = account.lastName;
                editPersonalIdInput.value = account.personalId;
                editBalanceInput.value = account.balance;
                editAccountIdInput.value = account._id;
                editModal.style.display = 'block';
            } else {
                alert(account.message || 'Nepavyko gauti sąskaitos informacijos redagavimui.');
            }
        } catch (error) {
            console.error('Klaida gaunant sąskaitą redagavimui:', error);
            alert('Serverio klaida gaunant sąskaitą redagavimui.');
        }
    };

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = editAccountIdInput.value;
        const firstName = editFirstNameInput.value;
        const lastName = editLastNameInput.value;
        const personalId = editPersonalIdInput.value;
        const balance = parseFloat(editBalanceInput.value);

        try {
            const response = await fetch(`http://localhost:8000/api/accounts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, personalId, balance })
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                editModal.style.display = 'none';
                fetchAccounts();
            } else {
                alert(data.message || 'Sąskaitos atnaujinti nepavyko.');
            }
        } catch (error) {
            console.error('Klaida atnaujinant sąskaitą:', error);
            alert('Serverio klaida atnaujinant sąskaitą.');
        }
    });

    window.deleteAccount = async (id) => {
        if (!confirm('Ar tikrai norite ištrinti šią sąskaitą?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/api/accounts/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                fetchAccounts();
            } else {
                alert(data.message || 'Sąskaitos ištrinti nepavyko.');
            }
        } catch (error) {
            console.error('Klaida trinant sąskaitą:', error);
            alert('Serverio klaida trinant sąskaitą.');
        }
    };

    closeModalBtn.addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == editModal) {
            editModal.style.display = 'none';
        }
    });

    checkUserStatus();
});