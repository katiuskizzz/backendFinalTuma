import { pool } from "../../db/conexion.js";
import { validationResult } from "express-validator";

// Listar todos los municipios
export const listarMunicipios = async (req, res) => {
    try {
        // Obtén el id del departamento desde los parámetros de la solicitud
        const { idDepartamento } = req.params;

        // Asegúrate de que idDepartamento esté definido y sea un número entero
        if (!idDepartamento || isNaN(parseInt(idDepartamento))) {
            return res.status(400).json({ message: "ID del departamento inválido" });
        }

        // Consulta SQL con parámetro para filtrar por idDepartamento
        const query = 'SELECT * FROM municipios WHERE id_departamento = ?';
        const [rows] = await pool.query(query, [idDepartamento]);

        res.status(200).json({ municipios: rows });
    } catch (error) {
        console.error("Error al listar municipios:", error);
        res.status(500).json({ message: "Error al listar municipios" });
    }
};


export const crearMunicipio = async (req, res) => {
    try {
      // Obtén el id del departamento desde los parámetros de la solicitud
      const { idDepartamento } = req.params;
  
      // Asegúrate de que idDepartamento esté definido y sea un número entero
      if (!idDepartamento || isNaN(parseInt(idDepartamento))) {
        return res.status(400).json({ message: "ID del departamento inválido" });
      }
  
      // Validar los datos
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error("Errores de validación:", errors.array());
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { nombre, estado, codigo_dane } = req.body;
  
      if (!nombre || !estado || !codigo_dane) {
        return res.status(400).json({ message: "Todos los campos son requeridos" });
      }
  
      const query = `
        INSERT INTO municipios (codigo_dane, nombre, estado, id_departamento)
        VALUES (?, ?, ?, ?)
      `;
      await pool.query(query, [codigo_dane, nombre, estado, idDepartamento]);
  
      res.status(201).json({ message: "Municipio creado con éxito" });
    } catch (error) {
      console.error("Error al crear municipio:", error);
      res.status(500).json({ message: "Error al crear municipio" });
    }
  };

  export const actualizarMunicipio = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error("Errores de validación:", errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { municipioId } = req.params;
        const { codigo_dane, nombre, estado, id_departamento } = req.body;

        if (!codigo_dane && !nombre && !estado && !id_departamento) {
            return res.status(400).json({ message: "Ningún dato proporcionado para actualizar" });
        }

        let query = `UPDATE municipios SET`;
        const params = [];

        if (codigo_dane !== undefined) {
            query += " codigo_dane = ?,";
            params.push(codigo_dane);
        }
        if (nombre !== undefined) {
            query += " nombre = ?,";
            params.push(nombre);
        }
        if (estado !== undefined) {
            query += " estado = ?,";
            params.push(estado);
        }
        if (id_departamento !== undefined) {
            query += " id_departamento = ?,";
            params.push(id_departamento);
        }

        query = query.slice(0, -1); // Remove trailing comma
        query += " WHERE id_municipio = ?";
        params.push(municipioId);

        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Municipio no encontrado" });
        }

        res.status(200).json({ message: "Municipio actualizado con éxito" });
    } catch (error) {
        console.error("Error al actualizar municipio:", error);
        res.status(500).json({ message: "Error al actualizar municipio" });
    }
};


// Eliminar un municipio
export const eliminarMunicipio = async (req, res) => {
    try {
        const { municipioId } = req.params;

        const query = 'DELETE FROM municipios WHERE id_municipio = ?';
        const [result] = await pool.query(query, [municipioId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Municipio no encontrado" });
        }

        res.status(200).json({ message: "Municipio eliminado con éxito" });
    } catch (error) {
        console.error("Error al eliminar municipio:", error);
        res.status(500).json({ message: "Error al eliminar municipio" });
    }
};
