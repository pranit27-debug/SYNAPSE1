const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Task = require('../models/Task');
const Note = require('../models/Note');
require('dotenv').config();

const { logInfo, logError } = require('./logger');

// Sample data
const sampleUsers = [
  {
    username: 'admin',
    email: 'admin@synapse.com',
    password: 'admin123',
    preferences: {
      theme: 'dark',
      notifications: true,
      language: 'en'
    }
  },
  {
    username: 'demo',
    email: 'demo@synapse.com',
    password: 'demo123',
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'en'
    }
  }
];

const sampleTasks = [
  {
    title: 'Complete Project Setup',
    description: 'Finish setting up the Synapse project with all features',
    status: 'in-progress',
    priority: 'high',
    category: 'Development',
    tags: ['setup', 'project', 'development'],
    estimatedTime: 120,
    column: 'in-progress',
    position: 0
  },
  {
    title: 'Review Code Quality',
    description: 'Perform code review and ensure best practices',
    status: 'todo',
    priority: 'medium',
    category: 'Development',
    tags: ['code-review', 'quality', 'development'],
    estimatedTime: 60,
    column: 'todo',
    position: 0
  },
  {
    title: 'Write Documentation',
    description: 'Create comprehensive API and user documentation',
    status: 'todo',
    priority: 'medium',
    category: 'Documentation',
    tags: ['docs', 'api', 'user-guide'],
    estimatedTime: 180,
    column: 'todo',
    position: 1
  }
];

const sampleNotes = [
  {
    title: 'Project Overview',
    content: 'Synapse is a comprehensive productivity application with advanced features including MFA, analytics, and collaboration tools.',
    category: 'Project',
    tags: ['overview', 'synapse', 'productivity'],
    contentType: 'markdown',
    isPinned: true
  },
  {
    title: 'Development Notes',
    content: 'Key development decisions and architecture choices for the Synapse project.',
    category: 'Development',
    tags: ['development', 'architecture', 'decisions'],
    contentType: 'text'
  }
];

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/synapse', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logInfo('MongoDB connected for seeding');
  } catch (error) {
    logError('MongoDB connection error', error);
    process.exit(1);
  }
};

// Seed users
const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    logInfo('Cleared existing users');

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      logInfo(`Created user: ${user.username}`);
    }

    logInfo(`Successfully seeded ${createdUsers.length} users`);
    return createdUsers;
  } catch (error) {
    logError('Error seeding users', error);
    throw error;
  }
};

// Seed tasks
const seedTasks = async (users) => {
  try {
    // Clear existing tasks
    await Task.deleteMany({});
    logInfo('Cleared existing tasks');

    // Create tasks
    const createdTasks = [];
    for (let i = 0; i < sampleTasks.length; i++) {
      const taskData = {
        ...sampleTasks[i],
        reporter: users[i % users.length]._id,
        assignee: users[i % users.length]._id
      };
      
      const task = new Task(taskData);
      await task.save();
      createdTasks.push(task);
      logInfo(`Created task: ${task.title}`);
    }

    logInfo(`Successfully seeded ${createdTasks.length} tasks`);
    return createdTasks;
  } catch (error) {
    logError('Error seeding tasks', error);
    throw error;
  }
};

// Seed notes
const seedNotes = async (users) => {
  try {
    // Clear existing notes
    await Note.deleteMany({});
    logInfo('Cleared existing notes');

    // Create notes
    const createdNotes = [];
    for (let i = 0; i < sampleNotes.length; i++) {
      const noteData = {
        ...sampleNotes[i],
        user: users[i % users.length]._id
      };
      
      const note = new Note(noteData);
      await note.save();
      createdNotes.push(note);
      logInfo(`Created note: ${note.title}`);
    }

    logInfo(`Successfully seeded ${createdNotes.length} notes`);
    return createdNotes;
  } catch (error) {
    logError('Error seeding notes', error);
    throw error;
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    logInfo('Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Seed data
    const users = await seedUsers();
    const tasks = await seedTasks(users);
    const notes = await seedNotes(users);
    
    logInfo('Database seeding completed successfully!');
    logInfo(`Created: ${users.length} users, ${tasks.length} tasks, ${notes.length} notes`);
    
    // Close connection
    await mongoose.connection.close();
    logInfo('Database connection closed');
    
    process.exit(0);
  } catch (error) {
    logError('Database seeding failed', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = {
  seedDatabase,
  seedUsers,
  seedTasks,
  seedNotes
};
