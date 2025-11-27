


const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configurações do PostgreSQL - Usando variáveis de ambiente do Replit
const POSTGRES_CONFIG = {
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'admin'
};

// Configurações do novo usuário e banco
const DATABASE_CONFIG = {
  dbName: process.env.POSTGRES_DB || 'cipex_portal',
  username: process.env.POSTGRES_USER || 'cipex_user',
  password: process.env.POSTGRES_PASSWORD || 'CipexPortal@2024!SecurePass',
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432
};

// SQL para criar as tabelas
const CREATE_TABLES_SQL = `
-- Criar extensão se não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de escolas
CREATE TABLE IF NOT EXISTS cp_escolas (
  cp_ec_id SERIAL PRIMARY KEY,
  cp_ec_nome VARCHAR(100) UNIQUE,
  cp_ec_data_cadastro DATE,
  cp_ec_responsavel VARCHAR(50),
  cp_ec_endereco_rua VARCHAR(100),
  cp_ec_endereco_numero VARCHAR(20),
  cp_ec_endereco_cidade VARCHAR(50),
  cp_ec_endereco_bairro VARCHAR(50),
  cp_ec_endereco_estado VARCHAR(50),
  cp_ec_excluido BOOLEAN DEFAULT FALSE,
  cp_ec_descricao VARCHAR(255)
);

-- Tabela de cursos
CREATE TABLE IF NOT EXISTS cp_curso (
  cp_curso_id SERIAL PRIMARY KEY,
  cp_nome_curso VARCHAR(100) NOT NULL UNIQUE,
  cp_youtube_link_curso VARCHAR(255),
  cp_pdf1_curso VARCHAR(255),
  cp_pdf2_curso VARCHAR(255),
  cp_pdf3_curso VARCHAR(255)
);

-- Tabela de turmas
CREATE TABLE IF NOT EXISTS cp_turmas (
  cp_tr_id SERIAL PRIMARY KEY,
  cp_tr_nome VARCHAR(100) NOT NULL,
  cp_tr_data DATE NOT NULL,
  cp_tr_id_professor INTEGER,
  cp_tr_id_escola INTEGER,
  cp_tr_curso_id INTEGER,
  FOREIGN KEY (cp_tr_id_escola) REFERENCES cp_escolas(cp_ec_id),
  FOREIGN KEY (cp_tr_curso_id) REFERENCES cp_curso(cp_curso_id)
);

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS cp_usuarios (
  cp_id SERIAL PRIMARY KEY,
  cp_nome VARCHAR(80) NOT NULL,
  cp_email VARCHAR(45) NOT NULL,
  cp_login VARCHAR(45) NOT NULL UNIQUE,
  cp_password VARCHAR(200) NOT NULL,
  cp_tipo_user INTEGER NOT NULL,
  cp_rg VARCHAR(20),
  cp_cpf VARCHAR(14) NOT NULL,
  cp_datanascimento DATE NOT NULL,
  cp_estadocivil VARCHAR(45),
  cp_cnpj VARCHAR(20),
  cp_ie VARCHAR(20),
  cp_whatsapp VARCHAR(14),
  cp_telefone VARCHAR(14),
  cp_empresaatuacao VARCHAR(45),
  cp_profissao VARCHAR(45),
  cp_end_cidade_estado VARCHAR(45),
  cp_end_rua VARCHAR(45),
  cp_end_num INTEGER,
  cp_end_cep VARCHAR(20),
  cp_descricao TEXT,
  cp_foto_perfil VARCHAR(255),
  cp_escola_id INTEGER,
  cp_turma_id INTEGER,
  cp_excluido INTEGER DEFAULT 0,
  FOREIGN KEY (cp_escola_id) REFERENCES cp_escolas(cp_ec_id),
  FOREIGN KEY (cp_turma_id) REFERENCES cp_turmas(cp_tr_id)
);

-- Adicionar foreign key para professor na tabela turmas
ALTER TABLE cp_turmas DROP CONSTRAINT IF EXISTS fk_professor;
ALTER TABLE cp_turmas ADD CONSTRAINT fk_professor 
  FOREIGN KEY (cp_tr_id_professor) REFERENCES cp_usuarios(cp_id);

-- Tabela de áudios
CREATE TABLE IF NOT EXISTS cp_audio (
  cp_audio_id SERIAL PRIMARY KEY,
  cp_audio_nome VARCHAR(100),
  cp_audio_arquivo VARCHAR(255),
  cp_audio_data DATE,
  cp_audio_turma_id INTEGER,
  FOREIGN KEY (cp_audio_turma_id) REFERENCES cp_turmas(cp_tr_id)
);

-- Tabela de matrículas
CREATE TABLE IF NOT EXISTS cp_matriculas (
  cp_mt_id SERIAL PRIMARY KEY,
  cp_mt_curso VARCHAR(255),
  cp_mt_escola INTEGER,
  cp_mt_usuario INTEGER,
  cp_mt_nome_usuario VARCHAR(255),
  cp_mt_cadastro_usuario VARCHAR(255),
  cp_mt_valor_curso DECIMAL(10,2),
  cp_mt_quantas_parcelas INTEGER,
  cp_mt_parcelas_pagas INTEGER,
  cp_mt_primeira_parcela DATE,
  cp_status_matricula VARCHAR(50),
  cp_mt_nivel VARCHAR(50),
  cp_mt_horario_inicio VARCHAR(10),
  cp_mt_horario_fim VARCHAR(10),
  cp_mt_escolaridade VARCHAR(100),
  cp_mt_local_nascimento VARCHAR(100),
  cp_mt_rede_social VARCHAR(100),
  cp_mt_nome_pai VARCHAR(100),
  cp_mt_contato_pai VARCHAR(20),
  cp_mt_nome_mae VARCHAR(100),
  cp_mt_contato_mae VARCHAR(20),
  cp_mt_excluido INTEGER DEFAULT 0,
  cp_mt_tipo_pagamento VARCHAR(20),
  cp_mt_dias_semana VARCHAR(100),
  FOREIGN KEY (cp_mt_escola) REFERENCES cp_escolas(cp_ec_id)
);

-- Tabela de parcelas de matrícula
CREATE TABLE IF NOT EXISTS cp_matriculaParcelas (
  cp_mtp_id SERIAL PRIMARY KEY,
  cp_mt_id INTEGER NOT NULL,
  cp_mtp_numero INTEGER,
  cp_mtp_valor DECIMAL(10,2),
  cp_mtp_vencimento DATE,
  cp_mtp_pago BOOLEAN DEFAULT FALSE,
  cp_mtp_data_pagamento DATE,
  FOREIGN KEY (cp_mt_id) REFERENCES cp_matriculas(cp_mt_id)
);

-- Tabela de chamadas
CREATE TABLE IF NOT EXISTS cp_chamadas (
  cp_ch_id SERIAL PRIMARY KEY,
  cp_ch_turma_id INTEGER NOT NULL,
  cp_ch_aluno_id INTEGER NOT NULL,
  cp_ch_data DATE NOT NULL,
  cp_ch_presente BOOLEAN DEFAULT FALSE,
  cp_ch_observacao TEXT,
  FOREIGN KEY (cp_ch_turma_id) REFERENCES cp_turmas(cp_tr_id),
  FOREIGN KEY (cp_ch_aluno_id) REFERENCES cp_usuarios(cp_id)
);

-- Tabela de material extra
CREATE TABLE IF NOT EXISTS cp_mat_extra (
  cp_me_id SERIAL PRIMARY KEY,
  cp_me_nome VARCHAR(100),
  cp_me_arquivo VARCHAR(255),
  cp_me_descricao TEXT
);

-- Tabela de materiais
CREATE TABLE IF NOT EXISTS cp_mat_materiais (
  cp_mm_id SERIAL PRIMARY KEY,
  cp_mm_nome VARCHAR(100),
  cp_mm_arquivo VARCHAR(255),
  cp_mm_tipo VARCHAR(50)
);

-- Tabela de resumos
CREATE TABLE IF NOT EXISTS cp_resumos (
  cp_rs_id SERIAL PRIMARY KEY,
  cp_rs_titulo VARCHAR(150),
  cp_rs_conteudo TEXT,
  cp_rs_data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de turma-aluno (relacionamento)
CREATE TABLE IF NOT EXISTS cp_tr_aluno (
  cp_tra_id SERIAL PRIMARY KEY,
  cp_tr_id_escola INTEGER NOT NULL,
  cp_tr_id_turma INTEGER NOT NULL,
  cp_tr_id_usuario INTEGER NOT NULL,
  FOREIGN KEY (cp_tr_id_escola) REFERENCES cp_escolas(cp_ec_id),
  FOREIGN KEY (cp_tr_id_turma) REFERENCES cp_turmas(cp_tr_id),
  FOREIGN KEY (cp_tr_id_usuario) REFERENCES cp_usuarios(cp_id)
);

-- Tabela de visualizações de áudio
CREATE TABLE IF NOT EXISTS cp_vizu_aud_usuarios (
  cp_vau_id SERIAL PRIMARY KEY,
  cp_id_usuario INTEGER NOT NULL,
  cp_id_audio INTEGER NOT NULL,
  cp_vau_data_vizualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cp_id_usuario) REFERENCES cp_usuarios(cp_id),
  FOREIGN KEY (cp_id_audio) REFERENCES cp_audio(cp_audio_id)
);

-- Tabela de eventos
CREATE TABLE IF NOT EXISTS eventos (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(100),
  descricao TEXT,
  data_evento DATE,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
`;

