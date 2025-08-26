const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'review', 'done', 'archived'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  estimatedTime: {
    type: Number, // in minutes
    min: 0
  },
  actualTime: {
    type: Number, // in minutes
    min: 0
  },
  // Advanced features
  subtasks: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  dependencies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  tags: [{
    type: String,
    trim: true
  }],
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Kanban board support
  column: {
    type: String,
    default: 'todo'
  },
  position: {
    type: Number,
    default: 0
  },
  // Time tracking
  timeEntries: [{
    startTime: {
      type: Date,
      required: true
    },
    endTime: Date,
    description: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  // Recurring tasks
  recurring: {
    enabled: {
      type: Boolean,
      default: false
    },
    pattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      default: 'weekly'
    },
    interval: {
      type: Number,
      default: 1
    },
    nextDue: Date
  },
  // Attachments and links
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String
  }],
  links: [{
    title: String,
    url: String,
    description: String
  }],
  // Comments and activity
  comments: [{
    text: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Progress tracking
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  // Custom fields (for future extensibility)
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for better performance
taskSchema.index({ status: 1, dueDate: 1 });
taskSchema.index({ assignee: 1, status: 1 });
taskSchema.index({ tags: 1 });
taskSchema.index({ 'recurring.enabled': 1, 'recurring.nextDue': 1 });

// Virtual for completion status
taskSchema.virtual('isCompleted').get(function() {
  return this.status === 'done';
});

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.isCompleted) return false;
  return new Date() > this.dueDate;
});

// Virtual for completion percentage based on subtasks
taskSchema.virtual('subtaskProgress').get(function() {
  if (!this.subtasks || this.subtasks.length === 0) return 0;
  const completed = this.subtasks.filter(subtask => subtask.completed).length;
  return Math.round((completed / this.subtasks.length) * 100);
});

// Method to add subtask
taskSchema.methods.addSubtask = function(title) {
  this.subtasks.push({ title });
  this.progress = this.subtaskProgress;
  return this.save();
};

// Method to complete subtask
taskSchema.methods.completeSubtask = function(subtaskId) {
  const subtask = this.subtasks.id(subtaskId);
  if (subtask) {
    subtask.completed = true;
    subtask.completedAt = new Date();
    this.progress = this.subtaskProgress;
    return this.save();
  }
  throw new Error('Subtask not found');
};

// Method to start time tracking
taskSchema.methods.startTimer = function(userId, description = '') {
  this.timeEntries.push({
    startTime: new Date(),
    userId,
    description
  });
  return this.save();
};

// Method to stop time tracking
taskSchema.methods.stopTimer = function() {
  const activeEntry = this.timeEntries.find(entry => !entry.endTime);
  if (activeEntry) {
    activeEntry.endTime = new Date();
    const duration = (activeEntry.endTime - activeEntry.startTime) / (1000 * 60); // in minutes
    this.actualTime = (this.actualTime || 0) + duration;
    return this.save();
  }
  throw new Error('No active timer found');
};

// Method to mark as complete
taskSchema.methods.markComplete = function() {
  this.status = 'done';
  this.completedAt = new Date();
  this.progress = 100;
  
  // Stop any active timers
  const activeEntry = this.timeEntries.find(entry => !entry.endTime);
  if (activeEntry) {
    activeEntry.endTime = new Date();
    const duration = (activeEntry.endTime - activeEntry.startTime) / (1000 * 60);
    this.actualTime = (this.actualTime || 0) + duration;
  }
  
  return this.save();
};

// Method to add comment
taskSchema.methods.addComment = function(text, userId) {
  this.comments.push({ text, userId });
  return this.save();
};

// Pre-save middleware to update progress
taskSchema.pre('save', function(next) {
  // Update progress based on subtasks if they exist
  if (this.subtasks && this.subtasks.length > 0) {
    this.progress = this.subtaskProgress;
  }
  
  // Update status based on progress
  if (this.progress === 100 && this.status !== 'done') {
    this.status = 'done';
    this.completedAt = new Date();
  }
  
  next();
});

module.exports = mongoose.model('Task', taskSchema);
