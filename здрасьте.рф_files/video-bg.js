(function () {
  const video = document.querySelector('.background-video');
  if (!video) {
    return;
  }

  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');

  function markPlaying() {
    video.classList.add('background-video--playing');
  }

  function tryPlay() {
    const playAttempt = video.play();
    if (playAttempt && typeof playAttempt.then === 'function') {
      playAttempt.then(markPlaying).catch(() => {});
    }
  }

  video.addEventListener('playing', markPlaying, { once: true });
  video.addEventListener('loadeddata', tryPlay);
  video.addEventListener('canplay', tryPlay);
  window.addEventListener('pageshow', tryPlay);

  if (video.readyState >= 2) {
    tryPlay();
  } else {
    video.load();
    tryPlay();
  }
})();
