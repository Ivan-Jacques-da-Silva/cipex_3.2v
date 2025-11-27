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

// Helpers de compatibilidade
const deriveAnoSemestre = (dataStr) => {
  // Espera formato YYYY-MM-DD, retorna { ano: 'YYYY', semestre: '1'|'2' }
  if (!dataStr) return { ano: null, semestre: null };
  try {
    const [year, month] = dataStr.split('-').map((v) => parseInt(v, 10));
    if (!year || !month) return { ano: null, semestre: null };
    return { ano: String(year), semestre: month <= 6 ? '1' : '2' };
  } catch (_) {
    return { ano: null, semestre: null };
  }
};

const buildTurmaDataFromPayload = (body) => {
  // Aceita payload tanto com cp_tr_* (frontend legado) quanto cp_turma_*/schema
  const nome = body.cp_turma_nome ?? body.cp_tr_nome ?? null;
  const escolaIdRaw = body.cp_escola_id ?? body.cp_tr_id_escola;
  const professorIdRaw = body.cp_usuario_id ?? body.cp_tr_id_professor;
  const { ano, semestre } = body.cp_turma_ano && body.cp_turma_semestre
    ? { ano: body.cp_turma_ano, semestre: body.cp_turma_semestre }
    : deriveAnoSemestre(body.cp_tr_data);

  const data = {
    cp_turma_nome: nome,
    cp_escola_id: escolaIdRaw != null && escolaIdRaw !== '' ? parseInt(escolaIdRaw, 10) : null,
    cp_usuario_id: professorIdRaw != null && professorIdRaw !== '' ? parseInt(professorIdRaw, 10) : null,
    cp_turma_ano: ano,
    cp_turma_semestre: semestre,
  };

  // Remove chaves undefined
  Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);
  return data;
};

// Cadastrar nova turma (compatível com frontend)
router.post('/register', async (req, res) => {
  const { cp_tr_alunos } = req.body;
  const turmaData = buildTurmaDataFromPayload(req.body);

  if (!turmaData.cp_turma_nome || !turmaData.cp_escola_id || !turmaData.cp_usuario_id) {
    return res.status(400).json({ msg: 'Campos obrigatórios ausentes (nome, escola, professor).' });
  }

  try {
    const result = await prisma.$transaction(async (prismaTx) => {
      // Criar a turma no schema atual
      const newTurma = await prismaTx.cp_turmas.create({ data: turmaData });

      // Vincular alunos selecionados
      if (cp_tr_alunos && Array.isArray(cp_tr_alunos)) {
        for (const alunoId of cp_tr_alunos) {
          await prismaTx.cp_usuarios.update({
            where: { cp_id: parseInt(alunoId, 10) },
            data: { cp_turma_id: newTurma.cp_turma_id }
          });
        }
      }

      return newTurma;
    });

    res.status(200).json({ msg: 'Turma registrada com sucesso', turmaId: result.cp_turma_id });
  } catch (err) {
    console.error('Erro ao registrar turma:', err);
    logError(err);
    res.status(500).json({ msg: 'Erro ao registrar turma' });
  }
});

// Alias para endpoint esperado pelo frontend: POST /turmas
router.post('/', async (req, res, next) => {
  req.url = '/register';
  return router.handle(req, res, next);
});

// Atualizar turma
router.put('/update/:turmaId', async (req, res) => {
  const turmaId = parseInt(req.params.turmaId, 10);
  const { cp_tr_alunos } = req.body;
  const updateData = buildTurmaDataFromPayload(req.body);

  try {
    const result = await prisma.$transaction(async (prismaTx) => {
      // Atualizar turma
      await prismaTx.cp_turmas.update({
        where: { cp_turma_id: turmaId },
        data: updateData
      });

      // Sincronizar alunos: adicionar selecionados e remover os não selecionados
      if (Array.isArray(cp_tr_alunos)) {
        const currentAlunos = await prismaTx.cp_usuarios.findMany({
          where: { cp_turma_id: turmaId }
        });
        const currentIds = new Set(currentAlunos.map((a) => a.cp_id));
        const newIds = new Set(cp_tr_alunos.map((id) => parseInt(id, 10)));

        // Adicionar
        for (const id of newIds) {
          if (!currentIds.has(id)) {
            await prismaTx.cp_usuarios.update({ where: { cp_id: id }, data: { cp_turma_id: turmaId } });
          }
        }
        // Remover
        for (const id of currentIds) {
          if (!newIds.has(id)) {
            await prismaTx.cp_usuarios.update({ where: { cp_id: id }, data: { cp_turma_id: null } });
          }
        }
      }

      return turmaId;
    });

    res.status(200).json({ msg: 'Turma atualizada com sucesso', turmaId: result });
  } catch (err) {
    console.error('Erro ao atualizar turma:', err);
    logError(err);
    res.status(500).json({ msg: 'Erro ao atualizar turma' });
  }
});

