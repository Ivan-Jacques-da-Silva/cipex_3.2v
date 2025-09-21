
#!/bin/bash

echo "🚀 Iniciando configuração do ambiente..."

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Executar setup
echo "🔧 Executando setup do banco de dados..."
node setup.js

echo "✅ Configuração concluída!"
echo "Para iniciar o servidor, execute: npm start"
