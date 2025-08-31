
# Collaborative Candidate Notes MVP

A **real-time collaborative platform** for recruiters and hiring managers to share candidate feedback, interact in real-time, and receive tag-based notifications.

---

## Table of Contents

- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Project Structure](#project-structure)  
- [Installation](#installation)  
- [Environment Variables](#environment-variables)  
- [Run the Application](#run-the-application)  
- [Usage](#usage)  
- [Backend Models](#backend-models)  
- [Screenshots](#screenshots)  
- [License](#license)  

---

## Features

- **User Authentication**
  - Sign up / Login with email and password
  - Passwords hashed securely with bcrypt
- **Real-Time Collaboration**
  - Chat for candidate-specific notes
  - Multiple users can view and edit notes simultaneously
- **Tag-Based Notifications**
  - Mention users with `@username` in messages
  - Tagged users receive instant notifications
- **Candidate Management**
  - Create, view, and navigate candidate profiles
- **Responsive UI**
  - Built with React, Tailwind CSS, and Shadcn UI
  - Modular, reusable components

---

## Tech Stack

| Frontend       | Backend           | Database        | Real-Time     |
|----------------|-------------------|-----------------|---------------|
| React          | Node.js           | MongoDB         |   Socket.IO   |
| Tailwind CSS   | Express.js        | Mongoose        |               |
| Shadcn UI      |                   |                 |               |

---

## Project Structure

```

src/
├── api/
│     └── index.js        # API calls
├── components/
│     ├── ui/             # Reusable UI components
│     ├── authForm/       # Login/signup forms
│     ├── candidateNotes/ # Candidate notes & chat
│     ├── dashboard/      # Main dashboard
│     ├── header/         # App header
│     └── Layout/         # Layout wrapper
├── context/
│     └── authContext.js  # Authentication context
├── hooks/
│     └── useSocket.js    # Custom hook for real-time updates
├── lib/
├── utils/
└── app.jsx               # App entry point

server/
├── config/
├── Controllers/
├── middleware/
├── models/
├── routes/
└── server.js

````

---

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/<your-username>/collaborative-candidate-notes.git
cd fronted
npm install
````

2. **Install dependencies**

```bash
# Backend
cd server
npm install

---

## Environment Variables

Create a `.env` file in the `server` folder:

```
PORT=4000
MONGO_URI=<your_mongo_connection_string>
CLIENT_URL=http://localhost:5173
JWT_SECRET=<your_jwt_secret>
```

---

## Run the Application

### Backend

```bash
cd server
npm run dev
```

### Frontend

```bash
cd client
npm run dev
```

* Backend: `http://localhost:4000`
* Frontend: `http://localhost:5173`

---

## Usage

1. Login or sign up as a recruiter/hiring manager.
2. Dashboard shows all candidates and global notifications.
3. Click **Add Candidate** to create a new candidate.
4. Click a candidate to open `CandidateNotes` page:

   * View all messages/notes
   * Send messages
   * Tag users using `@username` to notify them
5. Real-time updates reflect immediately for all connected users.

---

## Backend Models

* **User:** name, email, password
* **Candidate:** name, email, createdBy
* **Message:** candidateId, senderId, body, tags
* **Notification:** userId, messageId, candidateId, read status

---


## License

License © SRIKANTH BANOTH

```
