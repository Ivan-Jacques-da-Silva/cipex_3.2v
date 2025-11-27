const express = require('express');
const router = express.Router();
const { prisma } = require('../../config/database');
const path = require('path');
const fs = require('fs');

// Função de log para gravar erros em um arquivo de log
const logError = (error) => {
  const logFilePath = path.join(__dirname, '../../error.log');
  const errorMessage = `${new Date().toISOString()} - ${error.stack}\n`;
  fs.appendFile(logFilePath, errorMessage, (err) => {
    if (err) {
      console.error('Erro ao gravar no arquivo de log:', err);
    }
  });
};

// Buscar todas as matrículas
router.get('/', async (req, res) => {
  try {
    const matriculas = await prisma.cp_matriculas.findMany();
    res.send(matriculas);
  } catch (err) {
    console.error('Erro ao buscar matrículas:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro ao buscar matrículas' });
  }
});

// Relatório de matrículas
router.get('/relatorio', async (req, res) => {
  try {
    const matriculas = await prisma.cp_matriculas.findMany();
    res.send(matriculas);
  } catch (err) {
    console.error('Erro ao buscar matrículas:', err);
    logError(err);
    res.status(500).send({ error: 'Erro ao buscar matrículas' });
  }
});

// Buscar matrícula específica
router.get('/:matriculaId', async (req, res) => {
  const matriculaId = parseInt(req.params.matriculaId);

  try {
    const matricula = await prisma.cp_matriculas.findUnique({
      where: { cp_mt_id: matriculaId }
    });

    if (matricula) {
      res.send(matricula);
    } else {
      res.status(404).send({ msg: 'Matrícula não encontrada' });
    }
  } catch (err) {
    console.error('Erro ao buscar matrícula:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro ao buscar matrícula' });
  }
});

// Buscar dados do usuário para matrícula
router.get('/usuario/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const usuario = await prisma.cp_usuarios.findUnique({
      where: { cp_id: userId },
      select: {
        cp_nome: true,
        cp_cpf: true,
        cp_datanascimento: true,
        cp_profissao: true,
        cp_estadocivil: true,
        cp_end_cidade_estado: true,
        cp_end_rua: true,
        cp_end_num: true,
        cp_whatsapp: true,
        cp_telefone: true,
        cp_email: true,
        cp_escola_id: true
      }
    });

    if (usuario) {
      const userData = {
        nomeUsuario: usuario.cp_nome,
        cpfUsuario: usuario.cp_cpf,
        dataNascimento: usuario.cp_datanascimento,
        profissao: usuario.cp_profissao,
        estadoCivil: usuario.cp_estadocivil,
        endereco: `${usuario.cp_end_cidade_estado}, ${usuario.cp_end_rua}, ${usuario.cp_end_num}`,
        whatsapp: usuario.cp_whatsapp,
        telefone: usuario.cp_telefone,
        email: usuario.cp_email,
        escolaId: usuario.cp_escola_id
      };
      res.send(userData);
    } else {
      res.status(404).send({ msg: 'Usuário não encontrado' });
    }
  } catch (err) {
    console.error('Erro ao buscar dados do usuário:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro ao buscar dados do usuário' });
  }
});

// Buscar CPF do usuário
router.get('/cpf/:id', async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const usuario = await prisma.cp_usuarios.findUnique({
      where: { cp_id: userId },
      select: { cp_cpf: true }
    });

    if (usuario) {
      res.send(usuario);
    } else {
      res.status(404).send({ msg: 'CPF do usuário não encontrado' });
    }
  } catch (err) {
    console.error('Erro ao buscar CPF:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro no servidor' });
  }
});

