import { pool } from "../../db/conexion.js";
import { validationResult } from "express-validator";
import multer from "multer";
import path from 'path'
import { parseISO, differenceInYears } from 'date-fns';



const petStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/img/pets'); // Carpeta de destino
    },
    filename: function (req, file, cb) {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName); // Usa el nombre único
    },
});

const petFile = multer({ 
    storage: petStorage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido'), false);
        }
    }
}).single('foto_principal_url');



export const listarMascotaPorId = async (req, res) => {
    try {
        const { idMascota } = req.params; // Obtener el ID de la mascota desde los parámetros de la solicitud

        // Consulta para obtener los detalles de la mascota y la información del adoptante
        const queryMascota = `
            SELECT m.*, u.nombre AS nombre_adoptante, u.apellido AS apellido_adoptante
            FROM mascotas m
            LEFT JOIN usuarios u ON m.id_posible_adoptador = u.id_usuario
            WHERE m.id_mascota = ?;
        `;
        const [mascotas] = await pool.query(queryMascota, [idMascota]);

        if (mascotas.length === 0) {
            return res.status(404).json({ message: "Mascota no encontrada" });
        }

        const mascota = mascotas[0];

        const queryGeneros = 'SELECT * FROM genero';
        const [generos] = await pool.query(queryGeneros);

        const generosMap = generos.reduce((acc, genero) => {
            acc[genero.id_genero] = genero.nombre;
            return acc;
        }, {});

        // Consultar el nombre de la especie
        const queryEspecie = 'SELECT nombre FROM especies WHERE id_especie = ?';
        const [especie] = await pool.query(queryEspecie, [mascota.especie]);
        const nombreEspecie = especie.length > 0 ? especie[0].nombre : 'Desconocida';

        // Consultar el nombre de la raza
        const queryRaza = 'SELECT nombre FROM razas WHERE id_raza = ?';
        const [raza] = await pool.query(queryRaza, [mascota.raza]);
        const nombreRaza = raza.length > 0 ? raza[0].nombre : 'Desconocida';

        const queryDepartment = 'SELECT nombre FROM departamentos WHERE id_departamento = ?';
        const [id_departamento] = await pool.query(queryDepartment, [mascota.id_departamento]);
        const nombreDepartment = id_departamento.length > 0 ? id_departamento[0].nombre : 'Desconocida';

        const queryMunicipios = 'SELECT nombre FROM municipios WHERE id_municipio = ?';
        const [id_municipio] = await pool.query(queryMunicipios, [mascota.id_municipio]);
        const nombreMunicipio = id_municipio.length > 0 ? id_municipio[0].nombre : 'Desconocida';

        const edad = mascota.fecha_nacimiento_aprox ? calcularEdad(mascota.fecha_nacimiento_aprox) : 'Desconocida';

        const mascotaConDetalles = {
            ...mascota,
            nombre_genero: generosMap[mascota.genero] || 'Desconocido',
            nombreEspecie: nombreEspecie,
            nombreRaza: nombreRaza,
            nombreDepartment: nombreDepartment,
            nombreMunicipio: nombreMunicipio,
            edad,
            nombre_adoptante: mascota.nombre || 'No asignado',
            apellido_adoptante: mascota.apellido_adoptante || 'No asignado'
        };

        res.status(200).json({ mascota: mascotaConDetalles });
    } catch (error) {
        console.error("Error al listar mascota por ID:", error);
        res.status(500).json({ message: "Error al listar mascota por ID" });
    }
};





const calcularEdad = (fechaNacimiento) => {
    const fechaNacimientoDate = new Date(fechaNacimiento);
    
    if (isNaN(fechaNacimientoDate.getTime())) {
        throw new Error('Fecha de nacimiento no válida');
    }

    const hoy = new Date();
    let edadAnios = hoy.getFullYear() - fechaNacimientoDate.getFullYear();
    let edadMeses = hoy.getMonth() - fechaNacimientoDate.getMonth();
    let edadDias = hoy.getDate() - fechaNacimientoDate.getDate();

    // Ajustar meses y años si el mes de nacimiento aún no ha pasado este año
    if (edadMeses < 0) {
        edadAnios--;
        edadMeses += 12;
    }

    // Ajustar los días si aún no ha pasado el día de nacimiento en este mes
    if (edadDias < 0) {
        edadMeses--;
        const ultimoDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
        edadDias += ultimoDiaMesAnterior;
    }

    // Retornar el resultado en un string como "edadEnAnios"
    const edadEnAnios = `${edadAnios} años, ${edadMeses} meses y ${edadDias} días`;
    
    return edadEnAnios;
};


