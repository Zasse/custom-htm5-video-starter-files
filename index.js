// Select elements here
const video = document.getElementById('video');
const videoControls = document.getElementById('video-controls');

const videoWorks = !!document.createElement('video').canPlayType;
// !! converts obj into bool
// canPlayType property, detect support for video in browser, create instance of video el
if (videoWorks) {
// remove org ctrls
  video.controls = false;
  videoControls.classList.remove('hidden');
}

// ----------------------------

const playButton = document.getElementById('play')
const playbackIcons = document.querySelectorAll('.playback-icons use'); //select the nodes
const timeElapsed = document.getElementById('time-elapsed')
const duration = document.getElementById('duration')

const progressBar = document.getElementById('progress-bar');
const seek = document.getElementById('seek');

const seekTooltip = document.getElementById('seek-tooltip');

// volume
const volumeButton = document.getElementById('volume-button');
const volumeIcons = document.querySelectorAll('.volume-button use') //select the nodes
const volumeMute = document.querySelector('use[href="#volume-mute"]');
const volumeLow = document.querySelector('use[href="#volume-low"]');
const volumeHigh = document.querySelector('use[href="#volume-high"]');
const volume = document.getElementById('volume');


const playbackAnimation = document.getElementById('playback-animation');

// Fullscreen video
const fullscreenButton = document.getElementById('fullscreen-button');
const videoContainer = document.getElementById('video-container');
const fullscreenIcons = fullscreenButton.querySelectorAll('use');

const pipButton = document.getElementById('pip-button')


// Add functions here
// ---------------------

// toggles the playback state of the video
function togglePlay() {
    if (video.paused || video.ended) {
        video.play()
    } else {
        video.pause()
    }
}

// updates the playback icon and tooltip depending on the playback state
function updatePlayButton() {
    playbackIcons.forEach(icon => icon.classList.toggle('hidden'));
  
    if (video.paused) {
      playButton.setAttribute('data-title', 'Play (k)')
    } else {
      playButton.setAttribute('data-title', 'Pause (k)')
    }
  }

// takes a time length in seconds and returns the time in minutes and seconds
function formatTime(timeInSeconds) {
    const result = new Date(timeInSeconds * 1000).toISOString().substring(11, 19);
  
    return {
      minutes: result.substring(3, 5),
      seconds: result.substring(6, 8),
    }
}

// sets the video duration, and maximum value of the progressBar
function initializeVideo() {
    const videoDuration = Math.round(video.duration);
    const time = formatTime(videoDuration);
    duration.innerText = `${time.minutes}:${time.seconds}`;
    duration.setAttribute('datetime', `${time.minutes}m ${time.seconds}s`)

    seek.setAttribute('max', videoDuration);
    progressBar.setAttribute('max', videoDuration);
}

// indicates how far through the video the current playback is
function updateTimeElapsed() {
    const time = formatTime(Math.round(video.currentTime));
    timeElapsed.innerText = `${time.minutes}:${time.seconds}`;
    timeElapsed.setAttribute('datetime', `${time.minutes}m ${time.seconds}s`)
}

// indicates how far through the video the current playback is by updating the progress bar
function updateProgress() {
    seek.value = Math.floor(video.currentTime);
    progressBar.value = Math.floor(video.currentTime);
}

// uses the position of the mouse on the progress bar to
// roughly work out what point in the video the user will skip to if
// the progress bar is clicked at that point
function updateSeekTooltip(event) {
    const skipTo = Math.round((event.offsetX / event.target.clientWidth) * parseInt(event.target.getAttribute('max'), 10));
    
    seek.setAttribute('data-seek', skipTo)

    // display time to skip to when hovering
    const t = formatTime(skipTo);
    seekTooltip.textContent = `${t.minutes}:${t.seconds}`;

    // make rect that displays time follow mouse
    const rect = video.getBoundingClientRect();
    seekTooltip.style.left = `${event.pageX - rect.left}px`;
}

// jumps to a different point in the video when the progress bar is clicked
/* This function will be executed when the value of the seek element changes can be monitored using the input event. We then get the value of the data-seek attribute and check if it exists. If it does, we grab the value and update the video’s elapsed time and the progress bar to that value. If the data-seek property does not exist (on mobile for example), the value of the seek element is used instead. */
function skipAhead(event) {
    const skipTo = event.target.dataset.seek ? event.target.dataset.seek : event.target.value;

    video.currentTime = skipTo;
    progressBar.value = skipTo;
    seek.value = skipTo;
}

// updates the video's volume and disables the muted state if active
function updateVolume() {
    if (video.muted) {
        video.muted = false
    }

    video.volume = volume.value
}

// updateVolumeIcon updates the volume icon so that it correctly reflects
// the volume of the video
function updateVolumeIcon() {
    volumeIcons.forEach(icon => {
      icon.classList.add('hidden');
    });
  
    volumeButton.setAttribute('data-title', 'Mute (m)')
  
    if (video.muted || video.volume === 0) {
      volumeMute.classList.remove('hidden');
      volumeButton.setAttribute('data-title', 'Unmute (m)')
    } else if (video.volume > 0 && video.volume <= 0.5) {
      volumeLow.classList.remove('hidden');
    } else {
      volumeHigh.classList.remove('hidden');
    }
  }

