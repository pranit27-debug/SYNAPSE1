const express = require('express');
const { body, validationResult } = require('express-validator');
const Note = require('../models/Note');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all notes for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;
    let query = { user: req.user.userId };

    // Add search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Add category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    const notes = await Note.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Note.countDocuments(query);

    res.json({
      success: true,
      notes,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
        limit: parseInt(limit)
      }
    });
      } catch (error) {
      console.error('Get notes error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error' 
      });
    }
});

// Get single note
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ 
      _id: req.params.id, 
      user: req.user.userId 
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({
      success: true,
      note
    });
      } catch (error) {
      console.error('Get note error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error' 
      });
    }
});

// Create new note
router.post('/', [
  auth,
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, tags, category, isPinned } = req.body;

    const note = new Note({
      title,
      content,
      tags: tags || [],
      category: category || 'General',
      isPinned: isPinned || false,
      user: req.user.userId
    });

    await note.save();
    res.status(201).json({
      success: true,
      note
    });
      } catch (error) {
      console.error('Create note error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error' 
      });
    }
});

// Update note
router.put('/:id', [
  auth,
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, tags, category, isPinned } = req.body;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, content, tags, category, isPinned },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({
      success: true,
      note
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete note
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user.userId 
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
