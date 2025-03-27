/**
 * Comment routes
 */
const express = require('express');
const { CommentModel } = require('../models');
const pool = require('../config/database');
const { authenticate, authorizeCommentAccess } = require('../middleware/auth');

const router = express.Router();
const commentModel = new CommentModel(pool);

/**
 * @route   PUT /comments/:id
 * @desc    Update a comment
 * @access  Comment owner or tenant admin
 */
router.put('/:id', authenticate, authorizeCommentAccess, async (req, res) => {
  try {
    const comment = await commentModel.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // Only the comment owner or admin can update
    if (comment.user_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ error: 'Not authorized to update this comment' });
    }
    
    const updatedComment = await commentModel.update(req.params.id, req.body);
    res.json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   DELETE /comments/:id
 * @desc    Delete a comment
 * @access  Comment owner or tenant admin
 */
router.delete('/:id', authenticate, authorizeCommentAccess, async (req, res) => {
  try {
    const comment = await commentModel.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // Only the comment owner or admin can delete
    if (comment.user_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }
    
    await commentModel.delete(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 