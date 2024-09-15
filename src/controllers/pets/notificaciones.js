import { pool } from "../../db/conexion.js";

export const notificarAdopcion = async (req, res) => {
    try {
        // Extraer el id de la mascota y el id del posible adoptador del cuerpo de la solicitud
        const { mascotaId, id_posible_adoptador } = req.body;

        // Verificar si los parámetros requeridos están presentes
        if (!mascotaId || !id_posible_adoptador) {
            return res.status(400).json({ message: "El ID de la mascota y el ID del posible adoptador son requeridos" });
        }

        // Consultar el dueño actual de la mascota
        const queryOwner = 'SELECT id_usuario FROM mascotas WHERE id_mascota = ?';
        const [ownerRows] = await pool.query(queryOwner, [mascotaId]);

        if (ownerRows.length === 0) {
            return res.status(404).json({ message: "Mascota no encontrada" });
        }

        const id_usuario_dador = ownerRows[0].id_usuario;

        // Consulta para actualizar el campo id_posible_adoptador y el estado de la mascota
        const queryUpdate = `
            UPDATE mascotas SET 
            id_posible_adoptador = ?, 
            estado = 'reservado'
            WHERE id_mascota = ?
        `;
        const paramsUpdate = [id_posible_adoptador, mascotaId];

        // Ejecutar la consulta
        const [result] = await pool.query(queryUpdate, paramsUpdate);

        // Verificar si se actualizó alguna fila
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Mascota no encontrada" });
        }

        // Enviar notificación al dueño actual de la mascota
        const queryNotificacion = `
            INSERT INTO notificaciones (id_usuario, mensaje, fecha, id_mascota)
            VALUES (?, ?, NOW(), ?)
        `;
        const mensajeNotificacion = `La mascota con ID ${mascotaId} ha sido reservada por el adoptador con ID ${id_posible_adoptador}.`;

        await pool.query(queryNotificacion, [id_usuario_dador, mensajeNotificacion, mascotaId]);

        res.status(200).json({ message: "Notificación de adopción enviada con éxito. La mascota ha sido reservada." });
    } catch (error) {
        console.error("Error al notificar adopción:", error);
        res.status(500).json({ message: "Error al notificar adopción" });
    }
};







// Controlador para rechazar la solicitud de adopción de una mascota
export const rechazarAdopcion = async (req, res) => {
    try {
        // Extraer el id de la mascota del cuerpo de la solicitud
        const { mascotaId } = req.body;

        // Verificar si el parámetro requerido está presente
        if (!mascotaId) {
            return res.status(400).json({ message: "El ID de la mascota es requerido" });
        }

        // Consulta para actualizar el campo id_posible_adoptador a NULL y el estado de la mascota a 'en adopción'
        const query = `
            UPDATE mascotas SET 
            id_posible_adoptador = NULL, 
            estado = 'en adopcion'
            WHERE id_mascota = ?
        `;
        const params = [mascotaId];

        // Ejecutar la consulta
        const [result] = await pool.query(query, params);

        // Verificar si se actualizó alguna fila
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Mascota no encontrada" });
        }

        res.status(200).json({ message: "Adopción rechazada y mascota puesta en adopción nuevamente." });
    } catch (error) {
        console.error("Error al rechazar adopción:", error);
        res.status(500).json({ message: "Error al rechazar adopción" });
    }
};


export const aceptarAdopcion = async (req, res) => {
    try {
        const { mascotaId } = req.body;

        if (!mascotaId) {
            return res.status(400).json({ message: "El ID de la mascota es requerido" });
        }

        // Obtener la conexión
        const conn = await pool.getConnection();
        try {
            // Iniciar la transacción
            await conn.beginTransaction();

            console.log("Iniciando transacción para la adopción...");

            // Consultar la mascota para obtener los IDs necesarios
            const querySelect = `SELECT id_posible_adoptador, id_usuario FROM mascotas WHERE id_mascota = ?`;
            const [mascotaRows] = await conn.query(querySelect, [mascotaId]);

            if (mascotaRows.length === 0) {
                return res.status(404).json({ message: "Mascota no encontrada" });
            }

            const id_usuario_adoptante = mascotaRows[0].id_posible_adoptador;
            const id_usuario_dador = mascotaRows[0].id_usuario;

            if (!id_usuario_adoptante) {
                return res.status(400).json({ message: "No hay un posible adoptador para esta mascota." });
            }

            // Actualizar el estado de la mascota a "adoptado" (no modificar id_usuario)
            const queryUpdate = `
                UPDATE mascotas SET 
                estado = 'adoptado'
                WHERE id_mascota = ?
            `;
            const [updateResult] = await conn.query(queryUpdate, [mascotaId]);
            console.log("Resultado de la actualización de mascota:", updateResult);

            if (updateResult.affectedRows === 0) {
                throw new Error("No se pudo actualizar el estado de la mascota.");
            }

            // Crear la adopción
            const queryInsertAdopcion = `
                INSERT INTO adopciones (id_mascota, id_usuario_adoptante, id_usuario_dador, fecha_adopcion)
                VALUES (?, ?, ?, NOW())
            `;
            const [insertResult] = await conn.query(queryInsertAdopcion, [mascotaId, id_usuario_adoptante, id_usuario_dador]);
            console.log("Resultado de la inserción en adopciones:", insertResult);

            if (insertResult.affectedRows === 0) {
                throw new Error("No se pudo registrar la adopción.");
            }

            // Confirmar la transacción
            await conn.commit();
            console.log("Transacción completada con éxito");

            res.status(201).json({ message: "Adopción aceptada. La mascota ha sido adoptada y la adopción creada con éxito." });
        } catch (error) {
            await conn.rollback();
            console.error("Error en la transacción de adopción:", error);
            res.status(500).json({ message: "Error al aceptar adopción y crear adopción" });
        } finally {
            // Liberar la conexión
            conn.release();
        }
    } catch (error) {
        console.error("Error al procesar la solicitud:", error);
        res.status(500).json({ message: "Error al procesar la solicitud de adopción" });
    }
};