async function createUser() {
  console.log('🔧 Conectando ao PostgreSQL como admin...');
  
  const adminClient = new Client(POSTGRES_CONFIG);
  
  try {
    await adminClient.connect();
    console.log('✅ Conectado ao PostgreSQL');

    // Verificar se usuário já existe
    const userExists = await adminClient.query(
      "SELECT 1 FROM pg_roles WHERE rolname = $1",
      [DATABASE_CONFIG.username]
    );

    if (userExists.rows.length === 0) {
      console.log('👤 Criando usuário...');
      await adminClient.query(`
        CREATE USER ${DATABASE_CONFIG.username} 
        WITH PASSWORD '${DATABASE_CONFIG.password}' 
        CREATEDB CREATEROLE;
      `);
      console.log('✅ Usuário criado com sucesso');
    } else {
      console.log('👤 Usuário já existe, atualizando senha...');
      await adminClient.query(`
        ALTER USER ${DATABASE_CONFIG.username} 
        WITH PASSWORD '${DATABASE_CONFIG.password}';
      `);
    }

    // Verificar se banco já existe
    const dbExists = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [DATABASE_CONFIG.dbName]
    );

    if (dbExists.rows.length === 0) {
      console.log('🗄️ Criando banco de dados...');
      await adminClient.query(`CREATE DATABASE ${DATABASE_CONFIG.dbName}`);
      console.log('✅ Banco de dados criado');
    } else {
      console.log('🗄️ Banco de dados já existe');
    }

    // Conceder permissões
    console.log('🔐 Concedendo permissões...');
    await adminClient.query(`GRANT ALL PRIVILEGES ON DATABASE ${DATABASE_CONFIG.dbName} TO ${DATABASE_CONFIG.username}`);
    
    // Conceder permissões de superusuário temporariamente para criar tabelas
    await adminClient.query(`ALTER USER ${DATABASE_CONFIG.username} CREATEDB CREATEROLE`);
    
    await adminClient.end();
    console.log('✅ Configuração do usuário completa');

  } catch (error) {
    console.error('❌ Erro ao configurar usuário:', error.message);
    await adminClient.end();
    throw error;
  }
}

