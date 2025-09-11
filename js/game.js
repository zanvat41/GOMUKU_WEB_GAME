const AI_NAME = "GOMOKU-AI";
let mode = "pvp"; // default

// Get mode from URL
const params = new URLSearchParams(window.location.search);
if (params.get("mode") === "pve") mode = "pve";

let player1 = "P1";
let player2 = mode === "pve" ? AI_NAME : "P2"; // player2 is AI in pve mode
let blackPiece = player1;
let whitePiece = player2;

let chessBoard, me, goFirst, over, wins, p1Win, p2Win, count;
const chess = document.getElementById('chess');
const context = chess.getContext('2d');
context.strokeStyle = "#BFBFBF";
const logo = new Image();
logo.src = "image/logo.png";
const placeSound = new Audio('audio/drop.ogg');
let isAiThinking = false; // Lock user move when AI is thinking

window.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('nameModal');
    const form = document.getElementById('nameForm');
    const p1Input = document.getElementById('player1Input');
    const p2Input = document.getElementById('player2Input');
    const p2Label = document.getElementById('player2Label');
    const vsTitle = document.getElementById('vsTitle');

    // Show/hide player 2 input based on mode
    if (mode === "pvp") {
        p2Label.style.display = "";
        p2Input.style.display = "";
    } else {
        p2Label.style.display = "none";
        p2Input.style.display = "none";
    }

    form.onsubmit = function(e) {
        e.preventDefault();
        player1 = p1Input.value.trim() || p1Input.placeholder;
        if (mode === "pvp") {
            player2 = p2Input.value.trim() || p2Input.placeholder;
            if (player1 === player2) {
                player1 += "1";
                player2 += "2";
            }
        } else {
            player2 = AI_NAME;
            if (player1 === AI_NAME) player1 += "(Player)";
        }
        blackPiece = player1;
        whitePiece = player2;
        modal.style.display = "none";

        // Show switch sides modal for initial side selection
        const switchModal = document.getElementById('switchSidesModal');
        if (switchModal) switchModal.style.display = "block";
        const switchSidesMsg = document.getElementById('switchSidesMsg');
        if (switchSidesMsg) {
            if (mode === "pvp") {
                switchSidesMsg.textContent = `Now ${blackPiece} is using black pieces. And ${whitePiece} is using white pieces. Do you want to switch sides?`;
            } else {
                switchSidesMsg.textContent = `Do you want to play as Black and go first?`;
            }
        }
        const yesBtn = document.getElementById('switchYes');
        const noBtn = document.getElementById('switchNo');
        yesBtn.onclick = null;
        noBtn.onclick = null;

        yesBtn.onclick = function() {
            if (mode === "pvp") {
                // Switch sides
                blackPiece = player2;
                whitePiece = player1;
                if (vsTitle) vsTitle.textContent = `${blackPiece}(B) vs ${whitePiece}(W)`;
                switchModal.style.display = "none";
                actuallyRestartGame();
            } else {
                // Player goes first (Black)
                if (vsTitle) vsTitle.textContent = `${blackPiece}(B) vs ${whitePiece}(W)`;
                goFirst = true;
                switchModal.style.display = "none";
                actuallyRestartGame();
            }
        };
        noBtn.onclick = function() {
            if (mode === "pvp") {
                if (vsTitle) vsTitle.textContent = `${blackPiece}(B) vs ${whitePiece}(W)`;
                switchModal.style.display = "none";
                actuallyRestartGame();
            } else {
                // AI goes first (Black)
                blackPiece = player2;
                whitePiece = player1;
                if (vsTitle) vsTitle.textContent = `${blackPiece}(B) vs ${whitePiece}(W)`;
                goFirst = false;
                switchModal.style.display = "none";
                actuallyRestartGame();
            }
        };
    };

    // Set initial title if modal is not shown (e.g. after restart)
    if (vsTitle && blackPiece && whitePiece) {
        vsTitle.textContent = `${blackPiece}(B) vs ${whitePiece}(W)`;
    }

    // Set switch mode button
    const switchBtn = document.getElementById('switchModeBtn');
    if (switchBtn) {
        if (mode === "pve") {
            switchBtn.textContent = "Play with Friend";
            switchBtn.onclick = function() {
                window.location.href = "game.html?mode=pvp";
            };
        } else {
            switchBtn.textContent = "Play with Computer";
            switchBtn.onclick = function() {
                window.location.href = "game.html?mode=pve";
            };
        }
    }
});

