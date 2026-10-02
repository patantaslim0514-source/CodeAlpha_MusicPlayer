

const songs = [
  {
    title: "Midnight Dreams",
    artist: "Luna Waves",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=700"
  },
  {
    title: "Golden Hour",
    artist: "Nova Sky",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=700"
  },
  {
    title: "Ocean Breeze",
    artist: "Blue Horizon",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700"
  },
  {
    title: "City Lights",
    artist: "Echo Lane",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    cover: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=700"
  }
];

const audio = document.getElementById("audio");
const coverImage = document.getElementById("cover-image");
const songTitle = document.getElementById("song-title");
const songArtist = document.getElementById("song-artist");
const currentTime = document.getElementById("current-time");
const duration = document.getElementById("duration");
const progress = document.getElementById("progress");

const playBtn = document.getElementById("play-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const shuffleBtn = document.getElementById("shuffle-btn");
const repeatBtn = document.getElementById("repeat-btn");
const volume = document.getElementById("volume");
const favoriteBtn = document.getElementById("favorite-btn");

const playlistItems = document.getElementById("playlist-items");
const trackCount = document.getElementById("track-count");

let currentSongIndex = 0;
let isShuffle = false;
let isFavorite = false;
let isRepeat = false;

// Display time in minutes and seconds.
function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${String(secs).padStart(2, "0")}`;
}

// Load a song into the player.
function loadSong(index) {
  currentSongIndex = index;
  const song = songs[currentSongIndex];

  audio.src = song.audio;
  coverImage.src = song.cover;
  coverImage.alt = `${song.title} album artwork`;
  songTitle.textContent = song.title;
  songArtist.textContent = song.artist;

  currentTime.textContent = "0:00";
  duration.textContent = "0:00";
  progress.value = 0;

  // Reset favorite state for the newly selected song.
  isFavorite = false;
  favoriteBtn.textContent = "♡";
  favoriteBtn.classList.remove("active");
  favoriteBtn.setAttribute("aria-pressed", "false");

  // Highlight the selected playlist item.
  document.querySelectorAll(".track").forEach((track, i) => {
    track.classList.toggle("active", i === currentSongIndex);
  });
}

// Play the current song.
function playSong() {
  audio.play()
    .then(() => {
      playBtn.textContent = "Ⅱ";
      playBtn.setAttribute("aria-label", "Pause");
    })
    .catch((error) => {
      console.warn("Unable to play audio:", error);
      playBtn.textContent = "▶";
      playBtn.setAttribute("aria-label", "Play");
    });
}

// Pause the current song.
function pauseSong() {
  audio.pause();
  playBtn.textContent = "▶";
  playBtn.setAttribute("aria-label", "Play");
}

// Toggle play and pause.
function togglePlay() {
  if (audio.paused) {
    playSong();
  } else {
    pauseSong();
  }
}

// Play the next song.
function nextSong() {
  let nextIndex;

  if (isShuffle && songs.length > 1) {
    do {
      nextIndex = Math.floor(Math.random() * songs.length);
    } while (nextIndex === currentSongIndex);
  } else {
    nextIndex = (currentSongIndex + 1) % songs.length;
  }

  loadSong(nextIndex);
  playSong();
}

// Play the previous song.
function previousSong() {
  // If the song has played for more than 3 seconds,
  // restart the current song.
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }

  const previousIndex =
    (currentSongIndex - 1 + songs.length) % songs.length;

  loadSong(previousIndex);
  playSong();
}

// Play or pause.
playBtn.addEventListener("click", togglePlay);

// Next and previous buttons.
nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", previousSong);

// Shuffle button.
shuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("active", isShuffle);
  shuffleBtn.setAttribute("aria-pressed", String(isShuffle));
});

// Repeat button.
repeatBtn.addEventListener("click", () => {
  isRepeat = !isRepeat;
  audio.loop = isRepeat;
  repeatBtn.classList.toggle("active", isRepeat);
  repeatBtn.setAttribute("aria-pressed", String(isRepeat));
});

// Update the progress bar as the song plays.
audio.addEventListener("timeupdate", () => {
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    progress.value = (audio.currentTime / audio.duration) * 100;
    currentTime.textContent = formatTime(audio.currentTime);
  }
});

// Show the song duration when audio metadata loads.
audio.addEventListener("loadedmetadata", () => {
  duration.textContent = formatTime(audio.duration);
});

// Seek to a position when the progress bar changes.
progress.addEventListener("input", () => {
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    audio.currentTime = (Number(progress.value) / 100) * audio.duration;
  }
});

// Volume control.
volume.addEventListener("input", () => {
  audio.volume = Number(volume.value);
});

audio.volume = Number(volume.value);

// Automatically play the next song when one ends.
audio.addEventListener("ended", () => {
  if (!isRepeat) {
    nextSong();
  }
});

// Favorite button.
favoriteBtn.addEventListener("click", () => {
  isFavorite = !isFavorite;

  favoriteBtn.textContent = isFavorite ? "♥" : "♡";
  favoriteBtn.classList.toggle("active", isFavorite);
  favoriteBtn.setAttribute("aria-pressed", String(isFavorite));
});

// Select a song from the playlist.
playlistItems.addEventListener("click", (event) => {
  const track = event.target.closest(".track");

  if (!track) return;

  const index = Number(track.dataset.index);

  if (Number.isInteger(index) && index >= 0 && index < songs.length) {
    loadSong(index);
    playSong();
  }
});

// Show the number of songs.
trackCount.textContent = `${songs.length} tracks`;

// Load the first song without autoplay.
loadSong(0);