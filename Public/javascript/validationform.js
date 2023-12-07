document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("contactForm");
    const nombreInput = document.getElementById("nombre");
    const apellidoInput = document.getElementById("apellido");
    const emailInput = document.getElementById("emailContacto");
    const telefonoInput = document.getElementById("telefono");
    const mensajeInput = document.getElementById("mensaje");
    const nombreError = document.getElementById("nombre-error");
    const apellidoError = document.getElementById("apellido-error");
    const emailError = document.getElementById("email-error");
    const telefonoError = document.getElementById("telefono-error");
    const mensajeError = document.getElementById("mensaje-error");

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        let isValid = true;

        nombreError.textContent = "";
        apellidoError.textContent = "";
        emailError.textContent = "";
        telefonoError.textContent = "";
        mensajeError.textContent = "";

        if (nombreInput.value.trim() === "") {
            nombreError.textContent = "El nombre es obligatorio.";
            isValid = false;
        } else if (!isValidName(nombreInput.value)) {
            nombreError.textContent = "Nombre no válido. Solo letras y espacios permitidos.";
            isValid = false;
        }

        if (apellidoInput.value.trim() === "") {
            apellidoError.textContent = "El apellido es obligatorio.";
            isValid = false;
        } else if (!isValidName(apellidoInput.value)) {
            apellidoError.textContent = "Apellido no válido. Solo letras y espacios permitidos.";
            isValid = false;
        }

        if (emailInput.value.trim() === "") {
            emailError.textContent = "El correo electrónico es obligatorio.";
            isValid = false;
        } else if (!isValidEmail(emailInput.value)) {
            emailError.textContent = "El correo electrónico no es válido.";
            isValid = false;
        }

        if (telefonoInput.value.trim() === "") {
            telefonoError.textContent = "El número de teléfono es obligatorio.";
            isValid = false;
        } else if (!isValidPhone(telefonoInput.value)) {
            telefonoError.textContent = "Número de teléfono sin ceros y con codigo de area.";
            isValid = false;
        }

        if (mensajeInput.value.trim() === "") {
            mensajeError.textContent = "El mensaje es obligatorio.";
            isValid = false;
        }

        if (isValid === true) {
            
            const popup = document.getElementById("popup");
            popup.style.display = "block";


            const closePopupButton = document.getElementById("closePopup");
            closePopupButton.addEventListener("click", function () {
                popup.style.display = "none";
                

                fetch("https://formsubmit.co/ajax/consultas.petcare@gmail.com", {
                    method: "POST",
                    body: new FormData(event.target)

                })
                .then(response => response.ok ? response.json() : Promise.reject(response))
                .then(json => {console.log(json) 
                form.submit()
            })
            .catch(error =>{
                console.log(error)
            })
            
            });
        }
    });

    function isValidEmail(email) {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        return emailPattern.test(email);
    }

    function isValidPhone(phone) {
        const phonePattern = /[0-9]/;
        return phonePattern.test(phone);
    }

    function isValidName(name) {
        const namePattern = /^[A-Za-z\s]+$/;
        return namePattern.test(name);
    }
});





