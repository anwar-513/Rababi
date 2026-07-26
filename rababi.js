// ============================================================
// CONFIG — replace with your own free client_id from
// https://developer.jamendo.com (sign up, no cost, instant)
// ============================================================
const JAMENDO_CLIENT_ID = "YOUR_JAMENDO_CLIENT_ID";

// ============================================================
// Core player elements
// ============================================================
let audioElement = new Audio();
let play = document.getElementById('playIcon');
let progressbar = document.getElementById('progressbar');
let soundbar = document.getElementById('soundBar');
let forward = document.getElementById('forward');
let backward = document.getElementById('backward');
let nextStep = document.getElementById('nextStep');
let backStep = document.getElementById('backStep');
let songNameContainer = document.querySelector('.buttom .songName');
let songNameSpan = songNameContainer.querySelector('span');
let bottomGif = songNameContainer.querySelector('img');
let timelineSpan = document.querySelector('.buttom .timeline');

let playlistEl = document.getElementById('playlist');
let playlistTitle = document.getElementById('playlistTitle');
let playlistTabs = document.getElementById('playlistTabs');
let newPlaylistBtn = document.getElementById('newPlaylistBtn');
let searchForm = document.getElementById('searchForm');
let searchInput = document.getElementById('searchInput');
let searchResultsEl = document.getElementById('searchResults');

soundbar.value = 100;
audioElement.volume = 1;

// ============================================================
// Your original 3 built-in songs — now just the starting data,
// not hardcoded HTML. Every songItem on the page (default,
// search results, or custom playlists) is built by the SAME
// function below, so playback logic never has to care where a
// track came from.
// ============================================================
const defaultSongs = [
    { songName: "Azhar Khan new Song", filePath: "songs/1.mp3", coverPath: "covers/1.jfif" },
    { songName: "Stargy Ghazal - Haroon Bacha", filePath: "songs/2.mp3", coverPath: "covers/2.png" },
    { songName: "Peakey - Azhar Khan", filePath: "songs/3.mp3", coverPath: "covers/3.jfif" },
];

// ============================================================
// Playlist persistence (localStorage — fine here, this is a
// real site, not a sandboxed artifact)
// ============================================================
const STORAGE_KEY = "rababi_playlists";

function loadPlaylists() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
        return {};
    }
}

function savePlaylists() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
}

let playlists = loadPlaylists(); // { "My Playlist": [track, track, ...], ... }

// ============================================================
// Player state
// ============================================================
let currentPlaylist = defaultSongs; // whichever array next/back should navigate
let songIndex = 0;
let currentTrack = null;            // the track object actually loaded in audioElement

// ============================================================
// Helpers
// ============================================================
function formatTime(seconds) {
    seconds = Number(seconds);
    if (!isFinite(seconds) || seconds < 0) return "00:00";
    let minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    return String(minutes).padStart(2, '0') + ":" + String(secs).padStart(2, '0');
}

function triggerNameAnimation() {
    songNameContainer.classList.remove('playing');
    void songNameContainer.offsetWidth; // force reflow so the animation can replay
    songNameContainer.classList.add('playing');
}

// Single source of truth for syncing every icon/gif/name whenever play state changes.
// Instead of looping a fixed "songItems" array, this now queries every .songItem
// currently in the DOM (playlist panel AND search results) and compares by filePath —
// so it works no matter how many lists are rendered at once.
function updateUI(isPlaying) {
    play.src = isPlaying ? "icons/pause-solid-full.svg" : "icons/play-solid-full.svg";
    isPlaying ? play.classList.remove('play') : play.classList.add('play');
    bottomGif.style.opacity = isPlaying ? 1 : 0;

    if (currentTrack) {
        songNameSpan.innerText = currentTrack.songName;
    }

    if (isPlaying) {
        triggerNameAnimation();
    } else {
        songNameContainer.classList.remove('playing');
    }

    document.querySelectorAll('.songItem').forEach(el => {
        let icon = el.querySelector('#btn-icon');
        let itemGif = el.querySelector('.itemGif');
        let isActive = isPlaying && currentTrack && el.dataset.filePath === currentTrack.filePath;

        icon.src = isActive ? "icons/pause-solid-full.svg" : "icons/play-solid-full.svg";
        itemGif.style.opacity = isActive ? 1 : 0;
    });
}

