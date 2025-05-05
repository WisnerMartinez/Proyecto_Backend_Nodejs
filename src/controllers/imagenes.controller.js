// Importar la conexion a la base de datos  desde el archivo de configuracion 
const db = require('../config/db');

// Crear la clase ImagenesController que manejara las operaciones relacionadas con imagenes 
class ImagenesController {

      // Método para subir o actualizar una imagen codificada en base64 a un registro especifico
      async subirImagen(tabla, campoId, id, imagenBase64) {
        try {
            // Consultar si el registro con el ID existe
            const [resgistro] = await db.query(`SELECT * FROM ?? WHERE ?? = ?`, [tabla, campoId, id]);

            // Si no existe, retornar error
            if (resgistro.length === 0) {
                return { error: 'No se encontro el registro con el ID proporcionado.'};
            }

            // Convertimos la imagen de base64 a un buffer (formato binario)
            const bufferImagen = Buffer.from(imagenBase64, 'base64');

            // Crear la consulta para actualizar el campo `imagen` del registro
            const query = `UPDATE ?? SET imagen = ? WHERE ?? = ?`;
            const  [result] = await db.query(query, [tabla, bufferImagen, campoId, id]);

            // Validar si la actualizacion fue exitosa
            if (result.affectedRows > 0) {
                return { message: 'Imagen actualizada correctamente.'};
            } else {
                return { message: 'Error al actualizar la imagen.'};
            }
        } catch (error) {
            console.error('Error al subir la imagen:', error);
            throw error;
        }
    }


    // Método para obtener una imagen desde un registro y devolver en formato base64
    async obtenerImagen(tabla, campoId, id) {
        try {
            // Consultar el campo `imagen` del registro
            const [rows] = await db.query(`SELECT imagen FROM ?? WHERE ?? = ?`, [tabla, campoId, id]);

            // Validar si se encontro el registro
            if (rows.length === 0) {
                return {error: 'Registro no encontrado' };
            }

            // Verificar si el campo imagen esta vacio
            if(!rows[0].imagen) {
                return { error: 'No hay imagen asociada a este registro' };
            }

            // Convertir la imagen de binario a base64
            const imagenBase64 = rows[0].imagen.toString('base64');

            // Retornar la imagen codificada
            return { imagen: imagenBase64};
        } catch (error) {
            console.error('Error al obtener la imagen', error);
            throw error;
        }
    }

    // Método para eliminar una imagen (establece el campo imaen como NULL)
    async eliminarImagen(tabla, campoId, id) {
        try {
            // Verificar que el registro exista
            const [registro] = await db.query(`SELECT * FROM ?? WHERE ?? = ?`, [tabla, campoId, id]);

            if (registro.length === 0) {
                return { error: ' No se encontro el registro con el ID proporcionado.' };
            }

            // Establecer el campo imagen como NULL
            const query = `UPDATE ?? SET imagen = NULL WHERE ?? = ?`;
            const [result] = await db.query(query, [tabla, campoId, id]);

            // Confirmar si se elimino correctamente
            if (result.affectedRows > 0) {
                return { message: 'Imagen eliminada correctamente.' };
            } else {
                return { error: 'Error al eliminar la imagen.' };
            }
        } catch (error) {
            console.error('Error al eliminar la imagen', error);
            throw error;
        }
    }

     // Método para insertar una imagen si no existe o actualiza si ya hay una 
     async insertarImagen(tabla, campoId, id, imagenBase64) {
        try {
            // Verificar que el registro exista
            const [registro] = await db.query(`SELECT * FROM ?? WHERE ?? = ?`, [tabla, campoId, id]);

            if (registro.length === 0) {
                return { error: 'No se encontro el registro con el ID proporcionado.' };
            }

            // Convertir la imagen a formato binario
            const bufferImagen = Buffer.from(imagenBase64, 'base64');

            // Consultar so ya hay una imagen existente
            const [imagenBase64] = await db.query(`SELECT imagen FROM ?? WHERE ?? = ?`, [tabla, campoId, id]);

            // Si ya hay una imagen, actualizar
            if (imagenExistente[0]?.imagen) {
                const query = `UPDATE ?? SET imagen = ? WHERE ?? = ?`;
                const [result] = await db.query(query, [tabla,bufferImagen, campoId, id]);

                if (result.affectedRows > 0) {
                    return { message: 'imagen actualizada correctamente.' };
                } else {
                    return { error: 'Error al actualizar la imagen.' };
                }
            } else {
                // Si no hay imagen, insertar una nueva
                const query = `UPDATE ?? SET imagen = ? WHERE ?? = ?`;
                const [result] = await db.query(query, [tabla, bufferImagen, campoId, id]);

                if (result.affectedRows > 0) {
                    return { message: 'imagen insertada correctamente.' };
                } else {
                    return { error: 'Error al insertar la imagen.' };
                }
            }
        } catch (error) {
            console.error('Error al insertar la imagen', error);
            throw error;
        }
    }


    // Método  general que decide si subir una imagen o solo obtenerla
    async procesarImagen(tabla, campoId, id, imagenBase64 = null) {
        // Si se pasa una imagen, la sube
        if (imagenBase64) {
            return await this.subirImagen(tabla, campoId, id, imagenBase64);
        } else {
            // Si no, intenta recuperla
            return await this.obtenerImagen(tabla, campoId, id);
        }
    } 
} 

// Exportar una instancia del controlador para su uso en rutas u otros modulos
module.exports = new ImagenesController();

