const express = require('express');
const { prisma } = require('../../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Função para log de erros (assumindo que existe uma função global)
const logError = (error) => {
  console.error('Error:', error);
  // Aqui você pode implementar sua lógica de log personalizada
};

// Configuração para upload de material extra
const materialExtraStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'MaterialExtra/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const uploadMaterialExtra = multer({ 
  storage: materialExtraStorage,
  fileFilter: (req, file, cb) => {
    // Aceitar apenas PDFs e imagens
    const allowedTypes = /pdf|jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas arquivos PDF e imagens são permitidos'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Configuração para upload de material de aula
const materialStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'materialdeaula');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const materialUpload = multer({ storage: materialStorage });

// Configuração para upload de áudios
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'AudiosCurso/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const uploadAudio = multer({ storage: audioStorage });

// ROTAS DE VISUALIZAÇÃO DE ÁUDIOS

// Registrar visualização de áudio
router.post('/visualizacao-audio', async (req, res) => {
  const { userId, audioId } = req.body;

  if (!userId || !audioId) {
    return res.status(400).json({ error: 'É necessário fornecer userId e audioId' });
  }

  try {
    // Verificar se já existe um registro
    const existingView = await prisma.cp_vizu_aud_usuarios.findFirst({
      where: {
        cp_id_usuario: parseInt(userId),
        cp_id_audio: parseInt(audioId)
      }
    });

    if (existingView) {
      // Atualizar registro existente
      await prisma.cp_vizu_aud_usuarios.update({
        where: { cp_vau_id: existingView.cp_vau_id },
        data: { cp_vau_data_vizualizacao: new Date() }
      });
      res.status(200).json({ message: 'Visualização de áudio atualizada com sucesso' });
    } else {
      // Criar novo registro
      await prisma.cp_vizu_aud_usuarios.create({
        data: {
          cp_id_usuario: parseInt(userId),
          cp_id_audio: parseInt(audioId)
        }
      });
      res.status(200).json({ message: 'Visualização de áudio registrada com sucesso' });
    }
  } catch (err) {
    console.error('Erro ao registrar visualização de áudio:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao registrar visualização de áudio' });
  }
});

// Buscar áudios marcados como ouvidos pelo usuário
router.get('/audios-marcados/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const audiosMarcados = await prisma.cp_vizu_aud_usuarios.findMany({
      where: { cp_id_usuario: userId },
      select: { cp_id_audio: true }
    });

    const audioIds = audiosMarcados.map(item => item.cp_id_audio);
    res.status(200).json(audioIds);
  } catch (err) {
    console.error('Erro ao buscar áudios marcados como ouvidos:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao buscar áudios marcados como ouvidos' });
  }
});

// ROTAS DE MATERIAL EXTRA

// Buscar materiais de curso para aluno
router.get('/curso-material/:cursoId', async (req, res) => {
  const cursoId = parseInt(req.params.cursoId);
  
  try {
    const materiais = await prisma.cp_mat_materiais.findMany({
      where: {
        cp_mat_curso_id: cursoId
      }
    });
    
    const materiaisFormatted = materiais.map(material => ({
      ...material,
      cp_mat_miniatura: material.cp_mat_miniatura 
        ? `${req.protocol}://${req.get('host')}/${material.cp_mat_miniatura}`
        : null,
      cp_mat_arquivoPdf: material.cp_mat_arquivoPdf
        ? `${req.protocol}://${req.get('host')}/${material.cp_mat_arquivoPdf}`
        : null,
      cp_mat_extra_pdf2: material.cp_mat_extra_pdf2
        ? `${req.protocol}://${req.get('host')}/${material.cp_mat_extra_pdf2}`
        : null,
      cp_mat_extra_pdf3: material.cp_mat_extra_pdf3
        ? `${req.protocol}://${req.get('host')}/${material.cp_mat_extra_pdf3}`
        : null,
      cp_mat_permitirDownload: material.cp_mat_permitirDownload || false,
      cp_mat_extra_codigos: material.cp_mat_extra_codigos || ''
    }));

    res.json(materiaisFormatted);
  } catch (err) {
    console.error('Erro ao buscar materiais do curso:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao buscar materiais do curso' });
  }
});

