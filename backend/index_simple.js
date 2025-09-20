// Simplified backend for testing PostgreSQL conversion
const http = require('http');
const url = require('url');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const PORT = 5000;

// Simple HTTP server
const server = http.createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Get request body for POST/PUT
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const data = body ? JSON.parse(body) : {};
      let response = { success: false, message: 'Route not found' };

      // Test route
      if (path === '/test' && method === 'GET') {
        response = { 
          success: true, 
          message: 'PostgreSQL + Prisma backend is working!',
          timestamp: new Date().toISOString()
        };
      }

      // Login route (simplified)
      else if (path === '/login' && method === 'POST') {
        const { login, password } = data;
        
        if (!login || !password) {
          response = { success: false, message: 'Login and password required' };
        } else {
          try {
            const user = await prisma.cp_usuarios.findFirst({
              where: {
                cp_login: login,
                cp_password: password, // TODO: Add bcrypt hashing
                cp_ec_excluido: false
              }
            });

            if (user) {
              response = {
                success: true,
                message: 'Login successful',
                user: {
                  id: user.cp_idusuario,
                  name: user.cp_nome,
                  email: user.cp_email,
                  type: user.cp_tipo
                }
              };
            } else {
              response = { success: false, message: 'Invalid credentials' };
            }
          } catch (error) {
            console.error('Login error:', error);
            response = { success: false, message: 'Database error' };
          }
        }
      }

      // Users list route
      else if (path === '/users' && method === 'GET') {
        try {
          const users = await prisma.cp_usuarios.findMany({
            where: { cp_ec_excluido: false },
            select: {
              cp_idusuario: true,
              cp_nome: true,
              cp_email: true,
              cp_tipo: true,
              cp_login: true
            },
            take: 50 // Limit for testing
          });

          response = {
            success: true,
            users: users,
            count: users.length
          };
        } catch (error) {
          console.error('Users error:', error);
          response = { success: false, message: 'Database error' };
        }
      }

      // Database connection test
      else if (path === '/db-test' && method === 'GET') {
        try {
          const userCount = await prisma.cp_usuarios.count();
          const schoolCount = await prisma.cp_escolas.count();
          
          response = {
            success: true,
            message: 'Database connection successful',
            counts: {
              users: userCount,
              schools: schoolCount
            }
          };
        } catch (error) {
          console.error('DB test error:', error);
          response = { success: false, message: 'Database connection failed', error: error.message };
        }
      }

      // Send response
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response, null, 2));

    } catch (error) {
      console.error('Request error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Server error', error: error.message }));
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple backend server running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- GET /test - Test basic functionality');
  console.log('- GET /db-test - Test database connection');
  console.log('- POST /login - User login');
  console.log('- GET /users - List users');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});