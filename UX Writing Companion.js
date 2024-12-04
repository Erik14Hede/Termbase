let wordList = [];
let contentMemory = [];
let currentWordPage = 1;
let currentContentMemoryPage = 1;
const itemsPerPage = 10;



async function fetchWordList() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/Erik14Hede/Termbase/main/TB_bilingual Final.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        wordList = data.filter(entry => entry.Terms.some(term => term.lang === 'en-US'))
            .map(entry => {
                const enTerms = entry.Terms.filter(term => term.lang === 'en-US');
                return {
                    id: entry.ID,
                    definition: entry.Definition,
                    feature: entry.Feature,
                    comment: entry.Comment,
                    terms: enTerms
                };
            });
        searchWordList();
    } catch (error) {
        console.error('Failed to fetch word list:', error);
    }
}

const corsProxy = 'https://cors-anywhere.herokuapp.com/';
const url = 'https://raw.githubusercontent.com/Erik14Hede/Termbase/main/translation_memory.xml';

async function fetchContentMemory() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/Erik14Hede/Termbase/main/translation_memory.xml');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
        const contentUnits = xmlDoc.getElementsByTagName('ContentUnit');

        contentMemory = Array.from(contentUnits).map(unit => {
            const id = unit.getAttribute('id');  // IDs are strings
            const sourceContent = unit.getElementsByTagName('SourceContent')[0]?.textContent || '';
            const targetContent = unit.getElementsByTagName('TargetContent')[0]?.textContent || '';
            const feature = unit.getElementsByTagName('Feature')[0]?.textContent || '';

            // Log details to ensure correct parsing
            console.log(`ID: ${id}, Source: ${sourceContent}, Target: ${targetContent}, Feature: ${feature}`);

            return { id, sourceContent, targetContent, feature };
        });

        searchContentMemory();  // Trigger search after fetching the memory
    } catch (error) {
        console.error('Failed to fetch content memory:', error);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    fetchWordList();
    fetchContentMemory().then(() => searchContentMemory(''));
    updateSecondaryDropdown();
    clearOutput();
});

function updateSecondaryDropdown() {
    const guidelinesSelect = document.getElementById('guidelinesSelect');
    const secondaryGuidelinesSelect = document.getElementById('secondaryGuidelinesSelect');
    secondaryGuidelinesSelect.innerHTML = '';

    if (guidelinesSelect.value === 'emptyState') {
        secondaryGuidelinesSelect.innerHTML = `
            <option value="title">Title</option>
            <option value="text">Text</option>
        `;
        secondaryGuidelinesSelect.style.display = 'inline-block';
    } else if (guidelinesSelect.value === 'errorMessages') {
        secondaryGuidelinesSelect.innerHTML = `
            <option value="general">General</option>
            <option value="growl">Growl</option>
            <option value="inline">Inline</option>
        `;
        secondaryGuidelinesSelect.style.display = 'inline-block';
    } else if (guidelinesSelect.value === 'successMessages') {
        secondaryGuidelinesSelect.innerHTML = `
            <option value="general">General</option>
            <option value="growl">Growl</option>
        `;
        secondaryGuidelinesSelect.style.display = 'inline-block';
    } else if (guidelinesSelect.value === 'textArea') {
        secondaryGuidelinesSelect.innerHTML = `
            <option value="fieldLabel">Field Label</option>
            <option value="placeholder">Placeholder</option>
            <option value="helpText">Help Text</option>
        `;
        secondaryGuidelinesSelect.style.display = 'inline-block';
    } else if (guidelinesSelect.value === 'textInputField') {
        secondaryGuidelinesSelect.innerHTML = `
            <option value="fieldLabel">Field Label</option>
            <option value="placeholder">Placeholder</option>
            <option value="helpText">Help Text</option>
        `;
        secondaryGuidelinesSelect.style.display = 'inline-block';
    } else if (guidelinesSelect.value === 'toggles') {
        secondaryGuidelinesSelect.innerHTML = `
            <option value="name">Name</option>
            <option value="helpText">Help Text</option>
            <option value="tooltip">Tooltip</option>
        `;
        secondaryGuidelinesSelect.style.display = 'inline-block';
    } else if (guidelinesSelect.value === 'tooltips') {
        secondaryGuidelinesSelect.innerHTML = `
            <option value="general">General</option>
            <option value="unlabeledIcon">Unlabeled Icon</option>
            <option value="informationalText">Informational Text</option>
        `;
        secondaryGuidelinesSelect.style.display = 'inline-block';
    } else {
        secondaryGuidelinesSelect.style.display = 'none';
    }
}

function clearOutput() {
    document.getElementById('output').innerHTML = '';
    document.getElementById('wordList').innerHTML = '';
    document.getElementById('contentMemoryList').innerHTML = '';
    document.getElementById('termDetails').innerHTML = '';
}

function clearText() {
    document.getElementById('textInput').innerText = '';
    clearOutput();
}

