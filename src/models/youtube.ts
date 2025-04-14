import Ytdlp from "models/ytdlp";
import type { YTVideoInfo } from "types/interface";

import { spawn } from "bun";
import { join } from "path";

import { rootPath, sanitizePath } from "helpers/utils";

const cookies = join(rootPath(), "ytcookies.txt");

class Youtube extends Ytdlp {
  async formats() {
    const p = spawn(["yt-dlp", "--cookies", cookies, "-F", this.url], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const exitCode = await p.exited;
    if (exitCode != 0) {
      this.status = "INACTIVE";
      const stderr = await new Response(p.stderr).text();
      throw stderr;
    }
    const pOut = await new Response(p.stdout).text();
    const lines = pOut.trim().split("\n");
    const qualitys = new Map<string, YTVideoInfo>();
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
        filesizeInMB < 1500
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
      `%(title).50s-%(format_id)s.%(ext)s`
    );
    this.status = "ACTIVE";
    const p = spawn(
      [
        "yt-dlp",
        "--cookies",
        cookies,
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
      const stderr = await new Response(p.stderr).text();
      throw stderr;
    }
    const path = await new Response(p.stdout).text();
    this.filePath = sanitizePath(path);
    this.status = "PENDING";
  }

  async downloadAudio() {
    const outPath = join(rootPath(), "downloads", `%(title).50s.%(ext)s`);
    this.status = "ACTIVE";
    const p = spawn(
      [
        "yt-dlp",
        "--cookies",
        cookies,
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
      const stderr = await new Response(p.stderr).text();
      throw stderr;
    }
    const path = await new Response(p.stdout).text();
    this.filePath = sanitizePath(path);
    this.status = "PENDING";
  }
}

export default Youtube;
