import Ytdlp from "models/ytdlp";
import type { YTVideosInfo } from "types/interface";

import { spawn } from "bun";
import { join } from "path";

import { rootPath, sanitizePath } from "helpers/utils";

class Youtube extends Ytdlp {
  async formats() {
    const p = spawn(["yt-dlp", "-F", this.url], {
      stdout: "pipe",
      stderr: "pipe",
    });
    let pOut: string = "";
    try {
      pOut = await new Response(p.stdout).text();
    } catch (error) {
      throw error;
    }
    const lines = pOut.trim().split("\n");
    const qualitys = new Map<string, YTVideosInfo>();
    for (const line of lines) {
      const parts = line.split(/\s+/);
      const id = parts[0];
      const qualityMatch = line.match(/(\d+p\d*)/);
      const quality = qualityMatch ? qualityMatch[0] : "unknown";
      const filesizeMatch = line.match(/(\d+\.\d+MiB|\d+MiB)/);
      const filesize = filesizeMatch ? filesizeMatch[0] : "unknown";
      let filesizeInMB = 0;
      if (filesize !== "unknown") {
        filesizeInMB = parseFloat(filesize);
      }
      if (
        id &&
        quality !== "unknown" &&
        filesize !== "unknown" &&
        filesizeInMB < 20
      ) {
        if (
          !qualitys.has(quality) ||
          filesizeInMB < parseFloat(qualitys.get(quality)!.filesize)
        ) {
          qualitys.set(quality, { id, quality, filesize });
        }
      }
    }
    return Array.from(qualitys.values());
  }

  async downloadVideo(formatId: string) {
    const outPath = join(
      rootPath(),
      "downloads",
      `%(title)s-%(format_id)s.%(ext)s`
    );
    this.status = "ACTIVE";
    const p = spawn(
      [
        "yt-dlp",
        "-f",
        `${formatId}+ba`,
        "--recode-video",
        "mp4",
        "-o",
        outPath,
        this.url,
        "--quiet",
        "--exec",
        "echo {}",
      ],
      {
        stderr: "pipe",
        stdout: "pipe",
      }
    );
    const exitCode = await p.exited;
    if (exitCode != 0) {
      this.status = "INACTIVE";
      const err = new Error(await new Response(p.stderr).text());
      throw err;
    }
    const path = await new Response(p.stdout).text();
    this.filePath = sanitizePath(path);
    this.status = "INACTIVE";
  }

  async downloadAudio() {
    const outPath = join(rootPath(), "downloads", `%(title)s.%(ext)s`);
    this.status = "ACTIVE";
    const p = spawn(
      [
        "yt-dlp",
        "--extract-audio",
        "--audio-format",
        "mp3",
        "-f",
        "ba",
        "--embed-thumbnail",
        "--add-metadata",
        "-o",
        outPath,
        this.url,
        "--quiet",
        "--exec",
        "echo {}",
      ],
      {
        stderr: "pipe",
        stdout: "pipe",
      }
    );
    const exitCode = await p.exited;
    if (exitCode != 0) {
      this.status = "INACTIVE";
      const err = new Error(await new Response(p.stderr).text());
      throw err;
    }
    const path = await new Response(p.stdout).text();
    this.filePath = sanitizePath(path);
    this.status = "INACTIVE";
  }
}

export default Youtube;
