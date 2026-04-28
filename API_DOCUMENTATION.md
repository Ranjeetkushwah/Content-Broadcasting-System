# Content Broadcasting System - API Documentation

## Overview

The Content Broadcasting System provides RESTful APIs for educational content management with approval workflows and scheduled broadcasting. The system supports role-based access control (Principal/Teacher), file uploads, content approval, and time-based content rotation.

## Base URL

```
http://localhost:3000
```

## Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "timestamp": "2026-04-28T00:00:00.000Z"
}
```

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes  
- **Public APIs**: 60 requests per minute
- **File Upload**: 20 uploads per hour

---

## Authentication Endpoints

### Register User

**POST** `/api/auth/register`

Register a new user (Principal or Teacher).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "teacher" // or "principal"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "teacher",
    "created_at": "2026-04-28T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login

**POST** `/api/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "teacher",
    "created_at": "2026-04-28T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Profile

**GET** `/api/auth/profile`

Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "teacher",
    "created_at": "2026-04-28T00:00:00.000Z"
  }
}
```

### Update Profile

**PUT** `/api/auth/profile`

Update current user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

---

## User Management Endpoints (Principal Only)

### Get All Users

**GET** `/api/users`

Get all users with optional role filter.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `role` (optional): Filter by role (`principal` or `teacher`)

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "teacher",
      "created_at": "2026-04-28T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

### Get User by ID

**GET** `/api/users/:id`

Get specific user details.

**Headers:** `Authorization: Bearer <token>`

### Delete User

**DELETE** `/api/users/:id`

Delete a user (cannot delete own account).

**Headers:** `Authorization: Bearer <token>`

---

## Content Management Endpoints

### Get All Content

**GET** `/api/content`

Get all content (Principal only) or filter by parameters.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filter by status (`uploaded`, `pending`, `approved`, `rejected`)
- `subject` (optional): Filter by subject
- `teacher_id` (optional): Filter by teacher ID

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "title": "Math Quiz 1",
      "description": "First mathematics quiz",
      "subject": "Mathematics",
      "file_url": "/uploads/math-quiz-1-1234567890.jpg",
      "file_type": "jpg",
      "file_size": 1024000,
      "status": "approved",
      "uploaded_by": 1,
      "uploaded_by_name": "John Doe",
      "start_time": "2026-04-28T09:00:00.000Z",
      "end_time": "2026-04-28T17:00:00.000Z",
      "created_at": "2026-04-28T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

### Get Content by ID

**GET** `/api/content/:id`

Get specific content details.

**Headers:** `Authorization: Bearer <token>`

### Get My Content

**GET** `/api/content/my`

Get current user's uploaded content.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filter by status

### Update Content Status

**PUT** `/api/content/:id/status`

Approve or reject content (Principal only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "approved", // or "rejected"
  "rejection_reason": "Content quality needs improvement" // Required when rejecting
}
```

### Delete Content

**DELETE** `/api/content/:id`

Delete content (Teacher can only delete own content, Principal can delete any).

**Headers:** `Authorization: Bearer <token>`

### Get Pending Content

**GET** `/api/content/pending`

Get all pending content for approval (Principal only).

**Headers:** `Authorization: Bearer <token>`

### Get Content Statistics

**GET** `/api/content/stats`

Get content statistics (Principal only).

**Headers:** `Authorization: Bearer <token>`

---

## File Upload Endpoints (Teacher Only)

### Upload Content

**POST** `/api/upload/content`

Upload new content with file.

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `file`: Image file (JPG, PNG, GIF, max 10MB)
- `title`: Content title (required)
- `subject`: Subject name (required)
- `description`: Content description (optional)
- `start_time`: When content becomes visible (optional, ISO format)
- `end_time`: When content stops being visible (optional, ISO format)
- `rotation_duration`: Duration in minutes for rotation (optional)

**Response:**
```json
{
  "message": "Content uploaded successfully",
  "content": {
    "id": 1,
    "title": "Math Quiz 1",
    "subject": "Mathematics",
    "description": "First mathematics quiz",
    "file_url": "/uploads/math-quiz-1-1234567890.jpg",
    "file_type": "jpg",
    "file_size": 1024000,
    "status": "pending",
    "start_time": "2026-04-28T09:00:00.000Z",
    "end_time": "2026-04-28T17:00:00.000Z",
    "created_at": "2026-04-28T00:00:00.000Z"
  }
}
```

