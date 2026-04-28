const Content = require('../models/Content');
const ContentSlot = require('../models/ContentSlot');
const ContentSchedule = require('../models/ContentSchedule');
const { getFileInfo } = require('../middlewares/fileUpload');

const uploadContent = async (req, res) => {
  try {
    const { title, subject, description, start_time, end_time, rotation_duration } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileInfo = getFileInfo(req.file);
    
    // Create or get content slot for the subject
    let slot = await ContentSlot.findBySubject(subject);
    if (!slot) {
      slot = await ContentSlot.create(subject);
    }
    
    // Create content record
    const content = await Content.create({
      title,
      description,
      subject,
      file_url: fileInfo.url,
      file_type: fileInfo.mimetype.split('/')[1],
      file_size: fileInfo.size,
      uploaded_by: req.user.id,
      start_time: start_time ? new Date(start_time) : null,
      end_time: end_time ? new Date(end_time) : null
    });
    
    // Create schedule entry if rotation duration is provided
    if (rotation_duration) {
      // Get the current max rotation order for this slot
      const existingSchedules = await ContentSchedule.findBySlot(slot.id);
      const maxOrder = existingSchedules.length > 0 
        ? Math.max(...existingSchedules.map(s => s.rotation_order))
        : 0;
      
      await ContentSchedule.create({
        content_id: content.id,
        slot_id: slot.id,
        rotation_order: maxOrder + 1,
        duration: parseInt(rotation_duration)
      });
    }
    
    res.status(201).json({
      message: 'Content uploaded successfully',
      content: {
        id: content.id,
        title: content.title,
        subject: content.subject,
        description: content.description,
        file_url: content.file_url,
        file_type: content.file_type,
        file_size: content.file_size,
        status: content.status,
        start_time: content.start_time,
        end_time: content.end_time,
        created_at: content.created_at
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload content' });
  }
};

const updateContentSchedule = async (req, res) => {
  try {
    const { contentId } = req.params;
    const { rotation_duration } = req.body;
    
    // Check if content exists and belongs to the user
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    if (content.uploaded_by !== req.user.id) {
      return res.status(403).json({ error: 'You can only modify your own content' });
    }
    
    // Get or create content slot
    let slot = await ContentSlot.findBySubject(content.subject);
    if (!slot) {
      slot = await ContentSlot.create(content.subject);
    }
    
    // Check if schedule already exists
    const existingSchedule = await ContentSchedule.findByContent(contentId);
    
    if (existingSchedule) {
      // Update existing schedule
      await ContentSchedule.updateRotationOrder(contentId, existingSchedule.rotation_order);
    } else {
      // Create new schedule
      const existingSchedules = await ContentSchedule.findBySlot(slot.id);
      const maxOrder = existingSchedules.length > 0 
        ? Math.max(...existingSchedules.map(s => s.rotation_order))
        : 0;
      
      await ContentSchedule.create({
        content_id: contentId,
        slot_id: slot.id,
        rotation_order: maxOrder + 1,
        duration: parseInt(rotation_duration)
      });
    }
    
    res.json({
      message: 'Content schedule updated successfully'
    });
  } catch (error) {
    console.error('Schedule update error:', error);
    res.status(500).json({ error: 'Failed to update content schedule' });
  }
};

module.exports = {
  uploadContent,
  updateContentSchedule
};
