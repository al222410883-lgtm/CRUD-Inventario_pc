const API_URL = 'api.php';
const form = document.getElementById('formEquipo');
const tabla = document.getElementById('tablaEquipos');
const btnGuardar = document.getElementById('btnGuardar');

// Guardar referencia en memoria para evitar problemas de comillas en el HTML
let cacheEquipos = [];

// Cargar equipos al iniciar la página
document.addEventListener('DOMContentLoaded', obtenerEquipos);

// 1. LEER (GET)
async function obtenerEquipos() {
    try {
        const respuesta = await fetch(API_URL);
        if (!respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta.status} al obtener equipos`);
        }

        const equipos = await respuesta.json();
        cacheEquipos = Array.isArray(equipos) ? equipos : [];

        tabla.innerHTML = '';
        cacheEquipos.forEach((eq, index) => {
            tabla.innerHTML += `
                <tr>
                    <td>${eq.id}</td>
                    <td>${eq.nombre}</td>
                    <td><span class="badge bg-secondary">${eq.categoria}</span></td>
                    <td>$${parseFloat(eq.precio || 0).toFixed(2)}</td>
                    <td>${eq.stock} uds.</td>
                    <td>
                        <button type="button" class="btn btn-sm btn-warning" onclick="cargarParaEditar(${index})">Editar</button>
                        <button type="button" class="btn btn-sm btn-danger" onclick="eliminarEquipo(${eq.id})">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error en obtenerEquipos:', error);
        alert('No se pudieron cargar los equipos. Revisa la consola (F12) y api.php.');
    }
}

// 2. CREAR (POST) y ACTUALIZAR (PUT)
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('equipoId').value.trim();
    const datos = {
        id: id,
        nombre: document.getElementById('nombre').value.trim(),
        categoria: document.getElementById('categoria').value.trim(),
        precio: parseFloat(document.getElementById('precio').value),
        stock: parseInt(document.getElementById('stock').value, 10)
    };

    const metodo = id ? 'PUT' : 'POST';

    try {
        const respuesta = await fetch(API_URL, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const textoRespuesta = await respuesta.text();
        if (!respuesta.ok) {
            throw new Error(`Error ${respuesta.status}: ${textoRespuesta}`);
        }

        form.reset();
        document.getElementById('equipoId').value = '';
        btnGuardar.textContent = 'Guardar';
        btnGuardar.classList.remove('btn-success');
        btnGuardar.classList.add('btn-primary');

        await obtenerEquipos();
    } catch (error) {
        console.error('Error al guardar/actualizar:', error);
        alert('Ocurrió un error al guardar los datos. Revisa la pestaña Red (Network) y Consola en F12.');
    }
});

// Preparar el formulario para editar
function cargarParaEditar(index) {
    const equipo = cacheEquipos[index];
    if (!equipo) return;

    document.getElementById('equipoId').value = equipo.id;
    document.getElementById('nombre').value = equipo.nombre;
    document.getElementById('categoria').value = equipo.categoria;
    document.getElementById('precio').value = equipo.precio;
    document.getElementById('stock').value = equipo.stock;

    btnGuardar.textContent = 'Actualizar';
    btnGuardar.classList.remove('btn-primary');
    btnGuardar.classList.add('btn-success');
}

// 3. ELIMINAR (DELETE)
async function eliminarEquipo(id) {
    if (confirm('¿Estás seguro de eliminar este equipo del inventario?')) {
        try {
            const respuesta = await fetch(`${API_URL}?id=${encodeURIComponent(id)}`, {
                method: 'DELETE'
            });

            if (!respuesta.ok) {
                const texto = await respuesta.text();
                throw new Error(`Error ${respuesta.status}: ${texto}`);
            }

            await obtenerEquipos();
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('No se pudo eliminar el registro.');
        }
    }
}