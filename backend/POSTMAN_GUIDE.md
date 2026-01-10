# 📮 Panduan Testing API dengan Postman

## 🔧 Setup Postman

### 1. Base URL
```
https://shine.local.test/api/v1
```

### 2. Environment Variables (Opsional)
Buat environment di Postman dengan variables:
- `base_url`: `https://shine.local.test/api/v1`
- `token`: (akan diisi setelah login)

---

## 🔐 Authentication Flow

### Step 1: Test API Connection (Public)
**Request:**
```
GET {{base_url}}/test
```

**Response:**
```json
{
  "success": true,
  "message": "API is working! Backend connected successfully."
}
```

---

### Step 2: Login
**Request:**
```
POST {{base_url}}/login
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "wira@shineeducationbali.com",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Wira Budhi",
      "email": "wira@shineeducationbali.com",
      "roles": ["Super Admin"],
      "created_at": "2025-01-01 00:00:00"
    },
    "token": "1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "token_type": "Bearer"
  }
}
```

**⚠️ IMPORTANT:** Copy token dari response dan gunakan untuk request berikutnya!

---

### Step 3: Set Authorization Token

Di Postman, ada 2 cara:

#### Cara 1: Authorization Tab
1. Pilih request yang butuh auth
2. Tab **Authorization**
3. Type: **Bearer Token**
4. Token: paste token dari login response

#### Cara 2: Header Manual
1. Tab **Headers**
2. Key: `Authorization`
3. Value: `Bearer {token}` (ganti {token} dengan token dari login)

---

## 📋 Testing Endpoints

### 🔹 Users API

#### 1. List All Users
```
GET {{base_url}}/users
Authorization: Bearer {{token}}
```
**Required Permission:** `users.view`

#### 2. Get User by ID
```
GET {{base_url}}/users/1
Authorization: Bearer {{token}}
```
**Required Permission:** `users.view`

#### 3. Create User
```
POST {{base_url}}/users
Authorization: Bearer {{token}}
Content-Type: application/json
```
**Body:**
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123"
}
```
**Required Permission:** `users.create`

#### 4. Update User
```
PUT {{base_url}}/users/1
Authorization: Bearer {{token}}
Content-Type: application/json
```
**Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```
**Required Permission:** `users.edit`

#### 5. Delete User
```
DELETE {{base_url}}/users/1
Authorization: Bearer {{token}}
```
**Required Permission:** `users.delete`

---

### 🔹 Roles API

#### 1. List All Roles
```
GET {{base_url}}/roles
Authorization: Bearer {{token}}
```
**Required Permission:** `roles.view`

#### 2. Get Role by ID
```
GET {{base_url}}/roles/1
Authorization: Bearer {{token}}
```
**Required Permission:** `roles.view`

#### 3. Create Role
```
POST {{base_url}}/roles
Authorization: Bearer {{token}}
Content-Type: application/json
```
**Body:**
```json
{
  "name": "Manager",
  "guard_name": "web",
  "permissions": [
    "users.view",
    "users.create",
    "users.edit"
  ]
}
```
**Required Permission:** `roles.create`

#### 4. Update Role
```
PUT {{base_url}}/roles/1
Authorization: Bearer {{token}}
Content-Type: application/json
```
**Body:**
```json
{
  "name": "Senior Manager",
  "permissions": [
    "users.view",
    "users.create",
    "users.edit",
    "users.delete"
  ]
}
```
**Required Permission:** `roles.edit`

#### 5. Delete Role
```
DELETE {{base_url}}/roles/1
Authorization: Bearer {{token}}
```
**Required Permission:** `roles.delete`

---

### 🔹 Permissions API

#### 1. List All Permissions
```
GET {{base_url}}/permissions
Authorization: Bearer {{token}}
```
**Required Permission:** `permissions.view`

---

### 🔹 Auth API

#### 1. Register (Public)
```
POST {{base_url}}/register
Content-Type: application/json
```
**Body:**
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

#### 2. Get Current User
```
GET {{base_url}}/me
Authorization: Bearer {{token}}
```

