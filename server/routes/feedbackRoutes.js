/**
 * Feedback routes
 */
const express = require('express');
const { FeedbackModel, CommentModel } = require('../models');
const pool = require('../config/database');
const { authenticate, authorizeFeedbackAccess } = require('../middleware/auth');

const router = express.Router();
const feedbackModel = new FeedbackModel(pool);
const commentModel = new CommentModel(pool);

/**
 * @route   GET /feedback/:id
 * @desc    Get feedback by ID
 * @access  Feedback owner, initiative owner, goal owner, team members, or tenant admin
 */
router.get('/:id', authenticate, authorizeFeedbackAccess, async (req, res) => {
  try {
    const feedback = await feedbackModel.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    // Get comments for this feedback
    const comments = await commentModel.findByFeedbackId(req.params.id);
    
    // Combine feedback with comments
    const fullFeedback = {
      ...feedback,
      comments
    };
    
    res.json(fullFeedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   PUT /feedback/:id
 * @desc    Update feedback
 * @access  Feedback owner or tenant admin
 */
router.put('/:id', authenticate, authorizeFeedbackAccess, async (req, res) => {
  try {
    const feedback = await feedbackModel.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    // Only the feedback owner or admin can update
    if (feedback.user_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ error: 'Not authorized to update this feedback' });
    }
    
    const updatedFeedback = await feedbackModel.update(req.params.id, req.body);
    res.json(updatedFeedback);
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   DELETE /feedback/:id
 * @desc    Delete feedback
 * @access  Feedback owner or tenant admin
 */
router.delete('/:id', authenticate, authorizeFeedbackAccess, async (req, res) => {
  try {
    const feedback = await feedbackModel.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    // Only the feedback owner or admin can delete
    if (feedback.user_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ error: 'Not authorized to delete this feedback' });
    }
    
    await feedbackModel.delete(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /feedback/:id/comments
 * @desc    Add a comment to feedback
 * @access  Initiative owner, goal owner, team members, or tenant admin
 */
router.post('/:id/comments', authenticate, authorizeFeedbackAccess, async (req, res) => {
  try {
    const feedback = await feedbackModel.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    const commentData = {
      ...req.body,
      entity_type: 'feedback',
      entity_id: req.params.id,
      user_id: req.user.id
    };
    
    // Validate required fields
    if (!commentData.content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const newComment = await commentModel.createComment(commentData);
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;