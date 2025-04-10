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

export interface YTVideosInfo {
  id: string;
  quality: string;
  filesize: string;
}
