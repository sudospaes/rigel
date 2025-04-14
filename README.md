# Rigel, A cool downloader bot 🌠

A personal Telegram bot for downloading from various media. Powered by ytdlp 😉
<br/>
<br/>
This bot supports concurrency, meaning that if multiple users request the same content simultaneously, it downloads the file only once and sends it to all of them.

**Supported media:**

- 📌 Pinterest (Video)
- 📺 Youtube (Video / Audio)
- 🎧 Youtube Music
- 👯 Tiktok (Video)
- 📸 Instagram (Video)
- ☁️ SoundCloud

## Admin's Commands

| Command | Example                                       | Description                    |
| ------- | --------------------------------------------- | ------------------------------ |
| /add    | /add 12345667 <-- (user id) name <-- (a name) | Add a user to can use bot      |
| /remove | /remove 12345667 <-- (user id)                | Remove a user to can't use bot |
| /users  | /users                                        | Show allowed users             |

## Usage

Just send your media link to bot and get your content 😃. Of course, the admin needs to add users who are allowed to use the bot to the list of users using the commands mentioned.

## Setup and deploy

1.  Install [Bun](https://bun.sh), [Ytdlp](https://github.com/yt-dlp/yt-dlp/wiki/Installation#installing-the-release-binary), [ffmpeg](https://ffmpeg.org/) and [aria2](https://github.com/aria2/aria2).
2.  Clone it this repo `git clone https://github.com/sudospaes/rigel.git`.
3.  Move to cloned directory.
4.  Run `bun i` to install dependencies.
5.  Create `.env` in the current directory and paste these in that.

```env
ADMIN_ID="" You can get it from @userinfobot.
ADMIN_UN="" Your username without @ if you want.
BOT_TOKEN="" Your bot token.
API_ID="" Your API id, get it from my.telegram.org.
API_HASH="" Your API hash, get it from my.telegram.org.
CHANNEL_ID="" Your channel id for achivtion, You can get it from @username_to_id_bot.
CAPTION="" Bot messages caption.
```

6. Create a private or public channel and add your bot to that.
7. Create `ytcookies.txt` in the current directory and put your youtube cookies on that.
8. Run `bun run init first_init` to initialize database for the first time.
9. Run `bun start` and insert your telegram account infomation.
10. Done! if everything is correct, you should see "Bot is running...".

## How to update

1. Stop bot
2. Move to cloned directory.
3. Run these commands:

```bash
git fetch origin
git merge origin/main
git restore bun.lock
git pull origin main
bun i
bun run init new_update

```
