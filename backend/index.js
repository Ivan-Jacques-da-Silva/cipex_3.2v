const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Usar configuração centralizada do banco de dados
const { prisma } = require('./config/database');

// Criar diretórios necessários se não existirem
['uploads', 'FotoPerfil', 'MaterialCurso', 'AudiosCurso', 'MaterialExtra', 'materialdeaula'].forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Diretório criado: ${dirPath}`);
  }
});

// Lista de origens permitidas
const allowedOrigins = [
  'https://portal.cipex.com.br',
  'http://portal.cipex.com.br',
  'https://pteste.cipex.com.br',
  'http://pteste.cipex.com.br',
  'https://www.portal.cipex.com.br',
  'http://www.portal.cipex.com.br',
  'https://www.pteste.cipex.com.br',
  'http://www.pteste.cipex.com.br',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5000',
  'http://192.168.2.3:3000',
  `https://${process.env.REPLIT_DEV_DOMAIN}`,
  `http://${process.env.REPLIT_DEV_DOMAIN}`,
  'portal.cipex.com.br',
  'pteste.cipex.com.br'
];

// Configuração CORS original (comentada para debug)
/*
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
*/

// Configuração CORS liberada para debug/desenvolvimento
const corsOptions = {
  origin: '*', // Permite todas as origens
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log('Request URL:', req.url);
  console.log('Request Method:', req.method);
  next();
});

// Arquivos estáticos principais
// Servir áudios pela rota /audios a partir de AudiosCurso
app.use('/audios', express.static(path.join(__dirname, 'AudiosCurso')));
// Opcional: servir PDFs e materiais se necessário
app.use('/MaterialCurso', express.static(path.join(__dirname, 'MaterialCurso')));
app.use('/materialdeaula', express.static(path.join(__dirname, 'materialdeaula')));
app.use('/MaterialExtra', express.static(path.join(__dirname, 'MaterialExtra')));
app.use('/FotoPerfil', express.static(path.join(__dirname, 'FotoPerfil')));

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

// Rota de status da API
app.get('/', async (req, res) => {
  try {
    // Testar conexão com o banco
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'API funcionando',
      database: 'PostgreSQL conectado',
      timestamp: new Date().toISOString(),
      version: '2.0.0 - Modular'
    });
  } catch (error) {
    res.status(500).json({
      status: 'API funcionando',
      database: 'Erro de conexão',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Importar e usar as rotas modulares
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const escolasRoutes = require('./routes/escolas');
const turmasRoutes = require('./routes/turmas');
const cursosRoutes = require('./routes/cursos');
const matriculasRoutes = require('./routes/matriculas');
const financeiroRoutes = require('./routes/financeiro');
const materiaisRoutes = require('./routes/materiais');
const notasRoutes = require('./routes/notas');
const aniversariosRoutes = require('./routes/aniversarios');

// Usar as rotas com seus prefixos
app.use('/auth', authRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/escolas', escolasRoutes);
app.use('/turmas', turmasRoutes);
app.use('/cursos', cursosRoutes);
app.use('/matriculas', matriculasRoutes);
app.use('/financeiro', financeiroRoutes);
app.use('/materiais', materiaisRoutes);
app.use('/notas', notasRoutes);
app.use('/aniversario', aniversariosRoutes);

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  logError(error);
  console.error('Erro capturado:', error);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Exportar para uso em testes
module.exports = { app, prisma };
