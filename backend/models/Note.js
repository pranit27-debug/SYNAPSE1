const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 50000 // Support for rich text content
  },
  // Enhanced categorization
  category: {
    type: String,
    trim: true,
    default: 'General'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  // Rich text and formatting
  contentType: {
    type: String,
    enum: ['text', 'markdown', 'html', 'rich-text'],
    default: 'text'
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  // Collaboration features
  isShared: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['read', 'write', 'admin'],
      default: 'read'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Version control
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    content: String,
    contentType: String,
    modifiedAt: Date,
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  // Attachments and media
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Links and references
  links: [{
    title: String,
    url: String,
    description: String,
    type: {
      type: String,
      enum: ['web', 'file', 'note', 'task'],
      default: 'web'
    }
  }],
  // Comments and discussions
  comments: [{
    text: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    replies: [{
      text: String,
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  // Metadata and analytics
  wordCount: {
    type: Number,
    default: 0
  },
  readCount: {
    type: Number,
    default: 0
  },
  lastReadAt: Date,
  // Custom fields for extensibility
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  // User reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
noteSchema.index({ user: 1, isArchived: 1, isPinned: 1 });
noteSchema.index({ user: 1, category: 1 });
noteSchema.index({ user: 1, tags: 1 });
noteSchema.index({ 'sharedWith.userId': 1 });
noteSchema.index({ title: 'text', content: 'text' }); // Text search index

// Virtual for excerpt
noteSchema.virtual('excerpt').get(function() {
  if (!this.content) return '';
  return this.content.length > 150 ? this.content.substring(0, 150) + '...' : this.content;
});

// Virtual for reading time
noteSchema.virtual('readingTime').get(function() {
  if (!this.wordCount) return 0;
  const wordsPerMinute = 200;
  return Math.ceil(this.wordCount / wordsPerMinute);
});

// Method to add comment
noteSchema.methods.addComment = function(text, userId) {
  this.comments.push({ text, userId });
  return this.save();
};

// Method to add reply to comment
noteSchema.methods.addReply = function(commentId, text, userId) {
  const comment = this.comments.id(commentId);
  if (comment) {
    comment.replies.push({ text, userId });
    return this.save();
  }
  throw new Error('Comment not found');
};

// Method to share note
noteSchema.methods.shareWith = function(userId, permission = 'read') {
  const existingShare = this.sharedWith.find(share => share.userId.toString() === userId.toString());
  
  if (existingShare) {
    existingShare.permission = permission;
  } else {
    this.sharedWith.push({ userId, permission });
  }
  
  this.isShared = true;
  return this.save();
};

// Method to remove share
noteSchema.methods.removeShare = function(userId) {
  this.sharedWith = this.sharedWith.filter(share => share.userId.toString() !== userId.toString());
  
  if (this.sharedWith.length === 0) {
    this.isShared = false;
  }
  
  return this.save();
};

// Method to create new version
noteSchema.methods.createVersion = function(userId) {
  // Save current content as previous version
  this.previousVersions.push({
    content: this.content,
    contentType: this.contentType,
    modifiedAt: new Date(),
    modifiedBy: userId
  });
  
  // Increment version number
  this.version += 1;
  
  return this.save();
};

// Method to add attachment
noteSchema.methods.addAttachment = function(attachmentData) {
  this.attachments.push(attachmentData);
  return this.save();
};

// Method to remove attachment
noteSchema.methods.removeAttachment = function(filename) {
  this.attachments = this.attachments.filter(att => att.filename !== filename);
  return this.save();
};

// Method to add link
noteSchema.methods.addLink = function(linkData) {
  this.links.push(linkData);
  return this.save();
};

// Method to increment read count
noteSchema.methods.incrementReadCount = function() {
  this.readCount += 1;
  this.lastReadAt = new Date();
  return this.save();
};

// Pre-save middleware to update word count
noteSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // Simple word count (split by whitespace)
    this.wordCount = this.content.trim().split(/\s+/).filter(word => word.length > 0).length;
  }
  next();
});

// Static method to search notes
noteSchema.statics.search = function(userId, query, options = {}) {
  const searchQuery = {
    $and: [
      { user: userId },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      }
    ]
  };

  if (options.category) {
    searchQuery.$and.push({ category: options.category });
  }

  if (options.tags && options.tags.length > 0) {
    searchQuery.$and.push({ tags: { $in: options.tags } });
  }

  if (options.isArchived !== undefined) {
    searchQuery.$and.push({ isArchived: options.isArchived });
  }

  return this.find(searchQuery)
    .sort(options.sortBy || { isPinned: -1, updatedAt: -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

// Static method to get shared notes
noteSchema.statics.getSharedWithUser = function(userId) {
  return this.find({
    'sharedWith.userId': userId,
    isArchived: false
  }).populate('user', 'username email');
};

module.exports = mongoose.model('Note', noteSchema);
