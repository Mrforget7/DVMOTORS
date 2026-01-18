/* script.js */

// --- BASE DE DATOS LOCAL (Persistencia) ---
let users = JSON.parse(localStorage.getItem('users')) || [];
let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
let mechanics = JSON.parse(localStorage.getItem('mechanics')) || [
    { 
        id: 1, 
        name: "Roberto Silva", 
        age: 42, 
        photo: "https://via.placeholder.com/60", 
        rating: 5, 
        voters: 1, 
        totalPoints: 5, 
        reviews: [] 
    }
];

let currentUser = null;
let isAdmin = false;
let currentMechanicId = null;

// --- ELEMENTOS DEL DOM ---
const authModal = document.getElementById('auth-modal');
const mainWrapper = document.getElementById('main-content-wrapper');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const sidebar = document.getElementById('sidebar');
const notificationModal = document.getElementById('notification-modal');
const notificationMessage = document.getElementById('notification-message');
const profileModal = document.getElementById('profile-modal');

// --- FUNCIÓN PARA MOSTRAR NOTIFICACIONES ---
function showNotification(message, isError = false) {
    notificationMessage.textContent = message;
    const icon = document.querySelector('.notification-icon i');
    if (isError) {
        icon.className = 'fas fa-times-circle';
        document.querySelector('.notification-icon').classList.add('error');
        document.querySelector('.notification-content .btn').className = 'btn btn-accent';
    } else {
        icon.className = 'fas fa-check-circle';
        document.querySelector('.notification-icon').classList.remove('error');
        document.querySelector('.notification-content .btn').className = 'btn btn-success';
    }
    notificationModal.classList.add('active');
}

function closeNotification() {
    notificationModal.classList.remove('active');
}

// --- FUNCIONES PARA PERFIL DE USUARIO ---
function openProfileModal() {
    if (!currentUser) return;
    
    document.getElementById('profile-username').value = currentUser.username;
    document.getElementById('profile-email').value = currentUser.email;
    document.getElementById('profile-vehiculo').value = currentUser.vehiculo || '';
    
    const profilePhoto = document.getElementById('profile-current-photo');
    const avatarPhoto = document.getElementById('user-avatar-img');
    
    if (currentUser.photo) {
        profilePhoto.src = currentUser.photo;
        avatarPhoto.src = currentUser.photo;
    } else {
        profilePhoto.src = 'https://via.placeholder.com/120';
        avatarPhoto.src = 'https://via.placeholder.com/40';
    }
    
    profileModal.classList.add('active');
    
    // Configurar el input de foto
    const photoInput = document.getElementById('profile-photo-input');
    photoInput.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                profilePhoto.src = e.target.result;
                avatarPhoto.src = e.target.result;
                currentUser.photo = e.target.result;
                localStorage.setItem('users', JSON.stringify(users));
                updateAvatar();
            };
            reader.readAsDataURL(file);
        }
    };
}

function closeProfileModal() {
    profileModal.classList.remove('active');
}

function updateProfile() {
    const newUsername = document.getElementById('profile-username').value;
    const newEmail = document.getElementById('profile-email').value;
    const newVehiculo = document.getElementById('profile-vehiculo').value;
    
    if (!newUsername || !newEmail) {
        showNotification("El nombre de usuario y correo son obligatorios.", true);
        return;
    }
    
    // Verificar si el email ya existe (si cambió)
    if (newEmail !== currentUser.email && users.some(u => u.email === newEmail)) {
        showNotification("Este correo electrónico ya está registrado.", true);
        return;
    }
    
    // Actualizar usuario en la base de datos
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        users[userIndex].username = newUsername;
        users[userIndex].email = newEmail;
        users[userIndex].vehiculo = newVehiculo;
        
        if (currentUser.photo) {
            users[userIndex].photo = currentUser.photo;
        }
        
        localStorage.setItem('users', JSON.stringify(users));
        
        // Actualizar usuario actual
        currentUser = users[userIndex];
        
        // Actualizar información en el header
        document.getElementById('display-user-name').textContent = currentUser.username;
        document.getElementById('display-user-email').textContent = currentUser.email;
        updateAvatar();
        
        showNotification("Perfil actualizado correctamente.");
        closeProfileModal();
    }
}

