import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, RotateCcw, Zap, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type BlockColor = 'red' | 'green' | 'blue' | null;
type GameBoard = BlockColor[][];

interface Polyomino {
  shape: number[][];
  color: BlockColor;
  id: string;
}

interface GameStats {
  score: number;
  redCharge: number;
  greenCharge: number;
  blueCharge: number;
  comboMultiplier: number;
  consecutiveTurns: number;
}

const Game = () => {
  const navigate = useNavigate();
  const [board, setBoard] = useState<GameBoard>(() => 
    Array(10).fill(null).map(() => Array(10).fill(null))
  );
  
  const [currentShapes, setCurrentShapes] = useState<Polyomino[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    redCharge: 0,
    greenCharge: 0,
    blueCharge: 0,
    comboMultiplier: 1,
    consecutiveTurns: 0
  });
  
  const [selectedShape, setSelectedShape] = useState<Polyomino | null>(null);
  const [draggedShape, setDraggedShape] = useState<Polyomino | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [shieldActive, setShieldActive] = useState(false);
  const [gravityFlipAvailable, setGravityFlipAvailable] = useState(false);

  // Generate random polyomino shapes
  const generateRandomShapes = useCallback((): Polyomino[] => {
    const shapes = [
      [[1]], // Single block
      [[1, 1]], // Line 2
      [[1, 1, 1]], // Line 3
      [[1, 1], [1, 0]], // L shape
      [[1, 1], [1, 1]], // Square
      [[0, 1, 0], [1, 1, 1]], // T shape
      [[1, 1, 0], [0, 1, 1]], // Z shape
    ];
    
    const colors: BlockColor[] = ['red', 'green', 'blue'];
    
    return Array(3).fill(null).map((_, index) => ({
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      id: `shape-${Date.now()}-${index}`
    }));
  }, []);

  // Initialize game
  useEffect(() => {
    setCurrentShapes(generateRandomShapes());
    
    // Set gravity flip timer
    const gravityTimer = setTimeout(() => {
      setGravityFlipAvailable(true);
    }, 90000); // 90 seconds
    
    return () => clearTimeout(gravityTimer);
  }, [generateRandomShapes]);

  // Check if shape can be placed at position
  const canPlaceShape = (shape: number[][], row: number, col: number): boolean => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] === 1) {
          const newRow = row + r;
          const newCol = col + c;
          
          if (newRow >= 10 || newCol >= 10 || newRow < 0 || newCol < 0) {
            return false;
          }
          
          if (board[newRow][newCol] !== null) {
            return false;
          }
        }
      }
    }
    return true;
  };

  // Place shape on board
  const placeShape = (shape: Polyomino, row: number, col: number) => {
    if (!canPlaceShape(shape.shape, row, col)) return false;

    const newBoard = board.map(row => [...row]);
    let blocksPlaced = 0;

    for (let r = 0; r < shape.shape.length; r++) {
      for (let c = 0; c < shape.shape[r].length; c++) {
        if (shape.shape[r][c] === 1) {
          newBoard[row + r][col + c] = shape.color;
          blocksPlaced++;
        }
      }
    }

    setBoard(newBoard);
    
    // Update color charge
    setGameStats(prev => ({
      ...prev,
      [`${shape.color}Charge`]: Math.min(100, prev[`${shape.color}Charge` as keyof GameStats] + blocksPlaced * 10)
    }));

    // Remove placed shape
    setCurrentShapes(prev => prev.filter(s => s.id !== shape.id));
    
    // Check for line clears
    checkForClears(newBoard);
    
    return true;
  };

  // Check for complete lines and clear them
  const checkForClears = (currentBoard: GameBoard) => {
    const linesToClear: number[] = [];
    const colsToClear: number[] = [];
    
    // Check rows
    for (let row = 0; row < 10; row++) {
      if (currentBoard[row].every(cell => cell !== null)) {
        linesToClear.push(row);
      }
    }
    
    // Check columns
    for (let col = 0; col < 10; col++) {
      if (currentBoard.every(row => row[col] !== null)) {
        colsToClear.push(col);
      }
    }
    
    const totalLines = linesToClear.length + colsToClear.length;
    
    if (totalLines > 0) {
      // Clear lines
      const newBoard = currentBoard.map(row => [...row]);
      
      linesToClear.forEach(row => {
        for (let col = 0; col < 10; col++) {
          newBoard[row][col] = null;
        }
      });
      
      colsToClear.forEach(col => {
        for (let row = 0; row < 10; row++) {
          newBoard[row][col] = null;
        }
      });
      
      setBoard(newBoard);
      
      // Calculate score
      const baseScore = 10;
      const comboBonus = totalLines > 1 ? totalLines * gameStats.comboMultiplier : 1;
      const scoreGain = baseScore * totalLines * comboBonus;
      
      setGameStats(prev => ({
        ...prev,
        score: prev.score + scoreGain,
        consecutiveTurns: prev.consecutiveTurns + 1,
        comboMultiplier: Math.min(5, prev.comboMultiplier + (totalLines > 1 ? 1 : 0))
      }));
      
      toast.success(`Cleared ${totalLines} line${totalLines > 1 ? 's' : ''}! +${scoreGain} points`);
    } else {
      // Reset combo if no lines cleared
      setGameStats(prev => ({
        ...prev,
        comboMultiplier: 1,
        consecutiveTurns: 0
      }));
    }
  };

  // Check if any current shape can be placed
  const canPlaceAnyShape = useCallback((): boolean => {
    for (const shape of currentShapes) {
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          if (canPlaceShape(shape.shape, row, col)) {
            return true;
          }
        }
      }
    }
    return false;
  }, [currentShapes, board]);

  // Check game over condition
  useEffect(() => {
    if (currentShapes.length === 0) {
      // Generate new shapes when all are placed
      setCurrentShapes(generateRandomShapes());
    } else if (!canPlaceAnyShape() && !shieldActive) {
      setGameOver(true);
    }
  }, [currentShapes, canPlaceAnyShape, shieldActive, generateRandomShapes]);

  // Handle cell click for shape placement
  const handleCellClick = (row: number, col: number) => {
    if (selectedShape && canPlaceShape(selectedShape.shape, row, col)) {
      placeShape(selectedShape, row, col);
      setSelectedShape(null);
    }
  };

  // Use rainbow block
  const useRainbowBlock = (color: BlockColor) => {
    if (!color || gameStats[`${color}Charge` as keyof GameStats] < 100) return;
    
    const newBoard = board.map(row => 
      row.map(cell => cell === color ? null : cell)
    );
    
    setBoard(newBoard);
    setGameStats(prev => ({
      ...prev,
      [`${color}Charge`]: 0
    }));
    
    toast.success(`Rainbow block activated! Cleared all ${color} blocks`);
  };

  // Gravity flip
  const useGravityFlip = () => {
    if (!gravityFlipAvailable) return;
    
    // Simulate ad watch and flip board
    const flippedBoard = board.slice().reverse().map(row => row.slice().reverse());
    setBoard(flippedBoard);
    setGravityFlipAvailable(false);
    
    toast.success("Gravity flipped! Board rotated 180°");
    
    // Set next gravity flip in 90 seconds
    setTimeout(() => setGravityFlipAvailable(true), 90000);
  };

  // Restart game
  const restartGame = () => {
    setBoard(Array(10).fill(null).map(() => Array(10).fill(null)));
    setCurrentShapes(generateRandomShapes());
    setGameStats({
      score: 0,
      redCharge: 0,
      greenCharge: 0,
      blueCharge: 0,
      comboMultiplier: 1,
      consecutiveTurns: 0
    });
    setGameOver(false);
    setSelectedShape(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-space-dark to-space-light p-4">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="text-white border-white/30 hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          חזרה לעמוד הראשי
        </Button>
        
        <div className="text-center">
          <h1 className="neon-text text-4xl font-bold">Cube Craze</h1>
          <div className="text-2xl font-bold text-neon-yellow">
            Score: {gameStats.score.toLocaleString()}
          </div>
        </div>
        
        <div className="flex gap-2">
          {gameStats.comboMultiplier > 1 && (
            <Badge className="bg-neon-magenta text-white">
              Combo x{gameStats.comboMultiplier}
            </Badge>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
        {/* Game Board */}
        <div className="lg:col-span-2">
          <div className="game-cube p-6 mb-6">
            <div className="grid grid-cols-10 gap-1 max-w-md mx-auto">
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    className={`
                      w-8 h-8 rounded border transition-all duration-200
                      ${cell 
                        ? `bg-${cell} border-white/30 shadow-md` 
                        : 'bg-white/5 border-white/20 hover:bg-white/10'
                      }
                      ${selectedShape && canPlaceShape(selectedShape.shape, rowIndex, colIndex)
                        ? 'ring-2 ring-neon-turquoise'
                        : ''
                      }
                    `}
                  />
                ))
              )}
            </div>
          </div>

          {/* Current Shapes */}
          <div className="game-cube p-6">
            <h3 className="text-lg font-semibold mb-4 text-center">Current Shapes</h3>
            <div className="flex justify-center gap-4">
              {currentShapes.map((shape) => (
                <button
                  key={shape.id}
                  onClick={() => setSelectedShape(shape)}
                  className={`
                    game-cube p-3 transition-all duration-200
                    ${selectedShape?.id === shape.id ? 'ring-2 ring-neon-turquoise scale-105' : ''}
                  `}
                >
                  <div className="grid gap-1" style={{
                    gridTemplateColumns: `repeat(${shape.shape[0].length}, 1fr)`
                  }}>
                    {shape.shape.flat().map((cell, index) => (
                      <div
                        key={index}
                        className={`
                          w-6 h-6 rounded border
                          ${cell ? `bg-${shape.color} border-white/30` : 'transparent'}
                        `}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Color Charge Meters */}
          <div className="game-cube p-6">
            <h3 className="text-lg font-semibold mb-4">Color Charge</h3>
            <div className="space-y-3">
              {(['red', 'green', 'blue'] as const).map((color) => (
                <div key={color}>
                  <div className="flex justify-between mb-1">
                    <span className={`text-${color} font-medium capitalize`}>{color}</span>
                    <span className="text-sm">{gameStats[`${color}Charge` as keyof GameStats]}%</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Progress 
                      value={gameStats[`${color}Charge` as keyof GameStats]} 
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      disabled={gameStats[`${color}Charge` as keyof GameStats] < 100}
                      onClick={() => useRainbowBlock(color)}
                      className="text-xs"
                    >
                      🌈
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Power-ups */}
          <div className="game-cube p-6">
            <h3 className="text-lg font-semibold mb-4">Power-ups</h3>
            <div className="space-y-3">
              <Button
                disabled={!gravityFlipAvailable}
                onClick={useGravityFlip}
                className="w-full"
                variant={gravityFlipAvailable ? "default" : "secondary"}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Gravity Flip
              </Button>
              
              {shieldActive && (
                <div className="flex items-center gap-2 text-neon-turquoise">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">Shield Active</span>
                </div>
              )}
            </div>
          </div>

          {/* Game Stats */}
          <div className="game-cube p-6">
            <h3 className="text-lg font-semibold mb-4">Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Score:</span>
                <span className="font-bold text-neon-yellow">{gameStats.score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Combo:</span>
                <span className="font-bold text-neon-magenta">x{gameStats.comboMultiplier}</span>
              </div>
              <div className="flex justify-between">
                <span>Consecutive:</span>
                <span className="font-bold text-neon-turquoise">{gameStats.consecutiveTurns}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Over Dialog */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="game-cube p-8 max-w-md text-center">
            <h2 className="text-3xl font-bold mb-4 text-neon-magenta">Game Over!</h2>
            <p className="text-lg mb-2">Final Score: {gameStats.score.toLocaleString()}</p>
            <p className="text-sm text-foreground/80 mb-6">No more moves available</p>
            
            <div className="flex gap-4 justify-center">
              <Button onClick={restartGame}>
                Restart Game
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;