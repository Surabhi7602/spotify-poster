import React, { useState, useEffect } from "react";
import { SpotifyAuth, Scopes } from "react-spotify-auth";
import SpotifyWebApi from "spotify-web-api-js";
import axios from "axios";

const spotifyApi = new SpotifyWebApi();

function Main() {
  const [token, setToken] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [albumCovers, setAlbumCovers] = useState([]);

  const onAccessToken = (accessToken) => {
    setToken(accessToken);
    spotifyApi.setAccessToken(accessToken);
  };

  async function getTopTracks() {
    const TOP_TRACKS_ENDPOINT = `https://api.spotify.com/v1/me/top/tracks`;

    axios
      .get(TOP_TRACKS_ENDPOINT, {
        headers: {
          Authorization: "Bearer " + token,
        },
      })
      .then((response) => setTopTracks(response.data))
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    var tracks = getTopTracks();
    setTopTracks(tracks);
  }, [token]);

  return (
    <div>
      {token ? (
        <div>
          <p>{token}</p>
        </div>
      ) : (
        <SpotifyAuth
          clientID="ed8e6a84c4d94b31a47fa7f4d8e8c274"
          redirectUri="http://localhost:3000/callback"
          scopes={["streaming", "user-read-private", "user-read-email"]}
          onAccessToken={onAccessToken}
        />
      )}
    </div>
  );
}

export default Main;