drawLogoAndBoard();

function resetGame(first) {
    chessBoard = []; // 0: empty, 1: player1, 2: player2/computer
    me = true; // true: black piece's turn, false: white piece's turn
    goFirst = first !== undefined ? first : true; // does player go first in pve mode
    over = false; // game over flag
    wins = []; // winning patterns array

    // player/computer win counts for each pattern
    p1Win = [];
    p2Win = [];

    count = 0; // total number of winning patterns

    for (let i = 0; i < 15; i++) {
        chessBoard[i] = [];
        for (let j = 0; j < 15; j++) {
            chessBoard[i][j] = 0;
        }
    }
    for (let i = 0; i < 15; i++) {
        wins[i] = [];
        for (let j = 0; j < 15; j++) {
            wins[i][j] = [];
        }
    }
    // horizontal
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
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 11; j++) {
            for (let k = 0; k < 5; k++) {
                wins[i][j + k][count] = true;
            }
            count++;
        }
    }
    // vertical
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 11; j++) {
            for (let k = 0; k < 5; k++) {
                wins[j + k][i][count] = true;
            }
            count++;
        }
    }
    // diagonal
    for (let i = 0; i < 11; i++) {
        for (let j = 0; j < 11; j++) {
            for (let k = 0; k < 5; k++) {
                wins[i + k][j + k][count] = true;
            }
            count++;
        }
    }
    // anti-diagonal
    for (let i = 0; i < 11; i++) {
        for (let j = 14; j > 3; j--) {
            for (let k = 0; k < 5; k++) {
                wins[i + k][j - k][count] = true;
            }
            count++;
        }
    }
    for (let i = 0; i < count; i++) {
        p1Win[i] = 0;
        p2Win[i] = 0;
    }
}

