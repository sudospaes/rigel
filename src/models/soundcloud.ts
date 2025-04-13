import Ytdlp from "models/ytdlp";

import { spawn } from "bun";
import { join } from "path";

import { rootPath, sanitizePath } from "helpers/utils";

class SoundCloud extends Ytdlp {
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
    this.status = "PENDING";
  }
}

export default SoundCloud;
