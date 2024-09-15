import { pool } from '../../db/conexion.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

import bcrypt from 'bcrypt';

// Función para solicitar restablecimiento de contraseña
export const solicitarCambioContrasena = async (req, res) => {
  const { correo } = req.body;

  try {
    const query = 'SELECT id_usuario FROM usuarios WHERE correo = ?';
    const [rows] = await pool.query(query, [correo]);

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const codigo = Math.floor(100000 + Math.random() * 900000); // Código de 6 dígitos
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1); // Establece la expiración a 1 hora desde ahora

    const updateQuery = 'UPDATE usuarios SET verification_code = ?, verification_code_expiry = ? WHERE correo = ?';
    await pool.query(updateQuery, [codigo, expiryDate, correo]);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: 'tumascota777q@gmail.com',
        pass: 'm b r x c p h v f y d p f i g b'
      }
    });

    transporter.verify().then(() => {
        console.log("Transporte de correo configurado correctamente");
    });

    const mailOptions = {
      from: 'tumascota777q@gmail.com',
      to: correo,
      subject: 'Código de cambio de contraseña',
      text: `Estimado/a usuario/a,
      
      Hemos recibido una solicitud para restablecer la contraseña de su cuenta asociada con este correo electrónico. Para completar el proceso de cambio de contraseña, por favor utilice el siguiente código de verificación:
      
      Código de verificación: ${codigo}
      
      Este código es válido por 1 hora. Si no solicitó un cambio de contraseña, por favor ignore este mensaje.
      
      Para cambiar su contraseña, siga estos pasos:
      1. Ingrese a nuestro sitio web y navegue a la página de cambio de contraseña.
      2. Introduzca su correo electrónico y el código de verificación proporcionado.
      3. Siga las instrucciones para crear una nueva contraseña segura.
      
      Si necesita asistencia adicional, no dude en ponerse en contacto con nuestro equipo de soporte.
      
      Gracias por confiar en nosotros.
      
      Atentamente,
      El equipo de Soporte de Tuma
      tumascota777q@gmail.com`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ mensaje: 'Error al enviar el correo', error });
      } else {
        return res.status(200).json({ mensaje: 'Código enviado correctamente' });
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error del servidor' });
  }
};


export const verificarCodigo = async (req, res) => {
  const { codigo_verificacion, correo } = req.body;

  try {
    const query = 'SELECT id_usuario, verification_code, verification_code_expiry FROM usuarios WHERE correo = ?';
    const [rows] = await pool.query(query, [correo]);

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const user = rows[0];
    
    // Verificar si el código es correcto
    if (user.verification_code !== codigo_verificacion) {
      return res.status(400).json({ mensaje: 'Código incorrecto' });
    }

    // Verificar si el código ha expirado
    const currentDate = new Date();
    if (user.verification_code_expiry < currentDate) {
      return res.status(400).json({ mensaje: 'El código ha expirado' });
    }

    return res.status(200).json({ mensaje: 'Código verificado correctamente' });
  } catch (error) {
    console.error('Error del servidor:', error);
    return res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

export const cambiarContrasena = async (req, res) => {
  const { correo, codigo_verificacion, nueva_contrasena } = req.body;

  try {
      // Buscar el usuario por correo electrónico
      const query = 'SELECT id_usuario, verification_code, verification_code_expiry FROM usuarios WHERE correo = ?';
      const [rows] = await pool.query(query, [correo]);

      if (rows.length === 0) {
          return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }

      const user = rows[0];

      // Verificar si el código es correcto
      if (user.verification_code !== codigo_verificacion) {
          return res.status(400).json({ mensaje: 'Código incorrecto' });
      }

      // Verificar si el código ha expirado
      const currentDate = new Date();
      if (user.verification_code_expiry < currentDate) {
          return res.status(400).json({ mensaje: 'El código ha expirado' });
      }

      // Encriptar la nueva contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(nueva_contrasena, salt);

      // Actualizar la contraseña en la base de datos
      const updateQuery = 'UPDATE usuarios SET password = ? WHERE correo = ?';
      await pool.query(updateQuery, [hashedPassword, correo]);

      res.status(200).json({ mensaje: 'Contraseña cambiada con éxito' });

  } catch (error) {
      console.error('Error del servidor:', error);
      res.status(500).json({ mensaje: 'Error del servidor' });
  }
};


export const validarCampos = async (req, res) => {
  const { identificacion, correo } = req.body;
  
  // Validar que los campos necesarios están presentes
  if (!identificacion || !correo) {
    return res.status(400).json({
      message: 'Faltan campos requeridos: identificacion y/o correo.'
    });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE documento_identidad  = ? AND correo = ?', [identificacion,correo]);
    
    if (rows.length > 0) {
      return res.status(200).json({
        message: 'Datos válidos.'
      });
    } else {
      return res.status(404).json({
        message: 'Datos incorrectos.'
      });
    }
  } catch (error) {
    
    console.error('Error en la consulta a la base de datos:', error);
    return res.status(500).json({
      message: 'Error interno del servidor.'
    });
  }
};

export const CambiaPaswor = async (req, res) => {
  const { identificacion } = req.params; 
  const { password } = req.body; 

  if (!identificacion || !password) {
    return res.status(400).json({
      message: 'Identificación y nueva contraseña son requeridos.'
    });
  }

  try {

    const saltRounds = 10; 
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Actualizar la contraseña en la base de datos
    const [result] = await pool.query(
      'UPDATE usuarios SET password = ? WHERE documento_identidad = ?',
      [hashedPassword, identificacion]
    );

    // Verificar si se actualizó alguna fila
    if (result.affectedRows > 0) {
      return res.status(200).json({
        message: 'Contraseña actualizada exitosamente.'
      });
    } else {
      return res.status(404).json({
        message: 'Usuario no encontrado.'
      });
    }
  } catch (error) {
    // Manejar errores de la consulta y de la base de datos
    console.error('Error en la consulta a la base de datos:', error);
    return res.status(500).json({
      message: 'Error interno del servidor.'
    });
  }
};  