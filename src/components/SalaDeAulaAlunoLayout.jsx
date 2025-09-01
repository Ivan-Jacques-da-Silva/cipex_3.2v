
import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { API_BASE_URL } from "./config";

const Audios = () => {
    const [cursos, setCursos] = useState([]);
    const [audios, setAudios] = useState([]);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [itemsPerPageCursos, setItemsPerPageCursos] = useState(10);
    const [selectedCursoId, setSelectedCursoId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [paginaAtualCursos, setPaginaAtualCursos] = useState(1);
    const [cursoId, setCursoId] = useState(null);
    const turmaId = localStorage.getItem("turmaID");
    const [materiais, setMateriais] = useState(null);
    const [resumos, setResumos] = useState([]);
    const [resumosAbertos, setResumosAbertos] = useState({});
    const [audioStatus, setAudioStatus] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [sortDirection, setSortDirection] = useState("desc");
    const [progressoAudios, setProgressoAudios] = useState(0);

    useEffect(() => {
        if (turmaId) {
            fetch(`${API_BASE_URL}/curso-id-da-turma/${turmaId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.cp_tr_curso_id) {
                        setCursoId(data.cp_tr_curso_id);
                        fetchAudios(data.cp_tr_curso_id);
                        fetchMateriais(data.cp_tr_curso_id);
                    }
                })
                .catch(error => console.error("Erro ao buscar cursoId:", error));

            // Buscar resumos diretamente pela turmaId
            fetchResumos(turmaId);
        }
    }, [turmaId]);

    const getFilteredResumos = () => {
        let filtered = { ...resumos }; // Mantemos o formato agrupado por data

        // Aplicar busca por texto
        if (searchTerm) {
            filtered = Object.keys(filtered)
                .reduce((acc, date) => {
                    const resumosFiltrados = filtered[date].filter((resumo) =>
                        resumo.cp_res_resumo.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                    if (resumosFiltrados.length) {
                        acc[date] = resumosFiltrados;
                    }
                    return acc;
                }, {});
        }

        // Aplicar ordenação
        const sortedDates = Object.keys(filtered).sort((a, b) => {
            const dateA = new Date(a.split("/").reverse().join("-"));
            const dateB = new Date(b.split("/").reverse().join("-"));
            return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
        });

        return sortedDates.reduce((acc, date) => {
            acc[date] = filtered[date];
            return acc;
        }, {});
    };

    const fetchMateriais = async (cursoId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/curso-material/${cursoId}`);
            const data = await response.json();
            setMateriais(data);
        } catch (error) {
            console.error("Erro ao buscar materiais do curso:", error);
        }
    };

    const fetchAudios = async (cursoId) => {
        setLoading(true);
        setPaginaAtual(1);
        try {
            const response = await fetch(`${API_BASE_URL}/audios-curso/${cursoId}`);
            const data = await response.json();
            data.sort((a, b) => a.cp_nome_audio.localeCompare(b.cp_nome_audio, undefined, { numeric: true, sensitivity: 'base' }));
            setAudios(data);
            setSelectedCursoId(cursoId);

            // Buscar status dos áudios marcados como ouvidos pelo usuário
            const userId = localStorage.getItem("userId");
            if (userId) {
                const statusResponse = await fetch(`${API_BASE_URL}/audios-marcados/${userId}`);
                const audiosMarcados = await statusResponse.json();

                // Criar um objeto com os IDs dos áudios já ouvidos e garantir que nunca voltem a cinza
                const marcados = audiosMarcados.reduce((acc, audioId) => {
                    acc[audioId] = true; // Sempre verdadeiro após a primeira vez
                    return acc;
                }, {});

                setAudioStatus(marcados);

                // cálculo da porcentagem
                const total = data.length;
                const ouvidos = data.filter(audio => marcados[audio.cp_audio_id]).length;
                const porcentagem = total > 0 ? Math.round((ouvidos / total) * 100) : 0;
                setProgressoAudios(porcentagem);
            }
        } catch (error) {
            console.error("Erro ao buscar áudios:", error);
        } finally {
            setLoading(false);
        }
    };


    const handleAudioPlay = async (audioId) => {
        const userId = localStorage.getItem("userId");

        if (userId && !audioStatus[audioId]) { // Só registra se ainda não foi marcado
            try {
                await fetch(`${API_BASE_URL}/registrar-visualizacao`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, audioId }),
                });

                // Atualiza o estado local para garantir que nunca mais desmarque
                setAudioStatus((prevStatus) => ({
                    ...prevStatus,
                    [audioId]: true, // Uma vez marcado, nunca mais volta a falso
                }));
            } catch (error) {
                console.error("Erro ao registrar visualização de áudio:", error);
            }
        }
    };

    const fetchResumos = async (turmaId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/resumos/${turmaId}`);
            const data = await response.json();

            // Agrupar resumos por data
            const resumosAgrupados = data.reduce((acc, resumo) => {
                const dataFormatada = new Date(resumo.cp_res_data).toLocaleDateString("pt-BR");
                if (!acc[dataFormatada]) {
                    acc[dataFormatada] = [];
                }
                acc[dataFormatada].push(resumo);
                return acc;
            }, {});

            setResumos(resumosAgrupados);
        } catch (error) {
            console.error("Erro ao buscar resumos:", error);
            setResumos({});
        }
    };


    const handleSortChange = () => {
        const newDirection = sortDirection === "asc" ? "desc" : "asc";
        setSortDirection(newDirection);
        const sortedCursos = [...cursos].sort((a, b) => {
            const nomeA = a.cp_nome_curso.toLowerCase();
            const nomeB = b.cp_nome_curso.toLowerCase();
            return newDirection === "asc"
                ? nomeA.localeCompare(nomeB)
                : nomeB.localeCompare(nomeA);
        });
        setCursos(sortedCursos);
    };

    const filteredAudios = audios.slice(
        (paginaAtual - 1) * 10, // Mantém fixo em 10 itens por página
        paginaAtual * 10
    );

    const totalPaginasAudiosCurso = Math.ceil(audios.length / 10); // Também fixo em 10


    const filteredCursos = cursos.filter((curso) =>
        curso.cp_nome_curso.toLowerCase().includes(searchTerm.toLowerCase())
    );


    const currentCursos =
        itemsPerPageCursos === "all"
            ? filteredCursos
            : filteredCursos.slice(
                (paginaAtualCursos - 1) * itemsPerPageCursos,
                paginaAtualCursos * itemsPerPageCursos
            );

    const totalPaginasCursos =
        itemsPerPageCursos === "all"
            ? 1
            : Math.ceil(filteredCursos.length / itemsPerPageCursos);


    const totalPaginas = itemsPerPage === "all" ? 1 : Math.ceil(filteredCursos.length / itemsPerPage);

    const resetFilters = () => {
        setSearchTerm(""); // Limpar pesquisa
    };


    return (
        <>
            <style jsx>{`
                .audio-cards-container {
                    padding: 0;
                }

                .audio-card {
                    transition: all 0.3s ease;
                    border-radius: 12px !important;
                }

                .audio-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
                }

                .audio-title {
                    font-size: 0.9rem;
                    font-weight: 600;
                    line-height: 1.3;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }

                .audio-player-wrapper {
                    border-radius: 8px;
                    overflow: hidden;
                    padding: 8px;
                }

                .audio-player {
                    border-radius: 6px;
                    height: 40px;
                }

                .audio-player::-webkit-media-controls-panel {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }

                .audio-player::-webkit-media-controls-play-button,
                .audio-player::-webkit-media-controls-current-time-display,
                .audio-player::-webkit-media-controls-time-remaining-display {
                    color: white;
                }

                @media (max-width: 992px) {
                    .border-end {
                        border-right: none !important;
                        border-bottom: 1px solid #dee2e6 !important;
                        margin-bottom: 1rem;
                    }
                }

                @media (max-width: 768px) {
                    .audio-title {
                        font-size: 0.85rem;
                    }
                    
                    .audio-player {
                        height: 35px;
                    }

                    .card-body {
                        padding: 1rem !important;
                    }

                    .card-header {
                        padding: 1rem !important;
                    }
                }
            `}</style>
            <div className="card h-100 p-0 radius-12">
                <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-2 justify-content-start">
                    <div className="d-flex flex-wrap align-items-center gap-2">
                        {/* Pesquisa */}
                        <input
                            type="text"
                            className="form-control form-control-sm w-auto"
                            placeholder="Pesquisar resumo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />

                        {/* Ordenação */}
                        <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                        >
                            {sortDirection === "asc" ? "Mais Antigos 🔼" : "Mais Recentes 🔽"}
                        </button>

                        {/* Botão de Limpar Filtros */}
                        <button className="btn btn-danger btn-sm d-flex align-items-center gap-1" onClick={resetFilters}>
                            <Icon icon="ic:baseline-close" className="text-white" width="16" height="16" /> Limpar
                        </button>
                    </div>
                </div>


                <div className="row">
                    <div className="col-12 col-lg-4 border-end border-lg-end border-0">
                        <div className="card-body p-3 p-lg-4">
                            {materiais ? (
                                <div>
                                    {materiais.cp_youtube_link_curso && (
                                        <div className="mb-3">
                                            <h6>Vídeo do Curso</h6>
                                            <a
                                                href={materiais.cp_youtube_link_curso}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-primary"
                                            >
                                                Assistir no YouTube
                                            </a>
                                        </div>
                                    )}
                                    {[1, 2, 3].map((num) => {
                                        const pdfKey = `cp_pdf${num}_curso`;
                                        return materiais[pdfKey] ? (
                                            <div key={num} className="mb-2">
                                                <h6>Material {num}</h6>
                                                <a href={materiais[pdfKey]} target="_blank" rel="noopener noreferrer">
                                                    Baixar PDF {num}
                                                </a>
                                            </div>
                                        ) : null;
                                    })}

                                    {/* Seção de Resumos */}
                                    <h6 className="mt-4">Resumos de Aula</h6>
                                    <div className="accordion" id="resumosAcordeon">
                                        {Object.keys(getFilteredResumos()).length > 0 ? (
                                            Object.keys(getFilteredResumos()).map((data, index) => (
                                                <div className="accordion-item" key={index}>
                                                    <h1 className="accordion-header">
                                                        <div
                                                            role="button"
                                                            tabIndex={0}
                                                            className={`accordion-button ${resumosAbertos[data] ? "" : "collapsed"}`}
                                                            onClick={() =>
                                                                setResumosAbertos((prev) => ({ ...prev, [data]: !prev[data] }))
                                                            }
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter" || e.key === " ") {
                                                                    e.preventDefault();
                                                                    setResumosAbertos((prev) => ({ ...prev, [data]: !prev[data] }));
                                                                }
                                                            }}
                                                        >
                                                           <h6 style={{fontSize:"14px!important"}}> 📅 {data}</h6 >
                                                        </div>
                                                    </h1>
                                                    <div className={`accordion-collapse collapse ${resumosAbertos[data] ? "show" : ""}`}>
                                                        <div className="accordion-body">
                                                            {getFilteredResumos()[data].map((resumo) => (
                                                                <div key={resumo.cp_res_id} className="mb-3 p-2 border rounded">
                                                                    <h6>Aula {resumo.cp_res_aula} - {resumo.cp_res_hora}</h6>
                                                                    {/* <p>{resumo.cp_res_resumo}</p> */}

                                                                    <div className="d-flex gap-2 mt-2">
                                                                        {resumo.cp_res_link && (
                                                                            <a href={resumo.cp_res_link} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                                                                                🔗 Link Externo
                                                                            </a>
                                                                        )}
                                                                        {resumo.cp_res_link_youtube && (
                                                                            <a href={resumo.cp_res_link_youtube} target="_blank" rel="noopener noreferrer" className="btn btn-danger btn-sm">
                                                                                ▶️ Vídeo no YouTube
                                                                            </a>
                                                                        )}
                                                                        {resumo.cp_res_arquivo && (
                                                                            <a href={resumo.cp_res_arquivo} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                                                                                📄 Baixar Arquivo
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p>Nenhum resumo encontrado.</p>
                                        )}
                                    </div>

                                </div>
                            ) : (
                                <p>Carregando materiais...</p>
                            )}
                        </div>
                    </div>

                    <div className="col-12 col-lg-8">
                        <div className="card-body p-3 p-lg-4">
                            <div className="table-responsive scroll-sm">

                                <div className="mb-3 px-2">
                                    <label className="fw-bold d-block mb-1">
                                        Progresso: <span className="text-success">{progressoAudios}%</span>
                                    </label>
                                    <div className="progress" style={{ height: "10px" }}>
                                        <div
                                            className="progress-bar bg-success"
                                            role="progressbar"
                                            style={{ width: `${progressoAudios}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="audio-cards-container">
                                    {loading ? (
                                        <div className="text-center p-4">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Carregando...</span>
                                            </div>
                                            <p className="mt-2">Carregando áudios...</p>
                                        </div>
                                    ) : cursoId && filteredAudios.length > 0 ? (
                                        <div className="d-flex flex-column gap-3">
                                            {filteredAudios.map((audio) => (
                                                <div key={audio.cp_audio_id} className="w-100">
                                                    <div className="audio-card card border-0 shadow-sm">
                                                        <div className="card-body p-3">
                                                            <div className="d-flex align-items-center justify-content-between mb-3">
                                                                <h6 className="audio-title mb-0 flex-grow-1 pe-2" title={audio.cp_nome_audio}>
                                                                    {audio.cp_nome_audio}
                                                                </h6>
                                                                <Icon
                                                                    icon={audioStatus[audio.cp_audio_id] ? "akar-icons:circle-check-fill" : "akar-icons:circle"}
                                                                    width="20"
                                                                    height="20"
                                                                    className={`flex-shrink-0 ${audioStatus[audio.cp_audio_id] ? "text-success" : "text-secondary"}`}
                                                                    style={{ cursor: "pointer" }}
                                                                />
                                                            </div>
                                                            <div className="audio-player-wrapper">
                                                                <audio
                                                                    controls
                                                                    preload="none"
                                                                    controlsList="nodownload"
                                                                    className="w-100 audio-player"
                                                                    onPlay={() => handleAudioPlay(audio.cp_audio_id)}
                                                                >
                                                                    <source
                                                                        src={`${API_BASE_URL}/audios/${audio.cp_nome_audio}`}
                                                                        type="audio/mpeg"
                                                                    />
                                                                    Seu navegador não suporta o elemento <code>audio</code>.
                                                                </audio>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center p-5">
                                            <Icon icon="mdi:music-note-off" width="48" height="48" className="text-muted mb-3" />
                                            <h5 className="text-muted mb-2">Nenhum áudio encontrado</h5>
                                            <p className="text-muted">Não há áudios disponíveis para este curso no momento.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="d-flex align-items-center justify-content-between mt-24">
                                <span>
                                    Mostrando {paginaAtual} de {totalPaginasAudiosCurso} páginas
                                </span>
                                <ul className="pagination d-flex flex-wrap align-items-center gap-2 justify-content-center">
                                    <li className="page-item">
                                        <button
                                            className="page-link bg-neutral-200 text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px text-md"
                                            onClick={() => setPaginaAtual(1)}
                                            disabled={paginaAtual === 1}
                                        >
                                            <Icon icon="ep:d-arrow-left" />
                                        </button>
                                    </li>
                                    <li className="page-item">
                                        <button
                                            className="page-link bg-neutral-200 text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px text-md"
                                            onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
                                            disabled={paginaAtual === 1}
                                        >
                                            Anterior
                                        </button>
                                    </li>
                                    {Array.from({ length: totalPaginasAudiosCurso }, (_, idx) => idx + 1)
                                        .filter((page) => {
                                            return (
                                                page === 1 ||
                                                page === totalPaginasAudiosCurso ||
                                                (page >= paginaAtual - 2 && page <= paginaAtual + 2)
                                            );
                                        })
                                        .map((page, idx, pages) => {
                                            if (idx > 0 && page > pages[idx - 1] + 1) {
                                                return (
                                                    <li key={`ellipsis-${idx}`} className="page-item">
                                                        <span className="page-link bg-neutral-200 text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px w-32-px">
                                                            ...
                                                        </span>
                                                    </li>
                                                );
                                            }
                                            return (
                                                <li
                                                    key={page}
                                                    className={`page-item ${paginaAtual === page ? "active" : ""}`}
                                                >
                                                    <button
                                                        className={`page-link text-md fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px w-32-px ${paginaAtual === page
                                                            ? "bg-primary-600 text-white"
                                                            : "bg-neutral-200 text-secondary-light"
                                                            }`}
                                                        onClick={() => setPaginaAtual(page)}
                                                    >
                                                        {page}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    <li className="page-item">
                                        <button
                                            className="page-link bg-neutral-200 text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px text-md"
                                            onClick={() => setPaginaAtual((prev) => Math.min(prev + 1, totalPaginasAudiosCurso))}
                                            disabled={paginaAtual === totalPaginasAudiosCurso}
                                        >
                                            Próximo
                                        </button>
                                    </li>
                                    <li className="page-item">
                                        <button
                                            className="page-link bg-neutral-200 text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px text-md"
                                            onClick={() => setPaginaAtual(totalPaginasAudiosCurso)}
                                            disabled={paginaAtual === totalPaginasAudiosCurso}
                                        >
                                            <Icon icon="ep:d-arrow-right" />
                                        </button>
                                    </li>
                                </ul>
                                <select
                                    className="form-select form-select-sm w-auto ps-12 py-6 radius-12 h-40-px"
                                    value={paginaAtual}
                                    onChange={(e) => setPaginaAtual(Number(e.target.value))}
                                >
                                    {Array.from({ length: totalPaginasAudiosCurso }, (_, idx) => (
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
        </>
    );
};

export default Audios;
