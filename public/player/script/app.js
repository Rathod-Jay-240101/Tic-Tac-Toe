// Game Class

class Game {
    constructor() {
        this.ui = new UI();
        this.utility = new Utility();

        this.winningPossibilitiesOfNoughts = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
            [1, 4, 7],
            [2, 5, 8],
            [3, 6, 9],
            [1, 5, 9],
            [3, 5, 7],
        ];
        this.winningPossibilitiesOfCrosses = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
            [1, 4, 7],
            [2, 5, 8],
            [3, 6, 9],
            [1, 5, 9],
            [3, 5, 7],
        ];

        this.buttonsMarkedWithNoughts = [];
        this.buttonsMarkedWithCrosses = [];
        this.buttonsUnmarked = [1, 2, 3, 4, 5, 6, 7, 8, 9];

        this.wictoryOfNoughts = false;
        this.wictoryOfCrosses = false;

        this.steps = 1;

        this.playerName;
        this.opponentName;
        this.opponentId;

        this.turn;
        this.option;

        this.playerScore;
        this.opponentScore;

        this.isNoughtsAssigned = false;
        this.isCrossesAssigned = false;
    }

    playerMove(target) {
        if (this.option == "X") {
            var targetId = target.id;
            var buttonId = this.utility.getButtonId(targetId);

            this.utility.markButton(buttonId, "X", target, this);

            if (this.steps >= 5) {
                var winningPair = this.utility.checkForWictory("X", this);
                if (this.wictoryOfCrosses) {
                    this.utility.declareAsWinner("player", winningPair, this);
                } else {
                    if (this.steps == 9) {
                        this.utility.declareMatchAsDraw(this);
                    }
                }
            }

            socket.emit("move", { id: this.opponentId, buttonId: buttonId });
        } else {
            var targetId = target.id;
            var buttonId = this.utility.getButtonId(targetId);

            this.utility.markButton(buttonId, "O", target, this);

            if (this.steps >= 5) {
                var winningPair = this.utility.checkForWictory("O", this);
                if (this.wictoryOfNoughts) {
                    this.utility.declareAsWinner("player", winningPair, this);
                }
            }

            socket.emit("move", { id: this.opponentId, buttonId: buttonId });
        }

        this.steps++;
        if (!(this.wictoryOfCrosses || this.wictoryOfNoughts || this.steps == 10)) {
            this.utility.stopTheGame(this);
            this.ui.playerLoaderElement.style.display = "none";
            this.ui.opponentLoaderElement.style.display = "block";
        }
    }
}

// UI Class

class UI {
    constructor() {
        this.gameBoardElement = document.getElementById("game-board");
        this.playerScoreElement = document.getElementById("player-wins");
        this.opponentScoreElement = document.getElementById("opponent-wins");
        this.playerNameElement = document.getElementById("player-name");
        this.opponentNameElement = document.getElementById("opponent-name");
        this.playerOptionElement = document.getElementById("player-option");
        this.opponentOptionElement = document.getElementById("opponent-option");
        this.opponentLoaderElement = document.getElementById("opponent-loading");
        this.playerLoaderElement = document.getElementById("player-loading");
        this.newGameButtonElement = document.getElementById("new-game");

        this.modalForPlayerNameElement = new bootstrap.Modal(
            document.getElementById("modal-player-name"),
            {
                keyboard: false,
                backdrop: "static",
            }
        );
        this.modalForPlayerNameButtonElement = document.getElementById("modal-player-name-button");

        this.modalForAlertElement = new bootstrap.Modal(document.getElementById("modal-alert"), {
            keyboard: false,
            backdrop: "static",
        });
        this.modalForAlertButtonElement = document.getElementById("modal-alert-button");
    }
}

// Utility Class

class Utility {
    getButtonId(targetId) {
        switch (targetId) {
            case "btn-1":
                return 1;
            case "btn-2":
                return 2;
            case "btn-3":
                return 3;
            case "btn-4":
                return 4;
            case "btn-5":
                return 5;
            case "btn-6":
                return 6;
            case "btn-7":
                return 7;
            case "btn-8":
                return 8;
            case "btn-9":
                return 9;
            default:
            // Not Possible
        }
    }

    getTargetId(buttonId) {
        switch (buttonId) {
            case 1:
                return "btn-1";
            case 2:
                return "btn-2";
            case 3:
                return "btn-3";
            case 4:
                return "btn-4";
            case 5:
                return "btn-5";
            case 6:
                return "btn-6";
            case 7:
                return "btn-7";
            case 8:
                return "btn-8";
            case 9:
                return "btn-9";
            default:
            // Not Possible
        }
    }

    setPlayerName(game) {
        if (game.playerName.trim() == "") {
            game.playerName = "Player";
        }
        localStorage.setItem("playerName", game.playerName);
        game.ui.playerNameElement.innerText = game.playerName;
    }

