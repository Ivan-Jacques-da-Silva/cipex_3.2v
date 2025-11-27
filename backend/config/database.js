// Configuração centralizada do banco de dados

const { Pool } = require('pg');

// Configuração direta do PostgreSQL
const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.POSTGRES_DB || 'cipex_portal',
  password: process.env.PGPASSWORD || 'admin',
  port: process.env.PGPORT || 5432,
});

// Wrapper para simular interface do Prisma
const prisma = {
  $connect: () => Promise.resolve(),
  $disconnect: () => pool.end(),
  
  // Simulação das tabelas principais
  cp_usuarios: {
    findMany: async (options = {}) => {
      try {
        let query = 'SELECT * FROM cp_usuarios';
        let values = [];
        
        if (options.where) {
          const conditions = Object.keys(options.where).map((k, i) => `${k} = $${i + 1}`);
          query += ' WHERE ' + conditions.join(' AND ');
          values = Object.values(options.where);
        }
        
        if (options.select) {
          const selectFields = Object.keys(options.select).join(', ');
          query = query.replace('*', selectFields);
        }
        
        const result = await pool.query(query, values);
        return result.rows;
      } catch (error) {
        console.error('Error in cp_usuarios.findMany:', error);
        throw error;
      }
    },
    
    findFirst: async (options) => {
      try {
        let query = 'SELECT * FROM cp_usuarios';
        let values = [];
        
        if (options.where) {
          const conditions = Object.keys(options.where).map((k, i) => `${k} = $${i + 1}`);
          query += ' WHERE ' + conditions.join(' AND ');
          values = Object.values(options.where);
        }
        
        if (options.select) {
          const selectFields = Object.keys(options.select).join(', ');
          query = query.replace('*', selectFields);
        }
        
        query += ' LIMIT 1';
        
        const result = await pool.query(query, values);
        return result.rows[0] || null;
      } catch (error) {
        console.error('Error in cp_usuarios.findFirst:', error);
        throw error;
      }
    },
    
    findUnique: async (options) => {
      try {
        const keys = Object.keys(options.where);
        let query = `SELECT * FROM cp_usuarios WHERE ${keys.map((k, i) => `${k} = $${i + 1}`).join(' AND ')} LIMIT 1`;
        
        if (options.select) {
          const selectFields = Object.keys(options.select).join(', ');
          query = query.replace('*', selectFields);
        }
        
        const result = await pool.query(query, Object.values(options.where));
        return result.rows[0] || null;
      } catch (error) {
        console.error('Error in cp_usuarios.findUnique:', error);
        throw error;
      }
    },
    
    create: async (options) => {
      try {
        const keys = Object.keys(options.data);
        const query = `INSERT INTO cp_usuarios (${keys.join(', ')}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`;
        const result = await pool.query(query, Object.values(options.data));
        return result.rows[0];
      } catch (error) {
        console.error('Error in cp_usuarios.create:', error);
        throw error;
      }
    },
    
    update: async (options) => {
      try {
        const whereKeys = Object.keys(options.where);
        const dataKeys = Object.keys(options.data);
        const query = `UPDATE cp_usuarios SET ${dataKeys.map((k, i) => `${k} = $${i + 1}`).join(', ')} WHERE ${whereKeys.map((k, i) => `${k} = $${dataKeys.length + i + 1}`).join(' AND ')} RETURNING *`;
        const values = [...Object.values(options.data), ...Object.values(options.where)];
        const result = await pool.query(query, values);
        return result.rows[0];
      } catch (error) {
        console.error('Error in cp_usuarios.update:', error);
        throw error;
      }
    },
    
    delete: async (options) => {
      try {
        const keys = Object.keys(options.where);
        const query = `DELETE FROM cp_usuarios WHERE ${keys.map((k, i) => `${k} = $${i + 1}`).join(' AND ')} RETURNING *`;
        const result = await pool.query(query, Object.values(options.where));
        return result.rows[0];
      } catch (error) {
        console.error('Error in cp_usuarios.delete:', error);
        throw error;
      }
    }
  },
  
  cp_escolas: {
    findMany: async (options = {}) => {
      try {
        let query = 'SELECT * FROM cp_escolas';
        let values = [];
        
        if (options.where) {
          const conditions = Object.keys(options.where).map((k, i) => `${k} = $${i + 1}`);
          query += ' WHERE ' + conditions.join(' AND ');
          values = Object.values(options.where);
        }
        
        const result = await pool.query(query, values);
        return result.rows;
      } catch (error) {
        console.error('Error in cp_escolas.findMany:', error);
        throw error;
      }
    },
    
    findUnique: async (options) => {
      try {
        const keys = Object.keys(options.where);
        const query = `SELECT * FROM cp_escolas WHERE ${keys.map((k, i) => `${k} = $${i + 1}`).join(' AND ')} LIMIT 1`;
        const result = await pool.query(query, Object.values(options.where));
        return result.rows[0] || null;
      } catch (error) {
        console.error('Error in cp_escolas.findUnique:', error);
        throw error;
      }
    },
    
    create: async (options) => {
      try {
        const keys = Object.keys(options.data);
        const query = `INSERT INTO cp_escolas (${keys.join(', ')}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`;
        const result = await pool.query(query, Object.values(options.data));
        return result.rows[0];
      } catch (error) {
        console.error('Error in cp_escolas.create:', error);
        throw error;
      }
    },
    
    update: async (options) => {
      try {
        const whereKeys = Object.keys(options.where);
        const dataKeys = Object.keys(options.data);
        const query = `UPDATE cp_escolas SET ${dataKeys.map((k, i) => `${k} = $${i + 1}`).join(', ')} WHERE ${whereKeys.map((k, i) => `${k} = $${dataKeys.length + i + 1}`).join(' AND ')} RETURNING *`;
        const values = [...Object.values(options.data), ...Object.values(options.where)];
        const result = await pool.query(query, values);
        return result.rows[0];
      } catch (error) {
        console.error('Error in cp_escolas.update:', error);
        throw error;
      }
    },
    
    delete: async (options) => {
      try {
        const keys = Object.keys(options.where);
        const query = `DELETE FROM cp_escolas WHERE ${keys.map((k, i) => `${k} = $${i + 1}`).join(' AND ')} RETURNING *`;
        const result = await pool.query(query, Object.values(options.where));
        return result.rows[0];
      } catch (error) {
        console.error('Error in cp_escolas.delete:', error);
        throw error;
      }
    }
  },
  
  cp_turmas: {
    findMany: async (options = {}) => {
      try {
        let query = 'SELECT * FROM cp_turmas WHERE cp_tr_excluido = false';
        const result = await pool.query(query);
        return result.rows;
      } catch (error) {
        console.error('Error in cp_turmas.findMany:', error);
        throw error;
      }
    },
    findUnique: async (options) => {
      try {
        const query = 'SELECT * FROM cp_turmas WHERE cp_tr_id = $1 AND cp_tr_excluido = false';
        const result = await pool.query(query, [options.where.cp_tr_id]);
        return result.rows[0] || null;
      } catch (error) {
        console.error('Error in cp_turmas.findUnique:', error);
        throw error;
      }
    },
    create: async (options) => {
      try {
        const { cp_tr_nome, cp_tr_data_inicio, cp_tr_data_fim, cp_tr_id_professor, cp_tr_id_escola, cp_tr_curso_id } = options.data;
        const query = `
          INSERT INTO cp_turmas (cp_tr_nome, cp_tr_data_inicio, cp_tr_data_fim, cp_tr_id_professor, cp_tr_id_escola, cp_tr_curso_id)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `;
        const result = await pool.query(query, [cp_tr_nome, cp_tr_data_inicio, cp_tr_data_fim, cp_tr_id_professor, cp_tr_id_escola, cp_tr_curso_id]);
        return result.rows[0];
      } catch (error) {
        console.error('Error in cp_turmas.create:', error);
        throw error;
      }
    },
    update: async (options) => {
      try {
        const fields = Object.keys(options.data);
        const values = Object.values(options.data);
        const setClause = fields.map((field, index) => `"${field}" = $${index + 2}`).join(', ');
        const query = `UPDATE cp_turmas SET ${setClause} WHERE cp_tr_id = $1 RETURNING *`;
        console.log('Update query:', query);
        console.log('Update values:', [options.where.cp_tr_id, ...values]);
        const result = await pool.query(query, [options.where.cp_tr_id, ...values]);
        return result.rows[0];
      } catch (error) {
        console.error('Error in cp_turmas.update:', error);
        throw error;
      }
    },
    delete: async (options) => {
      try {
        console.log('cp_turmas.delete called with options:', JSON.stringify(options, null, 2));
        const query = 'UPDATE cp_turmas SET cp_tr_excluido = true WHERE cp_tr_id = $1 RETURNING *';
        console.log('Executing query:', query, 'with params:', [options.where.cp_tr_id]);
        const result = await pool.query(query, [options.where.cp_tr_id]);
        console.log('Query result:', result.rows[0]);
        return result.rows[0];
      } catch (error) {
        console.error('Error in cp_turmas.delete:', error);
        throw error;
      }
    },
    count: async () => {
      try {
        const query = 'SELECT COUNT(*) FROM cp_turmas WHERE cp_tr_excluido = false';
        const result = await pool.query(query);
        return parseInt(result.rows[0].count);
      } catch (error) {
        console.error('Error in cp_turmas.count:', error);
        throw error;
      }
    }
  },
  
  cp_curso: {
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
    count: () => Promise.resolve(0)
  },
  
  cp_matriculas: {
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
    count: () => Promise.resolve(0)
  },
  
  cp_matriculaParcelas: {
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
    count: () => Promise.resolve(0)
  },
  
  cp_notas: {
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
    count: () => Promise.resolve(0)
  },
  
  cp_mat_extra: {
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
    count: () => Promise.resolve(0)
  },
  
  cp_resumos: {
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
    count: () => Promise.resolve(0)
  },
  
  cp_audio: {
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
    count: () => Promise.resolve(0)
  },
  
  cp_chamadas: {
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
    count: () => Promise.resolve(0)
  },
  
  eventos: {
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
    count: () => Promise.resolve(0)
  },
  
  // Mock para transações
  $transaction: async (callback) => {
    // Executa o callback passando o próprio prisma como parâmetro
    return await callback(prisma);
  },
  
  // Método para queries customizadas
  $queryRaw: async (query, ...params) => {
    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error in $queryRaw:', error);
      throw error;
    }
  }
};

module.exports = { prisma };