export const listarMascotasPendientesAdopcion = async (req, res) => {
    try {
        const { idUsuario } = req.params; // Obtener el ID del usuario desde los parámetros de la solicitud

        if (!idUsuario) {
            return res.status(400).json({ message: "El ID del usuario es requerido" });
        }

        // Consultar las mascotas del dueño donde el estado de adopción es "reservado"
        // y unir con la tabla de usuarios para obtener detalles del adoptante
        const queryMascotasPendientes = `
            SELECT 
                m.id_mascota, 
                m.nombre AS nombre_mascota, 
                m.fecha_nacimiento_aprox, 
                m.especie, 
                m.raza, 
                m.genero, 
                m.descripcion, 
                m.estado, 
                m.id_departamento,
                m.id_municipio,
                m.foto_principal_url,
                u.nombre AS nombre_adoptante,
                u.apellido AS apellido_adoptante
            FROM mascotas m
            JOIN usuarios u ON m.id_posible_adoptador = u.id_usuario
            WHERE m.id_usuario = ? AND m.estado = 'reservado'
        `;
        
        const [mascotasPendientes] = await pool.query(queryMascotasPendientes, [idUsuario]);

        // Log de los datos obtenidos de la consulta
        console.log('Mascotas pendientes de adopción:', mascotasPendientes);

        if (mascotasPendientes.length === 0) {
            return res.status(404).json({ message: "No hay adopciones pendientes para este usuario." });
        }

        // Estructurar la respuesta con los detalles obtenidos
        const mascotasConDetalles = mascotasPendientes.map(mascota => ({
            idMascota: mascota.id_mascota,
            nombreMascota: mascota.nombre_mascota,
            fechaNacimientoAprox: mascota.fecha_nacimiento_aprox,
            especie: mascota.especie,
            raza: mascota.raza,
            genero: mascota.genero,
            descripcion: mascota.descripcion,
            estado: mascota.estado,
            idDepartamento: mascota.id_departamento,
            idMunicipio: mascota.id_municipio,
            fotoPrincipalUrl: mascota.foto_principal_url,
            nombreAdoptante: mascota.nombre_adoptante,
            apellidoAdoptante: mascota.apellido_adoptante
        }));

        // Log de los datos estructurados para la respuesta
        console.log('Mascotas con detalles:', mascotasConDetalles);

        res.status(200).json({ mascotas: mascotasConDetalles });
    } catch (error) {
        console.error("Error al listar mascotas pendientes de adopción:", error);
        res.status(500).json({ message: "Error al listar mascotas pendientes de adopción" });
    }
};

export const listarMascotasPendientesAdopcionuser = async (req, res) => {
    try {
        const { idUsuario } = req.params;

        if (!idUsuario) {
            return res.status(400).json({ message: "El ID del usuario es requerido" });
        }

        const queryMascotasPendientes = `
            SELECT 
                m.id_mascota, 
                m.nombre AS nombre_mascota, 
                m.fecha_nacimiento_aprox, 
                m.especie, 
                m.raza, 
                m.genero, 
                m.descripcion, 
                m.estado, 
                m.id_departamento,
                m.id_municipio,
                m.foto_principal_url,
                u.nombre AS nombre_adoptante,
                u.apellido AS apellido_adoptante,
                CASE
                    WHEN m.estado = 'adoptado' THEN 'Adopción aceptada'
                    WHEN m.estado = 'en adopcion' THEN 'Adopción rechazada'
                    ELSE 'Pendiente de adopción'
                END AS estado_adopcion
            FROM mascotas m
            JOIN usuarios u ON m.id_posible_adoptador = u.id_usuario
            WHERE m.id_posible_adoptador = ? 
              AND m.estado IN ('reservado', 'adoptado', 'en adopcion', 'pendiente')
        `;
        
        const [mascotasPendientes] = await pool.query(queryMascotasPendientes, [idUsuario]);

        // Log de los datos obtenidos de la consulta
        console.log('Mascotas pendientes de adopción:', mascotasPendientes);

        // Verificar si la consulta retorna resultados
        if (mascotasPendientes.length === 0) {
            return res.status(404).json({ message: "No hay adopciones para este usuario." });
        }

        // Estructurar la respuesta con los detalles obtenidos
        const mascotasConDetalles = mascotasPendientes.map(mascota => ({
            idMascota: mascota.id_mascota,
            nombreMascota: mascota.nombre_mascota,
            fechaNacimientoAprox: mascota.fecha_nacimiento_aprox,
            especie: mascota.especie,
            raza: mascota.raza,
            genero: mascota.genero,
            descripcion: mascota.descripcion,
            estado: mascota.estado_adopcion,
            idDepartamento: mascota.id_departamento,
            idMunicipio: mascota.id_municipio,
            fotoPrincipalUrl: mascota.foto_principal_url,
            nombreAdoptante: mascota.nombre_adoptante,
            apellidoAdoptante: mascota.apellido_adoptante
        }));

        // Log de los datos estructurados para la respuesta
        console.log('Mascotas con detalles:', mascotasConDetalles);

        res.status(200).json({ mascotas: mascotasConDetalles });
    } catch (error) {
        console.error("Error al listar mascotas pendientes de adopción:", error);
        res.status(500).json({ message: "Error al listar mascotas pendientes de adopción" });
    }
};