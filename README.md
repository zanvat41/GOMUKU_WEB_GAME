## UI
Using html canvas and javascript code to draw chessboard and chess pieces.

## Winning Algorithm

The game uses a precomputed "winning patterns" system to efficiently check for a win after each move. All possible lines of five consecutive positions (horizontal, vertical, diagonal, and anti-diagonal) are stored as winning patterns. Each move updates counters for these patterns. If a player fills all five positions in any pattern, they win. This approach allows for fast win detection without scanning the entire board after every move.

## AI Algorithm

The AI uses a simple scoring system to decide its next move. For every empty position on the board, the AI evaluates two scores:
- **Player Score:** How much this move would block the human player from winning.
- **AI Score:** How much this move would help the AI win.

Scores are assigned based on how many pieces are already in a potential winning pattern. The AI prioritizes moves that either block the player from winning or help itself win, always choosing the move with the highest score. This makes the AI both offensive and defensive.