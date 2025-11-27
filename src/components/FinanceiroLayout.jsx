import React, { useState, useEffect } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";
import { API_BASE_URL } from "./config";
import './financeiro.css'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal, Button, Form } from "react-bootstrap";


const Financeiro = () => {
    const [dados, setDados] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [nomeFiltro, setNomeFiltro] = useState("");
    const [statusFiltro, setStatusFiltro] = useState("");
    const [totalAtrasado, setTotalAtrasado] = useState(0);
    const [valorMensal, setValorMensal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [userType] = useState(parseInt(localStorage.getItem("userType"), 10));
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedParcela, setSelectedParcela] = useState(null);
    const [newStatus, setNewStatus] = useState("");

    const handleOpenModal = (parcela) => {
        setSelectedParcela(parcela);
        const initialStatus =
            parcela.cp_mtPar_status === "Vencido" ? "à vencer" : parcela.cp_mtPar_status; // Mapeia "Vencido" para "à vencer"
        setNewStatus(initialStatus); // Inicializa com o status correto
        setModalOpen(true);
    };


    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedParcela(null);
        setNewStatus("");
    };

    const handleSaveStatus = async () => {
        try {
            setLoading(true);

            // Garantir que "Vencido" seja tratado como "à vencer" ao salvar
            const statusToSave =
                newStatus === "Pago"
                    ? "Pago"
                    : newStatus === "Não Pago" || newStatus === "Vencido"
                        ? "à vencer"
                        : newStatus;

            const response = await axios.put(
                `${API_BASE_URL}/financeiro/update-status/${selectedParcela.cp_mtPar_id}`,
                { status: statusToSave }
            );

            if (response.status === 200) {
                // Atualize o estado local com o novo status
                setDados((prevDados) =>
                    prevDados.map((item) =>
                        item.cp_mtPar_id === selectedParcela.cp_mtPar_id
                            ? { ...item, cp_mtPar_status: statusToSave }
                            : item
                    )
                );
                toast.success("Status atualizado com sucesso!", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }
        } catch (error) {
            console.error("Erro ao atualizar o status:", error);
            toast.error("Erro ao atualizar o status. Tente novamente.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } finally {
            setLoading(false);
            handleCloseModal();
        }
    };


    useEffect(() => {
        fetchFinanceiro();
    }, []);

    const fetchFinanceiro = async () => {
        setLoading(true);
        try {
            const schoolId = localStorage.getItem('schoolId');
            const userId = localStorage.getItem('userId');

            let url = `${API_BASE_URL}/financeiro/parcelas`;

            // Aplicar filtros baseados no tipo de usuário
            switch (userType) {
                case 1: // Diretor Geral - vê tudo
                    // Não aplica filtros
                    break;
                case 2: // Diretor - vê apenas sua escola
                    if (schoolId) {
                        url += `?schoolId=${schoolId}`;
                    }
                    break;
                case 3: // Secretária - vê apenas sua escola
                    if (schoolId) {
                        url += `?schoolId=${schoolId}`;
                    }
                    break;
                case 4: // Professor - não tem acesso ao financeiro
                    console.log('Professor não tem acesso ao financeiro');
                    setLoading(false);
                    return;
                case 5: // Aluno - vê apenas seus próprios dados financeiros
                    if (userId) {
                        url += `?userId=${userId}`;
                    }
                    break;
                default:
                    console.log('Tipo de usuário não reconhecido');
                    setLoading(false);
                    return;
            }

            const response = await fetch(url);
            const parcelas = await response.json();


            const verificarStatus = (status, dataVencimento) => {
                const hoje = new Date();
                const dataVenc = new Date(dataVencimento);
                return status === 'à vencer' && dataVenc < hoje ? 'Vencido' : status;
            };

            const formatarData = (data) => {
                const d = new Date(data);
                const dia = String(d.getDate()).padStart(2, '0');
                const mes = String(d.getMonth() + 1).padStart(2, '0');
                const ano = d.getFullYear();
                return `${dia}/${mes}/${ano}`;
            };

            const userTypeStorage = parseInt(localStorage.getItem('userType'), 10);
            const schoolIdStorage = parseInt(localStorage.getItem('schoolId'), 10);
            const userName = localStorage.getItem('userName');

            // filtrar matrículas ativas + permissão de visualização
            const filtradas = parcelas
                .filter(item => item.cp_status_matricula === 'ativo')
                .filter(item => {
                    if (userTypeStorage === 4) return false; // Professor não tem acesso
                    if (userTypeStorage === 5) return item.cp_mt_nome_usuario === userName && item.cp_mt_escola === schoolIdStorage; // Aluno vê apenas suas parcelas
                    if (userTypeStorage === 2) return item.cp_mt_escola === schoolIdStorage; // Diretor vê apenas alunos da sua escola
                    if (userTypeStorage === 3) return item.cp_mt_escola === schoolIdStorage; // Secretária vê apenas alunos da sua escola
                    if (userTypeStorage === 1) return true; // Diretor Geral vê tudo
                    return false; // Qualquer outro tipo não tem acesso
                });

            const dadosFormatados = filtradas.map(item => ({
                ...item,
                nome: item.cp_mt_nome_usuario,
                cp_mtPar_status: verificarStatus(item.cp_mtPar_status, item.cp_mtPar_dataParcela),
                cp_mtPar_dataParcela: formatarData(item.cp_mtPar_dataParcela),
                tipoPagamento: item.cp_mt_tipo_pagamento
            }));

            setDados(dadosFormatados);

            // Calcular total atrasado
            const atrasado = dadosFormatados
                .filter(d => d.cp_mtPar_status === 'Vencido')
                .reduce((acc, curr) => acc + parseFloat(curr.cp_mtPar_valorParcela), 0);
            setTotalAtrasado(atrasado.toFixed(2));

            // Calcular valor mensal (apenas mensalidades do mês atual)
            const hoje = new Date();
            const mesAtual = hoje.getMonth();
            const anoAtual = hoje.getFullYear();

            const idsUnicos = new Set();
            const mensal = dadosFormatados
                .filter(item => {
                    const dataVencimento = new Date(item.cp_mtPar_dataParcela);
                    return dataVencimento.getMonth() === mesAtual && 
                           dataVencimento.getFullYear() === anoAtual;
                })
                .reduce((soma, p) => {
                    if (!idsUnicos.has(p.cp_mt_id)) {
                        idsUnicos.add(p.cp_mt_id);
                        return soma + parseFloat(p.cp_mtPar_valorParcela);
                    }
                    return soma;
                }, 0);
            setValorMensal(mensal.toFixed(2));

        } catch (error) {
            console.error('Erro ao buscar dados financeiros:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredData = dados.filter((item) => {
        const matchesNome = item.nome?.toLowerCase().includes(nomeFiltro.toLowerCase()) ?? true;
        
        // Calcular o status real baseado na data (mesma lógica da tabela)
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        const [dia, mes, ano] = item.cp_mtPar_dataParcela.split('/').map(Number);
        const dataVencimento = new Date(ano, mes - 1, dia);
        
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();
        const mesVencimento = dataVencimento.getMonth();
        const anoVencimento = dataVencimento.getFullYear();
        
        let statusAtual = item.cp_mtPar_status;
        
        if (item.cp_mtPar_status !== "Pago") {
            if (anoVencimento > anoAtual || (anoVencimento === anoAtual && mesVencimento > mesAtual)) {
                statusAtual = "Futuras parcelas";
            } else if (anoVencimento === anoAtual && mesVencimento === mesAtual) {
                if (dataVencimento < hoje) {
                    statusAtual = "Vencido";
                } else {
                    statusAtual = "À vencer";
                }
            } else {
                statusAtual = "Vencido";
            }
        }
        
        const matchesStatus = !statusFiltro || statusAtual === statusFiltro;

        // Para alunos (userType 5), só mostrar se for tipo parcelado
        if (userType === 5 && item.cp_mt_tipo_pagamento !== 'parcelado') {
            return false;
        }

        return matchesNome && matchesStatus;
    });

    const totalPaginas = Math.ceil(filteredData.length / itemsPerPage);

    const paginasVisiveis = [];
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPaginas, currentPage + 2); i++) {
        paginasVisiveis.push(i);
    }

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="container-fluid">
            <ToastContainer />

            {/* Header com resumo financeiro */}
            <div className="row mb-4 g-3">
                <div className="col-12">
                    <div className="card border-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <div className="card-body p-4">
                            <div className="row align-items-center">
                                <div className="col-12 col-lg-8 mb-3 mb-lg-0">
                                    <h3 className="mb-2 fw-bold">
                                        <Icon icon="solar:wallet-money-bold" className="m-3 " width="32" height="32" />
                                        Gestão Financeira
                                    </h3>
                                    <p className="mb-0">
                                        {userType === 5 ? 'Acompanhe sua situação financeira' : 'Controle completo das finanças da instituição'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cards de estatísticas */}
            <div className="row mb-4 g-3">
                <div className={`col-12 ${userType === 5 ? 'col-md-6' : 'col-md-6 col-xl-3'}`}>
                    <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)' }}>
                        <div className="card-body p-4 text-center">
                            <div className="mb-3">
                                <Icon icon="solar:money-bag-bold" width="48" height="48" className="opacity-90" />
                            </div>
                            <h4 className="fw-bold mb-1">
                                R$ {userType === 5 && filteredData.length > 0 
                                    ? (filteredData[0].cp_mtPar_valorParcela || '0.00')
                                    : (valorMensal || '0.00')
                                }
                            </h4>
                            <p className="mb-0 small opacity-90">
                                {userType === 5 ? 'Valor da Sua Parcela' : 'Receita do Mês Atual'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className={`col-12 ${userType === 5 ? 'col-md-6' : 'col-md-6 col-xl-3'}`}>
                    <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)' }}>
                        <div className="card-body p-4 text-center">
                            <div className="mb-3">
                                <Icon icon="solar:clock-circle-bold" width="48" height="48" className="opacity-90" />
                            </div>
                            <h4 className="fw-bold mb-1">R$ {totalAtrasado}</h4>
                            <p className="mb-0 small opacity-90">Valores em Atraso</p>
                        </div>
                    </div>
                </div>
                {userType === 5 ? (
                    <>
                        <div className="col-12 col-md-6">
                            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)' }}>
                                <div className="card-body p-4 text-center">
                                    <div className="mb-3">
                                        <Icon icon="solar:chart-bold" width="48" height="48" className="opacity-90" />
                                    </div>
                                    <h4 className="fw-bold mb-1">{filteredData.length}</h4>
                                    <p className="mb-0 small opacity-90">Minhas Parcelas</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-6">
                            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #55a3ff 0%, #003d82 100%)' }}>
                                <div className="card-body p-4 text-center">
                                    <div className="mb-3">
                                        <Icon icon="solar:medal-ribbons-star-bold" width="48" height="48" className="opacity-90" />
                                    </div>
                                    <h4 className="fw-bold mb-1">{filteredData.filter(item => item.cp_mtPar_status === 'Pago').length}</h4>
                                    <p className="mb-0 small opacity-90">Parcelas Pagas</p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="col-12 col-md-6 col-xl-3">
                            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)' }}>
                                <div className="card-body p-4 text-center">
                                    <div className="mb-3">
                                        <Icon icon="solar:calendar-bold" width="48" height="48" className="opacity-90" />
                                    </div>
                                    <h4 className="fw-bold mb-1">
                                        {new Set(filteredData.filter(item => item.tipoPagamento === 'mensalidade').map(item => item.cp_mt_id)).size}
                                    </h4>
                                    <p className="mb-0 small opacity-90">Usuários c/ Mensalidade</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-6 col-xl-3">
                            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)' }}>
                                <div className="card-body p-4 text-center">
                                    <div className="mb-3">
                                        <Icon icon="solar:chart-bold" width="48" height="48" className="opacity-90" />
                                    </div>
                                    <h4 className="fw-bold mb-1">
                                        {new Set(filteredData.filter(item => item.tipoPagamento === 'parcelado').map(item => item.cp_mt_id)).size}
                                    </h4>
                                    <p className="mb-0 small opacity-90">Usuários c/ Parcelamento</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Tabela principal */}
            <div className="card border-0 shadow-lg radius-16">

                <div className="card-header border-0 py-4 px-4">
                    <div className="row align-items-center g-3">
                        <div className="col-12 col-md-8">
                            <div className="d-flex align-items-center flex-wrap gap-3">
                                <div className="d-flex align-items-center gap-2">
                                    <Icon icon="solar:list-bold" width="20" height="20" className="text-primary" />
                                    <span className="text-md fw-semibold ">Mostrar</span>
                                    <select
                                        className="form-select form-select-sm border-primary text-primary fw-medium"
                                        style={{ width: 'auto', minWidth: '80px' }}
                                        value={itemsPerPage}
                                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={15}>15</option>
                                        <option value={20}>20</option>
                                    </select>
                                    <span className="text-md">registros</span>
                                </div>

                                {/* Busca por nome para administrativos */}
                                {[1, 2, 3].includes(userType) && (
                                    <div className="position-relative">
                                        <Icon icon="solar:magnifer-linear" width="20" height="20"
                                            className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                                        <input
                                            type="text"
                                            className="form-control ps-5 border-2 border-primary-subtle"
                                            style={{ width: '250px' }}
                                            placeholder="Buscar por nome..."
                                            value={nomeFiltro}
                                            onChange={(e) => setNomeFiltro(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-12 col-md-4">
                            <div className="d-flex align-items-center justify-content-md-end gap-3">
                                {/* Indicador para alunos */}
                                {userType === 5 && (
                                    <div className="badge bg-gradient" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                        <Icon icon="solar:user-bold" width="16" height="16" className="me-1" />
                                        {filteredData.length > 0 ? 'Minhas Parcelas' : 'Sem Parcelas Disponíveis'}
                                    </div>
                                )}

                                {/* Filtro de status */}
                                <div className="d-flex align-items-center gap-2">
                                    <Icon icon="solar:filter-bold" width="20" height="20" className="text-primary" />
                                    <select
                                        className="form-select form-select-sm border-primary text-primary fw-medium"
                                        style={{ width: 'auto', minWidth: '140px' }}
                                        value={statusFiltro}
                                        onChange={(e) => setStatusFiltro(e.target.value)}
                                    >
                                        <option value="">Todos os Status</option>
                                        <option value="Pago">✅ Pago</option>
                                        <option value="À vencer">⏳ À vencer</option>
                                        <option value="Vencido">❌ Vencido</option>
                                        <option value="Futuras parcelas">📅 Futuras parcelas</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-body p-4">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="">
                                <tr>
                                    <th className="border-0  fw-bold py-3">
                                        <Icon icon="solar:user-bold" width="18" height="18" className="me-2 text-primary" />
                                        Nome
                                    </th>
                                    <th className="border-0  fw-bold py-3">
                                        <Icon icon="solar:medal-ribbons-star-bold" width="18" height="18" className="me-2 text-primary" />
                                        Status
                                    </th>
                                    <th className="border-0  fw-bold py-3">
                                        <Icon icon="solar:calendar-bold" width="18" height="18" className="me-2 text-primary" />
                                        Vencimento
                                    </th>
                                    <th className="border-0  fw-bold py-3">
                                        <Icon icon="solar:dollar-bold" width="18" height="18" className="me-2 text-primary" />
                                        Valor
                                    </th>
                                    {/* Coluna de ação visível apenas para administradores */}
                                    {[1, 2, 3].includes(userType) && (
                                        <th className="border-0  fw-bold py-3 text-center">
                                            <Icon icon="solar:settings-bold" width="18" height="18" className="me-2 text-primary" />
                                            Ações
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={[1, 2, 3].includes(userType) ? "5" : "4"} className="text-center py-5">
                                            <div className="d-flex align-items-center justify-content-center gap-2">
                                                <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                                                <span className="text-muted">Carregando dados financeiros...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={[1, 2, 3].includes(userType) ? "5" : "4"} className="text-center py-5">
                                            <div className="text-muted">
                                                <Icon icon="solar:inbox-out-bold" width="48" height="48" className="mb-2 opacity-50" />
                                                <div>
                                                    {userType === 5
                                                        ? "Você possui mensalidade fixa. Entre em contato com a secretaria para mais informações."
                                                        : "Nenhum registro encontrado"
                                                    }
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentItems.map((item, index) => {
                                        const hoje = new Date();
                                        hoje.setHours(0, 0, 0, 0); // Zerar horas para comparação apenas de data
                                        
                                        // Converter a data da parcela (formato DD/MM/AAAA) para objeto Date
                                        const [dia, mes, ano] = item.cp_mtPar_dataParcela.split('/').map(Number);
                                        const dataVencimento = new Date(ano, mes - 1, dia); // mes - 1 porque Date usa 0-11 para meses
                                        
                                        const mesAtual = hoje.getMonth();
                                        const anoAtual = hoje.getFullYear();
                                        const mesVencimento = dataVencimento.getMonth();
                                        const anoVencimento = dataVencimento.getFullYear();
                                        
                                        let statusAtual = item.cp_mtPar_status;
                                        
                                        // Se não está pago, verificar o status baseado na data
                                        if (item.cp_mtPar_status !== "Pago") {
                                            if (anoVencimento > anoAtual || (anoVencimento === anoAtual && mesVencimento > mesAtual)) {
                                                // Mês futuro
                                                statusAtual = "Futuras parcelas";
                                            } else if (anoVencimento === anoAtual && mesVencimento === mesAtual) {
                                                // Mesmo mês
                                                if (dataVencimento < hoje) {
                                                    statusAtual = "Vencido";
                                                } else {
                                                    statusAtual = "À vencer";
                                                }
                                            } else {
                                                // Mês anterior (já passou)
                                                statusAtual = "Vencido";
                                            }
                                        }

                                        return (
                                            <tr key={item.cp_mtPar_id || index} className="border-bottom">
                                                <td className="py-3">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="avatar-sm rounded-circle d-flex align-items-center justify-content-center">
                                                            <Icon icon="solar:user-bold" width="20" height="20" className="text-primary" />
                                                        </div>
                                                        <span className="fw-medium ">{item.nome || "Desconhecido"}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span
                                                            className={`badge fw-semibold px-3 py-2 ${
                                                                statusAtual === "Pago"
                                                                    ? "bg-success text-white"
                                                                    : statusAtual === "Vencido"
                                                                        ? "bg-danger text-white"
                                                                        : statusAtual === "À vencer"
                                                                            ? "bg-warning text-dark"
                                                                            : statusAtual === "Futuras parcelas"
                                                                                ? "bg-secondary text-white"
                                                                                : "bg-warning text-dark"
                                                            }`}
                                                            style={{ borderRadius: '8px' }}
                                                        >
                                                            {statusAtual === "Pago" && "✅"}
                                                            {statusAtual === "Vencido" && "❌"}
                                                            {statusAtual === "À vencer" && "⏳"}
                                                            {statusAtual === "Futuras parcelas" && "📅"}
                                                            {statusAtual === "à vencer" && "⏳"}
                                                            {" " + statusAtual}
                                                        </span>
                                                        {[1, 2, 3].includes(userType) && (
                                                            <button
                                                                className="btn btn-sm btn-outline-primary p-1"
                                                                onClick={() => handleOpenModal(item)}
                                                                title="Editar status"
                                                                style={{ width: '28px', height: '28px' }}
                                                            >
                                                                <Icon icon="solar:pen-bold" width="14" height="14" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <Icon icon="solar:calendar-bold" width="16" height="16" className="text-muted" />
                                                        <span className="">{item.cp_mtPar_dataParcela}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3">
                                                    <span className="fw-bold text-success fs-6">R$ {item.cp_mtPar_valorParcela}</span>
                                                </td>
                                                {[1, 2, 3].includes(userType) && (
                                                    <td className="py-3 text-center">
                                                        <button
                                                            className="btn btn-sm btn-primary"
                                                            onClick={() => handleOpenModal(item)}
                                                            title="Gerenciar pagamento"
                                                            style={{ borderRadius: '8px' }}
                                                        >
                                                            <Icon icon="solar:settings-bold" width="16" height="16" />
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })
                                )}

                            </tbody>
                        </table>
                    </div>

                    <div className="card-footer border-0 py-3 px-4">
                        <div className="row align-items-center">
                            <div className="col-12 col-md-6 mb-2 mb-md-0">
                                <div className="d-flex align-items-center gap-2 ">
                                    <Icon icon="solar:info-circle-bold" width="16" height="16" />
                                    <span className="small">
                                        Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredData.length)} de {filteredData.length} registros
                                    </span>
                                </div>
                            </div>
                            <div className="col-12 col-md-6">
                                <div className="d-flex align-items-center justify-content-md-end gap-2">
                                    <nav aria-label="Paginação">
                                        <ul className="pagination pagination-sm mb-0 shadow-sm">
                                            <li className="page-item">
                                                <button
                                                    className="page-link border-0 bg-white text-primary"
                                                    onClick={() => setCurrentPage(1)}
                                                    disabled={currentPage === 1}
                                                    title="Primeira página"
                                                >
                                                    <Icon icon="solar:double-alt-arrow-left-bold" width="16" height="16" />
                                                </button>
                                            </li>
                                            <li className="page-item">
                                                <button
                                                    className="page-link border-0 bg-white text-primary"
                                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                                    disabled={currentPage === 1}
                                                    title="Página anterior"
                                                >
                                                    <Icon icon="solar:alt-arrow-left-bold" width="16" height="16" />
                                                </button>
                                            </li>

                                            {paginasVisiveis.map((page) => (
                                                <li key={page} className="page-item">
                                                    <button
                                                        className={`page-link border-0 fw-medium ${currentPage === page
                                                                ? "bg-primary text-white"
                                                                : "bg-white text-primary"
                                                            }`}
                                                        onClick={() => setCurrentPage(page)}
                                                    >
                                                        {page}
                                                    </button>
                                                </li>
                                            ))}

                                            {totalPaginas > 5 && currentPage + 2 < totalPaginas && (
                                                <li className="page-item">
                                                    <span className="page-link border-0 bg-white text-muted">...</span>
                                                </li>
                                            )}

                                            <li className="page-item">
                                                <button
                                                    className="page-link border-0 bg-white text-primary"
                                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPaginas))}
                                                    disabled={currentPage === totalPaginas}
                                                    title="Próxima página"
                                                >
                                                    <Icon icon="solar:alt-arrow-right-bold" width="16" height="16" />
                                                </button>
                                            </li>
                                            <li className="page-item">
                                                <button
                                                    className="page-link border-0 bg-white text-primary"
                                                    onClick={() => setCurrentPage(totalPaginas)}
                                                    disabled={currentPage === totalPaginas}
                                                    title="Última página"
                                                >
                                                    <Icon icon="solar:double-alt-arrow-right-bold" width="16" height="16" />
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>

                                    <select
                                        className="form-select form-select-sm border-primary text-primary fw-medium"
                                        style={{ width: 'auto', minWidth: '100px' }}
                                        value={currentPage}
                                        onChange={(e) => setCurrentPage(Number(e.target.value))}
                                    >
                                        {Array.from({ length: totalPaginas }, (_, idx) => (
                                            <option key={idx + 1} value={idx + 1}>
                                                Página {idx + 1}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {modalOpen && (
                <Modal show={modalOpen} onHide={handleCloseModal} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Alterar Status</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Parcela: {selectedParcela?.nome}</p>
                        <Form.Select
                            className="mt-2"
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                        >
                            <option value="Pago">Pago</option>
                            <option value="à vencer">Não Pago</option>
                        </Form.Select>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Cancelar
                        </Button>
                        <Button variant="primary" onClick={handleSaveStatus}>
                            Salvar
                        </Button>
                    </Modal.Footer>
                </Modal>

            )}

        </div>
    );
};

export default Financeiro;