function drawLogoAndBoard() {
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

function drawChessBoard() {
    for (let i = 0; i < 15; i++) {
        context.beginPath();
        context.moveTo(15 + i * 30, 15);
        context.lineTo(15 + i * 30, 435);
        context.stroke();

        context.beginPath();
        context.moveTo(15, 15 + i * 30);
        context.lineTo(435, 15 + i * 30);
        context.stroke();
    }
}

function oneStep(i, j, me) {
    context.beginPath();
    context.arc(15 + i * 30, 15 + j * 30, 13, 0, 2 * Math.PI);
    let gradient = context.createRadialGradient(15 + i * 30 + 2, 15 + j * 30 - 2, 13, 15 + i * 30 + 2, 15 + j * 30 - 2, 0);
    if (me) {
        gradient.addColorStop(0, "#0A0A0A");
        gradient.addColorStop(1, "#636766");
    } else {
        gradient.addColorStop(0, "#D1D1D1");
        gradient.addColorStop(1, "#F9F9F9");
    }
    context.fillStyle = gradient;
    context.fill();

    // Play sound when a piece is placed
    if (placeSound) {
        placeSound.currentTime = 0;
        placeSound.play();
    }
}

chess.onclick = function(e) {
    if (over || isAiThinking) return; // Lock user move if AI is thinking
    let x = e.offsetX;
    let y = e.offsetY;
    let i = Math.floor(x / 30);
    let j = Math.floor(y / 30);
    if (chessBoard[i][j] == 0) {
        if (mode === "pvp") {
            handlePlayerMove(i, j);
        } else {
            handlePlayerMove(i, j);
            if (!over) {
                isAiThinking = true; // Lock user move
                // Delay AI move for better UX
                setTimeout(() => {
                    computerAI();
                    isAiThinking = false; // Unlock after AI move
                }, 400);
            }
        }
    }
};

function handlePlayerMove(i, j) {
    oneStep(i, j, me);
    if(mode === "pve") {
        // for pve mode, player is always 1, computer is 2
        chessBoard[i][j] = 1;
    } else {
        chessBoard[i][j] = me ? 1 : 2;
    }
    for (let k = 0; k < count; k++) {
        if (wins[i][j][k]) {
            // black piece
            if (me) {
                p1Win[k]++;
                p2Win[k] = 6; // make p2Win impossible to win with kth pattern
                if (p1Win[k] == 5) {
                    over = true;
                    showPopupMessage(`${blackPiece}(B) wins!`);
                }
            }
            // white piece
            else {
                // In pve mode and player uses white pieces, p1Win is for player, p2Win is for AI
                if(mode === "pve") {
                    p1Win[k]++;
                    p2Win[k] = 6; // make p2Win impossible to win with kth pattern
                    if (p1Win[k] == 5) {
                        over = true;
                        showPopupMessage(`${whitePiece}(W) wins!`);
                    }
                }
                else{
                    p2Win[k]++;
                    p1Win[k] = 6; // make p1Win impossible to win with kth pattern
                    if (p2Win[k] == 5) {
                        over = true;
                        showPopupMessage(`${whitePiece}(W) wins!`);
                    }
                }
            }
        }
    }
    if (!over) me = !me;
}

function computerAI() {
    if (over) return;
    let playerScore = [];
    let computerScore = [];
    let max = 0;
    let u = 0, v = 0;
    for (let i = 0; i < 15; i++) {
        playerScore[i] = [];
        computerScore[i] = [];
        for (let j = 0; j < 15; j++) {
            playerScore[i][j] = 0;
            computerScore[i][j] = 0;
        }
    }
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            if (chessBoard[i][j] == 0) {
                for (let k = 0; k < count; k++) {
                    if (wins[i][j][k]) {
                        if (p1Win[k] == 1) playerScore[i][j] += 200;
                        else if (p1Win[k] == 2) playerScore[i][j] += 400;
                        else if (p1Win[k] == 3) playerScore[i][j] += 2000;
                        else if (p1Win[k] == 4) playerScore[i][j] += 10000;

                        if (p2Win[k] == 1) computerScore[i][j] += 220;
                        else if (p2Win[k] == 2) computerScore[i][j] += 420;
                        else if (p2Win[k] == 3) computerScore[i][j] += 2100;
                        else if (p2Win[k] == 4) computerScore[i][j] += 20000;
                    }
                }
                if (playerScore[i][j] > max) {
                    max = playerScore[i][j];
                    u = i;
                    v = j;
                } else if (playerScore[i][j] == max) {
                    if (computerScore[i][j] > computerScore[u][v]) {
                        u = i;
                        v = j;
                    }
                }
                if (computerScore[i][j] > max) {
                    max = computerScore[i][j];
                    u = i;
                    v = j;
                } else if (computerScore[i][j] == max) {
                    if (playerScore[i][j] > playerScore[u][v]) {
                        u = i;
                        v = j;
                    }
                }
            }
        }
    }
    oneStep(u, v, me);
    chessBoard[u][v] = 2;
    for (let k = 0; k < count; k++) {
        if (wins[u][v][k]) {
            p2Win[k]++;
            p1Win[k] = 6; // make p1Win impossible to win with kth pattern
            if (p2Win[k] == 5) {
                over = true;

                if(goFirst){
                    // AI uses white pieces
                    console.log("here");
                    showPopupMessage(`${whitePiece}(W) wins!`);
                } else {
                    // AI uses black pieces
                    console.log("wtf");
                    showPopupMessage(`${blackPiece}(B) wins!`); 
                }
            }
        }
    }
    if (!over) me = !me;
}

