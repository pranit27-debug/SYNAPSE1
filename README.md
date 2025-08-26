# 🧠 Synapse - Enterprise-Grade Productivity Platform

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5+-blue.svg)](https://mongodb.com/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Synapse** is a comprehensive, production-ready productivity platform that combines advanced task management, note-taking, collaboration, and analytics in a single, secure application.

## 🚀 Features

### 🔐 **Advanced Security & Authentication**
- **Multi-Factor Authentication (MFA)** with TOTP support
- **Account lockout protection** after failed attempts
- **JWT-based authentication** with refresh tokens
- **Rate limiting** and brute force protection
- **Password hashing** with bcrypt
- **Secure session management**

### 📊 **Advanced Task Management**
- **Kanban board** with drag-and-drop support
- **Subtask management** with progress tracking
- **Time tracking** and estimation
- **Task dependencies** and relationships
- **Priority management** and categorization
- **Recurring tasks** with custom patterns
- **File attachments** and links
- **Comments and collaboration**

### 📝 **Enhanced Note Management**
- **Rich text support** with markdown
- **Version control** and history tracking
- **Collaboration features** with permissions
- **File attachments** and media support
- **Advanced categorization** and tagging
- **Search functionality** across content
- **Reading time** and word count analytics

### 📈 **Analytics & Insights**
- **Productivity dashboard** with real-time metrics
- **Task completion trends** and performance analysis
- **Time efficiency** and estimation accuracy
- **Category and priority** distribution analysis
- **Personalized insights** and recommendations
- **Export capabilities** for reporting

### 🛠️ **Production Infrastructure**
- **Comprehensive logging** with Winston
- **Error handling** and monitoring
- **File upload** management
- **Database optimization** with indexing
- **API rate limiting** and security
- **Performance monitoring** and optimization

## 🏗️ Architecture

```
synapse/
├── backend/                 # Node.js/Express API
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   ├── scripts/            # Deployment scripts
│   └── logs/               # Application logs
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   └── utils/          # Frontend utilities
│   └── public/             # Static assets
└── docs/                   # Documentation
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **npm** 8+
- **MongoDB** 5+ (local or cloud)
- **Git** for version control

### 1. Clone the Repository

```bash
git clone <repository-url>
cd synapse
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 4. Database Setup

```bash
cd backend

# Seed the database with sample data
node utils/seed.js
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/synapse

# Security Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
BCRYPT_SALT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=5

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=uploads/

# MFA Configuration
MFA_ENABLED=true
MFA_ISSUER=Synapse

# Analytics and Monitoring
ANALYTICS_ENABLED=true
PERFORMANCE_MONITORING=true
```

## 🔧 Development

### Available Scripts

#### Backend
```bash
npm run dev          # Start development server with nodemon
npm start           # Start production server
npm run seed        # Seed database with sample data
npm run test        # Run tests (when implemented)
```

#### Frontend
```bash
npm start           # Start development server
npm run build       # Build for production
npm test            # Run tests
npm run eject       # Eject from Create React App
```

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/setup-mfa` - Setup MFA
- `POST /api/auth/enable-mfa` - Enable MFA
- `POST /api/auth/disable-mfa` - Disable MFA
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify token
- `PUT /api/auth/preferences` - Update preferences

#### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile

#### Tasks
- `GET /api/tasks` - Get all tasks with filtering
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get specific task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/kanban` - Get Kanban board data
- `POST /api/tasks/:id/position` - Update task position
- `POST /api/tasks/:id/subtasks` - Add subtask
- `POST /api/tasks/:id/start-timer` - Start time tracking
- `POST /api/tasks/:id/stop-timer` - Stop time tracking
- `POST /api/tasks/:id/complete` - Mark task complete

#### Notes
- `GET /api/notes` - Get all notes with filtering
- `POST /api/notes` - Create new note
- `GET /api/notes/:id` - Get specific note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

#### Analytics
- `GET /api/analytics/dashboard` - Get productivity dashboard
- `GET /api/analytics/tasks` - Get task analytics
- `GET /api/analytics/notes` - Get note analytics
- `GET /api/analytics/insights` - Get productivity insights

## 🚀 Production Deployment

### Using PM2 (Recommended)

```bash
cd backend

# Install PM2 globally
npm install -g pm2

# Run deployment script
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Manual Deployment

```bash
cd backend

# Install production dependencies
npm ci --only=production

# Set environment variables
export NODE_ENV=production
export PORT=5000

# Start with PM2
pm2 start server.js --name synapse-api --env production
pm2 save
pm2 startup
```

### Docker Deployment

```bash
# Build Docker image
docker build -t synapse-backend .

# Run container
docker run -d \
  --name synapse-backend \
  -p 5000:5000 \
  --env-file .env \
  synapse-backend
```

## 📊 Database Schema

### User Model
- Basic info (username, email, password)
- MFA configuration (secret, backup codes)
- Security settings (login attempts, lockout)
- User preferences (theme, notifications, language)

### Task Model
- Task details (title, description, status, priority)
- Time tracking (estimated, actual, time entries)
- Advanced features (subtasks, dependencies, tags)
- Kanban support (column, position)

### Note Model
- Content (title, content, type)
- Organization (category, tags, pinned status)
- Collaboration (sharing, permissions)
- Version control (history, changes)

## 🔒 Security Features

- **JWT Authentication** with secure token management
- **MFA Support** using TOTP (Time-based One-Time Password)
- **Rate Limiting** to prevent abuse
- **Input Validation** with express-validator
- **SQL Injection Protection** with Mongoose
- **XSS Protection** with helmet middleware
- **CORS Configuration** for cross-origin requests
- **Password Security** with bcrypt hashing

## 📈 Performance Features

- **Database Indexing** for fast queries
- **Pagination** for large datasets
- **Caching** strategies (when implemented)
- **Compression** middleware for responses
- **File Upload** optimization
- **Query Optimization** with aggregation pipelines

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

### API Testing
Use tools like Postman or Insomnia to test the API endpoints.

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `docs/` folder
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Join the community discussions

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core authentication and user management
- ✅ Basic task and note management
- ✅ MFA implementation
- ✅ Basic analytics

### Phase 2 (Next)
- 🔄 Advanced collaboration features
- 🔄 Real-time notifications
- 🔄 Mobile app development
- 🔄 Advanced reporting

### Phase 3 (Future)
- 📋 AI-powered insights
- 📋 Advanced integrations
- 📋 Enterprise features
- 📋 Multi-tenant support

---

**Built with ❤️ using Node.js, Express, MongoDB, React, and modern web technologies.**

*For questions and support, please open an issue on GitHub.*
