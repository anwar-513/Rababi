const AUDIUS_APP_NAME = "RababiPlayer";
const AUDIUS_API_BASE = "https://api.audius.co";

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

// This is now only used ONCE, as seed data the first time the app ever
// runs on a browser — after that, it lives in localStorage like any
// other playlist the user creates, and can be renamed/edited/deleted
// the same way.
const seedSongs = [
    { songName: "Azhar Khan new Song", filePath: "songs/1.mp3", coverPath: "covers/1.jfif" },
    { songName: "Stargy Ghazal - Haroon Bacha", filePath: "songs/2.mp3", coverPath: "covers/2.png" },
    { songName: "Peakey - Azhar Khan", filePath: "songs/3.mp3", coverPath: "covers/3.jfif" },
];

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

// First run ever (nothing in storage yet) — seed the built-in playlist once.
if (Object.keys(playlists).length === 0) {
    playlists["YadGar-e-Donya"] = seedSongs;
    savePlaylists();
}

let activePlaylistName = Object.keys(playlists)[0] || null;
let currentPlaylist = activePlaylistName ? playlists[activePlaylistName] : [];
let songIndex = 0;
let currentTrack = null;            // the track object actually loaded in audioElement

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

function playTrack(track, list) {
    currentPlaylist = list;
    songIndex = list.indexOf(track);
    currentTrack = track;

    audioElement.src = track.filePath;
    audioElement.play();
    updateUI(true);
}

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

    if (options.playlistName) {
        let removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'removeFromPlaylistBtn';
        removeBtn.innerText = '×';
        removeBtn.title = 'Remove from this playlist';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeSongFromPlaylist(options.playlistName, track);
        });
        el.appendChild(removeBtn);
    }

    return el;
}

// Removes one track from a named playlist, saves it, and refreshes
// the view if that playlist happens to be the one on screen right now
function removeSongFromPlaylist(playlistName, track) {
    if (!playlists[playlistName]) return;

    playlists[playlistName] = playlists[playlistName].filter(t => t.filePath !== track.filePath);
    savePlaylists();

    if (playlistName === activePlaylistName) {
        renderPlaylist(playlists[playlistName], playlistName);

        // Keep songIndex correct for next/back if the currently playing
        // track is still in this (now shorter) playlist
        if (currentTrack) {
            let newIndex = currentPlaylist.indexOf(currentTrack);
            if (newIndex !== -1) songIndex = newIndex;
        }
    }
}

// Renders an array of tracks into the main playlist panel
function renderPlaylist(list, title) {
    currentPlaylist = list;
    playlistTitle.innerText = title;
    playlistEl.querySelectorAll('.songItem').forEach(el => el.remove());
    list.forEach(track => {
        playlistEl.appendChild(createSongItemElement(track, { list, playlistName: title }));
    });
}

function renderPlaylistTabs() {
    playlistTabs.querySelectorAll('.tabBtn').forEach(btn => {
        if (btn.id !== 'newPlaylistBtn') btn.remove();
    });

    Object.keys(playlists).forEach(name => {
        let btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tabBtn';
        if (name === activePlaylistName) btn.classList.add('active');

        let label = document.createElement('span');
        label.innerText = name;
        btn.appendChild(label);

        let deleteBtn = document.createElement('span');
        deleteBtn.className = 'deletePlaylistBtn';
        deleteBtn.innerText = '×';
        deleteBtn.title = 'Delete playlist';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // don't trigger the tab's own click handler below
            deletePlaylist(name);
        });
        btn.appendChild(deleteBtn);

        btn.addEventListener('click', () => {
            activePlaylistName = name;
            setActiveTab(btn);
            renderPlaylist(playlists[name], name);
        });
        playlistTabs.insertBefore(btn, newPlaylistBtn);
    });
}

function deletePlaylist(name) {
    if (!confirm(`Delete the playlist "${name}"? This can't be undone.`)) return;

    let wasActive = name === activePlaylistName;

    delete playlists[name];
    savePlaylists();

    if (wasActive) {
        let remainingNames = Object.keys(playlists);
        activePlaylistName = remainingNames[0] || null;

        if (activePlaylistName) {
            renderPlaylist(playlists[activePlaylistName], activePlaylistName);
        } else {
            currentPlaylist = [];
            currentTrack = null;
            playlistTitle.innerText = "No playlists yet";
            playlistEl.querySelectorAll('.songItem').forEach(el => el.remove());
        }
    }

    renderPlaylistTabs();
}

function setActiveTab(activeBtn) {
    playlistTabs.querySelectorAll('.tabBtn').forEach(b => b.classList.remove('active'));
    activeBtn.classList.add('active');
}

newPlaylistBtn.addEventListener('click', () => {
    let name = prompt("Name your new playlist:");
    if (!name) return;
    if (playlists[name]) {
        alert("A playlist with that name already exists.");
        return;
    }
    playlists[name] = [];
    savePlaylists();
    activePlaylistName = name;
    renderPlaylistTabs();
    renderPlaylist(playlists[name], name);
});

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

async function searchAudius(query) {
    let url = `${AUDIUS_API_BASE}/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=${AUDIUS_APP_NAME}`;
    let res = await fetch(url);

    if (!res.ok) {
        throw new Error(`Audius API error: HTTP ${res.status}`);
    }

    let data = await res.json();

    if (!Array.isArray(data.data)) {
        throw new Error("Audius API returned an unexpected response.");
    }

    return data.data.map(track => ({
        songName: `${track.title} - ${track.user.name}`,
        filePath: `${AUDIUS_API_BASE}/v1/tracks/${track.id}/stream?app_name=${AUDIUS_APP_NAME}`,
        coverPath: track.artwork ? (track.artwork["480x480"] || track.artwork["150x150"]) : "covers/1.jfif",
        duration: track.duration
    }));
}

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    let query = searchInput.value.trim();
    if (!query) return;

    searchResultsEl.innerHTML = '<p class="searchStatus">Searching...</p>';

    try {
        let results = await searchAudius(query);
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

renderPlaylistTabs();
if (activePlaylistName) {
    renderPlaylist(playlists[activePlaylistName], activePlaylistName);
} else {
    playlistTitle.innerText = "No playlists yet";
}