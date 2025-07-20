import { useState } from "react";

interface GameBoardProps {
  className?: string;
}

export const GameBoard = ({ className = "" }: GameBoardProps) => {
  // Create a 9x9 grid (like in the image)
  const [board, setBoard] = useState(() => {
    const initialBoard = Array(9).fill(null).map(() => Array(9).fill(null));
    
    // Fill all cells with blue color - all cells are always blue
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        initialBoard[row][col] = 'blue';
      }
    }
    
    return initialBoard;
  });

  return (
    <div className={`game-board-tilt ${className}`}>
      <div className="game-cube p-4 bg-opacity-30">
        <div className="grid grid-cols-9 gap-1">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="w-6 h-6 rounded-sm border border-white/20 transition-all duration-300 bg-blue-500"
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};