function checkText() {
    const textInput = document.getElementById('textInput');
    const outputDiv = document.getElementById('output');
    const wordListDiv = document.getElementById('wordList');
    const contentMemoryDiv = document.getElementById('contentMemoryList');
    const sentences = textInput.innerText.split('\n');
    const selectedGuideline = document.getElementById('guidelinesSelect').value;
    const selectedSecondaryGuideline = document.getElementById('secondaryGuidelinesSelect').value;
    let errorMessage = '';

    if (selectedGuideline === 'general') {
        checkGeneralGuidelines(sentences, errorMessage, outputDiv);
    } else if (selectedGuideline === 'buttons') {
        checkButtonsGuidelines(sentences, errorMessage, outputDiv);
    } else if (selectedGuideline === 'checkbox') {
        checkCheckboxGuidelines(sentences, errorMessage, outputDiv);
    } else if (selectedGuideline === 'emptyState') {
        if (selectedSecondaryGuideline === 'title') {
            checkEmptyStateTitleGuidelines(sentences, errorMessage, outputDiv);
        } else if (selectedSecondaryGuideline === 'text') {
            checkEmptyStateTextGuidelines(sentences, errorMessage, outputDiv);
        }
    } else if (selectedGuideline === 'errorMessages') {
        if (selectedSecondaryGuideline === 'general') {
            checkErrorMessagesGeneral(sentences, errorMessage, outputDiv);
        } else if (selectedSecondaryGuideline === 'growl') {
            checkErrorMessagesGrowl(sentences, errorMessage, outputDiv);
        } else if (selectedSecondaryGuideline === 'inline') {
            checkErrorMessagesInline(sentences, errorMessage, outputDiv);
        }
    } else if (selectedGuideline === 'successMessages') {
        if (selectedSecondaryGuideline === 'general') {
            checkSuccessMessagesGeneral(sentences, errorMessage, outputDiv);
        } else if (selectedSecondaryGuideline === 'growl') {
            checkSuccessMessagesGrowl(sentences, errorMessage, outputDiv);
        }
    } else if (selectedGuideline === 'textArea') {
        if (selectedSecondaryGuideline === 'fieldLabel') {
            checkTextAreaFieldLabel(sentences, errorMessage, outputDiv);
        } else if (selectedSecondaryGuideline === 'placeholder') {
            checkTextAreaPlaceholder(sentences, errorMessage, outputDiv);
        } else if (selectedSecondaryGuideline === 'helpText') {
            checkTextAreaHelpText(sentences, errorMessage, outputDiv);
        }
    } else if (selectedGuideline === 'textInputField') {
        if (selectedSecondaryGuideline === 'fieldLabel') {
            checkTextInputFieldLabel(sentences, errorMessage, outputDiv);
        } else if (selectedSecondaryGuideline === 'placeholder') {
            checkTextInputPlaceholder(sentences, errorMessage, outputDiv);
        } else if (selectedSecondaryGuideline === 'helpText') {
            checkTextInputHelpText(sentences, errorMessage, outputDiv);
        }
    } else if (selectedGuideline === 'toggles') {
        if (selectedSecondaryGuideline === 'name') {
            checkTogglesName(sentences, errorMessage, outputDiv);
        } else if (selectedSecondaryGuideline === 'helpText') {
            checkTogglesHelpText(sentences, errorMessage, outputDiv);
        } else if (selectedSecondaryGuideline === 'tooltip') {
            checkTogglesTooltip(sentences, errorMessage, outputDiv);
        }
    } else if (selectedGuideline === 'tooltips') {
        if (selectedSecondaryGuideline === 'general') {
            checkTooltipsGeneral(sentences, errorMessage, outputDiv);
        } else if (selectedSecondaryGuideline === 'unlabeledIcon') {
            checkTooltipsUnlabeledIcon(sentences, errorMessage, outputDiv);
        } else if (selectedSecondaryGuideline === 'informationalText') {
            checkTooltipsInformationalText(sentences, errorMessage, outputDiv);
        }
    }

    checkWordList(sentences, wordListDiv, currentWordPage);
    checkContentMemory(sentences.join(' '), contentMemoryDiv, currentContentMemoryPage);
}

function checkGeneralGuidelines(sentences, errorMessage, outputDiv) {
    sentences.forEach((sentence, index) => {
        let words = sentence.trim().split(' ');
        let firstWord = words[0];
        let lastChar = sentence.trim().slice(-1);

        // Check first letter capitalization
        if (firstWord && firstWord[0] !== firstWord[0].toUpperCase()) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="capitalization">Line ${index + 1}: The first letter of a sentence needs to be capitalized.</div>\n`;
        }

        // Check if line with more than 4 words ends with a full stop or question mark
        if (words.length > 4 && !['.', '?'].includes(lastChar)) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="punctuation">Line ${index + 1}: A line with more than 4 words needs to end with either a full stop or question mark.</div>\n`;
        }

        // Check for the word "please" and "successfully"
        if (sentence.toLowerCase().includes('please') || sentence.toLowerCase().includes('successfully')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="forbiddenWords">Line ${index + 1}: Do not use the words "please" or "successfully".</div>\n`;
        }
    });

    displayOutput(errorMessage, outputDiv);
}

function checkButtonsGuidelines(sentences, errorMessage, outputDiv) {
    const prepositions = ["in", "on", "at", "by", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "over", "under", "again", "further", "then", "once"];
    const articles = ["a", "an", "the"];
    sentences.forEach((sentence, index) => {
        let words = sentence.trim().split(' ');

        // Check no punctuation at the end
        if (sentence.trim().match(/[.,!?]$/)) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="punctuation">Line ${index + 1}: No punctuation at the end.</div>\n`;
        }

        // Check if line is 3 words or shorter
        if (words.length > 3) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="wordCount">Line ${index + 1}: Should be 3 words or shorter.</div>\n`;
        }

        // Check title case
        if (words.some(word => word && word[0] !== word[0].toUpperCase())) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="titleCase">Line ${index + 1}: Use title case for all words.</div>\n`;
        }

        // Check prepositions and articles
        if (words.some(word => prepositions.includes(word.toLowerCase()) || articles.includes(word.toLowerCase()))) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="prepArticle">Line ${index + 1}: Don't use prepositions or articles.</div>\n`;
        }

        // Check ampersand
        if (sentence.includes('&')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="ampersand">Line ${index + 1}: Don't use ampersand.</div>\n`;
        }
    });

    displayOutput(errorMessage, outputDiv);
}