// Plays any track object, from any list — this replaces the old playSong(index),
// which only worked for the hardcoded "songs" array.
function playTrack(track, list) {
    currentPlaylist = list;
    songIndex = list.indexOf(track);
    currentTrack = track;

    audioElement.src = track.filePath;
    audioElement.play();
    updateUI(true);
}

// ============================================================
// Builds one songItem element for ANY track (default, search
// result, or playlist track) — same structure/classes your CSS
// already styles, just generated in JS instead of hardcoded HTML.
// ============================================================
function createSongItemElement(track, options = {}) {
    let el = document.createElement('div');
    el.className = 'songItem';
    el.dataset.filePath = track.filePath;

    let cover = document.createElement('img');
    cover.className = 'song';
    cover.src = track.coverPath;
    cover.alt = track.songName;
    el.appendChild(cover);

    let nameSpan = document.createElement('span');
    nameSpan.className = 'itamName';
    nameSpan.innerText = track.songName;
    el.appendChild(nameSpan);

    let listPlaySpan = document.createElement('span');
    listPlaySpan.className = 'songlistplay';
    el.appendChild(listPlaySpan);

    let itemGif = document.createElement('img');
    itemGif.src = 'gif.gif';
    itemGif.alt = 'gif';
    itemGif.className = 'itemGif';
    itemGif.style.opacity = 0;
    el.appendChild(itemGif);

    let timeSpan = document.createElement('span');
    timeSpan.className = 'songTime';
    if (typeof track.duration === 'number') {
        timeSpan.innerText = formatTime(track.duration);
    } else {
        timeSpan.innerText = '--:--';
        let tempAudio = new Audio(track.filePath);
        tempAudio.addEventListener('loadedmetadata', () => {
            timeSpan.innerText = formatTime(tempAudio.duration);
        });
    }
    el.appendChild(timeSpan);

    let btn = document.createElement('i');
    btn.id = 'play-pause-btn';
    let btnIcon = document.createElement('img');
    btnIcon.id = 'btn-icon';
    btnIcon.className = 'icon';
    btnIcon.src = 'icons/play-solid-full.svg';
    btnIcon.alt = 'play';
    btnIcon.width = 20;
    btn.appendChild(btnIcon);
    el.appendChild(btn);

    btn.addEventListener('click', () => {
        if (currentTrack && currentTrack.filePath === track.filePath) {
            if (audioElement.paused) {
                audioElement.play();
                updateUI(true);
            } else {
                audioElement.pause();
                updateUI(false);
            }
        } else {
            playTrack(track, options.list || [track]);
        }
    });

    if (options.showAddButton) {
        let addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.className = 'addToPlaylistBtn';
        addBtn.innerText = '+';
        addBtn.title = 'Add to playlist';
        addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openAddToPlaylistPicker(track);
        });
        el.appendChild(addBtn);
    }

    return el;
}

// Renders an array of tracks into the main playlist panel
function renderPlaylist(list, title) {
    currentPlaylist = list;
    playlistTitle.innerText = title;
    playlistEl.querySelectorAll('.songItem').forEach(el => el.remove());
    list.forEach(track => {
        playlistEl.appendChild(createSongItemElement(track, { list }));
    });
}

// ============================================================
// Playlist tabs
// ============================================================
function renderPlaylistTabs() {
    playlistTabs.querySelectorAll('.tabBtn').forEach(btn => {
        if (btn.dataset.list !== 'default' && btn.id !== 'newPlaylistBtn') {
            btn.remove();
        }
    });

    Object.keys(playlists).forEach(name => {
        let btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tabBtn';
        btn.innerText = name;
        btn.addEventListener('click', () => {
            setActiveTab(btn);
            renderPlaylist(playlists[name], name);
        });
        playlistTabs.insertBefore(btn, newPlaylistBtn);
    });
}

function setActiveTab(activeBtn) {
    playlistTabs.querySelectorAll('.tabBtn').forEach(b => b.classList.remove('active'));
    activeBtn.classList.add('active');
}

document.querySelector('.tabBtn[data-list="default"]').addEventListener('click', (e) => {
    setActiveTab(e.target);
    renderPlaylist(defaultSongs, "YadGar-e-Donya");
});