// Buscar todos os materiais de treinamento
router.get('/materiais', async (req, res) => {
  try {
    const materiais = await prisma.cp_mat_materiais.findMany();
    
    const materiaisFormatted = materiais.map(material => ({
      ...material,
      cp_mat_miniatura: material.cp_mat_miniatura 
        ? `${req.protocol}://${req.get('host')}/${material.cp_mat_miniatura}`
        : null,
      cp_mat_arquivoPdf: material.cp_mat_arquivoPdf
        ? `${req.protocol}://${req.get('host')}/${material.cp_mat_arquivoPdf}`
        : null,
      cp_mat_extra_pdf2: material.cp_mat_extra_pdf2
        ? `${req.protocol}://${req.get('host')}/${material.cp_mat_extra_pdf2}`
        : null,
      cp_mat_extra_pdf3: material.cp_mat_extra_pdf3
        ? `${req.protocol}://${req.get('host')}/${material.cp_mat_extra_pdf3}`
        : null,
      cp_mat_permitirDownload: material.cp_mat_permitirDownload || false,
      cp_mat_extra_codigos: material.cp_mat_extra_codigos || ''
    }));

    res.json(materiaisFormatted);
  } catch (err) {
    console.error('Erro ao buscar materiais:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao buscar materiais' });
  }
});

// Buscar materiais por turma (resumos)
router.get('/materiais/:turmaID', async (req, res) => {
  const turmaID = parseInt(req.params.turmaID);

  try {
    const resumos = await prisma.cp_resumos.findMany({
      where: { cp_res_turma_id: turmaID }
    });

    res.json(resumos);
  } catch (err) {
    console.error('Erro ao buscar resumos:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao buscar resumos' });
  }
});

// Deletar material de treinamento
router.delete('/materiais/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.cp_mat_materiais.delete({
      where: { cp_mat_id: parseInt(id) }
    });

    res.status(200).json({ message: 'Material excluído com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir material:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao excluir material' });
  }
});

// Buscar todos os materiais extra
router.get('/material-extra', async (req, res) => {
  try {
    const materiais = await prisma.cp_mat_extra.findMany();
    
    const materiaisFormatted = materiais.map(material => ({
      ...material,
      cp_mat_extra_thumbnail: material.cp_mat_extra_thumbnail 
        ? `${req.protocol}://${req.get('host')}/${material.cp_mat_extra_thumbnail}`
        : null,
      cp_mat_extra_pdf1: material.cp_mat_extra_pdf1
        ? `${req.protocol}://${req.get('host')}/${material.cp_mat_extra_pdf1}`
        : null,
      cp_mat_extra_pdf2: material.cp_mat_extra_pdf2
        ? `${req.protocol}://${req.get('host')}/${material.cp_mat_extra_pdf2}`
        : null,
      cp_mat_extra_pdf3: material.cp_mat_extra_pdf3
        ? `${req.protocol}://${req.get('host')}/${material.cp_mat_extra_pdf3}`
        : null
    }));

    res.json(materiaisFormatted);
  } catch (err) {
    console.error('Erro ao buscar materiais:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao buscar materiais' });
  }
});

// Cadastrar novo material extra
router.post('/material-extra', uploadMaterialExtra.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'pdf1', maxCount: 1 },
  { name: 'pdf2', maxCount: 1 },
  { name: 'pdf3', maxCount: 1 }
]), async (req, res) => {
  const {
    title,
    description,
    date,
    youtube_url,
    categories,
    permitirDownload,
    codigos
  } = req.body;

  const thumbnail = req.files['thumbnail'] ? req.files['thumbnail'][0].path : null;
  const pdf1 = req.files['pdf1'] ? req.files['pdf1'][0].path : null;
  const pdf2 = req.files['pdf2'] ? req.files['pdf2'][0].path : null;
  const pdf3 = req.files['pdf3'] ? req.files['pdf3'][0].path : null;

  try {
    await prisma.cp_mat_extra.create({
      data: {
        cp_mat_extra_thumbnail: thumbnail,
        cp_mat_extra_title: title,
        cp_mat_extra_description: description,
        cp_mat_extra_date: date ? new Date(date) : null,
        cp_mat_extra_youtube_url: youtube_url,
        cp_mat_extra_pdf1: pdf1,
        cp_mat_extra_pdf2: pdf2,
        cp_mat_extra_pdf3: pdf3,
        cp_mat_extra_categories: categories,
        cp_mat_extra_permitirDownload: permitirDownload === 'true',
        cp_mat_extra_codigos: codigos
      }
    });

    res.status(201).json({ message: 'Material cadastrado com sucesso' });
  } catch (err) {
    console.error('Erro ao cadastrar material:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao cadastrar material' });
  }
});

