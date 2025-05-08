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

    for (const persona of personas) {
        const tr = document.createElement('tr'); // Crear una fila HTML

        // Cargar la imagen si existe
        let imagenHTML = 'Sin imagen';
        try {
            const response = await fetch(`${API_URL}/imagenes/obtener/personas/id_persona/${persona.id_persona}`);
            // Se realiza una peticion al backend para obtener la imagen de la persona en base64
            const data = await response.json();
            if (data.imagen) {
                imagenHTML = `<img src="data:image/jpeg;base64,${data.imagen}"style="max-width: 100px; max-height: 100px;">`
            }
        } catch (error) {
            console.error('Error al cargar imagen:', error);
        }

        // Se construye la fila HTML con los datos de la persona y los botones de accion
        // Se utiliza template literals para facilitar la insercion de variables en el HTML

        tr.innerHTML = `
        <td style="border: 1px solid #ddd; text-align: center; padding: 8px;">${persona.id_persona}</td>
        <td style="border: 1px solid #ddd; text-align: center; padding: 8px;">${persona.nombre}</td>
        <td style="border: 1px solid #ddd; text-align: center; padding: 8px;">${persona.apellido}</td>
        <td style="border: 1px solid #ddd; text-align: center; padding: 8px;">${persona.email}</td>
        <td style="border: 1px solid #ddd; text-align: center; padding: 8px;">${imagenHTML}</td>
        <td style="border: 1px solid #ddd; text-align: center; padding: 8px;">
            <button onclick="editarPersona(${persona.id_persona})">Editar</button>
            <button onclick="eliminarPersona(${persona.id_persona})">Eliminar</button>
        </td>
        `;
        tablaPersonasBody.appendChild(tr); // Se añade la fila a la tabla
    }
}

async function manejarSubmit(e) {
 e.preventDefault(); // Evita que el formulario recargue la pagina
 
 // Obtener o recopilar los valores del formulario y crear un objeto persona
 // Se utiliza el metodo getElementById para obtener los valores del cada campo del formulario
 // Se utiliza ParseInt y parseFloat para convertir los valores a numeros enteros o decimales
 // Se utilaza el operador || para asignar null si el campo esta vacio
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
        // Si hay una imagen seleccionada, se actualiza primero la imagen
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

async function crearPersona(persona) 
    // Se utiliza el metodo POST para crear una nueva persona en el backend
    // se envia el objeto persona como cuerpo de la peticion en formato JSON
    // Se espera la respuesta y se convierte a JSON
{
    const response = await fetch(`${API_URL}/personas`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(persona)
    });
    return await response.json();

}

async function actualizarPersona(persona) 
// Se utiliza el metodo PUT para actualizar los datos de una persona existente
// Se envia el objeto persona como cuerpo de la peticion en formato JSON
// Se espera la respuesta y se convierte a JSON
// Se utiliza el ID de a persona para la identificacion en el backend
{
    const response = await fetch(`${API_URL}/personas/${persona.id_persona}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(persona)
    });
    return await response.json();
}

async function eliminarPersona(id)
// Se utiliza el metodo DELETE para eliminar una persona existente
// Se utiliza el ID de la persona para identificarla en el backend
// Se espera la respuesta y se convierte en JSON
// Se utiliza el metodo DELETE para eliminar la imagen asociada a la persona
// Se utiliza el ID de la persona para identificarla en el backend
// Se espera respuesta y convierte a  JSON 
{
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

async function editarPersona(id) 
// Se utiliza el metodo GET para obtener los datos de una persona existente
// Se utiliza el ID de la persona para identificarla en el backend 
// Se espera la respuesta y se convierte a JSON
{
    const persona = personas.find(p => p.id_persona === id);
    // Se utiliza el ID de la persona para identificarla en el backend
    // Se espera la respuesta y se convierte a JSON 
    // Se utiliza el metodo GET para obtener los datos de una persona existente
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

function limpiarFormulario()
// Se utiliza el metodo reset para limpiar todos los campos del formulario
// Se utiliza el metodo getElementById para obtener el ID de la persona y se establece en vacio
// Se utiliza el metodo getElementById para obtener el elemento de previsualizacion de la imagen y se establece en vacio
{
    personaForm.reset();
    document.getElementById('id_persona').value = '';
    previewImagen.style.display = 'none';
    previewImagen.src = '';
}

// Funciones para el manejo de imagenes
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
    // Se utiliza el metodo readAsDataURL para leer el archivo como una URL de datos
}

// Funcion para convrtir imagen a base64
function convertirImagenABase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Eliminar el prefijo "data:image/jpeg;base64," del resultado
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
}