
import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { API_BASE_URL } from '../config';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditProfileModal = ({ show, onHide, userInfo, onUserUpdate }) => {
    const [formData, setFormData] = useState({
        cp_nome: '',
        cp_email: '',
        cp_login: '',
        cp_password: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (userInfo) {
            setFormData({
                cp_nome: userInfo.cp_nome || '',
                cp_email: userInfo.cp_email || '',
                cp_login: userInfo.cp_login || '',
                cp_password: ''
            });
            setPreviewUrl(userInfo.cp_foto_perfil ? `${API_BASE_URL}/${userInfo.cp_foto_perfil}` : '');
        }
    }, [userInfo]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setPreviewUrl(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitConfirm = (e) => {
        e.preventDefault();
        setShowConfirmModal(true);
    };

    const handleSubmit = async () => {
        setShowConfirmModal(false);
        setLoading(true);

        try {
            const userId = localStorage.getItem('userId');

            // Primeiro atualiza os dados básicos
            const updateData = { ...formData };
            if (!updateData.cp_password) {
                delete updateData.cp_password; // Remove senha se estiver vazia
            }

            const response = await fetch(`${API_BASE_URL}/update-profile/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar dados do perfil');
            }

            // Se há arquivo selecionado, faz upload da foto
            if (selectedFile) {
                const formDataPhoto = new FormData();
                formDataPhoto.append('cp_foto_perfil', selectedFile);
                formDataPhoto.append('userId', userId);

                const photoResponse = await fetch(`${API_BASE_URL}/uploadProfilePhoto`, {
                    method: 'POST',
                    body: formDataPhoto
                });

                if (!photoResponse.ok) {
                    throw new Error('Erro ao fazer upload da foto');
                }

                const photoResult = await photoResponse.json();

                // Atualiza o localStorage com a nova foto
                localStorage.setItem('userProfilePhoto', photoResult.filePath);
            }

            // Atualiza o localStorage com os novos dados
            localStorage.setItem('userName', formData.cp_nome);

            // Chama a função de callback para atualizar o estado pai
            if (onUserUpdate) {
                onUserUpdate({
                    ...userInfo,
                    ...formData,
                    cp_foto_perfil: selectedFile ? `/FotoPerfil/${selectedFile.name}` : userInfo.cp_foto_perfil
                });
            }

            // Mostrar toast de sucesso
            toast.success('Perfil atualizado com sucesso!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });

            setTimeout(() => {
                onHide();
            }, 1000);
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            toast.error('Erro ao atualizar perfil: ' + error.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Modal show={show} onHide={onHide} centered size="md">
                <Modal.Header closeButton>
                    <Modal.Title>Editar Perfil</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmitConfirm}>
                        {/* Foto de Perfil */}
                        <div className="text-center mb-4">
                            <div className="position-relative d-inline-block">
                                <img
                                    src={previewUrl || "assets/images/user.png"}
                                    alt="Foto de Perfil"
                                    className="rounded-circle"
                                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                />
                                <Button
                                    variant="primary"
                                    size="sm"
                                    className="position-absolute bottom-0 end-0 rounded-circle"
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{ width: '30px', height: '30px', padding: '0' }}
                                >
                                    <i className="ri-camera-line"></i>
                                </Button>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>

                        {/* Nome */}
                        <Form.Group className="mb-3">
                            <Form.Label>Nome</Form.Label>
                            <Form.Control
                                type="text"
                                name="cp_nome"
                                value={formData.cp_nome}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>

                        {/* Email */}
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="cp_email"
                                value={formData.cp_email}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>

                        {/* Login */}
                        <Form.Group className="mb-3">
                            <Form.Label>Login</Form.Label>
                            <Form.Control
                                type="text"
                                name="cp_login"
                                value={formData.cp_login}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>

                        {/* Senha */}
                        <Form.Group className="mb-3">
                            <Form.Label>Nova Senha (deixe em branco para manter a atual)</Form.Label>
                            <Form.Control
                                type="password"
                                name="cp_password"
                                value={formData.cp_password}
                                onChange={handleInputChange}
                                placeholder="Digite uma nova senha"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmitConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </Modal.Footer>

                {/* Modal de Confirmação */}
                <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirmar Alterações</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Tem certeza que deseja salvar as alterações no seu perfil?</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                            Cancelar
                        </Button>
                        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                            {loading ? 'Salvando...' : 'Confirmar'}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Modal>
            <ToastContainer />
        </>
    );
};

export default EditProfileModal;
