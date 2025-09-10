var player1 = "P1";
var player2 = "P2";

var chessBoard; // status of each position on the board
var me; // true: player1's turn; false: player2's/computer's turn
var over; // game over flag

var wins; // winning patterns array

// winning patterns count arrays for each player
var p1Win;
var p2Win;

var count; // total winning patterns count

var chess = document.getElementById('chess');
var context = chess.getContext('2d');
context.strokeStyle = "#BFBFBF";
var logo = new Image();
logo.src = "image/logo.png";

// popup modal for player to input names
window.addEventListener('DOMContentLoaded', function() {
    var modal = document.getElementById('nameModal');
    var form = document.getElementById('nameForm');
    var p1Input = document.getElementById('player1Input');
    var p2Input = document.getElementById('player2Input');
    var vsTitle = document.getElementById('vsTitle');

    form.onsubmit = function(e) {
        e.preventDefault();
        player1 = p1Input.value.trim() || p1Input.placeholder;
        player1 = player1;
        player2 = p2Input.value.trim() || p2Input.placeholder;
        player2 = player2;

		if(player1 === player2) {
			player1 += "1";
			player2 += "2";
		}

        modal.style.display = "none";

        // Show the switch sides modal for initial side selection
        var switchModal = document.getElementById('switchSidesModal');
        if (switchModal) switchModal.style.display = "block";

        // Set the message before showing the modal
        var switchSidesMsg = document.getElementById('switchSidesMsg');
        if (switchSidesMsg) {
            switchSidesMsg.textContent = "Now " + player1 + " is using black pieces. And " + player2 + " is using white pieces. Do you want to switch sides?";
        }

        var yesBtn = document.getElementById('switchYes');
        var noBtn = document.getElementById('switchNo');

        // Remove previous handlers to avoid stacking
        yesBtn.onclick = null;
        noBtn.onclick = null;

        yesBtn.onclick = function() {
            // Player1 chooses to go second (White)
        	var temp = player1;
        	player1 = player2;
            player2 = temp;

            if (vsTitle) {
                vsTitle.textContent = player1 + "(B) vs " + player2 + "(W)";
            }
            switchModal.style.display = "none";
			actuallyRestartGame();
        };

        noBtn.onclick = function() {
            // Player1 goes first (Black)
            if (vsTitle) {
                vsTitle.textContent = player1 + "(B) vs " + player2 + "(W)";
            }
            switchModal.style.display = "none";
			actuallyRestartGame();
        };
    };

    // Set initial title if modal is not shown (e.g. after restart)
    if (vsTitle && player1 && player2) {
        vsTitle.textContent = player1 + "(B) vs " + player2 + "(W)";
    }
});

drawLogoAndBoard();

