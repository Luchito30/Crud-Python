console.log(location.search); // Lee los argumentos pasados a este formulario
const id = location.search.substr(4);
console.log(id);

const { createApp } = Vue;

createApp({
    data() {
        return {
            id: 0,
            fecha: "",
            hora: "",
            paciente_nombre: "",
            especialidad: "",
            estado: "",
            notas: "",
            url: id ? `http://localhost:5000/turnos/${id}` : '',
            error: false,
            errorMessage: '',
        };
    },
    methods: {
        fetchData(url) {
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    this.id = data.id;
                    this.fecha = data.fecha;
                    this.hora = data.hora;
                    this.paciente_nombre = data.paciente_nombre;
                    this.especialidad = data.especialidad;
                    this.estado = data.estado;
                    this.notas = data.notas;
                })
                .catch(err => {
                    console.error(err);
                    this.error = true;
                });
        },
        modificar() {
            let turno = {
                fecha: this.fecha,
                hora: this.hora,
                paciente_nombre: this.paciente_nombre,
                especialidad: this.especialidad,
                estado: this.estado,
                notas: this.notas,
            };
            const options = {
                body: JSON.stringify(turno),
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                redirect: 'follow'
            };
            fetch(this.url, options)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error al modificar el turno');
                    }
                    return response.json();
                })
                .then(() => {
                    // Utiliza SweetAlert en lugar de alert
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "El turno se ha modificado con éxito",
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        // Redirige o realiza otras acciones después de que el usuario ve el mensaje de éxito
                        window.location.href = "./turnos.html";
                    });
                })
                .catch(err => {
                    console.error(err);
                    // Utiliza SweetAlert para mostrar el mensaje de error
                    Swal.fire({
                        icon: "error",
                        title: "Error al modificar el turno",
                        text: "Por favor, inténtelo de nuevo."
                    });
                });
        }
    },
    created() {
        // Llama a la función fetchData al crear el componente para cargar los datos actuales del turno
        this.fetchData(this.url);
    },
}).mount('#app');