function updateAvatar() {
    const avatarImg = document.getElementById('user-avatar-img');
    if (currentUser.photo) {
        avatarImg.src = currentUser.photo;
    } else {
        avatarImg.src = 'https://via.placeholder.com/40';
    }
}

// --- MANEJO DE PESTAÑAS (LOGIN/REGISTRO) ---
document.querySelectorAll('.modal-tab').forEach(tab => {
    tab.onclick = function() {
        document.querySelectorAll('.modal-tab, .tab-content').forEach(el => el.classList.remove('active'));
        this.classList.add('active');
        document.getElementById(this.dataset.content).classList.add('active');
    };
});

// --- OJO DE CONTRASEÑA (ESTILO FACEBOOK) ---
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', function() {
        const input = document.getElementById(this.dataset.target);
        const isHidden = input.type === "password";
        input.type = isHidden ? "text" : "password";
        this.classList.toggle('active', !isHidden);
    });
});

// --- SISTEMA DE REGISTRO ---
registerForm.onsubmit = function(e) {
    e.preventDefault();
    
    const newUser = {
        username: document.getElementById('reg-username').value,
        vehiculo: document.getElementById('reg-vehiculo').value,
        email: document.getElementById('reg-email').value,
        pass: document.getElementById('reg-password').value,
        photo: null,
        registrationDate: new Date().toLocaleDateString()
    };

    // Verificar si el email ya existe
    if (users.some(u => u.email === newUser.email)) {
        showNotification("Este correo electrónico ya está registrado.", true);
        return;
    }

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    showNotification("¡Registro exitoso! Por favor, inicia sesión.");
    
    registerForm.reset();
    document.querySelector('[data-content="login-content"]').click();
};

// --- SISTEMA DE LOGIN ---
loginForm.onsubmit = function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;

    if (email === "admin@rnmotors.com" && pass === "admin123") {
        isAdmin = true;
        currentUser = { 
            username: "Administrador", 
            email: email,
            photo: null
        };
        abrirApp();
    } else {
        const userFound = users.find(u => u.email === email && u.pass === pass);
        if (userFound) {
            isAdmin = false;
            currentUser = userFound;
            abrirApp();
        } else {
            showNotification("Correo o contraseña incorrectos.", true);
        }
    }
};

function abrirApp() {
    authModal.classList.remove('open');
    mainWrapper.style.display = 'block';

    document.getElementById('display-user-name').textContent = currentUser.username;
    document.getElementById('display-user-email').textContent = currentUser.email;
    updateAvatar();

    if (isAdmin) {
        document.getElementById('client-view').style.display = 'none';
        document.getElementById('admin-view').style.display = 'block';
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.client-only').forEach(el => el.style.display = 'none');
        renderAdminTable();
        renderUsersTable();
    } else {
        document.getElementById('client-view').style.display = 'block';
        document.getElementById('admin-view').style.display = 'none';
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.client-only').forEach(el => el.style.display = 'block');
        renderUserAppointments();
    }
    renderMechanics();
}

// --- GESTIÓN DE CITAS (CLIENTE) ---
document.getElementById('reservation-form').onsubmit = function(e) {
    e.preventDefault();
    
    const nuevaCita = {
        id: Date.now(),
        nombre: document.getElementById('res-name').value,
        telefono: document.getElementById('res-phone').value,
        email: document.getElementById('res-email').value,
        fecha: document.getElementById('res-date').value,
        desc: document.getElementById('res-desc').value,
        vehiculo: currentUser.vehiculo || "No especificado",
        estado: "pendiente",
        userId: currentUser.email
    };

    appointments.push(nuevaCita);
    localStorage.setItem('appointments', JSON.stringify(appointments));
    
    showNotification("Cita enviada correctamente. El administrador la revisará.");
    this.reset();
    renderUserAppointments();
};

