const { createApp } = Vue;

createApp({
    data() {
        return {
            turnos: [],
            url: 'http://127.0.0.1:5000/turnos',
            error: false,
            errorMessage: '',
            id: 0,
            fecha: new Date().toISOString().split('T')[0],  // Valor predeterminado para la fecha (hoy)
            hora: new Date().toTimeString().slice(0, 5),  // Valor predeterminado para la hora (hoy)
            paciente_nombre: '',
            especialidad: '',
            estado: 'Programado',  // Valor predeterminado para el estado
            notas: '',
        };
    },
    methods: {
        fetchData(url) {
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    this.turnos = data.map(turno => ({
                        ...turno,
                        fecha: this.formatDate(turno.fecha),
                        hora: this.formatTime(turno.hora),
                    }));
                })
                .catch(err => {
                    console.error(err);
                    this.error = true;
                });
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
        this.fetchData(this.url);
    }
}).mount('#app');