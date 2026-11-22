# ArtifyHub – Digital Art Marketplace

ArtifyHub is a full-stack digital art marketplace designed to connect digital artists with collectors. It provides a platform where artists can showcase and manage their creative work, while collectors can discover artworks, interact with artists, maintain wishlists, and manage their purchases.

The platform also includes role-based dashboards, social interactions, notifications, and curator management tools to provide a complete digital art marketplace experience.

## Project Demo

Watch the complete demonstration of **ArtifyHub – Digital Art Marketplace**.

[![ArtifyHub Project Demo](https://img.youtube.com/vi/q22JeKvSMf0/maxresdefault.jpg)](https://youtu.be/q22JeKvSMf0)

[Click here to watch the full project demonstration](https://youtu.be/q22JeKvSMf0)

## Features

- **Role-Based Authentication:** Dedicated access for digital artists, collectors, and platform curators.
- **Artwork Marketplace:** Discover artworks with search, trending, and popularity filters.
- **Artist Portfolios:** Public artist profiles and personalized portfolios.
- **Artwork Management:** Publish, edit, like, and comment on artworks.
- **Collector Wishlist:** Save favourite artworks for later.
- **Purchase Vault:** Access purchased artworks and manage collections.
- **Social Interactions:** Follow artists and engage with the creative community.
- **Notifications:** Stay updated with social activities and platform interactions.
- **Transaction Management:** Dedicated transaction dashboards for artists and collectors.
- **Curator Dashboard:** Platform management tools for curators.
- **JWT Security:** Secure API authentication and authorization.
- **API Documentation:** Interactive OpenAPI and Swagger documentation.
- **Quick Demo Access:** Demo sign-in options for project evaluation.

---

## Tech Stack

### Frontend
- React 19
- Redux Toolkit
- React Router
- Axios
- Tailwind CSS
- React Scripts

### Backend
- Java 17
- Spring Boot 3.2.5
- Spring Security
- Spring Data JPA
- JWT Authentication
- MySQL
- SpringDoc OpenAPI
- Maven
- Lombok

---

## Project Architecture

ArtifyHub follows a frontend-backend architecture.

- **Frontend:** React-based user interface.
- **Backend:** Spring Boot REST API.
- **Database:** MySQL for persistent data storage.
- **Authentication:** JWT-based authentication and Spring Security.
- **Communication:** REST API requests using Axios.

---

## Project Structure

```text
ArtifyHub/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── data/
│       ├── mocks/
│       ├── services/
│       ├── store/
│       ├── App.js
│       └── index.js
│
└── backend/
    ├── src/
    │   └── main/
    │       ├── java/com/example/demo/
    │       └── resources/
    └── pom.xml
```

---

## Prerequisites

Make sure the following tools are installed:

- [Node.js 18 or newer](https://nodejs.org/)
- npm
- [Java 17](https://www.oracle.com/java/technologies/downloads/)
- [MySQL 8](https://dev.mysql.com/downloads/mysql/)
- Maven or the included Maven Wrapper

---

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Vijayaarun-git/ArtifyHub.git
cd ArtifyHub
```

### 2. Configure the Database

Create the MySQL database:

```sql
CREATE DATABASE IF NOT EXISTS artify_hub;
```

Open the backend configuration file:

```text
backend/src/main/resources/application.properties
```

Configure your local database credentials:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/artify_hub?createDatabaseIfNotExist=true
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

Configure a development JWT secret:

```properties
jwt.secret=YOUR_LONG_RANDOM_SECRET_KEY
jwt.expiration=86400000
```

**Security Note:** Never commit actual database credentials, JWT secrets, or other sensitive information to GitHub. Use environment variables or a private local configuration file.

### 3. Start the Backend

Navigate to the backend directory:

```bash
cd backend
```

Run the Spring Boot application:

**Linux / macOS:**
```bash
./mvnw spring-boot:run
```

**Windows PowerShell:**
```powershell
.\mvnw.cmd spring-boot:run
```

The backend will be available at:

```text
http://localhost:8080
```

### 4. Access Swagger API Documentation

Once the backend is running, open:

[http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

This provides interactive documentation for exploring and testing available REST API endpoints.

### 5. Start the Frontend

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Configure the backend API URL in the frontend environment file if necessary.

Start the React development server:

```bash
npm start
```

The frontend will be available at:

[http://localhost:3000](http://localhost:3000)

---

## Demo Accounts

ArtifyHub provides **Quick Demo Evaluation Sign-In** options on the login page:

- **Demo Collector**
- **Demo Artist**

These demo options use client-side demonstration sessions and do not require backend credentials.

**Note:** Demo sessions are intended for project evaluation and should not be treated as production authentication.

---

## Frontend Configuration

By default, the frontend uses the following backend API URL:

```text
http://localhost:8080/api
```

To configure a different API URL, create a `.env` file inside the `frontend/` directory:

```env
REACT_APP_API_URL=http://localhost:8080/api
```

Restart the frontend development server after changing environment variables.

For production deployment, replace the local URL with your deployed backend API URL.

---

## Available Frontend Scripts

Run these commands inside the `frontend/` directory:

| Command | Description |
|---|---|
| `npm start` | Starts the development server |
| `npm run build` | Creates a production build |
| `npm test` | Runs the test suite |
| `npm run eject` | Ejects the Create React App configuration |

---

## API Overview

ArtifyHub provides REST API endpoints for authentication, artwork discovery, user interactions, transactions, and platform management.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate a user |
| PUT | `/api/auth/profile` | Update user profile |

### Artwork Discovery

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/artworks/explore` | Explore artworks |
| GET | `/api/artworks/search` | Search artworks |
| GET | `/api/artworks/trending` | Retrieve trending artworks |
| GET | `/api/artworks/most-liked` | Retrieve popular artworks |
| GET | `/api/artworks/{id}/view` | Access artwork details |

Additional endpoints support artist portfolios, artwork interactions, wishlists, transactions, notifications, follows, and curator operations.

For complete API details, refer to the Swagger documentation.

---

## Production Build

### Build the Frontend

```bash
cd frontend
npm run build
```

The optimized production build will be generated in:

```text
frontend/build/
```

### Build the Backend

```bash
cd backend
./mvnw clean package
```

On Windows PowerShell:

```powershell
.\mvnw.cmd clean package
```

The packaged Spring Boot application will be generated in:

```text
backend/target/
```

---

## Security

ArtifyHub incorporates the following security practices:

- Password hashing using Spring Security and BCrypt.
- JWT-based authentication for protected API requests.
- Role-based authorization using Spring Security.
- CORS configuration for local frontend development.
- Externalized database credentials and JWT secrets for deployment.

**Important:** Demo sessions are for evaluation purposes only. Production deployments should use secure backend authentication and properly managed environment variables.

---

## Future Enhancements

Potential improvements for future versions include:

- Payment gateway integration.
- AI-powered artwork recommendations.
- Advanced artist analytics dashboard.
- Real-time notifications.
- Cloud-based artwork storage.
- Enhanced marketplace discovery and personalization.

---

## Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch:

```bash
git checkout -b feature/your-feature-name
```

3. Commit your changes:

```bash
git commit -m "Add your feature"
```

4. Push your branch:

```bash
git push origin feature/your-feature-name
```

5. Open a Pull Request.

---

## License

No license file is currently included. All rights remain with the project author unless a license is explicitly added.

---

**Developed with Java, Spring Boot, React, and MySQL.**
