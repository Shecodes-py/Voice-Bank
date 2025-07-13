// index.js
const voiceBank = document.getElementById('voice-bank');
const voices = window.speechSynthesis.getVoices();
const API_BASE_URL = 'http://localhost:3000'; // Replace with your actual API base URL

const startButton = document.getElementById('startButton');
const statusDiv = document.getElementById('status');
const transcriptSpan = document.getElementById('transcript');
const responseSpan = document.getElementById('response');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(reg => console.log('Service Worker registered!'))
    .catch(err => console.error('SW registration failed:', err));
}

// THE VOICE ENGINE
// STEP 1: Check if the browser supports the API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.interimResults = false; // We only want final results

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
}

recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    transcriptSpan.textContent = transcript;
    statusDiv.textContent = 'Thinking...';

    // 1. Understand the Order
    const intent = determineIntent(transcript);
    let responseText = "";

    // 2. COMPARE WITH INTENT ROUTER
    switch (intent) {
        case 'GET_BALANCE':
            responseText = await getAccountBalance();
            break;
        case 'GET_TRANSACTIONS':
            responseText = await getRecentTransactions();
            break;
        default:
            responseText = "Sorry, I didn't understand that. You can ask about your balance or recent transactions.";
    }

    // 3. Hand Off the Tray
    responseSpan.textContent = responseText;
    speak(responseText);
    statusDiv.textContent = 'Click the mic to start';
  };

  recognition.onerror = (event) => {
    statusDiv.textContent = `Error: ${event.error}. Please try again.`;
   };

startButton.addEventListener('click', () => {
            transcriptSpan.textContent = '...';
            responseSpan.textContent = '...';
            statusDiv.textContent = 'Listening...';
            recognition.start();
        });


// THE INTENT ROUTER
// This connects the user's speech to the backend logic.
async function handleIntent(intent) {
    const lowerCaseText = text.toLowerCase();
    if (lowerCaseText.includes('balance') || lowerCaseText.includes('how much')) {
        return 'GET_BALANCE';
    }
    if (lowerCaseText.includes('transactions') || lowerCaseText.includes('recent')) {
        return 'GET_TRANSACTIONS';
    }
    // add new intents here
    return 'UNRECOGNIZED';
}

// Bank Logic
// These functions get the data from your json-server.

async function getAccountBalance() {
    try {
        const response = await fetch(`${API_BASE_URL}/accounts`);
        const accounts = await response.json();
        const primaryAccount = accounts.find(acc => acc.name.includes("Checking"));
        if (!primaryAccount) return "I couldn't find your checking account.";
        
        // This is the "cooked meal": a clean sentence.
        return `Your checking account balance is ${primaryAccount.balance} dollars.`;
    } catch (error) {
        console.error("Error fetching balance:", error);
        return "Sorry, I'm having trouble connecting to the bank right now.";
    }
}

async function getRecentTransactions() {
    try {
        const response = await fetch(`${API_BASE_URL}/transactions?_sort=date&_order=desc&_limit=3`);
        const transactions = await response.json();
        if (transactions.length === 0) return "You have no recent transactions.";
        
        const descriptions = transactions.map(t => t.description).join(', ');
        // Another "cooked meal": a clean sentence.
        return `Your last three transactions were: ${descriptions}.`;
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return "Sorry, I'm having trouble fetching your transactions right now.";
    }
}