async function createTables() {
  console.log('📋 Criando tabelas...');
  
  const dbClient = new Client({
    host: DATABASE_CONFIG.host,
    port: DATABASE_CONFIG.port,
    database: DATABASE_CONFIG.dbName,
    user: DATABASE_CONFIG.username,
    password: DATABASE_CONFIG.password
  });

  try {
    await dbClient.connect();
    console.log('✅ Conectado ao banco de dados');

    // Conceder permissões no schema public primeiro
    await dbClient.query(`GRANT ALL ON SCHEMA public TO ${DATABASE_CONFIG.username}`);
    await dbClient.query(`GRANT ALL ON ALL TABLES IN SCHEMA public TO ${DATABASE_CONFIG.username}`);
    await dbClient.query(`GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO ${DATABASE_CONFIG.username}`);

    await dbClient.query(CREATE_TABLES_SQL);
    console.log('✅ Tabelas criadas/atualizadas com sucesso');

    // Conceder permissões nas tabelas criadas
    const tables = [
      'cp_escolas', 'cp_curso', 'cp_turmas', 'cp_usuarios', 'cp_audio',
      'cp_matriculas', 'cp_matriculaparcelas', 'cp_chamadas', 'cp_mat_extra',
      'cp_mat_materiais', 'cp_resumos', 'cp_tr_aluno', 'cp_vizu_aud_usuarios', 'eventos'
    ];

    for (const table of tables) {
      try {
        await dbClient.query(`GRANT ALL PRIVILEGES ON TABLE ${table} TO ${DATABASE_CONFIG.username}`);
        // Tentar conceder permissões na sequência, mas não falhar se não existir
        try {
          await dbClient.query(`GRANT ALL PRIVILEGES ON SEQUENCE ${table}_pkey TO ${DATABASE_CONFIG.username}`);
        } catch (seqErr) {
          // Ignorar erro de sequência se não existir
        }
      } catch (tableErr) {
        console.warn(`⚠️ Aviso: Não foi possível conceder permissões na tabela ${table}:`, tableErr.message);
      }
    }

    console.log('✅ Permissões concedidas nas tabelas');
    await dbClient.end();

  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error.message);
    await dbClient.end();
    throw error;
  }
}