export const listarMascotas = async (req, res) => {
    try {
        const queryMascotas = 'SELECT * FROM mascotas';
        const [mascotas] = await pool.query(queryMascotas);
        console.log("Mascotas:", mascotas); // Depuración

        const queryGeneros = 'SELECT * FROM genero';
        const [generos] = await pool.query(queryGeneros);
        console.log("Géneros:", generos); // Depuración

        const generosMap = generos.reduce((acc, genero) => {
            acc[genero.id_genero] = genero.nombre;
            return acc;
        }, {});
        console.log("Mapa de Géneros:", generosMap); // Depuración

        const mascotasConGenero = mascotas.map(mascota => {
            const edad = mascota.fecha_nacimiento_aprox ? calcularEdad(mascota.fecha_nacimiento_aprox) : 'Desconocida';

            return {
                ...mascota,
                nombre_genero: generosMap[mascota.genero] || 'Desconocido',
                edad
            };
        });
        console.log("Mascotas con Género y Edad:", mascotasConGenero); // Depuración

        res.status(200).json({ mascotas: mascotasConGenero });
    } catch (error) {
        console.error("Error al listar mascotas:", error);
        res.status(500).json({ message: "Error al listar mascotas" });
    }
};

export const listarMascotasUrgentes = async (req, res) => {
    try {
        // Filtramos por estados específicos
        const queryMascotas = `
            SELECT * 
            FROM mascotas 
            WHERE estado IN ('en adopción', 'urgente')
        `;
        const [mascotas] = await pool.query(queryMascotas);
        console.log("Mascotas:", mascotas); // Depuración

        const queryGeneros = 'SELECT * FROM genero';
        const [generos] = await pool.query(queryGeneros);
        console.log("Géneros:", generos); // Depuración

        // Mapeamos los géneros para facilitar la asignación a las mascotas
        const generosMap = generos.reduce((acc, genero) => {
            acc[genero.id_genero] = genero.nombre;
            return acc;
        }, {});
        console.log("Mapa de Géneros:", generosMap); // Depuración

        // Asociamos cada mascota con su género correspondiente y calculamos la edad
        const mascotasConGenero = mascotas.map(mascota => {
            const edad = mascota.fecha_nacimiento_aprox ? calcularEdad(mascota.fecha_nacimiento_aprox) : 'Desconocida';

            return {
                ...mascota,
                nombre_genero: generosMap[mascota.genero] || 'Desconocido',
                edad
            };
        });
        console.log("Mascotas con Género y Edad:", mascotasConGenero); // Depuración

        // Devolvemos las mascotas filtradas y enriquecidas con género y edad
        res.status(200).json({ mascotas: mascotasConGenero });
    } catch (error) {
        console.error("Error al listar mascotas:", error);
        res.status(500).json({ message: "Error al listar mascotas" });
    }
};
export const listarMascotasPorUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.params;

        if (!id_usuario) {
            return res.status(400).json({ message: "ID de usuario es requerido" });
        }

        // Consulta para obtener las mascotas y la información del adoptante
        const queryMascotas = `
            SELECT m.*, u.nombre AS nombre_adoptante, u.apellido AS apellido_adoptante
            FROM mascotas m
            LEFT JOIN usuarios u ON m.id_posible_adoptador = u.id_usuario
            WHERE m.id_usuario = ?;
        `;
        const [mascotas] = await pool.query(queryMascotas, [id_usuario]);
        console.log("Mascotas:", mascotas); // Depuración

        const queryGeneros = 'SELECT * FROM genero';
        const [generos] = await pool.query(queryGeneros);
        console.log("Géneros:", generos); // Depuración

        const generosMap = generos.reduce((acc, genero) => {
            acc[genero.id_genero] = genero.nombre;
            return acc;
        }, {});
        console.log("Mapa de Géneros:", generosMap); // Depuración

        // Mapear las mascotas con el género y la edad calculada
        const mascotasConGenero = mascotas.map(mascota => {
            const edad = mascota.fecha_nacimiento_aprox ? calcularEdad(mascota.fecha_nacimiento_aprox) : 'Desconocida';

            return {
                ...mascota,
                nombre_genero: generosMap[mascota.genero] || 'Desconocido',
                edad,
                nombre_adoptante: mascota.nombre_adoptante || 'No asignado',
                apellido_adoptante: mascota.apellido_adoptante || 'No asignado'
            };
        });
        console.log("Mascotas con Género y Edad:", mascotasConGenero); // Depuración

        // Enviar la respuesta con las mascotas
        res.status(200).json({ mascotas: mascotasConGenero });
    } catch (error) {
        console.error("Error al listar mascotas:", error);
        res.status(500).json({ message: "Error al listar mascotas" });
    }
};

