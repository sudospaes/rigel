import type { UserContext } from "types/type";

import SoundCloud from "models/soundcloud";
import { waitList, waitForDownload, waitForArchiving } from "helpers/ytdlp";
import { sendFromArchive, addToArchive } from "helpers/archive";

import { client } from "preload";

async function handleSoundCloud(ctx: UserContext, url: string) {
  const archive = await sendFromArchive(ctx, url);
  if (archive) return;

  let ytdlp: SoundCloud;
  const instance = waitList.get(url);

  if (instance) ytdlp = instance as SoundCloud;
  else {
    ytdlp = new SoundCloud(url);
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

export default handleSoundCloud;
