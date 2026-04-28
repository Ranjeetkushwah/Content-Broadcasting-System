const pool = require('./database');

class ContentSlot {
  static async create(subject) {
    const query = `
      INSERT INTO content_slots (subject)
      VALUES ($1)
      RETURNING *
    `;
    
    try {
      const result = await pool.query(query, [subject]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    const query = 'SELECT * FROM content_slots ORDER BY subject';
    
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    const query = 'SELECT * FROM content_slots WHERE id = $1';
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findBySubject(subject) {
    const query = 'SELECT * FROM content_slots WHERE subject = $1';
    
    try {
      const result = await pool.query(query, [subject]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    const query = 'DELETE FROM content_slots WHERE id = $1 RETURNING id';
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ContentSlot;
