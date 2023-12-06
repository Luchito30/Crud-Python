const { createApp } = Vue;

createApp({
    data() {
        return {
            turnos: [],
            url: 'http://127.0.0.1:5000/turnos',
            error: false,
            cargando: true,
            errorMessage: '',
            id: 0,
            fecha: new Date().toISOString().split('T')[0],  // Valor predeterminado para la fecha (hoy)
            hora: new Date().toTimeString().slice(0, 5),  // Valor predeterminado para la hora (hoy)
            paciente_nombre: '',
            especialidad: '',
            estado: 'Programado',  // Valor predeterminado para el estado
            notas: '',
            currentPage: 1,
            itemsPerPage: 10,
            totalItems: 0,
        };
    },
    computed: {
        totalPages() {
            return Math.ceil(this.totalItems / this.itemsPerPage);
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
        turnosPasados() {
            const today = new Date();

            // Filtrar los turnos pasados
            const turnosPasados = this.turnos.filter(turno => {
                const [turnoDia, turnoMes, turnoAnio] = turno.fecha.split('-');
                const turnoFechaHora = new Date(turnoAnio, turnoMes - 1, turnoDia, parseInt(turno.hora.split(':')[0]), parseInt(turno.hora.split(':')[1]));
                return turnoFechaHora < today;  // Comparar directamente con el objeto Date actual
            });

            // Formatear las fechas en el resultado al formato "día, mes y año"
            const turnosPasadosFormateados = turnosPasados.map(turno => {
                const [turnoDia, turnoMes, turnoAnio] = turno.fecha.split('-');
                return {
                    ...turno,
                    fecha: `${turnoDia}-${turnoMes}-${turnoAnio}`,
                    hora: this.formatTime(turno.hora),
                };
            });

            return turnosPasadosFormateados;
        },
        turnoProximo() {
            const today = new Date();
            const todayDateString = today.toISOString().split('T')[0];
            const todayTimeString = today.toTimeString().slice(0, 5);
        
            console.log('Today Date String:', todayDateString);
            console.log('Today Time String:', todayTimeString);
        
            console.log('Turnos:', this.turnos);
        
            // Convertir el objeto a un array de turnos
            const turnosArray = Object.values(this.turnos);
        
            // Filtrar los turnos futuros que aún no han ocurrido
            const turnosFuturos = turnosArray.filter(turno => {
                const [turnoDia, turnoMes, turnoAnio] = turno.fecha.split('-');
                const turnoFechaHora = new Date(turnoAnio, turnoMes - 1, turnoDia, parseInt(turno.hora.split(':')[0]), parseInt(turno.hora.split(':')[1]));
                return turnoFechaHora > today;  // Comparar directamente con el objeto Date actual
            });
        
            console.log('Turnos Futuros:', turnosFuturos);
        
            // Ordenar los turnos futuros por fecha y hora en orden ascendente
            const turnosOrdenados = turnosFuturos.map(turno => ({ ...turno }))
                .sort((a, b) => {
                    // Convertir las fechas a un formato numérico para facilitar la comparación
                    const fechaHoraA = parseInt(`${a.fecha.replace(/-/g, '')}${a.hora.replace(':', '')}`);
                    const fechaHoraB = parseInt(`${b.fecha.replace(/-/g, '')}${b.hora.replace(':', '')}`);
                    
                    return fechaHoraA - fechaHoraB;
                });
        
            console.log(turnosOrdenados);
        
            // Devolver el primer turno (el más próximo)
            return turnosOrdenados.length > 0 ? turnosOrdenados[0] : null;
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
                    this.totalItems = data.totalItems;
                    this.turnos = data.turnos.map(turno => ({
                        ...turno,
                        fecha: this.formatDate(turno.fecha),
                        hora: this.formatTime(turno.hora),
                    }));
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
        formatDate(dateString) {
            const date = new Date(dateString);
            const day = date.getDate() + 1;
            const month = date.getMonth() + 1;
            const year = date.getFullYear();

            // Agregar ceros principales si es necesario
            const formattedDay = day < 10 ? `0${day}` : day;
            const formattedMonth = month < 10 ? `0${month}` : month;

            return `${formattedDay}-${formattedMonth}-${year}`;
        },
        formatTime(timeString) {
            // Obtener solo las horas y los minutos
            const [hours, minutes] = timeString.split(':');

            // Formatear la hora y los minutos
            const formattedHours = hours.length === 1 ? `0${hours}` : hours;
            const formattedMinutes = minutes.length === 1 ? `0${minutes}` : minutes;

            return `${formattedHours}:${formattedMinutes}`;
        },
        turnoExistente() {
            // Verifica si la fecha y hora ya están ocupadas
            return this.turnos.some(turno => turno.fecha === this.fecha && turno.hora === this.hora);
        },
        horaDeshabilitada(hora) {
            // Devuelve true si la hora está en la lista de horas ocupadas
            return this.turnos.some(turno => turno.hora === hora);
        },
        eliminar(id) {
            // Utiliza SweetAlert para confirmar si el usuario realmente quiere eliminar el turno
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
                    this.eliminarTurno(id);
                }
            });
        },
        eliminarTurno(id) {
            const url = `${this.url}/${id}`;
            const options = {
                method: 'DELETE',
            };
            fetch(url, options)
                .then(response => response.json())
                .then(response => {
                    // Si la eliminación tiene éxito, muestra el mensaje de confirmación
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "El turno ha sido eliminado",
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        // Redirige o realiza otras acciones después de que el usuario ve el mensaje de éxito
                        window.location.href = "./turnos.html";
                    });
                })
                .catch(err => {
                    console.error(err);
                    // Si hay un error en la eliminación, muestra un mensaje de error
                    Swal.fire({
                        icon: "error",
                        title: "Error al eliminar el turno",
                        text: "Por favor, inténtelo de nuevo."
                    });
                });
        },
        grabar() {
            // Si la fecha y hora ya están ocupadas, muestra un mensaje de error
            if (this.turnoExistente()) {
                this.error = true;
                this.errorMessage = 'Error: El turno para esta fecha y hora ya ha sido seleccionado. Por favor, elija otro turno.';
            } else {
                // Si no existe, procede con el registro del turno
                // Pero primero, resetea el estado de error
                this.error = false;
                this.errorMessage = '';

                this.registrarTurno();
            }
        },
        registrarTurno() {
            let turno = {
                fecha: this.fecha,
                hora: this.hora,
                paciente_nombre: this.paciente_nombre,
                especialidad: this.especialidad,
                estado: this.estado,
                notas: this.notas,
            };

            let options = {
                method: 'POST',
                body: JSON.stringify(turno),
                headers: { 'Content-Type': 'application/json' },
                redirect: 'follow',
            };

            fetch(this.url, options)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error al registrar el turno');
                    }
                    return response.json();
                })
                .then(() => {
                    // Utiliza SweetAlert en lugar de alert
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "El turno se ha registrado con éxito",
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        // Redirige o realiza otras acciones después de que el usuario ve el mensaje de éxito
                        window.location.href = './turnos.html';
                    });
                })
                .catch(err => {
                    console.error(err);
                    this.error = true;
                    this.errorMessage = 'Error al registrar el turno. Por favor, inténtelo de nuevo.';
                });
        },
    },
    created() {
        this.fetchData(`${this.url}?page=${this.currentPage}&per_page=${this.itemsPerPage}`);
    }
}).mount('#app');
