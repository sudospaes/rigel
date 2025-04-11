import { InputFile, InlineKeyboard } from "grammy";

import type { UserContext } from "types/type";

import Youtube from "models/youtube";
import { waitList, waitForDownload } from "helpers/utils";

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
      `Select one of the options:
      ⚠️ The final file may be slightly larger due to the addition of audio.`,
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
  let ytdlp: Youtube;
  const instance = waitList.get(`${url}|${format}`);

  if (instance) ytdlp = instance as Youtube;
  else {
    ytdlp = new Youtube(url);
    waitList.set(`${url}|${format}`, ytdlp);
  }

  const msg = await ctx.reply("⬇️ Downloading...");

  try {
    if (ytdlp.status == "INACTIVE") {
      if (format == "mp3") await ytdlp.downloadAudio();
      else await ytdlp.downloadVideo(format);
    } else await waitForDownload(ytdlp);

    if (format == "mp3") {
      await ctx.api.sendChatAction(ctx.chatId!, "upload_document");
      await ctx.replyWithAudio(new InputFile(ytdlp.filePath));
    } else {
      await ctx.api.sendChatAction(ctx.chatId!, "upload_video");
      await ctx.replyWithVideo(new InputFile(ytdlp.filePath));
    }

    await ctx.api.deleteMessage(msg.chat.id, msg.message_id);
    await ytdlp.clean();
  } catch (error) {
    console.log(error);
    return ctx.reply("Download operation has been failed. 😭");
  }
  waitList.delete(`${url}|${format}`);
}

export default handleYoutube;
