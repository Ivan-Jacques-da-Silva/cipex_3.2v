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

// Buscar todas as escolas não excluídas
router.get('/', async (req, res) => {
  try {
    const escolas = await prisma.cp_escolas.findMany({
      where: { cp_ec_excluido: false }
    });

    res.send(escolas);
  } catch (err) {
    console.error('Erro ao buscar escolas:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro no servidor' });
  }
});

// Buscar escola específica pelo ID
router.get('/:escolaId', async (req, res) => {
  const escolaId = parseInt(req.params.escolaId);

  try {
    const escola = await prisma.cp_escolas.findUnique({
      where: { cp_ec_id: escolaId }
    });

    if (escola) {
      res.send(escola);
    } else {
      res.status(404).send({ msg: 'Escola não encontrada' });
    }
  } catch (err) {
    console.error('Erro ao buscar escola:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro no servidor' });
  }
});

// Cadastrar nova escola
router.post('/register', async (req, res) => {
  console.log("Recebendo requisição de cadastro:", req.body);

  const {
    cp_ec_nome,
    cp_ec_responsavel,
    cp_ec_responsavel_id,
    cp_ec_data_cadastro,
    cp_ec_endereco_rua,
    cp_ec_endereco_numero,
    cp_ec_endereco_cidade,
    cp_ec_endereco_bairro,
    cp_ec_endereco_estado,
    cp_ec_descricao,
    cp_ec_excluido = false
  } = req.body;

  // Normalizações de tipos
  const excluidoBool = (cp_ec_excluido === true || cp_ec_excluido === 'true' || Number(cp_ec_excluido) === 1) ? true : false;
  const dataCadastro = cp_ec_data_cadastro ? new Date(cp_ec_data_cadastro) : null;
  const responsavelId = (cp_ec_responsavel_id !== undefined && cp_ec_responsavel_id !== null && cp_ec_responsavel_id !== '')
    ? parseInt(cp_ec_responsavel_id)
    : null;

  try {
    await prisma.cp_escolas.create({
      data: {
        cp_ec_nome,
        cp_ec_responsavel,
        cp_ec_responsavel_id: responsavelId,
        cp_ec_data_cadastro: dataCadastro,
        cp_ec_endereco_rua,
        cp_ec_endereco_numero,
        cp_ec_endereco_cidade,
        cp_ec_endereco_bairro,
        cp_ec_endereco_estado,
        cp_ec_descricao: cp_ec_descricao || null,
        cp_ec_excluido: excluidoBool
      }
    });

    res.status(200).json({ msg: 'Escola cadastrada com sucesso' });
  } catch (err) {
    console.error("Erro ao registrar escola:", err);
    logError(err);
    res.status(500).json({ msg: 'Erro ao registrar nova escola', error: err });
  }
});

// Alias para o endpoint esperado pelo frontend: POST /escolas
router.post('/', async (req, res) => {
  // Reutiliza a lógica de /register
  req.url = '/register';
  return router.handle(req, res);
});

// Editar escola
router.put('/edit/:escolaId', async (req, res) => {
  const escolaId = parseInt(req.params.escolaId);
  const updatedEscola = { ...req.body };

  // Normalizações de tipos
  if (updatedEscola.cp_ec_data_cadastro) {
    updatedEscola.cp_ec_data_cadastro = new Date(updatedEscola.cp_ec_data_cadastro);
  }
  if (typeof updatedEscola.cp_ec_excluido !== 'undefined') {
    updatedEscola.cp_ec_excluido = (updatedEscola.cp_ec_excluido === true || updatedEscola.cp_ec_excluido === 'true' || Number(updatedEscola.cp_ec_excluido) === 1) ? true : false;
  }
  if (typeof updatedEscola.cp_ec_responsavel_id !== 'undefined') {
    updatedEscola.cp_ec_responsavel_id = (updatedEscola.cp_ec_responsavel_id !== null && updatedEscola.cp_ec_responsavel_id !== '')
      ? parseInt(updatedEscola.cp_ec_responsavel_id)
      : null;
  }

  try {
    await prisma.cp_escolas.update({
      where: { cp_ec_id: escolaId },
      data: updatedEscola
    });

    res.status(200).json({ msg: 'Escola atualizada com sucesso' });
  } catch (err) {
    console.error('Erro ao editar escola:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao editar escola' });
  }
});

// Alias para o endpoint esperado pelo frontend: PUT /escolas/:escolaId
router.put('/:escolaId', async (req, res) => {
  // Reutiliza a lógica de /edit/:escolaId
  req.url = `/edit/${req.params.escolaId}`;
  return router.handle(req, res);
});

// Excluir escola pelo ID (hard delete)
router.delete('/:escolaId', async (req, res) => {
  const escolaId = parseInt(req.params.escolaId);

  try {
    await prisma.cp_escolas.delete({
      where: { cp_ec_id: escolaId }
    });

    res.send({ msg: 'Escola excluída com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir escola:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro ao excluir escola' });
  }
});

// Marcar escola como excluída (soft delete)
router.delete('/soft-delete/:escolaId', async (req, res) => {
  const escolaId = parseInt(req.params.escolaId);

  try {
    const updatedEscola = await prisma.cp_escolas.update({
      where: { cp_ec_id: escolaId },
      data: { cp_ec_excluido: true }
    });

    res.send({ msg: 'Escola marcada como excluída com sucesso' });
  } catch (err) {
    console.error('Erro ao marcar escola como excluída:', err);
    logError(err);
    if (err.code === 'P2025') {
      res.status(404).send({ msg: 'Escola não encontrada' });
    } else {
      res.status(500).send({ msg: 'Erro ao marcar escola como excluída' });
    }
  }
});

// Rota de migração removida - não necessária

module.exports = router;