newPlaylistBtn.addEventListener('click', () => {
    let name = prompt("Name your new playlist:");
    if (!name) return;
    if (playlists[name]) {
        alert("A playlist with that name already exists.");
        return;
    }
    playlists[name] = [];
    savePlaylists();
    renderPlaylistTabs();
});

// ============================================================
// Add-to-playlist picker (simple prompt-based UI for now)
// ============================================================
function openAddToPlaylistPicker(track) {
    let names = Object.keys(playlists);

    if (names.length === 0) {
        let name = prompt("You don't have any playlists yet. Name one to create it and add this song:");
        if (!name) return;
        playlists[name] = [track];
        savePlaylists();
        renderPlaylistTabs();
        alert(`Added to "${name}"`);
        return;
    }

    let choice = prompt(`Add "${track.songName}" to which playlist?\n\n${names.join('\n')}\n\n(Type a name exactly, or a new name to create one)`);
    if (!choice) return;

    if (!playlists[choice]) playlists[choice] = [];
    let alreadyIn = playlists[choice].some(t => t.filePath === track.filePath);
    if (!alreadyIn) {
        playlists[choice].push(track);
        savePlaylists();
    }
    renderPlaylistTabs();
    alert(`Added to "${choice}"`);
}

// ============================================================
// Jamendo search
// ============================================================
async function searchJamendo(query) {
    if (!JAMENDO_CLIENT_ID || JAMENDO_CLIENT_ID === "YOUR_JAMENDO_CLIENT_ID") {
        throw new Error("API Error");
    }

    let url = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=20&search=${encodeURIComponent(query)}`;
    let res = await fetch(url);
    let data = await res.json();

    if (!data.headers || data.headers.status !== "success") {
        let reason = (data.headers && data.headers.error_message) || `HTTP ${res.status}`;
        throw new Error(`Jamendo API error: ${reason}`);
    }

    return data.results.map(track => ({
        songName: `${track.name} - ${track.artist_name}`,
        filePath: track.audio,
        coverPath: track.image,
        duration: track.duration
    }));
}

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    let query = searchInput.value.trim();
    if (!query) return;

    searchResultsEl.innerHTML = '<p class="searchStatus">Searching...</p>';

    try {
        let results = await searchJamendo(query);
        searchResultsEl.innerHTML = '';
        if (results.length === 0) {
            searchResultsEl.innerHTML = '<p class="searchStatus">No results found.</p>';
            return;
        }
        results.forEach(track => {
            searchResultsEl.appendChild(createSongItemElement(track, { list: results, showAddButton: true }));
        });
    } catch (err) {
        searchResultsEl.innerHTML = `<p class="searchStatus">${err.message}</p>`;
        console.error(err);
    }
});

// ============================================================
// Transport controls (progress bar, skip, volume — same as before,
// just now aware that there might be no track loaded yet)
// ============================================================
play.addEventListener('click', () => {
    if (!currentTrack) return;
    if (audioElement.paused) {
        audioElement.play();
        updateUI(true);
    } else {
        audioElement.pause();
        updateUI(false);
    }
})

audioElement.addEventListener('timeupdate', () => {
    let progress = ((audioElement.currentTime / audioElement.duration) * 100)
    progressbar.value = progress;
    timelineSpan.innerText = formatTime(audioElement.currentTime);
}
)

audioElement.addEventListener('ended', () => {
    updateUI(false);
    timelineSpan.innerText = "00:00";
})

progressbar.addEventListener('change', () => {
    if (!currentTrack) return;
    audioElement.currentTime = progressbar.value * audioElement.duration / 100
}
)

forward.addEventListener('click', () => {
    audioElement.currentTime = audioElement.currentTime + 10;
})

backward.addEventListener('click', () => {
    audioElement.currentTime = audioElement.currentTime - 10;
})

nextStep.addEventListener('click', () => {
    if (!currentPlaylist.length) return;
    let nextIndex = (songIndex + 1) % currentPlaylist.length;
    playTrack(currentPlaylist[nextIndex], currentPlaylist);
})

backStep.addEventListener('click', () => {
    if (!currentPlaylist.length) return;
    let prevIndex = (songIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    playTrack(currentPlaylist[prevIndex], currentPlaylist);
})

soundbar.addEventListener("input", () => {
    audioElement.volume = soundbar.value / 100;
});

// ============================================================
// Initial render
// ============================================================
renderPlaylistTabs();
renderPlaylist(defaultSongs, "YadGar-e-Donya");