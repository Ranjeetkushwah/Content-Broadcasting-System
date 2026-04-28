const Content = require('../models/Content');
const ContentSchedule = require('../models/ContentSchedule');
const { deleteUploadedFile } = require('../middlewares/fileUpload');

const getAllContent = async (req, res) => {
  try {
    const { status, subject, teacher_id } = req.query;
    
    let content;
    if (teacher_id) {
      // Teachers can only see their own content, principals can see all
      if (req.user.role === 'teacher' && parseInt(teacher_id) !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      content = await Content.findByTeacher(teacher_id, status);
    } else {
      // Principals can see all content
      if (req.user.role !== 'principal') {
        return res.status(403).json({ error: 'Access denied' });
      }
      content = await Content.findAll(status, subject);
    }
    
    res.json({
      content,
      count: content.length
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
};

const getContentById = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await Content.findById(id);
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    // Check permissions
    if (req.user.role === 'teacher' && content.uploaded_by !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({ content });
  } catch (error) {
    console.error('Get content by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
};

const getMyContent = async (req, res) => {
  try {
    const { status } = req.query;
    const content = await Content.findByTeacher(req.user.id, status);
    
    res.json({
      content,
      count: content.length
    });
  } catch (error) {
    console.error('Get my content error:', error);
    res.status(500).json({ error: 'Failed to fetch your content' });
  }
};

const updateContentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;
    
    const content = await Content.findById(id);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    // Update content status
    const updatedContent = await Content.updateStatus(
      id, 
      status, 
      req.user.id, 
      rejection_reason
    );
    
    res.json({
      message: `Content ${status} successfully`,
      content: updatedContent
    });
  } catch (error) {
    console.error('Update content status error:', error);
    res.status(500).json({ error: 'Failed to update content status' });
  }
};

const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const content = await Content.findById(id);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    // Check permissions
    if (req.user.role === 'teacher' && content.uploaded_by !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Only allow deletion of uploaded or rejected content
    if (content.status === 'approved') {
      return res.status(400).json({ 
        error: 'Cannot delete approved content. Please reject it first.' 
      });
    }
    
    // Delete the file
    const fileName = content.file_url.replace('/uploads/', '');
    deleteUploadedFile(fileName);
    
    // Delete content record
    const deletedContent = await Content.delete(id);
    
    res.json({
      message: 'Content deleted successfully',
      content: deletedContent
    });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ error: 'Failed to delete content' });
  }
};

const getPendingContent = async (req, res) => {
  try {
    const content = await Content.findAll('pending');
    
    res.json({
      content,
      count: content.length
    });
  } catch (error) {
    console.error('Get pending content error:', error);
    res.status(500).json({ error: 'Failed to fetch pending content' });
  }
};

const getContentStats = async (req, res) => {
  try {
    const stats = await Content.getStatusStats();
    
    res.json({
      stats
    });
  } catch (error) {
    console.error('Get content stats error:', error);
    res.status(500).json({ error: 'Failed to fetch content statistics' });
  }
};

module.exports = {
  getAllContent,
  getContentById,
  getMyContent,
  updateContentStatus,
  deleteContent,
  getPendingContent,
  getContentStats
};
