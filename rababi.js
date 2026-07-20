let songIndex = 0;
let audioElement = new Audio('songs/1.mp3');
let play = document.getElementById('playIcon')
let progressbar = document.getElementById('progressbar');
let soundbar = document.getElementById('soundBar');
let gif = document.getElementById('gif');
let forward = document.getElementById('forward');
let backward = document.getElementById('backward');
let nextStep = document.getElementById('nextStep');
let backStep = document.getElementById('backStep');
let songItems = Array.from(document.getElementsByClassName('songItem'));




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

songItems.forEach((element, i) => {
    element.getElementsByTagName("img")[0].src = songs[i].coverPath;
    element.getElementsByClassName("itamName")[0].innerText = songs[i].songName;

    let timeSpan = element.getElementsByClassName("songTime")[0];
    let tempAudio = new Audio(songs[i].filePath);
    tempAudio.addEventListener('loadedmetadata', () => {
        timeSpan.innerText = formatTime(tempAudio.duration);
    });

    element.querySelector('#play-pause-btn').addEventListener('click', () => {
        if (songIndex !== i) {
            songIndex = i;
            audioElement.src = songs[i].filePath;
            audioElement.play();
        }
        else if (audioElement.paused) {
            audioElement.play();
        }
        else {
            audioElement.pause();
        }

        songItems.forEach((el, idx) => {
            let icon = el.querySelector('#btn-icon');
            if (idx === songIndex && !audioElement.paused) {
                icon.src = "icons/pause-solid-full.svg";
            } else {
                icon.src = "icons/play-solid-full.svg";
            }
        });

        if (!audioElement.paused) {
            play.src = "icons/pause-solid-full.svg";
            play.classList.remove('play');
            gif.style.opacity = 1;
        } else {
            play.src = "icons/play-solid-full.svg";
            play.classList.add('play');
            gif.style.opacity = 0;
        }
    });
})


play.addEventListener('click', () => {
    if (audioElement.paused) {
        audioElement.play()
        play.classList.remove('play');
        play.src = "icons/pause-solid-full.svg";
        gif.style.opacity = 1;
    }
    else {
        audioElement.pause()
        play.classList.add('play');
        play.src = "icons/play-solid-full.svg";
        gif.style.opacity = 0;
    }

    let currentIcon = songItems[songIndex].querySelector('#btn-icon');
    currentIcon.src = audioElement.paused ? "icons/play-solid-full.svg" : "icons/pause-solid-full.svg";
})

audioElement.addEventListener('timeupdate', () => {
    let progress = ((audioElement.currentTime / audioElement.duration) * 100)

    progressbar.value = progress;
}
)

audioElement.addEventListener('ended', () => {
    play.classList.add('play');
    play.src = "icons/play-solid-full.svg";
    gif.style.opacity = 0;

    let currentIcon = songItems[songIndex].querySelector('#btn-icon');
    currentIcon.src = "icons/play-solid-full.svg";
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
    songIndex = (songIndex + 1) % songs.length;
    audioElement.src = songs[songIndex].filePath;
    audioElement.play();

    songItems.forEach((el, idx) => {
        let icon = el.querySelector('#btn-icon');
        icon.src = (idx === songIndex) ? "icons/pause-solid-full.svg" : "icons/play-solid-full.svg";
    });

    play.src = "icons/pause-solid-full.svg";
    play.classList.remove('play');
    gif.style.opacity = 1;
})

backStep.addEventListener('click', () => {
    songIndex = (songIndex - 1 + songs.length) % songs.length;
    audioElement.src = songs[songIndex].filePath;
    audioElement.play();

    songItems.forEach((el, idx) => {
        let icon = el.querySelector('#btn-icon');
        icon.src = (idx === songIndex) ? "icons/pause-solid-full.svg" : "icons/play-solid-full.svg";
    });

    play.src = "icons/pause-solid-full.svg";
    play.classList.remove('play');
    gif.style.opacity = 1;
})


soundbar.addEventListener("input", () => {
    audioElement.volume = soundbar.value / 100;
});