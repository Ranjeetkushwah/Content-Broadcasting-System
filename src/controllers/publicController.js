const SchedulingService = require('../services/schedulingService');
const Content = require('../models/Content');
const User = require('../models/User');

const getLiveContentByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    // Validate teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ 
        error: 'Teacher not found',
        message: 'No content available'
      });
    }

    // Get active content for this teacher
    const activeContent = await SchedulingService.getActiveContentForTeacher(teacherId);

    if (Object.keys(activeContent).length === 0) {
      return res.json({
        message: 'No content available',
        teacher: {
          id: teacher.id,
          name: teacher.name
        },
        subjects: []
      });
    }

    // Format response
    const subjects = Object.keys(activeContent).map(subject => ({
      subject,
      content: {
        id: activeContent[subject].id,
        title: activeContent[subject].title,
        description: activeContent[subject].description,
        file_url: activeContent[subject].file_url,
        file_type: activeContent[subject].file_type,
        uploaded_by: activeContent[subject].uploaded_by_name,
        start_time: activeContent[subject].start_time,
        end_time: activeContent[subject].end_time
      }
    }));

    res.json({
      message: 'Content available',
      teacher: {
        id: teacher.id,
        name: teacher.name
      },
      subjects,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get live content error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch live content',
      message: 'No content available'
    });
  }
};

const getLiveContentBySubject = async (req, res) => {
  try {
    const { subject } = req.params;
    
    // Get current active content for this subject
    const slot = await ContentSlot.findBySubject(subject);
    if (!slot) {
      return res.json({
        message: 'No content available',
        subject,
        content: null
      });
    }

    const activeContent = await SchedulingService.getCurrentActiveContent(slot.id);

    if (!activeContent) {
      return res.json({
        message: 'No content available',
        subject,
        content: null
      });
    }

    res.json({
      message: 'Content available',
      subject,
      content: {
        id: activeContent.id,
        title: activeContent.title,
        description: activeContent.description,
        file_url: activeContent.file_url,
        file_type: activeContent.file_type,
        uploaded_by: activeContent.uploaded_by_name,
        start_time: activeContent.start_time,
        end_time: activeContent.end_time
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get live content by subject error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch live content',
      message: 'No content available'
    });
  }
};

const getAllLiveContent = async (req, res) => {
  try {
    const activeSubjects = await SchedulingService.getActiveSubjects();

    if (activeSubjects.length === 0) {
      return res.json({
        message: 'No content available',
        subjects: []
      });
    }

    const subjects = activeSubjects.map(active => ({
      subject: active.subject,
      content: {
        id: active.current_content.id,
        title: active.current_content.title,
        description: active.current_content.description,
        file_url: active.current_content.file_url,
        file_type: active.current_content.file_type,
        uploaded_by: active.current_content.uploaded_by_name,
        start_time: active.current_content.start_time,
        end_time: active.current_content.end_time
      }
    }));

    res.json({
      message: 'Content available',
      subjects,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get all live content error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch live content',
      message: 'No content available'
    });
  }
};

const getSystemStatus = async (req, res) => {
  try {
    const rotationStatus = await SchedulingService.getRotationStatus();
    const contentStats = await Content.getStatusStats();

    res.json({
      system_status: 'operational',
      rotation_status: rotationStatus,
      content_statistics: contentStats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get system status error:', error);
    res.status(500).json({ 
      error: 'Failed to get system status'
    });
  }
};

module.exports = {
  getLiveContentByTeacher,
  getLiveContentBySubject,
  getAllLiveContent,
  getSystemStatus
};
