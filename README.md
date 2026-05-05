# <p align="center">Listify</p>

<p align="center">
  <strong>Your personal media collection. Always accessible, entirely yours.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/Node.js-%3E%3D20.0.0-6da55f?style=for-the-badge&logo=node.js" alt="Node Version">
  <img src="https://img.shields.io/badge/Vue-3.2.47-4fc08d?style=for-the-badge&logo=vue.js" alt="Vue Version">
  <img src="https://img.shields.io/badge/Fastify-5.3.3-000000?style=for-the-badge&logo=fastify" alt="Fastify">
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169e1?style=for-the-badge&logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Drizzle--ORM-0.43.1-c5f74f?style=for-the-badge&logo=drizzle" alt="Drizzle ORM">
</p>

---

## Overview

**Listify** is a sleek, modern media tracker designed for those who want to keep their collections organized without the clutter of social features or ads. Whether you're logging games, movies, books, or anything in between, Listify provides a premium, responsive interface to manage your personal library.

Built from the ground up as the successor to [Nightlist](https://github.com/nightrunner91/nightlist), it leverages **Vue 3**, **Fastify**, and **PostgreSQL** to deliver a fast, secure, and highly customizable experience.

## Key Features

- 👤 **Personalized Accounts** — Secure sign-up and synchronization.

- 📦 **Build-in Categories** — Games, TV Shows, Films, Manga, Books, and Music.

- 📋 **Custom Lists** — Create and manage bespoke lists for specialized collections.

- 🌍 **Multi-Language Support** — EN, DE, ES, FR, PL, RO, RU, UK.

- ✨ **Intuitive UI** — Lightweight design powered by Naive UI.

- 💾 **Data Sovereignty** — Import and export your collection at any time.

- 🛡️ **Privacy Focused** — No tracking, no ads, and no third-party data sharing.

- ⚡ **High Performance** — Optimized Vue 3 / Vite and a lightweight Fastify backend.

- 🏗️ **Open-source** — Inspect, fork, or self-host the entire project.

## Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | [Vue 3](https://vuejs.org/) | Composition API & Script Setup |
| **Backend** | [Fastify](https://fastify.dev/) | High-performance Node.js framework |
| **Database** | [PostgreSQL](https://www.postgresql.org/) | Relational database via [Drizzle ORM](https://orm.drizzle.team/) |
| **Styling** | [Naive UI](https://www.naiveui.com/) | Curated component library & design system |
| **State** | [Pinia](https://pinia.vuejs.org/) | Modern Vue store management |
| **Build** | [Vite](https://vitejs.dev/) | Next-generation frontend tooling |

## External Data Sources

Listify integrates with several high-quality external APIs to provide instant autocompletion and rich metadata for your collections:

- 🎮 **[RAWG API](https://rawg.io/apidocs)**: The primary source for the **Games** category.
- 🎬 **[TMDB API](https://www.themoviedb.org/documentation/api)**: Powers discovery for **Films** and **TV Shows**.
- 📖 **[Jikan API](https://jikan.moe/)**: A free, open-source API for the MyAnimeList database, used for **Anime** and **Manga**.
- 🎵 **[iTunes Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/index.html)**: Provides a reliable catalog for **Books** and **Music**.

> [!IMPORTANT]
> Some providers (RAWG, TMDB) require an API key. If you're hosting your own application ensure these are correctly configured in your `api/.env` file to enable autocompletion features.

## Getting Started

### Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 9.0.0
- **PostgreSQL** (running locally or via Docker)

### 1. Clone & Install

```bash
git clone https://github.com/nightrunner91/listify.git
cd listify
npm install
cd api && npm install && cd ..
```

### 2. Environment Setup

Create a `.env` file in the `api/` directory:

```bash
cp api/.env.example api/.env
```

Edit `api/.env` with your database credentials and secret keys.

### 3. Database Migration

```bash
cd api
npm run db:generate
npm run db:migrate
```

### 4. Run Development Servers

**Frontend:**
```bash
npm run dev
```

**Backend:**
```bash
cd api
npm run dev
npm run db:studio
```

## Project Structure

```text
.
├── api/                    # Backend (Node.js + Fastify)
│   ├── src/
│   │   ├── db/             # Database connection & Drizzle schemas
│   │   ├── routes/         # API endpoints (Auth, Records, Lists)
│   │   ├── plugins/        # Fastify plugins (i18n, Rate limit, etc.)
│   │   ├── middleware/     # Custom Fastify hooks
│   │   ├── services/       # Business logic layer
│   │   └── app.js          # Fastify application setup
│   └── drizzle/            # SQL migration files
│
├── src/                    # Frontend (Vue 3 + Vite)
│   ├── api/                # API client configuration
│   ├── components/         # Reusable UI components
│   ├── features/           # Feature-based components & logic
│   ├── i18n/               # Localization files
│   ├── router/             # Vue Router configuration
│   ├── stores/             # Pinia state management
│   ├── views/              # Main application pages
│   └── theme.config.js     # Naive UI theme overrides
├── public/                 # Static assets & favicon
└── package.json            # Root scripts & dependencies
```

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ by <a href="https://t.me/nightrunner91">nightrunner91</a>
</p>
