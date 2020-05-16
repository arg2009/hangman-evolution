$( document ).ready(function () {
    /*
     * Classes
     */
    class RandomWord {
        /**
         * @param {string} word
         * @param {string} hints
         */
        constructor(word, hints) {
            this.word = word;
            this.hints = hints;
        }
    }
    /**
     * @property {number} incorrectGuesses
     * @property {array} wordInProgress
     */
    class Game {
        fillCharacter = "_";

        /**
         * @param {string} id
         * @param {string} word
         * @param {array} hints
         */
        constructor(id, word, hints) {
            this.init(id, word, hints);
        }

        /**
         * @param {number} id
         * @param {string} word
         * @param {array} hints
         */
        init(id, word, hints) {
            this.id = id;
            this.word = word.toUpperCase();
            this.hints = hints;
            this.enabledHints = Array(hints.length);
            this.enabledHints.fill(false);
            this.enabledHints[0] = true;

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

        revealAHint() {
            for (let i=0; i < this.enabledHints.length; i++) {
                if (this.enabledHints[i] !== true) {
                    this.enabledHints[i] = true;
                    break;
                }
            }
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
    let $wordHint = $hangmanGame.find('.word-hint');
    let game = new Game("", "", []);

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

        getNewGame()
            .then(response => response.json())
            .then(data => {
                let randomWord = new RandomWord(data.word, data.hints);
                initGame(data['id_'], randomWord);
            });
    }

    /**
     *
     * @param {number} id
     * @param {RandomWord} randomWord
     */
    function initGame(id, randomWord) {
        game.init(id, randomWord.word, randomWord.hints.split(','));
        drawHangingMan();
        drawWordInProgress();
        drawWordHint();
        showGame(true);
        enableGame(true);
        showLoading(false);
    }

    /**
     * @returns {Promise<Response>}
     */
    function getNewGame() {
        return fetch(
            "/api/game",
            {
                method: "POST"
            }
        );
    }

    /**
     * @return {Promise<Response>}
     */
    function recordGameResult() {
        return fetch(
            "/api/game",
            {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_: game.id,
                    is_won: game.hasWon()
                })
            }
        );
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
            recordGameResult();
        }

        if (game.hasWon()) {
            alert('You won! Well done!');
            enableGame(false);
            recordGameResult();
        }
    }

    function revealAHint() {
        game.revealAHint();
        drawWordHint();
    }

    function drawWordInProgress() {
        $wordInProgressElement.text(game.wordInProgress.toString());
    }

    function drawWordHint() {
        let hints = $('<div></div>');
        for (let i=0; i < game.hints.length; i++) {
            if (game.enabledHints[i]) {
                hints.append($('<div>' + game.hints[i] + '</div>'));
            }
        }
        let $button = $('<button>Reveal another hint</button>');
        $button.click(function() {
            revealAHint();
        });

        hints.append($button);
        $wordHint.html(hints);
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