// Editar material extra
router.put('/material-extra/:id', uploadMaterialExtra.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'pdf1', maxCount: 1 },
  { name: 'pdf2', maxCount: 1 },
  { name: 'pdf3', maxCount: 1 }
]), async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    date,
    youtube_url,
    categories,
    permitirDownload,
    codigos
  } = req.body;

  const thumbnail = req.files['thumbnail'] ? req.files['thumbnail'][0].path : null;
  const pdf1 = req.files['pdf1'] ? req.files['pdf1'][0].path : null;
  const pdf2 = req.files['pdf2'] ? req.files['pdf2'][0].path : null;
  const pdf3 = req.files['pdf3'] ? req.files['pdf3'][0].path : null;

  try {
    const updateData = {
      cp_mat_extra_title: title,
      cp_mat_extra_description: description,
      cp_mat_extra_date: date ? new Date(date) : null,
      cp_mat_extra_youtube_url: youtube_url,
      cp_mat_extra_categories: categories,
      cp_mat_extra_permitirDownload: permitirDownload === 'true',
      cp_mat_extra_codigos: codigos
    };

    if (thumbnail) updateData.cp_mat_extra_thumbnail = thumbnail;
    if (pdf1) updateData.cp_mat_extra_pdf1 = pdf1;
    if (pdf2) updateData.cp_mat_extra_pdf2 = pdf2;
    if (pdf3) updateData.cp_mat_extra_pdf3 = pdf3;

    await prisma.cp_mat_extra.update({
      where: { cp_mat_extra_id: parseInt(id) },
      data: updateData
    });

    res.status(200).json({ message: 'Material atualizado com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar material:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao atualizar material' });
  }
});

// Deletar material extra
router.delete('/material-extra/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.cp_mat_extra.delete({
      where: { cp_mat_extra_id: parseInt(id) }
    });

    res.status(200).json({ message: 'Material excluído com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir material:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao excluir material' });
  }
});

// ROTAS DE RESUMOS DE AULA

// Salvar resumo de aula
router.post('/resumos', materialUpload.single('arquivo'), async (req, res) => {
  const { turmaId, resumo, data, hora, aula, link, linkYoutube } = req.body;
  const arquivo = req.file ? req.file.filename : null;

  try {
    await prisma.cp_resumos.create({
      data: {
        cp_res_turma_id: parseInt(turmaId),
        cp_res_data: new Date(data),
        cp_res_hora: hora,
        cp_res_resumo: resumo,
        cp_res_arquivo: arquivo,
        cp_res_aula: aula,
        cp_res_link: link,
        cp_res_link_youtube: linkYoutube
      }
    });

    res.status(201).json({ message: 'Resumo salvo com sucesso' });
  } catch (err) {
    console.error('Erro ao inserir resumo no banco de dados:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao salvar resumo' });
  }
});

// Buscar resumos por data e turma
router.get('/resumos/:data/:turmaId', async (req, res) => {
  const { data, turmaId } = req.params;

  try {
    const resumos = await prisma.cp_resumos.findMany({
      where: {
        cp_res_data: new Date(data),
        cp_res_turma_id: parseInt(turmaId)
      }
    });

    const resumosFormatted = resumos.map(resumo => ({
      ...resumo,
      cp_res_arquivo: resumo.cp_res_arquivo
        ? `${req.protocol}://${req.get('host')}/materialdeaula/${resumo.cp_res_arquivo}`
        : null
    }));

    res.status(200).json(resumosFormatted);
  } catch (err) {
    console.error('Erro ao buscar resumos no banco de dados:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao buscar resumos' });
  }
});

// Buscar todos os resumos de uma turma
router.get('/resumos/:turmaId', async (req, res) => {
  const { turmaId } = req.params;

  try {
    const resumos = await prisma.cp_resumos.findMany({
      where: { cp_res_turma_id: parseInt(turmaId) },
      orderBy: { cp_res_data: 'desc' }
    });

    const resumosFormatted = resumos.map(resumo => ({
      ...resumo,
      cp_res_arquivo: resumo.cp_res_arquivo
        ? `${req.protocol}://${req.get('host')}/materialdeaula/${resumo.cp_res_arquivo}`
        : null
    }));

    res.status(200).json(resumosFormatted);
  } catch (err) {
    console.error('Erro ao buscar resumos no banco de dados:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao buscar resumos' });
  }
});

// Editar resumo
router.put('/resumos/:id', materialUpload.single('arquivo'), async (req, res) => {
  try {
    const { id } = req.params;
    const { resumo, aula, link, linkYoutube } = req.body;
    const arquivo = req.file ? req.file.filename : null;

    const updateData = {
      cp_res_resumo: resumo,
      cp_res_aula: aula,
      cp_res_link: link,
      cp_res_link_youtube: linkYoutube
    };

    if (arquivo) {
      updateData.cp_res_arquivo = arquivo;
    }

    await prisma.cp_resumos.update({
      where: { cp_rs_id: parseInt(id) },
      data: updateData
    });

    res.status(200).json({ message: 'Resumo editado com sucesso' });
  } catch (err) {
    console.error('Erro ao editar resumo no banco de dados:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao editar resumo' });
  }
});

