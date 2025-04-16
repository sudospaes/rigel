import { InlineKeyboard } from "grammy";

import type { UserContext } from "types/type";

import Youtube from "models/youtube";
import { waitList, waitForDownload, waitForArchiving } from "helpers/ytdlp";
import { sendFromArchive, addToArchive } from "helpers/archive";

import client from "client";

export async function youtubeFormatsList(ctx: UserContext, url: string) {
  const ytdlp = new Youtube(url);
  const msg = await ctx.reply("🔎 Get information...", {
    reply_parameters: { message_id: ctx.msgId! },
  });
  try {
    const formats = await ytdlp.formats();
    const keyboard = new InlineKeyboard();
    formats.forEach((format) => {
      keyboard
        .text(
          `${format.quality} - ~${format.filesize}`,
          JSON.stringify({ format: format.id, msgId: ctx.message?.message_id })
        )
        .row();
    });
    keyboard
      .text(
        "Give me this as mp3",
        JSON.stringify({ format: "mp3", msgId: ctx.message?.message_id })
      )
      .row();
    ctx.api.deleteMessage(msg.chat.id, msg.message_id);
    ctx.reply(
      `⚠️ The final file may be slightly larger due to the addition of audio.`,
      {
        reply_markup: keyboard,
        reply_parameters: { message_id: ctx.msgId! },
      }
    );
  } catch (error) {
    console.log(error);
    return ctx.reply("There is a problem getting link information. 👀", {
      reply_parameters: { message_id: ctx.msgId! },
    });
  }
}

async function handleYoutube(
  ctx: UserContext,
  url: string,
  format: string,
  msgId: string
) {
  const key = `${url}|${format}`;

  const result = await sendFromArchive(ctx, key, msgId);
  if (result) return;

  let ytdlp: Youtube;
  const instance = waitList.get(key);

  if (instance) ytdlp = instance as Youtube;
  else {
    ytdlp = new Youtube(url);
    waitList.set(key, ytdlp);
  }

  try {
    const msg = await ctx.reply("⬇️ Downloading on the server...", {
      reply_parameters: { message_id: +msgId },
    });

    if (ytdlp.status == "INACTIVE") {
      if (format == "mp3") await ytdlp.downloadAudio();
      else await ytdlp.downloadVideo(format);
    } else {
      await waitForDownload(ytdlp);
      await waitForArchiving(ytdlp);
      ctx.api.editMessageText(
        ctx.chatId!,
        msg.message_id,
        "⬆️ Uploading to Telegram..."
      );
      ctx.api.sendChatAction(ctx.chatId!, "upload_document");
      await sendFromArchive(ctx, url, msgId);
      ctx.api.deleteMessage(msg.chat.id, msg.message_id);
      return;
    }

    if (format == "mp3") {
      ctx.api.editMessageText(
        ctx.chatId!,
        msg.message_id,
        "⬆️ Uploading to Telegram..."
      );

      const file = await client.sendFile(ytdlp.filePath);
      ctx.api.sendChatAction(ctx.chatId!, "upload_document");

      ctx.api.copyMessage(ctx.chatId!, file.chatId, file.msgId, {
        reply_parameters: { message_id: +msgId },
      });

      await addToArchive(key, file);
    } else {
      ctx.api.editMessageText(
        ctx.chatId!,
        msg.message_id,
        "⬆️ Uploading to Telegram..."
      );

      const file = await client.sendVideo(ytdlp.filePath);
      ctx.api.sendChatAction(ctx.chatId!, "upload_video");

      ctx.api.copyMessage(ctx.chatId!, file.chatId, file.msgId, {
        reply_parameters: { message_id: +msgId },
      });

      await addToArchive(key, file);
    }
    ctx.api.deleteMessage(msg.chat.id, msg.message_id);
  } catch (error) {
    console.log(error);

    return ctx.reply("An internal operation has been failed.", {
      reply_parameters: { message_id: +msgId },
    });
  } finally {
    await ytdlp.clean();
  }
  waitList.delete(key);
}

export default handleYoutube;