#### 3. Logout
```
POST {{base_url}}/logout
Authorization: Bearer {{token}}
```

#### 4. Logout All Devices
```
POST {{base_url}}/logout-all
Authorization: Bearer {{token}}
```

---

## 👥 Test Users dari Seeder

Berikut user yang bisa digunakan untuk testing:

| Email | Password | Role | Permissions |
|-------|----------|------|-------------|
| wira@shineeducationbali.com | password | Super Admin | All (25) |
| admin@shineeducationbali.com | password | Admin | 16 permissions |
| test@example.com | password | Teacher | 7 permissions |
| john.doe@shineeducationbali.com | password | Staff | 3 permissions |
| jane.smith@shineeducationbali.com | password | Student | 1 permission |

---

## 🧪 Testing Scenarios

### Scenario 1: Super Admin (Full Access)
1. Login dengan `wira@shineeducationbali.com`
2. Test semua endpoints - semuanya harus bisa diakses
3. Create, Read, Update, Delete semua resources

### Scenario 2: Admin (Limited Access)
1. Login dengan `admin@shineeducationbali.com`
2. Bisa: View/Create/Edit/Delete Users, Roles, Students, Courses
3. Tidak bisa: Manage permissions secara langsung

### Scenario 3: Teacher (View Only)
1. Login dengan `test@example.com`
2. Bisa: View students, courses, dashboard
3. Tidak bisa: Delete, Manage roles/permissions

---

## ❌ Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthenticated."
}
```
**Solusi:** Pastikan token ada di Authorization header

### 403 Forbidden
```json
{
  "success": false,
  "message": "You do not have the required permission to access this resource."
}
```
**Solusi:** User tidak punya permission yang dibutuhkan

### 422 Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["The email field is required."]
  }
}
```
**Solusi:** Perbaiki request body sesuai validation rules

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```
**Solusi:** ID resource tidak ditemukan

---

## 💡 Tips Postman

### 1. Save Token Otomatis
Tambahkan **Tests** script di Login request:
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.token) {
        pm.environment.set("token", jsonData.data.token);
    }
}
```

### 2. Collection Variables
1. Create Collection
2. Variables tab
3. Tambahkan `token` variable
4. Semua request dalam collection akan menggunakan variable ini

### 3. Pre-request Script
Untuk auto-set token di semua request:
```javascript
if (pm.collectionVariables.get("token")) {
    pm.request.headers.add({
        key: "Authorization",
        value: "Bearer " + pm.collectionVariables.get("token")
    });
}
```

---

## 🔗 Quick Reference

### Base URL
```
https://shine.local.test/api/v1
```

### Public Endpoints
- `GET /test` - Test connection
- `POST /register` - Register user
- `POST /login` - Login

### Protected Endpoints (Need Token)
- `GET /me` - Current user
- `POST /logout` - Logout
- `POST /logout-all` - Logout all devices
- `GET /users` - List users (permission: users.view)
- `POST /users` - Create user (permission: users.create)
- `GET /users/{id}` - Get user (permission: users.view)
- `PUT /users/{id}` - Update user (permission: users.edit)
- `DELETE /users/{id}` - Delete user (permission: users.delete)
- `GET /roles` - List roles (permission: roles.view)
- `POST /roles` - Create role (permission: roles.create)
- `GET /roles/{id}` - Get role (permission: roles.view)
- `PUT /roles/{id}` - Update role (permission: roles.edit)
- `DELETE /roles/{id}` - Delete role (permission: roles.delete)
- `GET /permissions` - List permissions (permission: permissions.view)

---

## 🚀 Quick Start

1. **Test Connection:**
   ```
   GET https://shine.local.test/api/v1/test
   ```

2. **Login:**
   ```
   POST https://shine.local.test/api/v1/login
   Body: {
     "email": "wira@shineeducationbali.com",
     "password": "password"
   }
   ```

3. **Copy Token** dari response

4. **Test Protected Endpoint:**
   ```
   GET https://shine.local.test/api/v1/users
   Header: Authorization: Bearer {token}
   ```

---

**Happy Testing! 🎉**