### Update Content Schedule

**PUT** `/api/upload/content/:contentId/schedule`

Update content rotation schedule.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "rotation_duration": 5 // Duration in minutes
}
```

---

## Public Broadcasting Endpoints (No Authentication Required)

### Get Live Content by Teacher

**GET** `/content/live/teacher/:teacherId`

Get currently active content for a specific teacher.

**Response:**
```json
{
  "message": "Content available",
  "teacher": {
    "id": 1,
    "name": "John Doe"
  },
  "subjects": [
    {
      "subject": "Mathematics",
      "content": {
        "id": 1,
        "title": "Math Quiz 1",
        "description": "First mathematics quiz",
        "file_url": "/uploads/math-quiz-1-1234567890.jpg",
        "file_type": "jpg",
        "uploaded_by": "John Doe",
        "start_time": "2026-04-28T09:00:00.000Z",
        "end_time": "2026-04-28T17:00:00.000Z"
      }
    }
  ],
  "timestamp": "2026-04-28T12:00:00.000Z"
}
```

### Get Live Content by Subject

**GET** `/content/live/subject/:subject`

Get currently active content for a specific subject.

**Response:**
```json
{
  "message": "Content available",
  "subject": "Mathematics",
  "content": {
    "id": 1,
    "title": "Math Quiz 1",
    "description": "First mathematics quiz",
    "file_url": "/uploads/math-quiz-1-1234567890.jpg",
    "file_type": "jpg",
    "uploaded_by": "John Doe",
    "start_time": "2026-04-28T09:00:00.000Z",
    "end_time": "2026-04-28T17:00:00.000Z"
  },
  "timestamp": "2026-04-28T12:00:00.000Z"
}
```

### Get All Live Content

**GET** `/content/live`

Get all currently active content across all subjects.

**Response:**
```json
{
  "message": "Content available",
  "subjects": [
    {
      "subject": "Mathematics",
      "content": {
        "id": 1,
        "title": "Math Quiz 1",
        "description": "First mathematics quiz",
        "file_url": "/uploads/math-quiz-1-1234567890.jpg",
        "file_type": "jpg",
        "uploaded_by": "John Doe",
        "start_time": "2026-04-28T09:00:00.000Z",
        "end_time": "2026-04-28T17:00:00.000Z"
      }
    }
  ],
  "timestamp": "2026-04-28T12:00:00.000Z"
}
```

### Get System Status

**GET** `/content/status`

Get system status and rotation information.

**Response:**
```json
{
  "system_status": "operational",
  "rotation_status": [
    {
      "subject": "Mathematics",
      "slot_id": 1,
      "current_active_content": {
        "id": 1,
        "title": "Math Quiz 1"
      },
      "total_active_contents": 3,
      "rotation_cycle_minutes": 15
    }
  ],
  "content_statistics": [
    {
      "status": "approved",
      "count": 5,
      "unique_teachers": 2
    }
  ],
  "timestamp": "2026-04-28T12:00:00.000Z"
}
```

---

## Health Check

### Health Check

**GET** `/health`

Check if the API is running.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2026-04-28T12:00:00.000Z"
}
```

---

## Content Lifecycle

1. **Uploaded**: Teacher uploads content → Status: `uploaded` → Auto-changes to `pending`
2. **Pending**: Principal reviews content → Can `approve` or `reject`
3. **Approved**: Content becomes available for broadcasting
4. **Rejected**: Content is rejected with reason → Teacher can view reason

## Scheduling Logic

- Content rotates based on `rotation_duration` (default: 5 minutes)
- Rotation is subject-based (independent for each subject)
- Content respects `start_time` and `end_time` windows
- System automatically determines active content based on current time

## Edge Cases Handled

- No content available → Returns "No content available" message
- Invalid teacher ID → Returns "Teacher not found" message
- Content outside time window → Not included in active content
- No approved content → Returns empty response
- Invalid subject → Returns empty response

## File Upload Constraints

- **Supported formats**: JPG, JPEG, PNG, GIF
- **Maximum file size**: 10MB
- **Storage**: Local storage in `/uploads` directory
- **File naming**: Unique filename with timestamp

## Security Features

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting on all endpoints
- File type validation
- SQL injection prevention (parameterized queries)
