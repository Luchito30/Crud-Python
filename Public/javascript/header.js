// Leer la información de sesión
const rol_id = sessionStorage.getItem('rol_id');
const user = sessionStorage.getItem('user');

function actualizarHora() {
    const horaElemento = document.getElementById("horaActual");
    horaElemento.textContent = obtenerFechaHoraActual();
}

function obtenerFechaHoraActual() {
    const fechaHora = new Date();
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'};
    return fechaHora.toLocaleDateString('es-ES', opciones);
}

// Actualizar la hora cada segundo
setInterval(actualizarHora, 1000);

// Función para cerrar sesión
function salir() {
    // Limpiar la información de la sesión
    sessionStorage.removeItem('user');
}

// Construir el header con Bootstrap
document.getElementById("header").innerHTML = `
<nav class="navbar navbar-expand-sm navbar-light">
        <div class="container header__div">
            <div class="d-flex align-items-center justify-content-between w-100">
                <!-- Primera sección: Logo -->
                <div class="d-flex align-items-center">
                    <a class="navbar-brand" href="./bienvenida.html">
                        <img class="header__logo" src="../Public/Img/logo_petcare.png" alt="Logo">
                    </a>
                </div>

                <!-- Segunda sección: Menú de productos y turnos -->
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link header__menu" href="./productos.html" aria-current="page">PRODUCTOS <span class="visually-hidden">(current)</span></a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link header__menu" href="./turnos.html">TURNOS</a>
                    </li>
                </ul>

                <!-- Tercera sección: Hora, Usuario y Salir -->
                <div class="d-flex flex-column">
                    <span class="nav-link header__hora mb-3" id="horaActual">${obtenerFechaHoraActual()}</span>
                    <div class="d-flex flex-column">
                        <div class="nav-link d-flex gap-5 mb-3">
                            <span class="header__usartam">${user ? `Usuario: ${user}` : ''}</span>
                            <span class="header__usartam">${rol_id === "1" ? 'Tipo: Admin' : 'Tipo: Normal'}</span>
                        </div>
                        <a class="btn btn-outline-danger" href="./index.html" onclick="salir()">Salir</a>
                    </div>
                </div>
            </div>
        </div>
    </nav>
    `;

    console.log("el rol_id:" + rol_id)
    console.log("el user:" + user)