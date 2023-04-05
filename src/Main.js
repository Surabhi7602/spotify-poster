import React, { useState, useEffect } from "react";
import { SpotifyAuth, Scopes } from "react-spotify-auth";
import SpotifyWebApi from "spotify-web-api-js";
import "react-spotify-auth/dist/index.css";
import "./Main.css";
import "./RadioSelection.css"; // Import the CSS file for styling

const spotifyApi = new SpotifyWebApi();

export default function Main() {
  const [token, setToken] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [completed, setCompleted] = useState(null);

  const onAccessToken = (accessToken) => {
    setToken(accessToken);
    spotifyApi.setAccessToken(accessToken);
  };

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
    setCompleted(null);
  };

  async function getTopTracks() {
    try {
      const response = await spotifyApi.getMyTopTracks({
        time_range: selectedOption,
        limit: 16,
      });

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

    generatePos(coverUrls);
  }

  function imgLoad(url) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = url;
      img.onload = function () {
        resolve(img);
      };
      img.onerror = reject;
    });
  }

  function generatePos(covers) {
    // map an array of promises calling imgLoad() for each url
    let imageLoadpromises = covers.map(imgLoad);

    Promise.all(imageLoadpromises)
      .then(function (images) {
        //images is array of image elements from above

        var canvas = document.createElement("canvas");
        canvas.width = 2048;
        canvas.height = 2048;

        var ctx = canvas.getContext("2d");
        var offsetY = 0;

        for (var i = 0; i < images.length; i += 4) {
          var rowImages = images.slice(i, i + 4);
          var offsetX = 0;
          for (var j = 0; j < rowImages.length; j++) {
            var img = rowImages[j];
            ctx.drawImage(img, offsetX, offsetY, 512, 512);
            offsetX += 512;
          }
          offsetY += 512;
        }

        let b64Data = canvas.toDataURL();

        linkfunction(b64Data);
      })
      .catch(function (err) {
        console.log("One or more images did not load");
      });
  }

  function linkfunction(b64Data) {
    var link = document.createElement("a");

    var blob = dataURLtoBlob(b64Data);
    var objurl = URL.createObjectURL(blob);

    link.download = "Top16Tracks.png";

    link.href = objurl;

    link.click();
    setCompleted("done");
  }

  function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  return (
    <div>
      <div>
        {token ? (
          <div>
            <h3
              style={{
                display: "block",
                fontSize: "30px",
                fontWeight: "bold",
                fontFamily: "Hind Siliguri, sans-serif",
              }}
            >
              Select a Time Frame:
            </h3>
            <div className="radioContainer">
              <label className="radioLabel">
                <input
                  type="radio"
                  value="long_term"
                  checked={selectedOption === "long_term"}
                  onChange={handleOptionChange}
                />
                Overall
              </label>
              <label className="radioLabel">
                <input
                  type="radio"
                  value="medium_term"
                  checked={selectedOption === "medium_term"}
                  onChange={handleOptionChange}
                />
                Last 6 Months
              </label>
              <label className="radioLabel">
                <input
                  type="radio"
                  value="short_term"
                  checked={selectedOption === "short_term"}
                  onChange={handleOptionChange}
                />
                Last 4 Weeks
              </label>
            </div>
          </div>
        ) : (
          <div style={{}}>
            <div>
              <p
                style={{
                  display: "block",
                  fontSize: "40px",
                  fontWeight: "bold",
                  fontFamily: "Hind Siliguri, sans-serif",
                }}
              >
                Generate a poster from your top tracks on Spotify!
              </p>
            </div>
            <br></br>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <SpotifyAuth
                clientID="ed8e6a84c4d94b31a47fa7f4d8e8c274"
                // http://localhost:3000/callback
                redirectUri="https://spotify-poster-virid.vercel.app/"
                https:scopes={["user-top-read"]}
                onAccessToken={onAccessToken}
              />
            </div>
          </div>
        )}
      </div>

      {selectedOption && !completed ? (
        <button
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            fontFamily: "Hind Siliguri, sans-serif",
          }}
          onClick={() => getTopTracks()}
        >
          Generate Poster
        </button>
      ) : (
        <div></div>
      )}

      {selectedOption && completed ? (
        <div
          style={{
            display: "block",
            fontSize: "30px",
            fontWeight: "bold",
            fontFamily: "Hind Siliguri, sans-serif",
          }}
        >
          Download Complete!
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}