    markButton(buttonId, option, target, game) {
        game.buttonsUnmarked.forEach(function (value, index) {
            if (value == buttonId) {
                game.buttonsUnmarked.splice(index, 1);
            }
        });

        if (option == "X") {
            game.buttonsMarkedWithCrosses.push(buttonId);
            target.innerText = "X";
            target.style.pointerEvents = "none";
        } else {
            game.buttonsMarkedWithNoughts.push(buttonId);
            target.innerText = "O";
            target.style.pointerEvents = "none";
        }
    }

    checkForWictory(option, game) {
        var winningPossibilities;
        var buttonsMarked;
        var wictory;
        var winningPair;

        if (option == "X") {
            winningPossibilities = game.winningPossibilitiesOfCrosses;
            buttonsMarked = game.buttonsMarkedWithCrosses;
        } else {
            winningPossibilities = game.winningPossibilitiesOfNoughts;
            buttonsMarked = game.buttonsMarkedWithNoughts;
        }

        var possibility;
        for (possibility of winningPossibilities) {
            var element;
            for (element of possibility) {
                if (buttonsMarked.includes(element)) {
                    wictory = true;
                } else {
                    wictory = false;
                    break;
                }
            }
            if (wictory) {
                winningPair = possibility;
                break;
            }
        }

        if (option == "X") {
            game.wictoryOfCrosses = wictory;
        } else {
            game.wictoryOfNoughts = wictory;
        }

        if (wictory) {
            return winningPair;
        } else {
            return null;
        }
    }

    declareAsWinner(option, winningPair, game) {
        this.increaseScore(option, game);
        this.highlightWinningPair(winningPair);
        this.stopTheGame(game);
        game.ui.playerLoaderElement.style.display = "none";
        game.ui.opponentLoaderElement.style.display = "none";

        var self = this;

        if (option == "player") {
            setTimeout(function () {
                self.showAlert(game, game.playerName + " Wins");
            }, 1000);
        } else {
            setTimeout(function () {
                self.showAlert(game, game.opponentName + " Wins");
            }, 1000);
        }
    }

    declareMatchAsDraw(game) {
        this.stopTheGame(game);
        game.ui.playerLoaderElement.style.display = "none";
        game.ui.opponentLoaderElement.style.display = "none";
        var self = this;
        setTimeout(function () {
            self.showAlert(game, "Game Has Been Drawn");
        }, 1000);
    }

    showAlert(game, message) {
        document.getElementById("game-part").style.filter = "blur(5px)";
        document.getElementById("modal-alert-title").innerText = message;
        game.ui.modalForAlertElement.show();
    }

    increaseScore(option, game) {
        if (option == "player") {
            game.playerScore++;
            game.ui.playerScoreElement.innerText = game.playerScore;
            localStorage.setItem("playerScore", game.playerScore);
        } else {
            game.opponentScore++;
            game.ui.opponentScoreElement.innerText = game.opponentScore;
            localStorage.setItem("opponentScore", game.opponentScore);
        }
    }

    highlightWinningPair(winningPair) {
        var buttonId;

        for (buttonId of winningPair) {
            var targetId = this.getTargetId(buttonId);
            var target = document.getElementById(targetId);
            target.style.color = "red";
        }
    }

    stopTheGame(game) {
        var buttonId;

        for (buttonId of game.buttonsUnmarked) {
            let targetId = this.getTargetId(buttonId);
            let target = document.getElementById(targetId);
            target.style.pointerEvents = "none";
        }
    }

    resumeTheGame(game) {
        var buttonId;

        for (buttonId of game.buttonsUnmarked) {
            let targetId = this.getTargetId(buttonId);
            let target = document.getElementById(targetId);
            target.style.pointerEvents = "all";
        }
    }
}

// Create Game Object

var myGame = new Game();

// Create Socket

var socket = io();

// Load All Event Listners

function loadAllEventListners() {
    document.addEventListener("DOMContentLoaded", contentLoadedListener);

    myGame.ui.gameBoardElement.addEventListener("click", gameButtonClickedListener);

    myGame.ui.newGameButtonElement.addEventListener("click", newGameButtonClickedListener);

    myGame.ui.modalForPlayerNameButtonElement.addEventListener(
        "click",
        getPlayerNameFromModalListener
    );

    myGame.ui.modalForAlertButtonElement.addEventListener("click", removeAlertListener);
}

loadAllEventListners();

// First Event Listener

