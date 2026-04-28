const pool = require('./database');

class Content {
  static async create(contentData) {
    const {
      title, description, subject, file_url, file_type, 
      file_size, uploaded_by, start_time, end_time
    } = contentData;
    
    const query = `
      INSERT INTO content (title, description, subject, file_url, file_type, 
                          file_size, uploaded_by, start_time, end_time, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
      RETURNING *
    `;
    const values = [
      title, description, subject, file_url, file_type, 
      file_size, uploaded_by, start_time, end_time
    ];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    const query = `
      SELECT c.*, u.name as uploaded_by_name, u.email as uploaded_by_email,
             approver.name as approved_by_name
      FROM content c
      LEFT JOIN users u ON c.uploaded_by = u.id
      LEFT JOIN users approver ON c.approved_by = approver.id
      WHERE c.id = $1
    `;
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByTeacher(teacherId, status = null) {
    let query = `
      SELECT c.*, u.name as uploaded_by_name
      FROM content c
      LEFT JOIN users u ON c.uploaded_by = u.id
      WHERE c.uploaded_by = $1
    `;
    const params = [teacherId];
    
    if (status) {
      query += ' AND c.status = $2';
      params.push(status);
    }
    
    query += ' ORDER BY c.created_at DESC';
    
    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(status = null, subject = null) {
    let query = `
      SELECT c.*, u.name as uploaded_by_name, u.email as uploaded_by_email,
             approver.name as approved_by_name
      FROM content c
      LEFT JOIN users u ON c.uploaded_by = u.id
      LEFT JOIN users approver ON c.approved_by = approver.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      query += ' AND c.status = $' + (params.length + 1);
      params.push(status);
    }
    
    if (subject) {
      query += ' AND c.subject = $' + (params.length + 1);
      params.push(subject);
    }
    
    query += ' ORDER BY c.created_at DESC';
    
    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async updateStatus(id, status, approvedBy = null, rejectionReason = null) {
    const query = `
      UPDATE content 
      SET status = $1, approved_by = $2, rejection_reason = $3, 
          approved_at = CASE WHEN $1 = 'approved' THEN CURRENT_TIMESTAMP ELSE NULL END
      WHERE id = $4
      RETURNING *
    `;
    const values = [status, approvedBy, rejectionReason, id];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getApprovedContentForBroadcast(teacherId = null) {
    let query = `
      SELECT c.*, u.name as uploaded_by_name
      FROM content c
      LEFT JOIN users u ON c.uploaded_by = u.id
      WHERE c.status = 'approved'
      AND (
        (c.start_time IS NULL AND c.end_time IS NULL) OR
        (c.start_time <= CURRENT_TIMESTAMP AND (c.end_time IS NULL OR c.end_time >= CURRENT_TIMESTAMP))
      )
    `;
    const params = [];
    
    if (teacherId) {
      query += ' AND c.uploaded_by = $' + (params.length + 1);
      params.push(teacherId);
    }
    
    query += ' ORDER BY c.subject, c.created_at';
    
    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    const query = 'DELETE FROM content WHERE id = $1 RETURNING id, file_url';
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getStatusStats() {
    const query = `
      SELECT 
        status,
        COUNT(*) as count,
        COUNT(DISTINCT uploaded_by) as unique_teachers
      FROM content
      GROUP BY status
      ORDER BY status
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Content;
