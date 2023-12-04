const { createApp } = Vue;

createApp({
    data() {
        return {
            productos: [],
            url: 'http://127.0.0.1:5000/productos',
            error: false,
            cargando: true,
            id: 0,
            nombre_producto: '',
            descripcion_producto: '',
            categoria: '',
            proveedor: '',
            cantidad: 0,
            precio_unitario: 0.0,
        };
    },
    methods: {
        fetchData(url) {
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    this.productos = data;
                    this.cargando = false;
                })
                .catch(err => {
                    console.error(err);
                    this.error = true;
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
                    this.eliminarProducto(id);
                    };
                });
            },
            eliminarProducto(id) {
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
                                title: "El producto ha sido eliminado",
                                showConfirmButton: false,
                                timer: 1500
                            }).then(() => {
                                window.location.href = "./productos.html"
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
        grabar() {
            let producto = {
                nombre_producto: this.nombre_producto,
                descripcion_producto: this.descripcion_producto,
                categoria: this.categoria,
                proveedor: this.proveedor,
                cantidad: this.cantidad,
                precio_unitario: this.precio_unitario,
            };

            let options = {
                method: 'POST',
                body: JSON.stringify(producto),
                headers: { 'Content-Type': 'application/json' },
                redirect: 'follow',
            };

            fetch(this.url, options)
                .then(response => response.json())
                .then(() => {
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "El producto se ha registrado con éxito",
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        // Utilizar el enrutamiento de Vue.js para cambiar de página
                        window.location.href = "./productos.html"
                    });
                })
                .catch(err => {
                    console.error(err);
                    Swal.fire({
                        icon: "error",
                        title: "Error al registrar el producto",
                        text: "Por favor, inténtelo de nuevo."
                    });
                });
        },
    },
    created() {
        this.fetchData(this.url);
    }
}).mount('#app');
