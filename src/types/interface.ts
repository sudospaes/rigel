export interface UserSessionData {
  user: {
    id: string;
    role: "ADMIN" | "USER";
    media?: {
      type: "pin" | "yt" | "ytm" | "tt" | "ig" | "sc";
      url: string;
    };
  } | null;
}

export interface YTVideoInfo {
  id: string;
  quality: string;
  filesize: string;
}

export interface FileMessage {
  msgId: number;
  chatId: string;
}

export interface VideoMetadata {
  height: number;
  width: number;
  duration: number;
}