// --- PANEL DE ADMINISTRADOR (TABLA DE CITAS) ---
function renderAdminTable() {
    const tableBody = document.getElementById('admin-appointments-table');
    tableBody.innerHTML = '';

    appointments.forEach(cita => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cita.nombre}</td>
            <td style="color: #3498db; font-weight:bold;">${cita.vehiculo}</td>
            <td>${cita.telefono}<br><small>${cita.email}</small></td>
            <td>${cita.fecha}</td>
            <td>${cita.desc}</td>
            <td>
                <span class="status-${cita.estado}">
                    ${cita.estado === 'pendiente' ? 'PENDIENTE' : 
                      cita.estado === 'confirmada' ? 'CONFIRMADA' : 'RECHAZADA'}
                </span>
            </td>
            <td>
                ${cita.estado === 'pendiente' ? 
                    `<button onclick="confirmarCita(${cita.id})" class="btn-small btn-success">Confirmar</button>
                     <button onclick="rechazarCita(${cita.id})" class="btn-small btn-danger" style="margin-top:5px;">Rechazar</button>` : 
                    `<button onclick="eliminarCita(${cita.id})" class="btn-small btn-accent">Eliminar</button>`
                }
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// --- PANEL DE ADMINISTRADOR (TABLA DE USUARIOS) ---
function renderUsersTable() {
    const tableBody = document.getElementById('admin-users-table');
    tableBody.innerHTML = '';

    // Filtrar usuarios que no sean el admin
    const regularUsers = users.filter(u => u.email !== "admin@rnmotors.com");
    
    if (regularUsers.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px;">
                    No hay usuarios registrados.
                </td>
            </tr>
        `;
        return;
    }

    regularUsers.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                ${user.photo ? `<img src="${user.photo}" style="width:30px;height:30px;border-radius:50%;vertical-align:middle;margin-right:10px;">` : ''}
                ${user.username}
            </td>
            <td>${user.email}</td>
            <td>${user.vehiculo || 'No especificado'}</td>
            <td>${user.registrationDate || 'Desconocida'}</td>
            <td>
                <button onclick="eliminarUsuario('${user.email}')" class="btn-small btn-danger">Eliminar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function eliminarUsuario(email) {
    if (email === currentUser.email) {
        showNotification("No puedes eliminar tu propia cuenta.", true);
        return;
    }
    
    if (confirm(`¿Estás seguro de eliminar al usuario con correo: ${email}?`)) {
        // Eliminar citas del usuario
        appointments = appointments.filter(a => a.userId !== email);
        
        // Eliminar usuario
        users = users.filter(u => u.email !== email);
        
        // Actualizar localStorage
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('appointments', JSON.stringify(appointments));
        
        // Actualizar tablas
        renderUsersTable();
        renderAdminTable();
        
        showNotification("Usuario eliminado correctamente.");
    }
}

function confirmarCita(id) {
    if(confirm("¿Confirmar esta cita?")) {
        const citaIndex = appointments.findIndex(a => a.id === id);
        if (citaIndex !== -1) {
            appointments[citaIndex].estado = "confirmada";
            localStorage.setItem('appointments', JSON.stringify(appointments));
            renderAdminTable();
            showNotification("Cita confirmada correctamente.");
        }
    }
}

function rechazarCita(id) {
    if(confirm("¿Rechazar esta cita?")) {
        const citaIndex = appointments.findIndex(a => a.id === id);
        if (citaIndex !== -1) {
            appointments[citaIndex].estado = "rechazada";
            localStorage.setItem('appointments', JSON.stringify(appointments));
            renderAdminTable();
            showNotification("Cita rechazada correctamente.");
        }
    }
}

function eliminarCita(id) {
    if(confirm("¿Eliminar esta cita?")) {
        appointments = appointments.filter(a => a.id !== id);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        renderAdminTable();
        renderUserAppointments();
        showNotification("Cita eliminada correctamente.");
    }
}

// --- CITAS DEL USUARIO ---
function renderUserAppointments() {
    const tableBody = document.getElementById('user-appointments-list');
    tableBody.innerHTML = '';

    const userAppointments = appointments.filter(a => a.userId === currentUser.email);
    
    if (userAppointments.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px;">
                    No tienes citas agendadas aún.
                </td>
            </tr>
        `;
        return;
    }

    userAppointments.forEach(cita => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cita.fecha}</td>
            <td style="color: #3498db; font-weight:bold;">${cita.vehiculo}</td>
            <td>${cita.desc}</td>
            <td>
                <span class="status-${cita.estado}">
                    ${cita.estado === 'pendiente' ? 'PENDIENTE' : 
                      cita.estado === 'confirmada' ? 'CONFIRMADA' : 'RECHAZADA'}
                </span>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// --- GESTIÓN DE MECÁNICOS (SIDEBAR) - CORREGIDO ---
function renderMechanics() {
    const container = document.getElementById('mechanics-list');
    container.innerHTML = '';

    if (mechanics.length === 0) {
        container.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #777;">
                <i class="fas fa-users" style="font-size: 2rem; margin-bottom: 10px;"></i>
                <p>No hay mecánicos registrados.</p>
            </div>
        `;
        return;
    }

    mechanics.forEach(m => {
        const card = document.createElement('div');
        card.className = 'mech-card';
        card.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <img src="${m.photo}" class="mech-photo-img" onerror="this.src='https://via.placeholder.com/60'">
                <div>
                    <strong>${m.name}</strong><br>
                    <small>${m.age} años</small>
                </div>
            </div>
            <div class="stars-display">${"★".repeat(Math.round(m.rating))}${"☆".repeat(5-Math.round(m.rating))} (${m.rating.toFixed(1)})</div>
            
            <div class="reviews-section">
                <strong>Reseñas:</strong>
                ${m.reviews.length === 0 ? '<p style="font-size:0.7rem;">Sin reseñas aún.</p>' : m.reviews.map(r => `
                    <div class="review-item">
                        <strong>${r.user}</strong> <small>(${r.date})</small><br>${r.text}
                    </div>
                `).join('')}
            </div>

            <div style="margin-top:10px;">
                ${isAdmin ? 
                    `<button onclick="eliminarMecanico(${m.id})" class="btn-small btn-accent">Borrar Mecánico</button>` : 
                    `<button onclick="calificarMecanico(${m.id})" class="btn-small">Dejar Reseña</button>`
                }
            </div>
        `;
        container.appendChild(card);
    });
}

// --- FUNCIÓN PARA AÑADIR MECÁNICO - CORREGIDA ---
function addNewMechanic() {
    const nombre = document.getElementById('new-mech-name').value.trim();
    const edad = document.getElementById('new-mech-age').value;
    const fotoFile = document.getElementById('new-mech-photo').files[0];

    if (!nombre) {
        showNotification("Por favor, ingresa el nombre del mecánico.", true);
        document.getElementById('new-mech-name').focus();
        return;
    }

    if (!edad || edad <= 0 || edad > 100) {
        showNotification("Por favor, ingresa una edad válida (1-100).", true);
        document.getElementById('new-mech-age').focus();
        return;
    }

    const procesarGuardado = (fotoUrl) => {
        const nuevoM = {
            id: Date.now(),
            name: nombre,
            age: parseInt(edad),
            photo: fotoUrl,
            rating: 5,
            voters: 1,
            totalPoints: 5,
            reviews: []
        };
        mechanics.push(nuevoM);
        localStorage.setItem('mechanics', JSON.stringify(mechanics));
        renderMechanics();
        
        // Limpiar formulario
        document.getElementById('new-mech-name').value = '';
        document.getElementById('new-mech-age').value = '';
        document.getElementById('new-mech-photo').value = '';
        
        showNotification(`Mecánico "${nombre}" agregado correctamente.`);
    };

    if (fotoFile) {
        // Validar tipo de archivo
        if (!fotoFile.type.match('image.*')) {
            showNotification("Por favor, selecciona un archivo de imagen válido.", true);
            return;
        }
        
        // Validar tamaño (máximo 5MB)
        if (fotoFile.size > 5 * 1024 * 1024) {
            showNotification("La imagen es demasiado grande. Máximo 5MB.", true);
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => procesarGuardado(e.target.result);
        reader.readAsDataURL(fotoFile);
    } else {
        // Si no se selecciona foto, usar placeholder
        procesarGuardado("https://via.placeholder.com/60");
    }
}

function eliminarMecanico(id) {
    const mecanico = mechanics.find(m => m.id === id);
    if (!mecanico) return;
    
    if(confirm(`¿Estás seguro de eliminar al mecánico "${mecanico.name}"?`)) {
        mechanics = mechanics.filter(m => m.id !== id);
        localStorage.setItem('mechanics', JSON.stringify(mechanics));
        renderMechanics();
        showNotification(`Mecánico "${mecanico.name}" eliminado correctamente.`);
    }
}

function calificarMecanico(id) {
    currentMechanicId = id;
    
    if (!document.getElementById('review-modal')) {
        const modalHTML = `
            <div id="review-modal" class="review-modal">
                <div class="review-modal-content">
                    <h3>Dejar Reseña</h3>
                    <p>Califica al mecánico:</p>
                    <div class="stars-rating" id="stars-container">
                        <span class="star" data-rating="1">☆</span>
                        <span class="star" data-rating="2">☆</span>
                        <span class="star" data-rating="3">☆</span>
                        <span class="star" data-rating="4">☆</span>
                        <span class="star" data-rating="5">☆</span>
                    </div>
                    <div id="rating-text" style="margin: 10px 0; color: #f1c40f; font-weight: bold;">Selecciona estrellas</div>
                    <textarea id="review-comment" placeholder="Escribe tu comentario aquí..." rows="4" style="width:100%; padding:10px; margin:15px 0; border-radius:6px;"></textarea>
                    <div style="display:flex; gap:10px; justify-content:center;">
                        <button onclick="submitReview()" class="btn btn-success">Enviar Reseña</button>
                        <button onclick="closeReviewModal()" class="btn btn-accent">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const stars = document.querySelectorAll('.star');
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = parseInt(this.dataset.rating);
                stars.forEach((s, index) => {
                    if (index < rating) {
                        s.classList.add('active');
                        s.textContent = '★';
                    } else {
                        s.classList.remove('active');
                        s.textContent = '☆';
                    }
                });
                document.getElementById('rating-text').textContent = `${rating} estrellas seleccionadas`;
            });
        });
    }
    
    document.getElementById('review-modal').classList.add('active');
}

function closeReviewModal() {
    if (document.getElementById('review-modal')) {
        document.getElementById('review-modal').classList.remove('active');
        const stars = document.querySelectorAll('.star');
        stars.forEach(star => {
            star.classList.remove('active');
            star.textContent = '☆';
        });
        document.getElementById('review-comment').value = '';
        document.getElementById('rating-text').textContent = 'Selecciona estrellas';
    }
}

function submitReview() {
    const m = mechanics.find(m => m.id === currentMechanicId);
    const stars = document.querySelectorAll('.star.active');
    const puntos = stars.length;
    const reseña = document.getElementById('review-comment').value.trim();
    
    if (puntos < 1 || puntos > 5) {
        showNotification("Por favor, selecciona entre 1 y 5 estrellas.", true);
        return;
    }
    
    if (!reseña) {
        showNotification("Por favor, escribe un comentario.", true);
        return;
    }
    
    if (reseña.length < 10) {
        showNotification("El comentario debe tener al menos 10 caracteres.", true);
        return;
    }
    
    m.voters++;
    m.totalPoints += puntos;
    m.rating = m.totalPoints / m.voters;
    m.reviews.push({
        user: currentUser.username,
        date: new Date().toLocaleDateString(),
        text: reseña
    });
    localStorage.setItem('mechanics', JSON.stringify(mechanics));
    renderMechanics();
    closeReviewModal();
    showNotification("Reseña enviada correctamente.");
}

// --- UTILIDADES ---
// Sidebar
document.getElementById('open-sidebar').onclick = () => sidebar.style.width = "350px";
document.getElementById('close-sidebar').onclick = () => sidebar.style.width = "0";

// Modo Oscuro
document.getElementById('dark-mode-toggle').onclick = function() {
    document.body.classList.toggle('dark-mode');
    this.textContent = document.body.classList.contains('dark-mode') ? "☀️" : "🌙";
};

// Salir
document.getElementById('logout-btn').onclick = () => location.reload();

// Cerrar modales al hacer clic fuera
window.onclick = function(event) {
    if (event.target === notificationModal) {
        closeNotification();
    }
    if (event.target === profileModal) {
        closeProfileModal();
    }
    if (event.target === document.getElementById('review-modal')) {
        closeReviewModal();
    }
};

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos existentes
    users = JSON.parse(localStorage.getItem('users')) || [];
    appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    mechanics = JSON.parse(localStorage.getItem('mechanics')) || [
        { 
            id: 1, 
            name: "Roberto Silva", 
            age: 42, 
            photo: "https://via.placeholder.com/60", 
            rating: 5, 
            voters: 1, 
            totalPoints: 5, 
            reviews: [] 
        }
    ];
});