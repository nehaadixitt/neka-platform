# NEKA - All Things Filmmaking Platform

A complete full-stack web platform connecting scriptwriters, directors, actors, and other film artists.

## Features

- **Authentication System**: Secure registration/login with JWT
- **User Profiles**: Editable profiles with artist type, bio, and contact info
- **Project Management**: Create ongoing/finished projects with script uploads
- **Collaboration System**: Send/accept collaboration requests
- **Messaging**: Direct messaging between users
- **Responsive Design**: Clean, modern UI

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, JWT
- **Frontend**: React, React Router, Axios
- **File Upload**: Multer for script uploads
- **Authentication**: bcryptjs for password hashing

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Install backend dependencies:
```bash
npm install
```

2. Create `.env` file with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/neka-platform
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

3. Start MongoDB service

4. Run the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install frontend dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

## Usage

1. Register as a new user with your artist type
2. Complete your profile with bio and contact information
3. Create projects (ongoing or finished)
4. Upload scripts for your projects
5. Browse finished projects from other artists
6. Send collaboration requests
7. Message other users directly

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects/my` - Get user's projects
- `GET /api/projects/finished` - Get all finished projects
- `GET /api/projects/:id` - Get project by ID

### Collaborations
- `POST /api/collaborations/request` - Send collaboration request
- `GET /api/collaborations/incoming` - Get incoming requests
- `PUT /api/collaborations/request/:id` - Accept/deny request
- `GET /api/collaborations/projects` - Get collaborative projects

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/:userId` - Get messages with specific user

## Database Schema

### Users
- name, email, password, artistType, bio, contactInfo, profilePic

### Projects
- userId, title, status, summary, scriptPath, collaborators

### CollabRequests
- senderId, receiverId, projectId, status

### Messages
- senderId, receiverId, content, timestamp

## Deployment

1. Build the React app:
```bash
cd client && npm run build
```

2. Set production environment variables
3. Deploy to your preferred hosting service (Heroku, AWS, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request