function restartGame() {
    // Hide winner modal and remove winner message/restart button
    const modal = document.getElementById('nameModal');
    if (modal) modal.style.display = "none";
    const oldMsg = document.getElementById('winnerMsg');
    if (oldMsg) oldMsg.remove();
    const oldBtn = document.getElementById('restartBtn');
    if (oldBtn) oldBtn.remove();

    // Show the switch sides modal
    const switchModal = document.getElementById('switchSidesModal');
    if (switchModal) switchModal.style.display = "block";
    const switchSidesMsg = document.getElementById('switchSidesMsg');
    if (switchSidesMsg) {
        if (mode === "pvp") {
            switchSidesMsg.textContent = `Now ${player1} is using black pieces. And ${player2} is using white pieces. Do you want to switch sides?`;
        } else {
            switchSidesMsg.textContent = `Do you want to play as Black and go first?`;
        }
    }
    const yesBtn = document.getElementById('switchYes');
    const noBtn = document.getElementById('switchNo');
    yesBtn.onclick = null;
    noBtn.onclick = null;

    yesBtn.onclick = function() {
        if (mode === "pvp") {
            // Switch sides
            if(blackPiece === player1) {
                blackPiece = player2;
                whitePiece = player1;
            } else {
                blackPiece = player1;
                whitePiece = player2;
            }
            const vsTitle = document.getElementById('vsTitle');
            if (vsTitle) vsTitle.textContent = `${blackPiece}(B) vs ${whitePiece}(W)`;
            switchModal.style.display = "none";
            actuallyRestartGame();
        } else {
            goFirst = true;
            blackPiece = player1;
            whitePiece = player2;
            const vsTitle = document.getElementById('vsTitle');
            if (vsTitle) vsTitle.textContent = `${blackPiece}(B) vs ${whitePiece}(W)`;
            switchModal.style.display = "none";
            actuallyRestartGame();
        }
    };
    noBtn.onclick = function() {
        if (mode === "pvp") {
            const vsTitle = document.getElementById('vsTitle');
            if (vsTitle) vsTitle.textContent = `${blackPiece}(B) vs ${whitePiece}(W)`;
            switchModal.style.display = "none";
            actuallyRestartGame();
        } else {
            goFirst = false;
            blackPiece = player2;
            whitePiece = player1;
            const vsTitle = document.getElementById('vsTitle');
            if (vsTitle) vsTitle.textContent = `${blackPiece}(B) vs ${whitePiece}(W)`;
            switchModal.style.display = "none";
            actuallyRestartGame();
        }
    };
}

function actuallyRestartGame() {
    resetGame(goFirst);
    context.clearRect(0, 0, 450, 450);
    drawLogoAndBoard();
    over = false;
    if (mode === "pve" && goFirst === false) {
        // Computer is black, player is white
        me = true; // Black's turn (computer)
        oneStep(7, 7, me);
        chessBoard[7][7] = 2; // 2 is for computer
        for (let k = 0; k < count; k++) {
            if (wins[7][7][k]) {
                p2Win[k]++;
                p1Win[k] = 6;
            }
        }
        me = false; // Next turn is white (player)
    } else {
        me = true; // Black goes first (player)
    }
}

function showPopupMessage(message) {
    const modal = document.getElementById('nameModal');
    const modalContent = document.getElementById('modalContent');
    const modalTitle = document.getElementById('modalTitle');
    const nameForm = document.getElementById('nameForm');
    if (nameForm) nameForm.style.display = 'none';
    modalTitle.textContent = "Game Over";
    const oldMsg = document.getElementById('winnerMsg');
    if (oldMsg) oldMsg.remove();
    const oldCloseIcon = document.getElementById('modalCloseIcon');
    if (oldCloseIcon) oldCloseIcon.remove();
    const closeIcon = document.createElement('span');
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
    const msg = document.createElement('div');
    msg.id = 'winnerMsg';
    msg.style.margin = "40px 0 20px 0";
    msg.style.fontSize = "20px";
    msg.textContent = message;
    modalContent.appendChild(msg);
    const restartBtn = document.createElement('button');
    restartBtn.className = "btn";
    restartBtn.textContent = "Restart";
    restartBtn.onclick = restartGame;
    const oldBtn = document.getElementById('restartBtn');
    if (oldBtn) oldBtn.remove();
    restartBtn.id = 'restartBtn';
    modalContent.appendChild(restartBtn);
    modal.style.display = "block";
}