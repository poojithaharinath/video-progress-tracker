
const video = document.getElementById('lectureVideo');
const progressSpan = document.getElementById('progressPercentage');

let watchedIntervals = [];
let intervalStart = null;
let videoId = 'video123';
let userId = 'user456';

window.addEventListener('load', async () => {
  const res = await fetch(`/progress/${userId}/${videoId}`);
  const data = await res.json();
  if (data.lastPosition) video.currentTime = data.lastPosition;
  watchedIntervals = data.intervals || [];
  updateProgressDisplay(data.progress || 0);
});

video.addEventListener('play', () => {
  intervalStart = video.currentTime;
});

video.addEventListener('pause', () => {
  if (intervalStart !== null) {
    recordInterval(intervalStart, video.currentTime);
    intervalStart = null;
  }
  saveProgress();
});

video.addEventListener('seeked', () => {
  if (intervalStart !== null) {
    recordInterval(intervalStart, video.currentTime);
  }
  intervalStart = video.currentTime;
});

video.addEventListener('ended', () => {
  if (intervalStart !== null) {
    recordInterval(intervalStart, video.currentTime);
  }
  saveProgress();
});

function recordInterval(start, end) {
  if (start === end) return;
  watchedIntervals.push({
    start: Math.min(start, end),
    end: Math.max(start, end)
  });
}

function mergeIntervals(intervals) {
  intervals.sort((a, b) => a.start - b.start);
  const merged = [];
  let current = intervals[0];
  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i].start <= current.end) {
      current.end = Math.max(current.end, intervals[i].end);
    } else {
      merged.push(current);
      current = intervals[i];
    }
  }
  merged.push(current);
  return merged;
}

function calculateUniqueSeconds(intervals) {
  return intervals.reduce((total, interval) => total + (interval.end - interval.start), 0);
}

function updateProgressDisplay(progress) {
  progressSpan.textContent = `${progress.toFixed(2)}%`;
}

async function saveProgress() {
  const merged = mergeIntervals(watchedIntervals);
  const uniqueSeconds = calculateUniqueSeconds(merged);
  const progress = (uniqueSeconds / video.duration) * 100;
  updateProgressDisplay(progress);
  await fetch('/progress', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      userId, videoId, intervals: merged,
      lastPosition: video.currentTime,
      progress
    })
  });
}