function checkCheckboxGuidelines(sentences, errorMessage, outputDiv) {
    const negations = ["not", "never", "no", "none", "nobody", "nothing", "neither", "nowhere", "can't", "won't", "isn't", "aren't", "wasn't", "weren't", "don't", "doesn't", "didn't", "hasn't", "haven't", "hadn't"];
    sentences.forEach((sentence, index) => {
        let words = sentence.trim().split(' ');
        let lastChar = sentence.trim().slice(-1);

        // Check for negations
        if (words.some(word => negations.includes(word.toLowerCase()))) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="negation">Line ${index + 1}: Don't use negations.</div>\n`;
        }

        // Check no line break
        if (sentence.includes('\n')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="lineBreak">Line ${index + 1}: No line break.</div>\n`;
        }

        // Check if more than two sentences
        if (sentence.split(/[.!?]/).length > 3) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="twoSentences">Line ${index + 1}: No more than two sentences.</div>\n`;
        }

        // Check if ends with a full stop or question mark
        if (!['.', '?'].includes(lastChar)) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="endPunctuation">Line ${index + 1}: Requires a full stop or question mark at the end of a sentence.</div>\n`;
        }

        // Check for colon
        if (sentence.includes(':')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="colon">Line ${index + 1}: No colon.</div>\n`;
        }

        // Check title case for sentences shorter than 4 words
        if (words.length < 4 && words.some(word => word && word[0] !== word[0].toUpperCase())) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="shortTitleCase">Line ${index + 1}: Use title case for sentences shorter than 4 words.</div>\n`;
        }

        // Check sentence case for sentences longer than 4 words
        if (words.length >= 4 && (words[0] && words[0][0] !== words[0][0].toUpperCase() || words.slice(1).some(word => word && word[0] === word[0].toUpperCase()))) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="longSentenceCase">Line ${index + 1}: Use sentence case for sentences longer than 4 words.</div>\n`;
        }

        // Check for the word "please" and "successfully"
        if (sentence.toLowerCase().includes('please') || sentence.toLowerCase().includes('successfully')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="forbiddenWords">Line ${index + 1}: Do not use the words "please" or "successfully".</div>\n`;
        }
    });

    displayOutput(errorMessage, outputDiv);
}

function checkEmptyStateTitleGuidelines(sentences, errorMessage, outputDiv) {
    sentences.forEach((sentence, index) => {
        let words = sentence.trim().split(' ');

        // If 4 words or less: Use Title Case, no ending punctuation.
        if (words.length <= 4) {
            if (words.some(word => word && word[0] !== word[0].toUpperCase())) {
                errorMessage += `<div class="error-message" data-line="${index}" data-error="titleCase">Line ${index + 1}: Use title case for sentences with 4 words or less.</div>\n`;
            }
            if (sentence.trim().match(/[.!?]$/)) {
                errorMessage += `<div class="error-message" data-line="${index}" data-error="punctuation">Line ${index + 1}: No ending punctuation for titles.</div>\n`;
            }
        } else {
            // If longer than 4 words, use sentence case, also no ending punctuation.
            if (words[0] && words[0][0] !== words[0][0].toUpperCase() || words.slice(1).some(word => word && word[0] === word[0].toUpperCase())) {
                errorMessage += `<div class="error-message" data-line="${index}" data-error="sentenceCase">Line ${index + 1}: Use sentence case for sentences longer than 4 words.</div>\n`;
            }
            if (sentence.trim().match(/[.!?]$/)) {
                errorMessage += `<div class="error-message" data-line="${index}" data-error="punctuation">Line ${index + 1}: No ending punctuation for titles.</div>\n`;
            }
        }

        // Check for the word "please" and "successfully"
        if (sentence.toLowerCase().includes('please') || sentence.toLowerCase().includes('successfully')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="forbiddenWords">Line ${index + 1}: Do not use the words "please" or "successfully".</div>\n`;
        }
    });

    displayOutput(errorMessage, outputDiv);
}

function checkEmptyStateTextGuidelines(sentences, errorMessage, outputDiv) {
    sentences.forEach((sentence, index) => {
        let words = sentence.trim().split(' ');
        let lastChar = sentence.trim().slice(-1);

        // Use sentence case
        if (words[0] && words[0][0] !== words[0][0].toUpperCase() || words.slice(1).some(word => word && word[0] === word[0].toUpperCase())) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="sentenceCase">Line ${index + 1}: Use sentence case for empty state text.</div>\n`;
        }

        // Use ending punctuation
        if (!['.', '?', '!'].includes(lastChar)) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="punctuation">Line ${index + 1}: Use ending punctuation for empty state text.</div>\n`;
        }

        // Check for the word "please" and "successfully"
        if (sentence.toLowerCase().includes('please') || sentence.toLowerCase().includes('successfully')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="forbiddenWords">Line ${index + 1}: Do not use the words "please" or "successfully".</div>\n`;
        }
    });

    displayOutput(errorMessage, outputDiv);
}

function checkErrorMessagesGeneral(sentences, errorMessage, outputDiv) {
    const forbiddenWords = [
        "Failed", "You entered a wrong", "Executed", "Error", "Forbidden", "Fatal Error",
        "Please", "Oops", "Whoops", "Invalid", "You didn’t", "Wrong"
    ];
    sentences.forEach((sentence, index) => {
        // Check for full sentences
        if (!sentence.trim().match(/^[A-Z][^.!?]*[.!?]$/)) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="fullSentence">Line ${index + 1}: Use full sentences.</div>\n`;
        }

        // Check for exclamation points
        if (sentence.includes('!')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="exclamation">Line ${index + 1}: Do not use exclamation points.</div>\n`;
        }

        // Check for forbidden words
        forbiddenWords.forEach(word => {
            if (sentence.includes(word)) {
                errorMessage += `<div class="error-message" data-line="${index}" data-error="forbiddenWord">Line ${index + 1}: Do not use the word "${word}".</div>\n`;
            }
        });
    });

    displayOutput(errorMessage, outputDiv);
}

function checkErrorMessagesGrowl(sentences, errorMessage, outputDiv) {
    sentences.forEach((sentence, index) => {
        let words = sentence.trim().split(' ');

        // Try to keep the word count below 10
        if (words.length > 10) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="wordCount">Line ${index + 1}: Try to keep the word count below 10.</div>\n`;
        }

        // Use sentence case
        if (words[0] && words[0][0] !== words[0][0].toUpperCase() || words.slice(1).some(word => word && word[0] === word[0].toUpperCase())) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="sentenceCase">Line ${index + 1}: Use sentence case.</div>\n`;
        }

        // No ending punctuation when fewer than 4 words
        if (words.length < 4 && sentence.trim().match(/[.!?]$/)) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="punctuation">Line ${index + 1}: No ending punctuation when fewer than 4 words.</div>\n`;
        }

        // If more than 4 words, use full stop or question mark
        if (words.length >= 4 && !['.', '?'].includes(sentence.trim().slice(-1))) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="punctuation">Line ${index + 1}: Use full stop or question mark when more than 4 words.</div>\n`;
        }

        // Check for the word "please" and "successfully"
        if (sentence.toLowerCase().includes('please') || sentence.toLowerCase().includes('successfully')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="forbiddenWords">Line ${index + 1}: Do not use the words "please" or "successfully".</div>\n`;
        }
    });

    displayOutput(errorMessage, outputDiv);
}

