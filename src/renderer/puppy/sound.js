let audioCtx = null;

function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(startTime, freqStart, freqEnd, duration, gainPeak) {
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freqStart, startTime);
  osc.frequency.exponentialRampToValueAtTime(freqEnd, startTime + duration);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(gainPeak, startTime + duration * 0.25);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

export function playHappyChirp() {
  const ctx = getContext();
  const now = ctx.currentTime;
  playTone(now, 720, 980, 0.09, 0.06);
  playTone(now + 0.1, 900, 1200, 0.11, 0.06);
}

export function playYip() {
  const ctx = getContext();
  const now = ctx.currentTime;
  playTone(now, 500, 260, 0.12, 0.07);
}
