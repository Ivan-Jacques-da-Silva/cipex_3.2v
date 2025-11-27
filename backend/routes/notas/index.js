const express = require('express');
const { prisma } = require('../../config/database');
const path = require('path');

const router = express.Router();

// Função para log de erros
const logError = (error) => {
  console.error(`[${new Date().toISOString()}] Erro:`, error);
};

// ===== ROTAS PARA NOTAS =====

// Criar nova nota
router.post('/', async (req, res) => {
  const { turmaId, alunoId, data, notaWorkbook, notaProva } = req.body;

  const media = ((parseFloat(notaWorkbook) + parseFloat(notaProva)) / 2).toFixed(1);

  try {
    const novaNota = await prisma.cp_notas.create({
      data: {
        cp_nota_turma_id: parseInt(turmaId),
        cp_nota_aluno_id: parseInt(alunoId),
        cp_nota_data: new Date(data),
        cp_nota_workbook: parseFloat(notaWorkbook),
        cp_nota_prova: parseFloat(notaProva),
        cp_nota_media: parseFloat(media)
      }
    });

    res.status(201).json({
      message: 'Nota salva com sucesso',
      notaId: novaNota.cp_nota_id
    });
  } catch (err) {
    console.error('Erro ao salvar nota:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao salvar nota' });
  }
});

// Buscar notas de uma turma
router.get('/turma/:turmaId', async (req, res) => {
  const turmaId = parseInt(req.params.turmaId);

  try {
    const notas = await prisma.cp_notas.findMany({
      where: { cp_nota_turma_id: turmaId },
      include: {
        aluno: {
          select: { cp_nome: true }
        }
      },
      orderBy: { cp_nota_data: 'desc' }
    });

    const notasFormatted = notas.map(nota => ({
      ...nota,
      cp_nome_aluno: nota.aluno.cp_nome
    }));

    res.json(notasFormatted);
  } catch (err) {
    console.error('Erro ao buscar notas:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao buscar notas' });
  }
});

// Buscar chamadas de uma turma
router.get('/chamadas/turma/:turmaId', async (req, res) => {
  const turmaId = parseInt(req.params.turmaId);

  try {
    const chamadas = await prisma.cp_chamadas.findMany({
      where: { cp_ch_turma_id: turmaId },
      include: {
        aluno: {
          select: { cp_nome: true }
        }
      },
      orderBy: { cp_ch_data: 'desc' }
    });

    const chamadasFormatted = chamadas.map(chamada => ({
      ...chamada,
      nomeAluno: chamada.aluno.cp_nome
    }));

    res.json(chamadasFormatted);
  } catch (err) {
    console.error('Erro ao buscar chamadas da turma:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao buscar chamadas da turma' });
  }
});

// Buscar resumos de uma turma
router.get('/resumos/:turmaId', async (req, res) => {
  const turmaId = parseInt(req.params.turmaId);

  try {
    const resumos = await prisma.cp_resumos.findMany({
      where: { cp_res_turma_id: turmaId },
      orderBy: { cp_res_data: 'desc' }
    });

    res.json(resumos);
  } catch (err) {
    console.error('Erro ao buscar resumos da turma:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao buscar resumos da turma' });
  }
});

// Atualizar nota
router.put('/:notaId', async (req, res) => {
  const notaId = parseInt(req.params.notaId);
  const { notaWorkbook, notaProva } = req.body;

  const media = ((parseFloat(notaWorkbook) + parseFloat(notaProva)) / 2).toFixed(1);

  try {
    await prisma.cp_notas.update({
      where: { cp_nota_id: notaId },
      data: {
        cp_nota_workbook: parseFloat(notaWorkbook),
        cp_nota_prova: parseFloat(notaProva),
        cp_nota_media: parseFloat(media)
      }
    });

    res.json({ message: 'Nota atualizada com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar nota:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao atualizar nota' });
  }
});

// Deletar nota
router.delete('/:notaId', async (req, res) => {
  const notaId = parseInt(req.params.notaId);

  try {
    await prisma.cp_notas.delete({
      where: { cp_nota_id: notaId }
    });

    res.json({ message: 'Nota deletada com sucesso' });
  } catch (err) {
    console.error('Erro ao deletar nota:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao deletar nota' });
  }
});

module.exports = router;