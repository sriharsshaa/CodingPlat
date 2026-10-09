# CodingPlat – Online Coding Practice Platform

CodingPlat is a full-stack web application designed to help users practice coding problems, improve their problem-solving skills, and track their submissions. It provides a simple interface for browsing problems, filtering by difficulty and topic, and reviewing submission results.

## Features

* **Problem Listing** – Browse coding problems with descriptions and difficulty levels.
* **Search and Filtering** – Search problems by title or topic and filter by difficulty.
* **Topic Tags** – Explore problems by their associated topics.
* **User Authentication** – Register and log in to access protected features.
* **Code Submission Tracking** – View previous submissions and their results.
* **Submission Details** – Review submission status, runtime, memory usage, programming language, and submitted code.
* **Solved Problem Tracking** – Identify problems that have been solved.
* **User Profile** – Access profile information through the navigation menu.
* **Responsive Interface** – A clean interface for navigating the platform.
* **Light and Dark Themes** – Switch between light and dark modes for a comfortable coding experience.

## Tech Stack

### Frontend

* React
* JavaScript
* HTML5
* CSS3
* React Router
* Monaco Editor (if enabled in your current setup)

### Backend

* Java
* Spring Boot
* REST APIs
* Maven

### Database

* MySQL (if configured in your current backend)

### Development Tools

* Visual Studio Code
* Git
* GitHub
* Postman (for API testing)

## Project Structure

```text
CodingPlat/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   │   └── main/
│   ├── pom.xml
│   └── ...
│
├── .gitignore
└── README.md
```

*Note: Update the folder names above to match your actual project structure.*

## Getting Started

### Prerequisites

Install the following before running the application:

* Node.js and npm
* Java Development Kit (JDK)
* Maven, if it is not included through the Maven Wrapper
* MySQL, if your backend uses MySQL
* Git

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/CodingPlat.git
cd CodingPlat
```

Replace `YOUR_USERNAME` with your GitHub username.

### 2. Run the Frontend

Open a terminal in your frontend directory:

```bash
npm install
npm run dev
```

The Vite development server typically runs at:

http://localhost:5173

### 3. Run the Backend

Open another terminal in your backend directory:

```bash
./mvnw spring-boot:run
```

On Windows Command Prompt or PowerShell, use:

```powershell
.\mvnw.cmd spring-boot:run
```

If your project doesn't contain the Maven Wrapper, use:

```bash
mvn spring-boot:run
```

The backend runs at:

http://localhost:8080

### 4. Configure the Database

If your backend uses MySQL, configure the database connection in your local Spring Boot configuration.

Example settings:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/codingplat
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
```

Set the required environment variables on your machine. Do not commit real database credentials or secrets to GitHub.

## API

The backend exposes REST endpoints for application functionality.

| Endpoint                               | Purpose                                                |
| -------------------------------------- | ------------------------------------------------------ |
| `GET /api/problems`                    | Retrieve coding problems                               |
| `GET /api/submissions/solved-problems` | Retrieve solved problem IDs for the authenticated user |

Additional authentication, problem details, and submission endpoints depend on the routes implemented in your backend.



Users can review their submission history and inspect available result details.

## Future Improvements

* Add more coding problems and topic categories.
* Improve code execution and automated test-case evaluation.
* Expand user statistics and progress tracking.
* Add leaderboards and coding streaks.
