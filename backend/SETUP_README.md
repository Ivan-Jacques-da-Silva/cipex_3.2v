# 🚀 Setup Automático do Backend CIPEX

Este documento descreve como usar o script `setup.js` para configurar automaticamente todo o ambiente do backend.

## 📋 Pré-requisitos

Antes de executar o setup, certifique-se de que você tem:

1. **PostgreSQL instalado e rodando**
   - Versão 12 ou superior
   - Rodando na porta padrão 5432
   - Usuário `postgres` com senha `admin`

2. **Node.js instalado**
   - Versão 16 ou superior
   - NPM disponível

## 🔧 Como usar o Setup

### 1. Executar o Setup

```bash
cd backend
node setup.js
```

### 2. O que o Setup faz automaticamente

O script `setup.js` executa as seguintes etapas:

#### ✅ Verificação do PostgreSQL
- Verifica se o PostgreSQL está rodando
- Testa conectividade na porta 5432

#### 👤 Configuração do Usuário e Banco
- Cria o usuário `cipex_user` (se não existir)
- Cria o banco de dados `cipex_portal` (se não existir)
- Configura permissões adequadas

#### 📋 Criação das Tabelas
- Cria todas as tabelas necessárias:
  - `cp_escolas` - Escolas cadastradas
  - `cp_curso` - Cursos disponíveis
  - `cp_turmas` - Turmas dos cursos
  - `cp_usuarios` - Usuários do sistema
  - `cp_audio` - Arquivos de áudio
  - E outras tabelas auxiliares

#### 📝 Configuração do Ambiente
- Cria o arquivo `.env` com as configurações do banco
- Faz backup do `.env` existente (se houver)

#### 🔄 Configuração do Prisma
- Instala dependências do Prisma
- Faz pull do schema do banco de dados
- Gera o Prisma Client atualizado

#### 📊 Dados Iniciais
- Insere dados padrão (se não existirem):
  - Escola exemplo: "CIPEX - Centro de Idiomas"
  - Usuário administrador: `admin` / `admin123`
  - Curso exemplo: "Inglês Básico"

#### 🧪 Teste Final
- Testa a conexão com o banco
- Verifica se os dados foram inseridos corretamente

## 📁 Arquivos Criados/Modificados

Após o setup, os seguintes arquivos são criados ou atualizados:

- **`.env`** - Configurações do banco de dados
- **`prisma/schema.prisma`** - Schema atualizado do Prisma
- **`.env.backup.TIMESTAMP`** - Backup do .env anterior (se existia)

## 🎯 Próximos Passos

Após o setup bem-sucedido:

1. **Iniciar o servidor:**
   ```bash
   npm start
   # ou
   node index.js
   ```

2. **Acessar a aplicação:**
   - URL: http://localhost:3000
   - Login: `admin`
   - Senha: `admin123`

## 🔧 Resolução de Problemas

### Erro: "PostgreSQL não está rodando"
- Verifique se o PostgreSQL está instalado
- Inicie o serviço do PostgreSQL
- Confirme que está rodando na porta 5432

### Erro: "permissão negada"
- Verifique se o usuário `postgres` tem senha `admin`
- Execute como administrador se necessário
- Verifique as configurações de autenticação do PostgreSQL

### Erro no Prisma
- Execute manualmente: `npx prisma db pull && npx prisma generate`
- Verifique se o arquivo `.env` foi criado corretamente

### Dados não aparecem na API
- Verifique se o servidor está rodando
- Teste a conexão: `curl http://localhost:3000/cursos`
- Verifique os logs do servidor para erros

## ⚙️ Configurações Padrão

O setup usa as seguintes configurações padrão:

```
Host: localhost
Porta: 5432
Banco: cipex_portal
Usuário: cipex_user
Senha: CipexPortal@2024!SecurePass
```

## 🔄 Re-executar o Setup

O setup pode ser executado múltiplas vezes com segurança:
- Não duplica dados existentes
- Atualiza configurações se necessário
- Faz backup de arquivos importantes

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs de erro exibidos
2. Confirme os pré-requisitos
3. Execute novamente o setup
4. Verifique a documentação do PostgreSQL e Prisma