// Listar todas las mascotas
// export const listarMascotas = async (req, res) => {
//     try {
//         const query = 'SELECT * FROM mascotas';
//         const [rows] = await pool.query(query);
//         res.status(200).json({ mascotas: rows });
//     } catch (error) {
//         console.error("Error al listar mascotas:", error);
//         res.status(500).json({ message: "Error al listar mascotas" });
//     }
// };

export const crearMascota = (req, res) => {
    petFile(req, res, async (err) => {
        if (err) {
            console.error("Error al subir archivo:", err);
            return res.status(500).json({ message: "Error al subir archivo", error: err });
        }

        // Verifica si el archivo fue subido
        if (!req.file) {
            return res.status(400).json({ message: "No se ha proporcionado una imagen o tipo de archivo no permitido" });
        }

        try {
            // Validar los datos
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.error("Errores de validación:", errors.array());
                return res.status(400).json({ errors: errors.array() });
            }

            const { especie, raza, nombre, fecha_nacimiento_aprox, estado, descripcion, esterilizacion, tamanoMascota, peso, genero, id_departamento, id_municipio, id_usuario, alergias, desparasitado, con_microchip, vacunado, caracteristicas } = req.body;
            const foto_principal_url = req.file.filename; // El archivo debería estar disponible aquí

            console.log("Datos recibidos para crear mascota:", {
                especie, raza, nombre, fecha_nacimiento_aprox, estado, descripcion, esterilizacion, tamanoMascota, peso, genero, id_departamento, id_municipio, id_usuario, foto_principal_url,alergias, desparasitado, con_microchip, vacunado, caracteristicas
            });

            if (!especie || !raza || !nombre || !estado || !tamanoMascota || !id_departamento) {
                return res.status(400).json({ message: "Todos los campos obligatorios deben ser completados" });
            }

            const query = `
                INSERT INTO mascotas (especie, raza, nombre, fecha_nacimiento_aprox, estado, descripcion, esterilizacion, tamaño, peso, genero, id_departamento, id_municipio, id_usuario, foto_principal_url, alergias,  desparasitado, con_microchip, vacunado, caracteristicas)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?)
            `;
            await pool.query(query, [especie, raza, nombre, fecha_nacimiento_aprox, estado, descripcion, esterilizacion, tamanoMascota, peso, genero, id_departamento, id_municipio, id_usuario, foto_principal_url, alergias,  desparasitado, con_microchip, vacunado, caracteristicas]);

            res.status(201).json({ message: "Mascota creada con éxito" });
        } catch (error) {
            console.error("Error al crear mascota:", error);
            res.status(500).json({ message: "Error al crear mascota" });
        }
    });
};

