const clientId = `c09fb12ceb8f415a83abf882e84f6783`;
const clientSecret = `cbd7c12541874396af24429693e61cb3`;

const getToken = async () => {
  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(clientId + ":" + clientSecret),
    },
    body: "grant_type=client_credentials",
  });

  const data = await result.json();
  return data.access_token;
};

const getGenres = async (token) => {
  const result = await fetch(
    `https://api.spotify.com/v1/browse/categories?locale=sv_US`,
    {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
    }
  );

  const data = await result.json();
  return data.categories.items;
};

const getPlaylistByGenre = async (token, genreId) => {
  const limit = 10;

  const result = await fetch(
    `https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=${limit}`,
    {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
    }
  );

  const data = await result.json();
  return data.playlists.items;
};

const getPlaylistByTracks = async (token, playlistId) => {
  const result = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
    }
  );

  const data = await result.json();
  return data.items;
};

const loadGenres = async () => {
  const token = await getToken();
  const genres = await getGenres(token);
  const list = document.getElementById("Genres");
  
  await Promise.all(genres.map(async ({ id, name, icons: [icon], href }) => {
    const playlists = await getPlaylistByGenre(token, id);
    const playlistsList = await Promise.all(playlists.map(async ({ name, id, images: [image], external_urls: { spotify } }) => {
      const tracks = await getPlaylistByTracks(token, id);
      const tracksList = tracks
      .map(({ track: { name: trackName, artists } }) => `
        <li>${trackName} - ${artists.map(artist => artist.name).join(', ')}</li>
      `)
      .join('');
      
      return `
        <li>
          <a href="${spotify}" alt="${name}" target="_blank">
            <img src="${image.url}" width="180" height="180"/>
          </a>
          ${tracksList}
        </li>
      `;
    }));
    
    if (playlists) {
      const html = `
        <article class="genre-card">
          <img class="heading" src="${icon.url}" width="150" height="150" alt="${name}"/>
          <div>
            <ol>
              ${playlistsList.join("")}
            </ol>
            <h2 class="heading">${name}</h2>
          </div>
        </article>
      `;

      list.insertAdjacentHTML("beforeend", html);
    }
  }));
};

loadGenres();