function contentLoadedListener() {
    if (localStorage.getItem("playerName") == null) {
        myGame.ui.modalForPlayerNameElement.show();
        document.getElementById("game-part").style.filter = "blur(5px)";
    } else {
        myGame.playerName = localStorage.getItem("playerName");
        myGame.ui.playerNameElement.innerText = myGame.playerName;
        socket.emit("details", {
            name: myGame.playerName,
        });
    }

    if (localStorage.getItem("playerScore") == null) {
        myGame.playerScore = 0;
        localStorage.setItem("playerScore", myGame.playerScore);
    } else {
        myGame.playerScore = localStorage.getItem("playerScore");
        myGame.ui.playerScoreElement.innerText = myGame.playerScore;
    }

    if (localStorage.getItem("opponentScore") == null) {
        myGame.opponentScore = 0;
        localStorage.setItem("opponentScore", myGame.opponentScore);
    } else {
        myGame.opponentScore = localStorage.getItem("opponentScore");
        myGame.ui.opponentScoreElement.innerText = myGame.opponentScore;
    }

    myGame.ui.playerLoaderElement.style.display = "none";
    myGame.ui.opponentLoaderElement.style.display = "none";
    myGame.utility.stopTheGame(myGame);
}

// Second Event Listener

function gameButtonClickedListener(event) {
    var target = event.target;

    if (target.className == "primary-text btn") {
        if (!(myGame.wictoryOfNoughts || myGame.wictoryOfCrosses)) {
            myGame.playerMove(target);
        }
    }
}

// Third Event Listener

function newGameButtonClickedListener() {
    location.reload();
}

// Forth Event Listener

function getPlayerNameFromModalListener() {
    myGame.playerName = document.getElementById("modal-player-name-input").value;
    socket.emit("details", { name: myGame.playerName });
    myGame.ui.modalForPlayerNameElement.hide();
    document.getElementById("game-part").style.filter = "none";
    myGame.utility.setPlayerName(myGame);
}

// Fifth Event Listener

function removeAlertListener() {
    document.getElementById("game-part").style.filter = "none";
    myGame.ui.modalForAlertElement.hide();
}

// Socket Listeners

socket.on("connection", function (value) {
    if (value.result) {
        var message = "Waiting For Players !";
        myGame.utility.showAlert(myGame, message);

        myGame.ui.modalForAlertButtonElement.style.display = "none";
    }
});

socket.on("details", function (details) {
    myGame.opponentName = details.name;
    myGame.opponentId = details.id;
    myGame.turn = details.turn;
    myGame.option = details.option;
    if (myGame.turn) {
        myGame.utility.resumeTheGame(myGame);
        myGame.ui.playerLoaderElement.style.display = "block";
    } else {
        myGame.ui.opponentLoaderElement.style.display = "block";
    }

    if (myGame.option == "X") {
        myGame.ui.playerOptionElement.innerText = "X";
        myGame.ui.opponentOptionElement.innerText = "O";
    } else {
        myGame.ui.playerOptionElement.innerText = "O";
        myGame.ui.opponentOptionElement.innerText = "X";
    }
    myGame.ui.opponentNameElement.innerText = myGame.opponentName;
    myGame.ui.modalForAlertButtonElement.style.display = "block";
    var message = "Player Found !";
    myGame.utility.showAlert(myGame, message);
});

socket.on("move", function (move) {
    var buttonId = move.buttonId;
    var targetId = myGame.utility.getTargetId(buttonId);
    var target = document.getElementById(targetId);

    if (myGame.option == "X") {
        myGame.utility.markButton(buttonId, "O", target, myGame);

        if (myGame.steps >= 5) {
            var winningPair = myGame.utility.checkForWictory("O", myGame);
            if (myGame.wictoryOfNoughts) {
                myGame.utility.declareAsWinner("opponent", winningPair, myGame);
            }
        }
    } else {
        myGame.utility.markButton(buttonId, "X", target, myGame);

        if (myGame.steps >= 5) {
            var winningPair = myGame.utility.checkForWictory("X", myGame);
            if (myGame.wictoryOfCrosses) {
                myGame.utility.declareAsWinner("opponent", winningPair, myGame);
            } else {
                if (myGame.steps == 9) {
                    myGame.utility.declareMatchAsDraw(myGame);
                }
            }
        }
    }

    myGame.steps++;
    if (!(myGame.wictoryOfNoughts || myGame.wictoryOfCrosses || myGame.steps == 10)) {
        myGame.utility.resumeTheGame(myGame);
        myGame.ui.playerLoaderElement.style.display = "block";
        myGame.ui.opponentLoaderElement.style.display = "none";
    }
});

socket.on("delete", function (id) {
    if (myGame.opponentId == id) {
        myGame.utility.stopTheGame(myGame);
        myGame.ui.playerLoaderElement.style.display = "none";
        myGame.ui.opponentLoaderElement.style.display = "none";
        var message = "Player Left The Game !";
        myGame.utility.showAlert(myGame, message);
    }
});
