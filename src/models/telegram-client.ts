import { join } from "path";

import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

import { rootPath } from "helpers/utils";
import { getMetadata, getThumbnail } from "helpers/ffmpeg";

import type { FileMessage } from "types/interface";

const channelId = Bun.env.CHANNEL_ID as string;
const caption = Bun.env.CAPTION as string;

class TGClient {
  private client: TelegramClient;
  constructor(apiId: number, apiHash: string, session?: string) {
    if (session) {
      this.client = new TelegramClient(
        new StringSession(session),
        apiId,
        apiHash,
        {
          connectionRetries: 5,
        }
      );
    } else {
      this.client = new TelegramClient(new StringSession(""), apiId, apiHash, {
        connectionRetries: 5,
      });
    }
  }

  async start() {
    await this.client.start({
      phoneNumber: async () => {
        return prompt("Number: ")!;
      },
      password: async () => {
        return prompt("Pass: ")!;
      },
      phoneCode: async () => {
        return prompt("Code: ")!;
      },
      onError: (err) => console.log(err),
    });
  }

  async saveSession() {
    const session = this.client.session.save() as unknown;
    await Bun.write(join(rootPath(), "session"), session as string);
  }

  async sendFile(filePath: string): Promise<FileMessage> {
    try {
      const file = await this.client.sendFile(channelId, {
        file: filePath,
        caption,
      });
      return {
        msgId: file.id,
        chatId: file.chatId!.toString(),
      };
    } catch (error) {
      throw error;
    }
  }

  async sendVideo(filePath: string): Promise<FileMessage> {
    try {
      const metadata = await getMetadata(filePath);
      const thumb = await getThumbnail(filePath);
      const file = await this.client.sendFile(channelId, {
        file: filePath,
        caption,
        thumb,
        attributes: [
          new Api.DocumentAttributeVideo({
            duration: metadata.duration,
            h: metadata.height,
            w: metadata.width,
            supportsStreaming: true,
          }),
        ],
      });
      await Bun.file(thumb).delete();
      return {
        msgId: file.id,
        chatId: file.chatId!.toString(),
      };
    } catch (error) {
      throw error;
    }
  }
}

export default TGClient;