function checkErrorMessagesInline(sentences, errorMessage, outputDiv) {
    sentences.forEach((sentence, index) => {
        let words = sentence.trim().split(' ');

        // Use sentence case
        if (words[0] && words[0][0] !== words[0][0].toUpperCase() || words.slice(1).some(word => word && word[0] === word[0].toUpperCase())) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="sentenceCase">Line ${index + 1}: Use sentence case.</div>\n`;
        }

        // End with a full stop
        if (!sentence.trim().endsWith('.')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="punctuation">Line ${index + 1}: End with a full stop.</div>\n`;
        }

        // No more than two lines
        if (sentence.split('\n').length > 2) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="lineCount">Line ${index + 1}: No more than two lines.</div>\n`;
        }

        // Check for the word "please" and "successfully"
        if (sentence.toLowerCase().includes('please') || sentence.toLowerCase().includes('successfully')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="forbiddenWords">Line ${index + 1}: Do not use the words "please" or "successfully".</div>\n`;
        }
    });

    displayOutput(errorMessage, outputDiv);
}

function checkSuccessMessagesGeneral(sentences, errorMessage, outputDiv) {
    sentences.forEach((sentence, index) => {
        // Check for full sentences
        if (!sentence.trim().match(/^[A-Z][^.!?]*[.!?]$/)) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="fullSentence">Line ${index + 1}: Use full sentences.</div>\n`;
        }

        // Check for exclamation points
        if (sentence.includes('!')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="exclamation">Line ${index + 1}: Do not use exclamation points.</div>\n`;
        }

        // Check for forbidden words
        if (sentence.includes('Successfully')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="forbiddenWord">Line ${index + 1}: Do not use the word "Successfully".</div>\n`;
        }
    });

    displayOutput(errorMessage, outputDiv);
}

function checkSuccessMessagesGrowl(sentences, errorMessage, outputDiv) {
    sentences.forEach((sentence, index) => {
        let words = sentence.trim().split(' ');

        // Try to keep the word count below 10
        if (words.length > 10) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="wordCount">Line ${index + 1}: Try to keep the word count below 10.</div>\n`;
        }

        // Use sentence case
        if (words[0] && words[0][0] !== words[0][0].toUpperCase() || words.slice(1).some(word => word && word[0] === word[0].toUpperCase())) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="sentenceCase">Line ${index + 1}: Use sentence case.</div>\n`;
        }

        // No ending punctuation when fewer than 4 words
        if (words.length < 4 && sentence.trim().match(/[.!?]$/)) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="punctuation">Line ${index + 1}: No ending punctuation when fewer than 4 words.</div>\n`;
        }

        // If more than 4 words, use full stop or question mark
        if (words.length >= 4 && !['.', '?'].includes(sentence.trim().slice(-1))) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="punctuation">Line ${index + 1}: Use full stop or question mark when more than 4 words.</div>\n`;
        }

        // Check for the word "please" and "successfully"
        if (sentence.toLowerCase().includes('please') || sentence.toLowerCase().includes('successfully')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="forbiddenWords">Line ${index + 1}: Do not use the words "please" or "successfully".</div>\n`;
        }
    });

    displayOutput(errorMessage, outputDiv);
}

