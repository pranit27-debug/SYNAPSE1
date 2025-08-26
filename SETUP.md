# 🚀 Complete Setup Guide for Synapse

This guide will walk you through setting up the complete Synapse productivity platform from scratch.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher  
- **MongoDB** 5.0 or higher (local or cloud)
- **Git** for version control

### Check Your Versions

```bash
node --version    # Should be v18.0.0 or higher
npm --version     # Should be 8.0.0 or higher
git --version     # Any recent version
```

## 🏗️ Step-by-Step Setup

### Step 1: Clone and Navigate

```bash
# Clone the repository
git clone <your-repository-url>
cd synapse

# Verify the structure
ls -la
```

You should see:
```
synapse/
├── backend/
├── frontend/
├── README.md
├── SETUP.md
└── package.json
```

### Step 2: Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**⚠️ IMPORTANT**: Edit the `.env` file with your actual configuration:

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

### Step 3: Database Setup

#### Option A: Local MongoDB

1. **Install MongoDB locally** (if not already installed)
2. **Start MongoDB service**:
   ```bash
   # On Windows
   net start MongoDB
   
   # On macOS/Linux
   sudo systemctl start mongod
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Get your connection string
4. Update `MONGODB_URI` in your `.env` file

### Step 4: Seed the Database

```bash
# Make sure you're in the backend directory
cd backend

# Seed with sample data
npm run seed
```

This will create:
- 2 sample users (admin@synapse.com, demo@synapse.com)
- 3 sample tasks
- 2 sample notes

### Step 5: Start Backend Server

```bash
# Start development server
npm run dev
```

You should see:
```
🚀 Server is running on port 5000
📱 Frontend URL: http://localhost:3000
🌐 Environment: development
```

### Step 6: Frontend Setup

```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The React app should open automatically at `http://localhost:3000`

### Step 7: Test the Setup

1. **Backend Health Check**: Visit `http://localhost:5000`
2. **Frontend**: Visit `http://localhost:3000`
3. **Login**: Use `admin@synapse.com` / `admin123` or `demo@synapse.com` / `demo123`

## 🔧 Configuration Details

### Environment Variables Explained

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Backend server port | 5000 | No |
| `NODE_ENV` | Environment mode | development | No |
| `CLIENT_URL` | Frontend URL | http://localhost:3000 | No |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/synapse | **Yes** |
| `JWT_SECRET` | Secret for JWT tokens | - | **Yes** |
| `JWT_EXPIRE` | JWT token expiration | 7d | No |
| `BCRYPT_SALT_ROUNDS` | Password hashing rounds | 12 | No |
| `MAX_FILE_SIZE` | Maximum file upload size | 10485760 (10MB) | No |

### Security Configuration

- **JWT_SECRET**: Generate a strong secret:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **MFA_ENABLED**: Set to `true` to enable Multi-Factor Authentication
- **RATE_LIMIT_MAX_REQUESTS**: Maximum API requests per 15 minutes

## 🧪 Testing Your Setup

### API Endpoints Test

Use tools like **Postman**, **Insomnia**, or **curl** to test:

```bash
# Health check
curl http://localhost:5000/

# Register a new user
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@synapse.com","password":"admin123"}'
```

### Frontend Testing

1. Open `http://localhost:3000`
2. Try to register/login
3. Create some tasks and notes
4. Test the Kanban board
5. Check the analytics dashboard

## 🚀 Production Deployment

### Quick Production Setup

```bash
cd backend

# Install PM2 globally
npm install -g pm2

# Run deployment script
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Manual Production Setup

```bash
cd backend

# Install production dependencies
npm ci --only=production

# Set production environment
export NODE_ENV=production

# Start with PM2
pm2 start server.js --name synapse-api --env production
pm2 save
pm2 startup
```

## 🔍 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
```bash
# Check if MongoDB is running
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl status mongod
```

#### 2. Port Already in Use
```bash
# Check what's using port 5000
netstat -ano | findstr :5000

# Kill the process or change PORT in .env
```

#### 3. Dependencies Installation Failed
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. Frontend Build Errors
```bash
# Clear build cache
rm -rf build

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Logs and Debugging

```bash
# Backend logs
cd backend
npm run logs

# PM2 monitoring
npm run monitor

# Check specific errors
tail -f logs/error.log
```

## 📱 Mobile Testing

### Responsive Design
- Test on different screen sizes
- Use browser dev tools to simulate mobile devices
- Test touch interactions on actual devices

### PWA Features (Future)
- Offline functionality
- Push notifications
- App-like experience

## 🔒 Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] MFA is enabled for production
- [ ] Rate limiting is configured
- [ ] CORS is properly configured
- [ ] Input validation is active
- [ ] Error messages don't leak sensitive info
- [ ] HTTPS is enabled for production
- [ ] Database connection is secure

## 📊 Performance Monitoring

### Backend Metrics
- Response times
- Database query performance
- Memory usage
- CPU utilization

### Frontend Metrics
- Page load times
- Bundle sizes
- API call performance
- User interaction metrics

## 🎯 Next Steps

After successful setup:

1. **Customize the application** for your needs
2. **Add more features** using the existing architecture
3. **Implement testing** with Jest and Supertest
4. **Set up CI/CD** pipelines
5. **Configure monitoring** and alerting
6. **Scale the application** as needed

## 🆘 Getting Help

- **Documentation**: Check the `docs/` folder
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join community discussions
- **Code Review**: Submit pull requests

---

**🎉 Congratulations! You've successfully set up Synapse, a production-ready productivity platform.**

*For additional support or questions, please refer to the main README.md or open an issue on GitHub.*
