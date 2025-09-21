
// Configuração da API para diferentes ambientes
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  
  // Ambiente de teste com pteste.cipex.com.br
  if (hostname.includes('pteste.cipex.com.br')) {
    return 'https://pteste.cipex.com.br:5000'; // Backend na mesma base ou ajuste conforme sua VPS
  }
  
  // Ambiente de produção na Hostinger
  if (hostname.includes('portal.cipex.com.br')) {
    return 'https://portal.cipex.com.br/api'; // Ajuste para seu IP/domínio da Hostinger
  }
  
  // Ambiente Replit
  if (hostname.includes('replit.dev')) {
    return `${window.location.protocol}//${hostname}:3001`;
  }
  
  // Ambiente local (localhost)
  return 'http://localhost:3001';
};

export const API_BASE_URL = getApiBaseUrl();

// Função helper para fazer requisições
export const makeRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };
  
  return fetch(url, { ...defaultOptions, ...options });
};

export default {
  API_BASE_URL,
  makeRequest
};
