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
            currentPage: 1,
            itemsPerPage: 10,
            totalItems: 0, 
        };
    },
    computed: {
        totalPages() {
            return Math.ceil(this.totalItems / this.itemsPerPage);
        },
        paginatedProductos() {
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            return this.productos.slice(startIndex, endIndex);
        },
        displayedPages() {
            // Lógica para mostrar un número limitado de páginas en el paginado (puedes ajustar esto)
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
        fetchData(url) {
            console.log('Fetching data from:', url);
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    this.totalItems = data.total_items;
                    this.productos = data.productos;
                    this.cargando = false;
                })
                .catch(err => {
                    console.error(err);
                    this.error = true;
                });
        },
        changePage(page) {
            console.log(`Changing to page ${page}`);
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
                this.fetchData(`${this.url}?page=${page}&per_page=${this.itemsPerPage}`);
            }
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
        this.fetchData(`${this.url}?page=${this.currentPage}&per_page=${this.itemsPerPage}`);
    }
}).mount('#app');