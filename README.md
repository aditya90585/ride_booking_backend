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

---

# Captain API

Captain endpoints are available under the `/api/captain` base path.

## Captain Registration

### POST `/api/captain/register`

Registers a captain and their vehicle, then returns a JWT token valid for 24 hours.

### Request

**Content-Type:** `application/json`

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `firstName` | String | Yes | 3-100 characters | Captain's first name |
| `lastName` | String | Yes | 3-100 characters | Captain's last name |
| `email` | String | Yes | Valid email format | Captain's email address; must be unique |
| `password` | String | Yes | Minimum 6 characters | Captain's password |
| `color` | String | Yes | Minimum 3 characters | Vehicle color |
| `plate` | String | Yes | Minimum 3 characters | Vehicle registration plate |
| `capacity` | Integer | Yes | Minimum value: 1 | Number of passengers the vehicle can carry |
| `vehicleType` | String | Yes | `car`, `motorcycle`, or `auto` | Type of vehicle |

### Example Request

```json
{
  "firstName": "Alex",
  "lastName": "Morgan",
  "email": "alex.morgan@example.com",
  "password": "securePassword123",
  "color": "White",
  "plate": "ABC123",
  "capacity": 4,
  "vehicleType": "car"
}
```

### Responses

#### 201 Created

```json
{
  "success": true,
  "captain": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": {
      "firstName": "Alex",
      "lastName": "Morgan"
    },
    "email": "alex.morgan@example.com",
    "socketId": null,
    "status": "inactive",
    "vehicle": {
      "color": "White",
      "plate": "ABC123",
      "capacity": 4,
      "vehicleType": "car"
    },
    "location": {
      "lat": null,
      "lng": null
    },
    "createdAt": "2026-08-23T10:30:00.000Z",
    "updatedAt": "2026-08-23T10:30:00.000Z"
  },
  "token": "<jwt_token>"
}
```

#### 400 Bad Request

Returned when validation fails or captain creation fails.

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": "bike",
      "msg": "Vehicle type is required",
      "path": "vehicleType",
      "location": "body"
    }
  ]
}
```

For creation errors such as a duplicate email, the response is:

```json
{
  "success": false,
  "message": "Error message describing what went wrong"
}
```

## Captain Login

### POST `/api/captain/login`

Authenticates a captain using their email and password. The JWT is returned in the response and stored in an HTTP-only `token` cookie for 24 hours.

### Request

**Content-Type:** `application/json`

```json
{
  "email": "alex.morgan@example.com",
  "password": "securePassword123"
}
```

### Responses

#### 200 OK

```json
{
  "success": true,
  "captain": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": {
      "firstName": "Alex",
      "lastName": "Morgan"
    },
    "email": "alex.morgan@example.com",
    "socketId": null,
    "status": "inactive",
    "vehicle": {
      "color": "White",
      "plate": "ABC123",
      "capacity": 4,
      "vehicleType": "car"
    }
  },
  "token": "<jwt_token>"
}
```

#### 400 Bad Request

Returned when the email or password fails request validation.

```json
{
  "errors": [
    {
      "type": "field",
      "msg": "Password must be at least 6 characters",
      "path": "password",
      "location": "body"
    }
  ]
}
```

#### 404 Not Found

```json
{
  "success": false,
  "message": "Captain not found"
}
```

#### 401 Unauthorized

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Error message describing what went wrong"
}
```

## Get Captain Profile

### GET `/api/captain/profile`

Returns the profile of the authenticated captain.

### Authentication

Send the JWT in the `Authorization` header:

```http
Authorization: Bearer <jwt_token>
```

The token may also be sent in the `token` cookie returned by the login endpoint.

### Responses

#### 200 OK

```json
{
  "success": true,
  "captain": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": {
      "firstName": "Alex",
      "lastName": "Morgan"
    },
    "email": "alex.morgan@example.com",
    "socketId": null,
    "status": "inactive",
    "vehicle": {
      "color": "White",
      "plate": "ABC123",
      "capacity": 4,
      "vehicleType": "car"
    }
  }
}
```

#### 401 Unauthorized

Returned when the token is missing, invalid, expired, or blacklisted.

```json
{
  "success": false,
  "message": "Unauthorized: No token provided"
}
```

or:

```json
{
  "success": false,
  "message": "Unauthorized: Invalid token"
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Error message describing what went wrong"
}
```

## Captain Logout

### GET `/api/captain/logout`

Logs out the authenticated captain by blacklisting the current JWT and clearing the `token` cookie.

### Authentication

Send the JWT in the `Authorization` header or the `token` cookie:

```http
Authorization: Bearer <jwt_token>
```

### Responses

#### 200 OK

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### 401 Unauthorized

Returned when no token is provided, the token is invalid, expired, or blacklisted.

```json
{
  "success": false,
  "message": "Unauthorized: No token provided"
}
```

or:

```json
{
  "success": false,
  "message": "Unauthorized: Invalid token"
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Error message describing what went wrong"
}
```

### Captain Notes

- Captain passwords are hashed with **bcrypt** before storage.
- The `password` field is excluded from captain responses.
- Captain JWTs expire after **24 hours**.
- The `status` field defaults to `inactive`.
- Logout blacklists the token until its 24-hour expiration.

