const db = require('../config/db');
// Se importa  la conexion a la base de datos desde el archivo db.js

// Se crea una clase llamada CrudController que manejara todas las operaciones CRUD 
class CrudController {
  
    // Método para obtener todos los registros de una tabla
    async obtenerTodos(tabla) {
        try{
            // Realiza una consulta SQL para seleccionar todos los registros de la tabla indicada
            const [resultado] = await db.query(`SELECT * FROM ${tabla}`);
            return resultado; // Devuelve el array de resultados
        } catch (error){
            throw error; // Lanza el error para que sea manejado en otro lugar
        }
    }

      // Método para obtener un unico resgistro por su ID
      async obtenerUno(tabla, idCampo, id) {
        try{
            // Se utiliza el doble interrogante ?? para escapar nombres de la tabla/campo, y un interrogante ? para el valor 
            const [resultado] = await db.query(`SELECT * FROM ?? WHERE ?? = ?`, [tabla, idCampo, id]);
            return resultado[0]; // Devuelve solo el primer resultado
        } catch (error){
            throw error; // Lanza el error para que sea manejado en otro lugar
        }
    }


       // Método para crear un nuevo registro
       async crear(tabla, data){
        try{
            // Inserta los datos en la tabla indicada
            const [resultado] = await db.query(`INSERT INTO ?? SET ?`, [tabla, data]);
            // Devuelve el objeto creado, incluyendo el ID generado automaticamente
            return { ...data, id: resultado.insertId};
        } catch (error){
            throw error; // Lanza el error para que sea manejado en otro lugar
        }
    }

    // Método para actualizar un registro existente 
    async actualizar(tabla,idCampo,id) {
        try {
            // Ejecuta una consulta UPDATE con los datos nuevos
            const [resultado] = await db.query(`UPDATE ?? SET ? WHERE ?? = ?`, [tabla, data, idCampo, id]);
            // Si no se afeco ninguma fila, es que el registro no existia
            if (resultado.affectedRows === 0){
                throw new Error('Registro no encontrado');
            }
            // Devuelve el registro actualizado
            return await this.obtenerUno(tabla,idCampo,id);
        } catch (error) {
            throw error; // Lanza el error para que sea manejado en otro lugar
        }
    }


      // Método para eliminar un registro
      async eliminar (tabla, idCampo, id) {
        try {
            // Ejecuta la eliminacion del registro
            const [resultado] = await db.query(`DELETE FROM ?? WHERE ?? = ?`, [tabla, idCampo, id]);
            // Si no se elimino ninguna fila, es que el ID no existe
            if(resultado.affectedRows === 0) {
                throw new Error('Regisro no encontrado')
            }
            // Devuelve un mensaje de exito 
            return {mensaje: 'Registro Eliminado Correctamente'};
        } catch (error) {
            throw error; // Lanza el error para que sea manejado en otro lugar
        }
      }

}

// Se exporta la clase para poder utilizarla en otros archivos 
module.exports = CrudController;