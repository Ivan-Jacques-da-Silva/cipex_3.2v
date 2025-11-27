const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Configuração de mapeamento de colunas para todas as tabelas
const tableConfigs = {
  cp_chamadas: {
    mapping: {
      'cp_ch_id': 'cp_chamada_id',
      'cp_ch_aluno_id': 'cp_usuario_id',
      'cp_ch_turma_id': 'cp_turma_id',
      'cp_ch_data': 'cp_data_chamada',
      'cp_ch_status': 'cp_presente',
      'cp_excluido': () => 0
    },
    transformers: {
      cp_presente: (value) => value === 'Presente' ? 1 : 0
    }
  },
  cp_matriculas: {
    mapping: {
      'cp_mt_id': 'cp_mat_id',
      'cp_mt_usuario': 'cp_usuario_id',
      'cp_mt_cadastro_usuario': 'cp_mat_data_matricula',
      'cp_mt_valor_curso': 'cp_mat_valor_total',
      'cp_mt_quantas_parcelas': 'cp_mat_num_parcelas',
      'cp_mt_tipo_pagamento': 'cp_mat_forma_pagamento',
      'cp_excluido': () => 0
    },
    transformers: {
      cp_mat_valor_total: (value) => value ? String(value) : null,
      cp_mat_num_parcelas: (value) => value ? String(value) : null,
      cp_usuario_id: (value) => value === "" || value === null ? null : parseInt(value)
    }
  },
  cp_resumos: {
    mapping: {
      'cp_res_id': 'cp_resumo_id',
      'cp_turma_id': 'cp_turma_id',
      'cp_res_data': 'cp_resumo_data',
      'cp_res_conteudo': 'cp_resumo_conteudo',
      'cp_res_aula': 'cp_resumo_titulo',
      'cp_excluido': () => 0
    },
    transformers: {
      cp_resumo_titulo: (value) => value ? String(value) : null,
      cp_resumo_conteudo: (value) => {
        if (value === null || value === undefined) return null;
        const str = String(value);
        // Limitar tamanho do texto para evitar erro de coluna muito longa
        return str.length > 500 ? str.substring(0, 500) + '...' : str;
      }
    }
  },
  cp_vizu_aud_usuarios: {
    mapping: {
      'id_visualizacao': 'cp_vizu_id',
      'cp_id_usuario': 'cp_usuario_id',
      'cp_id_audio': 'cp_audio_id',
      'data_visualizacao': 'cp_data_vizu'
    }
  }
};

