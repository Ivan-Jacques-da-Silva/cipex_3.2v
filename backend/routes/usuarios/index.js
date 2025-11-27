const express = require('express');
const router = express.Router();
const { prisma } = require('../../config/database');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

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

// Middleware de autenticação simples (pode ser melhorado com JWT)
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autorização necessário' });
  }
  next();
};

// Configuração para upload de foto de perfil (alinhado com /auth)
const storageProfilePhoto = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../FotoPerfil'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  }
});

const profilePhotoUpload = multer({ storage: storageProfilePhoto });

// Deletar usuário (rota protegida)
router.delete('/delete-user/:userId', requireAuth, async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const deletedUser = await prisma.cp_usuarios.delete({
      where: { cp_id: userId }
    });

    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (err) {
    console.error('Erro ao deletar usuário:', err);
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Usuário não encontrado' });
    } else {
      res.status(500).json({ error: 'Erro ao deletar usuário', details: err.message });
    }
  }
});

// Listar todos os usuários (rota protegida)
router.get('/', requireAuth, async (req, res) => {
  try {
    const users = await prisma.cp_usuarios.findMany({
      select: {
        cp_id: true,
        cp_nome: true,
        cp_email: true,
        cp_datanascimento: true,
        cp_tipo_user: true,
        cp_excluido: true,
        cp_escola_id: true
      }
    });

    res.send(users);
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro no servidor' });
  }
});

// Buscar usuário por ID
router.get('/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const user = await prisma.cp_usuarios.findUnique({
      where: { cp_id: userId }
    });

    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ msg: 'Usuário não encontrado' });
    }
  } catch (err) {
    console.error('Erro ao buscar usuário:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro ao buscar dados do usuário' });
  }
});

// Editar usuário
// Editar usuário (alias: aceita /edit-user/:userId e /:userId)
router.put('/edit-user/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  const updatedUser = req.body;

  try {
    // Converter campos específicos se necessário
    if (updatedUser.cp_tipo_user) {
      updatedUser.cp_tipo_user = parseInt(updatedUser.cp_tipo_user);
    }
    if (updatedUser.cp_escola_id) {
      updatedUser.cp_escola_id = parseInt(updatedUser.cp_escola_id);
    }
    // Mantém cp_end_num e cp_datanascimento como String conforme schema

    await prisma.cp_usuarios.update({
      where: { cp_id: userId },
      data: updatedUser
    });

    res.status(200).json({ message: 'Usuário editado com sucesso' });
  } catch (err) {
    console.error('Erro ao editar usuário:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao editar usuário' });
  }
});

router.put('/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  const updatedUser = req.body;

  try {
    if (updatedUser.cp_tipo_user) {
      updatedUser.cp_tipo_user = parseInt(updatedUser.cp_tipo_user);
    }
    if (updatedUser.cp_escola_id) {
      updatedUser.cp_escola_id = parseInt(updatedUser.cp_escola_id);
    }
    // Mantém cp_end_num e cp_datanascimento como String conforme schema

    await prisma.cp_usuarios.update({
      where: { cp_id: userId },
      data: updatedUser
    });

    res.status(200).json({ message: 'Usuário editado com sucesso' });
  } catch (err) {
    console.error('Erro ao editar usuário:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao editar usuário' });
  }
});

// Atualizar perfil do usuário logado
router.put('/update-profile/:userId', async (req, res) => {
  console.log('[usuarios] PUT /update-profile/:userId body:', req.body);
  const userId = parseInt(req.params.userId);
  const { cp_nome, cp_email, cp_login, cp_password } = req.body;

  const updateData = {
    cp_nome,
    cp_email,
    cp_login
  };

  if (cp_password && cp_password.trim() !== '') {
    updateData.cp_password = await bcrypt.hash(cp_password, 10);
  }

  try {
    await prisma.cp_usuarios.update({
      where: { cp_id: userId },
      data: updateData
    });
    console.log('[usuarios] Perfil atualizado com sucesso para userId:', userId);
    res.status(200).json({ message: 'Perfil atualizado com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err);
    logError(err);
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Usuário não encontrado' });
    } else {
      res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
  }
});

// Upload da foto de perfil (endpoint esperado pelo frontend)
router.post('/uploadProfilePhoto', profilePhotoUpload.single('cp_foto_perfil'), async (req, res) => {
  console.log('[usuarios] POST /uploadProfilePhoto file:', req.file?.originalname, 'userId:', req.body?.userId);
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhuma foto de perfil enviada' });
  }

  const filePath = `/FotoPerfil/${req.file.filename}`;
  const userId = parseInt(req.body.userId);

  try {
    // Buscar foto anterior para remover do disco
    const existing = await prisma.cp_usuarios.findUnique({
      where: { cp_id: userId },
      select: { cp_foto_perfil: true }
    });

    if (existing?.cp_foto_perfil && !existing.cp_foto_perfil.includes('default.png')) {
      const oldRel = existing.cp_foto_perfil.startsWith('/')
        ? existing.cp_foto_perfil.substring(1)
        : existing.cp_foto_perfil;
      const oldFull = path.join(__dirname, '../../', oldRel);

      fs.access(oldFull, fs.constants.F_OK, (err) => {
        if (err) {
          console.warn('[usuarios] Foto antiga não encontrada para remoção:', oldFull);
        } else {
          fs.unlink(oldFull, (unlinkErr) => {
            if (unlinkErr) {
              console.error('[usuarios] Erro ao remover foto antiga:', unlinkErr);
            } else {
              console.log('[usuarios] Foto antiga removida:', oldFull);
            }
          });
        }
      });
    }

    await prisma.cp_usuarios.update({
      where: { cp_id: userId },
      data: { cp_foto_perfil: filePath }
    });
    console.log('[usuarios] Foto de perfil atualizada:', { userId, filePath });
    res.json({ success: true, filePath });
  } catch (err) {
    console.error('Erro ao atualizar a foto de perfil:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao atualizar a foto de perfil' });
  }
});

// Buscar usuários que são diretores (tipo 2)
router.get('/escolas/diretores', async (req, res) => {
  try {
    const diretores = await prisma.cp_usuarios.findMany({
      where: { cp_tipo_user: 2 }
    });

    res.send(diretores);
  } catch (err) {
    console.error('Erro ao buscar diretores:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro no servidor' });
  }
});

// Alias esperado pelo frontend: listar responsáveis de escolas via query (cp_tipo_user)
router.get('/escolas', async (req, res) => {
  const tipo = parseInt(req.query.cp_tipo_user) || 2; // padrão: diretores
  try {
    const responsaveis = await prisma.cp_usuarios.findMany({
      where: { cp_tipo_user: tipo }
    });
    res.send(responsaveis);
  } catch (err) {
    console.error('Erro ao buscar responsáveis de escolas:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro no servidor ao buscar responsáveis' });
  }
});

// Buscar usuários que são professores (tipo 4)
router.get('/professores', async (req, res) => {
  try {
    const professores = await prisma.cp_usuarios.findMany({
      where: { cp_tipo_user: 4 },
      select: {
        cp_id: true,
        cp_nome: true,
        cp_email: true,
        cp_tipo_user: true
      }
    });

    res.send(professores);
  } catch (err) {
    console.error('Erro ao buscar os professores:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro no servidor ao buscar os professores' });
  }
});

// Buscar alunos de uma escola específica
router.get('/escola/:escolaId/alunos', async (req, res) => {
  const escolaId = parseInt(req.params.escolaId);

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

// Rota de migração removida - não necessária

module.exports = router;
