const express = require('express');
const app = express();
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const util = require('util');

// Inicializar o Prisma Client
const prisma = new PrismaClient();

// Lista de origens permitidas
const allowedOrigins = [
  'https://portal.cipex.com.br',
  'http://portal.cipex.com.br',
  'https://pteste.cipex.com.br',
  'http://pteste.cipex.com.br',
  'https://www.portal.cipex.com.br',
  'http://www.portal.cipex.com.br',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://192.168.2.3:3000',
  'https://4833413e-da9a-4416-85e7-98bc908816a9-00-2fw2ufauj31b5.janeway.replit.dev',
  'portal.cipex.com.br'
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log('Origin:', origin);
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log('Not allowed by CORS');
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log('Request URL:', req.url);
  console.log('Request Headers:', req.headers);
  next();
});

// Função de log para gravar erros em um arquivo de log
const logError = (error) => {
  const logFilePath = 'error.log';
  const errorMessage = `${new Date().toISOString()} - ${error.stack}\n`;
  fs.appendFile(logFilePath, errorMessage, (err) => {
    if (err) {
      console.error('Erro ao gravar no arquivo de log:', err);
    }
  });
};

// Rota para login
app.post('/login', async (req, res) => {
  const { login, password } = req.body;

  try {
    const user = await prisma.cp_usuarios.findFirst({
      where: {
        cp_login: login,
        cp_password: password
      },
      select: {
        cp_id: true,
        cp_tipo_user: true,
        cp_nome: true,
        cp_foto_perfil: true,
        cp_escola_id: true,
        cp_turma_id: true
      }
    });

    if (user) {
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
  } catch (err) {
    console.error('Erro no login:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro no servidor' });
  }
});

// Deletar usuário
app.delete('/delete-user/:userId', async (req, res) => {
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

// Listar todos os usuários
app.get('/users', async (req, res) => {
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

// Configuração para salvar foto do perfil
const storageProfilePhoto = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'FotoPerfil');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  }
});

const profilePhotoUpload = multer({ storage: storageProfilePhoto });

// Upload da foto de perfil
app.post('/uploadProfilePhoto', profilePhotoUpload.single('cp_foto_perfil'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhuma foto de perfil enviada' });
  }

  const filePath = `/FotoPerfil/${req.file.filename}`;
  const userId = parseInt(req.body.userId);

  try {
    await prisma.cp_usuarios.update({
      where: { cp_id: userId },
      data: { cp_foto_perfil: filePath }
    });

    res.json({ success: true, filePath });
  } catch (err) {
    console.error('Erro ao atualizar a foto de perfil:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao atualizar a foto de perfil' });
  }
});

