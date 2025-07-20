import { useState } from "react";

interface GameBoardProps {
  className?: string;
}

export const GameBoard = ({ className = "" }: GameBoardProps) => {
  // Create a 10x10 grid with some sample blocks
  const [board, setBoard] = useState(() => {
    const initialBoard = Array(10).fill(null).map(() => Array(10).fill(null));
    
    // Add some sample blocks for visual effect
    const colors = ['neon-turquoise', 'neon-purple', 'neon-yellow', 'neon-magenta'];
    
    // Fill bottom rows with some blocks
    for (let row = 6; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        if (Math.random() > 0.3) {
          initialBoard[row][col] = colors[Math.floor(Math.random() * colors.length)];
        }
      }
    }
    
    return initialBoard;
  });

  return (
    <div className={`game-board-tilt ${className}`}>
      <div className="game-cube p-4 bg-opacity-30">
        <div className="grid grid-cols-10 gap-1">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  w-6 h-6 rounded-sm border border-white/20 transition-all duration-300
                  ${cell 
                    ? `bg-${cell} shadow-lg shadow-${cell}/50 neon-glow` 
                    : 'bg-white/5 hover:bg-white/10'
                  }
                `}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};