import { InlineKeyboard } from "grammy";

import type { UserContext } from "types/type";

import Youtube from "models/youtube";
import { waitList, waitForDownload, waitForArchiving } from "helpers/ytdlp";
import { sendFromArchive, addToArchive } from "helpers/archive";

import { client } from "preload";

export async function youtubeFormatsList(ctx: UserContext, url: string) {
  const ytdlp = new Youtube(url);
  const msg = await ctx.reply("🔎 Get information...");
  try {
    const formats = await ytdlp.formats();
    const keyboard = new InlineKeyboard();
    formats.forEach((format) => {
      keyboard
        .text(`${format.quality} - ~${format.filesize}`, `format_${format.id}`)
        .row();
    });
    keyboard.text("Give me this as mp3", "format_mp3").row();
    await ctx.api.deleteMessage(msg.chat.id, msg.message_id);
    await ctx.reply(
      `⚠️ The final file may be slightly larger due to the addition of audio.`,
      {
        reply_markup: keyboard,
      }
    );
  } catch (error) {
    console.log(error);
    return ctx.reply("There is a problem getting link information. 👀");
  }
}

async function handleYoutube(ctx: UserContext, url: string, format: string) {
  const key = `${url}|${format}`;

  const result = await sendFromArchive(ctx, key);
  if (result) return;

  let ytdlp: Youtube;
  const instance = waitList.get(key);

  if (instance) ytdlp = instance as Youtube;
  else {
    ytdlp = new Youtube(url);
    waitList.set(key, ytdlp);
  }

  const msg = await ctx.reply("⬇️ Downloading...");

  try {
    if (ytdlp.status == "INACTIVE") {
      if (format == "mp3") await ytdlp.downloadAudio();
      else await ytdlp.downloadVideo(format);
    } else {
      await waitForDownload(ytdlp);
      await waitForArchiving(ytdlp);
      await sendFromArchive(ctx, url);
      return;
    }

    if (format == "mp3") {
      await ctx.api.sendChatAction(ctx.chatId!, "upload_document");
      const file = await client.sendFile(ytdlp.filePath);
      await ctx.api.copyMessage(ctx.chatId!, file.chatId, file.msgId);
      await addToArchive(key, file);
    } else {
      await ctx.api.sendChatAction(ctx.chatId!, "upload_video");
      const file = await client.sendVideo(ytdlp.filePath);
      await ctx.api.copyMessage(ctx.chatId!, file.chatId, file.msgId);
      await addToArchive(key, file);
    }
    await ctx.api.deleteMessage(msg.chat.id, msg.message_id);
  } catch (error) {
    console.log(error);
    return ctx.reply("An internal operation has been failed. 😭");
  } finally {
    await ytdlp.clean();
  }
  waitList.delete(key);
}

export default handleYoutube;
