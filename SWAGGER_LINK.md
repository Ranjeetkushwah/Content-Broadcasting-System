# Swagger API Documentation

## 📖 Live API Documentation

The Content Broadcasting System provides interactive Swagger/OpenAPI documentation that allows you to explore and test all API endpoints directly from your browser.

### 🌐 Access Swagger Documentation

**Local Development:**
```
http://localhost:3000/api-docs/
```

**Production (when deployed):**
```
https://your-domain.com/api-docs/
```

### 🔧 Features of Swagger Documentation

- **Interactive API Explorer**: Test all endpoints directly from the browser
- **Request/Response Examples**: See expected request formats and response structures
- **Authentication Support**: Test authenticated endpoints with JWT tokens
- **Parameter Documentation**: Detailed parameter descriptions and validation rules
- **Error Responses**: Complete error response documentation
- **Schema Definitions**: Comprehensive data model documentation

### 📚 Available API Categories

#### 1. **Authentication** (`/api/auth`)
- User Registration
- User Login
- Profile Management
- JWT Token Handling

#### 2. **Content Management** (`/api/content`)
- Content CRUD Operations
- Approval Workflow
- Content Status Management
- Principal Controls

#### 3. **File Upload** (`/api/upload`)
- Content Upload with Files
- Schedule Management
- File Validation
- Teacher Controls

#### 4. **User Management** (`/api/users`)
- User Administration (Principal Only)
- User Profile Management
- Role Management

#### 5. **Public Broadcasting** (`/content`)
- Live Content Access
- Teacher-specific Content
- Subject-specific Content
- System Status

### 🔐 Testing Authenticated Endpoints

1. **Register/Login First:**
   - Use `/api/auth/register` to create an account
   - Use `/api/auth/login` to get a JWT token

2. **Authorize Your Requests:**
   - Click the "Authorize" button in Swagger UI
   - Enter `Bearer <your-jwt-token>`
   - All subsequent requests will include the token

3. **Test Role-Based Endpoints:**
   - Teacher endpoints require teacher role
   - Principal endpoints require principal role
   - Public endpoints require no authentication

### 📝 Example API Testing Workflow

#### Step 1: Register a Teacher
```bash
POST /api/auth/register
{
  "name": "John Doe",
  "email": "teacher@example.com",
  "password": "password123",
  "role": "teacher"
}
```

#### Step 2: Login and Get Token
```bash
POST /api/auth/login
{
  "email": "teacher@example.com",
  "password": "password123"
}
```

#### Step 3: Upload Content
```bash
POST /api/upload/content
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- file: [image file]
- title: "Math Quiz 1"
- subject: "Mathematics"
- rotation_duration: 5
```

#### Step 4: Test Public Access
```bash
GET /content/live/teacher/1
```

### 🚀 Quick Start Guide

1. **Start the Server:**
   ```bash
   npm run dev
   ```

2. **Open Swagger UI:**
   - Navigate to `http://localhost:3000/api-docs/`
   - Wait for the interface to load

3. **Explore Endpoints:**
   - Click on any endpoint category
   - Expand endpoints to see details
   - Use "Try it out" to test

4. **Test Authentication:**
   - Register a user account
   - Login to get JWT token
   - Authorize in Swagger UI
   - Test protected endpoints

### 📊 API Response Formats

#### Success Response Example:
```json
{
  "message": "Operation successful",
  "data": {
    "id": 1,
    "title": "Content Title",
    "status": "approved"
  },
  "timestamp": "2026-04-28T00:00:00.000Z"
}
```

#### Error Response Example:
```json
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "details": ["Title is required"],
  "timestamp": "2026-04-28T00:00:00.000Z"
}
```

### 🔍 Advanced Features

#### File Upload Testing
- Supports JPG, PNG, GIF formats
- Maximum file size: 10MB
- Automatic file validation
- Unique filename generation

#### Rate Limiting Information
- General API: 100 requests/15 minutes
- Authentication: 5 requests/15 minutes
- Public APIs: 60 requests/minute
- File Upload: 20 uploads/hour

#### Content Scheduling
- Time-based content rotation
- Subject-independent cycles
- Configurable rotation durations
- Real-time content determination

### 🛠️ Development Tools Integration

#### Postman Import
1. Export Swagger specification
2. Import into Postman
3. Test collections with environments

#### Code Generation
- Generate client SDKs
- Create API clients
- Integrate with testing frameworks

### 📱 Mobile Testing

Use Swagger documentation to:
- Test mobile app API integration
- Validate request/response formats
- Debug authentication flows
- Test file upload functionality

### 🔗 Related Documentation

- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Architecture Notes](./architecture-notes.txt) - System design decisions
- [README](./README.md) - Setup and deployment guide

### 🐛 Troubleshooting

#### Common Issues:
1. **CORS Errors**: Ensure proper CORS configuration
2. **Authentication Failures**: Check JWT token format and expiration
3. **File Upload Issues**: Verify file size and type constraints
4. **Rate Limiting**: Wait for limit reset or use different endpoints

#### Debug Mode:
- Set `NODE_ENV=development` for detailed error messages
- Check server logs for additional context
- Use browser developer tools for network inspection

---

**🎯 Pro Tip**: Bookmark the Swagger documentation link for quick API exploration and testing during development!

**📞 Support**: If you encounter issues with the Swagger documentation, check the server logs and ensure all dependencies are properly installed.