export const actualizarMascota = async (req, res) => {
    petFile(req, res, async (err) => {
        if (err) {
            console.error("Error al subir archivo:", err);
            return res.status(500).json({ message: "Error al subir archivo", error: err });
        }

        try {
            // Validar los datos
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.error("Errores de validación:", errors.array());
                return res.status(400).json({ errors: errors.array() });
            }

            // Extraer el id de la mascota y los datos del cuerpo de la solicitud
            const { mascotaId } = req.params;
            const {
                especie,
                raza,
                nombre,
                fecha_nacimiento_aprox,
                estado,
                descripcion,
                esterilizacion,
                tamanoMascota,
                peso,
                genero,
                id_departamento,
                id_municipio,
                id_usuario,
                desparasitado,
                con_microchip,
                vacunado,
                caracteristicas
            } = req.body;

            // Usa el archivo subido o el valor actual si no se ha subido un nuevo archivo
            const foto_principal_url = req.file ? req.file.filename : req.body.foto_principal_url;

            // Construir la consulta SQL
            const query = `
                UPDATE mascotas SET 
                especie = COALESCE(?, especie),
                raza = COALESCE(?, raza),
                nombre = COALESCE(?, nombre),
                fecha_nacimiento_aprox = COALESCE(?, fecha_nacimiento_aprox),
                estado = COALESCE(?, estado),
                descripcion = COALESCE(?, descripcion),
                esterilizacion = COALESCE(?, esterilizacion),
                tamaño = COALESCE(?, tamaño),
                peso = COALESCE(?, peso),
                genero = COALESCE(?, genero),
                id_departamento = COALESCE(?, id_departamento),
                id_municipio = COALESCE(?, id_municipio),
                id_usuario = COALESCE(?, id_usuario),
                foto_principal_url = COALESCE(?, foto_principal_url),
                desparasitado = COALESCE(?, desparasitado),
                con_microchip = COALESCE(?, con_microchip),
                vacunado = COALESCE(?, vacunado),
                caracteristicas = COALESCE(?, caracteristicas)
                WHERE id_mascota = ?
            `;
            const params = [
                especie, raza, nombre, fecha_nacimiento_aprox, estado,
                descripcion, esterilizacion, tamanoMascota, peso, genero,
                id_departamento, id_municipio, id_usuario, foto_principal_url,
                desparasitado, con_microchip, vacunado, caracteristicas, mascotaId
            ];

            // Ejecutar la consulta
            const [result] = await pool.query(query, params);

            // Verificar si se actualizó alguna fila
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Mascota no encontrada" });
            }

            res.status(200).json({ message: "Mascota actualizada con éxito" });
        } catch (error) {
            console.error("Error al actualizar mascota:", error);
            res.status(500).json({ message: "Error al actualizar mascota" });
        }
    });
};




// Eliminar una mascota
export const eliminarMascota = async (req, res) => {
    try {
        const { mascotaId } = req.params;

        const query = 'DELETE FROM mascotas WHERE id_mascota = ?';
        const [result] = await pool.query(query, [mascotaId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Mascota no encontrada" });
        }

        res.status(200).json({ message: "Mascota eliminada con éxito" });
    } catch (error) {
        console.error("Error al eliminar mascota:", error);
        res.status(500).json({ message: "Error al eliminar mascota" });
    }
};




export const listarMascotasAdoptadasPorUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.params;

        if (!id_usuario) {
            return res.status(400).json({ message: "ID de usuario es requerido" });
        }

        // Consulta para obtener las mascotas adoptadas por el usuario
        const queryMascotas = `
            SELECT m.*, u.nombre AS nombre_adoptante, u.apellido AS apellido_adoptante
            FROM mascotas m
            LEFT JOIN usuarios u ON m.id_posible_adoptador = u.id_usuario
            WHERE m.id_posible_adoptador = ? AND m.estado = 'adoptado';
        `;
        const [mascotas] = await pool.query(queryMascotas, [id_usuario]);
        console.log("Mascotas adoptadas:", mascotas); // Depuración

        const queryGeneros = 'SELECT * FROM genero';
        const [generos] = await pool.query(queryGeneros);
        console.log("Géneros:", generos); // Depuración

        const generosMap = generos.reduce((acc, genero) => {
            acc[genero.id_genero] = genero.nombre;
            return acc;
        }, {});
        console.log("Mapa de Géneros:", generosMap); // Depuración

        // Mapear las mascotas con el género y la edad calculada
        const mascotasConGenero = mascotas.map(mascota => {
            const edad = mascota.fecha_nacimiento_aprox ? calcularEdad(mascota.fecha_nacimiento_aprox) : 'Desconocida';

            return {
                ...mascota,
                nombre_genero: generosMap[mascota.genero] || 'Desconocido',
                edad,
                nombre_adoptante: mascota.nombre_adoptante || 'No asignado',
                apellido_adoptante: mascota.apellido_adoptante || 'No asignado'
            };
        });
        console.log("Mascotas con Género y Edad:", mascotasConGenero); // Depuración

        // Enviar la respuesta con las mascotas adoptadas
        res.status(200).json({ mascotas: mascotasConGenero });
    } catch (error) {
        console.error("Error al listar mascotas adoptadas por usuario:", error);
        res.status(500).json({ message: "Error al listar mascotas adoptadas por usuario" });
    }
};