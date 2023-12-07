let currentSlideIndex = 0; // Variable para rastrear el índice actual del slide

// Función para avanzar al siguiente slide
function nextSlide() {
    const slider = document.querySelector('.main__container--slider-wrapper__slider');
    const indicators = document.querySelectorAll('.indicator');

    // Elimina la clase 'active' del indicador actual
    indicators[currentSlideIndex].classList.remove('active');

    // Mueve el primer slide al final del slider
    slider.appendChild(slider.firstElementChild);

    // Incrementa el índice del slide actual
    currentSlideIndex = (currentSlideIndex + 1) % indicators.length;

    // Agrega la clase 'active' al nuevo indicador
    indicators[currentSlideIndex].classList.add('active');
}

// Función para cambiar el slide cuando se hace clic en un indicador
function goToSlide(index) {
    const slider = document.querySelector('.main__container--slider-wrapper__slider');
    const indicators = document.querySelectorAll('.indicator');

    // Elimina la clase 'active' del indicador actual
    indicators[currentSlideIndex].classList.remove('active');

    // Mueve los slides para que el indicador seleccionado sea el actual
    while (currentSlideIndex !== index) {
        slider.appendChild(slider.firstElementChild);
        currentSlideIndex = (currentSlideIndex + 1) % indicators.length;
    }

    // Agrega la clase 'active' al indicador seleccionado
    indicators[currentSlideIndex].classList.add('active');
}

// Iniciar la animación del slider cada cierto tiempo
setInterval(nextSlide, 8000); // Cambia de slide cada 8 segundos (8000 ms)

// Agregar eventos de clic a los indicadores
const indicator1 = document.getElementById('indicator1');
const indicator2 = document.getElementById('indicator2');
const indicator3 = document.getElementById('indicator3');
const indicator4 = document.getElementById('indicator4');

indicator1.addEventListener('click', function () {
    goToSlide(0);
});

indicator2.addEventListener('click', function () {
    goToSlide(1);
});

indicator3.addEventListener('click', function () {
    goToSlide(2);
});

indicator4.addEventListener('click', function () {
    goToSlide(3);
});

// Establecer el indicador activo cuando se carga la página
window.addEventListener('load', function () {
    const indicators = document.querySelectorAll('.indicator');
    indicators[currentSlideIndex].classList.add('active');
});