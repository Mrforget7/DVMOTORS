/* script.js - Versión para GitHub Pages */

// --- ALMACENAMIENTO EN LA NUBE SIMULADO ---
let currentUser = null;
let isAdmin = false;
let currentMechanicId = null;

// Cargar datos iniciales
function loadCloudData() {
    return {
        users: JSON.parse(localStorage.getItem('dvmotors_users')) || getDefaultUsers(),
        appointments: JSON.parse(localStorage.getItem('dvmotors_appointments')) || [],
        mechanics: JSON.parse(localStorage.getItem('dvmotors_mechanics')) || getDefaultMechanics()
    };
}

function saveCloudData(data) {
    localStorage.setItem('dvmotors_users', JSON.stringify(data.users || []));
    localStorage.setItem('dvmotors_appointments', JSON.stringify(data.appointments || []));
    localStorage.setItem('dvmotors_mechanics', JSON.stringify(data.mechanics || getDefaultMechanics()));
}

function getDefaultUsers() {
    return [
        {
            username: "Cliente Demo",
            email: "cliente@demo.com",
            pass: "demo123",
            vehiculo: "Toyota Corolla 2020",
            photo: null,
            registrationDate: new Date().toLocaleDateString()
        }
    ];
}

function getDefaultMechanics() {
    return [
        { 
            id: 1, 
            name: "Roberto Silva", 
            age: 42, 
            photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", 
            rating: 4.8, 
            voters: 24, 
            totalPoints: 115, 
            reviews: [
                { user: "María García", date: "2025-01-15", text: "Excelente servicio, muy profesional." },
                { user: "Carlos López", date: "2025-01-10", text: "Resolvió mi problema rápidamente." }
            ] 
        },
        { 
            id: 2, 
            name: "Ana Martínez", 
            age: 35, 
            photo: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", 
            rating: 4.9, 
            voters: 18, 
            totalPoints: 88, 
            reviews: [
                { user: "Juan Pérez", date: "2025-01-12", text: "Muy detallista y cuidadosa con el vehículo." }
            ] 
        }
    ];
}

// --- ELEMENTOS DEL DOM ---
const authModal = document.getElementById('auth-modal');
const mainWrapper = document.getElementById('main-content-wrapper');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const sidebar = document.getElementById('sidebar');
const notificationModal = document.getElementById('notification-modal');
const notificationMessage = document.getElementById('notification-message');
const profileModal = document.getElementById('profile-modal');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const closeMobileMenuBtn = document.getElementById('close-mobile-menu');

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
    
    document.getElementById('profile-username').value = currentUser.username || '';
    document.getElementById('profile-vehiculo').value = currentUser.vehiculo || '';
    document.getElementById('profile-email-display').textContent = currentUser.email;
    
    const profilePhoto = document.getElementById('profile-current-photo');
    const avatarPhoto = document.getElementById('user-avatar-img');
    
    if (currentUser.photo) {
        profilePhoto.src = currentUser.photo;
        avatarPhoto.src = currentUser.photo;
    } else {
        profilePhoto.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.username || 'Usuario') + '&background=3f51b5&color=fff&size=120';
        avatarPhoto.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.username || 'Usuario') + '&background=3f51b5&color=fff&size=40';
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
                
                // Guardar en la nube
                const data = loadCloudData();
                const userIndex = data.users.findIndex(u => u.email === currentUser.email);
                if (userIndex !== -1) {
                    data.users[userIndex].photo = e.target.result;
                    saveCloudData(data);
                }
                
                updateAvatar();
                showNotification("Foto actualizada correctamente.");
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
    const newVehiculo = document.getElementById('profile-vehiculo').value;
    
    if (!newUsername) {
        showNotification("El nombre de usuario es obligatorio.", true);
        return;
    }
    
    // Actualizar en la nube
    const data = loadCloudData();
    const userIndex = data.users.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        data.users[userIndex].username = newUsername;
        data.users[userIndex].vehiculo = newVehiculo;
        
        if (currentUser.photo) {
            data.users[userIndex].photo = currentUser.photo;
        }
        
        saveCloudData(data);
        
        // Actualizar usuario actual
        currentUser = data.users[userIndex];
        
        // Actualizar información en el header
        document.getElementById('display-user-name').textContent = currentUser.username;
        updateAvatar();
        
        showNotification("Perfil actualizado correctamente.");
        closeProfileModal();
    }
}

