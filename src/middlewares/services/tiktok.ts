import type { UserContext } from "types/type";

import Tiktok from "models/tiktok";
import { waitList, waitForDownload, waitForArchiving } from "helpers/ytdlp";
import { sendFromArchive, addToArchive } from "helpers/archive";

import client from "client";

async function handleTiktok(ctx: UserContext, url: string) {
  const archive = await sendFromArchive(ctx, url);
  if (archive) return;

  let ytdlp: Tiktok;
  const instance = waitList.get(url);

  if (instance) ytdlp = instance as Tiktok;
  else {
    ytdlp = new Tiktok(url);
    waitList.set(url, ytdlp);
  }

  const msg = await ctx.reply("⬇️ Downloading...");

  try {
    if (ytdlp.status == "INACTIVE") await ytdlp.downloadVideo();
    else {
      await waitForDownload(ytdlp);
      await waitForArchiving(ytdlp);
      await sendFromArchive(ctx, url);
      return;
    }

    await ctx.api.sendChatAction(ctx.chatId!, "upload_video");
    const file = await client.sendVideo(ytdlp.filePath);
    await ctx.api.copyMessage(ctx.chatId!, file.chatId, file.msgId);
    await ctx.api.deleteMessage(msg.chat.id, msg.message_id);
    await addToArchive(url, file);
  } catch (error) {
    console.log(error);
    return ctx.reply("Download operation has been failed. 😭");
  } finally {
    await ytdlp.clean();
  }

  waitList.delete(url);
}

export default handleTiktok;
