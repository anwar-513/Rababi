let songIndex = 0;
let audioElement = new Audio('songs/1.mp3');
let play = document.getElementById('playIcon');
let progressbar = document.getElementById('progressbar');
let soundbar = document.getElementById('soundBar');
let forward = document.getElementById('forward');
let backward = document.getElementById('backward');
let nextStep = document.getElementById('nextStep');
let backStep = document.getElementById('backStep');
let songItems = Array.from(document.getElementsByClassName('songItem'));
let songNameContainer = document.querySelector('.buttom .songName');
let songNameSpan = songNameContainer.querySelector('span');
let bottomGif = songNameContainer.querySelector('img');
let timelineSpan = document.querySelector('.buttom .timeline');

// Default the volume slider to max instead of the middle
soundbar.value = 100;
audioElement.volume = 1;

let songs = [
    { songName: "Azhar Khan new Song", filePath: "songs/1.mp3", coverPath: "covers/1.jfif" },
    { songName: "Stargy Ghazal - Haroon Bacha", filePath: "songs/2.mp3", coverPath: "covers/2.png" },
    { songName: "Peakey - Azhar Khan", filePath: "songs/3.mp3", coverPath: "covers/3.jfif" },
]

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    return String(minutes).padStart(2, '0') + ":" + String(secs).padStart(2, '0');
}

// Restarts the CSS animation on the bottom song name every time it's called
function triggerNameAnimation() {
    songNameContainer.classList.remove('playing');
    void songNameContainer.offsetWidth; // force reflow so the animation can replay
    songNameContainer.classList.add('playing');
}

// Single source of truth for syncing every icon/gif/name whenever play state changes
function updateUI(isPlaying) {
    play.src = isPlaying ? "icons/pause-solid-full.svg" : "icons/play-solid-full.svg";
    isPlaying ? play.classList.remove('play') : play.classList.add('play');

    bottomGif.style.opacity = isPlaying ? 1 : 0;
    songNameSpan.innerText = songs[songIndex].songName;

    if (isPlaying) {
        triggerNameAnimation();
    } else {
        songNameContainer.classList.remove('playing');
    }

    songItems.forEach((el, idx) => {
        let icon = el.querySelector('#btn-icon');
        let itemGif = el.getElementsByTagName('img')[1];
        let isActiveSong = idx === songIndex && isPlaying;

        icon.src = isActiveSong ? "icons/pause-solid-full.svg" : "icons/play-solid-full.svg";
        itemGif.style.opacity = isActiveSong ? 1 : 0;
    });
}

function playSong(index) {
    songIndex = index;
    audioElement.src = songs[index].filePath;
    audioElement.play();
    updateUI(true);
}

songItems.forEach((element, i) => {
    element.getElementsByTagName("img")[0].src = songs[i].coverPath;
    element.getElementsByClassName("itamName")[0].innerText = songs[i].songName;
    element.getElementsByTagName("img")[1].style.opacity = 0; // hide each item's gif initially

    let timeSpan = element.getElementsByClassName("songTime")[0];
    let tempAudio = new Audio(songs[i].filePath);
    tempAudio.addEventListener('loadedmetadata', () => {
        timeSpan.innerText = formatTime(tempAudio.duration);
    });

    element.querySelector('#play-pause-btn').addEventListener('click', () => {
        if (songIndex !== i) {
            playSong(i);
        }
        else if (audioElement.paused) {
            audioElement.play();
            updateUI(true);
        }
        else {
            audioElement.pause();
            updateUI(false);
        }
    });
})

play.addEventListener('click', () => {
    if (audioElement.paused) {
        audioElement.play();
        updateUI(true);
    }
    else {
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
    playSong((songIndex + 1) % songs.length);
})

backStep.addEventListener('click', () => {
    playSong((songIndex - 1 + songs.length) % songs.length);
})

soundbar.addEventListener("input", () => {
    audioElement.volume = soundbar.value / 100;
});