function toggleMute() {
    video.muted = !video.muted;

    if (video.muted) {
      volume.setAttribute('data-volume', volume.value);
      volume.value = 0;
    } else {
      volume.value = volume.dataset.volume;
    }
}

// displays an animation when the video is played or paused
/* The animate method takes in an array of keyframe objects and an options object where you can control the duration of the animation amongst other things. */
function animatePlayback() {
    playbackAnimation.animate([
      {
        opacity: 1,
        transform: "scale(1)",
      },
      {
        opacity: 0,
        transform: "scale(1.3)",
      }], {
      duration: 500,
    });
}

// toggles the full screen state of the video
function toggleFullScreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (document.webkitFullscreenElement) {
      // Need this to support Safari
      document.webkitExitFullscreen();
    } else if (videoContainer.webkitRequestFullscreen) {
      // Need this to support Safari
      videoContainer.webkitRequestFullscreen();
    } else {
      videoContainer.requestFullscreen();
    }
  }

// changes the icon of the full screen button and tooltip to reflect the current full screen state of the video
function updateFullscreenButton() {
    console.log('hey')
    fullscreenIcons.forEach(icon => icon.classList.toggle('hidden'));
  
    if (document.fullscreenElement) {
      fullscreenButton.setAttribute('data-title', 'Exit full screen (f)')
    } else {
      fullscreenButton.setAttribute('data-title', 'Full screen (f)')
    }
}

// togglePip toggles Picture-in-Picture mode on the video
async function togglePip() {
    try {
      if (video !== document.pictureInPictureElement) {
        pipButton.disabled = true;
        await video.requestPictureInPicture();
      } else {
        await document.exitPictureInPicture();
      }
    } catch (error) {
      console.error(error)
    } finally {
      pipButton.disabled = false;
    }
}

// hides the video controls when not in use if the video is paused, the controls must remain visible
function hideControls() {
    if (video.paused) {
      return;
    }
  
    videoControls.classList.add('hide');
}
  
// showControls displays the video controls
function showControls() {
    videoControls.classList.remove('hide');
}

// executes the relevant functions for each supported shortcut key
function keyboardShortcuts(event) {
    const { key } = event;
    switch(key) {
      case 'k':
        togglePlay();
        animatePlayback();
        if (video.paused) {
          showControls();
        } else {
          setTimeout(() => {
            hideControls();
          }, 2000);
        }
        break;
      case 'm':
        toggleMute();
        break;
      case 'f':
        toggleFullScreen();
        break;
      case 'p':
        togglePip();
        break;
    }
}


// Add eventlisteners here
// -------------------------
playButton.addEventListener('click', togglePlay)
video.addEventListener('play', updatePlayButton);
video.addEventListener('pause', updatePlayButton);

video.addEventListener('loadedmetadata', initializeVideo) // get dur once video meta loaded
video.addEventListener('timeupdate', updateTimeElapsed)
video.addEventListener('timeupdate', updateProgress);

//scrub through video display time mouse hover
seek.addEventListener('mousemove', updateSeekTooltip)
seek.addEventListener('input', skipAhead)

// volumes
volume.addEventListener('input', updateVolume);
video.addEventListener('volumechange', updateVolumeIcon)
volumeButton.addEventListener('click', toggleMute)

video.addEventListener('click', togglePlay)
video.addEventListener('click', animatePlayback)

// fullscreen
fullscreenButton.addEventListener('click', toggleFullScreen)
// alt way to write
// fullscreenButton.onclick = toggleFullScreen;
videoContainer.addEventListener('webkitfullscreenchange', updateFullscreenButton);

// PIP
document.addEventListener('DOMContentLoaded', () => {
    if (!('pictureInPictureEnabled' in document)) {
      pipButton.classList.add('hidden');
    }
});

pipButton.addEventListener('click', togglePip)

// hide controls if mouse not hovering
video.addEventListener('mouseenter', showControls)
videoControls.addEventListener('mouseenter', showControls)
video.addEventListener('mouseleave', hideControls)
videoControls.addEventListener('mouseleave', hideControls)

document.addEventListener('keyup', keyboardShortcuts)


volumeButton.addEventListener('mouseleave', () => {
    setTimeout(() => { volume.classList.add('hidden') }, 3500)
})
volumeButton.addEventListener('mouseenter', () => {
    volume.classList.remove('hidden')
})


//volume
/* 
volume slider design match progress bar
https://www.youtube.com/watch?v=Bra8esNUMug
*/

// more features
/*
Add support for captions and subtitles.
Add speed support.
Add the ability to fast-forward or rewind the video.
Add ability to choose video resolution (720p, 480p, 360p, 240p).
*/