function checkTextAreaFieldLabel(sentences, errorMessage, outputDiv) {
    sentences.forEach((sentence, index) => {
        // Maximum 1 line (max. 40 characters)
        if (sentence.length > 40 || sentence.includes('\n')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="lineLength">Line ${index + 1}: Maximum 1 line (max. 40 characters).</div>\n`;
        }

        // No end punctuation
        if (sentence.trim().match(/[.!?]$/)) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="punctuation">Line ${index + 1}: No end punctuation.</div>\n`;
        }

        // No colon
        if (sentence.includes(':')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="colon">Line ${index + 1}: No colon.</div>\n`;
        }

        // Use title case
        if (sentence.split(' ').some(word => word && word[0] !== word[0].toUpperCase())) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="titleCase">Line ${index + 1}: Use title case.</div>\n`;
        }

        // Check for the word "please" and "successfully"
        if (sentence.toLowerCase().includes('please') || sentence.toLowerCase().includes('successfully')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="forbiddenWords">Line ${index + 1}: Do not use the words "please" or "successfully".</div>\n`;
        }
    });

    displayOutput(errorMessage, outputDiv);
}

function checkTextAreaPlaceholder(sentences, errorMessage, outputDiv) {
    sentences.forEach((sentence, index) => {
        // Max. one line and sentence.
        if (sentence.includes('\n') || sentence.split(/[.!?]/).length > 2) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="lineLength">Line ${index + 1}: Max. one line and sentence.</div>\n`;
        }

        // End with a space and three dots …
        if (!sentence.trim().endsWith(' …')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="punctuation">Line ${index + 1}: End with a space and three dots " …".</div>\n`;
        }

        // Use sentence case
        if (sentence[0] && sentence[0] !== sentence[0].toUpperCase() || sentence.split(' ').slice(1).some(word => word && word[0] === word[0].toUpperCase())) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="sentenceCase">Line ${index + 1}: Use sentence case.</div>\n`;
        }

        // Check for the word "please" and "successfully"
        if (sentence.toLowerCase().includes('please') || sentence.toLowerCase().includes('successfully')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="forbiddenWords">Line ${index + 1}: Do not use the words "please" or "successfully".</div>\n`;
        }
    });

    displayOutput(errorMessage, outputDiv);
}

function checkTextAreaHelpText(sentences, errorMessage, outputDiv) {
    sentences.forEach((sentence, index) => {
        // Max. 3 lines
        if (sentence.split('\n').length > 3) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="lineLength">Line ${index + 1}: Max. 3 lines.</div>\n`;
        }

        // Use sentence case with a full stop at the end
        if (sentence[0] && sentence[0] !== sentence[0].toUpperCase() || sentence.split(' ').slice(1).some(word => word && word[0] === word[0].toUpperCase()) || !sentence.trim().endsWith('.')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="sentenceCase">Line ${index + 1}: Use sentence case with a full stop at the end.</div>\n`;
        }

        // No exclamation points
        if (sentence.includes('!')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="exclamation">Line ${index + 1}: No exclamation points.</div>\n`;
        }

        // Check for the word "please" and "successfully"
        if (sentence.toLowerCase().includes('please') || sentence.toLowerCase().includes('successfully')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="forbiddenWords">Line ${index + 1}: Do not use the words "please" or "successfully".</div>\n`;
        }
    });

    displayOutput(errorMessage, outputDiv);
}

function checkTextInputFieldLabel(sentences, errorMessage, outputDiv) {
    sentences.forEach((sentence, index) => {
        // Maximum 1 line (max. 40 characters)
        if (sentence.length > 40 || sentence.includes('\n')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="lineLength">Line ${index + 1}: Maximum 1 line (max. 40 characters).</div>\n`;
        }

        // No end punctuation
        if (sentence.trim().match(/[.!?]$/)) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="punctuation">Line ${index + 1}: No end punctuation.</div>\n`;
        }

        // No colon
        if (sentence.includes(':')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="colon">Line ${index + 1}: No colon.</div>\n`;
        }

        // Use title case
        if (sentence.split(' ').some(word => word && word[0] !== word[0].toUpperCase())) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="titleCase">Line ${index + 1}: Use title case.</div>\n`;
        }

        // Check for the word "please" and "successfully"
        if (sentence.toLowerCase().includes('please') || sentence.toLowerCase().includes('successfully')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="forbiddenWords">Line ${index + 1}: Do not use the words "please" or "successfully".</div>\n`;
        }
    });

    displayOutput(errorMessage, outputDiv);
}

function checkTextInputPlaceholder(sentences, errorMessage, outputDiv) {
    sentences.forEach((sentence, index) => {
        // Max. one line and sentence.
        if (sentence.includes('\n') || sentence.split(/[.!?]/).length > 2) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="lineLength">Line ${index + 1}: Max. one line and sentence.</div>\n`;
        }

        // End with a space and three dots …
        if (!sentence.trim().endsWith(' …')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="punctuation">Line ${index + 1}: End with a space and three dots " …".</div>\n`;
        }

        // Use sentence case
        if (sentence[0] && sentence[0] !== sentence[0].toUpperCase() || sentence.split(' ').slice(1).some(word => word && word[0] === word[0].toUpperCase())) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="sentenceCase">Line ${index + 1}: Use sentence case.</div>\n`;
        }

        // Check for the word "please" and "successfully"
        if (sentence.toLowerCase().includes('please') || sentence.toLowerCase().includes('successfully')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="forbiddenWords">Line ${index + 1}: Do not use the words "please" or "successfully".</div>\n`;
        }
    });

    displayOutput(errorMessage, outputDiv);
}

function checkTextInputHelpText(sentences, errorMessage, outputDiv) {
    sentences.forEach((sentence, index) => {
        // Max. 3 lines
        if (sentence.split('\n').length > 3) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="lineLength">Line ${index + 1}: Max. 3 lines.</div>\n`;
        }

        // Use sentence case with a full stop at the end
        if (sentence[0] && sentence[0] !== sentence[0].toUpperCase() || sentence.split(' ').slice(1).some(word => word && word[0] === word[0].toUpperCase()) || !sentence.trim().endsWith('.')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="sentenceCase">Line ${index + 1}: Use sentence case with a full stop at the end.</div>\n`;
        }

        // No exclamation points
        if (sentence.includes('!')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="exclamation">Line ${index + 1}: No exclamation points.</div>\n`;
        }

        // Check for the word "please" and "successfully"
        if (sentence.toLowerCase().includes('please') || sentence.toLowerCase().includes('successfully')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="forbiddenWords">Line ${index + 1}: Do not use the words "please" or "successfully".</div>\n`;
        }
    });

    displayOutput(errorMessage, outputDiv);
}

function checkTogglesName(sentences, errorMessage, outputDiv) {
    sentences.forEach((sentence, index) => {
        let words = sentence.trim().split(' ');

        // Max three words
        if (words.length > 3) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="wordCount">Line ${index + 1}: Max three words.</div>\n`;
        }

        // Use title case
        if (words.some(word => word && word[0] !== word[0].toUpperCase())) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="titleCase">Line ${index + 1}: Use title case.</div>\n`;
        }

        // Check for the word "please" and "successfully"
        if (sentence.toLowerCase().includes('please') || sentence.toLowerCase().includes('successfully')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="forbiddenWords">Line ${index + 1}: Do not use the words "please" or "successfully".</div>\n`;
        }
    });

    displayOutput(errorMessage, outputDiv);
}

function checkTogglesHelpText(sentences, errorMessage, outputDiv) {
    sentences.forEach((sentence, index) => {
        // Max two sentences
        if (sentence.split(/[.!?]/).length > 3) { // Includes empty string after last punctuation
            errorMessage += `<div class="error-message" data-line="${index}" data-error="sentenceCount">Line ${index + 1}: Max two sentences.</div>\n`;
        }

        // Use sentence case
        if (sentence[0] && sentence[0] !== sentence[0].toUpperCase() || sentence.split(' ').slice(1).some(word => word && word[0] === word[0].toUpperCase())) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="sentenceCase">Line ${index + 1}: Use sentence case.</div>\n`;
        }

        // Use punctuation at the end
        if (!sentence.trim().match(/[.!?]$/)) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="punctuation">Line ${index + 1}: Use punctuation at the end.</div>\n`;
        }

        // Check for the word "please" and "successfully"
        if (sentence.toLowerCase().includes('please') || sentence.toLowerCase().includes('successfully')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="forbiddenWords">Line ${index + 1}: Do not use the words "please" or "successfully".</div>\n`;
        }
    });

    displayOutput(errorMessage, outputDiv);
}

