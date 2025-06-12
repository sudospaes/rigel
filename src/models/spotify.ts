import Ytdlp from "models/ytdlp";

import { spawn } from "bun";
import { join } from "path";

import { rootPath, sanitizePath } from "helpers/utils";

const cookies = join(rootPath(), "ytcookies.txt");

class Spotify extends Ytdlp {
  async downloadAudio(artist: string, song: string) {
    const _artist = artist.replaceAll(" ", "+");
    const _song = song.replaceAll(" ", "+");
    const outPath = join(rootPath(), "downloads", `%(title)s.%(ext)s`);
    this.status = "ACTIVE";
    const p = spawn(
      [
        "yt-dlp",
        "--force-ipv4",
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
        "--downloader",
        "aria2c",
        "--downloader-args",
        "aria2c:-x 16 -k 1M",
        "-I",
        "1",
        `https://music.youtube.com/search?q=${_artist}+${_song}`,
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

export default Spotify;
