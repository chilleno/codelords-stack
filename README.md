# ⚔️ Codelords Stack

> The full-featured Next.js starter CLI built for serious developers by [Chillenow](https://codelords.cl)

Codelords Stack helps you bootstrap modern web apps using **Next.js**, **Prisma**, **PostgreSQL**, and **Tailwind CSS** — all configurable via an interactive CLI.  
Use it to kick off production-ready projects in seconds.

---

## ✨ Features

- ⚡️ Next.js 15+ with App Router
- 🎨 Tailwind CSS pre-configured
- 🧬 Prisma + PostgreSQL database setup
- 🔐 Optional Auth.js (Email/Password login)
- 💳 Optional LemonSqueezy integration
- ✅ `/status` page to verify feature status
- 🛠️ CLI with `npx codelords-stack` command

---

## 🚀 Quick Start

Use `npx` to instantly create your project:

```bash
npx codelords-stack
```

Then follow the interactive prompts:

- 📦 Name your project
- 🔐 Select optional features
- 🏗 Scaffolds everything automatically

After generation:

```bash
cd your-project-name
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Database Setup

Prisma is configured to use **PostgreSQL**. Your connection string is located in `.env`:

```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/mydb"
```

### Run after installing:

```bash
npx prisma generate
npx prisma db push
```

You can find the Prisma schema at `prisma/schema.prisma`.

---

## 📂 Folder Structure

```
.
├── app/                      # App router structure
│   └── status/               # Status page (DB check)
├── lib/
│   └── prisma.ts             # Dynamic Prisma client
├── prisma/
│   └── schema.prisma         # Prisma DB schema
├── .env                      # Created from .env.example
├── tailwind.config.ts
├── tsconfig.json
└── ...
```

---

## 🧪 Stack Status Page

Visit [http://localhost:3000/status](http://localhost:3000/status) to check:

- ✅ PostgreSQL database connectivity
- (Coming soon) other feature statuses

---

## 🔐 Optional Features

You can toggle optional integrations during CLI setup:

- **Auth.js**  
  Adds full authentication flow with email/password login.

- **LemonSqueezy**  
  Adds premium feature monetization with payment hooks.

You can always add these manually later, or modify your template.

---

## 🤖 CLI Usage

You can run the CLI directly with:

```bash
npx codelords-stack
```
---

## 🧠 About

**Codelords Stack** is crafted by [Chillenow](https://codelords.cl) to make professional-grade web app creation accessible and fast.

We use this stack in production for our own apps — and now, you can too.

💬 Follow us on [Instagram](https://instagram.com/chillenow) or [X](https://x.com/chillenow) for updates.

💸 Wanna tip? you cna via Github Sponsors [Github Sponsors](https://github.com/sponsors/chilleno)

---

## 🏷 License

[MIT](./LICENSE)