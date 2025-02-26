# Social Network - A Facebook-like Application

Welcome to the **Social Network** project! This is a Facebook-like social network application built using **Next.js** for the frontend and backend, **SQLite** for the database, and **Docker** for containerization. The application includes features like user profiles, followers, posts, groups, notifications, and real-time chat.

---

## Table of Contents

1. [Features](#features)
2. [Technologies Used](#technologies-used)
3. [Project Structure](#project-structure)
4. [Setup and Installation](#setup-and-installation)
   - [Prerequisites](#prerequisites)
   - [Local Development](#local-development)
   - [Docker Setup](#docker-setup)
5. [Running the Application](#running-the-application)
6. [API Documentation](#api-documentation)
7. [Contributing](#contributing)
8. [License](#license)

---

## Features

The Social Network application includes the following features:

1. **User Authentication**:
   - Register and login with email, password, and optional fields like avatar, nickname, and bio.
   - Session management using cookies.

2. **Profiles**:
   - Public and private profiles.
   - Display user information, posts, followers, and following.

3. **Followers**:
   - Follow and unfollow other users.
   - Follow requests for private profiles.

4. **Posts**:
   - Create posts with text, images, or GIFs.
   - Set post privacy (public, followers-only, or private).

5. **Groups**:
   - Create and join groups.
   - Post and comment within groups.
   - Create and RSVP to group events.

6. **Real-Time Chat**:
   - Private messaging between users.
   - Group chat for members of a group.

7. **Notifications**:
   - Notifications for follow requests, group invitations, and event updates.

---

## Technologies Used

- **Frontend**:
  - Next.js (React framework)
  - Tailwind CSS (for styling)
  - Socket.IO (for real-time chat)

- **Backend**:
  - Next.js API Routes
  - SQLite (database)
  - Bcrypt (password hashing)
  - Express-session (session management)

- **DevOps**:
  - Docker (containerization)
  - Docker Compose (orchestration)

- **Other Tools**:
  - Turbopack (Next.js dev bundler for faster builds)
  - SQLite3 (database library)
  - UUID (for generating unique IDs)

---

## Project Structure
```
social-network/
├── public/                  # Static assets (images, fonts, etc.)
├── src/
│   ├── components/          # Reusable UI components (e.g., Navbar, Footer)
│   ├── pages/               # Next.js pages (each file corresponds to a route)
│   │   ├── api/             # API routes (backend logic)
│   │   ├── auth/            # Authentication pages (login, register)
│   │   ├── profile/         # User profile pages
│   │   ├── posts/           # Post-related pages
│   │   ├── groups/          # Group-related pages
│   │   ├── chat/            # Chat pages
│   │   ├── notifications/   # Notifications page
│   │   ├── index.js         # Home page
│   │   └── _app.js          # Custom App component (for global styles, state)
│   ├── styles/              # CSS or SCSS files
│   ├── utils/               # Utility functions (e.g., API calls, helpers)
│   ├── hooks/               # Custom React hooks
│   ├── context/             # React context for global state (e.g., auth, notifications)
│   ├── lib/                 # Library functions (e.g., database connection)
│   └── types/               # TypeScript types (if using TypeScript)
├── .env.local               # Environment variables (e.g., API keys, secrets)
├── next.config.js           # Next.js configuration
├── package.json             # Project dependencies and scripts
└── README.md                # Project documentation
```
---

## Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- Docker (optional, for containerization)
- SQLite (for the database)

---

### Local Development

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/social-network.git
   cd social-network
   ```

2. **Install Dependencies**:
   - For the frontend:
     ```bash
     cd frontend
     npm install
     ```
   - For the backend:
     ```bash
     cd backend
     npm install
     ```

3. **Set Up the Database**:
   - Run the SQLite migrations to create the necessary tables:
     ```bash
     cd backend
     npm run migrate
     ```

4. **Start the Development Server**:
   - For the frontend:
     ```bash
     cd frontend
     npm run build
     npm start
     ```
   - For the backend:
     ```bash
     cd backend
     npm start
     ```

5. **Access the Application**:
   - Open your browser and navigate to `http://localhost:3000`.

---

### Docker Setup

1. **Build and Run the Docker Containers**:
   ```bash
   docker-compose up --build
   ```

2. **Access the Application**:
   - Open your browser and navigate to `http://localhost:3000`.

---

## Running the Application

- **Development Mode**:
  - Use `npm run dev` in the `frontend` folder to start the Next.js development server with Turbopack.
  - Use `npm start` in the `backend` folder to start the backend server.

- **Production Mode**:
  - Build the application using `npm run build` in the `frontend` folder.
  - Start the production server using `npm start`.

---

## API Documentation

The backend API routes are documented using Swagger. To access the API documentation:

1. Start the backend server.
2. Navigate to `http://localhost:3000/api-docs`.

---

## Contributing

We welcome contributions to the Social Network project! If you'd like to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes and push them to your fork.
4. Submit a pull request with a detailed description of your changes.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **Next.js** for providing a powerful framework for building React applications.
- **SQLite** for offering a lightweight and efficient database solution.
- **Docker** for simplifying containerization and deployment.

---

Thank you for checking out the Social Network project! If you have any questions or feedback, feel free to open an issue or reach out to the maintainers. Happy coding! 🚀