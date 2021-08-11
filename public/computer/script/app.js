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
			[3, 5, 7]
		];
		this.winningPossibilitiesOfCrosses = [
			[1, 2, 3],
			[4, 5, 6],
			[7, 8, 9],
			[1, 4, 7],
			[2, 5, 8],
			[3, 6, 9],
			[1, 5, 9],
			[3, 5, 7]
		];

		this.buttonsMarkedWithNoughts = [];
		this.buttonsMarkedWithCrosses = [];
		this.buttonsUnmarked = [1, 2, 3, 4, 5, 6, 7, 8, 9];

		this.wictoryOfNoughts = false;
		this.wictoryOfCrosses = false;

		this.steps = 1;

		this.playerName;

		this.playerScore;
		this.mrCoderScore;
	}

	playerMove(target) {
		var targetId = target.id;
		var buttonId = this.utility.getButtonId(targetId);

		this.utility.markButton(buttonId, "X", target, this);

		this.utility.removeWinningPossibilities("O", buttonId, this);

		if (this.steps >= 3) {
			var winningPair = this.utility.checkForWictory("X", this);
			if (this.wictoryOfCrosses) {
				this.utility.declareAsWinner("X", winningPair, this);
			}
		}
	}

	mrCoderMove() {
		if (this.steps == 5) {
			this.utility.declareMatchAsDraw(this);
		} else {
			this.ui.playerLoaderElement.style.display = "none";
			this.ui.mrCoderLoaderElement.style.display = "block";
			this.utility.stopTheGame(this);

			var self = this;
			setTimeout(function() {
				self.utility.getResponseFromMrCoder(self);
			}, 2000);
		}
	}
}

// UI Class

class UI {
	constructor() {
		this.gameBoardElement = document.getElementById("game-board");
		this.playerScoreElement = document.getElementById("player-wins");
		this.mrCoderScoreElement = document.getElementById("mr-coder-wins");
		this.playerNameElement = document.getElementById("player-name");
		this.mrCoderLoaderElement = document.getElementById("mr-coder-loading");
		this.playerLoaderElement = document.getElementById("player-loading");
		this.newGameButtonElement = document.getElementById("new-game");

		this.modalForPlayerNameElement = new bootstrap.Modal(
			document.getElementById("modal-player-name"),
			{
				keyboard: false,
				backdrop: "static"
			}
		);
		this.modalForPlayerNameButtonElement = document.getElementById(
			"modal-player-name-button"
		);

		this.modalForAlertElement = new bootstrap.Modal(
			document.getElementById("modal-alert"),
			{
				keyboard: false,
				backdrop: "static"
			}
		);
		this.modalForAlertButtonElement = document.getElementById(
			"modal-alert-button"
		);
	}
}

// Utility Class

class Utility {
	getResponseFromMrCoder(game) {
		var buttonId = this.generateResponse(game);
		var targetId = this.getTargetId(buttonId);
		var target = document.getElementById(targetId);

		this.markButton(buttonId, "O", target, game);

		this.removeWinningPossibilities("X", buttonId, game);

		if (game.steps >= 3) {
			var winningPair = this.checkForWictory("O", game);
			if (game.wictoryOfNoughts) {
				this.declareAsWinner("O", winningPair, game);
			}
		}

		if (!game.wictoryOfNoughts) {
			game.steps = game.steps + 1;
			this.resumeTheGame(game);
			game.ui.playerLoaderElement.style.display = "block";
			game.ui.mrCoderLoaderElement.style.display = "none";
		}
	}

	generateResponse(game) {
		var buttonId;

		switch (game.steps) {
			case 1:
				buttonId = this.firstMove(game);
				return buttonId;
			case 2:
				buttonId = this.secondMove(game);
				return buttonId;
			case 3:
				buttonId = this.thirdOrFourthMove(game);
				return buttonId;
			case 4:
				buttonId = this.thirdOrFourthMove(game);
				return buttonId;
			default:
			// Not Possible
		}
	}

	firstMove(game) {
		if (game.buttonsUnmarked.includes(5)) {
			return 5;
		} else {
			var buttonIdArray = [1, 3, 7, 9];
			var randomButtonId =
				buttonIdArray[Math.floor(Math.random() * buttonIdArray.length)];
			return randomButtonId;
		}
	}

