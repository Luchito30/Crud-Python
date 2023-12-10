const { createApp } = Vue;

createApp({
    data() {
        return {
            cargando: false,
            url: 'http://127.0.0.1:5000/usuarios',
            error: null,
            totalUsuarios: 0,
            totalAdministradores: 0,
            totalNormales: 0,
            usuarios: [],
            usuariosPaginados: [],
            currentPage: 1,
            itemsPerPage: 10,
            totalItems: 0,
            usuario: '',
            clave: '',
            confirmarClave: '',
            rol: 'Normal',
        };
    },
    computed: {
        totalPages() {
            return Math.ceil(this.totalUsuarios / this.itemsPerPage);
        },
        paginatedTurnos() {
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            return this.turnos.slice(startIndex, endIndex);
        },
        displayedPages() {
            const maxDisplayedPages = 5;
            const startPage = Math.max(1, this.currentPage - Math.floor(maxDisplayedPages / 2));
            const endPage = Math.min(this.totalPages, startPage + maxDisplayedPages - 1);

            const pages = [];
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
            return pages;
        },
    },
    methods: {
        async fetchData(url) {
            try {
                this.cargando = true;
                const response = await fetch(url);
                const data = await response.json();

                // Actualizar los datos
                this.usuarios = data;
                this.totalUsuarios = data.length;
                this.totalAdministradores = data.filter((usuario) => usuario.rol_id === 1).length;
                this.totalNormales = data.filter((usuario) => usuario.rol_id === 2).length;

                // Inicializar la lista de usuarios paginados
                this.actualizarUsuarios();
            } catch (error) {
                this.error = 'Error al cargar los usuarios';
                console.error('Error al cargar los usuarios:', error);
            } finally {
                this.cargando = false;
            }
        },
        actualizarUsuarios() {
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            this.usuariosPaginados = this.usuarios.slice(startIndex, endIndex);
        },
        changePage(page) {
            if (page < 1 || page > this.totalPages) return;
            this.currentPage = page;
            this.actualizarUsuarios();
        },
        crearUsuario() {
            // Validar que las contraseñas coincidan
            if (this.clave !== this.confirmarClave) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Las contraseñas no coinciden.'
                });
                return;
            }

            // Mapear el valor del rol a su correspondiente id
            const rolId = this.rol === 'Administrador' ? 1 : 2;

            const datosUsuario = {
                usuario: this.usuario,
                password: this.clave,
                rol_id: rolId,
            };

            let options = {
                method: 'POST',
                body: JSON.stringify(datosUsuario),
                headers: { 'Content-Type': 'application/json' },
                redirect: 'follow',
            };

            fetch(this.url, options)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error al registrar el Usuario: ${response.statusText}`);
                    }
                    if (response.status === 201) {
                        // Manejar la respuesta para el código 201 según tus necesidades
                        return response.json();
                    } else {
                        // Manejar la respuesta para otros códigos de estado
                        // Puedes decidir si necesitas realizar alguna acción específica
                        return response.json();
                    }
                })
                .then(() => {
                    // Utiliza SweetAlert en lugar de alert
                    Swal.fire({
                        position: "center",
                        icon: 'success',
                        title: 'Éxito',
                        text: 'Usuario creado exitosamente.',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        // Redirige o realiza otras acciones después de que el usuario ve el mensaje de éxito
                        window.location.href = './usuarios.html';
                    });
                })
                .catch(error => {
                    console.error('Error en la solicitud:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Hubo un error al crear el usuario.',
                        showConfirmButton: false,
                        timer: 1500
                    });
                });
        },
        eliminar(id) {
            Swal.fire({
                title: "¿Estás seguro?",
                text: "¡No podrás revertir esto!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Sí, eliminarlo"
            }).then((result) => {
                if (result.isConfirmed) {
                   // Si el usuario confirma, realiza la eliminación
                    this.eliminarUsuario(id);
                    };
                });
            },
            eliminarUsuario(id) {
                const url = `${this.url}/${id}`;
                const options = {
                    method: 'DELETE',
                };
                    fetch(url, options)
                        .then(response => response.json())
                        .then(response => {
                            Swal.fire({
                                position: "center",
                                icon: "success",
                                title: "El Usuario ha sido eliminado",
                                showConfirmButton: false,
                                timer: 1500
                            }).then(() => {
                                window.location.href = "./usuarios.html"
                            });
                        })
                        .catch(err => {
                            console.error(err);
                            Swal.fire({
                                icon: "error",
                                title: "Error al eliminar el producto",
                                text: "Por favor, inténtelo de nuevo."
                            });
                        });
                },   
    },
    created() {
        this.fetchData(`${this.url}?page=${this.currentPage}&per_page=${this.itemsPerPage}`);
    }
}).mount("#app");