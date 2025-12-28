# ⚔️ Codelords Stack
[![NPM version][npm-image]][npm-url]

> The full-featured Next.js starter CLI built for serious developers by [Chillenow](https://codelords.cl)

Codelords Stack helps you bootstrap modern web apps using **Next.js**, **Prisma**, **PostgreSQL**, and **Tailwind CSS** — all configurable via an interactive CLI.  
Use it to kick off production-ready projects in seconds.

---

## ✨ Features

- ⚡️ Next.js 15+ with App Router
- 🎨 Tailwind CSS pre-configured
- 🧬 Prisma + PostgreSQL database setup
- 🔐 Optional Better Auth (Email/Password login)
- 💳 Optional LemonSqueezy integration (WIP 🚧)
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

## ⚙️ Database Setup

Prisma is configured to use **PostgreSQL**. Your connection string is located in `.env`:


```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/postgres?schema=database_name_db"
```

### Run after installing:

```bash
npx prisma generate
npx prisma db push
```


You can find the Prisma schema at `prisma/schema.prisma`.

### To create a new migration, modify schema.prisma and then run:  

```bash
 npx prisma migrate dev --name name_of_migration;
```

### To reset database run:  [⚠️ this command will be remove all the tables on your connected database]

```bash
 npx prisma migrate reset
```


### to push the schema to the database, run the following command:

```bash
 npx prisma db push
```

---

## ⚙️ Run after database is configured:
```bash
cd your-project-name
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

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

- **Better Auth**  
  Adds full authentication flow with email/password login, registration, and session management.
  Includes customizable user roles (default: `user`, `admin`).

- **LemonSqueezy**  
  Adds premium feature monetization with payment hooks.

You can always add these manually later, or modify your template.

---

## 🔧 Customizing User Roles

Roles are stored as strings for flexibility. Default roles: `user`, `admin`

To customize roles in your generated project:
1. Edit `prisma/schema.prisma` - change the `role` field default value
2. Edit `src/lib/auth.ts` - update the `additionalFields.role` configuration
3. Run `npx prisma generate && npx prisma db push`

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

💸 Wanna tip? you can via Github Sponsors [Github Sponsors](https://github.com/sponsors/chilleno)

---

## 🏷 License

[MIT](./LICENSE)

[npm-url]: https://www.npmjs.com/package/codelords-stack
[npm-image]: https://img.shields.io/npm/v/codelords-stack?color=0b7285&logoColor=0b7285
