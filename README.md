<div align="center">
  <img src="https://raw.githubusercontent.com/Varun0054/Class_Manager/main/public/next.svg" alt="ClassArena Logo" width="120" />
  <h1>🎯 ClassArena</h1>
  <p><strong>Next-Generation Random Student Picker & Classroom Management System</strong></p>
  
  <p>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
    <a href="https://appwrite.io/"><img src="https://img.shields.io/badge/Appwrite-Backend-FD366E?style=for-the-badge&logo=appwrite" alt="Appwrite" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" /></a>
    <a href="https://zustand-demo.pmnd.rs/"><img src="https://img.shields.io/badge/Zustand-State-yellow?style=for-the-badge" alt="Zustand" /></a>
  </p>
</div>

<hr />

## 🌟 Overview

**ClassArena** is a beautifully designed, gamified classroom management tool built for modern educators. Replace your physical popsicle sticks and messy spreadsheets with a sleek, dynamic web application that handles student selection, team building, and engagement tracking seamlessly.

Designed with an **Offline-First Architecture**, the application remains snappy and fully functional without an internet connection, automatically synchronizing your data to the **Appwrite Cloud** in the background the moment you reconnect!

## ✨ Key Features

- 🎲 **Interactive Lottery System**: Randomly select students with customizable sound effects, confetti animations, and visual flair.
- 👥 **Smart Team Builder**: Instantly group students into balanced teams based on team size or desired number of teams.
- 🏆 **Gamified Leaderboard**: Track student participation and award points to encourage active classroom engagement.
- 📊 **Rich Analytics & History**: Keep a transparent record of all draws, selections, and classroom statistics.
- 💾 **Offline-First Sync**: Powered by Zustand persist and an intelligent sync queue—never lose data, even on spotty school Wi-Fi.
- 🎨 **Modern Aesthetics**: Built with Tailwind CSS featuring glassmorphism, dynamic blob backgrounds, and smooth micro-animations.

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or newer
- An [Appwrite](https://appwrite.io/) Cloud account (for database syncing)

### 1. Clone the repository
```bash
git clone https://github.com/Varun0054/Class_Manager.git
cd Class_Manager
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add your Appwrite credentials:
```env
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DB_ID=your_database_id
NEXT_PUBLIC_APPWRITE_CLASSROOMS_COLLECTION_ID=classrooms
NEXT_PUBLIC_APPWRITE_STUDENTS_COLLECTION_ID=students
```

### 4. Run the development server
```bash
npm run dev
# or
yarn dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Backend/Database:** [Appwrite](https://appwrite.io/)
- **Icons:** [Lucide React](https://lucide.dev/)

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Varun0054/Class_Manager/issues).

## 📄 License
This project is licensed under the MIT License.
