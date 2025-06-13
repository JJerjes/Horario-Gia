const frases = [
  "El amor se demuestra con actos, no con palabras. — Élder Uchtdorf",
  "Esfuérzate por ser mejor hoy que ayer. — Anónimo",
  "Dios no exige perfección, solo disposición. — Élder Holland",
  "La obediencia trae bendiciones; la obediencia exacta, milagros. — Élder McKay",
  "Trabaja como si todo dependiera de ti, ora como si todo dependiera de Dios. — Santo Agustín"
];

// Cargar tema desde localStorage
function aplicarTemaGuardado() {
  const temaGuardado = localStorage.getItem("tema") || "claro";
  document.body.classList.toggle("dark", temaGuardado === "oscuro");
  document.getElementById("toggle-tema").textContent =
    temaGuardado === "oscuro" ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
}

// Alternar tema
function toggleTema() {
  const esOscuro = document.body.classList.toggle("dark");
  localStorage.setItem("tema", esOscuro ? "oscuro" : "claro");
  document.getElementById("toggle-tema").textContent =
    esOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
}

// Cargar horario desde JSON
async function cargarHorarioDesdeJSON() {
  try {
    const respuesta = await fetch("horario.json");
    if (!respuesta.ok) throw new Error("No se pudo cargar el JSON");
    const horarioJSON = await respuesta.json();
    return horarioJSON;
  } catch (error) {
    console.error("Error al cargar horario:", error);
    return null;
  }
}

// Generar tabla horaria desde JSON
function generarTablaHorariaConJSON(horarioJSON) {
  const tbody = document.getElementById("tabla-horaria-body");
  const horaInicio = 6;
  const horaFin = 23;
  const diasMap = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

  tbody.innerHTML = "";

  for (let h = horaInicio; h < horaFin; h++) {
    const fila = document.createElement("tr");

    const celdaHora = document.createElement("td");
    celdaHora.textContent =
      h < 12 ? `${h}am - ${h + 1}am` :
      h === 12 ? `12pm - 1pm` :
      `${h - 12}pm - ${h - 11}pm`;
    fila.appendChild(celdaHora);

    for (let d = 0; d < 6; d++) {
      const celda = document.createElement("td");
      celda.setAttribute("data-dia", d + 1);
      celda.setAttribute("data-hora", h);
      celda.contentEditable = true;

      const diaNombre = diasMap[d];
      celda.textContent = (horarioJSON[diaNombre] && horarioJSON[diaNombre][h]) || "";
      celda.addEventListener("input", guardarContenido);

      fila.appendChild(celda);
    }

    tbody.appendChild(fila);
  }
}

function guardarContenido(e) {
  const celda = e.target;
  const dia = celda.getAttribute("data-dia");
  const hora = celda.getAttribute("data-hora");
  const contenido = celda.textContent;
  localStorage.setItem(`dia${dia}-hora${hora}`, contenido);
}

// Marcar celdas según hora actual
function marcarCeldas() {
  const ahora = new Date();
  const horaActual = ahora.getHours();
  const diaActual = ahora.getDay(); // Lunes = 1

  if (diaActual === 0) return; // domingo no aplica

  const celdas = document.querySelectorAll("td[data-dia]");

  celdas.forEach(celda => {
    const dia = parseInt(celda.getAttribute("data-dia"));
    const hora = parseInt(celda.getAttribute("data-hora"));
    celda.classList.remove("cumplido", "pendiente");

    if (dia === diaActual) {
      celda.classList.add(hora < horaActual ? "cumplido" : "pendiente");
    }
  });
}

// Mostrar solo columnas necesarias en móvil
function mostrarPar(par) {
  const columnas = document.querySelectorAll(".col-dia");
  columnas.forEach(col => {
    col.classList.toggle("mostrar", col.dataset.par === par);
  });

  const filas = document.querySelectorAll("#tabla-horaria-body tr");
  filas.forEach(fila => {
    for (let i = 1; i <= 6; i++) {
      const celda = fila.querySelector(`td[data-dia='${i}']`);
      if (celda) {
        const visible = document.querySelector(`.col-dia[data-dia='${i}']`).classList.contains("mostrar");
        celda.style.display = visible ? "table-cell" : "none";
      }
    }
  });
}

// Frases motivadoras
function cargarFraseMotivadora() {
  const fraseElem = document.getElementById("frase-motivadora");
  fraseElem.textContent = frases[Math.floor(Math.random() * frases.length)];
}
function cargarFraseFinal() {
  const fraseFinalElem = document.getElementById("frase-final");
  fraseFinalElem.textContent = frases[Math.floor(Math.random() * frases.length)];
}

// Fecha y hora actualizadas
function actualizarFechaHora() {
  const ahora = new Date();
  const fecha = ahora.toLocaleDateString("es-ES", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });
  const hora = ahora.toLocaleTimeString("es-ES");
  document.getElementById("fecha-hora").textContent = `${fecha} — ${hora}`;
}

// App principal
async function iniciarApp() {
  aplicarTemaGuardado();

  const horarioJSON = await cargarHorarioDesdeJSON();
  if (!horarioJSON) return;

  generarTablaHorariaConJSON(horarioJSON);
  marcarCeldas();
  cargarFraseMotivadora();
  cargarFraseFinal();
  actualizarFechaHora();
  setInterval(actualizarFechaHora, 1000);

  // Responsive: mostrar días por pares
  const diaActual = new Date().getDay();
  if (window.innerWidth <= 768) {
    if (diaActual <= 2) mostrarPar("par1");
    else if (diaActual <= 4) mostrarPar("par2");
    else mostrarPar("par3");
  } else {
    document.querySelectorAll(".col-dia").forEach(col => col.classList.add("mostrar"));
    document.querySelectorAll("#tabla-horaria-body tr").forEach(fila => {
      for (let i = 1; i <= 6; i++) {
        const celda = fila.querySelector(`td[data-dia='${i}']`);
        if (celda) celda.style.display = "table-cell";
      }
    });
  }

  // Listener botón
  document.getElementById("toggle-tema").addEventListener("click", toggleTema);
}

window.addEventListener("DOMContentLoaded", iniciarApp);