// Cadastrar nova matrícula
router.post('/cadastrar', async (req, res) => {
  const {
    cursoId: cp_mt_curso,
    usuarioId: cp_mt_usuario,
    cpfUsuario: cp_mt_cadastro_usuario,
    valorCurso: cp_mt_valor_curso,
    numeroParcelas: cp_mt_quantas_parcelas,
    status: cp_status_matricula,
    escolaId: cp_mt_escola,
    escolaridade: cp_mt_escolaridade,
    localNascimento: cp_mt_local_nascimento,
    redeSocial: cp_mt_rede_social,
    nomePai: cp_mt_nome_pai,
    contatoPai: cp_mt_contato_pai,
    nomeMae: cp_mt_nome_mae,
    contatoMae: cp_mt_contato_mae,
    horarioInicio: cp_mt_horario_inicio,
    horarioFim: cp_mt_horario_fim,
    nivelIdioma: cp_mt_nivel,
    primeiraDataPagamento: cp_mt_primeira_parcela,
    nomeUsuario: cp_mt_nome_usuario,
    tipoPagamento: cp_mt_tipo_pagamento,
    diasSemana: cp_mt_dias_semana,
    valorMensalidade: cp_mt_valor_mensalidade
  } = req.body;

  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Criar matrícula
      const newMatricula = await prisma.cp_matriculas.create({
        data: {
          cp_mt_curso: cp_mt_curso,
          cp_mt_usuario: parseInt(cp_mt_usuario),
          cp_mt_cadastro_usuario: cp_mt_cadastro_usuario,
          cp_mt_valor_curso: parseFloat(cp_mt_valor_curso),
          cp_mt_quantas_parcelas: parseInt(cp_mt_quantas_parcelas),
          cp_mt_parcelas_pagas: 0,
          cp_status_matricula: cp_status_matricula,
          cp_mt_escola: parseInt(cp_mt_escola),
          cp_mt_escolaridade: cp_mt_escolaridade,
          cp_mt_nivel: nivelIdioma,
          cp_mt_local_nascimento: localNascimento,
          cp_mt_rede_social: redeSocial,
          cp_mt_nome_pai: nomePai,
          cp_mt_contato_pai: contatoPai,
          cp_mt_nome_mae: nomeMae,
          cp_mt_contato_mae: contatoMae,
          cp_mt_horario_inicio: horarioInicio,
          cp_mt_horario_fim: horarioFim,
          cp_mt_excluido: 0,
          cp_mt_primeira_parcela: new Date(primeiraDataPagamento),
          cp_mt_nome_usuario: nomeUsuario,
          cp_mt_tipo_pagamento: tipoPagamento,
          cp_mt_dias_semana: diasSemana
        }
      });

      // Criar parcelas se for parcelado
      if (tipoPagamento === 'parcelado' && cp_mt_quantas_parcelas > 0) {
        const valorParcela = parseFloat((cp_mt_valor_curso / cp_mt_quantas_parcelas).toFixed(2));
        let data = new Date(primeiraDataPagamento);
        
        for (let i = 1; i <= cp_mt_quantas_parcelas; i++) {
          await prisma.cp_matriculaParcelas.create({
            data: {
              cp_mt_id: newMatricula.cp_mt_id,
              cp_mtPar_dataParcela: new Date(data),
              cp_mtPar_status: 'à vencer',
              cp_mtPar_valorParcela: valorParcela
            }
          });
          data.setMonth(data.getMonth() + 1);
        }
      } else if (tipoPagamento === 'mensalidade' && valorMensalidade > 0) {
        let data = new Date(primeiraDataPagamento);
        
        for (let i = 1; i <= 12; i++) {
          await prisma.cp_matriculaParcelas.create({
            data: {
              cp_mt_id: newMatricula.cp_mt_id,
              cp_mtPar_dataParcela: new Date(data),
              cp_mtPar_status: 'à vencer',
              cp_mtPar_valorParcela: parseFloat(valorMensalidade)
            }
          });
          data.setMonth(data.getMonth() + 1);
        }
      }

      return newMatricula;
    });

    res.send({ msg: 'Matrícula cadastrada com sucesso', matriculaId: result.cp_mt_id });
  } catch (err) {
    console.error('Erro ao cadastrar matrícula:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro ao cadastrar matrícula' });
  }
});