function checkTogglesTooltip(sentences, errorMessage, outputDiv) {
    sentences.forEach((sentence, index) => {
        // Use sentence case
        if (sentence[0] && sentence[0] !== sentence[0].toUpperCase() || sentence.split(' ').slice(1).some(word => word && word[0] === word[0].toUpperCase())) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="sentenceCase">Line ${index + 1}: Use sentence case.</div>\n`;
        }

        // Use punctuation at the end
        if (!sentence.trim().match(/[.!?]$/)) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="punctuation">Line ${index + 1}: Use punctuation at the end.</div>\n`;
        }

        // Check for the word "please" and "successfully"
        if (sentence.toLowerCase().includes('please') || sentence.toLowerCase().includes('successfully')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="forbiddenWords">Line ${index + 1}: Do not use the words "please" or "successfully".</div>\n`;
        }
    });

    displayOutput(errorMessage, outputDiv);
}

function checkTooltipsGeneral(sentences, errorMessage, outputDiv) {
    sentences.forEach((sentence, index) => {
        // Max. 4 lines
        if (sentence.split('\n').length > 4) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="lineLength">Line ${index + 1}: Max. 4 lines.</div>\n`;
        }

        // Check for the word "please" and "successfully"
        if (sentence.toLowerCase().includes('please') || sentence.toLowerCase().includes('successfully')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="forbiddenWords">Line ${index + 1}: Do not use the words "please" or "successfully".</div>\n`;
        }
    });

    displayOutput(errorMessage, outputDiv);
}

function checkTooltipsUnlabeledIcon(sentences, errorMessage, outputDiv) {
    sentences.forEach((sentence, index) => {
        let words = sentence.trim().split(' ');

        // No end punctuation
        if (sentence.trim().match(/[.!?]$/)) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="punctuation">Line ${index + 1}: No end punctuation.</div>\n`;
        }

        // Exception: If multiple sentences
        if (sentence.split(/[.!?]/).length > 2) { // Includes empty string after last punctuation
            errorMessage += `<div class="error-message" data-line="${index}" data-error="multipleSentences">Line ${index + 1}: Exception: If multiple sentences.</div>\n`;
        }

        // Use sentence case
        if (words[0] && words[0] !== words[0].toUpperCase() || words.slice(1).some(word => word && word[0] === word[0].toUpperCase())) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="sentenceCase">Line ${index + 1}: Use sentence case.</div>\n`;
        }

        // Check for the word "please" and "successfully"
        if (sentence.toLowerCase().includes('please') || sentence.toLowerCase().includes('successfully')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="forbiddenWords">Line ${index + 1}: Do not use the words "please" or "successfully".</div>\n`;
        }
    });

    displayOutput(errorMessage, outputDiv);
}

