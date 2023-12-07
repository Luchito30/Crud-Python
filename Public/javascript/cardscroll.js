/* Variable para acceder a los articles */
const seccionesOcultas = document.querySelectorAll(".main__section--servicios--card")

/* El Observer */

const observer = new IntersectionObserver((entries) =>{
    entries.forEach((entry) =>{
        entry.target.classList.toggle("mostrar", entry.isIntersecting)
    })
}
)

seccionesOcultas.forEach((seccion) => observer.observe(seccion))