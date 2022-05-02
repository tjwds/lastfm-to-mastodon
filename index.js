require("dotenv").config();
const fetch = require("node-fetch");

const emit = (trackText) => {
  console.log(trackText);
};

const trackObjToText = (trackObj) =>
  `${trackObj.artist["#text"]} — ${trackObj.name}`;

let lastTen = [];
let lastTime = new Date();
const listen = async () => {
  let data = await fetch(
    `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${process.env.LASTFM_USER}&api_key=${process.env.API_KEY}&format=json&limit=10`
  );
  data = await data.json();
  const now = new Date();
  if (data && now > lastTime) {
    const tracks = data.recenttracks.track
      .filter((track) => track.date)
      .sort((a, b) => Number(a.date.uts) - Number(b.date.uts))
      .map(trackObjToText);
    if (!lastTen.length) {
      lastTen = tracks;
      emit(tracks[9]);
    } else {
      const unseen = tracks.filter((track) => !lastTen.includes(track));
      unseen.forEach((unseenTrack) => emit(unseenTrack));
    }

    lastTen = tracks;
    lastTime = now;
  }
};

listen();
setInterval(listen, 1.5 * 60 * 1000);
