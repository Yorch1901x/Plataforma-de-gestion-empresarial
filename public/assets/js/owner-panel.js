import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

let app, auth, db;
let allUsers = [];

// UI Elements
const loadingOverlay = document.getElementById('loadingOverlay');
const usersTableBody = document.getElementById('usersTableBody');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const roleFilter = document.getElementById('roleFilter');
const refreshBtn = document.getElementById('refreshBtn');

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

async function initialize() {
    try {
        const response = await fetch('/api/config');
        const data = await response.json();

        app = initializeApp(data.firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                document.getElementById('currentUserEmail').textContent = user.email;

                // Check if current user is owner
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists() && userDoc.data().role === 'owner') {
                    loadingOverlay.style.display = 'none';
                    loadUsers();
                } else {
                    alert('Acceso Denegado: No tienes privilegios de Owner.');
                    window.location.href = '/dashboard';
                }
            } else {
                window.location.href = '/login';
            }
        });
    } catch (error) {
        console.error("Error al inicializar", error);
        alert("Error crítico al cargar el panel.");
    }
}

async function loadUsers() {
    try {
        usersTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Cargando usuarios...</td></tr>';
        emptyState.style.display = 'none';

        const querySnapshot = await getDocs(collection(db, "users"));
        allUsers = [];
        querySnapshot.forEach((doc) => {
            allUsers.push(doc.data());
        });

        renderUsers();
    } catch (error) {
        console.error("Error cargando usuarios:", error);
        showToast("Error al cargar la lista de usuarios. Revisa permisos.", "error");
    }
}

function renderUsers() {
    const searchTerm = searchInput.value.toLowerCase();
    const filterRole = roleFilter.value;

    const filteredUsers = allUsers.filter(u => {
        const matchesSearch = u.email.toLowerCase().includes(searchTerm) || u.uid.toLowerCase().includes(searchTerm);
        const matchesRole = filterRole === 'all' || u.role === filterRole;
        return matchesSearch && matchesRole;
    });

    usersTableBody.innerHTML = '';

    if (filteredUsers.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        filteredUsers.forEach(user => {
            const tr = document.createElement('tr');

            // Solo el owner no debe poder cambiarse a sí mismo a menor nivel de forma fácil o al menos advertir (aquí lo permitiremos, pero normalmente no)
            const isSelf = user.uid === auth.currentUser.uid;

            tr.innerHTML = `
                <td style="font-family: monospace; font-size: 0.85rem; color: #aaa;">${user.uid}</td>
                <td style="font-weight: 600;">${user.email} ${isSelf ? '<span style="color:var(--text-muted); font-size: 0.75rem;">(Tú)</span>' : ''}</td>
                <td><span class="role-badge role-${user.role}">${user.role}</span></td>
                <td>${user.orgs_ids ? user.orgs_ids.length : 0} Orgs</td>
                <td>
                    <select class="action-select" onchange="window.updateUserRole('${user.uid}', this.value)" ${isSelf ? 'disabled title="No puedes cambiar tu propio rol desde aquí"' : ''}>
                        <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                        <option value="owner" ${user.role === 'owner' ? 'selected' : ''}>Owner</option>
                    </select>
                </td>
            `;
            usersTableBody.appendChild(tr);
        });
    }
}

window.updateUserRole = async (uid, newRole) => {
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
            role: newRole
        });
        showToast(`Rol actualizado a ${newRole} exitosamente`);
        loadUsers(); // Refresh
    } catch (error) {
        console.error("Error actualizando rol:", error);
        showToast("Error al actualizar el rol. Verifica permisos.", "error");
        loadUsers(); // Revert UI
    }
};

// Event Listeners
searchInput.addEventListener('input', renderUsers);
roleFilter.addEventListener('change', renderUsers);
refreshBtn.addEventListener('click', loadUsers);

document.getElementById('logoutBtn').addEventListener('click', () => {
    signOut(auth);
});

// Setup
initialize();