// Reset related variables and arrays
function resetGame(){
	chessBoard = [];
	me = true; 
	over = false;
	wins = [];
	p1Win = [];
	p2Win = [];
	count = 0;

	// 0 for empty, 1 for player1, 2 for player2/computer
	for(var i=0; i<15; i++){
		chessBoard[i] = [];
		for(var j=0; j<15; j++){
			chessBoard[i][j] = 0;
		}
	}

	for(var i=0; i<15; i++){
		wins[i] = [];
		for(var j=0; j<15; j++){
			wins[i][j] = [];
		}
	}

	// horizontal lines
	// Example: setting wins[0][0][0], wins[0][1][0], wins[0][2][0], wins[0][3][0], wins[0][4][0] all true  
	// means the first horizontal line(from (0, 0) to (0, 4)) is a winning pattern, 
	// and this winning pattern is the 0th pattern.
	// Another example: setting wins[0][1][1], wins[0][2][1], wins[0][3][1], wins[0][4][1], wins[0][5][1] all true
	// means the second horizontal line(from (0, 1) to (0, 5)) is a winning pattern, 
	// and this winning pattern is the 1st pattern.
	// Same for vertical, diagonal and anti-diagonal lines.
	// So we can use wins[i][j][k] to check if the position (i, j) is in the k-th winning pattern.
	// And we can use p1Win[k] and p2Win[k] to count how many pieces player1 and player2/computer have in the k-th winning pattern.
	// When p1Win[k] or p2Win[k] reaches 5, that means player1 or player2/computer wins.
	// This design greatly reduces the time complexity of checking for a win after each move.
	for(var i = 0; i < 15; i++){
		for(var j= 0; j < 11; j++){
			for(var k = 0; k < 5; k++){
				wins[i][j+k][count] = true;
			}
			count++;
		}
	}
	// vertical lines
	for(var i = 0; i < 15; i++){
		for(var j= 0; j < 11; j++){
			for(var k = 0; k < 5; k++){
				wins[j+k][i][count] = true;
			}
			count++;
		}
	}
	// diagonal lines
	for(var i = 0; i < 11; i++){
		for(var j= 0; j < 11; j++){
			for(var k = 0; k < 5; k++){
				wins[i+k][j+k][count] = true;
			}
			count++;
		}
	}
	// anti-diagonal lines
	for(var i = 0; i < 11; i++){
		for(var j= 14; j > 3; j--){
			for(var k = 0; k < 5; k++){
				wins[i+k][j-k][count] = true;
			}
			count++;
		}
	}

	console.log("ways to win:",count);

	for(var i = 0; i < count; i++){
		p1Win[i] = 0;
		p2Win[i] = 0;
	}
}

function drawLogoAndBoard(){
	if (logo.complete) {
        context.globalAlpha = 0.5;
        context.drawImage(logo, 0, 0, 450, 450);
        context.globalAlpha = 1.0;
        drawChessBoard();
    } else {
        logo.onload = function() {
            context.globalAlpha = 0.5;
            context.drawImage(logo, 0, 0, 450, 450);
            context.globalAlpha = 1.0;
            drawChessBoard();
        };
    }
}

function drawChessBoard(){
	for(var i=0; i<15; i++){
		// draw vertical lines
		context.beginPath();
		context.moveTo(15 + i*30, 15);
		context.lineTo(15 + i*30, 435);
		context.stroke();

		// draw horizontal lines
		context.beginPath();
		context.moveTo(15,15 + i*30);
		context.lineTo(435,15 + i*30);
		context.stroke();
	}
}


function oneStep(i, j, me){
	context.beginPath();
	context.arc(15 + i*30, 15 + j*30, 13, 0, 2 * Math.PI);
	var gradient = context.createRadialGradient(15 + i*30 + 2, 15 + j*30 - 2, 13, 15 + i*30 + 2, 15 + j*30 - 2, 0);
	if(me){
		gradient.addColorStop(0, "#0A0A0A");
		gradient.addColorStop(1, "#636766");
	}
	else{
		gradient.addColorStop(0, "#D1D1D1");
		gradient.addColorStop(1, "#F9F9F9");
	}	
	context.fillStyle = gradient;
	context.fill();

}

chess.onclick = function(e){
	if(over){
		return;
	}
	var x = e.offsetX;
	var y = e.offsetY;
	var i = Math.floor(x / 30);
	var j = Math.floor(y / 30);
	if(chessBoard[i][j] == 0){
		oneStep(i, j, me);		
		chessBoard[i][j] = 1;
		for(var k = 0; k < count; k++){
			if(wins[i][j][k]){
				if(me){
					p1Win[k]++;
					p2Win[k] = 6; // player2 cannot win kth winning pattern anymore
					if(p1Win[k] == 5){
						over = true;
						showPopupMessage(player1 + "(B) wins!");
					}
				}else {
					p2Win[k]++;
					p1Win[k] = 6; // player1 cannot win kth winning pattern anymore
					if(p2Win[k] == 5){
						over = true;
						showPopupMessage(player2 + "(W) wins!");
					}
				}
			}
		}

		if(!over){
			me = !me;
		}
	}
}

