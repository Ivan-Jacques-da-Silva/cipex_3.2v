const express = require('express');
const { prisma } = require('../../config/database');

const router = express.Router();

// Função para log de erros
const logError = (error) => {
  console.error(`[${new Date().toISOString()}] Erro:`, error);
};

// ===== ROTAS PARA ANIVERSÁRIOS =====

// Buscar aniversário de um usuário específico
router.get('/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const usuario = await prisma.cp_usuarios.findFirst({
      where: {
        cp_id: userId,
        cp_excluido: 0
      },
      select: { cp_datanascimento: true }
    });

    if (usuario) {
      res.send(usuario);
    } else {
      res.status(404).send({ msg: 'Usuário não encontrado' });
    }
  } catch (err) {
    console.error('Erro ao buscar aniversário do usuário:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro no servidor' });
  }
});

// Buscar aniversariantes dos próximos 5 dias
router.get('/aniversariantes', async (req, res) => {
  try {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 5);

    const usuarios = await prisma.cp_usuarios.findMany({
      where: { cp_excluido: 0 },
      select: {
        cp_nome: true,
        cp_datanascimento: true,
        cp_escola_id: true
      }
    });

    // Filtrar aniversariantes dos próximos 5 dias
    const aniversariantes = usuarios.filter(usuario => {
      if (!usuario.cp_datanascimento) return false;
      
      const birthDate = new Date(usuario.cp_datanascimento);
      const thisYear = today.getFullYear();
      const birthdayThisYear = new Date(thisYear, birthDate.getMonth(), birthDate.getDate());
      
      return birthdayThisYear >= today && birthdayThisYear <= endDate;
    });

    aniversariantes.sort((a, b) => {
      const aDate = new Date(today.getFullYear(), a.cp_datanascimento.getMonth(), a.cp_datanascimento.getDate());
      const bDate = new Date(today.getFullYear(), b.cp_datanascimento.getMonth(), b.cp_datanascimento.getDate());
      return aDate - bDate;
    });

    res.send(aniversariantes);
  } catch (err) {
    console.error('Erro ao buscar aniversariantes:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro no servidor' });
  }
});

// Buscar todos os aniversários para agenda
router.get('/aniversarios-agenda', async (req, res) => {
  try {
    const usuarios = await prisma.cp_usuarios.findMany({
      where: { cp_excluido: 0 },
      select: {
        cp_id: true,
        cp_nome: true,
        cp_datanascimento: true,
        cp_escola_id: true
      }
    });

    const aniversarios = usuarios
      .filter(user => user.cp_datanascimento)
      .map(user => {
        const birthDate = new Date(user.cp_datanascimento);
        const month = String(birthDate.getMonth() + 1).padStart(2, '0');
        const day = String(birthDate.getDate()).padStart(2, '0');
        
        return {
          cp_id: user.cp_id,
          cp_nome: user.cp_nome,
          aniversario: `${month}-${day}`,
          cp_escola_id: user.cp_escola_id
        };
      });

    res.send(aniversarios);
  } catch (err) {
    console.error('Erro ao buscar aniversários:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro no servidor' });
  }
});

module.exports = router;