function updateAvatar() {
    const avatarImg = document.getElementById('user-avatar-img');
    if (currentUser && currentUser.photo) {
        avatarImg.src = currentUser.photo;
    } else if (currentUser && currentUser.username) {
        avatarImg.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.username) + '&background=3f51b5&color=fff&size=40';
    } else {
        avatarImg.src = 'https://ui-avatars.com/api/?name=Usuario&background=3f51b5&color=fff&size=40';
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
        email: document.getElementById('reg-email').value.toLowerCase(),
        pass: document.getElementById('reg-password').value,
        photo: null,
        registrationDate: new Date().toLocaleDateString()
    };

    // Verificar si el email ya existe
    const data = loadCloudData();
    if (data.users.some(u => u.email === newUser.email)) {
        showNotification("Este correo electrónico ya está registrado.", true);
        return;
    }

    data.users.push(newUser);
    saveCloudData(data);

    showNotification("¡Registro exitoso! Por favor, inicia sesión.");
    
    registerForm.reset();
    document.querySelector('[data-content="login-content"]').click();
};

// --- SISTEMA DE LOGIN ---
loginForm.onsubmit = function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.toLowerCase();
    const pass = document.getElementById('login-password').value;

    if (email === "admin@dvmotors.com" && pass === "admin123") {
        isAdmin = true;
        currentUser = { 
            username: "Administrador", 
            email: email,
            vehiculo: "Administración",
            photo: null
        };
        abrirApp();
    } else {
        const data = loadCloudData();
        const userFound = data.users.find(u => u.email === email && u.pass === pass);
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
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'block';
            if (el.classList.contains('mobile-menu-item')) {
                el.style.display = 'flex';
            }
        });
        document.querySelectorAll('.client-only').forEach(el => el.style.display = 'none');
        renderAdminTable();
        renderUsersTable();
        updateAdminStats();
    } else {
        document.getElementById('client-view').style.display = 'block';
        document.getElementById('admin-view').style.display = 'none';
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.client-only').forEach(el => {
            el.style.display = 'block';
            if (el.classList.contains('mobile-menu-item')) {
                el.style.display = 'flex';
            }
        });
        renderUserAppointments();
    }
    renderMechanics();
    closeMobileMenu();
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
        userId: currentUser.email,
        fechaSolicitud: new Date().toISOString()
    };

    const data = loadCloudData();
    data.appointments.push(nuevaCita);
    saveCloudData(data);
    
    showNotification("Cita enviada correctamente. El administrador la revisará.");
    this.reset();
    renderUserAppointments();
    if (isAdmin) {
        updateAdminStats();
    }
};

// --- ESTADÍSTICAS PARA ADMIN ---
function updateAdminStats() {
    const data = loadCloudData();
    const pending = data.appointments.filter(a => a.estado === "pendiente").length;
    const confirmed = data.appointments.filter(a => a.estado === "confirmada").length;
    const rejected = data.appointments.filter(a => a.estado === "rechazada").length;
    const total = data.appointments.length;
    
    document.getElementById('pending-count').textContent = pending;
    document.getElementById('confirmed-count').textContent = confirmed;
    document.getElementById('rejected-count').textContent = rejected;
    document.getElementById('total-count').textContent = total;
}

