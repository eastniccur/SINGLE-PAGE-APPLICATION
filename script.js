const searchForm = document.getElementById('search-form');
const wordInput = document.getElementById('word-input');
const resultSection = document.getElementById('result-section');
const errorMessage = document.getElementById('error-message');

searchForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent page refresh
    const word = wordInput.value.trim();

    // Reset UI
    errorMessage.textContent = '';
    resultSection.classList.add('hidden');
    resultSection.innerHTML = '';

    // CASE 1: Empty Input
    if (!word) {
        errorMessage.textContent = 'Please enter a word.';
        return;
    }

    fetchDictionaryData(word);
});
// Function to fetch data from the dictionary API
function fetchDictionaryData(word) {
    const API_URL = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

    fetch(API_URL)
        .then(response => {
            // If the API says "not found" (404), we throw an error to the .catch() block
            if (!response.ok) {
                throw new Error("Word not found. Please try another search.");
            }
            return response.json(); 
        })
        .then(data => {
            // Success! Send the first object of data to be displayed
            displayResults(data[0]);
        })
        .catch(error => {
            // If anything fails above, show the error message here
            errorMessage.textContent = error.message;
        });
}
// Function to display the results in the UI
function displayResults(data) {
    resultSection.classList.remove('hidden');
//  The Phonetic Text 
    const phoneticText = data.phonetic || (data.phonetics && data.phonetics.find(p => p.text)?.text) || '';

    // The Audio URL 
    const phoneticAudio = data.phonetics.find(p => p.audio !== "");
    const audioUrl = phoneticAudio ? phoneticAudio.audio : null;

    let htmlContent = `
        <h2 class="word-header">${data.word}</h2>
        <p class="phonetic">${phoneticText}</p>
        ${audioUrl ? `<button class="audio-btn" onclick="playAudio('${audioUrl}')">Play pronunciation</button>` : ''}
    `;

    data.meanings.forEach(meaning => {
        htmlContent += `<p class="part-of-speech">${meaning.partOfSpeech}</p>`;
        // Making it concise.
        meaning.definitions.slice(0, 3).forEach((def, index) => {
            htmlContent += `
                <div class="definition-item">
                    ${index + 1}. ${def.definition}
                    ${def.example ? `<span class="example">Example: "${def.example}"</span>` : ''}
                </div>
            `;
        });
        // Showing synonyms if available.
        if (meaning.synonyms && meaning.synonyms.length > 0) {
            htmlContent += `<p class="synonyms-list"><strong>Synonyms:</strong> ${meaning.synonyms.slice(0, 5).join(', ')}</p>`;
        }
    });

    resultSection.innerHTML = htmlContent;
}
// Function to play the audio pronunciation

function playAudio(url) {
    const audio = new Audio(url);
    audio.play();
}

