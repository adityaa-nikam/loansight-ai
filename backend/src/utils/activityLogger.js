const Activity = require('../models/Activity');

/**
 * Log an activity event on an application.
 * @param {string} applicationId - The application ObjectId
 * @param {string|null} actorId - The user who performed the action (null for system)
 * @param {string} action - Short description of the action
 * @param {object} details - Additional context (e.g. { from: 'draft', to: 'submitted' })
 */
const logActivity = async (applicationId, actorId, action, details = {}) => {
  try {
    await Activity.create({
      application: applicationId,
      actor: actorId || null,
      action,
      details,
    });
  } catch (error) {
    // Activity logging should never break the main flow
    console.error('Failed to log activity:', error.message);
  }
};

module.exports = { logActivity };