function checkTooltipsInformationalText(sentences, errorMessage, outputDiv) {
    sentences.forEach((sentence, index) => {
        // Use sentence case
        if (sentence[0] && sentence[0] !== sentence[0].toUpperCase() || sentence.split(' ').slice(1).some(word => word && word[0] === word[0].toUpperCase())) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="sentenceCase">Line ${index + 1}: Use sentence case.</div>\n`;
        }

        // Use end punctuation
        if (!sentence.trim().match(/[.!?]$/)) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="punctuation">Line ${index + 1}: Use end punctuation.</div>\n`;
        }

        // No exclamation points
        if (sentence.includes('!')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="exclamation">Line ${index + 1}: No exclamation points.</div>\n`;
        }

        // Check for the word "please" and "successfully"
        if (sentence.toLowerCase().includes('please') || sentence.toLowerCase().includes('successfully')) {
            errorMessage += `<div class="error-message" data-line="${index}" data-error="forbiddenWords">Line ${index + 1}: Do not use the words "please" or "successfully".</div>\n`;
        }
    });

    displayOutput(errorMessage, outputDiv);
}

function displayOutput(errorMessage, outputDiv) {
    if (errorMessage) {
        outputDiv.innerHTML = errorMessage;
    } else {
        outputDiv.innerHTML = `<div id="error">No errors found!</div>`;
    }

    document.querySelectorAll('.error-message').forEach(element => {
        element.addEventListener('mouseover', function () {
            highlightError(element);
        });
        element.addEventListener('mouseout', function () {
            removeHighlight();
        });
    });
}

function checkWordList(sentences, wordListDiv, page) {
    let wordListOutput = '';
    let foundWords = new Set();
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = page * itemsPerPage;

    let matches = [];

    wordList.forEach(entry => {
        entry.terms.forEach(term => {
            sentences.forEach(sentence => {
                if (sentence.toLowerCase().includes(term.term.toLowerCase()) && !foundWords.has(term.term)) {
                    foundWords.add(term.term);
                    matches.push({
                        term: term.term,
                        definition: entry.definition,
                        usage: term.Usage,
                        pos: term.POS,
                        feature: entry.feature,
                        comment: entry.comment,
                        matchType: 'term'
                    });
                }
            });
        });
    });

    matches.sort((a, b) => a.matchType.localeCompare(b.matchType));

    const paginatedMatches = matches.slice(startIndex, endIndex);

    paginatedMatches.forEach(match => {
        wordListOutput += `<div class="word-entry" data-word="${match.term}" data-definition="${match.definition.replace(/"/g, '&quot;')}" data-usage="${match.usage}" data-pos="${match.pos}" data-feature="${match.feature}" data-comment="${match.comment.replace(/"/g, '&quot;')}">
            <strong>${match.term}</strong>: ${match.definition}</div>\n`;
    });

    wordListDiv.innerHTML = wordListOutput;
    renderPaginationControls('wordListPagination', page, Math.ceil(matches.length / itemsPerPage), searchWordListPage);

    document.querySelectorAll('.word-entry').forEach(element => {
        element.addEventListener('mouseover', function () {
            highlightWord(element);
        });
        element.addEventListener('mouseout', function () {
            removeWordHighlight();
        });
        element.addEventListener('click', function () {
            displayTermDetails(element);
        });
    });
}

function displayTermDetails(element) {
    const word = element.getAttribute('data-word');
    const definition = element.getAttribute('data-definition');
    const usage = element.getAttribute('data-usage');
    const pos = element.getAttribute('data-pos');
    const feature = element.getAttribute('data-feature');
    const comment = element.getAttribute('data-comment');

    const termDetailsDiv = document.getElementById('termDetails');
    termDetailsDiv.innerHTML = `
        <h3>Term Details</h3>
        <dl class="term-details">
            <dt>Word:</dt>
            <dd>${word}</dd>
            <dt>Definition:</dt>
            <dd>${definition}</dd>
            <dt>Usage:</dt>
            <dd>${usage}</dd>
            <dt>POS:</dt>
            <dd>${pos}</dd>
            <dt>Feature:</dt>
            <dd>${feature}</dd>
            <dt>Comment:</dt>
            <dd>${comment}</dd>
        </dl>
    `;
}

function checkContentMemory(inputText, contentMemoryDiv, page) {
    const selectedLanguage = document.querySelector('input[name="languageSelect"]:checked').value;
    let contentMemoryOutput = '';
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = page * itemsPerPage;

    const matches = contentMemory.map(unit => {
        let contentToCheck = selectedLanguage === 'en' ? unit.sourceContent : unit.targetContent;
        const similarity = calculateLevenshteinSimilarity(inputText, contentToCheck);
        return { ...unit, similarity, contentToCheck };
    })
    .filter(match => match.similarity >= 40) // Filter out results with low similarity
    .sort((a, b) => b.similarity - a.similarity); // Sort by similarity

    const paginatedMatches = matches.slice(startIndex, endIndex);

    paginatedMatches.forEach(match => {
        contentMemoryOutput += `
            <tr>
                <td class="content-entry" data-feature="${match.feature}">${match.contentToCheck}</td>
                <td>${Math.round(match.similarity)}%</td>
                <td>${match.feature}</td>
            </tr>
        `;
    });

    contentMemoryDiv.innerHTML = contentMemoryOutput;
    renderPaginationControls('contentMemoryPagination', page, Math.ceil(matches.length / itemsPerPage), searchContentMemoryPage);

    document.querySelectorAll('.content-entry').forEach(element => {
        element.addEventListener('mouseover', function () {
            element.title = `Feature: ${element.getAttribute('data-feature')}`;
        });
    });
}


function calculateLevenshteinSimilarity(a, b) {
    const distance = levenshteinDistance(a, b);
    const maxLength = Math.max(a.length, b.length);
    return ((maxLength - distance) / maxLength * 100).toFixed(0);
}

function levenshteinDistance(a, b) {
    const matrix = [];

    // Increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // Increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = [j];
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

function highlightError(element) {
    const line = element.getAttribute('data-line');
    const errorType = element.getAttribute('data-error');
    const textInput = document.getElementById('textInput');
    const sentences = textInput.innerText.split('\n');

    let sentence = sentences[line];
    let highlightedSentence = '';

    switch (errorType) {
        case 'capitalization':
            highlightedSentence = sentence.replace(/^\w/, match => `<span class="error-highlight">${match}</span>`);
            break;
        case 'punctuation':
            highlightedSentence = sentence.replace(/(.*)/, match => `<span class="error-highlight">${match}</span>`);
            break;
        case 'please':
            highlightedSentence = sentence.replace(/please/gi, match => `<span class="error-highlight">${match}</span>`);
            break;
        case 'wordCount':
            highlightedSentence = sentence.replace(/(.*)/, match => `<span class="error-highlight">${match}</span>`);
            break;
        case 'titleCase':
            highlightedSentence = sentence.replace(/(\b[a-z])/g, match => `<span class="error-highlight">${match}</span>`);
            break;
        case 'prepArticle':
            highlightedSentence = sentence.replace(new RegExp(`\\b(${prepositions.concat(articles).join('|')})\\b`, 'gi'), match => `<span class="error-highlight">${match}</span>`);
            break;
        case 'ampersand':
            highlightedSentence = sentence.replace(/&/g, match => `<span class="error-highlight">${match}</span>`);
            break;
        case 'negation':
            highlightedSentence = sentence.replace(new RegExp(`\\b(${negations.join('|')})\\b`, 'gi'), match => `<span class="error-highlight">${match}</span>`);
            break;
        case 'lineBreak':
            highlightedSentence = sentence.replace(/\n/g, match => `<span class="error-highlight">${match}</span>`);
            break;
        case 'twoSentences':
            highlightedSentence = sentence.replace(/([.!?])/g, match => `<span class="error-highlight">${match}</span>`);
            break;
        case 'endPunctuation':
            highlightedSentence = sentence.replace(/([^\.\?])$/, match => `<span class="error-highlight">${match}</span>`);
            break;
        case 'colon':
            highlightedSentence = sentence.replace(/:/g, match => `<span class="error-highlight">${match}</span>`);
            break;
        case 'shortTitleCase':
            highlightedSentence = sentence.replace(/(\b[a-z])/g, match => `<span class="error-highlight">${match}</span>`);
            break;
        case 'longSentenceCase':
            highlightedSentence = sentence.replace(/(\b[A-Z][a-z]*)/g, match => `<span class="error-highlight">${match}</span>`);
            break;
        case 'sentenceCase':
            highlightedSentence = sentence.replace(/(\b[A-Z][a-z]*)/g, match => `<span class="error-highlight">${match}</span>`);
            break;
    }

    sentences[line] = highlightedSentence;
    textInput.innerHTML = sentences.join('\n').replace(/\n/g, '<br>');
}

function highlightWord(element) {
    const word = element.getAttribute('data-word');
    const textInput = document.getElementById('textInput');
    const sentences = textInput.innerText.split('\n');

    sentences.forEach((sentence, index) => {
        if (sentence.toLowerCase().includes(word.toLowerCase())) {
            sentences[index] = sentence.replace(new RegExp(`(${word})`, 'gi'), '<span class="word-highlight">$1</span>');
        }
    });

    textInput.innerHTML = sentences.join('\n').replace(/\n/g, '<br>');
}

function removeHighlight() {
    const textInput = document.getElementById('textInput');
    textInput.innerHTML = textInput.innerHTML.replace(/<span class="error-highlight">(.*?)<\/span>/g, '$1').replace(/<br>/g, '\n');
}

function removeWordHighlight() {
    const textInput = document.getElementById('textInput');
    textInput.innerHTML = textInput.innerHTML.replace(/<span class="word-highlight">(.*?)<\/span>/g, '$1').replace(/<br>/g, '\n');
}

function searchWordList() {
    const searchTerm = document.getElementById('searchBar').value.toLowerCase();
    const wordListDiv = document.getElementById('wordList');
  const searchType = document.querySelector('input[name="searchType"]:checked').value;
    let wordListOutput = '';
    let foundWords = new Set();

    let matches = [];

    wordList.forEach(entry => {

        entry.terms.forEach(term => {

            if (searchType === 'terms' && term.term.toLowerCase().includes(searchTerm)) {

                if (!foundWords.has(term.term)) {

                    foundWords.add(term.term);

                    matches.push({

                        term: term.term,

                        definition: entry.definition,

                        usage: term.Usage,

                        pos: term.POS,

                        feature: entry.feature,

                        comment: entry.comment,

                        matchType: 'term'

                    });

                }

            } else if (searchType === 'both' && (term.term.toLowerCase().includes(searchTerm) || entry.definition.toLowerCase().includes(searchTerm))) {

               if (!foundWords.has(term.term)) {

                    foundWords.add(term.term);

                    matches.push({

                        term: term.term,

                        definition: entry.definition,

                        usage: term.Usage,

                        pos: term.POS,

                        feature: entry.feature,

                        comment: entry.comment,

                        matchType: term.term.toLowerCase() === searchTerm ? 'term' : 'definition'

                    });

                }

            }

        });

    });


    matches.sort((a, b) => a.matchType.localeCompare(b.matchType));

    const paginatedMatches = matches.slice(0, itemsPerPage);

    paginatedMatches.forEach(match => {
        wordListOutput += `<div class="word-entry" data-word="${match.term}" data-definition="${match.definition.replace(/"/g, '&quot;')}" data-usage="${match.usage}" data-pos="${match.pos}" data-feature="${match.feature}" data-comment="${match.comment.replace(/"/g, '&quot;')}">
            <strong>${match.term}</strong>: ${match.definition}</div>\n`;
    });

    wordListDiv.innerHTML = wordListOutput;
    renderPaginationControls('wordListPagination', currentWordPage, Math.ceil(matches.length / itemsPerPage), searchWordListPage);

    document.querySelectorAll('.word-entry').forEach(element => {
        element.addEventListener('mouseover', function () {
            highlightWord(element);
        });
        element.addEventListener('mouseout', function () {
            removeWordHighlight();
        });
        element.addEventListener('click', function () {
            displayTermDetails(element);
        });
    });
}

function searchWordListPage(page) {
    currentWordPage = page;
    searchWordList();
}

function searchContentMemory() {
    const searchTerm = document.getElementById('contentMemorySearchBar').value.toLowerCase();
    const selectedLanguage = document.querySelector('input[name="languageSelect"]:checked').value;
    const contentMemoryDiv = document.getElementById('contentMemoryList');
    let contentMemoryOutput = '';

    const matches = contentMemory.filter(unit => {
        let contentToSearch = selectedLanguage === 'en' ? unit.sourceContent : unit.targetContent;
        return contentToSearch.toLowerCase().includes(searchTerm);
    });

    const paginatedMatches = matches.slice(0, itemsPerPage);

    paginatedMatches.forEach(match => {
        let contentToDisplay = selectedLanguage === 'en' ? match.sourceContent : match.targetContent;
        contentMemoryOutput += `
            <tr>
                <td class="content-entry" data-feature="${match.feature}">${contentToDisplay}</td>
                <td></td>
                <td>${match.feature}</td>
            </tr>
        `;
    });

    contentMemoryDiv.innerHTML = contentMemoryOutput;
    renderPaginationControls('contentMemoryPagination', currentContentMemoryPage, Math.ceil(matches.length / itemsPerPage), searchContentMemoryPage);

    document.querySelectorAll('.content-entry').forEach(element => {
        element.addEventListener('mouseover', function () {
            element.title = `Feature: ${element.getAttribute('data-feature')}`;
        });
    });
}


function searchContentMemoryPage(page) {
    currentContentMemoryPage = page;
    searchContentMemory();
}

function renderPaginationControls(containerId, currentPage, totalPages, onPageChange) {
    const container = document.getElementById(containerId);
    let paginationControls = '';

    if (totalPages > 1) {
        if (currentPage > 1) {
            paginationControls += `<button class="pagination-btn" onclick="${onPageChange.name}(${currentPage - 1})">◄</button>`;
        }
        paginationControls += `<span class="pagination-span">Page ${currentPage} of ${totalPages}</span>`;
        if (currentPage < totalPages) {
            paginationControls += `<button class="pagination-btn" onclick="${onPageChange.name}(${currentPage + 1})">►</button>`;
        }
    }

    container.innerHTML = paginationControls;
}

