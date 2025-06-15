import SpotifyWebApi from "spotify-web-api-node";

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

let tokenExpirationTime = 0;

async function ensureValidToken() {
  if (Date.now() > tokenExpirationTime) {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body.access_token);
    tokenExpirationTime = Date.now() + (data.body.expires_in * 1000);
  }
}

export async function getSpotifyTrack(id: string) {
  await ensureValidToken();
  const track = await spotifyApi.getTrack(id);
  return {
    type: "track",
    id,
    title: track.body.name,
    artist: track.body.artists[0].name,
    imageUrl: track.body.album.images[0]?.url,
  };
}

export async function getSpotifyAlbum(id: string) {
  await ensureValidToken();
  const album = await spotifyApi.getAlbum(id);
  return {
    type: "album",
    id,
    title: album.body.name,
    artist: album.body.artists[0].name,
    imageUrl: album.body.images[0]?.url,
  };
}

export async function getSpotifyArtist(id: string) {
  await ensureValidToken();
  const [artist, follows] = await Promise.all([
    spotifyApi.getArtist(id),
    spotifyApi.getArtistRelated(id),
  ]);

  // Extract social links from external URLs
  const socialLinks: Record<string, string> = {};
  if (artist.body.external_urls) {
    if (artist.body.external_urls.spotify) {
      socialLinks.website = artist.body.external_urls.spotify;
    }
    // Note: We would need to implement additional logic to get Instagram/Twitter
    // links as they're not directly available from the Spotify API
  }

  return {
    type: "artist",
    id,
    title: artist.body.name,
    imageUrl: artist.body.images[0]?.url,
    socialLinks,
  };
}
