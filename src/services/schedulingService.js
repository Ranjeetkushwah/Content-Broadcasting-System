const ContentSchedule = require('../models/ContentSchedule');
const ContentSlot = require('../models/ContentSlot');
const Content = require('../models/Content');

class SchedulingService {
  /**
   * Get the currently active content for a specific subject slot
   * This implements the rotation logic based on time
   */
  static async getCurrentActiveContent(slotId) {
    try {
      const activeContent = await ContentSchedule.getCurrentActiveContent(slotId);
      return activeContent;
    } catch (error) {
      console.error('Error getting current active content:', error);
      throw error;
    }
  }

  /**
   * Get all active content for a specific teacher
   * This respects scheduling rules and time windows
   */
  static async getActiveContentForTeacher(teacherId) {
    try {
      const approvedContent = await Content.getApprovedContentForBroadcast(teacherId);
      
      // Filter content based on scheduling and time windows
      const activeContent = approvedContent.filter(content => {
        // Check if content is within its scheduled time window
        if (content.start_time && content.end_time) {
          const now = new Date();
          const startTime = new Date(content.start_time);
          const endTime = new Date(content.end_time);
          
          return now >= startTime && now <= endTime;
        }
        
        // If no time window specified, content is always active
        return true;
      });

      // Group content by subject for rotation
      const contentBySubject = {};
      activeContent.forEach(content => {
        if (!contentBySubject[content.subject]) {
          contentBySubject[content.subject] = [];
        }
        contentBySubject[content.subject].push(content);
      });

      // For each subject, determine which content should be currently active
      const result = {};
      for (const subject in contentBySubject) {
        const subjectContents = contentBySubject[subject];
        
        // If only one content for this subject, it's always active
        if (subjectContents.length === 1) {
          result[subject] = subjectContents[0];
        } else {
          // Multiple contents - implement rotation
          const activeContent = this.determineRotatingContent(subjectContents);
          if (activeContent) {
            result[subject] = activeContent;
          }
        }
      }

      return result;
    } catch (error) {
      console.error('Error getting active content for teacher:', error);
      throw error;
    }
  }

  /**
   * Determine which content should be active based on rotation logic
   */
  static determineRotatingContent(contents) {
    if (!contents || contents.length === 0) {
      return null;
    }

    // Sort contents by creation time for consistent rotation
    contents.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    // Calculate total rotation duration (default 5 minutes per content if not specified)
    const totalDuration = contents.reduce((sum, content) => {
      return sum + (content.rotation_duration || 5);
    }, 0);

    // Get current time in minutes since epoch
    const now = new Date();
    const currentMinutes = Math.floor(now.getTime() / (1000 * 60));

    // Calculate position in rotation cycle
    const positionInCycle = currentMinutes % totalDuration;

    // Find which content should be active based on cumulative duration
    let cumulativeDuration = 0;
    for (const content of contents) {
      const contentDuration = content.rotation_duration || 5;
      
      if (positionInCycle < cumulativeDuration + contentDuration) {
        return content;
      }
      
      cumulativeDuration += contentDuration;
    }

    // Fallback to first content
    return contents[0];
  }

  /**
   * Get the next content in rotation for a specific subject
   */
  static async getNextContentForSubject(subject, currentContentId = null) {
    try {
      const slot = await ContentSlot.findBySubject(subject);
      if (!slot) {
        return null;
      }

      const nextContent = await ContentSchedule.getNextActiveContent(slot.id, currentContentId);
      return nextContent;
    } catch (error) {
      console.error('Error getting next content for subject:', error);
      throw error;
    }
  }

  /**
   * Get all subjects with active content
   */
  static async getActiveSubjects() {
    try {
      const slots = await ContentSlot.findAll();
      const activeSubjects = [];

      for (const slot of slots) {
        const activeContent = await this.getCurrentActiveContent(slot.id);
        if (activeContent) {
          activeSubjects.push({
            subject: slot.subject,
            slot_id: slot.id,
            current_content: activeContent
          });
        }
      }

      return activeSubjects;
    } catch (error) {
      console.error('Error getting active subjects:', error);
      throw error;
    }
  }

  /**
   * Check if content is currently within its scheduled time window
   */
  static isContentInTimeWindow(content) {
    if (!content.start_time && !content.end_time) {
      return true; // No time window specified
    }

    const now = new Date();
    
    if (content.start_time && content.end_time) {
      const startTime = new Date(content.start_time);
      const endTime = new Date(content.end_time);
      return now >= startTime && now <= endTime;
    }

    if (content.start_time && !content.end_time) {
      const startTime = new Date(content.start_time);
      return now >= startTime;
    }

    if (!content.start_time && content.end_time) {
      const endTime = new Date(content.end_time);
      return now <= endTime;
    }

    return false;
  }

  /**
   * Get content rotation status for debugging/monitoring
   */
  static async getRotationStatus() {
    try {
      const slots = await ContentSlot.findAll();
      const status = [];

      for (const slot of slots) {
        const activeContent = await this.getCurrentActiveContent(slot.id);
        const allActiveContent = await ContentSchedule.getActiveContentForSlot(slot.id);

        status.push({
          subject: slot.subject,
          slot_id: slot.id,
          current_active_content: activeContent,
          total_active_contents: allActiveContent.length,
          rotation_cycle_minutes: allActiveContent.reduce((sum, content) => sum + content.duration, 0)
        });
      }

      return status;
    } catch (error) {
      console.error('Error getting rotation status:', error);
      throw error;
    }
  }
}

module.exports = SchedulingService;