// Restart game with option to switch sides
function restartGame() {
    // Hide winner modal and remove winner message/restart button
    var modal = document.getElementById('nameModal');
    if (modal) modal.style.display = "none";
    var oldMsg = document.getElementById('winnerMsg');
    if (oldMsg) oldMsg.remove();
    var oldBtn = document.getElementById('restartBtn');
    if (oldBtn) oldBtn.remove();

    // Show the switch sides modal
    var switchModal = document.getElementById('switchSidesModal');
    if (switchModal) switchModal.style.display = "block";

	// Set the message before showing the modal
    var switchSidesMsg = document.getElementById('switchSidesMsg');
    if (switchSidesMsg) {
        switchSidesMsg.textContent = "Now " + player1 + " is using black pieces. And " + player2 + " is using white pieces. Do you want to switch sides?";
    }

    // Set up button handlers
    var yesBtn = document.getElementById('switchYes');
    var noBtn = document.getElementById('switchNo');

	// Remove previous handlers to avoid stacking
    yesBtn.onclick = null;
    noBtn.onclick = null;

    yesBtn.onclick = function() {
        // Swap player names
        var temp = player1;
        player1 = player2;
        player2 = temp;

        // Update VS title if present
        var vsTitle = document.getElementById('vsTitle');
        if (vsTitle) {
            vsTitle.textContent = player1 + "(B) VS " + player2 + "(W)";
        }

        switchModal.style.display = "none";
        actuallyRestartGame();
    };

    noBtn.onclick = function() {
        switchModal.style.display = "none";
        actuallyRestartGame();
    };
}

// The actual restart logic
function actuallyRestartGame() {
	// Reset game state
    resetGame();

    // Reset the canvas
    context.clearRect(0, 0, 450, 450);

    // Redraw logo and board grid directly
    drawLogoAndBoard();
}

function showPopupMessage(message) {
	// Reuse the name modal for displaying winner messages
    var modal = document.getElementById('nameModal');
    var modalContent = document.getElementById('modalContent');
    var modalTitle = document.getElementById('modalTitle');
    var nameForm = document.getElementById('nameForm');

    // Hide the name form if present
    if (nameForm) nameForm.style.display = 'none';

    // Set the title and message
    modalTitle.textContent = "Game Over";
    // Remove any old message
    var oldMsg = document.getElementById('winnerMsg');
    if (oldMsg) oldMsg.remove();

    // Remove any old close icon
    var oldCloseIcon = document.getElementById('modalCloseIcon');
    if (oldCloseIcon) oldCloseIcon.remove();

    // Add a cross (X) close button at the top right
    var closeIcon = document.createElement('span');
    closeIcon.id = 'modalCloseIcon';
    closeIcon.innerHTML = '&times;';
    closeIcon.style.position = 'absolute';
    closeIcon.style.top = '10px';
    closeIcon.style.right = '20px';
    closeIcon.style.fontSize = '28px';
    closeIcon.style.cursor = 'pointer';
    closeIcon.style.color = '#888';
    closeIcon.onmouseover = function() { closeIcon.style.color = '#333'; };
    closeIcon.onmouseout = function() { closeIcon.style.color = '#888'; };
    closeIcon.onclick = function() {
        modal.style.display = "none";
    };
    modalContent.appendChild(closeIcon);

    // Add the new message
    var msg = document.createElement('div');
    msg.id = 'winnerMsg';
    msg.style.margin = "40px 0 20px 0";
    msg.style.fontSize = "20px";
    msg.textContent = message;
    modalContent.appendChild(msg);

    // Add a button to restart
    var restartBtn = document.createElement('button');
    restartBtn.className = "btn";
    restartBtn.textContent = "Restart";
    restartBtn.onclick = restartGame;
    // Remove any old restart button
    var oldBtn = document.getElementById('restartBtn');
    if (oldBtn) oldBtn.remove();
    restartBtn.id = 'restartBtn';
    modalContent.appendChild(restartBtn);

    // Show the modal
    modal.style.display = "block";
}