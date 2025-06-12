import { join } from "path";

import ffmpeg from "fluent-ffmpeg";

import { rootPath } from "helpers/utils";

import type { VideoMetadata } from "types/interface";

export async function getMetadata(filePath: string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, data) => {
      if (err) return reject(err);
      if (!data.streams[0]) return reject(new Error("No stream found"));
      let height: number, width: number;
      for (const index of data.streams) {
        if (index.height && index.width) {
          height = index.height;
          width = index.width;
          break;
        }
      }
      resolve({
        height: height!,
        width: width!,
        duration: data.format.duration!,
      });
    });
  });
}

export async function getThumbnail(width: number, height: number, filePath: string): Promise<string> {
  const uuid = Bun.randomUUIDv7();
  const thumbPath = join(rootPath(), "thumbnails", `${uuid}.jpg`);
  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .thumbnail({
        count: 1,
        filename: `${uuid}.jpg`,
        size: `${width}x${height}`,
        folder: join(rootPath(), "thumbnails"),
      })
      .on("end", () => {
        return resolve(thumbPath);
      })
      .on("error", (err) => {
        return reject(err);
      });
  });
}
