document.getElementById("header").innerHTML = `
    <nav class="navbar navbar-expand-sm navbar-light">
        <div class="container">
            <a class="navbar-brand" href="index.html"><img class="header__logo" src="../Public/Img/logo_petcare.png" alt="Logo"></a>
            <button class="navbar-toggler d-lg-none" type="button" data-bs-toggle="collapse" data-bs-target="#collapsibleNavId" aria-controls="collapsibleNavId"
                aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon">asd</span>
            </button>
            <div class="collapse navbar-collapse" id="collapsibleNavId">
                <ul class="navbar-nav me-auto mt-2 mt-lg-0">
                    <li class="nav-item">
                        <a class="nav-link header__menu" href="./productos.html" aria-current="page">PRODUCTOS <span class="visually-hidden">(current)</span></a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link header__menu" href="./turnos.html">TURNOS</a>
                    </li>
                </ul>
                <span class="nav-link header__hora" id="horaActual">${obtenerFechaHoraActual()}</span>
            </div>
        </div>
    </nav>
`;

function actualizarHora() {
    const horaElemento = document.getElementById("horaActual");
    horaElemento.textContent = obtenerFechaHoraActual();
}

// Actualizar la hora cada segundo
setInterval(actualizarHora, 1000);

function obtenerFechaHoraActual() {
    const fechaHora = new Date();
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'};
    return fechaHora.toLocaleDateString('es-ES', opciones);
}

