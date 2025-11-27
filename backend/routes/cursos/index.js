const express = require('express');
const router = express.Router();
const { prisma } = require('../../config/database');
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

// Configuração para upload de PDFs
const storagePDF = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../MaterialCurso'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
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
    cb(null, path.join(__dirname, '../../AudiosCurso'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  }
});

const uploadAudio = multer({ storage: storageAudio });

// Buscar todos os cursos
router.get('/', async (req, res) => {
  try {
    // Usar findMany do Prisma que deve funcionar agora após o setup
    const cursos = await prisma.cp_curso.findMany({
      orderBy: {
        cp_curso_id: 'asc'
      }
    });
    
    console.log('Cursos encontrados:', cursos.length);
    res.json(cursos);
  } catch (err) {
    console.error('Erro ao buscar cursos:', err);
    logError(err);
    res.status(500).json({ msg: 'Erro ao buscar cursos' });
  }
});

// Buscar curso por ID (compatível com frontend CadastroAudio)
router.get('/:cursoId', async (req, res) => {
  const cursoId = parseInt(req.params.cursoId);
  try {
    const curso = await prisma.cp_curso.findUnique({
      where: { cp_curso_id: cursoId },
      select: {
        cp_curso_id: true,
        cp_nome_curso: true,
        cp_youtube_link_curso: true,
        cp_pdf1_curso: true,
        cp_pdf2_curso: true,
        cp_pdf3_curso: true,
      }
    });

    if (!curso) {
      return res.status(404).json({ error: 'Curso não encontrado' });
    }

    res.status(200).json(curso);
  } catch (err) {
    console.error('Erro ao buscar curso por ID:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao buscar curso por ID' });
  }
});

// Cadastrar novo curso com PDFs
router.post('/', uploadPDF, async (req, res) => {
  const { cp_nome_curso, cp_youtube_link_curso } = req.body;

  console.log("Arquivos recebidos:", req.files);
  console.log("Dados recebidos no corpo:", req.body);

  const pdf1 = req.files && req.files['pdf1'] ? req.files['pdf1'][0].filename : null;
  const pdf2 = req.files && req.files['pdf2'] ? req.files['pdf2'][0].filename : null;
  const pdf3 = req.files && req.files['pdf3'] ? req.files['pdf3'][0].filename : null;

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

// Atualizar dados do curso (nome, link e PDFs) compatível com frontend
router.put('/update-curso/:cursoId', uploadPDF, async (req, res) => {
  const cursoId = parseInt(req.params.cursoId);
  const { cp_nome_curso, cp_youtube_link_curso } = req.body;

  const pdf1 = req.files && req.files['pdf1'] ? req.files['pdf1'][0].filename : null;
  const pdf2 = req.files && req.files['pdf2'] ? req.files['pdf2'][0].filename : null;
  const pdf3 = req.files && req.files['pdf3'] ? req.files['pdf3'][0].filename : null;

  try {
    const dataToUpdate = {
      cp_nome_curso,
      cp_youtube_link_curso
    };

    if (pdf1) dataToUpdate.cp_pdf1_curso = `/MaterialCurso/${pdf1}`;
    if (pdf2) dataToUpdate.cp_pdf2_curso = `/MaterialCurso/${pdf2}`;
    if (pdf3) dataToUpdate.cp_pdf3_curso = `/MaterialCurso/${pdf3}`;

    await prisma.cp_curso.update({
      where: { cp_curso_id: cursoId },
      data: dataToUpdate
    });

    res.status(200).json({ msg: 'Curso atualizado com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar curso:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao atualizar curso' });
  }
});

// Buscar material do curso por ID
router.get('/material/:cursoId', async (req, res) => {
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
        cp_pdf1_curso: curso.cp_pdf1_curso ? `${req.protocol}://${req.get('host')}${curso.cp_pdf1_curso}` : null,
        cp_pdf2_curso: curso.cp_pdf2_curso ? `${req.protocol}://${req.get('host')}${curso.cp_pdf2_curso}` : null,
        cp_pdf3_curso: curso.cp_pdf3_curso ? `${req.protocol}://${req.get('host')}${curso.cp_pdf3_curso}` : null,
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
router.get('/turma/:turmaId', async (req, res) => {
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
router.get('/audios/:cursoId', async (req, res) => {
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

// Excluir curso
router.delete('/:cursoId', async (req, res) => {
  const cursoId = parseInt(req.params.cursoId);

  try {
    await prisma.$transaction(async (prisma) => {
      // Excluir áudios associados ao curso
      const audiosToDelete = await prisma.cp_audio.findMany({
        where: { cp_audio_turma_id: cursoId },
        select: { cp_audio_arquivo: true }
      });
      
      // Deletar arquivos físicos de áudio
      for (const audio of audiosToDelete) {
        if (audio.cp_audio_arquivo) {
          const audioPath = path.join(__dirname, '../../AudiosCurso', audio.cp_audio_arquivo);
          try {
            if (fs.existsSync(audioPath)) {
              fs.unlinkSync(audioPath);
            }
          } catch (fileErr) {
            console.error('Erro ao deletar arquivo de áudio:', fileErr);
          }
        }
      }
      
      await prisma.cp_audio.deleteMany({
        where: { cp_audio_turma_id: cursoId }
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

// Buscar cursos por IDs (batch)
router.post('/batch', async (req, res) => {
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

// Rota de migração removida - não necessária

module.exports = router;
