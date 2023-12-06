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
            order_by: 'id', // Nuevo campo para el criterio de orden
            order_dir: 'asc', // Nuevo campo para la dirección de orden
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
        productosOrdenadosPorCantidad() {
            return this.productos.slice().sort((a, b) => b.cantidad - a.cantidad);
        },
        productoConMayorCantidad() {
            if (this.productos.length > 0) {
                return this.productosOrdenadosPorCantidad[0];
            } else {
                return null;
            }
        },
        productosOrdenadosPorPrecio() {
            return this.productos.slice().sort((a, b) => b.precio_unitario - a.precio_unitario);
        },
        productoConMayorPrecio() {
            if (this.productos.length > 0) {
                return this.productosOrdenadosPorPrecio[0];
            } else {
                return null;
            }
        },
    },
    methods: {
        fetchData() {
            const fullUrl = `${this.url}?page=${this.currentPage}&per_page=${this.itemsPerPage}&order_by=${this.order_by}&order_dir=${this.order_dir}`;
        
            fetch(fullUrl)
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
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
                this.fetchData();
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
        encontrarProductoConMayorCantidad() {
            if (this.productos.length > 0) {
                // Ordena los productos por cantidad de forma descendente
                const productosOrdenados = this.productos.slice().sort((a, b) => b.cantidad - a.cantidad);
                // Toma el primer producto (con la mayor cantidad)
                this.productoConMayorCantidad = productosOrdenados[0];
                console.log('Producto con mayor cantidad:', this.productoConMayorCantidad);
            }
        },
        ordenarTabla(criterio) {
            // Cambia el orden actual al hacer clic
            this.order_by = criterio;
            this.order_dir = this.order_dir === 'asc' ? 'desc' : 'asc';
        
            // Realiza la ordenación directamente en la vista
            if (criterio === 'cantidad') {
                this.productos.sort((a, b) => (this.order_dir === 'asc' ? a.cantidad - b.cantidad : b.cantidad - a.cantidad));
            } else if (criterio === 'precio_unitario') {
                this.productos.sort((a, b) => (this.order_dir === 'asc' ? a.precio_unitario - b.precio_unitario : b.precio_unitario - a.precio_unitario));
            }
            this.fetchData();
        },
        
    },
    created() {
        this.fetchData();
    },
}).mount('#app');