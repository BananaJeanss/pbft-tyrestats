<div align="center">

<img src="./public/tyrebanner.png" >

### PB Formula Truck raceday statistics dashboard & analyzer

[![Website](https://img.shields.io/badge/Website-pbft--tyrestats.vercel.app-blue?style=flat-square&logo=vercel)](https://pbft-tyrestats.vercel.app/)
![Next.js](https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![GitHub deployments](https://img.shields.io/github/deployments/BananaJeanss/pbft-tyrestats/Production?style=flat-square&logo=vercel&label=Deployment)
![GitHub License](https://img.shields.io/github/license/bananajeanss/pbft-tyrestats?style=flat-square)
![GitHub repo size](https://img.shields.io/github/repo-size/BananaJeanss/pbft-tyrestats?style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/BananaJeanss/pbft-tyrestats?style=flat-square)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/BananaJeanss/pbft-tyrestats?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/BananaJeanss/pbft-tyrestats?style=flat-square&logo=github&label=Issues)
![GitHub pull requests](https://img.shields.io/github/issues-pr/BananaJeanss/pbft-tyrestats?style=flat-square&logo=github&label=PRs)
![GitHub Repo stars](https://img.shields.io/github/stars/BananaJeanss/pbft-tyrestats?style=flat-square)
![GitHub forks](https://img.shields.io/github/forks/BananaJeanss/pbft-tyrestats?style=flat-square)

</div>

<hr>

## About

TyreStats is a relatively simple to use webapp to generate strategies for PB Formula Truck races that use tyre compounds & wear.

Using it is simple, head to <https://pbft-tyrestats.vercel.app/>, create a session, insert any data & notes, and it'll generate a race strategy for you, along with the optional AI strategy generator.

Don't want to log in? No problem! You have the freedom to choose between logging in via Roblox OAuth2 to store data online, or using LocalStorage, 100% core functionality is available for everyone.

## Features

- 55% Local, no mandatory login needed
- 45% Cloud, using Roblox OAuth2 to store sessions and more on a database (along with higher limits for logged in users)
- PWA support
- Create sessions to store data
- Insert & extract tyre data via screenshot or manually inserting data.
- Auto & Manual timeline display
- AI Strategy generator (with ratelimits)
- Auto-Save, full data export/import/deletion via settings.

## Quick Start for Development

### Requirements

- [Bun](https://bun.sh/) installed
- [Docker](https://www.docker.com/) installed (for Database & Redis)

---

1. Clone the repository

   ```bash
   git clone https://github.com/BananaJeanss/pbft-tyrestats.git
   cd pbft-tyrestats
   ```

2. Install dependencies

   ```bash
   bun i
   ```

3. Setup environment variables

   ```bash
   cp .env.example .env
   ```

4. Start the database containers (optional, if using docker for postgres/redis)

   ```bash
   docker compose up -d
   ```

5. Run database migrations

   ```bash
   bun run prisma migrate deploy
   ```

6. Run the development server

   ```bash
   npm run dev
   ```

> [!NOTE]
> npm run dev uses `--experimental-https` for PWA support, you may be prompted to generate a self-signed certificate. You can alternatively run `npm run dev-nohttps` for plain http.

7. Open [https://localhost:3000](https://localhost:3000) in your browser to see the app.

## Contributing

Contributions are always welcome!

Fork the repo, make your changes & commit them, then open a pull request.

Make sure `npm run build` works before submitting a PR.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
