import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { pool } from '../../db/conexion.js';

// Función auxiliar para calcular la edad en años, meses y días
function calcularEdad(fechaNacimiento) {
    const fechaActual = new Date();
    const fechaNac = new Date(fechaNacimiento);
    
    let edadAnios = fechaActual.getFullYear() - fechaNac.getFullYear();
    let edadMeses = fechaActual.getMonth() - fechaNac.getMonth();
    let edadDias = fechaActual.getDate() - fechaNac.getDate();

    if (edadDias < 0) {
        edadMeses--;
        edadDias += new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 0).getDate(); // Obtener el último día del mes actual
    }
    
    if (edadMeses < 0) {
        edadAnios--;
        edadMeses += 12;
    }
    
    return `${edadAnios} años, ${edadMeses} meses y ${edadDias} días`;
}

// Función para formatear fecha en DD/MM/YYYY
function formatearFecha(fecha) {
    const fechaObj = new Date(fecha);
    const dia = fechaObj.getDate().toString().padStart(2, '0');
    const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
    const anio = fechaObj.getFullYear();
    return `${dia}/${mes}/${anio}`;
}

// Función para obtener el historial de vacunas
async function obtenerHistorialVacunas(idMascota) {
    const query = `
        SELECT 
            v.nombre AS nombre_vacuna,  
            DATE_FORMAT(hv.fecha_vacunacion, '%d-%m-%Y') AS fecha_vacunacion,
            hv.descripcion
        FROM 
            historial_vacunas hv
        JOIN 
            vacunas v ON hv.id_vacuna = v.id_vacuna
        WHERE 
            hv.id_mascota = ?
    `;
    const [rows] = await pool.query(query, [idMascota]);
    return rows;
}

export const generarFichaTecnicaPDF = async (req, res) => {
    try {
        const { idMascota } = req.params;

        // Obtener información de la mascota por ID
        const queryMascota = 'SELECT * FROM mascotas WHERE id_mascota = ?';
        const [mascotas] = await pool.query(queryMascota, [idMascota]);

        if (mascotas.length === 0) {
            return res.status(404).json({ message: "Mascota no encontrada" });
        }

        const mascota = mascotas[0];

        // Obtener detalles adicionales
        const queryGeneros = 'SELECT * FROM genero';
        const [generos] = await pool.query(queryGeneros);
        const generosMap = generos.reduce((acc, genero) => {
            acc[genero.id_genero] = genero.nombre;
            return acc;
        }, {});

        const queryEspecie = 'SELECT nombre FROM especies WHERE id_especie = ?';
        const [especie] = await pool.query(queryEspecie, [mascota.especie]);
        const nombreEspecie = especie.length > 0 ? especie[0].nombre : 'Desconocida';

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
        const fechaNacimientoFormateada = mascota.fecha_nacimiento_aprox ? formatearFecha(mascota.fecha_nacimiento_aprox) : 'Desconocida';

        const mascotaConDetalles = {
            ...mascota,
            nombre_genero: generosMap[mascota.genero] || 'Desconocido',
            nombreEspecie: nombreEspecie,
            nombreRaza: nombreRaza,
            nombreDepartment: nombreDepartment,
            nombreMunicipio: nombreMunicipio,
            edad,
            fechaNacimientoFormateada
        };

        // Obtener historial de vacunas
        const historialVacunas = await obtenerHistorialVacunas(idMascota);

        // Construir la ruta completa del archivo PDF
        const fileName = `ficha_tecnica_mascota_${idMascota}.pdf`;
        const pdfDir = path.resolve(process.cwd(), 'src', 'controllers', 'pdf', 'pdfs');
        const filePath = path.join(pdfDir, fileName);

        // Verificar si la carpeta de destino existe y crearla si es necesario
        if (!fs.existsSync(pdfDir)) {
            fs.mkdirSync(pdfDir, { recursive: true });
        }

        // Crear el documento PDF
        const doc = new PDFDocument({ margin: 50 });
        doc.pipe(fs.createWriteStream(filePath));

        // Agregar icono de la aplicación
        const iconPath = path.resolve(process.cwd(), 'public', 'img', 'icon.png');
        if (fs.existsSync(iconPath)) {
            doc.image(iconPath, 50, 50, { width: 50 });
        }

        // Agregar título "Ficha Técnica" centrado
        doc.fontSize(24).text('Ficha Técnica de Mascota', { align: 'center' });

        // Nombre de la mascota grande y centrado
        doc.moveDown(1);
        doc.fontSize(30).text(mascotaConDetalles.nombre || 'Desconocido', { align: 'center' });

        // Agregar imagen de la mascota si existe
        if (mascotaConDetalles.foto_principal_url) {
            const imagePath = path.resolve(process.cwd(), 'public', 'img', 'pets', mascotaConDetalles.foto_principal_url);
            if (fs.existsSync(imagePath)) {
                doc.moveDown(1);
                doc.image(imagePath, {
                    width: 220,
                    align: 'center'
                });
                doc.moveDown(7);
            } else {
                doc.text('Imagen no disponible', { align: 'center' });
            }
        } else {
            doc.text('Imagen no disponible', { align: 'center' });
        }

        // Agregar detalles de la mascota
        doc.fontSize(16)
            .text(`Especie: ${mascotaConDetalles.nombreEspecie}`)
            .text(`Raza: ${mascotaConDetalles.nombreRaza}`)
            .text(`Género: ${mascotaConDetalles.nombre_genero}`)
            .text(`Edad: ${mascotaConDetalles.edad}`)
            .text(`Localidad: ${mascotaConDetalles.nombreDepartment}, ${mascotaConDetalles.nombreMunicipio}`)
            // .text(`Municipio: ${mascotaConDetalles.nombreMunicipio}`)
            .text(`Fecha de Nacimiento Aproximada: ${mascotaConDetalles.fechaNacimientoFormateada}`);

        // Agregar sección de vacunas
        doc.moveDown(2); // Espacio antes de la sección de vacunas
        doc.fontSize(20).text('Historial de Vacunas', { underline: true });

        if (historialVacunas.length > 0) {
            doc.fontSize(16);
            historialVacunas.forEach((vacuna, index) => {
                doc.text(`Vacuna ${index + 1}: ${vacuna.nombre_vacuna} - Fecha: ${vacuna.fecha_vacunacion} `);
            });
        } else {
            doc.fontSize(16).text('No se encontraron vacunas registradas.');
        }

        // Finalizar el PDF
        doc.end();

        // Enviar el PDF como respuesta
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        fs.createReadStream(filePath).pipe(res);

    } catch (error) {
        console.error("Error al generar ficha técnica PDF:", error);
        res.status(500).json({ message: "Error al generar ficha técnica PDF" });
    }
};