// Alias para criação esperado pelo frontend: POST /matriculas
router.post('/', async (req, res) => {
  // Reutiliza a mesma lógica da rota /cadastrar
  const {
    cursoId: cp_mt_curso,
    usuarioId: cp_mt_usuario,
    cpfUsuario: cp_mt_cadastro_usuario,
    valorCurso: cp_mt_valor_curso,
    numeroParcelas: cp_mt_quantas_parcelas,
    status: cp_status_matricula,
    escolaId: cp_mt_escola,
    escolaridade: cp_mt_escolaridade,
    localNascimento: cp_mt_local_nascimento,
    redeSocial: cp_mt_rede_social,
    nomePai: cp_mt_nome_pai,
    contatoPai: cp_mt_contato_pai,
    nomeMae: cp_mt_nome_mae,
    contatoMae: cp_mt_contato_mae,
    horarioInicio: cp_mt_horario_inicio,
    horarioFim: cp_mt_horario_fim,
    nivelIdioma: cp_mt_nivel,
    primeiraDataPagamento: cp_mt_primeira_parcela,
    nomeUsuario: cp_mt_nome_usuario,
    tipoPagamento: cp_mt_tipo_pagamento,
    diasSemana: cp_mt_dias_semana,
    valorMensalidade: cp_mt_valor_mensalidade
  } = req.body;

  try {
    const result = await prisma.$transaction(async (prisma) => {
      const newMatricula = await prisma.cp_matriculas.create({
        data: {
          cp_mt_curso: cp_mt_curso,
          cp_mt_usuario: parseInt(cp_mt_usuario),
          cp_mt_cadastro_usuario: cp_mt_cadastro_usuario,
          cp_mt_valor_curso: parseFloat(cp_mt_valor_curso),
          cp_mt_quantas_parcelas: parseInt(cp_mt_quantas_parcelas),
          cp_mt_parcelas_pagas: 0,
          cp_status_matricula: cp_status_matricula,
          cp_mt_escola: parseInt(cp_mt_escola),
          cp_mt_escolaridade: cp_mt_escolaridade,
          cp_mt_nivel: cp_mt_nivel,
          cp_mt_local_nascimento: cp_mt_local_nascimento,
          cp_mt_rede_social: cp_mt_rede_social,
          cp_mt_nome_pai: cp_mt_nome_pai,
          cp_mt_contato_pai: cp_mt_contato_pai,
          cp_mt_nome_mae: cp_mt_nome_mae,
          cp_mt_contato_mae: cp_mt_contato_mae,
          cp_mt_horario_inicio: cp_mt_horario_inicio,
          cp_mt_horario_fim: cp_mt_horario_fim,
          cp_mt_excluido: 0,
          cp_mt_primeira_parcela: new Date(cp_mt_primeira_parcela),
          cp_mt_nome_usuario: cp_mt_nome_usuario,
          cp_mt_tipo_pagamento: cp_mt_tipo_pagamento,
          cp_mt_dias_semana: cp_mt_dias_semana
        }
      });

      if (cp_mt_tipo_pagamento === 'parcelado' && cp_mt_quantas_parcelas > 0) {
        const valorParcela = parseFloat((cp_mt_valor_curso / cp_mt_quantas_parcelas).toFixed(2));
        let data = new Date(cp_mt_primeira_parcela);
        for (let i = 1; i <= cp_mt_quantas_parcelas; i++) {
          await prisma.cp_matriculaParcelas.create({
            data: {
              cp_mt_id: newMatricula.cp_mt_id,
              cp_mtPar_dataParcela: new Date(data),
              cp_mtPar_status: 'à vencer',
              cp_mtPar_valorParcela: valorParcela
            }
          });
          data.setMonth(data.getMonth() + 1);
        }
      } else if (cp_mt_tipo_pagamento === 'mensalidade' && cp_mt_valor_mensalidade > 0) {
        let data = new Date(cp_mt_primeira_parcela);
        for (let i = 1; i <= 12; i++) {
          await prisma.cp_matriculaParcelas.create({
            data: {
              cp_mt_id: newMatricula.cp_mt_id,
              cp_mtPar_dataParcela: new Date(data),
              cp_mtPar_status: 'à vencer',
              cp_mtPar_valorParcela: parseFloat(cp_mt_valor_mensalidade)
            }
          });
          data.setMonth(data.getMonth() + 1);
        }
      }

      return newMatricula;
    });

    res.send({ msg: 'Matrícula cadastrada com sucesso', matriculaId: result.cp_mt_id });
  } catch (err) {
    console.error('Erro ao cadastrar matrícula:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro ao cadastrar matrícula' });
  }
});

