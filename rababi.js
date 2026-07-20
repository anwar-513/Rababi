let songIndex = 0;
let audioElement = new Audio('songs/1.mp3');
let progressbar = document.getElementById('progressbar');
let soundbar = document.getElementById('soundBar');
let gif = document.getElementById('gif');
let forward = document.getElementById('forward');
let backward = document.getElementById('backward');


let progress;

const playPauseBtn = document.getElementById('play-pause-btn');
const btnIcon = document.getElementById('btn-icon');








let songs = [
    { songName: "Azhar Khan new Song", filePath: "songs/1.mp3", coverPath: "covers/1.jfif" },
    { songName: "Stargy Ghazal - Haroon Bacha", filePath: "songs/2.mp3", coverPath: "covers/2.png" },
    { songName: "Peakey - Azhar Khan", filePath: "songs/3.mp3", coverPath: "covers/3.jfif" },
]



playPauseBtn.addEventListener('click', () => {
    if (btnIcon.src.includes('icons/play-solid-full.svg') || audioElement.currentTime <= 0) {
        btnIcon.src = 'icons/pause-solid-full.svg';
        btnIcon.alt = 'Pause';
        audioElement.play();
        gif.style.opacity = 1;

    } else {
        btnIcon.src = 'icons/play-solid-full.svg';
        btnIcon.alt = 'Play';
        audioElement.pause();
        gif.style.opacity = 0;
    }
});

audioElement.addEventListener('timeupdate', () => {
    progress = ((audioElement.currentTime / audioElement.duration) * 100)

    progressbar.value = progress;
}
)


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


soundBar.addEventListener("input", () => {
    audioElement.volume = soundBar.value / 100;
});

