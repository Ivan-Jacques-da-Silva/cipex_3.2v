
import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button, Form, Table, Modal, Badge } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";
import { API_BASE_URL } from "../config";

const GerenciamentoNotas = ({ turmaId, alunos }) => {
    const [notas, setNotas] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [editingNota, setEditingNota] = useState(null);
    const [formData, setFormData] = useState({
        alunoId: '',
        data: new Date().toISOString().split('T')[0],
        notaWorkbook: '',
        notaProva: ''
    });

    useEffect(() => {
        if (turmaId) {
            carregarNotas();
        }
    }, [turmaId]);

    const carregarNotas = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/notas/turma/${turmaId}`);
            setNotas(response.data);
        } catch (error) {
            console.error("Erro ao carregar notas:", error);
            toast.error("Erro ao carregar notas.");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.notaWorkbook || !formData.notaProva) {
            toast.error("É obrigatório preencher tanto a nota do workbook quanto da prova!");
            return;
        }

        if (parseFloat(formData.notaWorkbook) < 0 || parseFloat(formData.notaWorkbook) > 10 ||
            parseFloat(formData.notaProva) < 0 || parseFloat(formData.notaProva) > 10) {
            toast.error("As notas devem estar entre 0 e 10!");
            return;
        }

        if (!editingNota && !formData.alunoId) {
            toast.error("É obrigatório selecionar um aluno!");
            return;
        }

        // Abrir modal de confirmação
        setShowConfirmModal(true);
    };

    const handleConfirmSave = async () => {
        try {
            if (editingNota) {
                // Atualizar nota existente
                await axios.put(`${API_BASE_URL}/notas/${editingNota.cp_nota_id}`, {
                    notaWorkbook: formData.notaWorkbook,
                    notaProva: formData.notaProva
                });
                toast.success("Nota atualizada com sucesso!");
            } else {
                // Criar nova nota
                await axios.post(`${API_BASE_URL}/notas`, {
                    turmaId: turmaId,
                    alunoId: formData.alunoId,
                    data: formData.data,
                    notaWorkbook: formData.notaWorkbook,
                    notaProva: formData.notaProva
                });
                toast.success("Nota salva com sucesso!");
            }

            setShowModal(false);
            setShowConfirmModal(false);
            resetForm();
            carregarNotas();
        } catch (error) {
            console.error("Erro ao salvar nota:", error);
            toast.error("Erro ao salvar nota.");
            setShowConfirmModal(false);
        }
    };

    const handleDelete = async (notaId) => {
        if (window.confirm("Tem certeza que deseja deletar esta nota?")) {
            try {
                await axios.delete(`${API_BASE_URL}/notas/${notaId}`);
                toast.success("Nota deletada com sucesso!");
                carregarNotas();
            } catch (error) {
                console.error("Erro ao deletar nota:", error);
                toast.error("Erro ao deletar nota.");
            }
        }
    };

    const handleEdit = (nota) => {
        setEditingNota(nota);
        setFormData({
            alunoId: nota.cp_nota_aluno_id,
            data: nota.cp_nota_data.split('T')[0],
            notaWorkbook: nota.cp_nota_workbook,
            notaProva: nota.cp_nota_prova
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            alunoId: '',
            data: new Date().toISOString().split('T')[0],
            notaWorkbook: '',
            notaProva: ''
        });
        setEditingNota(null);
    };

    const getNotaColor = (media) => {
        if (media >= 7) return "success"; // Verde
        if (media >= 5) return "warning"; // Amarelo
        return "danger"; // Vermelho
    };

    const getNotaText = (media) => {
        if (media >= 7) return "Boa";
        if (media >= 5) return "Média";
        return "Ruim";
    };

    const getAlunoNome = (alunoId) => {
        const aluno = alunos.find(a => a.cp_id === parseInt(alunoId));
        return aluno ? aluno.cp_nome : 'Aluno não encontrado';
    };

    return (
        <div className="mt-4">
            <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Gerenciamento de Notas</h5>
                    <Button 
                        variant="primary" 
                        onClick={() => setShowModal(true)}
                        disabled={!alunos.length}
                    >
                        Adicionar Nota
                    </Button>
                </Card.Header>
                <Card.Body>
                    {notas.length === 0 ? (
                        <p className="text-muted text-center">Nenhuma nota registrada para esta turma.</p>
                    ) : (
                        <Table responsive striped hover>
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Aluno</th>
                                    <th>Workbook</th>
                                    <th>Prova</th>
                                    <th>Média</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {notas.map((nota) => (
                                    <tr key={nota.cp_nota_id}>
                                        <td>{new Date(nota.cp_nota_data).toLocaleDateString('pt-BR')}</td>
                                        <td>{nota.cp_nome_aluno}</td>
                                        <td>{nota.cp_nota_workbook}</td>
                                        <td>{nota.cp_nota_prova}</td>
                                        <td>{nota.cp_nota_media}</td>
                                        <td>
                                            <Badge bg={getNotaColor(nota.cp_nota_media)}>
                                                {getNotaText(nota.cp_nota_media)}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Button
                                                size="sm"
                                                variant="outline-primary"
                                                className="me-2"
                                                onClick={() => handleEdit(nota)}
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline-danger"
                                                onClick={() => handleDelete(nota.cp_nota_id)}
                                            >
                                                Deletar
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* Modal para adicionar/editar nota */}
            <Modal show={showModal} onHide={() => { setShowModal(false); resetForm(); }}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingNota ? 'Editar Nota' : 'Adicionar Nova Nota'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Aluno *</Form.Label>
                                    <Form.Select
                                        value={formData.alunoId}
                                        onChange={(e) => setFormData({...formData, alunoId: e.target.value})}
                                        required
                                        disabled={editingNota}
                                    >
                                        <option value="">Selecione um aluno</option>
                                        {alunos.map((aluno) => (
                                            <option key={aluno.cp_id} value={aluno.cp_id}>
                                                {aluno.cp_nome}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Data da Avaliação *</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={formData.data}
                                        onChange={(e) => setFormData({...formData, data: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nota Workbook (0-10) *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="10"
                                        value={formData.notaWorkbook}
                                        onChange={(e) => setFormData({...formData, notaWorkbook: e.target.value})}
                                        required
                                        placeholder="Ex: 8.5"
                                    />
                                    <Form.Text className="text-muted">
                                        Trabalho feito um dia antes da prova
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nota Prova (0-10) *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="10"
                                        value={formData.notaProva}
                                        onChange={(e) => setFormData({...formData, notaProva: e.target.value})}
                                        required
                                        placeholder="Ex: 7.0"
                                    />
                                    <Form.Text className="text-muted">
                                        Nota da prova aplicada
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>
                        
                        {formData.notaWorkbook && formData.notaProva && (
                            <div className="alert alert-info">
                                <strong>Média Calculada: </strong>
                                {((parseFloat(formData.notaWorkbook) + parseFloat(formData.notaProva)) / 2).toFixed(1)}
                                <br />
                                <small>
                                    <Badge bg={getNotaColor((parseFloat(formData.notaWorkbook) + parseFloat(formData.notaProva)) / 2)}>
                                        {getNotaText((parseFloat(formData.notaWorkbook) + parseFloat(formData.notaProva)) / 2)}
                                    </Badge>
                                </small>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit">
                            {editingNota ? 'Atualizar' : 'Salvar'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal de Confirmação */}
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar {editingNota ? 'Atualização' : 'Cadastro'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3">
                        <strong>Tem certeza que deseja {editingNota ? 'atualizar' : 'cadastrar'} esta nota?</strong>
                    </div>
                    
                    <div className="card bg-light">
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <strong>Aluno:</strong><br />
                                    {editingNota ? editingNota.cp_nome_aluno : getAlunoNome(formData.alunoId)}
                                </div>
                                <div className="col-md-6">
                                    <strong>Data:</strong><br />
                                    {new Date(formData.data).toLocaleDateString('pt-BR')}
                                </div>
                            </div>
                            <hr />
                            <div className="row">
                                <div className="col-md-4">
                                    <strong>Nota Workbook:</strong><br />
                                    <span className="text-primary">{formData.notaWorkbook}</span>
                                </div>
                                <div className="col-md-4">
                                    <strong>Nota Prova:</strong><br />
                                    <span className="text-primary">{formData.notaProva}</span>
                                </div>
                                <div className="col-md-4">
                                    <strong>Média:</strong><br />
                                    <Badge bg={getNotaColor((parseFloat(formData.notaWorkbook) + parseFloat(formData.notaProva)) / 2)}>
                                        {((parseFloat(formData.notaWorkbook) + parseFloat(formData.notaProva)) / 2).toFixed(1)} - {getNotaText((parseFloat(formData.notaWorkbook) + parseFloat(formData.notaProva)) / 2)}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleConfirmSave}>
                        Confirmar {editingNota ? 'Atualização' : 'Cadastro'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default GerenciamentoNotas;
