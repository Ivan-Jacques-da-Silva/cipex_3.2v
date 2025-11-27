const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Ordem de exclusão (inversa da inserção para respeitar foreign keys)
const deletionOrder = [
    'cp_vizu_aud_usuarios',
    'cp_tr_aluno',
    'cp_resumos',
    'cp_chamadas',
    'cp_matriculas',
    'cp_audio',
    'cp_turmas',
    'cp_curso',
    'cp_escolas',
    'cp_usuarios'
];

async function clearData() {
    console.log('Iniciando limpeza dos dados...');
    
    try {
        for (const tableName of deletionOrder) {
            try {
                const result = await prisma.$executeRawUnsafe(`DELETE FROM "${tableName}"`);
                console.log(`✓ Tabela ${tableName} limpa`);
            } catch (error) {
                console.log(`⚠ Erro ao limpar ${tableName}: ${error.message}`);
            }
        }
        
        console.log('\nLimpeza concluída! Todas as tabelas foram esvaziadas.');
        
    } catch (error) {
        console.error('Erro na limpeza:', error);
    } finally {
        await prisma.$disconnect();
    }
}

clearData();