// Deletar resumo
router.delete('/resumos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.cp_resumos.delete({
      where: { cp_rs_id: parseInt(id) }
    });

    res.status(200).json({ message: 'Resumo excluído com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir resumo:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao excluir resumo' });
  }
});

// ROTAS DE ÁUDIOS

// Servir arquivos de áudio
router.get('/audio/:nomeAudio', (req, res) => {
  const nomeAudio = req.params.nomeAudio;
  const filePath = path.join(__dirname, '../../AudiosCurso', nomeAudio);
  res.sendFile(filePath);
});

// Listar áudios do curso (compatível com frontend SalaDeAulaAlunoLayout e CadastroAudio)
router.get('/audios-curso/:cursoId', async (req, res) => {
  const cursoId = parseInt(req.params.cursoId);
  try {
    const audios = await prisma.cp_audio.findMany({
      where: { cp_curso_id: cursoId },
      select: {
        cp_audio_id: true,
        cp_nome_audio: true
      }
    });
    res.status(200).json(audios);
  } catch (err) {
    console.error('Erro ao buscar áudios do curso:', err);
    logError(err);
    res.status(500).json({ msg: 'Erro ao buscar áudios do curso' });
  }
});

// Upload de áudios para curso
router.post('/audios-curso/:cursoId', uploadAudio.array('audios'), async (req, res) => {
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
          await fs.promises.unlink(path.join(__dirname, '../../', audio.cp_arquivo_audio)); 
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
            cp_arquivo_audio: audio.path
          }
        });
      }
    });

    res.send({ msg: 'Áudios atualizados com sucesso.' });
  } catch (err) {
    console.error('Erro ao atualizar áudios:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro ao atualizar os áudios.' });
  }
});

// Alias compatível para cadastro de áudios após criar curso
router.post('/register-audio/:cursoId', uploadAudio.array('audios'), async (req, res) => {
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
      const registros = await prisma.cp_audio.findMany({
        where: { cp_curso_id: cursoId },
        select: { cp_audio_id: true, cp_arquivo_audio: true }
      });

      const idsAntigos = registros.map(r => r.cp_audio_id);
      if (idsAntigos.length) {
        await prisma.cp_vizu_aud_usuarios.deleteMany({
          where: { cp_id_audio: { in: idsAntigos } }
        });
      }

      for (const audio of registros) {
        try {
          await fs.promises.unlink(path.join(__dirname, '../../', audio.cp_arquivo_audio));
        } catch {}
      }

      await prisma.cp_audio.deleteMany({
        where: { cp_curso_id: cursoId }
      });

      for (const audio of novosAudios) {
        await prisma.cp_audio.create({
          data: {
            cp_curso_id: cursoId,
            cp_nome_audio: audio.originalname,
            cp_arquivo_audio: audio.path
          }
        });
      }
    });

    res.send({ msg: 'Áudios atualizados com sucesso.' });
  } catch (err) {
    console.error('Erro ao atualizar áudios:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro ao atualizar os áudios.' });
  }
});

// Alias de atualização de áudios (edição) compatível com frontend
router.put('/update-audio/:cursoId', uploadAudio.array('audios'), async (req, res) => {
  const cursoId = parseInt(req.params.cursoId);
  const novosAudios = req.files;

  if (!novosAudios || novosAudios.length === 0) {
    // Se nenhum arquivo enviado, não altera os áudios existentes
    return res.status(200).json({ msg: 'Nenhum novo áudio enviado. Áudios existentes mantidos.' });
  }

  try {
    await prisma.$transaction(async (prisma) => {
      const registros = await prisma.cp_audio.findMany({
        where: { cp_curso_id: cursoId },
        select: { cp_audio_id: true, cp_arquivo_audio: true }
      });

      const idsAntigos = registros.map(r => r.cp_audio_id);
      if (idsAntigos.length) {
        await prisma.cp_vizu_aud_usuarios.deleteMany({
          where: { cp_id_audio: { in: idsAntigos } }
        });
      }

      for (const audio of registros) {
        try {
          await fs.promises.unlink(path.join(__dirname, '../../', audio.cp_arquivo_audio));
        } catch {}
      }

      await prisma.cp_audio.deleteMany({
        where: { cp_curso_id: cursoId }
      });

      for (const audio of novosAudios) {
        await prisma.cp_audio.create({
          data: {
            cp_curso_id: cursoId,
            cp_nome_audio: audio.originalname,
            cp_arquivo_audio: audio.path
          }
        });
      }
    });

    res.send({ msg: 'Áudios atualizados com sucesso.' });
  } catch (err) {
    console.error('Erro ao atualizar áudios:', err);
    logError(err);
    res.status(500).send({ msg: 'Erro ao atualizar os áudios.' });
  }
});
// Rota de migração removida - não necessária

module.exports = router;
