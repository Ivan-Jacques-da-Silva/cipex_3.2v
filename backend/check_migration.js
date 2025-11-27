const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    const usuarios = await prisma.cp_usuarios.count();
    const escolas = await prisma.cp_escolas.count();
    const cursos = await prisma.cp_curso.count();
    const turmas = await prisma.cp_turmas.count();
    const audio = await prisma.cp_audio.count();
    const matriculas = await prisma.cp_matriculas.count();
    const chamadas = await prisma.cp_chamadas.count();
    const resumos = await prisma.cp_resumos.count();
    const trAluno = await prisma.cp_tr_aluno.count();
    const vizuAud = await prisma.cp_vizu_aud_usuarios.count();
    
    console.log('=== DADOS MIGRADOS ===');
    console.log('Usuários:', usuarios);
    console.log('Escolas:', escolas);
    console.log('Cursos:', cursos);
    console.log('Turmas:', turmas);
    console.log('Áudios:', audio);
    console.log('Matrículas:', matriculas);
    console.log('Chamadas:', chamadas);
    console.log('Resumos:', resumos);
    console.log('TR Aluno:', trAluno);
    console.log('Vizu Aud Usuários:', vizuAud);
    
    // Verifica alguns dados específicos
    const escola = await prisma.cp_escolas.findFirst();
    const curso = await prisma.cp_curso.findFirst();
    const usuario = await prisma.cp_usuarios.findFirst();
    
    console.log('\n=== AMOSTRA DE DADOS ===');
    console.log('Primeira escola:', escola?.cp_ec_nome);
    console.log('Primeiro curso:', curso?.cp_nome_curso);
    console.log('Primeiro usuário:', usuario?.cp_nome);
    
    // Verifica integridade das relações
    const escolasComTurmas = await prisma.cp_escolas.findMany({
      include: {
        cp_turmas: true
      },
      take: 3
    });
    
    const cursosComAudios = await prisma.cp_curso.findMany({
      include: {
        cp_audio: true
      },
      take: 3
    });
    
    console.log('\n=== INTEGRIDADE DAS RELAÇÕES ===');
    escolasComTurmas.forEach((escola, index) => {
      console.log(`Escola ${index + 1}: ${escola.cp_ec_nome} - Turmas: ${escola.cp_turmas.length}`);
    });
    
    cursosComAudios.forEach((curso, index) => {
      console.log(`Curso ${index + 1}: ${curso.cp_nome_curso} - Áudios: ${curso.cp_audio.length}`);
    });
    
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();