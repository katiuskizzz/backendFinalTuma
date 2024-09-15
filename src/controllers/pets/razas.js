import { pool } from "../../db/conexion.js";
import { validationResult } from "express-validator";

// Listar todas las razas
export const listarRazas = async (req, res) => {
    try {
        const query = 'SELECT * FROM razas';
        const [rows] = await pool.query(query);
        res.status(200).json({ razas: rows });
    } catch (error) {
        console.error("Error al listar razas:", error);
        res.status(500).json({ message: "Error al listar razas" });
    }
};
export const listarRazasPorEspecie = async (req, res) => {
    const { id_especie } = req.params; // Extrae el id_especie de los parámetros de la solicitud

    try {
        const query = 'SELECT * FROM razas WHERE id_especie = ?';
        const [rows] = await pool.query(query, [id_especie]); // Pasa el id_especie como parámetro a la consulta

        res.status(200).json({ razas: rows });
    } catch (error) {
        console.error("Error al listar razas:", error);
        res.status(500).json({ message: "Error al listar razas" });
    }
};


// Crear una nueva raza
export const crearRaza = async (req, res) => {
    try {
        // Validar los datos
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error("Errores de validación:", errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { id_especie, nombre, estado } = req.body;

        if (!id_especie || !nombre || !estado) {
            return res.status(400).json({ message: "Todos los campos son requeridos" });
        }

        const query = `
            INSERT INTO razas (id_especie, nombre, estado)
            VALUES (?, ?, ?)
        `;
        await pool.query(query, [id_especie, nombre, estado]);

        res.status(201).json({ message: "Raza creada con éxito" });
    } catch (error) {
        console.error("Error al crear raza:", error);
        res.status(500).json({ message: "Error al crear raza" });
    }
};

// Actualizar una raza existente
export const actualizarRaza = async (req, res) => {
    try {
        // Validar los datos
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error("Errores de validación:", errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { razaId } = req.params;
        const { nombre, estado } = req.body;

        if (!nombre && !estado) {
            return res.status(400).json({ message: "Ningún dato proporcionado para actualizar" });
        }

        let query = `UPDATE razas SET 
            nombre = COALESCE(?, nombre),
            estado = COALESCE(?, estado)
        WHERE id_raza = ?`; // Eliminar la coma antes de WHERE

        const params = [nombre, estado, razaId];

        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Raza no encontrada" });
        }

        res.status(200).json({ message: "Raza actualizada con éxito" });
    } catch (error) {
        console.error("Error al actualizar raza:", error);
        res.status(500).json({ message: "Error al actualizar raza" });
    }
};


// Eliminar una raza
export const eliminarRaza = async (req, res) => {
    try {
        const { razaId } = req.params;

        const [raza] = await pool.query('SELECT estado FROM razas WHERE id_raza = ?', [razaId]);

        if (raza.length === 0) {
            return res.status(404).json({ message: "Raza no encontrada" });
        }

        if (raza[0].estado !== 'inactivo') {
            return res.status(400).json({ message: "No se puede eliminar la raza, el estado debe ser 'inactivo'" });
        }

        // Eliminar la raza
        const query = 'DELETE FROM razas WHERE id_raza = ?';
        const [result] = await pool.query(query, [razaId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Raza no encontrada" });
        }

        res.status(200).json({ message: "Raza eliminada con éxito" });
    } catch (error) {
        console.error("Error al eliminar raza:", error);
        res.status(500).json({ message: "Error al eliminar raza" });
    }
};

export const desactivarRaza = async (req, res) => {
    try {
        const { razaId } = req.params;

        // Verificar si hay mascotas asociadas a la raza
        const [mascotas] = await pool.query('SELECT COUNT(*) as count FROM mascotas WHERE raza = ?', [razaId]);

        if (mascotas[0].count > 0) {
            return res.status(400).json({ message: "No se puede desactivar la raza, hay mascotas asociadas." });
        }

        // Desactivar la raza
        const [result] = await pool.query('UPDATE razas SET estado = "inactivo" WHERE id_raza = ?', [razaId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Raza no encontrada" });
        }

        res.status(200).json({ message: "Raza desactivada con éxito" });
    } catch (error) {
        console.error("Error al desactivar raza:", error);
        res.status(500).json({ message: "Error al desactivar raza" });
    }
};

export const activarRaza = async (req, res) => {
    try {
        const { razaId } = req.params;

        // Activar la raza
        const [result] = await pool.query('UPDATE razas SET estado = "activo" WHERE id_raza = ?', [razaId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Raza no encontrada" });
        }

        res.status(200).json({ message: "Raza activada con éxito" });
    } catch (error) {
        console.error("Error al activar raza:", error);
        res.status(500).json({ message: "Error al activar raza" });
    }
};