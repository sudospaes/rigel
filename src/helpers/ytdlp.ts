import type Ytdlp from "models/ytdlp";

export async function waitForDownload(ytdlp: Ytdlp) {
  while (ytdlp.status == "ACTIVE") {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

export async function waitForArchiving(ytdlp: Ytdlp) {
  while (ytdlp.status == "PENDING") {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

export const waitList = new Map<string, Ytdlp>();
