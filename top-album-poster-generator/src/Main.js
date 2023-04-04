import React, { useState, useEffect } from "react";
import { SpotifyAuth, Scopes } from "react-spotify-auth";
import SpotifyWebApi from "spotify-web-api-js";
import "./Main.css";

const spotifyApi = new SpotifyWebApi();

function Main() {
  const [token, setToken] = useState(null);
  const [topTracks, setTopTracks] = useState([]);

  const [base, setBase] = useState(null);

  const onAccessToken = (accessToken) => {
    setToken(accessToken);
    spotifyApi.setAccessToken(accessToken);
  };

  async function getTopTracks() {
    try {
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
        setBase(b64Data);
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
          <button onClick={() => getTopTracks()}>Get Top Tracks</button>
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

      {base ? (
        <button onClick={() => linkfunction(base)}>Download Image</button>
      ) : (
        <div></div>
      )}
    </div>
  );
}

export default Main;