// Alias para endpoint esperado pelo frontend: PUT /turmas/:turmaId
router.put('/:turmaId', async (req, res, next) => {
  req.url = `/update/${req.params.turmaId}`;
  return router.handle(req, res, next);
});

// Excluir turma
router.delete('/:turmaId', async (req, res) => {
  const turmaId = parseInt(req.params.turmaId, 10);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.cp_usuarios.updateMany({
        where: { cp_turma_id: turmaId },
        data: { cp_turma_id: null }
      });

      await tx.cp_turmas.delete({
        where: { cp_turma_id: turmaId }
      });
    });

  
    res.status(200).json({ msg: 'Turma excluída com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir turma:', err);
    logError(err);
    if (err.code === 'P2025') {
      return res.status(404).json({ msg: 'Turma não encontrada' });
    }
    res.status(500).json({ msg: 'Erro ao excluir turma' });
  }
});

// Buscar todas as turmas (retornar com chaves compatíveis cp_tr_*)
router.get('/', async (req, res) => {
  try {
    const turmas = await prisma.cp_turmas.findMany({
      include: {
        cp_usuarios: { select: { cp_nome: true } },
        cp_escolas: { select: { cp_ec_nome: true } }
      }
    });

    const turmasFormatted = turmas.map((t) => ({
      cp_tr_id: t.cp_turma_id,
      cp_tr_nome: t.cp_turma_nome,
      // Representar data a partir de ano/semestre para compatibilidade
      cp_tr_data: t.cp_turma_ano && t.cp_turma_semestre
        ? new Date(`${t.cp_turma_semestre === '1' ? `${t.cp_turma_ano}-06-01` : `${t.cp_turma_ano}-12-01`}`)
        : null,
      cp_tr_id_professor: t.cp_usuario_id,
      cp_tr_id_escola: t.cp_escola_id,
      // Nomes auxiliares para UI
      nomeDoProfessor: t.cp_usuarios?.cp_nome ?? null,
      nomeDaEscola: t.cp_escolas?.cp_ec_nome ?? null
    }));

    res.send(turmasFormatted);
  } catch (err) {
    console.error('Erro ao buscar as turmas:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro ao buscar as turmas' });
  }
});

// Buscar turma específica pelo ID (compatível com frontend)
router.get('/:turmaId', async (req, res) => {
  const turmaId = parseInt(req.params.turmaId, 10);

  try {
    const t = await prisma.cp_turmas.findUnique({
      where: { cp_turma_id: turmaId },
      include: {
        cp_usuarios: { select: { cp_nome: true } },
        cp_escolas: { select: { cp_ec_nome: true } }
      }
    });

    if (!t) return res.status(404).send({ msg: 'Turma não encontrada' });

    const turmaFormatted = {
      cp_tr_id: t.cp_turma_id,
      cp_tr_nome: t.cp_turma_nome,
      cp_tr_data: t.cp_turma_ano && t.cp_turma_semestre
        ? new Date(`${t.cp_turma_semestre === '1' ? `${t.cp_turma_ano}-06-01` : `${t.cp_turma_ano}-12-01`}`)
        : null,
      cp_tr_id_professor: t.cp_usuario_id,
      cp_tr_id_escola: t.cp_escola_id,
      nomeDoProfessor: t.cp_usuarios?.cp_nome ?? null,
      nomeDaEscola: t.cp_escolas?.cp_ec_nome ?? null
    };

    res.send(turmaFormatted);
  } catch (err) {
    console.error('Erro ao buscar a turma:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro ao buscar a turma' });
  }
});

// Buscar alunos de uma turma específica
router.get('/:turmaId/alunos', async (req, res) => {
  const turmaId = parseInt(req.params.turmaId);

  try {
    const alunos = await prisma.cp_usuarios.findMany({
      where: {
        cp_turma_id: turmaId,
        cp_excluido: 0
      }
    });

    if (alunos.length === 0) {
      res.status(404).send({ msg: 'Nenhum aluno encontrado para esta turma.' });
    } else {
      res.send(alunos);
    }
  } catch (err) {
    console.error('Erro ao buscar os alunos:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro ao buscar os alunos' });
  }
});

// Endpoint compatível com frontend para buscar alunos por escola
router.get('/escola/alunos/:escolaId', async (req, res) => {
  const escolaId = parseInt(req.params.escolaId, 10);
  try {
    const alunos = await prisma.cp_usuarios.findMany({
      where: {
        cp_escola_id: escolaId,
        cp_tipo_user: 5,
        cp_excluido: { not: 1 }
      }
    });

    if (alunos.length > 0) {
      res.send(alunos);
    } else {
      res.status(404).send({ msg: 'Nenhum aluno cadastrado nesta escola.' });
    }
  } catch (err) {
    console.error('Erro ao buscar alunos associados à escola:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro no servidor' });
  }
});

