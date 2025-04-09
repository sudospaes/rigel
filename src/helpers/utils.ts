import Ytdlp from "models/ytdlp";

export function rootPath() {
  return process.cwd();
}

export function sanitizePath(path: string): string {
  return path.trim().replace(/^"|"$/g, "");
}

export async function waitForDownload(ytdlp: Ytdlp) {
  while (ytdlp.status == "ACTIVE") {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

export const waitList = new Map<string, Ytdlp>();
