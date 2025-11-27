const express = require('express');
const { prisma } = require('../../config/database');

const router = express.Router();

// Função para log de erros (assumindo que existe uma função global)
const logError = (error) => {
  console.error('Error:', error);
  // Aqui você pode implementar sua lógica de log personalizada
};

// Rota para buscar parcelas financeiras
router.get('/parcelas', async (req, res) => {
  const { schoolId, userId } = req.query;

  try {
    let whereClause = {};

    if (userId) {
      whereClause.matricula = {
        cp_mt_usuario: parseInt(userId),
        cp_mt_tipo_pagamento: 'parcelado'
      };
    }

    if (schoolId) {
      whereClause.matricula = {
        ...whereClause.matricula,
        cp_mt_escola: parseInt(schoolId)
      };
    }

    const parcelas = await prisma.cp_matriculaParcelas.findMany({
      where: whereClause,
      include: {
        matricula: {
          select: {
            cp_mt_escola: true,
            cp_mt_nome_usuario: true,
            cp_status_matricula: true,
            cp_mt_tipo_pagamento: true,
            cp_mt_valor_mensalidade: true,
            cp_mt_quantas_parcelas: true,
            cp_mt_valor_curso: true,
            cp_mt_usuario: true
          }
        }
      }
    });

    const parcelasFormatted = parcelas.map(parcela => ({
      cp_mtPar_id: parcela.cp_mtPar_id,
      cp_mt_id: parcela.cp_mt_id,
      cp_mtPar_dataParcela: parcela.cp_mtPar_dataParcela,
      cp_mtPar_status: parcela.cp_mtPar_status,
      cp_mtPar_valorParcela: parcela.cp_mtPar_valorParcela,
      cp_mt_escola: parcela.matricula.cp_mt_escola,
      cp_mt_nome_usuario: parcela.matricula.cp_mt_nome_usuario,
      cp_status_matricula: parcela.matricula.cp_status_matricula,
      cp_mt_tipo_pagamento: parcela.matricula.cp_mt_tipo_pagamento,
      cp_mt_valor_mensalidade: parcela.matricula.cp_mt_valor_mensalidade,
      cp_mt_quantas_parcelas: parcela.matricula.cp_mt_quantas_parcelas,
      cp_mt_valor_curso: parcela.matricula.cp_mt_valor_curso,
      cp_mt_usuario: parcela.matricula.cp_mt_usuario
    }));

    res.json(parcelasFormatted);
  } catch (err) {
    console.error('Erro ao buscar financeiroParcelas:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao buscar financeiroParcelas' });
  }
});

// Rota para atualizar status de uma parcela
router.put('/parcelas/:parcelaId/status', async (req, res) => {
  const parcelaId = parseInt(req.params.parcelaId);
  const newStatus = req.body.status;

  if (newStatus !== 'Pago' && newStatus !== 'à vencer') {
    return res.status(400).json({ error: 'Status inválido' });
  }

  try {
    await prisma.cp_matriculaParcelas.update({
      where: { cp_mtPar_id: parcelaId },
      data: { cp_mtPar_status: newStatus }
    });

    res.status(200).json({ message: 'Status da parcela atualizado com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar o status da parcela:', err);
    logError(err);
    res.status(500).json({ error: 'Erro ao atualizar o status da parcela' });
  }
});

// Rota de migração removida - não necessária

module.exports = router;