// Buscar turmas de um professor específico
router.get('/professor/:professorId', async (req, res) => {
  const professorId = parseInt(req.params.professorId);
  
  try {
    const turmas = await prisma.cp_turmas.findMany({
      where: {
        cp_tr_professor_id: professorId
      },
      include: {
        professor: {
          select: { cp_nome: true }
        },
        escola: {
          select: { cp_ec_nome: true }
        },
        curso: {
          select: { cp_cr_nome: true }
        }
      }
    });

    const turmasFormatted = turmas.map(turma => ({
      ...turma,
      nomeDoProfessor: turma.professor.cp_nome,
      nomeDaEscola: turma.escola.cp_ec_nome,
      nomeDoCurso: turma.curso.cp_cr_nome
    }));

    res.json(turmasFormatted);
  } catch (err) {
    console.error('Erro ao buscar turmas do professor:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao buscar turmas do professor' });
  }
});

// Buscar turmas com alunos
router.get('/com-alunos/todas', async (req, res) => {
  try {
    const turmas = await prisma.cp_turmas.findMany({
      where: {
        alunos: {
          some: {
            cp_excluido: 0
          }
        }
      },
      include: {
        professor: {
          select: { cp_nome: true }
        },
        escola: {
          select: { cp_ec_nome: true }
        }
      },
      distinct: ['cp_tr_id']
    });

    const turmasFormatted = turmas.map(turma => ({
      ...turma,
      nomeDoProfessor: turma.professor.cp_nome,
      nomeDaEscola: turma.escola.cp_ec_nome
    }));

    res.send(turmasFormatted);
  } catch (err) {
    console.error('Erro ao buscar as turmas:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro ao buscar as turmas' });
  }
});

// Salvar chamada
router.post('/chamadas', async (req, res) => {
  const { turmaId, alunoId, data, hora, status } = req.body;

  console.log('Dados recebidos:', req.body);

  try {
    const chamada = await prisma.cp_chamadas.create({
      data: {
        cp_ch_turma_id: parseInt(turmaId),
        cp_ch_aluno_id: parseInt(alunoId),
        cp_ch_data: new Date(data),
        cp_ch_presente: status === 'presente'
      }
    });

    console.log('Resultado da inserção:', chamada);
    res.send({
      msg: 'Chamada salva com sucesso',
      dadosSalvos: { turmaId, alunoId, data, hora, status }
    });
  } catch (err) {
    console.error('Erro ao salvar chamada:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro ao salvar chamada' });
  }
});

// Buscar histórico de chamadas de uma turma
router.get('/chamadas/:turmaId', async (req, res) => {
  const turmaId = parseInt(req.params.turmaId);

  try {
    const chamadas = await prisma.cp_chamadas.findMany({
      where: { cp_ch_turma_id: turmaId },
      include: {
        aluno: {
          select: { cp_nome: true }
        }
      },
      orderBy: [
        { cp_ch_data: 'desc' }
      ]
    });

    const chamadasFormatted = chamadas.map(chamada => ({
      cp_ch_id: chamada.cp_ch_id,
      cp_ch_data: chamada.cp_ch_data,
      cp_nome_aluno: chamada.aluno.cp_nome,
      cp_ch_status: chamada.cp_ch_presente ? 'presente' : 'ausente'
    }));

    res.send(chamadasFormatted);
  } catch (err) {
    console.error('Erro ao buscar histórico de chamadas:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro ao buscar histórico de chamadas' });
  }
});

// Atualizar chamada
router.put('/chamadas/:id', async (req, res) => {
  const chamadaId = parseInt(req.params.id);
  const { data, hora, status } = req.body;

  if (!status || typeof status !== 'string') {
    return res.status(400).json({ error: 'Status inválido.' });
  }

  try {
    await prisma.cp_chamadas.update({
      where: { cp_ch_id: chamadaId },
      data: {
        cp_ch_data: new Date(data),
        cp_ch_presente: status === 'presente'
      }
    });

    res.status(200).json({ message: 'Chamada atualizada com sucesso.' });
  } catch (err) {
    console.error('Erro ao atualizar chamada:', err);
    logError(err);
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Chamada não encontrada.' });
    } else {
      res.status(500).json({ error: 'Erro ao atualizar chamada.' });
    }
  }
});

// Deletar chamada
router.delete('/chamadas/:id', async (req, res) => {
  const chamadaId = parseInt(req.params.id);

  try {
    await prisma.cp_chamadas.delete({
      where: { cp_ch_id: chamadaId }
    });

    res.status(200).json({ message: 'Chamada deletada com sucesso.' });
  } catch (err) {
    console.error('Erro ao deletar chamada:', err);
    logError(err);
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Chamada não encontrada.' });
    } else {
      res.status(500).json({ error: 'Erro ao deletar chamada.' });
    }
  }
});

// Rota de migração removida - não necessária

module.exports = router;
