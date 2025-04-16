import type { UserContext } from "types/type";

import Instagram from "models/instagram";
import { waitList, waitForDownload, waitForArchiving } from "helpers/ytdlp";
import { sendFromArchive, addToArchive } from "helpers/archive";

import client from "client";

async function handleInstagram(ctx: UserContext, url: string) {
  const archive = await sendFromArchive(ctx, url);
  if (archive) return;

  let ytdlp: Instagram;
  const instance = waitList.get(url);

  if (instance) ytdlp = instance as Instagram;
  else {
    ytdlp = new Instagram(url);
    waitList.set(url, ytdlp);
  }

  try {
    const msg = await ctx.reply("⬇️ Downloading on the server...", {
      reply_parameters: { message_id: ctx.msgId! },
    });

    if (ytdlp.status == "INACTIVE") await ytdlp.downloadVideo();
    else {
      await waitForDownload(ytdlp);
      await waitForArchiving(ytdlp);
      ctx.api.editMessageText(
        ctx.chatId!,
        msg.message_id,
        "⬆️ Uploading to Telegram..."
      );
      ctx.api.sendChatAction(ctx.chatId!, "upload_video");
      await sendFromArchive(ctx, url);
      ctx.api.deleteMessage(msg.chat.id, msg.message_id);
      return;
    }

    ctx.api.editMessageText(
      ctx.chatId!,
      msg.message_id,
      "⬆️ Uploading to Telegram..."
    );

    const file = await client.sendFile(ytdlp.filePath);
    ctx.api.sendChatAction(ctx.chatId!, "upload_video");

    ctx.api.copyMessage(ctx.chatId!, file.chatId, file.msgId, {
      reply_parameters: { message_id: ctx.msgId! },
    });

    ctx.api.deleteMessage(msg.chat.id, msg.message_id);

    await addToArchive(url, file);
  } catch (error) {
    console.log(error);

    return ctx.reply("An internal operation has been failed.", {
      reply_parameters: { message_id: ctx.msgId! },
    });
  } finally {
    await ytdlp.clean();
  }

  waitList.delete(url);
}

export default handleInstagram;