// Cadastro de usuários
app.post('/register', profilePhotoUpload.single('cp_foto_perfil'), async (req, res) => {
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
    const newUser = await prisma.cp_usuarios.create({
      data: {
        cp_nome,
        cp_email,
        cp_login,
        cp_password,
        cp_tipo_user: parseInt(cp_tipo_user),
        cp_rg: cp_rg || null,
        cp_cpf,
        cp_datanascimento: new Date(cp_datanascimento),
        cp_estadocivil: cp_estadocivil || null,
        cp_cnpj: cp_cnpj || null,
        cp_ie: cp_ie || null,
        cp_whatsapp: cp_whatsapp || null,
        cp_telefone: cp_telefone || null,
        cp_empresaatuacao: cp_empresaatuacao || null,
        cp_profissao: cp_profissao || null,
        cp_end_cidade_estado: cp_end_cidade_estado || null,
        cp_end_rua: cp_end_rua || null,
        cp_end_num: cp_end_num ? parseInt(cp_end_num) : null,
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

// Servir fotos de perfil
app.use('/FotoPerfil', express.static(path.join(__dirname, 'FotoPerfil')));

// Buscar usuário por ID
app.get('/users/:userId', async (req, res) => {
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
app.put('/edit-user/:userId', async (req, res) => {
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
    if (updatedUser.cp_end_num) {
      updatedUser.cp_end_num = parseInt(updatedUser.cp_end_num);
    }
    if (updatedUser.cp_datanascimento) {
      updatedUser.cp_datanascimento = new Date(updatedUser.cp_datanascimento);
    }

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
app.put('/update-profile/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  const { cp_nome, cp_email, cp_login, cp_password } = req.body;

  const updateData = {
    cp_nome,
    cp_email,
    cp_login
  };

  if (cp_password && cp_password.trim() !== '') {
    updateData.cp_password = cp_password;
  }

  try {
    await prisma.cp_usuarios.update({
      where: { cp_id: userId },
      data: updateData
    });

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

/* ESCOLA */

// Buscar todas as escolas não excluídas
app.get('/escolas', async (req, res) => {
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
app.get('/escolas/:escolaId', async (req, res) => {
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

// Excluir escola pelo ID
app.delete('/escolas/:escolaId', async (req, res) => {
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
app.delete('/delete-escola/:escolaId', async (req, res) => {
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

// Editar escola
app.put('/edit-escola/:escolaId', async (req, res) => {
  const escolaId = parseInt(req.params.escolaId);
  const updatedEscola = req.body;

  // Converter data se necessário
  if (updatedEscola.cp_ec_data_cadastro) {
    updatedEscola.cp_ec_data_cadastro = new Date(updatedEscola.cp_ec_data_cadastro);
  }

  try {
    await prisma.cp_escolas.update({
      where: { cp_ec_id: escolaId },
      data: updatedEscola
    });

    res.status(200).json({ message: 'Escola editada com sucesso' });
  } catch (err) {
    console.error('Erro ao editar escola:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao editar escola' });
  }
});

// Cadastrar nova escola
app.post('/register-escola', async (req, res) => {
  console.log("Recebendo requisição de cadastro:", req.body);

  const { 
    cp_ec_nome, 
    cp_ec_responsavel, 
    cp_ec_data_cadastro, 
    cp_ec_endereco_rua, 
    cp_ec_endereco_numero, 
    cp_ec_endereco_cidade, 
    cp_ec_endereco_bairro, 
    cp_ec_endereco_estado, 
    cp_ec_descricao,
    cp_ec_excluido = false
  } = req.body;

  try {
    const newEscola = await prisma.cp_escolas.create({
      data: {
        cp_ec_nome,
        cp_ec_responsavel,
        cp_ec_data_cadastro: cp_ec_data_cadastro ? new Date(cp_ec_data_cadastro) : null,
        cp_ec_endereco_rua,
        cp_ec_endereco_numero,
        cp_ec_endereco_cidade,
        cp_ec_endereco_bairro,
        cp_ec_endereco_estado,
        cp_ec_descricao: cp_ec_descricao || null,
        cp_ec_excluido
      }
    });

    res.status(200).json({ msg: 'Escola registrada com sucesso' });
  } catch (err) {
    console.error("Erro ao registrar escola:", err);
    logError(err);
    res.status(500).json({ msg: 'Erro ao registrar nova escola', error: err });
  }
});

// Buscar usuários que são diretores (tipo 2)
app.get('/users-escolas', async (req, res) => {
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

/* FIM ESCOLA */

/* TURMA */

// Cadastrar nova turma
app.post('/register-turma', async (req, res) => {
  const { cp_tr_nome, cp_tr_data, cp_tr_id_professor, cp_tr_id_escola, cp_tr_curso_id, cp_tr_alunos } = req.body;

  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Criar a turma
      const newTurma = await prisma.cp_turmas.create({
        data: {
          cp_tr_nome,
          cp_tr_data: new Date(cp_tr_data),
          cp_tr_id_professor: parseInt(cp_tr_id_professor),
          cp_tr_id_escola: parseInt(cp_tr_id_escola),
          cp_tr_curso_id: cp_tr_curso_id ? parseInt(cp_tr_curso_id) : null
        }
      });

      // Atualizar cp_turma_id para os alunos selecionados
      if (cp_tr_alunos && Array.isArray(cp_tr_alunos)) {
        for (const alunoId of cp_tr_alunos) {
          await prisma.cp_usuarios.update({
            where: { cp_id: parseInt(alunoId) },
            data: { cp_turma_id: newTurma.cp_tr_id }
          });
        }
      }

      return newTurma;
    });

    res.status(200).json({ msg: 'Turma registrada com sucesso', turmaId: result.cp_tr_id });
  } catch (err) {
    console.error('Erro ao registrar turma:', err);
    logError(err);
    res.status(500).json({ msg: 'Erro ao registrar turma' });
  }
});

// Atualizar turma
app.put('/update-turma/:turmaId', async (req, res) => {
  const turmaId = parseInt(req.params.turmaId);
  const { cp_tr_nome, cp_tr_data, cp_tr_id_professor, cp_tr_id_escola, cp_tr_curso_id, cp_tr_alunos } = req.body;

  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Atualizar a turma
      const updatedTurma = await prisma.cp_turmas.update({
        where: { cp_tr_id: turmaId },
        data: {
          cp_tr_nome,
          cp_tr_data: new Date(cp_tr_data),
          cp_tr_id_professor: parseInt(cp_tr_id_professor),
          cp_tr_id_escola: parseInt(cp_tr_id_escola),
          cp_tr_curso_id: cp_tr_curso_id ? parseInt(cp_tr_curso_id) : null
        }
      });

      // Remover todos os alunos dessa turma antes de adicionar os novos
      await prisma.cp_usuarios.updateMany({
        where: { cp_turma_id: turmaId },
        data: { cp_turma_id: null }
      });

      // Atualizar cp_turma_id para os alunos selecionados
      if (Array.isArray(cp_tr_alunos) && cp_tr_alunos.length > 0) {
        for (const alunoId of cp_tr_alunos) {
          await prisma.cp_usuarios.update({
            where: { cp_id: parseInt(alunoId) },
            data: { cp_turma_id: turmaId }
          });
        }
      }

      return updatedTurma;
    });

    res.status(200).json({ msg: 'Turma atualizada com sucesso', turmaId });
  } catch (err) {
    console.error('Erro ao atualizar turma:', err);
    logError(err);
    res.status(500).json({ msg: 'Erro ao atualizar turma' });
  }
});

// Excluir turma
app.delete('/delete-turma/:turmaId', async (req, res) => {
  const turmaId = parseInt(req.params.turmaId);

  try {
    await prisma.$transaction(async (prisma) => {
      // Remover associação dos usuários
      await prisma.cp_usuarios.updateMany({
        where: { cp_turma_id: turmaId },
        data: { cp_turma_id: null }
      });

      // Excluir a turma
      await prisma.cp_turmas.delete({
        where: { cp_tr_id: turmaId }
      });
    });

    console.log('Turma excluída com sucesso e cp_usuarios atualizado');
    res.send({ msg: 'Turma excluída com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir turma:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro ao excluir turma' });
  }
});

// Buscar todas as turmas
app.get('/turmas', async (req, res) => {
  try {
    const turmas = await prisma.cp_turmas.findMany({
      include: {
        professor: {
          select: { cp_nome: true }
        },
        escola: {
          select: { cp_ec_nome: true }
        }
      }
    });

    // Mapear os resultados para o formato esperado
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

// Buscar turma específica pelo ID
app.get('/turmas/:turmaId', async (req, res) => {
  const turmaId = parseInt(req.params.turmaId);

  try {
    const turma = await prisma.cp_turmas.findUnique({
      where: { cp_tr_id: turmaId }
    });

    if (turma) {
      res.send(turma);
    } else {
      res.status(404).send({ msg: 'Turma não encontrada' });
    }
  } catch (err) {
    console.error('Erro ao buscar a turma:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro ao buscar a turma' });
  }
});

// Buscar apenas os professores
app.get('/users-professores', async (req, res) => {
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
app.get('/escola/alunos/:id', async (req, res) => {
  const escolaId = parseInt(req.params.id);

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

/* FIM TURMA */

/* CURSO */

// Configuração para upload de PDFs
const storagePDF = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'MaterialCurso'); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueSuffix);
  }
});

const uploadPDF = multer({ 
  storage: storagePDF,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos PDF são permitidos!'), false);
    }
  }
}).fields([
  { name: 'pdf1', maxCount: 1 },
  { name: 'pdf2', maxCount: 1 },
  { name: 'pdf3', maxCount: 1 }
]);

// Configuração para upload de áudios
const storageAudio = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'AudioCurso');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  }
});

const uploadAudio = multer({ storage: storageAudio });

// Servir arquivos estáticos
app.use('/MaterialCurso', express.static(path.join(__dirname, 'MaterialCurso')));
app.use('/AudioCurso', express.static(path.join(__dirname, 'AudioCurso')));

// Buscar todos os cursos
app.get('/cursos', async (req, res) => {
  try {
    const cursos = await prisma.cp_curso.findMany({
      orderBy: { cp_curso_id: 'asc' }
    });

    res.send(cursos);
  } catch (err) {
    console.error('Erro ao buscar cursos:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro ao buscar cursos' });
  }
});

// Cadastrar novo curso com PDFs
app.post('/cursos', uploadPDF, async (req, res) => {
  const { cp_nome_curso, cp_youtube_link_curso } = req.body;

  console.log("Arquivos recebidos:", req.files);
  console.log("Dados recebidos no corpo:", req.body);

  const pdf1 = req.files['pdf1'] ? req.files['pdf1'][0].filename : null;
  const pdf2 = req.files['pdf2'] ? req.files['pdf2'][0].filename : null;
  const pdf3 = req.files['pdf3'] ? req.files['pdf3'][0].filename : null;

  try {
    const newCurso = await prisma.cp_curso.create({
      data: {
        cp_nome_curso,
        cp_youtube_link_curso,
        cp_pdf1_curso: pdf1 ? `/MaterialCurso/${pdf1}` : null,
        cp_pdf2_curso: pdf2 ? `/MaterialCurso/${pdf2}` : null,
        cp_pdf3_curso: pdf3 ? `/MaterialCurso/${pdf3}` : null,
      }
    });

    console.log('Curso registrado com sucesso, ID:', newCurso.cp_curso_id);
    res.send({ msg: 'Curso registrado com sucesso', cursoId: newCurso.cp_curso_id });
  } catch (err) {
    console.error('Erro ao registrar novo curso:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro ao registrar novo curso' });
  }
});

// Buscar material do curso por ID
app.get('/curso-material/:cursoId', async (req, res) => {
  const cursoId = parseInt(req.params.cursoId);

  try {
    const curso = await prisma.cp_curso.findUnique({
      where: { cp_curso_id: cursoId },
      select: {
        cp_youtube_link_curso: true,
        cp_pdf1_curso: true,
        cp_pdf2_curso: true,
        cp_pdf3_curso: true,
      }
    });

    if (curso) {
      console.log('Resultados do banco de dados:', curso);

      const responseData = {
        cp_youtube_link_curso: curso.cp_youtube_link_curso,
        cp_pdf1_curso: curso.cp_pdf1_curso ? `https://testes.cursoviolaocristao.com.br${curso.cp_pdf1_curso}` : null,
        cp_pdf2_curso: curso.cp_pdf2_curso ? `https://testes.cursoviolaocristao.com.br${curso.cp_pdf2_curso}` : null,
        cp_pdf3_curso: curso.cp_pdf3_curso ? `https://testes.cursoviolaocristao.com.br${curso.cp_pdf3_curso}` : null,
      };

      res.status(200).json(responseData);
    } else {
      res.status(404).json({ error: 'Materiais não encontrados para este curso' });
    }
  } catch (err) {
    console.error('Erro ao buscar materiais do curso:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao buscar materiais do curso' });
  }
});

// Buscar curso ID da turma
app.get('/curso-id-da-turma/:turmaId', async (req, res) => {
  const turmaId = parseInt(req.params.turmaId);

  try {
    const turma = await prisma.cp_turmas.findUnique({
      where: { cp_tr_id: turmaId },
      select: { cp_tr_curso_id: true }
    });

    if (turma) {
      res.json(turma);
    } else {
      res.status(404).json({ error: 'Turma não encontrada.' });
    }
  } catch (err) {
    console.error('Erro ao buscar curso:', err);
    logError(err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Buscar áudios do curso
app.get('/audios-curso/:cursoId', async (req, res) => {
  const cursoId = parseInt(req.params.cursoId);

  try {
    const audios = await prisma.cp_audio.findMany({
      where: { cp_curso_id: cursoId },
      select: {
        cp_audio_id: true,
        cp_nome_audio: true
      }
    });

    res.send(audios);
  } catch (err) {
    console.error('Erro ao buscar os áudios do curso:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro ao buscar os áudios do curso' });
  }
});

// Servir arquivos de áudio
app.get('/audio/:nomeAudio', (req, res) => {
  const nomeAudio = req.params.nomeAudio;
  const filePath = path.join(__dirname, 'AudioCurso', nomeAudio);
  res.sendFile(filePath);
});

// Upload de áudios para curso
app.post('/audios-curso/:cursoId', uploadAudio.array('audios'), async (req, res) => {
  const cursoId = parseInt(req.params.cursoId);
  const novosAudios = req.files;

  if (!novosAudios || novosAudios.length === 0) {
    try {
      await prisma.cp_audio.deleteMany({
        where: { cp_curso_id: cursoId }
      });
      return res.send({ msg: 'Todos os áudios foram removidos.' });
    } catch (err) {
      console.error('Erro ao remover todos os áudios:', err);
      logError(err);
      return res.status(500).send({ msg: 'Erro ao remover os áudios.' });
    }
  }

  try {
    await prisma.$transaction(async (prisma) => {
      // Buscar áudios antigos para deletar arquivos do disco
      const registros = await prisma.cp_audio.findMany({
        where: { cp_curso_id: cursoId },
        select: { cp_audio_id: true, cp_arquivo_audio: true }
      });

      // Deletar visualizações de áudios antigos
      const idsAntigos = registros.map(r => r.cp_audio_id);
      if (idsAntigos.length) {
        await prisma.cp_vizu_aud_usuarios.deleteMany({
          where: { cp_id_audio: { in: idsAntigos } }
        });
      }

      // Remover arquivos do disco
      for (const audio of registros) {
        try { 
          await fs.promises.unlink(path.join(__dirname, audio.cp_arquivo_audio)); 
        } catch {}
      }

      // Deletar registros antigos
      await prisma.cp_audio.deleteMany({
        where: { cp_curso_id: cursoId }
      });

      // Inserir novos áudios
      for (const audio of novosAudios) {
        await prisma.cp_audio.create({
          data: {
            cp_curso_id: cursoId,
            cp_nome_audio: audio.originalname,
            cp_arquivo_audio: `/AudioCurso/${audio.filename}`
          }
        });
        console.log('Áudio registrado:', audio.originalname);
      }
    });

    res.send({ msg: 'Áudios atualizados com sucesso.' });
  } catch (err) {
    console.error('Erro ao atualizar áudios:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro ao atualizar os áudios.' });
  }
});

// Deletar curso
app.delete('/delete-curso/:cursoId', async (req, res) => {
  const cursoId = parseInt(req.params.cursoId);

  try {
    await prisma.$transaction(async (prisma) => {
      // Excluir áudios associados ao curso
      await prisma.cp_audio.deleteMany({
        where: { cp_curso_id: cursoId }
      });

      // Excluir o curso
      await prisma.cp_curso.delete({
        where: { cp_curso_id: cursoId }
      });
    });

    res.send({ msg: 'Curso e áudios associados excluídos com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir curso e áudios associados:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro ao excluir curso e áudios associados' });
  }
});

// Buscar turmas por professor
app.get('/cp_turmas/professor/:professorId', async (req, res) => {
  const professorId = parseInt(req.params.professorId);

  try {
    const turmas = await prisma.cp_turmas.findMany({
      where: { cp_tr_id_professor: professorId }
    });

    res.send(turmas);
  } catch (err) {
    console.error('Erro ao buscar turmas:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro ao buscar turmas' });
  }
});

// Buscar cursos por IDs (batch)
app.post('/cursos/batch', async (req, res) => {
  try {
    const cursoIds = req.body.cursoIds;

    if (!Array.isArray(cursoIds) || cursoIds.length === 0) {
      return res.status(400).send({ msg: 'Nenhum cursoId fornecido' });
    }

    const cursos = await prisma.cp_curso.findMany({
      where: { cp_curso_id: { in: cursoIds.map(id => parseInt(id)) } }
    });

    res.send(cursos);
  } catch (err) {
    console.error('Erro inesperado:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro inesperado no servidor' });
  }
});

/* FIM CURSO */

/* CHAMADAS */

// Buscar alunos de uma turma específica
app.get('/turmas/:turmaId/alunos', async (req, res) => {
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

// Salvar chamada
app.post('/chamadas', async (req, res) => {
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
app.get('/chamadas/turma/:turmaId', async (req, res) => {
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

// Buscar turmas com alunos
app.get('/turmasComAlunos', async (req, res) => {
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

// Atualizar chamada
app.put('/chamadas/:id', async (req, res) => {
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
app.delete('/chamadas/:id', async (req, res) => {
  const chamadaId = parseInt(req.params.id);

  try {
    await prisma.cp_chamadas.delete({
      where: { cp_ch_id: chamadaId }
    });

    res.json({ message: 'Chamada deletada com sucesso.' });
  } catch (err) {
    console.error('Erro ao deletar chamada:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao deletar chamada.' });
  }
});

/* FIM CHAMADAS */

/* MATRÍCULAS */

// Buscar usuários para matrícula (tipo 5 - alunos)
app.get('/buscarusermatricula', async (req, res) => {
  try {
    const usuarios = await prisma.cp_usuarios.findMany({
      where: {
        cp_tipo_user: 5,
        cp_excluido: 0
      },
      select: {
        cp_id: true,
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
      },
      orderBy: { cp_nome: 'asc' }
    });

    if (usuarios.length === 0) {
      res.status(404).send({ msg: 'Nenhum usuário encontrado' });
    } else {
      res.send(usuarios);
    }
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro no servidor', error: err.message });
  }
});

// Buscar usuário específico para matrícula
app.get('/buscarusermatricula/:id', async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const usuario = await prisma.cp_usuarios.findFirst({
      where: {
        cp_tipo_user: 5,
        cp_excluido: 0,
        cp_id: userId
      }
    });

    if (usuario) {
      res.send(usuario);
    } else {
      res.status(404).send({ msg: 'Usuário não encontrado' });
    }
  } catch (err) {
    console.error('Erro ao buscar usuário:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro no servidor' });
  }
});

// Buscar todas as matrículas
app.get('/matriculas', async (req, res) => {
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
app.get('/relatoriomatricula', async (req, res) => {
  try {
    const matriculas = await prisma.cp_matriculas.findMany();
    res.send(matriculas);
  } catch (err) {
    console.error('Erro ao buscar matrículas:', err);
    logError(err);
    res.status(500).send({ error: 'Erro ao buscar matrículas' });
  }
});

// Buscar CPF do usuário
app.get('/buscarcpfusuario/:id', async (req, res) => {
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

// Buscar matrícula específica
app.get('/matriculas/:matriculaId', async (req, res) => {
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
app.get('/matricula/:userId', async (req, res) => {
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

/* FIM MATRÍCULAS */

// Inicializar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});