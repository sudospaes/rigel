import { join } from "path";

import ffmpeg from "fluent-ffmpeg";

import { rootPath } from "helpers/utils";

import type { VideoMetadata } from "types/interface";

export async function getMetadata(filePath: string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, data) => {
      if (err) return reject(err);
      if (!data.streams[0]) return reject(new Error("No stream found"));
      resolve({
        height: data.streams[0].height!,
        width: data.streams[0].width!,
        duration: data.format.duration!,
      });
    });
  });
}

export async function getThumbnail(filePath: string): Promise<string> {
  const uuid = Bun.randomUUIDv7();
  const thumbPath = join(rootPath(), "thumbnails", `${uuid}.jpg`);
  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .thumbnail({
        count: 1,
        filename: `${uuid}.jpg`,
        size: "320x320",
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
