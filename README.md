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
- 🔊 Spotify

## Admin's Commands

| Command  | Example                                       | Description                    |
| -------- | --------------------------------------------- | ------------------------------ |
| /users   | /users                                        | Show allowed users             |
| /add     | /add 12345667 <-- (user id) name <-- (a name) | Add a user to can use bot      |
| /remove  | /remove 12345667 <-- (user id)                | Remove a user to can't use bot |
| /clean   | /clean                                        | Delete all allowed users       |
| /destroy | /destroy                                      | Clearing the entire archive    |

## Usage

Just send your media link to bot and get your content 😃. Of course, the admin needs to add users who are allowed to use the bot to the list of users using the commands mentioned.

## Setup and deploy

1.  Install [Bun](https://bun.sh), [Ytdlp](https://github.com/yt-dlp/yt-dlp/wiki/Installation#installing-the-release-binary), [ffmpeg](https://ffmpeg.org/) and [aria2](https://github.com/aria2/aria2).
2.  Install [Docker](https://docs.docker.com/engine/install/) and run [aiogram/telegram-bot-api](https://hub.docker.com/r/aiogram/telegram-bot-api) image as a container.
3.  Clone it this repo `git clone https://github.com/sudospaes/rigel.git`.
4.  Move to cloned directory.
5.  Run `bun i` to install dependencies.
6.  Create `.env` in the current directory and paste these in that.

```env
ADMIN_ID="" # You can get it from @userinfobot.
ADMIN_UN="" # Your username without @ if you want.
BOT_TOKEN="" # Your bot token.
LOCAL_API="" # Your telegram-bot-api container address.
SPOTIFY_CLIENT_ID="" # Get this from developer.spotify.com.
SPOTIFY_CLIENT_SECRET="" # Get this from developer.spotify.com.
CAPTION="" # Bot messages caption.
```

7. Create `ytcookies.txt` in the current directory and put your youtube cookies on that.
8. Run `bun run init --name first_init` to initialize database for the first time.
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
bun run init --name new_update

```

## FAQ

#### How does the bot communicate with ytdlp ?

It executes ytdlp as a process and understands its output. Although not advanced, it is good for having a lightweight wrapper and not depending on additional packages.

#### Why we need local bot api ?

To bypass the limitations of regualr bots on Telegram. [Read This](https://core.telegram.org/bots/api#using-a-local-bot-api-server)

#### Why we use Spotify developer console ?

Spotify uses a DRM to prevent crawling and ytdlp is not able to directly get its content. So using the official Spotify APIs we get the song name and its creator and using ytdlp I download that song from YouTube Music.

The reason I didn't use spotdl was that it is a separate core and had limited documentation and parameters for implementing the warpper.
