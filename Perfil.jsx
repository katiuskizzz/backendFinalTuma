import React, { useEffect, useState } from "react";
import Template from "../atomic/Template/Template";
import Axiosclin from "../../axiosClient";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../context/User";
import { usePetContext } from "../../context/Mascota";

function PerfilUser() {
    const { userId, userRol } = useUserContext();
    const { setIdMascota } = usePetContext();
    const [usuario, setUsuario] = useState({});
    const [mascotas, setMascotas] = useState([]);
    const [mascotasAdoptadas, setMascotasAdoptadas] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();
    const [editForm, setEditForm] = useState({
        email: "",
        telefono: "",
        nombre: "",
        descripcion: "",
        fotografia: null
    });

    const capitalizeFirstLetter = (string) => {
        if (typeof string !== 'string' || string.length === 0) return "";
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const editarPerfil = async () => {
        if (isEditing) {
            const formData = new FormData();
            formData.append('email', editForm.email);
            formData.append('telefono', editForm.telefono);
            formData.append('nombre', editForm.nombre);
            formData.append('descripcion', editForm.descripcion);
            if (editForm.fotografia) {
                formData.append('fotografia', editForm.fotografia);
            }

            try {
                await Axiosclin.put(`/user/updateUser/${userId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                const response = await Axiosclin.get(`/user/ListarUsersId/${userId}`);
                const usuarioData = response.data.users[0];
                if (usuarioData.fotografia) {
                    usuarioData.fotografia = `http://10.193.144.107:4000/img/users/${usuarioData.fotografia.replace(/\\/g, '/')}`;
                }
                setUsuario(usuarioData);
            } catch (error) {
                console.error("Error al actualizar perfil:", error);
            }
        } else {
            setEditForm({
                email: usuario.correo || "",
                telefono: usuario.telefono || "",
                nombre: usuario.nombre || "",
                descripcion: usuario.descripcion || "",
                fotografia: null
            });
        }
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm({
            ...editForm,
            [name]: value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
    
        // Validar el tipo de archivo
        const validImageTypes = ['image/jpeg', 'image/png'];
        if (file && validImageTypes.includes(file.type)) {
            setEditForm({
                ...editForm,
                fotografia: file
            });
        } else {
            alert('Por favor, selecciona un archivo JPG o PNG.');
            e.target.value = null; // Limpiar el input si el archivo no es válido
        }
    };
    

    const MirarMascota = (id_mascota) => {
        setIdMascota(id_mascota);
        navigate("/mascota");
    };

    const fetchUsuario = async () => {
        if (userId) {
            try {
                const token = localStorage.getItem('token');
                const response = await Axiosclin.get(`/user/ListarUsersId/${userId}`, {
                    headers: { 'token': token }
                });

                if (response.data && response.data.users.length > 0) {
                    const usuarioData = response.data.users[0];

                    if (usuarioData.fotografia) {
                        usuarioData.fotografia = `http://10.193.144.107:4000/img/users/${usuarioData.fotografia.replace(/\\/g, '/')}`;
                    }

                    setUsuario(usuarioData);
                } else {
                    console.error("No se encontraron datos para el usuario con ID:", userId);
                }
            } catch (error) {
                console.error("Error al obtener el usuario:", error);
            }
        }
    };

    const fetchMascotas = async () => {
        if (userId) {
            try {
                const response = await Axiosclin.get(`/pets/${userId}`);
                const mascotasData = Array.isArray(response.data.mascotas)
                    ? response.data.mascotas.map((mascota) => {
                        if (mascota.foto_principal_url) {
                            mascota.foto_principal_url = `http://10.193.144.107:4000/img/pets/${mascota.foto_principal_url.replace(/\\/g, '/')}`;
                        }
                        return { ...mascota, phot: mascota.foto_principal_url };
                    })
                    : [];

                setMascotas(mascotasData);
            } catch (error) {
                console.error("Error al obtener mascotas:", error);
            }
        }
    };

    const fetchAdoptadas = async () => {
        if (userId) {
            try {
                const response = await Axiosclin.get(`/adopciones/MisAdopciones/${userId}`);
                const mascotasAdoptadasData = Array.isArray(response.data.adopciones)
                    ? response.data.adopciones.map((mascota) => {
                        if (mascota.foto_principal_url) {
                            mascota.foto_principal_url = `http://10.193.144.107:4000/img/pets/${mascota.foto_principal_url.replace(/\\/g, '/')}`;
                        }
                        return { ...mascota, phot: mascota.foto_principal_url };
                    })
                    : [];

                setMascotasAdoptadas(mascotasAdoptadasData);
            } catch (error) {
                console.error("Error al obtener mascotas adoptadas:", error);
            }
        }
    };

    useEffect(() => {
        fetchUsuario();
        if (userRol === "administrador") {
            fetchMascotas();
        } else {
            fetchAdoptadas();
        }
    }, [userId, userRol]);

    const getStatusColor = (estado) => {
        switch (estado) {
            case 'en adopción':
                return 'bg-green-500';
            case 'reservado':
                return 'bg-yellow-500';
            case 'urgente':
                return 'bg-red-500';
            case 'adoptado':
                return 'bg-purple-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <Template>
            <div className="profile-card bg-white p-6 rounded-lg shadow-lg flex flex-col md:flex-row items-center">
                <div className="profile-image w-full md:w-1/4 flex justify-center">
                    <img
                        src={usuario.fotografia || "https://via.placeholder.com/150"}
                        alt="User Avatar"
                        className="rounded-full w-48 h-48 border"
                        style={{ objectFit: 'cover' }}
                        onError={(e) => e.target.src = "https://via.placeholder.com/150"}
                    />
                </div>
                <div className="profile-info w-full md:w-3/4 mt-11 md:mt-0 md:ml-6 flex flex-col">
                    <h1 className="text-3xl font-bold mb-4">
                        {capitalizeFirstLetter(usuario.nombre || "Nombre")} {capitalizeFirstLetter(usuario.apellido || "Apellido")}
                    </h1>
                    <div className="info-item mb-2">
                        <span className="font-semibold">Nombre: </span>
                        {isEditing ? (
                            <input
                                type="text"
                                name="nombre"
                                value={editForm.nombre}
                                onChange={handleInputChange}
                                className="border border-gray-300 rounded-md px-2 py-1"
                            />
                        ) : (
                            capitalizeFirstLetter(usuario.nombre || "Nombre")
                        )}
                    </div>
                    <div className="info-item mb-2">
                        <span className="font-semibold">Email: </span>
                        {isEditing ? (
                            <input
                                type="email"
                                name="email"
                                value={editForm.email}
                                onChange={handleInputChange}
                                className="border border-gray-300 rounded-md px-2 py-1"
                            />
                        ) : (
                            usuario.correo || "Email"
                        )}
                    </div>
                    <div className="info-item mb-2">
                        <span className="font-semibold">Teléfono: </span>
                        {isEditing ? (
                            <input
                                type="text"
                                name="telefono"
                                value={editForm.telefono}
                                onChange={handleInputChange}
                                className="border border-gray-300 rounded-md px-2 py-1"
                            />
                        ) : (
                            usuario.telefono || "Teléfono"
                        )}
                    </div>
                    <div className="info-item mb-2">
                        <span className="font-semibold">Descripción: </span>
                        {isEditing ? (
                            <textarea
                                name="descripcion"
                                value={editForm.descripcion}
                                onChange={handleInputChange}
                                className="border border-gray-300 rounded-md px-2 py-1"
                            />
                        ) : (
                            usuario.descripcion || "Descripción"
                        )}
                    </div>
                    {isEditing && (
                        <div className="info-item mb-2">
                            <span className="font-semibold">Fotografía: </span>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="border border-gray-300 rounded-md px-2 py-1"
                            />
                        </div>
                    )}
                    <button 
                        onClick={editarPerfil} 
                        className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition duration-300 self-end mt-4"
                    >
                        {isEditing ? "Guardar Cambios" : "Editar Perfil"}
                    </button>
                </div>
            </div>

            <div className="pets-section mt-10">
                <h2 className="text-2xl font-bold mb-4">Mascotas {userRol === "administrador" ? "Registradas" : "Adoptadas"}</h2>
                <div className="pets-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {(userRol === "administrador" ? mascotas : mascotasAdoptadas).map((mascota) => (
                        <button
                            key={mascota.id_mascota}
                            className="border border-gray-300 rounded-lg p-4 flex flex-col items-center"
                            onClick={() => MirarMascota(mascota.id_mascota)}
                        >
                            <div
                                className={`w-4 h-4 rounded-full mb-2 ${getStatusColor(mascota.estado)}`}
                            ></div>
                            <img
                                src={mascota.phot || "https://via.placeholder.com/150"}
                                alt={mascota.nombre}
                                className="w-32 h-32 object-cover rounded-lg mb-2"
                                onError={(e) => e.target.src = "https://via.placeholder.com/150"}
                            />
                            <p className="text-gray-700">
                                <strong>Nombre:</strong> {capitalizeFirstLetter(mascota.nombre)}
                            </p>
                            <p className="text-gray-700">
                                <strong>Edad:</strong> {mascota.edad} años
                            </p>
                            <p className="text-gray-700">
                                <strong>Género:</strong> {capitalizeFirstLetter(mascota.nombre_genero)}
                            </p>
                        </button>
                    ))}
                </div>
            </div>
        </Template>
    );
}

export default PerfilUser;