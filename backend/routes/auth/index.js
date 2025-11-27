const express = require('express');
const router = express.Router();
const { prisma } = require('../../config/database');
const bcrypt = require('bcryptjs');
const multer = require('multer');
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

// Middleware de autenticação simples (pode ser melhorado com JWT)
const requireAuth = (req, res, next) => {
  // Por segurança, requeremos um header de autorização básico
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autorização necessário' });
  }
  next();
};

// Configuração para salvar foto do perfil
const storageProfilePhoto = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../FotoPerfil'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  }
});

const profilePhotoUpload = multer({ storage: storageProfilePhoto });

// Rota de login
router.post('/login', async (req, res) => {
  const { login, password } = req.body;

  try {
    const user = await prisma.cp_usuarios.findFirst({
      where: {
        cp_login: login
      },
      select: {
        cp_id: true,
        cp_tipo_user: true,
        cp_nome: true,
        cp_foto_perfil: true,
        cp_escola_id: true,
        cp_turma_id: true,
        cp_password: true
      }
    });

    if (user) {
      let isValidPassword = false;
      
      // Primeiro tenta verificar se é uma senha criptografada com bcrypt
      if (user.cp_password.startsWith('$2')) {
        isValidPassword = await bcrypt.compare(password, user.cp_password);
      } else {
        // Se não for bcrypt, compara diretamente (texto plano)
        isValidPassword = password === user.cp_password;
      }
      
      if (isValidPassword) {
        res.send({
          msg: 'Usuário Logado com sucesso',
          userId: user.cp_id,
          userType: user.cp_tipo_user,
          userName: user.cp_nome,
          userProfilePhoto: user.cp_foto_perfil,
          schoolId: user.cp_escola_id,
          turmaID: user.cp_turma_id
        });
      } else {
        res.send({ msg: 'Usuário ou senha incorretos' });
      }
    } else {
      res.send({ msg: 'Usuário ou senha incorretos' });
    }
  } catch (err) {
    console.error('Erro no login:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro no servidor' });
  }
});

// Rota de cadastro de usuários
router.post('/register', profilePhotoUpload.single('cp_foto_perfil'), async (req, res) => {
  const {
    cp_nome,
    cp_email,
    cp_login,
    cp_password,
    cp_tipo_user,
    cp_rg,
    cp_cpf,
    cp_datanascimento,
    cp_estadocivil,
    cp_cnpj,
    cp_ie,
    cp_whatsapp,
    cp_telefone,
    cp_empresaatuacao,
    cp_profissao,
    cp_end_cidade_estado,
    cp_end_rua,
    cp_end_num,
    cp_end_cep,
    cp_descricao,
    cp_escola_id
  } = req.body;

  const filePath = req.file ? `/FotoPerfil/${req.file.filename}` : `/FotoPerfil/default.png`;

  console.log('Inserindo novo usuário...');

  try {
    // Hash da senha antes de salvar
    const hashedPassword = await bcrypt.hash(cp_password, 10);
    
    const newUser = await prisma.cp_usuarios.create({
      data: {
        cp_nome,
        cp_email,
        cp_login,
        cp_password: hashedPassword,
        cp_tipo_user: parseInt(cp_tipo_user),
        cp_rg: cp_rg || null,
        cp_cpf,
        // Schema espera String: manter formato recebido
        cp_datanascimento: cp_datanascimento || null,
        cp_estadocivil: cp_estadocivil || null,
        cp_cnpj: cp_cnpj || null,
        cp_ie: cp_ie || null,
        cp_whatsapp: cp_whatsapp || null,
        cp_telefone: cp_telefone || null,
        cp_empresaatuacao: cp_empresaatuacao || null,
        cp_profissao: cp_profissao || null,
        cp_end_cidade_estado: cp_end_cidade_estado || null,
        cp_end_rua: cp_end_rua || null,
        // Schema espera String: não converter para número
        cp_end_num: cp_end_num || null,
        cp_end_cep: cp_end_cep || null,
        cp_descricao: cp_descricao || null,
        cp_escola_id: cp_escola_id ? parseInt(cp_escola_id) : null,
        cp_foto_perfil: filePath
      }
    });

    console.log('Usuário registrado com sucesso:', newUser);
    res.send({ exists: false, msg: 'Usuário registrado com sucesso' });
  } catch (err) {
    console.error('Erro ao registrar novo usuário:', err);
    logError(err);

    if (req.file) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) {
          console.error('Erro ao excluir imagem:', unlinkErr);
          logError(unlinkErr);
        }
        console.log('Imagem excluída devido a erro no registro do usuário');
      });
    }

    res.status(500).send({ msg: 'Erro ao registrar novo usuário' });
  }
});

// Upload da foto de perfil
router.post('/uploadProfilePhoto', profilePhotoUpload.single('cp_foto_perfil'), async (req, res) => {
  console.log('[auth] POST /uploadProfilePhoto file:', req.file?.originalname, 'userId:', req.body?.userId);
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
          console.warn('[auth] Foto antiga não encontrada para remoção:', oldFull);
        } else {
          fs.unlink(oldFull, (unlinkErr) => {
            if (unlinkErr) {
              console.error('[auth] Erro ao remover foto antiga:', unlinkErr);
            } else {
              console.log('[auth] Foto antiga removida:', oldFull);
            }
          });
        }
      });
    }

    await prisma.cp_usuarios.update({
      where: { cp_id: userId },
      data: { cp_foto_perfil: filePath }
    });
    console.log('[auth] Foto de perfil atualizada:', { userId, filePath });
    res.json({ success: true, filePath });
  } catch (err) {
    console.error('Erro ao atualizar a foto de perfil:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao atualizar a foto de perfil' });
  }
});

// Exportar middleware de autenticação para uso em outras rotas
router.requireAuth = requireAuth;

module.exports = router;
