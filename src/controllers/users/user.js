import { pool } from "../../db/conexion.js";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { userFile } from "../../middlewares/multer.js";
import multer from "multer";

// Middleware para manejar la carga de imágenes
export const uploadUserImage = (req, res, next) => {
    userFile(req, res, (err) => {
        if (err) {
            console.error('Error en Multer:', err); 
            return res.status(500).json({ message: "Error al cargar la imagen" });
        }
        next();
    });
};

// Registro de usuarios
export const registerUser = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error("Errores de validación:", errors.array());
        return res.status(400).json({ errors: errors.array() });
      }
  
      const {
        nombre,
        apellido,
        id_departamento,
        id_municipio,
        telefono,
        correo,
        tipo_documento,
        documento_identidad,
        password,
      } = req.body;
  
      if (!password) {
        return res.status(400).json({ message: "La contraseña es requerida" });
      }
  
      const fotografia = req.file ? req.file.filename : null;
  
      // Verificar si el correo ya está registrado
      const [existingEmail] = await pool.query("SELECT * FROM usuarios WHERE correo = ?", [correo]);
      if (existingEmail.length > 0) {
        return res.status(409).json({ message: "El correo ya está registrado." });
      }
  
      // Verificar si el documento de identidad ya está registrado
      const [existingDocument] = await pool.query("SELECT * FROM usuarios WHERE documento_identidad = ?", [documento_identidad]);
      if (existingDocument.length > 0) {
        return res.status(409).json({ message: "El documento de identidad ya está registrado." });
      }
  
      // Verificar si el teléfono ya está registrado
      const [existingPhone] = await pool.query("SELECT * FROM usuarios WHERE telefono = ?", [telefono]);
      if (existingPhone.length > 0) {
        return res.status(409).json({ message: "El teléfono ya está registrado." });
      }
  
      // Si todas las verificaciones pasaron, proceder con el registro
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      const rol = "adoptador"; // Rol asignado directamente
  
      const query = `
        INSERT INTO usuarios (
          nombre, apellido, id_departamento, id_municipio, telefono, correo, tipo_documento, documento_identidad, password, fotografia, rol
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await pool.query(query, [
        nombre,
        apellido,
        id_departamento,
        id_municipio,
        telefono,
        correo,
        tipo_documento,
        documento_identidad,
        hashedPassword,
        fotografia,
        rol,
      ]);
  
      res.status(201).json({ message: "Usuario registrado con éxito" });
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      res.status(500).json({ message: "Error al registrar usuario" });
    }
  };
  
// Listar usuarios
export const ListarUsers = async (req, res) => {
    try {
        const query = 'SELECT * FROM usuarios';
        const [rows] = await pool.query(query);

        res.status(200).json({ users: rows });

    } catch (error) {
        console.error("Error al listar usuarios:", error);
        res.status(500).json({ message: "Error al listar usuarios" });
    }
};

export const ListarUsersId = async (req, res) => {
    try {
        const { id } = req.params; // Extrae el id_usuario de los parámetros de la solicitud

        let query;
        let queryParams = [];

        if (id) {
            // Si se proporciona un id_usuario, consulta solo ese usuario
            query = 'SELECT * FROM usuarios WHERE id_usuario = ?';
            queryParams = [id];
        } else {
            // Si no se proporciona un id_usuario, consulta todos los usuarios
            query = 'SELECT * FROM usuarios';
        }

        const [rows] = await pool.query(query, queryParams);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron usuarios.' });
        }

        res.status(200).json({ users: rows });

    } catch (error) {
        console.error("Error al listar usuarios:", error);
        res.status(500).json({ message: "Error al listar usuarios" });
    }
};


// Actualizar usuarios
export const updateUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error("Errores de validación:", errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: "ID de usuario es requerido" });
        }

        const {
            nombre,
            apellido,
            id_departamento,
            id_municipio,
            telefono,
            correo,
            tipo_documento,
            documento_identidad,
            password,
            rol,
            descripcion,
            estado,
        } = req.body;

        const fotografia = req.file ? req.file.filename : null;

        // Verifica que los valores sean válidos
        console.log({ nombre, apellido, id_departamento, id_municipio, telefono, correo, tipo_documento, documento_identidad, password, rol, descripcion, estado });

        let query = `UPDATE usuarios SET 
            nombre = COALESCE(?, nombre),
            apellido = COALESCE(?, apellido),
            id_departamento = COALESCE(?, id_departamento),
            id_municipio = COALESCE(?, id_municipio),
            telefono = COALESCE(?, telefono),
            correo = COALESCE(?, correo),
            tipo_documento = COALESCE(?, tipo_documento),
            documento_identidad = COALESCE(?, documento_identidad),
            fotografia = COALESCE(?, fotografia),
            rol = COALESCE(?, rol),
            descripcion = COALESCE(?, descripcion),
            estado = COALESCE(?, estado)
        `;

        const params = [
            nombre, apellido, id_departamento, id_municipio,
            telefono, correo, tipo_documento, documento_identidad,
            fotografia, rol, descripcion, estado
        ];

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            query += ', password = ?';
            params.push(hashedPassword);
        }

        query += ' WHERE id_usuario = ?';
        params.push(userId);

        // Debugging the query and parameters
        console.log("Query:", query);
        console.log("Parameters:", params);

        await pool.query(query, params);

        res.status(200).json({ message: "Usuario actualizado con éxito" });

    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ message: "Error al actualizar usuario" });
    }
};
