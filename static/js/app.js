$( document ).ready(function () {
    /*
     * Classes
     */
    class RandomWord {
        /**
         * @param {string} word
         * @param {string} hint
         */
        constructor(word, hint) {
            this.word = word;
            this.hint = hint;
        }
    }
    /**
     * @property {number} incorrectGuesses
     * @property {array} wordInProgress
     */
    class Game {
        fillCharacter = "_";

        /**
         * @param {string} word
         * @param {string} hint
         */
        constructor(word, hint) {
            this.init(word, hint);
        }

        /**
         * @param {string} word
         * @param {string} hint
         */
        init(word, hint) {
            this.word = word.toUpperCase();
            this.hint = hint;

            this.incorrectGuesses = 0;
            this.wordInProgress = this.word.split('').fill(this.fillCharacter);
        }

        /**
         * Reveal the letter in the word.
         *
         * @param {string} letter
         * @return {boolean}
         */
        playLetter(letter) {
            let found = false;
            for (let i=0; i < this.word.length; i++) {
                if (this.word.charAt(i) === letter) {
                    this.wordInProgress[i] = letter;
                    found = true;
                }
            }

            if (!found) {
                this.incorrectGuesses++;
            }

            return found;
        }

        /**
         * @return {boolean}
         */
        hasLost() {
            return this.incorrectGuesses === 6;
        }

        /**
         * @return {boolean}
         */
        hasWon() {
            return this.wordInProgress.indexOf(this.fillCharacter) === -1;
        }
    }

    /*
     * Variables
     */
    let $hangmanGame = $('#hangman-game');
    let $loadingElement = $('#loading .spinner-grow');
    let $hangingManElement = $hangmanGame.find('.hanging-man');
    let $wordInProgressElement = $hangmanGame.find('.word-in-progress');
    let game = new Game("", "");

    setupGame();
    resetGame();

    function setupGame() {
        // Create letter template
        let $buttonTemplate = $('<button type="button" class="btn btn-primary m-1"></button>');
        $buttonTemplate.click(playLetter);

        // Create letters from template
        let firstLetter = 65; // A
        let lastLetter = firstLetter + 26;
        let $lettersContainer = $hangmanGame.find('.letters');
        for (let i = firstLetter; i < lastLetter; i++) {
            let $button = $buttonTemplate.clone(true);
            let letter = String.fromCharCode(i);
            $button.text(letter);
            $button.attr('data-value', letter);
            $lettersContainer.append($button);
        }

        // Allow making a new game
        $('button.reset-button').click(function () {
            resetGame();
        });
    }

    function resetGame() {
        showGame(false);
        showLoading(true);
        enableGame(false);
        resetPlayedButtons();

        getRandomWord()
            .then(response => response.json())
            .then(data => {
                let randomWord = new RandomWord(data.word, data.hint);
                initGame(randomWord);
            });
    }

    /**
     *
     * @param {RandomWord} randomWord
     */
    function initGame(randomWord) {
        game.init(randomWord.word, randomWord.hint);
        drawHangingMan();
        drawWordInProgress();
        showGame(true);
        enableGame(true);
        showLoading(false);
    }

    /**
     * @returns {Promise<Response>}
     */
    function getRandomWord() {
        return fetch("/api/random-word");
    }

    /**
     * @param {Event} event
     */
    function playLetter(event) {
        let $button = $(event.target);

        // Disable the button
        markButtonAsPlayed($button);

        // The letter
        let letter = $button.attr('data-value');

        // Play the game
        game.playLetter(letter);

        // Update the views
        drawWordInProgress();
        drawHangingMan();

        if (game.hasLost()) {
            alert('You have reached the maximum guesses! The word was: ' + game.word)
            enableGame(false);
        }

        if (game.hasWon()) {
            alert('You won! Well done!');
            enableGame(false);
        }
    }

    function drawWordInProgress() {
        $wordInProgressElement.text(game.wordInProgress.toString());
    }

    function drawHangingMan() {
        $hangingManElement.text(game.incorrectGuesses + "/" + 6);
    }

    /**
     * @param {boolean} state
     */
    function enableGame(state) {
        $hangmanGame.find('.letters button').prop('disabled', !state);
    }

    /**
     *
     * @param {boolean} state
     */
    function showLoading(state) {
        if (state) {
            $loadingElement.show();
        } else {
            $loadingElement.hide();
        }
    }

    /**
     * @param {boolean} state
     */
    function showGame(state) {
        if (state) {
            $hangmanGame.show();
        } else {
            $hangmanGame.hide();
        }
    }

    /**
     * @param {jQuery|HTMLElement} $button
     */
    function markButtonAsPlayed($button) {
        $button.prop('disabled', true);
        $button.addClass('btn-secondary');
        $button.removeClass('btn-primary');
    }

    function resetPlayedButtons() {
        let $buttons = $hangmanGame.find('.letters button');
        $buttons.toggleClass('btn-secondary', false);
        $buttons.toggleClass('btn-primary', true);
    }
});
