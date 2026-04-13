# 🚀 Modern Full-Stack Portfolio

Professional, high-performance portfolio website featuring a responsive UI, AI-integrated chat, and a robust contact system.

![GitHub last commit](https://img.shields.io/github/last-commit/Kishore-june/portfolio?style=flat-square&color=38bdf8)
![License](https://img.shields.io/github/license/Kishore-june/portfolio?style=flat-square&color=38bdf8)

---

## ✨ Key Features

- **🎯 Interactive UI:** Sleek, modern design with smooth animations and glassmorphism.
- **📩 Robust Contact System:** Integrated with Gmail API (Nodemailer) featuring automated fallback and rate limiting.
- **📱 Fully Responsive:** Optimized for all screen sizes, from mobile to desktop.
- **⚡ AI Integration:** Optimized for LLM-based interactions and dynamic content.
- **🛠️ Serverless Ready:** Designed for seamless deployment on Vercel or similar platforms.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3 (Vanilla + Modern Flex/Grid), JavaScript (ES6+)
- **Backend:** Node.js, Express.js
- **Services:** Nodemailer (Gmail API), OpenRouter (AI Models)
- **Deployment:** Vercel

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Kishore-june/portfolio.git
cd portfolio
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add the following keys:

```env
GMAIL_USER=your_gmail@gmail.com
GMAIL_PASS=your_app_password
RECIPIENT_EMAIL=your_inbox@gmail.com
OPENROUTER_API_KEY=your_api_key
```
> [!IMPORTANT]
> Never commit your `.env` file to version control. It is already included in `.gitignore`.

### 4. Run locally
```bash
npm start
```
The app will be available at `http://localhost:3000`.

---

## 🌎 Deployment

This project is optimized for **Vercel**. To deploy:
1. Push your code to GitHub.
2. Link your repository to Vercel.
3. Add the keys from your `.env` file to the **Environment Variables** section in the Vercel dashboard.

---

## 📄 License
MIT License - feel free to use this project as a template for your own portfolio!

---
*Designed & Developed by [Kishore S](https://github.com/Kishore-june)*