// Editar matrícula
router.put('/editar/:matriculaId', async (req, res) => {
  const matriculaId = parseInt(req.params.matriculaId);
  const {
    cursoId,
    usuarioId,
    cpfUsuario,
    valorCurso,
    numeroParcelas,
    status,
    escolaId,
    escolaridade,
    localNascimento,
    redeSocial,
    nomePai,
    contatoPai,
    nomeMae,
    contatoMae,
    horarioInicio,
    horarioFim,
    nivelIdioma,
    primeiraDataPagamento,
    nomeUsuario,
    tipoPagamento,
    diasSemana,
    valorMensalidade
  } = req.body;

  try {
    await prisma.$transaction(async (prisma) => {
      // Atualizar matrícula
      await prisma.cp_matriculas.update({
        where: { cp_mt_id: matriculaId },
        data: {
          cp_mt_curso: cursoId,
          cp_mt_usuario: parseInt(usuarioId),
          cp_mt_cadastro_usuario: cpfUsuario,
          cp_mt_valor_curso: parseFloat(valorCurso),
          cp_mt_quantas_parcelas: parseInt(numeroParcelas),
          cp_status_matricula: status,
          cp_mt_escola: parseInt(escolaId),
          cp_mt_escolaridade: escolaridade,
          cp_mt_nivel: nivelIdioma,
          cp_mt_local_nascimento: localNascimento,
          cp_mt_rede_social: redeSocial,
          cp_mt_nome_pai: nomePai,
          cp_mt_contato_pai: contatoPai,
          cp_mt_nome_mae: nomeMae,
          cp_mt_contato_mae: contatoMae,
          cp_mt_horario_inicio: horarioInicio,
          cp_mt_horario_fim: horarioFim,
          cp_mt_primeira_parcela: new Date(primeiraDataPagamento),
          cp_mt_nome_usuario: nomeUsuario,
          cp_mt_tipo_pagamento: tipoPagamento,
          cp_mt_dias_semana: diasSemana
        }
      });

      // Remover parcelas antigas
      await prisma.cp_matriculaParcelas.deleteMany({
        where: { cp_mt_id: matriculaId }
      });

      // Criar novas parcelas
      if (tipoPagamento === 'parcelado' && numeroParcelas > 0) {
        const valorParcela = parseFloat((valorCurso / numeroParcelas).toFixed(2));
        let data = new Date(primeiraDataPagamento);
        
        for (let i = 1; i <= numeroParcelas; i++) {
          await prisma.cp_matriculaParcelas.create({
            data: {
              cp_mt_id: matriculaId,
              cp_mtPar_dataParcela: new Date(data),
              cp_mtPar_status: 'à vencer',
              cp_mtPar_valorParcela: valorParcela
            }
          });
          data.setMonth(data.getMonth() + 1);
        }
      } else if (tipoPagamento === 'mensalidade' && valorMensalidade > 0) {
        let data = new Date(primeiraDataPagamento);
        
        for (let i = 1; i <= 12; i++) {
          await prisma.cp_matriculaParcelas.create({
            data: {
              cp_mt_id: matriculaId,
              cp_mtPar_dataParcela: new Date(data),
              cp_mtPar_status: 'à vencer',
              cp_mtPar_valorParcela: parseFloat(valorMensalidade)
            }
          });
          data.setMonth(data.getMonth() + 1);
        }
      }
    });

    res.send({ msg: 'Matrícula editada com sucesso' });
  } catch (err) {
    console.error('Erro ao editar matrícula:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro ao editar matrícula' });
  }
});

