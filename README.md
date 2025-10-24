# 🎉 Eventify API

**Eventify API** is a powerful, Dockerized backend built with **NestJS** for managing events, users, and registrations.  
It provides secure authentication, efficient database integration, and CI/CD automation — ideal for both small and enterprise-scale event platforms.

<p align="left">
  <img alt="NestJS" src="https://img.shields.io/badge/NestJS-Framework-red">
  <img alt="MongoDB" src="https://img.shields.io/badge/Database-MongoDB-brightgreen">
  <img alt="Docker" src="https://img.shields.io/badge/Container-Docker-blue">
  <img alt="JWT" src="https://img.shields.io/badge/Auth-JWT-orange">
  <img alt="CI/CD" src="https://img.shields.io/badge/CI/CD-GitHub_Actions-black">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-green">
</p>

---

## 🚀 Overview

Eventify provides the backbone for your event management ecosystem.  
It enables users to **create, discover, and register for events**, manage profiles, and authenticate securely via JWT.  
Built on **NestJS** and **MongoDB**, it’s fully containerized for scalability and CI/CD-ready.

---

## ✨ Features

- 🔐 **User Authentication** — Secure JWT-based login and registration.  
- 🗓️ **Event Management** — Create, edit, and explore events effortlessly.  
- 🧩 **Database Integration** — Seamless data persistence via **Mongoose**.  
- 🐳 **Dockerized Architecture** — Ready-to-deploy image for any environment.  
- ⚙️ **CI/CD Pipeline** — GitHub Actions automate testing, building, and Docker deployment.  

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-------------|
| Framework | NestJS |
| Database | MongoDB (Mongoose) |
| Authentication | JWT |
| Containerization | Docker |
| CI/CD | GitHub Actions |

---

## ⚙️ Setup & Installation

### 1️⃣ Prerequisites

Ensure you have:
- Docker installed  
- Node.js (if running locally)  
- A Docker Hub account (for image pushing)

### 2️⃣ Clone Repository
```bash
git clone https://github.com/zaiidmo/eventify-api.git
cd eventify-api
```

### 3️⃣ Environment Configuration
Create a `.env` file using the provided example:
```bash
cp .env.example .env
```

---

## 🧩 Installation Options

### 🐳 Using Docker
Build and run the image:
```bash
docker build -t eventify-api .
```
Then access the API at **http://localhost:3000**.

### 💻 Without Docker
Install dependencies and run the app locally:
```bash
npm install
npm run start
```

---

## 🐋 Dockerizing the Application

This project includes a **Dockerfile** for quick containerization.  
To build your image manually:
```bash
docker build -t yourusername/eventify-api:latest .
```
Push to Docker Hub:
```bash
docker push yourusername/eventify-api:latest
```

---

## 🧪 Running Tests

Run all test suites:
```bash
npm test
```
Tests include unit, integration, and e2e coverage for controllers and services.

---

## 🔄 CI/CD with GitHub Actions

Eventify’s CI/CD pipeline automates testing and Docker image publishing.  
The workflow performs the following steps:
1. Lint and build the application  
2. Run automated tests  
3. Build the Docker image  
4. Push the image to Docker Hub upon success  

You can visualize or edit this under `.github/workflows/ci.yml`.

---

## 📘 API Documentation

Full API reference is generated automatically (Swagger integration recommended).  
Once deployed, access docs via:
```
http://localhost:3000/api/docs
```

---

## 🤝 Contributing

Contributions are always welcome!  
To contribute:
1. Fork the repo  
2. Create a branch (`git checkout -b feature-name`)  
3. Commit (`git commit -am "Add feature"`)  
4. Push and open a Pull Request  

Refer to [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

---

## 🧩 Roadmap

- [ ] Add event categories & filters  
- [ ] Integrate payment gateway for premium events  
- [ ] Deploy production pipeline on AWS ECS  
- [ ] Add Swagger docs auto-generation  

---

## 🛡️ Security

Report any security issues responsibly via email: **vlphadev@gmail.com**  
See [SECURITY.md](SECURITY.md) for details.

---

## 🪪 License

Licensed under the **MIT License** — see [LICENSE](LICENSE).

---

## 💬 Contact & Community

Maintained by **[Zaiid Moumni](https://zaiid.moumni.uk)**  
📧 Contact: **vlphadev@gmail.com**  
Join discussions and feature ideas in Issues & PRs.  

---

_“Built with ❤️ using NestJS — scalable, modular, and open.”_
