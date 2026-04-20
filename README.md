# Listify  

**Listify** is a personal media tracker built around one idea: your collection should be simple to maintain, always accessible, and entirely yours. Whether you're logging games you've finished, films on your watchlist, books you're reading, or anything in between — Listify keeps it organized without getting in the way.

🚀 Listify is the next evolution of [Nightlist](https://github.com/nightrunner91/nightlist), rebuilt from the ground up with **Vue 3**, **Fastify**, **PostgreSQL**, and a refined, user-friendly interface powered by **Naive UI**.  

## ✨ Features

- 👤 Personal accounts — sign up and access your collection from any device
- 📚 Use built-in categories or create custom lists for anything that doesn't fit the defaults
- 🔄 Export your entire collection as JSON at any time — for backups, migration, or local copies
- 🔒 No tracking, no ads, no third-party data sharing
- 🌐 Open-source — inspect, fork, or self-host the entire project

## 🛠️ Tech Stack / Plugins / Assets

- [Vue 3 (Composition API)](https://vuejs.org/)
- [Fastify](https://fastify.dev/)
- [PostgreSQL](https://www.postgresql.org/)
- [Vite](https://vitejs.dev/)
- [ESLint](https://eslint.org/)
- [Naive UI](https://www.naiveui.com/en-US/)
- [Onest Font](https://fonts.google.com/specimen/Onest)
- [Phosphor Icons](https://phosphoricons.com/)

## 🖥️ Development Setup

### Recommended IDE
- [Visual Studio Code](https://code.visualstudio.com/)  
  - Install [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)  
  - Disable **Vetur** to avoid conflicts  

### Frontend

Install dependencies:

```sh
npm install
```

Start development server:

```sh
npm run dev
```

Build for production:

```sh
npm run build
```

Preview production build:

```sh
npm run preview
```

Lint code:

```sh
npm run lint
```

### Backend (API)

```sh
cd api
```

Install dependencies:

```sh
npm install
```

Start development server (with file watching):

```sh
npm run dev
```

Start production server:

```sh
npm run start
```

Generate database migration:

```sh
npm run db:generate
```

Run database migration:

```sh
npm run db:migrate
```

Open Drizzle Studio:

```sh
npm run db:studio
```

## 📦 Configuration

For customization and advanced configuration, see the [Vite Documentation](https://vitejs.dev/config/).  

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check the [issues page](../../issues).

## 📜 License

This project is released under the [MIT License](./LICENSE).  
