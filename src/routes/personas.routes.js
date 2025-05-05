// Importar el modulo express
const express = require('express');

// Crear un nuevo router de Express para manejar rutas de manera modular
const router = express.Router();

// Importar el controlador generico para operaciones CRUD
const CrudController = require('../controllers/crud.controller');

// Instanciar una nueva instancia del controlador para usuar sus metodos 
const crud = new CrudController();

// Definir el nombre de la tabla en la base de datos sobre la que se operara
const tabla = 'personas';

// Definir el nombre del campo identificador unico de la tabla
const idCampo = 'id_persona';

// Ruta para obtener todos los registros de personas
router.get('/', async (req, res) => {
try {
    // Utilizar el metodo obtenerTodos del controlador para traer los todos los registros
    const personas = await crud.obtenerTodos(tabla);
    
    // Respuesta con el arreglo de personas en formato JSON
    res.json(personas);
    } catch (error) {
    // Si hay un error, se responde con codigo 500 y el mensaje error 
    res.status(500).json({ error: error.message });
    }
});

// Ruta pa obtener una persona espcifica por su ID
router.get('/:id', async (req, res) => {
    try {
        // Utilizar el metodo obtenerUno con el ID recibido en la URL
        const persona = await crud.obtenerUno(tabla, idCampo, req.params.id);

        // Respuesta con los datos de la persona en formato JSON
        res.json(persona);
    } catch (error) {
        // Manejar errores de servidor 
        res.status(500).json({ error: error.message });
    }
});

// Ruta para crear una nueva persona (registro nuevo en la base de datos)
router.post('/', async (req, res) => {
    try {
        // Utilizar el metodo crear con los datos enviados en el cuerpo del request
        const nuevaPersona = await crud.crear(tabla, req.body);

        // Respuesta con el nuevo registro creado y codigo 201 (creado)
        res.status(201).json(nuevaPersona);
    } catch (error) {
         // Manejar errores de servidor 
         res.status(500).json({ error: error.message });
    }
});

// Ruta para actualizar una persona existente (Por ID)
router.put('/:id', async (req, res) => {
    try {
        // Utilizar el metodo actualizar con el  ID y los nuevos datos del cuerpo
        const personaActualizada = await crud.actualizar(tabla, idCampo, req.params.id, req.body);

        //Respuesta con el registro actualizado
        res.json(personaActualizada);
    } catch (error) {
         // Manejar errores de servidor 
         res.status(500).json({ error: error.message });
    }
});

// Ruta para eliminar una persona de la base de datos (por ID)
router.delete('/:id', async (req, res ) => {
    try {
        // Utilizar el metodo eliminar con el  ID recibido
        const resultado = await crud.eliminar(tabla, idCampo, req.params.id);
        
        //Respuesta con un mensaje o confirmacion de eliminacion
        res.json(resultado);
    } catch (error) {
         // Manejar errores de servidor 
         res.status(500).json({ error: error.message });
    }
});

// Exportar el router para que pueda ser usado en la aplicacion principal
module.exports = router;