// index.js
const voiceBank = document.getElementById('voice-bank');
const voices = window.speechSynthesis.getVoices();
const express = require("")

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(reg => console.log('Service Worker registered!'))
    .catch(err => console.error('SW registration failed:', err));
}


