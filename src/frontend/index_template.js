// Variables Globales
const API_URL = 'http://localhost:3000/api'; // Constante que almacena la URL que se conecta al servidor 
let personas = []; // Variable que almacenara el listado de personas del backend

//Elementos del DOM
const personaForm = document.getElementById('personaForm'); //Formulario Principal
const tablaPersonasBody = document.getElementById('tablaPersonasBody'); // Cuerpo de la tabla donde se insertan las filas
const btnCancelar = document.getElementById('btnCancelar'); // Este boton de cancelar limpia el formulario
const imagenInput = document.getElementById('imagen'); // Input de tipo archivo para subir o cargar la imagen
const previewImagen = document.getElementById('previewImagen'); // Elemento imagen de previsualizacion

//Events Listeners
document.addEventListener('DOMContentLoaded', cargarPersonas); // Cuando el DOM este Listo, se cargan las personas
personaForm.addEventListener('submit', manejarSubmit); // Al enviar el formulario, se ejecuta la funcion manejarSubmit que escucha el click
btnCancelar.addEventListener('click', limpiarFormulario); // Al hacer clic en Cancelar, se limpia el formulario
imagenInput.addEventListener('change', manejarImagen); // Al cambiar la imagen, se llama manejarImagen para previsualizar

// Funciones para el manejo de personas
async function cargarPersonas() {
    try {
        const response = await fetch(`${API_URL}/personas`); // Se hace la peticion GET al endpoint personas
        personas = await response.json(); // Se almacena la respuesta como lista de personas
        await mostrarPersonas(); // Se llama la funcion para mostrar la tabla
    } catch (error) {
        console.error('Error al cargar personas:', error);
    }
}

// Iterar sobre cada persona y crear una fila en la tabla
async function mostrarPersonas() {
    tablaPersonasBody.innerHTML = ''; // Limpiar el contenido actual

    // Obtiene el elemeento <template> que contiene la estructura de una fila de persona
    const template = document.getElementById('template');

    // Recorre la fila de personas obtenidas del backend y crea una fila para cada una
    for (const persona of personas) {
        // Clona el contenido del template (la fila predefinida en el HTML)
        const clone = template.content.cloneNode(true);

        // Obtiene todas las celdas <td> dentro del clon
        const tds = clone.querySelectorAll('td');

        // inicializa el contenido de imagen como 'Sin imagen' por defecto
        let imagenHTML = 'Sin imagen';

        // Intenta obtener la imagen de la persona desde el backend
        try {
            // Se realiza una peticion GET al endpoint de imagen de la persona por su ID
            const response = await fetch(`${API_URL}/imagenes/obtener/personas/id_persona/${persona.id_persona}`);
            
            // Covierte la respuesta a un objeto JSON
            const data = await response.json();

            // si hay una imagen en la respuesta, se crea un elemento <img> con la imagen en base64
            if (data.imagen) {
                imagenHTML = `<img src="data:image/jpeg;base64,${data.imagen}"style="max-width: 100px; max-height: 100px;">`
            }
        } catch (error) {
            // si ocurre un error al cargar la imagen, se muestra un mensaje de error en la consola
            console.error('Error al cargar imagen:', error);
        }

        // Llena las celdas con los datos de la persona
        tds[0].textContent = persona.id_persona; // ID de la persona
        tds[1].textContent = persona.nombre; // Nombre de la persona
        tds[2].textContent = persona.apellido; // Apellido de la persona
        tds[3].textContent = persona.email; // email
        tds[4].innerHTML = imagenHTML; // Imagen (si existe, muestra la imagen, si no, muestra 'Sin imagen')

        // Busca los botones de editar y eliminar en el clon
        const btnEditar = clone.querySelector('.btn-editar');
        const btnEliminar = clone.querySelector('.btn-eliminar');

        // Asigna el evento de clic al boton de editar, llamando a la funcion con el ID de la persona
        btnEditar.addEventListener('click', () =>  editarPersona(persona.id_persona)); 

        // Asigna el evento de clic al boton de eliminar, llamando a la funcion con el ID de la persona
        btnEliminar.addEventListener('click', () =>  eliminarPersona(persona.id_persona));
       
        // Finalmente, agrega la fila lonada (Con datos y botones configurados) al cuerpo de la tabla
        tablaPersonasBody.appendChild(clone);
    }
}

