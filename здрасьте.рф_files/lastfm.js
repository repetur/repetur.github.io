(function () {
  const config = window.LASTFM_CONFIG || { user: 'eXmansa', apiKey: '' };
  const widget = document.getElementById('lastfm-widget');
  if (!widget) {
    return;
  }

  const metaEl = widget.querySelector('.lastfm-widget__meta');
  const coverEl = widget.querySelector('.lastfm-widget__cover');
  const profileUrl = `https://last.fm/user/${encodeURIComponent(config.user)}`;
  widget.href = profileUrl;

  function setState(meta, options = {}) {
    metaEl.textContent = meta;
    widget.classList.toggle('lastfm-widget--live', Boolean(options.live));

    if (options.image) {
      coverEl.src = options.image;
      coverEl.alt = '';
      coverEl.hidden = false;
    } else {
      coverEl.removeAttribute('src');
      coverEl.hidden = true;
    }
  }

  function pickImage(images) {
    if (!Array.isArray(images)) {
      return null;
    }

    for (let index = images.length - 1; index >= 0; index -= 1) {
      const source = images[index]['#text'];
      if (source) {
        return source;
      }
    }

    return null;
  }

  async function updateTrack() {
    if (!config.apiKey) {
      setState('добавь apiKey в lastfm-config.js');
      return;
    }

    try {
      const endpoint = new URL('https://ws.audioscrobbler.com/2.0/');
      endpoint.searchParams.set('method', 'user.getrecenttracks');
      endpoint.searchParams.set('user', config.user);
      endpoint.searchParams.set('api_key', config.apiKey);
      endpoint.searchParams.set('format', 'json');
      endpoint.searchParams.set('limit', '1');

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.message || 'Last.fm API error');
      }

      let track = data.recenttracks?.track;
      if (Array.isArray(track)) {
        track = track[0];
      }

      if (!track) {
        throw new Error('No recent tracks');
      }

      const artist = track.artist?.['#text'] || track.artist || 'неизвестный исполнитель';
      const title = track.name || 'без названия';
      const isLive = track['@attr']?.nowplaying === 'true';

      setState(`${artist} — ${title}`, {
        image: pickImage(track.image),
        live: isLive,
      });
    } catch {
      setState('не удалось загрузить');
    }
  }

  updateTrack();
  window.setInterval(updateTrack, 60000);
})();
