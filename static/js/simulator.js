const tabs = document.querySelectorAll('.tab-button');
const forms = document.querySelectorAll('.tab-content');
const chartCanvas = document.getElementById('chartCanvas');
const mensajeError = document.getElementById('mensajeError');
const darkToggle = document.getElementById('darkToggle');
let chartInstance = null;

function activarPestana(tabId) {
  forms.forEach((form) => {
    form.classList.toggle('hidden', form.id !== `${tabId}Form`);
  });
  tabs.forEach((button) => {
    button.classList.toggle('bg-cyan-600', button.dataset.tab === tabId);
    button.classList.toggle('bg-slate-800', button.dataset.tab !== tabId);
  });
  mensajeError.classList.add('hidden');
}

function mostrarError(texto) {
  mensajeError.textContent = texto;
  mensajeError.classList.remove('hidden');
}

function limpiarError() {
  mensajeError.classList.add('hidden');
  mensajeError.textContent = '';
}

function validarNumero(valor) {
  return valor !== '' && !Number.isNaN(Number(valor));
}

function crearGrafico(labels, data, label, ejeX = 'Tiempo', ejeY = 'Valor') {
  // Redondear las etiquetas del eje X a 2 decimales para evitar el .9999999
  const labelsRedondeados = labels.map(num => {
    return typeof num === 'number' ? Math.round(num * 100) / 100 : num;
  });

  const config = {
    type: 'line',
    data: {
      labels: labelsRedondeados, // Usamos las etiquetas limpias
      datasets: [{
        label,
        data,
        borderColor: '#33B8C7',
        backgroundColor: 'rgba(51, 184, 199, 0.1)',
        pointRadius: 2,
        tension: 0.4,
        fill: true,
        borderWidth: 3
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: ejeX, // Nombre dinámico
            color: '#33B8C7',
            font: { size: 14, weight: 'bold' }
          },
          ticks: {
            color: '#94A3B8',
            maxRotation: 45, // Evita que se amontonen
            minRotation: 45
          },
          grid: { color: 'rgba(148, 163, 184, 0.1)' }
        },
        y: {
          title: {
            display: true,
            text: ejeY, // Nombre dinámico
            color: '#33B8C7',
            font: { size: 14, weight: 'bold' }
          },
          ticks: {
            color: '#94A3B8',
            // Redondear también los números del eje Y
            callback: function(value) {
              return Math.round(value * 100) / 100;
            }
          },
          grid: { color: 'rgba(148, 163, 184, 0.1)' }
        }
      },
      plugins: {
        legend: { labels: { color: '#E2E8F0' } }
      }
    },
  };

  if (chartInstance) { chartInstance.destroy(); }
  chartInstance = new Chart(chartCanvas, config);
}

async function enviarSolicitud(endpoint, payload, label) {
  try {
    const respuesta = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // Manejo específico del error 405 (Ahora dentro del try)
    if (respuesta.status === 405) {
      throw new Error('Error 405: Revisa que la ruta en el JS coincida exactamente con la de Python.');
    }

    const textoRespuesta = await respuesta.text();
    let datos = null;

    if (textoRespuesta) {
      try {
        datos = JSON.parse(textoRespuesta);
      } catch (e) {
        throw new Error('El servidor devolvió una respuesta no válida.');
      }
    }

    if (!respuesta.ok) {
      const mensaje = datos?.error || `Error del servidor: ${respuesta.status}`;
      throw new Error(mensaje);
    }

    if (!datos || !Array.isArray(datos.t) || !Array.isArray(datos.y)) {
      throw new Error('La respuesta del servidor no contiene datos válidos.');
    }

    // --- LÓGICA PARA EJES DINÁMICOS ---
    let nombreEjeX = 'Tiempo';
    let nombreEjeY = 'Valor';

    if (endpoint.includes('enfriamiento')) {
      nombreEjeX = 'Tiempo (min)';
      nombreEjeY = 'Temperatura (°C)';
    } else if (endpoint.includes('poblacion')) {
      nombreEjeX = 'Tiempo (años)';
      nombreEjeY = 'Población (Hab)';
    } else if (endpoint.includes('mezclas')) {
      nombreEjeX = 'Tiempo (s)';
      nombreEjeY = 'Cantidad de Sal (kg)';
    }

    // Llamamos a crearGrafico con los 5 argumentos
    crearGrafico(datos.t, datos.y, label, nombreEjeX, nombreEjeY);
    
    limpiarError();

  } catch (error) {
    mostrarError(error.message);
  }
}

function procesarFormulario(form, endpoint, label) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = {};

    for (const [key, value] of formData.entries()) {
      if (!validarNumero(value)) {
        mostrarError('Por favor ingresa valores válidos en todos los campos.');
        return;
      }
      payload[key] = Number(value);
    }

    enviarSolicitud(endpoint, payload, label);
  });
}

function alternarModoOscuro() {
  document.documentElement.classList.toggle('dark');
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => activarPestana(tab.dataset.tab));
});

darkToggle.addEventListener('click', alternarModoOscuro);

// Agregamos la barra al final para evitar redirecciones internas de Flask
procesarFormulario(document.getElementById('enfriamientoForm'), '/api/enfriamiento/', 'Ley de Enfriamiento');
procesarFormulario(document.getElementById('poblacionForm'), '/api/poblacion/', 'Crecimiento Poblacional');
procesarFormulario(document.getElementById('mezclasForm'), '/api/mezclas/', 'Mezclas y Dilución');

activarPestana('enfriamiento');
