const { createApp } = Vue;

createApp({
  data() {
    return {
      user: '',
      password: '',
      rol_id: '',
    };
  },
  methods: {
    async login() {
      try {
        const response = await fetch('http://localhost:5000/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user: this.user,
            password: this.password,
          }),
        });

        if (response.ok) {
          const data = await response.json();

          // Guardar información de sesión (puedes usar localStorage o sessionStorage)
          sessionStorage.setItem('user', this.user);
          sessionStorage.setItem('rol_id', data.rol_id);

          // Mostrar SweetAlert de éxito
          Swal.fire({
            icon: 'success',
            title: '¡Inicio de sesión exitoso!',
            text: `Bienvenido ${this.user}`
          }).then(() => {
            // Redireccionar a la página de bienvenida
            window.location.href = './productos.html';
          });
        } else {
          const error = await response.json();

          // Mostrar SweetAlert de error
          Swal.fire({
            icon: 'error',
            title: 'Error en el inicio de sesión',
            text: "Credenciales Invalidas",
          });
        }
      } catch (error) {
        console.error('Error en la solicitud:', error);
      }
    },
  },
}).mount("#app");


document.getElementById('login-form').addEventListener('submit', function (event) {
  event.preventDefault();
});

document.getElementById('username').addEventListener('input', function () {
  const usernameInput = this.value.trim();
  const usernameError = document.getElementById('username-error');

  if (/^[a-zA-Z0-9]+$/.test(usernameInput) || usernameInput === '') {
    usernameError.textContent = '';
    this.classList.remove('is-invalid');
  } else {
    usernameError.textContent = 'Solo se permiten letras y números.';
    this.classList.add('is-invalid');
  }
});

function togglePassword() {
  const passwordInput = document.getElementById('password');
  const toggleBtn = document.querySelector('.toggle-password');

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggleBtn.innerHTML = '<i class="far fa-eye-slash"></i>';
  } else {
    passwordInput.type = 'password';
    toggleBtn.innerHTML = '<i class="far fa-eye"></i>';
  }
}
