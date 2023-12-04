console.log(location.search); // Lee los argumentos pasados a este formulario
const id = location.search.substr(4);
console.log(id);

const { createApp } = Vue;

createApp({
    data() {
        return {
            id: 0,
            nombre_producto: "",
            descripcion_producto: "",
            categoria: "",
            proveedor: "",
            cantidad: 0,
            precio_unitario: 0.0,
            url: id ? `http://localhost:5000/productos/${id}` : '',
        };
    },
    methods: {
        fetchData(url) {
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    this.id = data.id;
                    this.nombre_producto = data.nombre_producto;
                    this.descripcion_producto = data.descripcion_producto;
                    this.categoria = data.categoria;
                    this.proveedor = data.proveedor;
                    this.cantidad = data.cantidad;
                    this.precio_unitario = data.precio_unitario;
                })
                .catch(err => {
                    console.error(err);
                    this.error = true;
                });
        },
        modificar() {
            let producto = {
                nombre_producto: this.nombre_producto,
                descripcion_producto: this.descripcion_producto,
                categoria: this.categoria,
                proveedor: this.proveedor,
                cantidad: this.cantidad,
                precio_unitario: this.precio_unitario,
            };
            const options = {
                body: JSON.stringify(producto),
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                redirect: 'follow'
            };
            fetch(this.url, options)
                .then(response => {
                    if (response.ok) {
                        Swal.fire({
                            position: "center",
                            icon: "success",
                            title: "El producto se ha modificado con éxito",
                            showConfirmButton: false,
                            timer: 1500
                        }).then(() => {
                            window.location.href = "./productos.html";
                        });
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "Error al modificar el producto",
                            text: "Por favor, inténtelo de nuevo."
                        });
                    }
                })
                .catch(err => {
                    console.error(err);
                    Swal.fire({
                        icon: "error",
                        title: "Error al modificar el producto",
                        text: "Por favor, inténtelo de nuevo."
                    });
                });
        }
    },
    created() {
        this.fetchData(this.url);
    },
}).mount('#app');
