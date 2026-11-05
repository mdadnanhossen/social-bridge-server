# Social Bridge – Backend

Social Bridge is a community service platform that connects volunteers with people in need. This repository contains the backend server responsible for event management, database operations, and secure API access.

## 🚀 Technologies Used

- Node.js
- Express.js
- MongoDB
- Better Auth (JWT Authentication)
- JOSE
- CORS
- dotenv

## ✨ Features

- Secure JWT-based authentication using Better Auth JWKS.
- Create community service events.
- Retrieve all available events.
- Retrieve individual event details.
- Update existing events.
- Delete events.
- Organizer-based event ownership verification.
- MongoDB database integration.
- Protected API routes using JWT verification.

## 📁 Project Structure

```text
social-bridge-server/
├── node_modules/
├── .env
├── .gitignore
├── index.js
├── package.json
├── package-lock.json
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone YOUR_BACKEND_REPOSITORY_URL
```

### 2. Navigate to the Project Directory

```bash
cd social-bridge-server
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
BETTER_AUTH_URL=your_frontend_auth_base_url
```

**Note:** Replace the placeholder values with your actual configuration. Never share or commit your `.env` file.

### 5. Run the Server

For development:

```bash
npm run dev
```

For production:

```bash
npm start
```

## 🔗 API Endpoints

Base URL:

```text
http://localhost:5000
```

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| GET | `/` | Check server status | Public |
| POST | `/create-event` | Create a new event | Required |
| GET | `/create-event` | Get all events | Public |
| GET | `/upcoming-event/:id` | Get a single event | Public |
| PUT | `/events/:id` | Update an event | Required |
| DELETE | `/events/:id` | Delete an event | Required |

## 🔐 Authentication

Protected routes use Bearer Token authentication.

The server verifies JWT tokens using Better Auth's JSON Web Key Set (JWKS) endpoint.

Include the access token in the request header:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## 🗄️ Database

- Database: `Social-Bridge`
- Collection: `events`

MongoDB is used to store and manage community service event information.

## 🌐 Deployment

The backend can be deployed to platforms such as Vercel or other Node.js hosting services.

Make sure to configure the required environment variables in your deployment platform before deploying.

## 👨‍💻 Developer

**Md Adnan Hossen**

- GitHub: [mdadnanhossen](https://github.com/mdadnanhossen)
- LinkedIn: [adnan35](https://linkedin.com/in/adnan35)

---

<p align="center">
  Built with ❤️ for community service and social impact.
</p>