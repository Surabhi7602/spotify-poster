import React, { useState, useEffect } from "react";
import { SpotifyAuth, Scopes } from "react-spotify-auth";
import SpotifyWebApi from "spotify-web-api-js";
import "./Main.css";

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
      if (response.items.length > 0) {
        generateAlbumUrls(response.items);
      }
    } catch (err) {
      console.error(spotifyApi.getAccessToken);
      console.error("Error retrieving top tracks:", err.response);
    }
  }

  function generateAlbumUrls(items) {
    const coverUrls = [];
    for (const track of items) {
      const album = track.album;
      if (album) {
        const images = album.images;
        if (images && images.length > 0) {
          for (const image of images) {
            if (image.height === 640) {
              coverUrls.push(image.url);
              break;
            }
          }
        }
      }
    }
    setAlbumCovers(coverUrls);
    console.log(coverUrls);
  }

  // function renderAlbumCovers() {
  //   const rows = [];
  //   for (let i = 0; i < albumCovers.length; i += 4) {
  //     const row = [];
  //     for (let j = 0; j < 4 && i + j < albumCovers.length; j++) {
  //       const url = albumCovers[i + j];
  //       row.push(<img key={i + j} src={url} alt={`Album cover ${i + j}`} />);
  //     }
  //     rows.push(
  //       <div key={i} className="row">
  //         {row}
  //       </div>
  //     );
  //   }
  //   return <div className="grid">{rows}</div>;
  // }

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
          {/* {albumCovers.length > 0 && renderAlbumCovers()} */}
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
