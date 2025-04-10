# Rigel, A cool downloader bot 🌠

A personal Telegram bot for downloading from various media. 😉
<br/>
<br/>
This bot supports concurrency, meaning that if multiple users request the same content simultaneously, it downloads the file only once and sends it to all of them.

**Supported media:**

- 📌 Pinterest (Video)
- 📺 Youtube (Video / Audio)
- 🎧 Youtube Music
- 👯 Tiktok (Video)

## Admin's Commands

| Command | Example                        | Description                    |
| ------- | ------------------------------ | ------------------------------ |
| /add    | /add 12345667 <-- (user id)    | Add a user to can use bot      |
| /remove | /remove 12345667 <-- (user id) | Remove a user to can't use bot |
| /users  | /users                         | Show allowed users             |

## Usage

Just send your media link to bot and get your content 😃. Of course, the admin needs to add users who are allowed to use the bot to the list of users using the commands mentioned.

## Setup and deploy

1.  Install [Bun](https://bun.sh)
2.  Download latest version from [Releases](https://github.com/sudospaes/rigel/releases)
3.  Extract downloaded zip
4.  Move to extracted directory
5.  Run `bun i` to install dependencies
6.  Create `.env` in the current directory and paste these in that

```env
ADMIN_ID="Admin User Id" // You can get it from @userinfobot
ADMIN_UN="Amin Telegram Id" // Your username without @
BOT_TOKEN="Your Bot Token"
```

7. Run `bun run init` and `bun start`
