import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, RotateCcw, Zap, Shield, RefreshCw, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type BlockColor = 'red' | 'green' | 'blue' | 'yellow' | 'purple' | null;
type GameBoard = BlockColor[][];

interface Polyomino {
  shape: number[][];
  color: BlockColor;
  id: string;
  size: number;
}

interface GameStats {
  score: number;
  redCharge: number;
  greenCharge: number;
  blueCharge: number;
  yellowCharge: number;
  purpleCharge: number;
  comboMultiplier: number;
  consecutiveTurns: number;
  linesCleared: number;
  maxCombo: number;
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
    yellowCharge: 0,
    purpleCharge: 0,
    comboMultiplier: 1,
    consecutiveTurns: 0,
    linesCleared: 0,
    maxCombo: 0
  });
  
  const [selectedShape, setSelectedShape] = useState<Polyomino | null>(null);
  const [draggedShape, setDraggedShape] = useState<Polyomino | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [shieldActive, setShieldActive] = useState(false);
  const [gravityFlipAvailable, setGravityFlipAvailable] = useState(false);
  const [showAdOption, setShowAdOption] = useState(false);
  const [isPlacingShape, setIsPlacingShape] = useState(false);
  const [gravityFlipAdWatched, setGravityFlipAdWatched] = useState(false);
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [touchDraggedShape, setTouchDraggedShape] = useState<Polyomino | null>(null);
  const [dragPreview, setDragPreview] = useState<{ x: number; y: number; shape: Polyomino } | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [clearLineMode, setClearLineMode] = useState(false);

  // Function to get color gradient
  const getColorGradient = (color: BlockColor): string => {
    const colorMap = {
      red: 'linear-gradient(135deg, #ff4444, #cc0000)',
      green: 'linear-gradient(135deg, #44ff44, #00cc00)',
      blue: 'linear-gradient(135deg, #4444ff, #0000cc)',
      yellow: 'linear-gradient(135deg, #ffff44, #cccc00)',
      purple: 'linear-gradient(135deg, #ff44ff, #cc00cc)'
    };
    const result = colorMap[color as keyof typeof colorMap] || 'transparent';
    console.log('Color:', color, 'Gradient:', result);
    return result;
  };

  // Function to get text color
  const getTextColor = (color: BlockColor): string => {
    const colorMap = {
      red: '#ff4444',
      green: '#44ff44',
      blue: '#4444ff',
      yellow: '#ffff44',
      purple: '#ff44ff'
    };
    console.log('Text Color:', color, 'Value:', colorMap[color as keyof typeof colorMap]);
    return colorMap[color as keyof typeof colorMap] || '#ffffff';
  };

  // Enhanced polyomino shapes (1-5 blocks)
  const polyominoShapes = [
    // 1 block
    [[1]],
    // 2 blocks
    [[1, 1]], // Line
    [[1], [1]], // Line vertical
    // 3 blocks
    [[1, 1, 1]], // Line 3
    [[1], [1], [1]], // Line 3 vertical
    [[1, 1], [1, 0]], // L shape
    [[1, 0], [1, 1]], // L shape inverted
    [[0, 1], [1, 1]], // L shape right
    [[1, 1], [0, 1]], // L shape right inverted
    // 4 blocks
    [[1, 1], [1, 1]], // Square
    [[1, 1, 1, 1]], // Line 4
    [[1], [1], [1], [1]], // Line 4 vertical
    [[1, 1, 1], [1, 0, 0]], // T shape
    [[1, 0, 0], [1, 1, 1]], // T shape inverted
    [[1, 0], [1, 1], [1, 0]], // T shape vertical
    [[0, 1], [1, 1], [0, 1]], // T shape vertical inverted
    [[1, 1, 0], [0, 1, 1]], // Z shape
    [[0, 1, 1], [1, 1, 0]], // Z shape inverted
    // 5 blocks
    [[1, 1, 1, 1, 1]], // Line 5
    [[1], [1], [1], [1], [1]], // Line 5 vertical
    [[1, 1, 1], [1, 1, 0]], // 5 block L
    [[1, 1, 0], [1, 1, 1]], // 5 block L inverted
    [[1, 1, 1], [0, 1, 1]], // 5 block L right
    [[0, 1, 1], [1, 1, 1]], // 5 block L right inverted
  ];

  // Generate random polyomino shapes
  const generateRandomShapes = useCallback((): Polyomino[] => {
    const colors: BlockColor[] = ['red', 'green', 'blue', 'yellow', 'purple'];
    
    return Array(3).fill(null).map((_, index) => {
      const shape = polyominoShapes[Math.floor(Math.random() * polyominoShapes.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = shape.flat().filter(cell => cell === 1).length;
      
      console.log('Generated shape with color:', color);
      
      return {
        shape,
        color,
        id: `shape-${Date.now()}-${index}`,
        size
      };
    });
  }, []);

  // Initialize game
  useEffect(() => {
    setCurrentShapes(generateRandomShapes());
    
    // Set gravity flip timer - make it available after 5 seconds for testing
    const gravityTimer = setTimeout(() => {
      setGravityFlipAvailable(true);
      toast.info("Gravity Flip available!", {
        description: "Watch an ad to unlock Gravity Flip and rotate the board 180°"
      });
    }, 5000); // 5 seconds for testing
    
    return () => clearTimeout(gravityTimer);
  }, [generateRandomShapes]);

  // Check if shape can be placed at position with improved validation
  const canPlaceShape = (shape: number[][], row: number, col: number): boolean => {
    if (!shape || !board) return false;
    
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] === 1) {
          const newRow = row + r;
          const newCol = col + c;
          
          // Check bounds
          if (newRow >= 10 || newCol >= 10 || newRow < 0 || newCol < 0) {
            return false;
          }
          
          // Check if cell is occupied
          if (board[newRow][newCol] !== null) {
            return false;
          }
        }
      }
    }
    return true;
  };

  // Place shape on board with enhanced effects
  const placeShape = (shape: Polyomino, row: number, col: number) => {
    if (!canPlaceShape(shape.shape, row, col)) return false;

    setIsPlacingShape(true);
    
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
    
    // Update color charge (for all colors)
    if (shape.color && ['red', 'green', 'blue', 'yellow', 'purple'].includes(shape.color)) {
      setGameStats(prev => ({
        ...prev,
        [`${shape.color}Charge`]: Math.min(100, prev[`${shape.color}Charge` as keyof GameStats] + blocksPlaced * 15)
      }));
    }

    // Remove placed shape
    setCurrentShapes(prev => prev.filter(s => s.id !== shape.id));
    
    // Check for line clears with delay for animation
    setTimeout(() => {
      checkForClears(newBoard);
      setIsPlacingShape(false);
    }, 300);
    
    return true;
  };

  // Enhanced line clearing with better scoring
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
      // Animate clearing with visual effects
      setTimeout(() => {
        // Add explosion animation to blocks being cleared
        const cellsToAnimate: string[] = [];
        
        linesToClear.forEach(row => {
          for (let col = 0; col < 10; col++) {
            cellsToAnimate.push(`${row}-${col}`);
          }
        });
        
        colsToClear.forEach(col => {
          for (let row = 0; row < 10; row++) {
            cellsToAnimate.push(`${row}-${col}`);
          }
        });
        
        // Add animation class to cells
        cellsToAnimate.forEach(cellId => {
          const element = document.querySelector(`[data-cell="${cellId}"]`);
          if (element) {
            element.classList.add('block-explosion');
          }
        });
        
        // Clear the board after animation
        setTimeout(() => {
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
          
          // Enhanced scoring system
          const baseScore = 10;
          const comboBonus = totalLines > 1 ? totalLines * gameStats.comboMultiplier : 1;
          const consecutiveBonus = gameStats.consecutiveTurns > 0 ? Math.min(5, gameStats.consecutiveTurns) : 1;
          const scoreGain = baseScore * totalLines * comboBonus * consecutiveBonus;
          
          setGameStats(prev => ({
            ...prev,
            score: prev.score + scoreGain,
            consecutiveTurns: prev.consecutiveTurns + 1,
            comboMultiplier: Math.min(5, prev.comboMultiplier + (totalLines > 1 ? 1 : 0)),
            linesCleared: prev.linesCleared + totalLines,
            maxCombo: Math.max(prev.maxCombo, totalLines)
          }));
          
          // Enhanced toast messages
          const comboText = totalLines > 1 ? ` (${totalLines}x Combo!)` : '';
          const consecutiveText = consecutiveBonus > 1 ? ` (${consecutiveBonus}x Streak!)` : '';
          toast.success(`Line${totalLines > 1 ? 's' : ''} Cleared! +${scoreGain} points${comboText}${consecutiveText}`, {
            duration: 3000
          });
        }, 600);
      }, 200);
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
      setShowAdOption(true);
    }
  }, [currentShapes, canPlaceAnyShape, shieldActive, generateRandomShapes]);

  // Enhanced cell click handler with improved feedback
  const handleCellClick = (row: number, col: number) => {
    if (clearLineMode) {
      // Check if click is on an edge
      const isLeftEdge = col === 0;
      const isRightEdge = col === 9;
      const isTopEdge = row === 0;
      const isBottomEdge = row === 9;
      
      if (isLeftEdge || isRightEdge) {
        // Clear horizontal row
        const newBoard = board.map((boardRow, index) => 
          index === row ? Array(10).fill(null) : boardRow
        );
        setBoard(newBoard);
        setClearLineMode(false);
        toast.success("Row cleared!", {
          description: `Cleared horizontal row ${row + 1}`,
          duration: 1500
        });
      } else if (isTopEdge || isBottomEdge) {
        // Clear vertical column
        const newBoard = board.map((boardRow, index) => 
          boardRow.map((cell, colIndex) => 
            colIndex === col ? null : cell
          )
        );
        setBoard(newBoard);
        setClearLineMode(false);
        toast.success("Column cleared!", {
          description: `Cleared vertical column ${col + 1}`,
          duration: 1500
        });
      } else {
        // Not on an edge, show instruction
        toast.error("Click on an edge!", {
          description: "Click left/right edges for rows, top/bottom edges for columns",
          duration: 2000
        });
      }
    } else if (selectedShape && !isPlacingShape) {
      if (canPlaceShape(selectedShape.shape, row, col)) {
        placeShape(selectedShape, row, col);
        setSelectedShape(null);
        // Enhanced success feedback
        toast.success("Perfect placement! 🎯", {
          description: `${selectedShape.size}-block ${selectedShape.color} shape placed`,
          duration: 2000
        });
      } else {
        // Enhanced error feedback with helpful hints
        toast.error("Cannot place here! 🚫", {
          description: "Try a different position or rotate the shape",
          duration: 2000
        });
        
        // Visual feedback - shake animation for invalid placement
        const cellElement = document.querySelector(`[data-cell="${row}-${col}"]`);
        if (cellElement) {
          cellElement.classList.add('shake-animation');
          setTimeout(() => {
            cellElement.classList.remove('shake-animation');
          }, 500);
        }
      }
    } else if (!selectedShape) {
      toast.info("Select a shape first! 👆", {
        description: "Tap a shape from the bottom panel to select it",
        duration: 2000
      });
    }
  };

  // Use rainbow block (Color-Charge)
  const useRainbowBlock = (color: BlockColor) => {
    if (!color || gameStats[`${color}Charge` as keyof GameStats] < 100) return;
    
    // Add explosion animation to all blocks of the same color
    const cellsToAnimate: string[] = [];
    board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === color) {
          cellsToAnimate.push(`${rowIndex}-${colIndex}`);
        }
      });
    });
    
    // Add animation class to cells
    cellsToAnimate.forEach(cellId => {
      const element = document.querySelector(`[data-cell="${cellId}"]`) as HTMLElement;
      if (element) {
        element.classList.add('block-explosion');
      }
    });
    
    // Clear the board after animation
    setTimeout(() => {
      const newBoard = board.map(row => 
        row.map(cell => cell === color ? null : cell)
      );
      
      setBoard(newBoard);
      setGameStats(prev => ({
        ...prev,
        [`${color}Charge`]: 0
      }));
      
      toast.success(`🌈 Rainbow Block activated! Cleared all ${color} blocks`, {
        duration: 2000
      });
    }, 600);
  };

  // Enhanced gravity flip
  const useGravityFlip = () => {
    if (!gravityFlipAvailable || !gravityFlipAdWatched) return;
    
    // Add flip animation
    const gameBoard = document.querySelector('.block-blast-board') as HTMLElement;
    if (gameBoard) {
      gameBoard.style.animation = 'board-flip 0.8s ease-in-out';
    }
    
    // Flip board
    setTimeout(() => {
      const flippedBoard = board.slice().reverse().map(row => row.slice().reverse());
      setBoard(flippedBoard);
      setGravityFlipAvailable(false);
      setGravityFlipAdWatched(false);
      
      // Remove animation class
      if (gameBoard) {
        gameBoard.style.animation = '';
      }
      
      toast.success("⚡ Gravity Flip! Board rotated 180°", {
        description: "All blocks fell to the other side",
        duration: 3000
      });
    }, 400);
    
    // Set next gravity flip in 90 seconds
    setTimeout(() => {
      setGravityFlipAvailable(true);
      toast.info("Gravity Flip available!", {
        description: "Watch an ad to unlock Gravity Flip and rotate the board 180°"
      });
    }, 90000);
  };

  // Watch ad for gravity flip
  const watchAdForGravityFlip = () => {
    // Simulate ad watching with loading animation
    const gravityFlipButton = document.querySelector('[data-gravity-flip-ad]') as HTMLElement;
    if (gravityFlipButton) {
      gravityFlipButton.style.animation = 'rainbow-spin 1s linear infinite';
    }
    
    toast.loading("Watching ad for Gravity Flip...", {
      duration: 2000
    });
    
    setTimeout(() => {
      // Remove animation
      if (gravityFlipButton) {
        gravityFlipButton.style.animation = '';
      }
      
      toast.success("Ad completed! Gravity Flip unlocked!", {
        description: "You can now use Gravity Flip to rotate the board",
        duration: 3000
      });
      
      setGravityFlipAdWatched(true);
    }, 2000);
  };

  // Touch event handlers for shape dragging
  const handleTouchStart = (e: React.TouchEvent, shape: Polyomino) => {
    if (clearLineMode) return; // Don't interfere with clear line mode
    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];

    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    setTouchDraggedShape(shape);
    setIsDragging(true);
    
    // Add visual feedback
    const target = e.currentTarget as HTMLElement;
    target.classList.add('touch-active');
  };

  // Simplified touch move handler
  const handleTouchMove = (e: React.TouchEvent) => {
    if (clearLineMode) return;
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging || !touchDraggedShape || !touchStartPos) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartPos.x;
    const deltaY = touch.clientY - touchStartPos.y;

    // Only start dragging if moved more than 10px
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      setSelectedShape(touchDraggedShape);
      
      // Update drag preview position
      setDragPreview({
        x: touch.clientX,
        y: touch.clientY,
        shape: touchDraggedShape
      });

      // Update hoveredCell based on touch position
      const gameBoardElement = e.currentTarget.closest('.game-grid');
      if (gameBoardElement) {
        const rect = gameBoardElement.getBoundingClientRect();
        const cellSize = 32; // w-8 = 32px
        const gap = 4; // gap-1 = 4px
        const totalCellSize = cellSize + gap;
        
        const adjustedX = (touch.clientX - rect.left) - (gap / 2);
        const adjustedY = (touch.clientY - rect.top) - (gap / 2);
        
        const col = Math.floor(adjustedX / totalCellSize);
        const row = Math.floor(adjustedY / totalCellSize);
        
        console.log(`Touch position: ${touch.clientX},${touch.clientY} -> Grid: ${row},${col}`);
        
        if (row >= 0 && row < 10 && col >= 0 && col < 10) {
          setHoveredCell({ row, col });
        }
      }
    }
  };

  // Simplified mouse move handler
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !touchDraggedShape || !touchStartPos) return;
    
    const deltaX = e.clientX - touchStartPos.x;
    const deltaY = e.clientY - touchStartPos.y;
    
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      setDragPreview({
        x: e.clientX,
        y: e.clientY,
        shape: touchDraggedShape
      });

      // Update hoveredCell based on mouse position
      const gameBoardElement = e.currentTarget.closest('.game-grid');
      if (gameBoardElement) {
        const rect = gameBoardElement.getBoundingClientRect();
        const cellSize = 32; // w-8 = 32px
        const gap = 4; // gap-1 = 4px
        const totalCellSize = cellSize + gap;
        
        const adjustedX = (e.clientX - rect.left) - (gap / 2);
        const adjustedY = (e.clientY - rect.top) - (gap / 2);
        
        const col = Math.floor(adjustedX / totalCellSize);
        const row = Math.floor(adjustedY / totalCellSize);
        
        console.log(`Mouse position: ${e.clientX},${e.clientY} -> Grid: ${row},${col}`);
        
        if (row >= 0 && row < 10 && col >= 0 && col < 10) {
          setHoveredCell({ row, col });
        }
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (clearLineMode) return; // Don't interfere with clear line mode
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging || !touchDraggedShape) return;
    

    
    // Remove visual feedback
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('touch-active');
    
    // Find the closest board cell
    const touch = e.changedTouches[0];
    const boardElement = document.querySelector('.block-blast-board') as HTMLElement;
    
    if (boardElement) {
      const boardRect = boardElement.getBoundingClientRect();
      const relativeX = touch.clientX - boardRect.left;
      const relativeY = touch.clientY - boardRect.top;
      
      // Get the grid container
      const gridContainer = boardElement.querySelector('.game-grid') as HTMLElement;
      if (gridContainer) {
        const gridRect = gridContainer.getBoundingClientRect();
        const gridX = touch.clientX - gridRect.left;
        const gridY = touch.clientY - gridRect.top;
        
        // Calculate grid position more accurately
        const cellSize = 32; // w-8 = 32px
        const gap = 4; // gap-1 = 4px
        const totalCellSize = cellSize + gap;
        
        // Adjust for gap offset
        const adjustedGridX = gridX - (gap / 2);
        const adjustedGridY = gridY - (gap / 2);
        
        const col = Math.floor(adjustedGridX / totalCellSize);
        const row = Math.floor(adjustedGridY / totalCellSize);
        

        
        // Check if position is valid and place shape
        if (col >= 0 && col < 10 && row >= 0 && row < 10) {
          if (canPlaceShape(touchDraggedShape.shape, row, col)) {
            placeShape(touchDraggedShape, row, col);
            toast.success("Shape placed!", {
              description: `Placed ${touchDraggedShape.size}-block shape at row ${row}, col ${col}`,
              duration: 1500
            });
          } else {
            toast.error("Cannot place shape here", {
              description: "Invalid position or occupied cell",
              duration: 2000
            });
          }
        } else {
          toast.error("Outside board area", {
            description: "Please drop the shape within the game board",
            duration: 2000
          });
        }
      }
    }
    
    // Reset touch state
    setTouchDraggedShape(null);
    setTouchStartPos(null);
    setIsDragging(false);
    setDragPreview(null);
    setHoveredCell(null);
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
      yellowCharge: 0,
      purpleCharge: 0,
      comboMultiplier: 1,
      consecutiveTurns: 0,
      linesCleared: 0,
      maxCombo: 0
    });
    setGameOver(false);
    setSelectedShape(null);
    setShowAdOption(false);
    setGravityFlipAvailable(false);
    setGravityFlipAdWatched(false);
    setTouchDraggedShape(null);
    setTouchStartPos(null);
    setIsDragging(false);
    setDragPreview(null);
    setHoveredCell(null);
    setClearLineMode(false);
    
    // Reset gravity flip timer
    setTimeout(() => {
      setGravityFlipAvailable(true);
      toast.info("Gravity Flip available!", {
        description: "Watch an ad to unlock Gravity Flip and rotate the board 180°"
      });
    }, 90000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-space-dark to-space-light">
      {/* Header - Mobile Optimized */}
      <header className="relative px-4 pt-2 pb-4">
        {/* Back Button - top-left corner */}
        <div className="absolute top-2 left-2 z-10">
          <Button
            size="sm"
            onClick={() => navigate('/')}
            className="text-xs h-8 px-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white border border-gray-500"
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">BACK</span>
          </Button>
        </div>
        
        {/* Title - Mobile Optimized */}
        <div className="absolute top-0 right-2 z-10">
          <img 
            src="/src/assets/headline.png" 
            alt="CUBE CRAZE" 
            className="h-12 sm:h-16 md:h-20 object-contain"
          />
        </div>
        
        {/* Score centered - Mobile Optimized */}
        <div className="text-center pt-8 sm:pt-4">
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-neon-yellow">
            Score: {gameStats.score.toLocaleString()}
          </div>
        </div>
        
        {/* Badges - Mobile Optimized */}
        <div className="absolute top-12 sm:top-16 right-2 flex gap-1 sm:gap-2">
          {gameStats.comboMultiplier > 1 && (
            <Badge className="combo-badge text-white text-xs">
              <span className="hidden sm:inline">Combo </span>x{gameStats.comboMultiplier}
            </Badge>
          )}
          {gameStats.consecutiveTurns > 0 && (
            <Badge className="streak-badge text-white text-xs">
              <span className="hidden sm:inline">Streak </span>x{Math.min(5, gameStats.consecutiveTurns)}
            </Badge>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 mt-8 sm:mt-16">
        {/* Power-ups - Mobile Optimized */}
        <div className="mb-3 sm:mb-4 flex justify-center sm:justify-start gap-1 overflow-x-auto power-ups-container">
          {/* Gravity Rotate Button */}
          <div className="game-cube p-1 flex-shrink-0">
            {gravityFlipAvailable && !gravityFlipAdWatched ? (
              <Button
                size="sm"
                onClick={watchAdForGravityFlip}
                className="text-xs h-8 px-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                <div className="text-center">
                  <div className="text-xs">GRAVITY</div>
                  <div className="text-xs">ROTATE</div>
                </div>
                <Zap className="w-3 h-3 ml-1" />
              </Button>
            ) : gravityFlipAvailable && gravityFlipAdWatched ? (
              <Button
                size="sm"
                onClick={useGravityFlip}
                className="text-xs h-8 px-1 bg-neon-magenta hover:bg-neon-magenta/80 text-white"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                <div className="text-center">
                  <div className="text-xs">GRAVITY</div>
                  <div className="text-xs">ROTATE</div>
                </div>
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={true}
                className="text-xs h-8 px-1 bg-gray-600 text-gray-400"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                <div className="text-center">
                  <div className="text-xs">GRAVITY</div>
                  <div className="text-xs">ROTATE</div>
                </div>
              </Button>
            )}
          </div>
          
          {/* Switch Shapes Button */}
          <div className="game-cube p-1 flex-shrink-0">
            <Button
              size="sm"
              onClick={() => {
                setCurrentShapes(generateRandomShapes());
                toast.success("Shapes switched!", {
                  description: "New shapes generated",
                  duration: 1500
                });
              }}
              className="text-xs h-8 px-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              <div className="text-center">
                <div className="text-xs">SWITCH</div>
                <div className="text-xs">SHAPES</div>
              </div>
              <Zap className="w-3 h-3 ml-1" />
            </Button>
          </div>
          
          {/* Clear Line Button */}
          <div className="game-cube p-1 flex-shrink-0">
            <Button
              size="sm"
              onClick={() => {
                // Enable edge selection mode
                toast.info("Click on edges to clear lines!", {
                  description: "Left/Right edges = horizontal rows, Top/Bottom edges = vertical columns",
                  duration: 4000
                });
                // Set a flag to enable row clicking for clearing
                setClearLineMode(true);
              }}
              className="text-xs h-8 px-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              <Zap className="w-3 h-3 mr-1" />
              <div className="text-center">
                <div className="text-xs">CLEAR</div>
                <div className="text-xs">LINE</div>
              </div>
              <Zap className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
        
        {/* Color Charge - Mobile Optimized */}
        <div className="mb-3 sm:mb-4">
          <div className="game-cube p-2 sm:p-4 max-w-md mx-auto">
            <div className="grid grid-cols-5 gap-1 sm:gap-2 color-charge-grid">
              {(['red', 'green', 'blue', 'yellow', 'purple'] as const).map((color) => (
                <div key={color} className="text-center">
                  <div className="text-xs sm:text-sm capitalize mb-1" style={{ color: getTextColor(color) }}>
                    {color}
                  </div>
                  <div className="text-xs sm:text-sm mb-1" style={{ color: getTextColor(color) }}>
                    {gameStats[`${color}Charge` as keyof GameStats]}%
                  </div>
                  <Progress 
                    value={gameStats[`${color}Charge` as keyof GameStats]} 
                    className="h-1 sm:h-2 mb-1"
                    style={{
                      '--progress-color': `var(--${color}-500)`
                    } as React.CSSProperties}
                  />
                  <Button
                    size="sm"
                    disabled={gameStats[`${color}Charge` as keyof GameStats] < 100}
                    onClick={() => useRainbowBlock(color)}
                    className="text-xs p-1 h-5 w-5 sm:h-6 sm:w-6 rainbow-block-button"
                    style={{
                      background: getColorGradient(color)
                    }}
                  >
                    🌈
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Layout - Stack vertically on mobile */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Game Board - Mobile Optimized */}
          <div className="lg:col-span-2 order-1">
            <div 
              className="block-blast-board p-6"
              onMouseMove={handleMouseMove}
              onMouseUp={(e) => {
                if (isDragging && touchDraggedShape) {
                  const boardElement = document.querySelector('.block-blast-board') as HTMLElement;
                  if (boardElement) {
                    const gridContainer = boardElement.querySelector('.game-grid') as HTMLElement;
                    if (gridContainer) {
                      const gridRect = gridContainer.getBoundingClientRect();
                      const gridX = e.clientX - gridRect.left;
                      const gridY = e.clientY - gridRect.top;
                      
                      const cellSize = 32;
                      const gap = 4;
                      const totalCellSize = cellSize + gap;
                      
                      const col = Math.floor(gridX / totalCellSize);
                      const row = Math.floor(gridY / totalCellSize);
                      
                      if (col >= 0 && col < 10 && row >= 0 && row < 10) {
                        if (canPlaceShape(touchDraggedShape.shape, row, col)) {
                          placeShape(touchDraggedShape, row, col);
                          toast.success("Shape placed!", {
                            description: `Placed ${touchDraggedShape.size}-block shape at row ${row}, col ${col}`,
                            duration: 1500
                          });
                        } else {
                          toast.error("Cannot place shape here", {
                            description: "Invalid position or occupied cell",
                            duration: 2000
                          });
                        }
                      }
                    }
                  }
                  
                  // Reset state
                  setTouchDraggedShape(null);
                  setTouchStartPos(null);
                  setIsDragging(false);
                  setDragPreview(null);
                  setHoveredCell(null);
                }
              }}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ touchAction: 'none' }}
            >
              <div className="grid grid-cols-10 gap-1 max-w-sm sm:max-w-md mx-auto game-grid">
                {board.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      data-cell={`${rowIndex}-${colIndex}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      onMouseEnter={() => setHoveredCell({ row: rowIndex, col: colIndex })}
                      onMouseLeave={() => setHoveredCell(null)}
                      disabled={isPlacingShape}
                                              className={`
                        w-6 h-6 sm:w-8 sm:h-8 game-block transition-all duration-300 ease-out
                        ${cell 
                          ? `bg-${cell}-500 border-white/30 shadow-md hover:shadow-lg hover:scale-105` 
                          : 'bg-blue-900 border-white/20 hover:bg-blue-800 hover:scale-105' // כחול קבוע לרקע הלוח עם הובר
                        }
                        ${touchDraggedShape && isDragging && hoveredCell && (() => {
                          // בדוק אם התא הנוכחי הוא חלק מהצורה שאפשר להניח
                          if (!touchDraggedShape || !hoveredCell) return false;
                          const shape = touchDraggedShape.shape;
                          const startRow = hoveredCell.row;
                          const startCol = hoveredCell.col;
                          
                          // בדוק אם התא הנוכחי הוא חלק מהצורה
                          for (let r = 0; r < shape.length; r++) {
                            for (let c = 0; c < shape[r].length; c++) {
                              if (shape[r][c] === 1) {
                                const targetRow = startRow + r;
                                const targetCol = startCol + c;
                                if (targetRow === rowIndex && targetCol === colIndex) {
                                  const canPlace = canPlaceShape(shape, startRow, startCol);
                                  console.log(`Cell ${rowIndex},${colIndex}: canPlace = ${canPlace}`);
                                  return canPlace;
                                }
                              }
                            }
                          }
                          return false;
                        })()
                          ? 'ring-2 sm:ring-4 ring-white ring-opacity-100 bg-white/40 shadow-lg shadow-white/50' // חיווי לבן זוהר לכל הצורה
                          : ''
                        }
                        ${isPlacingShape ? 'cursor-not-allowed' : 'cursor-pointer'}
                      `}
                      style={{
                        background: cell ? getColorGradient(cell) : undefined
                      }}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Current Shapes - Mobile Optimized */}
            <div className="game-cube p-3 sm:p-6 mt-4">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-center">Current Shapes</h3>
              <div className="flex justify-center gap-2 sm:gap-4 overflow-x-auto">
                {currentShapes.map((shape) => (
                  <button
                    key={shape.id}
                    onClick={() => setSelectedShape(shape)}
                    onTouchStart={(e) => handleTouchStart(e, shape)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={(e) => {
                      // For desktop testing
                      e.preventDefault();
                      e.stopPropagation();
                      setTouchStartPos({ x: e.clientX, y: e.clientY });
                      setTouchDraggedShape(shape);
                      setIsDragging(true);
                    }}
                    disabled={isPlacingShape}
                    className={`
                      relative p-2 sm:p-3 rounded-lg border-2 transition-all duration-300 ease-out cursor-grab flex-shrink-0
                      ${selectedShape?.id === shape.id 
                        ? 'border-neon-cyan ring-2 ring-neon-cyan/50 shadow-lg shadow-neon-cyan/30 scale-110 animate-pulse' 
                        : 'border-white/20 hover:border-white/40 hover:scale-105 hover:shadow-lg'
                      }
                      ${isPlacingShape ? 'opacity-50 cursor-not-allowed' : ''}
                      ${isDragging && touchDraggedShape?.id === shape.id ? 'opacity-50 cursor-grabbing' : ''}
                      active:scale-95 select-none shape-preview
                    `}
                    style={{
                      touchAction: 'none'
                    }}
                  >
                    <div className="grid gap-1 mb-2" style={{
                      gridTemplateColumns: `repeat(${shape.shape[0].length}, 1fr)`
                    }}>
                      {shape.shape.flat().map((cell, index) => (
                        <div
                          key={index}
                          className={`
                            w-4 h-4 sm:w-6 sm:h-6 game-block rounded border
                            ${cell ? `bg-${shape.color}-500 border-white/30 shadow-md` : 'transparent'}
                          `}
                          style={{
                            background: cell ? getColorGradient(shape.color) : 'transparent'
                          }}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-center text-white/70">
                      {shape.size} blocks
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Side Panel - Mobile Optimized */}
          <div className="space-y-4 sm:space-y-6 order-2">
            {/* Shield Status */}
            {shieldActive && (
              <div className="game-cube p-6">
                <h3 className="text-lg font-semibold mb-4">Power-ups</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-neon-turquoise">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">Shield Active</span>
                  </div>
                </div>
              </div>
            )}

            {/* Game Stats - Mobile Optimized */}
            <div className="game-cube p-3 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Stats</h3>
              <div className="space-y-2 text-xs sm:text-sm stats-container">
                <div className="flex justify-between">
                  <span>Score:</span>
                  <span className="font-bold text-neon-yellow">{gameStats.score.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Combo:</span>
                  <span className="font-bold text-neon-magenta">x{gameStats.comboMultiplier}</span>
                </div>
                <div className="flex justify-between">
                  <span>Streak:</span>
                  <span className="font-bold text-neon-turquoise">{gameStats.consecutiveTurns}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lines Cleared:</span>
                  <span className="font-bold text-green-400">{gameStats.linesCleared}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Combo:</span>
                  <span className="font-bold text-orange-400">{gameStats.maxCombo}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drag Preview - Mobile Optimized */}
      {dragPreview && (
        <div 
          className="fixed pointer-events-none z-50 drag-preview"
          style={{
            left: dragPreview.x,
            top: dragPreview.y,
            transform: 'translate(-50%, -50%) scale(1.1)',
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
          }}
        >
          <div className="grid gap-1" style={{
            gridTemplateColumns: `repeat(${dragPreview.shape.shape[0].length}, 1fr)`
          }}>
            {dragPreview.shape.shape.flat().map((cell, index) => (
              <div
                key={index}
                className={`
                  w-4 h-4 sm:w-5 sm:h-5 rounded border-2 border-white/30
                  ${cell ? '' : 'transparent'}
                `}
                style={{
                  background: cell ? getColorGradient(dragPreview.shape.color) : 'transparent',
                  boxShadow: cell ? 'inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 2px 4px rgba(0, 0, 0, 0.3)' : 'none'
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Game Over Dialog - Mobile Optimized */}
      {gameOver && (
        <div className="fixed inset-0 game-over-overlay flex items-center justify-center z-50 p-4">
          <div className="game-cube p-4 sm:p-8 max-w-sm sm:max-w-md text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-neon-magenta">Game Over!</h2>
            <p className="text-base sm:text-lg mb-2">Final Score: {gameStats.score.toLocaleString()}</p>
            <p className="text-xs sm:text-sm text-foreground/80 mb-4 sm:mb-6">No more moves available</p>
            <div className="space-y-4">
              <Button onClick={restartGame} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Restart Game
              </Button>
              {showAdOption && (
                <Button 
                  data-ad-button
                  onClick={() => {
                    const bonusPoints = Math.floor(gameStats.score * 0.1);
                    setGameStats(prev => ({
                      ...prev,
                      score: prev.score + bonusPoints
                    }));
                    setShowAdOption(false);
                    setGameOver(false);
                    toast.success(`Ad completed! +${bonusPoints} bonus points`, {
                      duration: 3000
                    });
                  }}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Watch Ad (+{Math.floor(gameStats.score * 0.1)} bonus)
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate('/')} className="w-full">
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