async function createEnvFile() {
  console.log('📝 Criando arquivo .env...');
  
  const databaseUrl = `postgresql://${DATABASE_CONFIG.username}:${DATABASE_CONFIG.password}@${DATABASE_CONFIG.host}:${DATABASE_CONFIG.port}/${DATABASE_CONFIG.dbName}`;
  
  const envContent = `# Database Configuration
DATABASE_URL="${databaseUrl}"

# Server Configuration  
PORT=3001

# Generated by setup.js on ${new Date().toISOString()}
`;

  const envPath = path.join(__dirname, '.env');
  
  if (fs.existsSync(envPath)) {
    console.log('📝 Arquivo .env já existe, fazendo backup...');
    fs.copyFileSync(envPath, `${envPath}.backup.${Date.now()}`);
  }

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Arquivo .env criado com sucesso');
  console.log(`📄 DATABASE_URL: ${databaseUrl}`);
}

async function installPrisma() {
  console.log('🔄 Configurando Prisma...');
  
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);

  try {
    console.log('📦 Instalando dependências do Prisma...');
    
    // Comando cross-platform para npm
    const isWindows = process.platform === 'win32';
    const npmCommand = isWindows ? 'npm.cmd' : 'npm';
    
    await execAsync(`${npmCommand} install prisma @prisma/client`, { cwd: __dirname });
    
    console.log('🔄 Fazendo pull do schema do banco...');
    try {
      await execAsync(`npx prisma db pull`, { cwd: __dirname });
    } catch (pullErr) {
      console.log('ℹ️ Erro no db pull (normal se for primeira execução):', pullErr.message);
    }
    
    console.log('🔄 Executando migrações...');
    try {
      await execAsync(`npx prisma migrate deploy`, { cwd: __dirname });
    } catch (migrateErr) {
      console.log('ℹ️ Erro nas migrações (normal se não houver migrações):', migrateErr.message);
    }
    
    console.log('🔄 Gerando Prisma Client...');
    try {
      await execAsync(`npx prisma generate`, { cwd: __dirname });
    } catch (generateErr) {
      console.log('ℹ️ Erro no generate (tentando alternativa):', generateErr.message);
      // Tentar regenerar o schema primeiro
      await execAsync(`npx prisma db pull --force`, { cwd: __dirname });
      await execAsync(`npx prisma generate`, { cwd: __dirname });
    }
    
    console.log('✅ Prisma configurado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao configurar Prisma:', error.message);
    console.log(`ℹ️ Execute manualmente: ${isWindows ? 'npm.cmd' : 'npm'} install prisma @prisma/client && npx prisma db pull && npx prisma generate`);
  }
}

async function testConnection() {
  console.log('🧪 Testando conexão com o banco...');
  
  try {
    // Aguardar um pouco para o banco estar pronto
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: `postgresql://${DATABASE_CONFIG.username}:${DATABASE_CONFIG.password}@${DATABASE_CONFIG.host}:${DATABASE_CONFIG.port}/${DATABASE_CONFIG.dbName}`
        }
      }
    });

    // Testar conexão básica primeiro
    await prisma.$connect();
    
    const userCount = await prisma.cp_usuarios.count();
    const schoolCount = await prisma.cp_escolas.count();
    
    console.log('✅ Conexão testada com sucesso!');
    console.log(`📊 Usuários: ${userCount}, Escolas: ${schoolCount}`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erro no teste de conexão:', error.message);
    console.log('ℹ️ Verifique se as tabelas foram criadas corretamente');
  }
}