// Funcion que maneja el envio del formulario (crear o editar persona)
async function manejarSubmit(e) {
 e.preventDefault(); // previene el comportamiento por defecto del formulario

 // Obtiene los datos del formulario
 const persona = {
    id_persona: document.getElementById('id_persona').value || null,
    nombre: document.getElementById('nombre').value,
    apellido: document.getElementById('apellido').value,
    tipo_identificacion: document.getElementById('tipo_identificacion').value,
    nuip: parseInt(document.getElementById('nuip').value),
    email: document.getElementById('email').value,
    clave: document.getElementById('clave').value,
    salario: parseFloat(document.getElementById('salario').value),
    activo: document.getElementById('activo').checked
 };

 try {
    if (persona.id_persona) {
        // Si estamos editando (id_persona existe)
       
        // Subir imagen si fue seleccionada
        if (imagenInput.files[0]){
            const imagenBase64 = await convertirImagenABase64(imagenInput.files[0]);
            await fetch(`${API_URL}/imagenes/subir/personas/id_persona/${persona.id_persona}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({imagen: imagenBase64})
            });
        }
        // Luego se actualizan los datos de la persona
        await actualizarPersona(persona);
    }   else {
            // Si es una persona nueva se procede a crearla
            const nuevaPersona = await crearPersona(persona);
            // Si hay una imagen seleccionada, se sube
            if (imagenInput.files[0]) {
                const imagenBase64 = await convertirImagenABase64(imagenInput.files[0]);
                await fetch(`${API_URL}/imagenes/insertar/personas/id_persona/${nuevaPersona.id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imagen: imagenBase64})
                });
            }
        }
        limpiarFormulario(); // Limpiar el formulario
        cargarPersonas(); // Recarga la tabla y mostrar las personas
     } catch (error) {
        console.erro('Error al guardar persona:', error);
        alert('Error al guardar los datos: ' + error.message);
    }

}

async function crearPersona(persona){


  const response = await fetch(`${API_URL}/personas`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(persona)
    });
    return await response.json(); // Devuelve el objeto persona con el ID asignado por el backend
} 

// Actualiza los datos de una persona existente
async function actualizarPersona(persona) {
    const response = await fetch(`${API_URL}/personas/${persona.id_persona}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(persona)
    });
    return await response.json();
}

// Elimina una persona y su imagen asociada
async function eliminarPersona(id) {
    if (confirm('Esta seguro de eliminar esta persona?')) {
        try {
            // Primero se intenta eliminar la imagen si existe
            await fetch(`${API_URL}/imagenes/eliminar/personas/id_persona/${id}`, {
                method: 'DELETE'
            });
            // Luego se elimina la persona
            await fetch(`${API_URL}/personas/${id}`, { method: 'DELETE'});
            cargarPersonas();
        } catch (error) {
            console.error('Error al eliminar persona:', error);
            alert('Error al eliminar la persona: ' + error.message);
        }
    }
}

// Llama el formulario con los datos de la persona a editar
async function editarPersona(id) {
    const persona = personas.find(p => p.id_persona === id);
    if(persona) {
      document.getElementById('id_persona').value = persona.id_persona;
      document.getElementById('nombre').value = persona.nombre;
      document.getElementById('apellido').value = persona.apellido;
      document.getElementById('tipo_identificacion').value = persona.tipo_identificacion;
      document.getElementById('nuip').value = persona.nuip;
      document.getElementById('email').value = persona.email;
      document.getElementById('clave').value = ''; // No mostramos la contrasena
      document.getElementById('salario').value = persona.salario;
      document.getElementById('activo').value = persona.activo;

      // Cargar imagen si existe
      try {
        const response = await fetch(`${API_URL}/imagenes/obtener/persona/id_persona/${id}`);
        const data = await response.json();
        if (data.imagen) {
            previewImagen.src = `data:image/jpeg;base64, ${data.imagen}`;
            previewImagen.style.display = 'block';
        } else {
            previewImagen.style.display = 'none';
            previewImagen.src = '';
        }
      } catch (error) {
        console.error('Error al cargar imagen:', error);
        previewImagen.style.display = 'none';
        previewImagen.src = '';
      }
    }
}

// Limpia todos los campos del formulario
function limpiarFormulario()
{
    personaForm.reset();
    document.getElementById('id_persona').value = '';
    previewImagen.style.display = 'none';
    previewImagen.src = '';
}

// Muestra una previsualizacion de la imagen seleccionada
function manejarImagen(e) {
    const file  = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImagen.src = e.target.result;
            previewImagen.style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
    else {
        previewImagen.style.display = 'none';
        previewImagen.src = '';
    }
    
}

// Convierte la imagen a base64 para enviarla al backend
function convertirImagenABase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64 = reader.result.split(',')[1]; // Elimina el prefijo del data URL
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
}