	secondMove(game) {
		var pair = this.getDangerPair(game);

		if (pair != null) {
			var value;
			for (value of pair) {
				if (game.buttonsUnmarked.includes(value)) {
					return value;
				}
			}
		} else {
			var cross1 = [1, 5, 9];
			var cross2 = [3, 5, 7];
			var count1 = 0;
			var count2 = 0;
			var value;

			for (value of cross1) {
				if (!game.buttonsUnmarked.includes(value)) {
					count1++;
				}
			}

			for (value of cross2) {
				if (!game.buttonsUnmarked.includes(value)) {
					count2++;
				}
			}

			if (count1 == 3 && game.buttonsMarkedWithCrosses.includes(5)) {
				var option = [3, 7];
				return option[Math.floor(Math.random() * option.length)];
			} else if (
				count2 == 3 &&
				game.buttonsMarkedWithCrosses.includes(5)
			) {
				var option = [1, 9];
				return option[Math.floor(Math.random() * option.length)];
			} else {
				var buttonId = this.getNeighbour(game);
				return buttonId;
			}
		}
	}

	thirdOrFourthMove(game) {
		var pair = this.getWinningPair(game);

		if (pair != null) {
			var value;
			for (value of pair) {
				if (game.buttonsUnmarked.includes(value)) {
					return value;
				}
			}
		} else {
			pair = this.getDangerPair(game);
			if (pair != null) {
				var value;
				for (value of pair) {
					if (game.buttonsUnmarked.includes(value)) {
						return value;
					}
				}
			} else {
				var buttonId = this.getNeighbour(game);
				return buttonId;
			}
		}
	}

	getDangerPair(game) {
		var possibility;

		for (possibility of game.winningPossibilitiesOfCrosses) {
			var count = 0;
			var value;
			for (value of possibility) {
				if (game.buttonsMarkedWithCrosses.includes(value)) {
					count++;
				}
			}
			if (count == 2) {
				return possibility;
			}
		}

		return null;
	}

	getNeighbour(game) {
		var neighbourButtonIds = [];
		var element;

		for (element of game.buttonsMarkedWithCrosses) {
			if (game.buttonsUnmarked.includes(element - 1)) {
				if (
					Math.floor((element - 1) / 3) ==
					Math.floor((element - 2) / 3)
				) {
					neighbourButtonIds.push(element - 1);
				}
			}
			if (game.buttonsUnmarked.includes(element + 1)) {
				if (Math.floor((element - 1) / 3) == Math.floor(element / 3)) {
					neighbourButtonIds.push(element + 1);
				}
			}
			if (game.buttonsUnmarked.includes(element - 3)) {
				neighbourButtonIds.push(element - 3);
			}
			if (game.buttonsUnmarked.includes(element + 3)) {
				neighbourButtonIds.push(element + 3);
			}
		}

		var attackingNeighbourButtonIds = this.getAttackingNeighbour(
			neighbourButtonIds,
			game
		);

		if (attackingNeighbourButtonIds == null) {
			return neighbourButtonIds[
				Math.floor(Math.random() * neighbourButtonIds.length)
			];
		} else {
			return attackingNeighbourButtonIds[
				Math.floor(Math.random() * attackingNeighbourButtonIds.length)
			];
		}
	}

	getAttackingNeighbour(neighbourButtonIds, game) {
		var pairs = [];
		var attackingNeighbourButtonIds = [];
		var possibility;
		var buttonId;

		for (possibility of game.winningPossibilitiesOfNoughts) {
			var count = 0;
			var value;
			for (value of possibility) {
				if (game.buttonsUnmarked.includes(value)) {
					count++;
				}
			}
			if (count == 2) {
				pairs.push(possibility);
			}
		}

		for (buttonId of neighbourButtonIds) {
			var pair;
			for (pair of pairs) {
				if (pair.includes(buttonId)) {
					attackingNeighbourButtonIds.push(buttonId);
					break;
				}
			}
		}

		if (attackingNeighbourButtonIds.length == 0) {
			return null;
		} else {
			return attackingNeighbourButtonIds;
		}
	}

