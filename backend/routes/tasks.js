const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Get all tasks with advanced filtering and pagination
router.get('/', auth, [
  query('status').optional().isIn(['todo', 'in-progress', 'review', 'done', 'archived']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  query('assignee').optional().isMongoId(),
  query('tags').optional().isString(),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sortBy').optional().isIn(['createdAt', 'dueDate', 'priority', 'title', 'status']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const {
      status,
      priority,
      assignee,
      tags,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { reporter: req.user.userId };
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const tasks = await Task.find(filter)
      .populate('assignee', 'username email')
      .populate('dependencies', 'title status')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(filter);

    res.json({
      success: true,
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Get tasks for Kanban board
router.get('/kanban', auth, async (req, res) => {
  try {
    const columns = ['todo', 'in-progress', 'review', 'done'];
    const kanbanData = {};

    for (const column of columns) {
      const tasks = await Task.find({ 
        reporter: req.user.userId,
        column: column 
      })
      .populate('assignee', 'username email')
      .sort('position')
      .select('title description priority dueDate assignee tags progress estimatedTime actualTime');

      kanbanData[column] = tasks;
    }

    res.json({
      success: true,
      kanban: kanbanData
    });
  } catch (error) {
    console.error('Get kanban error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Create new task
router.post('/', auth, [
  body('title').isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('description').optional().isLength({ max: 2000 }).withMessage('Description too long'),
  body('status').optional().isIn(['todo', 'in-progress', 'review', 'done', 'archived']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date'),
  body('estimatedTime').optional().isInt({ min: 0 }).withMessage('Estimated time must be positive'),
  body('tags').optional().isArray(),
  body('assignee').optional().isMongoId().withMessage('Invalid assignee ID'),
  body('dependencies').optional().isArray(),
  body('column').optional().isIn(['todo', 'in-progress', 'review', 'done'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const taskData = {
      ...req.body,
      reporter: req.user.userId
    };

    // Set default column if not specified
    if (!taskData.column) {
      taskData.column = taskData.status || 'todo';
    }

    const task = new Task(taskData);
    await task.save();

    await task.populate('assignee', 'username email');
    await task.populate('dependencies', 'title status');

    res.status(201).json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Get single task
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id,
      reporter: req.user.userId 
    })
    .populate('assignee', 'username email')
    .populate('dependencies', 'title status')
    .populate('comments.userId', 'username');

    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Update task
router.put('/:id', auth, [
  body('title').optional().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('description').optional().isLength({ max: 2000 }).withMessage('Description too long'),
  body('status').optional().isIn(['todo', 'in-progress', 'review', 'done', 'archived']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date'),
  body('estimatedTime').optional().isInt({ min: 0 }).withMessage('Estimated time must be positive'),
  body('tags').optional().isArray(),
  body('assignee').optional().isMongoId().withMessage('Invalid assignee ID'),
  body('dependencies').optional().isArray(),
  body('column').optional().isIn(['todo', 'in-progress', 'review', 'done'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, reporter: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    )
    .populate('assignee', 'username email')
    .populate('dependencies', 'title status');

    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Update task position (for Kanban drag & drop)
router.patch('/:id/position', auth, [
  body('column').isIn(['todo', 'in-progress', 'review', 'done']).withMessage('Invalid column'),
  body('position').isInt({ min: 0 }).withMessage('Position must be non-negative')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { column, position } = req.body;
    
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, reporter: req.user.userId },
      { column, position },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Update position error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Add subtask
router.post('/:id/subtasks', auth, [
  body('title').isLength({ min: 1, max: 200 }).withMessage('Subtask title must be between 1 and 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const task = await Task.findOne({ 
      _id: req.params.id,
      reporter: req.user.userId 
    });

    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }

    await task.addSubtask(req.body.title);
    await task.populate('assignee', 'username email');

    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Add subtask error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Complete subtask
router.patch('/:id/subtasks/:subtaskId/complete', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id,
      reporter: req.user.userId 
    });

    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }

    await task.completeSubtask(req.params.subtaskId);
    await task.populate('assignee', 'username email');

    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Complete subtask error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Start time tracking
router.post('/:id/start-timer', auth, [
  body('description').optional().isString()
], async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id,
      reporter: req.user.userId 
    });

    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }

    await task.startTimer(req.user.userId, req.body.description);

    res.json({
      success: true,
      message: 'Timer started successfully'
    });
  } catch (error) {
    console.error('Start timer error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Stop time tracking
router.post('/:id/stop-timer', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id,
      reporter: req.user.userId 
    });

    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }

    await task.stopTimer();

    res.json({
      success: true,
      message: 'Timer stopped successfully'
    });
  } catch (error) {
    console.error('Stop timer error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Add comment
router.post('/:id/comments', auth, [
  body('text').isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const task = await Task.findOne({ 
      _id: req.params.id,
      reporter: req.user.userId 
    });

    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }

    await task.addComment(req.body.text, req.user.userId);
    await task.populate('comments.userId', 'username');

    res.json({
      success: true,
      comment: task.comments[task.comments.length - 1]
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Mark task as complete
router.patch('/:id/complete', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id,
      reporter: req.user.userId 
    });

    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }

    await task.markComplete();
    await task.populate('assignee', 'username email');

    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ 
      _id: req.params.id,
      reporter: req.user.userId 
    });

    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

module.exports = router;
