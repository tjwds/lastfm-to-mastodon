require("dotenv").config();
const fetch = require("node-fetch");

const emit = async (trackText) => {
  console.log(trackText);
  const params = { status: trackText, visibility: "unlisted" };
  let postText = await fetch(`${process.env.SERVER_ENDPOINT}/api/v1/statuses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": trackText,
      Authorization: `Bearer ${process.env.MASTODON_BEARER_TOKEN}`,
    },
    body: JSON.stringify(params),
  });
  postText = await postText.json();
};

const trackObjToText = (trackObj) =>
  `${trackObj.artist["#text"]} — ${trackObj.name}`;

let lastTen = [];
let lastTime = new Date();
const listen = async () => {
  let data = await fetch(
    `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${process.env.LASTFM_USER}&api_key=${process.env.LASTFM_API_KEY}&format=json&limit=10`
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