async function insertDefaultData() {
  console.log('📊 Inserindo/Atualizando dados padrão...');
  
  const { Client } = require('pg');
  const dbClient = new Client({
    host: DATABASE_CONFIG.host,
    port: DATABASE_CONFIG.port,
    database: DATABASE_CONFIG.dbName,
    user: DATABASE_CONFIG.username,
    password: DATABASE_CONFIG.password,
  });

  try {
    await dbClient.connect();
    
    // Verificar e adicionar constraints UNIQUE se não existirem
    try {
      await dbClient.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cp_escolas_nome_unique') THEN
            ALTER TABLE cp_escolas ADD CONSTRAINT cp_escolas_nome_unique UNIQUE (cp_ec_nome);
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cp_usuarios_login_unique') THEN
            ALTER TABLE cp_usuarios ADD CONSTRAINT cp_usuarios_login_unique UNIQUE (cp_login);
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cp_curso_nome_unique') THEN
            ALTER TABLE cp_curso ADD CONSTRAINT cp_curso_nome_unique UNIQUE (cp_nome_curso);
          END IF;
        END $$;
      `);
    } catch (constraintError) {
      console.log('ℹ️ Aviso: Erro ao adicionar constraints (podem já existir):', constraintError.message);
    }
    
    // Inserir/Atualizar escola padrão usando UPSERT manual
    const schoolCheck = await dbClient.query('SELECT cp_ec_id FROM cp_escolas WHERE cp_ec_nome = $1', ['CIPEX - Centro de Idiomas']);
    
    let schoolId;
    if (schoolCheck.rows.length > 0) {
      // Atualizar escola existente
      await dbClient.query(`
        UPDATE cp_escolas 
        SET cp_ec_responsavel = 'Administrador',
            cp_ec_data_cadastro = CURRENT_DATE,
            cp_ec_endereco_cidade = 'Cidade Principal',
            cp_ec_excluido = false
        WHERE cp_ec_nome = $1
      `, ['CIPEX - Centro de Idiomas']);
      schoolId = schoolCheck.rows[0].cp_ec_id;
    } else {
      // Inserir nova escola
      const insertResult = await dbClient.query(`
        INSERT INTO cp_escolas (cp_ec_nome, cp_ec_responsavel, cp_ec_data_cadastro, cp_ec_endereco_cidade, cp_ec_excluido) 
        VALUES ('CIPEX - Centro de Idiomas', 'Administrador', CURRENT_DATE, 'Cidade Principal', false)
        RETURNING cp_ec_id
      `);
      schoolId = insertResult.rows[0].cp_ec_id;
    }

    // Sempre recriar/atualizar usuário administrador padrão
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    console.log('🔄 Recriando usuário administrador...');
    
    // Inserir/Atualizar usuário administrador usando UPSERT manual
    const adminCheck = await dbClient.query('SELECT cp_id FROM cp_usuarios WHERE cp_login = $1', ['admin']);
    
    if (adminCheck.rows.length > 0) {
      // Atualizar admin existente
      await dbClient.query(`
        UPDATE cp_usuarios 
        SET cp_nome = 'Administrador',
            cp_email = 'admin@cipex.com.br',
            cp_password = $1,
            cp_tipo_user = 1,
            cp_cpf = '000.000.000-00',
            cp_datanascimento = '1990-01-01',
            cp_escola_id = $2,
            cp_excluido = 0
        WHERE cp_login = 'admin'
      `, [hashedPassword, schoolId]);
    } else {
      // Inserir novo admin
      await dbClient.query(`
        INSERT INTO cp_usuarios (cp_nome, cp_email, cp_login, cp_password, cp_tipo_user, cp_cpf, cp_datanascimento, cp_escola_id, cp_excluido) 
        VALUES ('Administrador', 'admin@cipex.com.br', 'admin', $1, 1, '000.000.000-00', '1990-01-01', $2, 0)
      `, [hashedPassword, schoolId]);
    }

    // Inserir/Atualizar curso de exemplo usando UPSERT manual
    const courseCheck = await dbClient.query('SELECT cp_curso_id FROM cp_curso WHERE cp_nome_curso = $1', ['Inglês Básico']);
    
    if (courseCheck.rows.length > 0) {
      // Atualizar curso existente
      await dbClient.query(`
        UPDATE cp_curso 
        SET cp_youtube_link_curso = 'https://youtube.com/example',
            cp_pdf1_curso = 'exemplo.pdf'
        WHERE cp_nome_curso = 'Inglês Básico'
      `);
    } else {
      // Inserir novo curso
      await dbClient.query(`
        INSERT INTO cp_curso (cp_nome_curso, cp_youtube_link_curso, cp_pdf1_curso) 
        VALUES ('Inglês Básico', 'https://youtube.com/example', 'exemplo.pdf')
      `);
    }

    console.log('✅ Dados padrão inseridos/atualizados com sucesso');
    console.log(`👤 Usuário admin recriado - Login: admin, Senha: admin123`);
  } catch (error) {
    console.error('❌ Erro ao inserir/atualizar dados padrão:', error.message);
  } finally {
    await dbClient.end();
  }
}

// Função para executar migração de dados
async function runDataMigration() {
  console.log('📦 Executando migração de dados do MySQL...');
  
  try {
    const CipexMigrator = require('./migrator.js');
    const migrator = new CipexMigrator();
    
    const result = await migrator.run();
    
    if (result.success && parseFloat(result.successRate) > 30) {
      console.log(`✅ Migração concluída com sucesso: ${result.successRate}% de taxa de sucesso`);
      console.log(`📊 ${result.totalRecords} registros migrados`);
      return true;
    } else {
      console.log(`⚠️ Migração parcial: ${result.successRate}% de taxa de sucesso`);
      console.log(`📊 ${result.totalRecords} registros migrados`);
      console.log('ℹ️ Alguns dados podem não ter sido migrados corretamente');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error.message);
    console.log('ℹ️ O sistema funcionará apenas com dados padrão');
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando configuração completa do ambiente backend...\n');
  
  try {
    // Verificar se o PostgreSQL está rodando
    console.log('🔍 Verificando PostgreSQL...');
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    try {
      // Comando cross-platform para verificar PostgreSQL
      const isWindows = process.platform === 'win32';
      const pgCommand = isWindows ? 'pg_isready.exe -h localhost -p 5432' : 'pg_isready -h localhost -p 5432';
      
      await execAsync(pgCommand);
      console.log('✅ PostgreSQL está rodando\n');
    } catch (error) {
      console.error('❌ PostgreSQL não está rodando ou não está acessível');
      console.log('ℹ️ Certifique-se de que o PostgreSQL está instalado e rodando na porta 5432');
      
      // Sugestões específicas por plataforma
      const isWindows = process.platform === 'win32';
      if (isWindows) {
        console.log('ℹ️ Windows: Verifique se o serviço PostgreSQL está iniciado no Services.msc');
        console.log('ℹ️ Ou execute: net start postgresql-x64-[versão]');
      } else {
        console.log('ℹ️ Linux/Mac: sudo systemctl start postgresql ou brew services start postgresql');
      }
      
      process.exit(1);
    }

    // Passo 1: Criar usuário e banco de dados
    await createUser();
    console.log('');

    // Passo 2: Criar tabelas
    await createTables();
    console.log('');

    // Passo 3: Criar arquivo .env
    await createEnvFile();
    console.log('');

    // Passo 4: Instalar e configurar Prisma
    await installPrisma();
    console.log('');

    // Passo 5: Inserir dados padrão
    await insertDefaultData();
    console.log('');

    // Passo 6: Executar migração de dados (se disponível)
    const migrationSuccess = await runDataMigration();
    console.log('');

    // Passo 7: Testar conexão final
    await testConnection();
    console.log('');

    console.log('🎉 CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('');
    console.log('📋 Próximos passos:');
    console.log('   1. Execute: npm start (para iniciar o servidor)');
    console.log('   2. Acesse: http://localhost:3000');
    console.log('   3. Login admin: admin / admin123');
    console.log('');
    console.log('📁 Arquivos criados:');
    console.log('   - .env (configurações do banco)');
    console.log('   - prisma/schema.prisma (atualizado)');
    if (migrationSuccess) {
      console.log('   - migration_final.log (log da migração)');
      console.log('');
      console.log('📊 Dados migrados do MySQL com sucesso!');
    } else {
      console.log('');
      console.log('ℹ️ Sistema configurado com dados padrão');
      console.log('💡 Para migrar dados do MySQL, execute: node migrator.js');
    }
    console.log('');

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error.message);
    console.log('\n🔧 Para resolver problemas:');
    console.log('   1. Verifique se o PostgreSQL está rodando');
    console.log('   2. Verifique as credenciais de admin do PostgreSQL');
    console.log('   3. Execute novamente: node setup.js');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