// --- PANEL DE ADMINISTRADOR (TABLA DE CITAS) ---
function renderAdminTable() {
    const tableBody = document.getElementById('admin-appointments-table');
    tableBody.innerHTML = '';

    const data = loadCloudData();
    
    if (data.appointments.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    <div style="color: #777; font-size: 1.1rem;">
                        <i class="fas fa-calendar-times" style="font-size: 3rem; margin-bottom: 15px;"></i>
                        <p>No hay citas registradas.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    // Ordenar por fecha más reciente
    data.appointments.sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud));

    data.appointments.forEach(cita => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-user-circle" style="color: #3f51b5;"></i>
                    <div>
                        <strong>${cita.nombre}</strong>
                    </div>
                </div>
            </td>
            <td style="color: #3f51b5; font-weight:bold;">
                <i class="fas fa-car" style="margin-right: 5px;"></i>
                ${cita.vehiculo}
            </td>
            <td>
                <div>
                    <i class="fas fa-phone" style="margin-right: 5px;"></i> ${cita.telefono}<br>
                    <small><i class="fas fa-envelope" style="margin-right: 5px;"></i> ${cita.email}</small>
                </div>
            </td>
            <td>
                <i class="fas fa-calendar-alt" style="margin-right: 5px;"></i>
                ${cita.fecha}
            </td>
            <td>${cita.desc}</td>
            <td>
                <span class="status-${cita.estado}">
                    ${cita.estado === 'pendiente' ? '<i class="fas fa-clock"></i> PENDIENTE' : 
                      cita.estado === 'confirmada' ? '<i class="fas fa-check-circle"></i> CONFIRMADA' : 
                      '<i class="fas fa-times-circle"></i> RECHAZADA'}
                </span>
            </td>
            <td>
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    ${cita.estado === 'pendiente' ? 
                        `<button onclick="confirmarCita(${cita.id})" class="btn-small btn-success">
                            <i class="fas fa-check"></i> Confirmar
                        </button>
                        <button onclick="rechazarCita(${cita.id})" class="btn-small btn-danger">
                            <i class="fas fa-times"></i> Rechazar
                        </button>` : 
                        `<button onclick="eliminarCita(${cita.id})" class="btn-small btn-accent">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>`
                    }
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// --- PANEL DE ADMINISTRADOR (TABLA DE USUARIOS) ---
function renderUsersTable() {
    const tableBody = document.getElementById('admin-users-table');
    tableBody.innerHTML = '';

    const data = loadCloudData();
    
    // Filtrar usuarios que no sean el admin
    const regularUsers = data.users.filter(u => u.email !== "admin@dvmotors.com");
    
    if (regularUsers.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px;">
                    <div style="color: #777; font-size: 1.1rem;">
                        <i class="fas fa-user-friends" style="font-size: 3rem; margin-bottom: 15px;"></i>
                        <p>No hay usuarios registrados.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    regularUsers.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    ${user.photo ? `<img src="${user.photo}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">` : 
                      '<i class="fas fa-user-circle" style="font-size: 1.5rem; color: #3f51b5;"></i>'}
                    <div>
                        <strong>${user.username}</strong>
                    </div>
                </div>
            </td>
            <td>
                <i class="fas fa-envelope" style="margin-right: 5px; color: #777;"></i>
                ${user.email}
            </td>
            <td>
                ${user.vehiculo ? `<i class="fas fa-car" style="margin-right: 5px;"></i> ${user.vehiculo}` : 
                  '<span style="color: #777;">No especificado</span>'}
            </td>
            <td>
                <i class="fas fa-calendar" style="margin-right: 5px; color: #777;"></i>
                ${user.registrationDate || 'Desconocida'}
            </td>
            <td>
                <button onclick="eliminarUsuario('${user.email}')" class="btn-small btn-danger">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
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
        const data = loadCloudData();
        
        // Eliminar citas del usuario
        data.appointments = data.appointments.filter(a => a.userId !== email);
        
        // Eliminar usuario
        data.users = data.users.filter(u => u.email !== email);
        
        // Guardar en la nube
        saveCloudData(data);
        
        // Actualizar tablas
        renderUsersTable();
        renderAdminTable();
        updateAdminStats();
        
        showNotification("Usuario eliminado correctamente.");
    }
}

function confirmarCita(id) {
    if(confirm("¿Confirmar esta cita?")) {
        const data = loadCloudData();
        const citaIndex = data.appointments.findIndex(a => a.id === id);
        if (citaIndex !== -1) {
            data.appointments[citaIndex].estado = "confirmada";
            saveCloudData(data);
            renderAdminTable();
            updateAdminStats();
            showNotification("Cita confirmada correctamente.");
        }
    }
}

function rechazarCita(id) {
    if(confirm("¿Rechazar esta cita?")) {
        const data = loadCloudData();
        const citaIndex = data.appointments.findIndex(a => a.id === id);
        if (citaIndex !== -1) {
            data.appointments[citaIndex].estado = "rechazada";
            saveCloudData(data);
            renderAdminTable();
            updateAdminStats();
            showNotification("Cita rechazada correctamente.");
        }
    }
}

function eliminarCita(id) {
    if(confirm("¿Eliminar esta cita?")) {
        const data = loadCloudData();
        data.appointments = data.appointments.filter(a => a.id !== id);
        saveCloudData(data);
        renderAdminTable();
        renderUserAppointments();
        updateAdminStats();
        showNotification("Cita eliminada correctamente.");
    }
}

// --- CITAS DEL USUARIO ---
function renderUserAppointments() {
    const tableBody = document.getElementById('user-appointments-list');
    tableBody.innerHTML = '';

    const data = loadCloudData();
    const userAppointments = data.appointments.filter(a => a.userId === currentUser.email);
    
    if (userAppointments.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 40px;">
                    <div style="color: #777; font-size: 1.1rem;">
                        <i class="fas fa-calendar-plus" style="font-size: 3rem; margin-bottom: 15px;"></i>
                        <p>No tienes citas agendadas aún.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    // Ordenar por fecha más reciente
    userAppointments.sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud));

    userAppointments.forEach(cita => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <i class="fas fa-calendar-alt" style="margin-right: 5px; color: #777;"></i>
                ${cita.fecha}
            </td>
            <td style="color: #3f51b5; font-weight:bold;">
                <i class="fas fa-car" style="margin-right: 5px;"></i>
                ${cita.vehiculo}
            </td>
            <td>${cita.desc}</td>
            <td>
                <span class="status-${cita.estado}">
                    ${cita.estado === 'pendiente' ? '<i class="fas fa-clock"></i> PENDIENTE' : 
                      cita.estado === 'confirmada' ? '<i class="fas fa-check-circle"></i> CONFIRMADA' : 
                      '<i class="fas fa-times-circle"></i> RECHAZADA'}
                </span>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// --- GESTIÓN DE MECÁNICOS (SIDEBAR) - MEJORADO ESTILO UBER ---
function renderMechanics() {
    const container = document.getElementById('mechanics-list');
    container.innerHTML = '';

    const data = loadCloudData();
    
    if (data.mechanics.length === 0) {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #777;">
                <i class="fas fa-users" style="font-size: 3rem; margin-bottom: 15px; color: #ccc;"></i>
                <p style="font-size: 1.1rem;">No hay mecánicos registrados.</p>
            </div>
        `;
        return;
    }

    data.mechanics.forEach(m => {
        const card = document.createElement('div');
        card.className = 'mech-card';
        card.innerHTML = `
            <div class="mech-card-header">
                <img src="${m.photo}" class="mech-photo-img" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=ff5722&color=fff&size=70'">
                <div class="mech-info">
                    <h4>${m.name}</h4>
                    <p><i class="fas fa-birthday-cake"></i> ${m.age} años</p>
                    <div class="stars-display">
                        ${"★".repeat(Math.floor(m.rating))}${"☆".repeat(5-Math.floor(m.rating))} 
                        <span class="rating-number">${m.rating.toFixed(1)} (${m.voters})</span>
                    </div>
                </div>
            </div>
            
            <div class="reviews-section">
                <h5 style="margin-bottom: 10px; color: var(--uber-text);">
                    <i class="fas fa-comments"></i> Reseñas
                </h5>
                ${m.reviews.length === 0 ? 
                    '<p style="font-size:0.9rem; color: #777; text-align: center; padding: 10px;">Sin reseñas aún.</p>' : 
                    m.reviews.slice(-2).map(r => `
                        <div class="review-item">
                            <div class="review-header">
                                <span class="review-user">${r.user}</span>
                                <span class="review-date">${r.date}</span>
                            </div>
                            <div class="review-text">${r.text}</div>
                        </div>
                    `).join('')
                }
            </div>

            <div style="margin-top: 15px; display: flex; justify-content: center;">
                ${isAdmin ? 
                    `<button onclick="eliminarMecanico(${m.id})" class="btn-small btn-danger">
                        <i class="fas fa-trash"></i> Eliminar Mecánico
                    </button>` : 
                    `<button onclick="calificarMecanico(${m.id})" class="btn-small">
                        <i class="fas fa-star"></i> Dejar Reseña
                    </button>`
                }
            </div>
        `;
        container.appendChild(card);
    });
}

// --- FUNCIÓN PARA AÑADIR MECÁNICO ---
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
        const data = loadCloudData();
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
        data.mechanics.push(nuevoM);
        saveCloudData(data);
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
        // Si no se selecciona foto, usar placeholder con avatar
        procesarGuardado(`https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=ff5722&color=fff&size=70`);
    }
}

function eliminarMecanico(id) {
    const data = loadCloudData();
    const mecanico = data.mechanics.find(m => m.id === id);
    if (!mecanico) return;
    
    if(confirm(`¿Estás seguro de eliminar al mecánico "${mecanico.name}"?`)) {
        data.mechanics = data.mechanics.filter(m => m.id !== id);
        saveCloudData(data);
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
                    <h3><i class="fas fa-star"></i> Dejar Reseña</h3>
                    <p>Califica al mecánico:</p>
                    <div class="stars-rating" id="stars-container">
                        <span class="star" data-rating="1">☆</span>
                        <span class="star" data-rating="2">☆</span>
                        <span class="star" data-rating="3">☆</span>
                        <span class="star" data-rating="4">☆</span>
                        <span class="star" data-rating="5">☆</span>
                    </div>
                    <div id="rating-text" style="margin: 10px 0; color: #f1c40f; font-weight: bold;">
                        <i class="fas fa-star"></i> Selecciona estrellas
                    </div>
                    <textarea id="review-comment" placeholder="Escribe tu comentario aquí..." rows="4" style="width:100%; padding:15px; margin:15px 0; border-radius:8px; border:2px solid #ddd;"></textarea>
                    <div style="display:flex; gap:10px; justify-content:center;">
                        <button onclick="submitReview()" class="btn btn-success">
                            <i class="fas fa-paper-plane"></i> Enviar Reseña
                        </button>
                        <button onclick="closeReviewModal()" class="btn btn-accent">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
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
                document.getElementById('rating-text').innerHTML = `<i class="fas fa-star"></i> ${rating} estrellas seleccionadas`;
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
        document.getElementById('rating-text').innerHTML = '<i class="fas fa-star"></i> Selecciona estrellas';
    }
}

function submitReview() {
    const data = loadCloudData();
    const m = data.mechanics.find(m => m.id === currentMechanicId);
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
    
    saveCloudData(data);
    renderMechanics();
    closeReviewModal();
    showNotification("Reseña enviada correctamente.");
}

// --- MENÚ MÓVIL ---
function openMobileMenu() {
    mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    document.body.style.overflow = 'auto';
}

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', openMobileMenu);
}

if (closeMobileMenuBtn) {
    closeMobileMenuBtn.addEventListener('click', closeMobileMenu);
}

// --- UTILIDADES ---
// Sidebar
document.getElementById('open-sidebar').onclick = () => {
    sidebar.style.width = "350px";
    sidebar.style.boxShadow = "5px 0 20px rgba(0,0,0,0.3)";
};
document.getElementById('close-sidebar').onclick = () => sidebar.style.width = "0";

// Modo Oscuro
document.getElementById('dark-mode-toggle').onclick = function() {
    document.body.classList.toggle('dark-mode');
    this.innerHTML = document.body.classList.contains('dark-mode') ? "☀️" : "🌙";
};

// Salir
document.getElementById('logout-btn').onclick = () => {
    // Limpiar usuario actual
    currentUser = null;
    isAdmin = false;
    // Recargar la página
    location.reload();
};

// Cerrar modales al hacer clic fuera
window.onclick = function(event) {
    if (event.target === notificationModal) {
        closeNotification();
    }
    if (event.target === profileModal) {
        closeProfileModal();
    }
    if (document.getElementById('review-modal') && event.target === document.getElementById('review-modal')) {
        closeReviewModal();
    }
    if (event.target === sidebar) {
        sidebar.style.width = "0";
    }
    if (event.target === mobileMenu) {
        closeMobileMenu();
    }
};

// Suavizar scroll para anclas
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Cerrar menú móvil si está abierto
            closeMobileMenu();
        }
    });
});

// Validar fecha mínima en el formulario de citas
document.getElementById('res-date').min = new Date().toISOString().split('T')[0];

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar datos si es la primera vez
    const data = loadCloudData();
    if (data.users.length === 0) {
        saveCloudData(data);
    }
    
    // Configurar fecha mínima para hoy
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('res-date').min = today;
    
    console.log("DVMOTORS inicializado correctamente");
});
