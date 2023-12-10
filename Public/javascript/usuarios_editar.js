console.log(location.search); // Lee los argumentos pasados a este formulario
const id = location.search.substr(4);
console.log(id);

const { createApp } = Vue;

createApp({
    data() {
        return {
            id: 0,
            usuario: "",
            clave: "",
            rol: "",
            confirmarClave: '',
            url: id ? `http://localhost:5000/usuarios/${id}` : '',
        };
    },
    methods: {
        fetchData(url) {
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    this.id = data.id;
                    this.usuario = data.usuario;
                    this.clave = ""; // Limpia la contraseña para evitar mostrarla en el formulario
                    this.rol = data.rol_id

                })
                .catch(err => {
                    console.error(err);
                    // Manejar el error, por ejemplo, mostrar un mensaje al usuario
                });
        },
        editarUsuario() {
            // Validar que las contraseñas coincidan
            if (this.clave !== this.confirmarClave) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Las contraseñas no coinciden.'
                });
                return;
            }
            // Validar que las contraseñas no estén vacías
            if (this.clave === '' || this.confirmarClave === '') {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Las contraseñas no pueden estar vacías.'
                });
                return;
            }
        
            const usuario = {
                usuario: this.usuario,
                clave: this.clave,
                rol: this.rol
            };

            const options = {
                body: JSON.stringify(usuario),
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                redirect: 'follow',
            };

            fetch(this.url, options)
                .then(response => {
                    if (response.ok) {
                        Swal.fire({
                            position: "center",
                            icon: "success",
                            title: "El usuario se ha modificado con éxito",
                            showConfirmButton: false,
                            timer: 1500,
                        }).then(() => {
                            window.location.href = "./usuarios.html";
                        });
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "Error al modificar el usuario",
                            text: "Por favor, inténtelo de nuevo."
                        });
                    }
                })
                .catch(err => {
                    console.error(err);
                    Swal.fire({
                        icon: "error",
                        title: "Error al modificar el usuario",
                        text: "Por favor, inténtelo de nuevo."
                    });
                });
        },
    },
    created() {
        // Llama a la función fetchData al crear el componente para cargar los datos actuales del turno
        this.fetchData(this.url);
    },
}).mount('#app');
