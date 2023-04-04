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

  useEffect(() => {
    if (token) {
      getTopTracks();
    }
  }, [token]);

  async function getTopTracks() {
    try {
      console.log("spotifyApi:", spotifyApi); // Add this line
      console.log("accessToken:", token); // Add this line
      const response = await spotifyApi.getMyTopTracks({
        time_range: "long_term",
        limit: 16,
      });
      setTopTracks(response.items);
      console.log(response.items);
    } catch (err) {
      console.error(spotifyApi.getAccessToken);
      console.error("Error retrieving top tracks:", err.response);
    }
  }

  return (
    <div>
      {token ? (
        <div>
          <p>{token}</p>
          {topTracks.length > 0 && (
            <ul>
              {topTracks.map((track) => (
                <li key={track.id}>{track.name}</li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <SpotifyAuth
          clientID="ed8e6a84c4d94b31a47fa7f4d8e8c274"
          redirectUri="http://localhost:3000/callback"
          scopes={[
            "streaming",
            "user-read-private",
            "user-read-email",
            "user-top-read",
          ]}
          onAccessToken={onAccessToken}
        />
      )}
    </div>
  );
}

export default Main;