// Função para processar valores
function processValue(value) {
  if (value === null || value === undefined) return null;
  
  // Se for string vazia, retorna null
  if (value === '') return null;
  
  // Se for string que representa número, converte
  if (typeof value === 'string') {
    // Remove aspas se existirem
    value = value.replace(/^['"]|['"]$/g, '');
    
    // Se for número, converte
    if (/^\d+$/.test(value)) {
      return parseInt(value);
    }
    if (/^\d+\.\d+$/.test(value)) {
      return parseFloat(value);
    }
  }
  
  return value;
}

// Função para mapear linha do SQL para formato Prisma
function mapRowToPrisma(row, tableName) {
  const config = tableConfigs[tableName];
  if (!config) return row;
  
  const prismaData = {};
  
  for (const [sqlColumn, prismaColumn] of Object.entries(config.mapping)) {
    let value;
    
    if (typeof prismaColumn === 'function') {
      // Ignorar funções no mapeamento final
      continue;
    } else if (row.hasOwnProperty(sqlColumn)) {
      value = processValue(row[sqlColumn]);
      
      // Aplicar transformers se existirem
      if (config.transformers && config.transformers[prismaColumn]) {
        value = config.transformers[prismaColumn](value);
      }
      
      prismaData[prismaColumn] = value;
    }
  }
  
  return prismaData;
}

// Função para extrair dados do arquivo SQL
function extractDataFromSQL(sqlContent, tableName) {
  const insertPattern = new RegExp(`INSERT INTO ["\`]?${tableName}["\`]? \\(([^)]+)\\) VALUES\\s*([^;]+);`, 'gi');
  const data = [];
  let match;
  
  while ((match = insertPattern.exec(sqlContent)) !== null) {
    const columns = match[1].split(',').map(col => col.trim().replace(/["`']/g, ''));
    const valuesString = match[2];
    
    // Extrair múltiplas linhas de valores
    const valueMatches = valuesString.match(/\(([^)]+)\)/g);
    if (valueMatches) {
      valueMatches.forEach(valueMatch => {
        const values = valueMatch.slice(1, -1).split(',').map(val => {
          val = val.trim();
          if (val === 'NULL') return null;
          if (val.startsWith("'") && val.endsWith("'")) return val.slice(1, -1);
          if (val.startsWith('"') && val.endsWith('"')) return val.slice(1, -1);
          return val;
        });
        
        const row = {};
        columns.forEach((col, index) => {
          row[col] = values[index];
        });
        data.push(row);
      });
    }
  }
  
  return data;
}

// Função para limpar todas as tabelas problemáticas
async function clearAllTables() {
  console.log('🧹 Limpando todas as tabelas...');
  
  const tablesToClear = Object.keys(tableConfigs);
  
  for (const tableName of tablesToClear) {
    try {
      await prisma[tableName].deleteMany({});
      console.log(`✅ ${tableName} limpa`);
    } catch (error) {
      console.log(`⚠️  Erro ao limpar ${tableName}:`, error.message);
    }
  }
  
  console.log('✨ Limpeza concluída!\n');
}

// Função principal de migração
async function migrateTable(tableName, data) {
  console.log(`\n📊 Migrando ${tableName}...`);
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];
  
  for (const row of data) {
    try {
      const prismaData = mapRowToPrisma(row, tableName);
      await prisma[tableName].create({ data: prismaData });
      successCount++;
    } catch (error) {
      errorCount++;
      errors.push({
        row: mapRowToPrisma(row, tableName),
        error: error.message
      });
      
      // Parar após muitos erros para evitar spam
      if (errorCount >= 10) {
        console.log(`⚠️  Muitos erros em ${tableName}, parando...`);
        break;
      }
    }
  }
  
  console.log(`✅ ${tableName}: ${successCount} sucessos, ${errorCount} erros`);
  
  return { successCount, errorCount, errors };
}

// Função principal
async function main() {
  try {
    console.log('🚀 Iniciando migração completa...\n');
    
    // Limpar todas as tabelas primeiro
    await clearAllTables();
    
    // Ler arquivo SQL
    const sqlFilePath = path.join(__dirname, 'banco_cipex_postgres_fixed.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    const migrationResults = {};
    
    // Migrar cada tabela
    for (const tableName of Object.keys(tableConfigs)) {
      console.log(`🔍 Extraindo dados de ${tableName}...`);
      const data = extractDataFromSQL(sqlContent, tableName);
      console.log(`📦 Encontrados ${data.length} registros`);
      
      if (data.length > 0) {
        migrationResults[tableName] = await migrateTable(tableName, data);
      } else {
        console.log(`⚠️  Nenhum dado encontrado para ${tableName}`);
        migrationResults[tableName] = { successCount: 0, errorCount: 0, errors: [] };
      }
    }
    
    // Salvar log de resultados
    const logPath = path.join(__dirname, 'migration_final_log.json');
    fs.writeFileSync(logPath, JSON.stringify(migrationResults, null, 2));
    
    // Resumo final
    console.log('\n🎉 MIGRAÇÃO CONCLUÍDA!');
    console.log('📋 Resumo:');
    
    let totalSuccess = 0;
    let totalErrors = 0;
    
    for (const [tableName, result] of Object.entries(migrationResults)) {
      console.log(`   ${tableName}: ${result.successCount} sucessos, ${result.errorCount} erros`);
      totalSuccess += result.successCount;
      totalErrors += result.errorCount;
    }
    
    console.log(`\n📊 TOTAL: ${totalSuccess} registros migrados, ${totalErrors} erros`);
    console.log(`📄 Log detalhado salvo em: migration_final_log.json`);
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar migração
main().catch(console.error);