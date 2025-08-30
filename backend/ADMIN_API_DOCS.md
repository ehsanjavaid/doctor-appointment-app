# Admin API Documentation

This document describes the admin API endpoints for user account management, including suspension and reactivation functionality.

## Authentication
All admin endpoints require a valid JWT token with admin privileges. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Get All Users
**GET** `/api/admin/users`

Retrieves a paginated list of users with optional filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of users per page (default: 10)
- `role` (optional): Filter by user role (patient, doctor, admin)
- `isActive` (optional): Filter by account status (true/false)
- `search` (optional): Search by name or email

**Response:**
```json
{
  "success": true,
  "users": [...],
  "totalPages": 5,
  "currentPage": 1,
  "total": 50
}
```

### 2. Get User Details
**GET** `/api/admin/users/:id`

Retrieves detailed information about a specific user.

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient",
    "isActive": true,
    "isVerified": true,
    // ... other user fields
  }
}
```

### 3. Suspend User Account
**PUT** `/api/admin/users/:id/suspend`

Suspends a user account. Suspended users cannot log in or access protected routes.

**Response:**
```json
{
  "success": true,
  "message": "User account suspended successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "patient",
    "isActive": false
  }
}
```

**Error Cases:**
- 404: User not found
- 400: User is already suspended
- 400: Cannot suspend admin accounts

### 4. Reactivate User Account
**PUT** `/api/admin/users/:id/reactivate`

Reactivates a suspended user account. Also resets failed login attempts and account lock status.

**Response:**
```json
{
  "success": true,
  "message": "User account reactivated successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "patient",
    "isActive": true
  }
}
```

**Error Cases:**
- 404: User not found
- 400: User is already active

### 5. Get Admin Statistics
**GET** `/api/admin/stats`

Retrieves statistics for the admin dashboard.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 100,
    "activeUsers": 95,
    "suspendedUsers": 5,
    "doctors": 20,
    "patients": 75,
    "suspensionRate": 5.00
  }
}
```

## Security Features

1. **Admin Authorization**: All endpoints require admin role access
2. **Admin Protection**: Admin accounts cannot be suspended
3. **Account Lock Reset**: Reactivation resets failed login attempts and lock status
4. **Input Validation**: Proper validation and error handling

## Usage Examples

### Suspend a User
```bash
curl -X PUT http://localhost:5000/api/admin/users/123456/suspend \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json"
```

### Reactivate a User
```bash
curl -X PUT http://localhost:5000/api/admin/users/123456/reactivate \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json"
```

### Get User List
```bash
curl "http://localhost:5000/api/admin/users?role=patient&isActive=false&page=1&limit=10" \
  -H "Authorization: Bearer your_jwt_token"
```

## Integration with Existing System

The admin endpoints integrate with the existing authentication system:
- Uses the same `protect` and `authorize` middleware
- Respects the `isActive` field that's already checked during login
- Maintains consistency with existing user model structure
- Works with the current JWT token system

## Testing

Run the test script to verify functionality:
```bash
cd backend
node test-admin-routes.js
```

This will create test users and verify suspension/reactivation functionality.
