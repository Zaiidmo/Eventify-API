# Eventify - API 

# Eventify API

Eventify is a backend API built with **NestJS** designed for event management. It allows users to register, discover events, and participate in them. The API is fully **dockerized** for easy deployment and scalability. It uses **JWT** for authentication and integrates with a database for managing users, events, and registrations.

This repository contains the backend logic for an event management system, providing the necessary endpoints for user authentication, event creation, and participation. It is suitable for both small and large-scale event management systems.

## Features

- **User Authentication**: Users can register, log in, and securely authenticate using JWT.
- **Event Management**: Users can discover events, view event details, and register for events.
- **Dockerized API**: The backend is fully dockerized, allowing for easy containerization and deployment.
- **Database Integration**: The API integrates with a database to manage user and event data.

## Tech Stack

- **NestJS**: A powerful Node.js framework for building scalable and maintainable server-side applications.
- **JWT Authentication**: Secure authentication using JSON Web Tokens.
- **Mongoose**: ODM for interacting with the database.
- **Docker**: Containerization of the backend for easy deployment.
- **MongoDB**: Used for storing data.

## Setup & Installation

Follow these steps to get the project up and running:

### Prerequisites

- Docker
- Node.js (if you’re not using Docker)
- Docker Hub account (for pushing images)

### Clone the repository

```bash
git clone https://github.com/zaiidmo/eventify-api.git
cd eventify-api
``` 

### Setup the environment variables 

Since this application uses sensitive data (such as database credentials), it's important to configure your .env file properly. Do not commit your .env file to version control for security reasons.

```bash
cp .env.exampl .env
```

### Install dependencies

If you're not using Docker, you can install the dependencies by running:
```bash
npm install 
```

### Run the application with docker

To build and run the application in Docker, use the following command:
```bash
docker build -t eventify-api .
```
This will build the Docker image and start the API server. The application will be available on `http://localhost:3000`.

### Run the application without Docker

If you're running the application directly on your local machine, you can start the server using:
```bash
npm run start
``` 

### Dockerizing the Application

This project is dockerized for easy deployment. The Dockerfile defines how to build the image, while docker-compose.yml simplifies the setup process, especially for local development.
To build the Docker image manually, you can run:

```bash
docker build -t yourusername/eventify-api:latest .
```

To push the Docker image to Docker Hub:
```bash
docker push yourusername/eventify-api:latest
```
### API Documentation 


### Running Tests

```bash
npm test 
```

### CI/CD with Github Actions

This project uses GitHub Actions for continuous integration and deployment. The action is configured to:
1. Build the project and run tests
2. Dockerize the application 
3. Push the Docker image to Docker Hub if all tests pass.

### Contributing 
Feel free to fork this repository, submit issues, or create pull requests. Contributions are welcome! 

### How to contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature-name`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature-name`)
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Thank you for using **Eventify API**. We hope this backend will help you build amazing event management applications!