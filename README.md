# Atlas AI Support Assistant - Backend

Modern Node.js backend API for the Atlas AI Support Assistant application.

## 🚀 Features

- **Authentication**: Session-based auth with support for social login and passkeys
- **User Management**: Full CRUD operations with role-based permissions
- **Knowledge Base**: Manage AI training data and FAQs
- **Chat Logging**: Store and retrieve conversation history
- **Configuration**: Dynamic system configuration (model, company, panel, SMTP)
- **Statistics**: Real-time dashboard metrics and analytics
- **Backup/Restore**: Full system backup with Google Drive integration

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 5.0
- npm >= 9.0.0

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/leipnar/atlas-backend.git
   cd atlas-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest

   # Or use your local MongoDB installation
   ```

5. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/social-login` - Social login (Google/Microsoft)
- `POST /api/auth/passkey` - Passkey authentication
- `POST /api/auth/logout` - Logout
- `GET /api/auth/current-user` - Get current user

### Users
- `GET /api/users` - Get all users (paginated)
- `POST /api/users` - Create new user
- `PUT /api/users/:username` - Update user
- `DELETE /api/users/:username` - Delete user
- `POST /api/users/import` - Import multiple users
- `POST /api/users/:username/update-password` - Update password
- `POST /api/users/:username/register-passkey` - Register passkey

### Knowledge Base
- `GET /api/kb` - Get all knowledge entries
- `POST /api/kb` - Create entry
- `PUT /api/kb/:id` - Update entry
- `DELETE /api/kb/:id` - Delete entry

### Chat
- `GET /api/chat/logs` - Get chat logs (paginated)
- `GET /api/chat/logs/:id` - Get specific conversation
- `POST /api/chat/feedback` - Submit feedback
- `POST /api/chat/save` - Save conversation

### Configuration
- `GET/PUT /api/config/permissions` - Role permissions
- `GET/PUT /api/config/model` - AI model configuration
- `GET/PUT /api/config/company` - Company information
- `GET/PUT /api/config/panel` - Panel customization
- `GET/PUT /api/config/smtp` - SMTP settings
- `GET/POST /api/config/api-keys` - AI API keys
- `GET/POST/PUT/DELETE /api/config/custom-models` - Custom models

### Statistics
- `GET /api/stats/activity` - Chat activity (30 days)
- `GET /api/stats/feedback` - Feedback statistics
- `GET /api/stats/kb-count` - Knowledge base count
- `GET /api/stats/log-count` - Chat log count
- `GET /api/stats/role-distribution` - User role distribution
- `GET /api/stats/unanswered-count` - Unanswered questions count
- `GET /api/stats/user-count` - User count
- `GET /api/stats/volume-by-hour` - Chat volume by hour

### Backup
- `GET /api/backup` - Create backup
- `POST /api/backup/restore` - Restore from backup
- `GET/PUT /api/backup/schedule` - Backup schedule
- `GET /api/backup/gdrive` - Google Drive config
- `POST /api/backup/gdrive/connect` - Connect Google Drive
- `POST /api/backup/gdrive/disconnect` - Disconnect Google Drive

## 🔐 Default Users

After seeding the database:

- **Admin**: `admin` / `password`
- **Manager**: `manager` / `password`
- **Client**: `client` / `password`

## 📁 Project Structure

```
atlas-backend/
├── src/
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   └── server.js        # Main server file
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 🌐 Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `SESSION_SECRET` - Secret for sessions
- `FRONTEND_URL` - Frontend URL for CORS

## 🚢 Deployment

See [VPS_DEPLOYMENT.md](VPS_DEPLOYMENT.md) for deployment instructions.

## 📝 License

MIT

## 👥 Author

leipnar