// Alias para edição esperado pelo frontend: PUT /matriculas/:matriculaId
router.put('/:matriculaId', async (req, res) => {
  const matriculaId = parseInt(req.params.matriculaId);
  const {
    cursoId,
    usuarioId,
    cpfUsuario,
    valorCurso,
    numeroParcelas,
    status,
    escolaId,
    escolaridade,
    localNascimento,
    redeSocial,
    nomePai,
    contatoPai,
    nomeMae,
    contatoMae,
    horarioInicio,
    horarioFim,
    nivelIdioma,
    primeiraDataPagamento,
    nomeUsuario,
    tipoPagamento,
    diasSemana,
    valorMensalidade
  } = req.body;

  try {
    await prisma.$transaction(async (prisma) => {
      await prisma.cp_matriculas.update({
        where: { cp_mt_id: matriculaId },
        data: {
          cp_mt_curso: cursoId,
          cp_mt_usuario: parseInt(usuarioId),
          cp_mt_cadastro_usuario: cpfUsuario,
          cp_mt_valor_curso: parseFloat(valorCurso),
          cp_mt_quantas_parcelas: parseInt(numeroParcelas),
          cp_status_matricula: status,
          cp_mt_escola: parseInt(escolaId),
          cp_mt_escolaridade: escolaridade,
          cp_mt_nivel: nivelIdioma,
          cp_mt_local_nascimento: localNascimento,
          cp_mt_rede_social: redeSocial,
          cp_mt_nome_pai: nomePai,
          cp_mt_contato_pai: contatoPai,
          cp_mt_nome_mae: nomeMae,
          cp_mt_contato_mae: contatoMae,
          cp_mt_horario_inicio: horarioInicio,
          cp_mt_horario_fim: horarioFim,
          cp_mt_primeira_parcela: new Date(primeiraDataPagamento),
          cp_mt_nome_usuario: nomeUsuario,
          cp_mt_tipo_pagamento: tipoPagamento,
          cp_mt_dias_semana: diasSemana
        }
      });

      await prisma.cp_matriculaParcelas.deleteMany({ where: { cp_mt_id: matriculaId } });

      if (tipoPagamento === 'parcelado' && numeroParcelas > 0) {
        const valorParcela = parseFloat((valorCurso / numeroParcelas).toFixed(2));
        let data = new Date(primeiraDataPagamento);
        for (let i = 1; i <= numeroParcelas; i++) {
          await prisma.cp_matriculaParcelas.create({
            data: {
              cp_mt_id: matriculaId,
              cp_mtPar_dataParcela: new Date(data),
              cp_mtPar_status: 'à vencer',
              cp_mtPar_valorParcela: valorParcela
            }
          });
          data.setMonth(data.getMonth() + 1);
        }
      } else if (tipoPagamento === 'mensalidade' && valorMensalidade > 0) {
        let data = new Date(primeiraDataPagamento);
        for (let i = 1; i <= 12; i++) {
          await prisma.cp_matriculaParcelas.create({
            data: {
              cp_mt_id: matriculaId,
              cp_mtPar_dataParcela: new Date(data),
              cp_mtPar_status: 'à vencer',
              cp_mtPar_valorParcela: parseFloat(valorMensalidade)
            }
          });
          data.setMonth(data.getMonth() + 1);
        }
      }
    });

    res.send({ msg: 'Matrícula e parcelas atualizadas com sucesso' });
  } catch (err) {
    console.error('Erro ao editar matrícula:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro ao editar matrícula' });
  }
});
// Rota de migração removida - não necessária

module.exports = router;
