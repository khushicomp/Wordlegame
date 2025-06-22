$(document).ready(function () {
      const $startsound = $("#startsound");
      const $endsuccesssound = $("#endsuccesssound");
      const $endfailsound = $("#endfailsound");

      const $wordContainer = $("#word-container");
      const $guessForm = $("#guess-form");
      const $guessInput = $("#guess-input");
      const $submitButton = $("#submitButton");
      const $chancesSpan = $("#chances");
      const $lengthSpan = $("#length");
      const $feedbackDiv = $("#feedback");
      const $historyList = $("#history-list");

      let secretWord = "";
      let maxTries = "";
      let chancesLeft = maxTries;
      let guessedWords = [];

      $("#start-button").on("click", function () {
        $(this).prop("disabled", true);
        $submitButton.prop("disabled", false);
        fetchRandomWord();
      });

      function fetchRandomWord() {
        $startsound[0].play();
        fetch("https://random-word-api.vercel.app/api?words=1&length=5")
          .then((response) => response.json())
          .then((data) => {
            secretWord = data[0].toUpperCase();
            maxTries = secretWord.length + 1;
            chancesLeft = maxTries;
            guessedWords = [];
            $chancesSpan.text(chancesLeft);
            $lengthSpan.text(secretWord.length);
            $guessInput.attr("maxlength", secretWord.length);
            $guessInput.prop("disabled", false);
            renderWordContainers();
            $historyList.empty();
            console.log("Secret Word:", secretWord);
          })
          .catch((error) => {
            console.error("Error:", error.message);
          });
      }

      function renderWordContainers() {
        $wordContainer.empty();
        for (let i = 0; i < secretWord.length; i++) {
          $wordContainer.append(`<span class="letter" id="letter-${i}">?</span>`);
        }
      }

      function checkWordle(guess) {
        const originalWord = secretWord;
        let secretLetters = {};
        let guessLetters = {};
        let feedback = guess.split("").map((letter, index) => {
          const correctLetter = originalWord[index];
          if (letter === correctLetter) {
            return "C";
          } else {
            secretLetters[correctLetter] = (secretLetters[correctLetter] || 0) + 1;
            guessLetters[letter] = (guessLetters[letter] || 0) + 1;
            return null;
          }
        });

        feedback = feedback.map((val, index) => {
          if (val === "C") return "C";
          const letter = guess[index];
          if (secretLetters[letter]) {
            secretLetters[letter]--;
            return "E";
          } else {
            return "W";
          }
        });

        return feedback;
      }

      function showFeedback(feedback) {
        feedback.forEach((result, index) => {
          const $letter = $(`#letter-${index}`);
          $letter.removeClass("correct exists wrong");
          if (result === "C") $letter.addClass("correct");
          if (result === "E") $letter.addClass("exists");
          if (result === "W") $letter.addClass("wrong");
        });
      }

      function renderHistory() {
        $historyList.empty();
        guessedWords.forEach((word) => {
          const feedback = checkWordle(word);
          let wordHtml = "";
          word.split("").forEach((letter, index) => {
            let letterClass = "";
            switch (feedback[index]) {
              case "C": letterClass = "correct"; break;
              case "E": letterClass = "exists"; break;
              case "W": letterClass = "wrong"; break;
            }
            wordHtml += `<span class="letter ${letterClass}">${letter}</span>`;
          });
          $historyList.append(`<li>${wordHtml}</li>`);
        });
      }

      $guessForm.on("submit", function (event) {
        event.preventDefault();
        const guess = $guessInput.val().toUpperCase();
        if (guess.length === secretWord.length) {
          const feedback = checkWordle(guess);
          showFeedback(feedback);
          guessedWords.push(guess);
          renderHistory();
          chancesLeft--;
          $chancesSpan.text(chancesLeft);
          if (feedback.every((val) => val === "C") || chancesLeft === 0) {
            showResult(feedback);
          }
        } else {
          alert(`Please enter a ${secretWord.length}-letter word.`);
        }
        $guessInput.val("");
      });

      function showResult(feedback) {
        if (feedback.every((val) => val === "C")) {
          $endsuccesssound[0].play();
          $(".container").append('<div class="result-message">🎉 Congratulations! You guessed the word correctly.</div>');
        } else {
          $endfailsound[0].play();
          $(".container").append(`<div class="result-message">😢 Out of chances! The word was <strong>${secretWord}</strong>.</div>`);
        }
        $guessInput.prop("disabled", true);
        $submitButton.prop("disabled", true);
        $guessForm.off("submit");
        $chancesSpan.text("0");
        $feedbackDiv.empty();
      }

      $("#reload-button").on("click", function () {
        location.reload();
      });
    });