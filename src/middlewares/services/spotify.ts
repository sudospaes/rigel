import { InputFile } from "grammy";

import type { UserContext } from "types/type";

import Spotify from "models/spotify";
import { waitList, waitForDownload, waitForArchiving } from "helpers/ytdlp";
import { sendFromArchive, addToArchive } from "helpers/archive";

import { getTrackDetails, getTrackId } from "helpers/spotify";

const caption = Bun.env.CAPTION as string;

async function handleSpotify(ctx: UserContext, url: string) {
  const archive = await sendFromArchive(ctx, url);
  if (archive) return;

  let ytdlp: Spotify;
  const instance = waitList.get(url);

  if (instance) ytdlp = instance as Spotify;
  else {
    ytdlp = new Spotify(url);
    waitList.set(url, ytdlp);
  }

  try {
    const msg = await ctx.reply("⬇️ Downloading on the server...", {
      reply_parameters: { message_id: ctx.msgId! },
    });

    const trackId = getTrackId(url);
    const track = await getTrackDetails(trackId);

    if (ytdlp.status == "INACTIVE") {
      await ytdlp.downloadAudio(track.song, track.artist);
    } else {
      await waitForDownload(ytdlp);
      await waitForArchiving(ytdlp);
      ctx.api.editMessageText(ctx.chatId!, msg.message_id, "⬆️ Uploading to Telegram...");
      await sendFromArchive(ctx, url);
      ctx.api.deleteMessage(msg.chat.id, msg.message_id);
      return;
    }

    ctx.api.editMessageText(ctx.chatId!, msg.message_id, "⬆️ Uploading to Telegram...");

    const file = await ctx.replyWithAudio(new InputFile(ytdlp.filePath), {
      reply_parameters: { message_id: ctx.msgId! },
      caption,
    });

    ctx.api.deleteMessage(msg.chat.id, msg.message_id);

    await addToArchive(url, {
      chatId: file.chat.id.toString(),
      msgId: file.message_id,
    });
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

export default handleSpotify;
