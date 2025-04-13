import type { UserContext } from "types/type";

import YTMusic from "models/youtube-music";
import { waitList, waitForDownload, waitForArchiving } from "helpers/ytdlp";
import { sendFromArchive, addToArchive } from "helpers/archive";

import { client } from "preload";

async function handleYTMusic(ctx: UserContext, url: string) {
  const archive = await sendFromArchive(ctx, url);
  if (archive) return;

  let ytdlp: YTMusic;
  const instance = waitList.get(url);

  if (instance) ytdlp = instance as YTMusic;
  else {
    ytdlp = new YTMusic(url);
    waitList.set(url, ytdlp);
  }

  const msg = await ctx.reply("⬇️ Downloading...");

  try {
    if (ytdlp.status == "INACTIVE") await ytdlp.downloadAudio();
    else {
      await waitForDownload(ytdlp);
      await waitForArchiving(ytdlp);
      await sendFromArchive(ctx, url);
      return;
    }
    await ctx.api.sendChatAction(ctx.chatId!, "upload_document");
    const file = await client.sendFile(ytdlp.filePath);
    await ctx.api.copyMessage(ctx.chatId!, file.chatId, file.msgId);
    await ctx.api.deleteMessage(msg.chat.id, msg.message_id);
    await addToArchive(url, file);
  } catch (error) {
    console.log(error);
    return ctx.reply("An internal operation has been failed. 😭");
  } finally {
    await ytdlp.clean();
  }

  waitList.delete(url);
}

export default handleYTMusic;
