const express = require('express');
const { query, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Note = require('../models/Note');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Get productivity dashboard data
router.get('/dashboard', auth, [
  query('period').optional().isIn(['day', 'week', 'month', 'year']).withMessage('Invalid period'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { period = 'week', startDate, endDate } = req.query;
    const userId = req.user.userId;

    // Calculate date range
    let start, end;
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      end = new Date();
      switch (period) {
        case 'day':
          start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          start = new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
      }
    }

    // Get task statistics
    const taskStats = await Task.aggregate([
      {
        $match: {
          reporter: userId,
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalEstimatedTime: { $sum: { $ifNull: ['$estimatedTime', 0] } },
          totalActualTime: { $sum: { $ifNull: ['$actualTime', 0] } }
        }
      }
    ]);

    // Get note statistics
    const noteStats = await Note.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalNotes: { $sum: 1 },
          totalWords: { $sum: { $ifNull: ['$wordCount', 0] } },
          totalReads: { $sum: { $ifNull: ['$readCount', 0] } }
        }
      }
    ]);

    // Get productivity trends
    const productivityTrends = await Task.aggregate([
      {
        $match: {
          reporter: userId,
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: period === 'day' ? '%Y-%m-%d' : '%Y-%m',
              date: '$createdAt'
            }
          },
          tasksCreated: { $sum: 1 },
          tasksCompleted: {
            $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] }
          },
          totalTime: { $sum: { $ifNull: ['$actualTime', 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get category distribution
    const categoryStats = await Task.aggregate([
      {
        $match: {
          reporter: userId,
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get priority distribution
    const priorityStats = await Task.aggregate([
      {
        $match: {
          reporter: userId,
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } }
        }
      }
    ]);

    // Calculate completion rate
    const totalTasks = taskStats.reduce((sum, stat) => sum + stat.count, 0);
    const completedTasks = taskStats.find(stat => stat._id === 'done')?.count || 0;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Calculate time efficiency
    const totalEstimated = taskStats.reduce((sum, stat) => sum + stat.totalEstimatedTime, 0);
    const totalActual = taskStats.reduce((sum, stat) => sum + stat.totalActualTime, 0);
    const timeEfficiency = totalEstimated > 0 ? ((totalEstimated - totalActual) / totalEstimated) * 100 : 0;

    res.json({
      success: true,
      dashboard: {
        period,
        dateRange: { start, end },
        overview: {
          totalTasks,
          completedTasks,
          completionRate: Math.round(completionRate * 100) / 100,
          totalNotes: noteStats[0]?.totalNotes || 0,
          totalWords: noteStats[0]?.totalWords || 0,
          totalReads: noteStats[0]?.totalReads || 0
        },
        taskStats: {
          byStatus: taskStats,
          byCategory: categoryStats,
          byPriority: priorityStats,
          timeEfficiency: Math.round(timeEfficiency * 100) / 100
        },
        productivityTrends,
        noteStats: noteStats[0] || {}
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Get task analytics
router.get('/tasks', auth, [
  query('period').optional().isIn(['day', 'week', 'month', 'year']).withMessage('Invalid period')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { period = 'month' } = req.query;
    const userId = req.user.userId;

    const end = new Date();
    let start;
    switch (period) {
      case 'day':
        start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        start = new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    // Task completion trends
    const completionTrends = await Task.aggregate([
      {
        $match: {
          reporter: userId,
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: period === 'day' ? '%Y-%m-%d' : '%Y-%m',
              date: '$createdAt'
            }
          },
          created: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Time tracking analytics
    const timeAnalytics = await Task.aggregate([
      {
        $match: {
          reporter: userId,
          createdAt: { $gte: start, $lte: end },
          actualTime: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          totalActualTime: { $sum: '$actualTime' },
          totalEstimatedTime: { $sum: { $ifNull: ['$estimatedTime', 0] } },
          averageActualTime: { $avg: '$actualTime' },
          averageEstimatedTime: { $avg: { $ifNull: ['$estimatedTime', 0] } }
        }
      }
    ]);

    // Priority performance
    const priorityPerformance = await Task.aggregate([
      {
        $match: {
          reporter: userId,
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$priority',
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] }
          },
          overdue: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$dueDate', new Date()] }, { $ne: ['$status', 'done'] }] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      taskAnalytics: {
        period,
        completionTrends,
        timeAnalytics: timeAnalytics[0] || {},
        priorityPerformance
      }
    });
  } catch (error) {
    console.error('Task analytics error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Get note analytics
router.get('/notes', auth, [
  query('period').optional().isIn(['day', 'week', 'month', 'year']).withMessage('Invalid period')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { period = 'month' } = req.query;
    const userId = req.user.userId;

    const end = new Date();
    let start;
    switch (period) {
      case 'day':
        start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        start = new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    // Note creation trends
    const creationTrends = await Note.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: period === 'day' ? '%Y-%m-%d' : '%Y-%m',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 },
          totalWords: { $sum: { $ifNull: ['$wordCount', 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Category distribution
    const categoryDistribution = await Note.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalWords: { $sum: { $ifNull: ['$wordCount', 0] } },
          averageWords: { $avg: { $ifNull: ['$wordCount', 0] } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Content type distribution
    const contentTypeDistribution = await Note.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$contentType',
          count: { $sum: 1 },
          totalWords: { $sum: { $ifNull: ['$wordCount', 0] } }
        }
      }
    ]);

    // Popular tags
    const popularTags = await Note.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: start, $lte: end },
          tags: { $exists: true, $ne: [] }
        }
      },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      noteAnalytics: {
        period,
        creationTrends,
        categoryDistribution,
        contentTypeDistribution,
        popularTags
      }
    });
  } catch (error) {
    console.error('Note analytics error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Get user productivity insights
router.get('/insights', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Weekly vs monthly comparison
    const weeklyStats = await Task.aggregate([
      {
        $match: {
          reporter: userId,
          createdAt: { $gte: weekAgo, $lte: now }
        }
      },
      {
        $group: {
          _id: null,
          tasksCreated: { $sum: 1 },
          tasksCompleted: {
            $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] }
          },
          totalTime: { $sum: { $ifNull: ['$actualTime', 0] } }
        }
      }
    ]);

    const monthlyStats = await Task.aggregate([
      {
        $match: {
          reporter: userId,
          createdAt: { $gte: monthAgo, $lte: now }
        }
      },
      {
        $group: {
          _id: null,
          tasksCreated: { $sum: 1 },
          tasksCompleted: {
            $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] }
          },
          totalTime: { $sum: { $ifNull: ['$actualTime', 0] } }
        }
      }
    ]);

    // Overdue tasks
    const overdueTasks = await Task.countDocuments({
      reporter: userId,
      dueDate: { $lt: now },
      status: { $ne: 'done' }
    });

    // Upcoming deadlines
    const upcomingDeadlines = await Task.find({
      reporter: userId,
      dueDate: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
      status: { $ne: 'done' }
    })
    .select('title dueDate priority')
    .sort('dueDate')
    .limit(5);

    // Productivity score calculation
    const weekly = weeklyStats[0] || {};
    const monthly = monthlyStats[0] || {};
    
    let productivityScore = 0;
    if (weekly.tasksCreated > 0) {
      const completionRate = (weekly.tasksCompleted / weekly.tasksCreated) * 100;
      const timeEfficiency = weekly.totalTime > 0 ? 100 : 50;
      productivityScore = (completionRate + timeEfficiency) / 2;
    }

    // Generate insights
    const insights = [];
    
    if (overdueTasks > 0) {
      insights.push({
        type: 'warning',
        message: `You have ${overdueTasks} overdue task${overdueTasks > 1 ? 's' : ''}. Consider reviewing your priorities.`
      });
    }

    if (weekly.tasksCreated > 0 && weekly.tasksCompleted / weekly.tasksCreated < 0.5) {
      insights.push({
        type: 'info',
        message: 'Your task completion rate is below 50% this week. Consider breaking down complex tasks into smaller ones.'
      });
    }

    if (upcomingDeadlines.length > 0) {
      insights.push({
        type: 'info',
        message: `You have ${upcomingDeadlines.length} upcoming deadline${upcomingDeadlines.length > 1 ? 's' : ''} this week.`
      });
    }

    res.json({
      success: true,
      insights: {
        productivityScore: Math.round(productivityScore),
        weeklyStats: weekly,
        monthlyStats: monthly,
        overdueTasks,
        upcomingDeadlines,
        recommendations: insights
      }
    });
  } catch (error) {
    console.error('Productivity insights error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

module.exports = router;
