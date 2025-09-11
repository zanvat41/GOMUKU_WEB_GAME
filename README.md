## How To Play
Download the repo and open index.html in your browser. Then you can enjoy the Gomoku game.

1. **Choose a Game Mode:**  
   On the home page(index.html), select "Play with Friend" for two-player mode or "Play with Computer" to challenge the AI.

2. **Enter Player Names:**  
   Enter your name(s) when prompted. In single-player mode, you’ll play against the computer.

3. **Pick Sides:**  
   Decide who will play as Black (go first) and who will play as White.

4. **Gameplay:**  
   - The game board is a 15x15 grid.
   - Players take turns clicking on empty intersections to place their pieces (Black or White).
   - The first player to get five of their pieces in a row (horizontally, vertically, or diagonally) wins the game.

5. **Restart or Switch Modes:**  
   After a game ends, you can restart, switch sides, or change between playing with a friend and playing with the computer.

## UI

The game interface is built with HTML Canvas and JavaScript. The chessboard grid and pieces are drawn dynamically on the canvas, providing a smooth and interactive experience. Players can click directly on the board to place their pieces. Modal dialogs are used for entering player names, displaying game results, and restarting or switching sides, making the UI user-friendly and visually clear.

## Winning Algorithm

The game uses a precomputed "winning patterns" system to efficiently check for a win after each move. All possible lines of five consecutive positions (horizontal, vertical, diagonal, and anti-diagonal) are stored as winning patterns. Each move updates counters for these patterns. If a player fills all five positions in any pattern, they win. This approach allows for fast win detection without scanning the entire board after every move.

## AI Algorithm

The AI uses a simple scoring system to decide its next move. For every empty position on the board, the AI evaluates two scores:
- **Player Score:** How much this move would block the human player from winning.
- **AI Score:** How much this move would help the AI win.

Scores are assigned based on how many pieces are already in a potential winning pattern. The AI prioritizes moves that either block the player from winning or help itself win, always choosing the move with the highest score. This makes the AI both offensive and defensive.