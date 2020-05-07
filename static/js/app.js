$( document ).ready(function () {
    let $hangmanGame = $('#hangman-game');
    let $loadingElement = $('#loading .spinner-grow');

    // Game state
    let game;

    showLoading(true);
    setupGame();
    enableGame(false);

    getRandomWord()
        .then(response => response.json())
        .then(data => {
            let randomWord = new RandomWord(data.word, data.hint);
            initGame(randomWord);
        });

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
    }

    /**
     *
     * @param {RandomWord} randomWord
     */
    function initGame(randomWord) {
        game = new Game(randomWord.word, randomWord.hint);
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
        $button.prop('disabled', true);

        // The letter
        let letter = $button.attr('data-value');

        // Play the game
        game.playLetter(letter);
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
            this.word = word;
            this.hint = hint;

            this.incorrectGuesses = 0;
            this.wordInProgress = this.word.split('').fill("");
        }

        /**
         * @param {string} letter
         */
        playLetter(letter) {
            // TODO: Implement
        }
    }
});