	getWinningPair(game) {
		var possibility;

		for (possibility of game.winningPossibilitiesOfNoughts) {
			var count = 0;
			var value;
			for (value of possibility) {
				if (game.buttonsMarkedWithNoughts.includes(value)) {
					count++;
				}
			}
			if (count == 2) {
				return possibility;
			}
		}

		return null;
	}

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
		game.buttonsUnmarked.forEach(function(value, index) {
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

	removeWinningPossibilities(option, buttonId, game) {
		var winningPossibilities;

		if (option == "X") {
			winningPossibilities = game.winningPossibilitiesOfCrosses;
		} else {
			winningPossibilities = game.winningPossibilitiesOfNoughts;
		}

		winningPossibilities = winningPossibilities.filter(function(
			possibility
		) {
			return !possibility.includes(buttonId);
		});

		if (option == "X") {
			game.winningPossibilitiesOfCrosses = winningPossibilities;
		} else {
			game.winningPossibilitiesOfNoughts = winningPossibilities;
		}
	}

	declareAsWinner(option, winningPair, game) {
		this.increaseScore(option, game);
		this.highlightWinningPair(winningPair);
		this.stopTheGame(game);
		game.ui.playerLoaderElement.style.display = "none";
		game.ui.mrCoderLoaderElement.style.display = "none";

		var self = this;

		if (option == "X") {
			setTimeout(function() {
				self.showAlert(game, game.playerName + " Wins");
			}, 1000);
		} else {
			setTimeout(function() {
				self.showAlert(game, "Mr Coder Wins");
			}, 1000);
		}
	}

	declareMatchAsDraw(game) {
		this.stopTheGame(game);
		game.ui.playerLoaderElement.style.display = "none";
		game.ui.mrCoderLoaderElement.style.display = "none";
		var self = this;
		setTimeout(function() {
			self.showAlert(game, "Game Has Been Drawn");
		}, 1000);
	}

	showAlert(game, message) {
		document.getElementById("game-part").style.filter = "blur(5px)";
		document.getElementById("modal-alert-title").innerText = message;
		game.ui.modalForAlertElement.show();
	}

	increaseScore(option, game) {
		if (option == "X") {
			game.playerScore++;
			game.ui.playerScoreElement.innerText = game.playerScore;
			localStorage.setItem("playerScore", game.playerScore);
		} else {
			game.mrCoderScore++;
			game.ui.mrCoderScoreElement.innerText = game.mrCoderScore;
			localStorage.setItem("mrCoderScore", game.mrCoderScore);
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

// Load All Event Listners

function loadAllEventListners() {
	document.addEventListener("DOMContentLoaded", contentLoadedListener);

	myGame.ui.gameBoardElement.addEventListener(
		"click",
		gameButtonClickedListener
	);

	myGame.ui.newGameButtonElement.addEventListener(
		"click",
		newGameButtonClickedListener
	);

	myGame.ui.modalForPlayerNameButtonElement.addEventListener(
		"click",
		getPlayerNameFromModalListener
	);

	myGame.ui.modalForAlertButtonElement.addEventListener(
		"click",
		removeAlertListener
	);
}

loadAllEventListners();

// First Event Listener

function contentLoadedListener(event) {
	if (localStorage.getItem("playerName") == null) {
		myGame.ui.modalForPlayerNameElement.show();
		document.getElementById("game-part").style.filter = "blur(5px)";
	} else {
		myGame.playerName = localStorage.getItem("playerName");
		myGame.ui.playerNameElement.innerText = myGame.playerName;
		var message = `Welcome ${myGame.playerName} \n Let's Play`;
		myGame.utility.showAlert(myGame, message);
	}

	if (localStorage.getItem("playerScore") == null) {
		myGame.playerScore = 0;
		localStorage.setItem("playerScore", myGame.playerScore);
	} else {
		myGame.playerScore = localStorage.getItem("playerScore");
		myGame.ui.playerScoreElement.innerText = myGame.playerScore;
	}

	if (localStorage.getItem("mrCoderScore") == null) {
		myGame.mrCoderScore = 0;
		localStorage.setItem("mrCoderScore", myGame.mrCoderScore);
	} else {
		myGame.mrCoderScore = localStorage.getItem("mrCoderScore");
		myGame.ui.mrCoderScoreElement.innerText = myGame.mrCoderScore;
	}

	myGame.ui.playerLoaderElement.style.display = "block";
	myGame.ui.mrCoderLoaderElement.style.display = "none";
}

// Second Event Listener

function gameButtonClickedListener(event) {
	var target = event.target;

	if (target.className == "primary-text btn") {
		if (!(myGame.wictoryOfNoughts || myGame.wictoryOfCrosses)) {
			myGame.playerMove(target);
		}

		if (!(myGame.wictoryOfNoughts || myGame.wictoryOfCrosses)) {
			myGame.mrCoderMove(target);
		}
	}
}

// Third Event Listener

function newGameButtonClickedListener(event) {
	location.reload();
}

// Forth Event Listener

function getPlayerNameFromModalListener(event) {
	myGame.playerName = document.getElementById(
		"modal-player-name-input"
	).value;
	myGame.ui.modalForPlayerNameElement.hide();
	document.getElementById("game-part").style.filter = "none";
	myGame.utility.setPlayerName(myGame);
}

// Fifth Event Listener

function removeAlertListener(event) {
	document.getElementById("game-part").style.filter = "none";
	myGame.ui.modalForAlertElement.hide();
}
