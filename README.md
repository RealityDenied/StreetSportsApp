# 🏏 Street Sports INC (MERN Stack)

# Made by -  Vikash Kumar (NIT Jamshedpur)

## 📖 Overview  
**Street Sports INC** is a full-stack **MERN** web application built using **Vite + React** on the frontend and **Node.js + Express + MongoDB** on the backend.  
It provides a complete platform to **organize, manage, and participate in local street sports events** — from user registration by payment to ticket verification via QR code.

---

<div align="center">

![React](https://img.shields.io/badge/Frontend-React%20(Vite)%20%7C%20Tailwind%20CSS-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express.js-green?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen?style=for-the-badge&logo=mongodb)
![Auth](https://img.shields.io/badge/Auth-JWT%20%7C%20bcrypt-yellow?style=for-the-badge&logo=auth0)
![Payments](https://img.shields.io/badge/Payments-Stripe-blueviolet?style=for-the-badge&logo=stripe)
![Uploads](https://img.shields.io/badge/Media%20Uploads-Cloudinary-lightblue?style=for-the-badge&logo=cloudinary)
![PDF & QR](https://img.shields.io/badge/PDF%20%26%20QR-pdfkit%20%7C%20jsPDF%20%7C%20qrcode-orange?style=for-the-badge&logo=adobeacrobatreader)
![Real-time](https://img.shields.io/badge/Real--time%20Updates-Socket.IO-black?style=for-the-badge&logo=socket.io)


</div>

---


##  Core Functionalities  

1. Secure **user authentication** (JWT + bcrypt)  
2. **Role-based actions** for organizers, players, and audiences  
3. **Create and manage events** with multiple matches  
4. **Real-time scoreboard** and highlights by Socket.io 
5. **Media uploads** using Cloudinary  
6. **Stripe-based payments** with automatic **PDF ticket generation**  
7. **QR code scanning** or ID validation for event entry  
8. **Responsive UI** using tailwind for mobile and tablet screens.

---

##  Tech Stack  

| Category | Technology |
|-----------|-------------|
| **Frontend** | React (Vite), Tailwind CSS, React Router, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB |
| **Authentication** | JWT, bcrypt |
| **Payments** | Stripe API |
| **Media Uploads** | Cloudinary |
| **PDF & QR** | pdfkit / jsPDF, qrcode / react-qr-scanner |
| **Real-time Updates** | Socket.IO (live score and event updates) |


---

## Key Features  

###  Authentication & Security  
- **User Signup & Login** system with JWT-based authentication  
- **Password Hashing** using bcrypt for strong security  
- Session management with secure tokens  

---

###  UI & Onboarding  
- **5-Step Onboarding Flow** to guide users through app setup  
- **Hero Section** introducing the platform  
- **Highlights Carousel Section** for showcasing events and media  

---

### Event & Match Management  
- **Create / Edit / Delete Events** by organizers  
- Within each event, **create multiple matches**  
- **Add Players / Members** to matches  
- **Live Scoreboard Updates** and **editable highlights**  
- Upload **photos or videos** of matches and highlights using **Cloudinary**  

---

### Payment & Ticketing  
- **Stripe Integration** for player registration fees or audience ticket purchases  
- After successful payment, a **PDF ticket** is generated for the user  
- Tickets include a **unique QR code** or **ticket ID string**  
- Organizers can **scan QR codes** or validate ticket IDs to verify entry  

---

## 👨‍💻 Author  
**Vikash Kumar**  
**NIT Jamshedpur**
