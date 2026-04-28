const validateRegistration = (req, res, next) => {
  const { name, email, password, role } = req.body;
  
  const errors = [];
  
  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email is required');
  }
  
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (!role || !['principal', 'teacher'].includes(role)) {
    errors.push('Role must be either "principal" or "teacher"');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors 
    });
  }
  
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  const errors = [];
  
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email is required');
  }
  
  if (!password) {
    errors.push('Password is required');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors 
    });
  }
  
  next();
};

const validateContentUpload = (req, res, next) => {
  const { title, subject, description, start_time, end_time, rotation_duration } = req.body;
  
  const errors = [];
  
  if (!title || title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  }
  
  if (!subject || subject.trim().length < 2) {
    errors.push('Subject is required');
  }
  
  if (start_time && isNaN(Date.parse(start_time))) {
    errors.push('Invalid start_time format');
  }
  
  if (end_time && isNaN(Date.parse(end_time))) {
    errors.push('Invalid end_time format');
  }
  
  if (start_time && end_time && new Date(start_time) >= new Date(end_time)) {
    errors.push('end_time must be after start_time');
  }
  
  if (rotation_duration && (isNaN(rotation_duration) || rotation_duration <= 0)) {
    errors.push('rotation_duration must be a positive number');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors 
    });
  }
  
  next();
};

const validateContentApproval = (req, res, next) => {
  const { status, rejection_reason } = req.body;
  
  const errors = [];
  
  if (!status || !['approved', 'rejected'].includes(status)) {
    errors.push('Status must be either "approved" or "rejected"');
  }
  
  if (status === 'rejected' && (!rejection_reason || rejection_reason.trim().length < 5)) {
    errors.push('Rejection reason must be at least 5 characters long when rejecting content');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors 
    });
  }
  
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateContentUpload,
  validateContentApproval
};
