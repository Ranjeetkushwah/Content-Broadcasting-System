const pool = require('./database');

class ContentSchedule {
  static async create(scheduleData) {
    const { content_id, slot_id, rotation_order, duration } = scheduleData;
    
    const query = `
      INSERT INTO content_schedule (content_id, slot_id, rotation_order, duration)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [content_id, slot_id, rotation_order, duration];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findBySlot(slotId) {
    const query = `
      SELECT cs.*, c.title, c.subject, c.file_url, c.status
      FROM content_schedule cs
      LEFT JOIN content c ON cs.content_id = c.id
      WHERE cs.slot_id = $1
      ORDER BY cs.rotation_order ASC
    `;
    
    try {
      const result = await pool.query(query, [slotId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async findByContent(contentId) {
    const query = `
      SELECT cs.*, s.subject
      FROM content_schedule cs
      LEFT JOIN content_slots s ON cs.slot_id = s.id
      WHERE cs.content_id = $1
    `;
    
    try {
      const result = await pool.query(query, [contentId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getActiveContentForSlot(slotId) {
    const query = `
      SELECT cs.*, c.title, c.subject, c.file_url, c.description, 
             c.start_time, c.end_time, u.name as uploaded_by_name
      FROM content_schedule cs
      LEFT JOIN content c ON cs.content_id = c.id
      LEFT JOIN users u ON c.uploaded_by = u.id
      WHERE cs.slot_id = $1
      AND c.status = 'approved'
      AND (
        (c.start_time IS NULL AND c.end_time IS NULL) OR
        (c.start_time <= CURRENT_TIMESTAMP AND (c.end_time IS NULL OR c.end_time >= CURRENT_TIMESTAMP))
      )
      ORDER BY cs.rotation_order ASC
    `;
    
    try {
      const result = await pool.query(query, [slotId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async updateRotationOrder(contentId, newOrder) {
    const query = `
      UPDATE content_schedule 
      SET rotation_order = $1
      WHERE content_id = $2
      RETURNING *
    `;
    const values = [newOrder, contentId];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async delete(contentId, slotId = null) {
    let query = 'DELETE FROM content_schedule WHERE content_id = $1';
    const params = [contentId];
    
    if (slotId) {
      query += ' AND slot_id = $2';
      params.push(slotId);
    }
    
    query += ' RETURNING *';
    
    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async getNextActiveContent(slotId, currentContentId = null) {
    const query = `
      WITH active_content AS (
        SELECT cs.*, c.title, c.subject, c.file_url, c.description,
               c.start_time, c.end_time, u.name as uploaded_by_name
        FROM content_schedule cs
        LEFT JOIN content c ON cs.content_id = c.id
        LEFT JOIN users u ON c.uploaded_by = u.id
        WHERE cs.slot_id = $1
        AND c.status = 'approved'
        AND (
          (c.start_time IS NULL AND c.end_time IS NULL) OR
          (c.start_time <= CURRENT_TIMESTAMP AND (c.end_time IS NULL OR c.end_time >= CURRENT_TIMESTAMP))
        )
        ORDER BY cs.rotation_order ASC
      )
      SELECT * FROM active_content
      WHERE id != COALESCE($2, 0)
      ORDER BY rotation_order ASC
      LIMIT 1
    `;
    const values = [slotId, currentContentId];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getCurrentActiveContent(slotId) {
    const query = `
      WITH total_duration AS (
        SELECT SUM(duration) as total_minutes
        FROM content_schedule cs
        LEFT JOIN content c ON cs.content_id = c.id
        WHERE cs.slot_id = $1
        AND c.status = 'approved'
        AND (
          (c.start_time IS NULL AND c.end_time IS NULL) OR
          (c.start_time <= CURRENT_TIMESTAMP AND (c.end_time IS NULL OR c.end_time >= CURRENT_TIMESTAMP))
        )
      ),
      time_modulo AS (
        SELECT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) / 60 as current_minutes
      ),
      rotation_position AS (
        SELECT MOD(current_minutes, total_minutes) as position_in_cycle
        FROM time_modulo, total_duration
        WHERE total_minutes > 0
      ),
      cumulative_durations AS (
        SELECT 
          cs.content_id,
          c.title,
          c.subject,
          c.file_url,
          c.description,
          c.start_time,
          c.end_time,
          u.name as uploaded_by_name,
          cs.rotation_order,
          SUM(cs.duration) OVER (ORDER BY cs.rotation_order) as cumulative_duration
        FROM content_schedule cs
        LEFT JOIN content c ON cs.content_id = c.id
        LEFT JOIN users u ON c.uploaded_by = u.id
        WHERE cs.slot_id = $1
        AND c.status = 'approved'
        AND (
          (c.start_time IS NULL AND c.end_time IS NULL) OR
          (c.start_time <= CURRENT_TIMESTAMP AND (c.end_time IS NULL OR c.end_time >= CURRENT_TIMESTAMP))
        )
        ORDER BY cs.rotation_order ASC
      )
      SELECT cd.*
      FROM cumulative_durations cd, rotation_position rp
      WHERE cd.cumulative_duration > rp.position_in_cycle
      ORDER BY cd.cumulative_duration ASC
      LIMIT 1
    `;
    
    try {
      const result = await pool.query(query, [slotId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ContentSchedule;
