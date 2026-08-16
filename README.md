# Ride Booking App - API Documentation

## Endpoint: User Registration

### POST `/api/user/register`

---

## Description
This endpoint allows a new user to register for the ride booking application. It validates the input data, creates a new user account, and returns a JWT token for authentication.

---

## Request

### Method
**POST**

### Content-Type
`application/json`

### Request Body

| Field | Type | Required | Validation | Description |
|-------|------|----------|-----------|-------------|
| `firstName` | String | Yes | Min length: 3 characters | User's first name |
| `lastName` | String | No | Min length: 3 characters (if provided) | User's last name |
| `email` | String | Yes | Min length: 5 characters, Must be unique | User's email address |
| `password` | String | Yes | - | User's password (will be hashed with bcrypt) |

### Example Request
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

---

## Response

### Success Response (201 Created)
**Status Code:** `201`

```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "email": "john.doe@example.com",
    "socketId": null,
    "createdAt": "2026-08-15T10:30:00.000Z",
    "updatedAt": "2026-08-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTY5MjExMjYwMCwiZXhwIjoxNjkyMTk5MDAwfQ.4rH7rJ9kL2nM3pQ5sT6uV7wX8yZ0aB1cD2eF3gH4iJ"
}
```

---

### Error Responses

#### 400 Bad Request (Validation Error)
**Status Code:** `400`

**Reason:** Validation failed for one or more fields

```json
{
  "errors": [
    {
      "type": "field",
      "value": "ja",
      "msg": "First name must be at least 3 characters long",
      "path": "firstName",
      "location": "body"
    }
  ]
}
```

**Common validation errors:**
- `firstName` must be at least 3 characters long
- `lastName` must be at least 3 characters long (if provided)
- `email` must be at least 5 characters long
- `email` must be a valid email format
- Missing required fields (`firstName`, `email`, `password`)

---

#### 500 Internal Server Error
**Status Code:** `500`

**Reason:** Server-side error during user creation (e.g., database error, duplicate email)

```json
{
  "success": false,
  "message": "Error message describing what went wrong"
}
```

**Common error scenarios:**
- Email already exists in the database (duplicate email)
- Database connection error
- Password hashing failure
- Missing environment variables

---

## Authentication
The response includes a **JWT token** that expires in **24 hours** (1 day). This token should be used for subsequent authenticated requests.

---

## Endpoint: User Login

### POST `/api/user/login`

### Description
This endpoint authenticates a registered user and returns a JWT token for accessing protected routes.

### Request

#### Method
**POST**

#### Content-Type
`application/json`

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | String | Yes | Registered user's email address |
| `password` | String | Yes | User's password |

#### Example Request
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

### Response

#### Success Response (200 OK)
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "email": "john.doe@example.com",
    "socketId": null,
    "createdAt": "2026-08-15T10:30:00.000Z",
    "updatedAt": "2026-08-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTY5MjExMjYwMCwiZXhwIjoxNjkyMTk5MDAwfQ.4rH7rJ9kL2nM3pQ5sT6uV7wX8yZ0aB1cD2eF3gH4iJ"
}
```

#### Error Responses

##### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

##### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

## Endpoint: Get User Profile

### GET `/api/user/profile`

### Description
This endpoint returns the authenticated user's profile information.

### Request

#### Method
**GET**

#### Headers
```http
Authorization: Bearer <jwt_token>
```

You can also send the token in a cookie named `token`.

#### Example Request
```http
GET /api/user/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTY5MjExMjYwMCwiZXhwIjoxNjkyMTk5MDAwfQ.4rH7rJ9kL2nM3pQ5sT6uV7wX8yZ0aB1cD2eF3gH4iJ
```

### Response

#### Success Response (200 OK)
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "email": "john.doe@example.com",
    "socketId": null,
    "createdAt": "2026-08-15T10:30:00.000Z",
    "updatedAt": "2026-08-15T10:30:00.000Z"
  }
}
```

#### Error Responses

##### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized: No token provided"
}
```

```json
{
  "success": false,
  "message": "Unauthorized: Invalid token"
}
```

---

## Endpoint: User Logout

### GET `/api/user/logout`

### Description
This endpoint logs out the authenticated user by blacklisting the JWT token and clearing the cookie.

### Request

#### Method
**GET**

#### Headers
```http
Authorization: Bearer <jwt_token>
```

You can also send the token in a cookie named `token`.

#### Example Request
```http
GET /api/user/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTY5MjExMjYwMCwiZXhwIjoxNjkyMTk5MDAwfQ.4rH7rJ9kL2nM3pQ5sT6uV7wX8yZ0aB1cD2eF3gH4iJ
```

### Response

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Error Responses

##### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not logged in"
}
```

---

## Notes
- Passwords are automatically hashed using **bcrypt** with a salt rounds of 12 before being stored
- The `password` field is not returned in the response for security reasons
- Email addresses must be unique across the system
- All timestamps are in ISO 8601 format (UTC)

