import type { SpotifyResponse } from "types/interface";

const spotifyClientId = Bun.env.SPOTIFY_CLIENT_ID as string;
const spotifyclientSecret = Bun.env.SPOTIFY_CLIENT_SECRET as string;

async function getAccessToken(): Promise<string> {
  const auth = btoa(`${spotifyClientId}:${spotifyclientSecret}`);
  const data = new URLSearchParams();
  data.append("grant_type", "client_credentials");
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: data.toString(),
    });
    const jsonResponse = await response.json();
    return jsonResponse.access_token;
  } catch (error) {
    throw error;
  }
}

export async function getTrackDetails(trackId: string): Promise<SpotifyResponse> {
  try {
    const token = await getAccessToken();

    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const res = await response.json();
    const trackData: SpotifyResponse = {
      song: res.album.name,
      artist: res.artists[0].name,
    };
    return trackData;
  } catch (error) {
    throw error;
  }
}

export function getTrackId(url: string) {
  const trackId = url.match(/(?<=track\/)([a-zA-Z0-9]+)/)?.at(0) as string;
  return trackId;
}
