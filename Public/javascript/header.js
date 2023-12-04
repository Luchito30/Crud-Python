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
                        <a class="nav-link header__menu" href="../../templates/productos.html" aria-current="page">PRODUCTOS <span class="visually-hidden">(current)</span></a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link header__menu" href="../../templates/turnos.html">TURNOS</a>
                    </li>
                </ul>
                <form class="d-flex my-2 my-lg-0 header__form">
                    <input class="form-control me-sm-2" type="text" placeholder="Buscar...">
                    <button class="btn btn-outline-light my-2 my-sm-0" type="submit">Buscar</button>
                </form>
            </div>
        </div>
    </nav>
`;
