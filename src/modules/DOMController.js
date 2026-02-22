import PlacementController from './PlacementController.js';
import GameController from './GameController.js';

function DOMController(game, container) {
  let currentGame = game;
  let rootContainer = container;

  function render() {
    console.log('Rendering DOMController...');
    
    // Clear container
    rootContainer.innerHTML = '';

    // Create game layout
    const gameDiv = document.createElement('div');
    gameDiv.className = 'battleship-game';

    // Add turn indicator
    const turnIndicator = document.createElement('div');
    turnIndicator.id = 'turn-indicator';
    turnIndicator.className = 'turn-indicator';
    gameDiv.appendChild(turnIndicator);

    // Create boards container
    const boardsDiv = document.createElement('div');
    boardsDiv.className = 'boards-container';

    // Create human board
    const humanBoard = createBoard('human', 'Your Board');
    boardsDiv.appendChild(humanBoard);

    // Create computer board
    const computerBoard = createBoard('computer', 'Enemy Board');
    boardsDiv.appendChild(computerBoard);

    gameDiv.appendChild(boardsDiv);

    // Add reset button
    const resetButton = document.createElement('button');
    resetButton.id = 'reset-game';
    resetButton.textContent = 'New Game';
    resetButton.addEventListener('click', () => {
      console.log('Reset button clicked - returning to placement screen');
      
      // Create a fresh game instance (NOT a string!)
      const freshGame = GameController('Player 1', { skipDefaultShips: true });
      console.log('Created fresh game:', freshGame);
      
      // Show placement UI again with the fresh game
      const placementController = PlacementController(freshGame, rootContainer);
      placementController.render();
    });
    gameDiv.appendChild(resetButton);

    // Add game over message container
    const gameOverMsg = document.createElement('div');
    gameOverMsg.id = 'game-over-message';
    gameOverMsg.className = 'game-over-message';
    gameDiv.appendChild(gameOverMsg);

    rootContainer.appendChild(gameDiv);

    // Update all displays
    updateTurnIndicator();
    updateGameOverMessage();
    
    // Attach click handlers AFTER everything is in the DOM
    setTimeout(() => {
      attachClickHandlers();
    }, 0);
  }

  function createBoard(playerType, title) {
    const boardDiv = document.createElement('div');
    boardDiv.className = 'board';
    boardDiv.id = `${playerType}-board`;

    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    boardDiv.appendChild(titleEl);

    const grid = document.createElement('div');
    grid.className = 'grid';

    const gameboard = playerType === 'human' 
      ? currentGame.humanPlayer.gameboard 
      : currentGame.computerPlayer.gameboard;

    console.log(`Creating ${playerType} board with ${gameboard.ships.length} ships`);

    // Create 10x10 grid
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.player = playerType;
        cell.dataset.row = row;
        cell.dataset.col = col;

        // Add ship class for human player ships
        if (playerType === 'human' && gameboard.board[row][col] !== null) {
          cell.classList.add('ship');
        }

        // Check if this coordinate has been attacked
        const hasBeenAttacked = gameboard.attackedCoordinates?.has(`${row},${col}`);
        
        if (hasBeenAttacked) {
          // It's a hit if there's a ship, otherwise a miss
          if (gameboard.board[row][col] !== null) {
            cell.classList.add('hit');
          } else {
            cell.classList.add('miss');
          }
        }

        grid.appendChild(cell);
      }
    }

    boardDiv.appendChild(grid);
    return boardDiv;
  }

  function updateTurnIndicator() {
    const indicator = document.getElementById('turn-indicator');
    if (!indicator) return;

    if (currentGame.gameOver) {
      indicator.textContent = 'Game Over';
    } else {
      indicator.textContent = currentGame.currentTurn === 'human' 
        ? 'Your turn' 
        : 'Computer turn...';
    }
  }

  function updateGameOverMessage() {
    const msgEl = document.getElementById('game-over-message');
    if (!msgEl) return;

    if (currentGame.gameOver) {
      msgEl.textContent = currentGame.winner === 'human' 
        ? 'You win! 🎉' 
        : 'Computer wins! 🤖';
      msgEl.style.display = 'block';
    } else {
      msgEl.textContent = '';
      msgEl.style.display = 'none';
    }
  }

  function computerTurn() {
    console.log('Computer turn started');
    if (currentGame.gameOver) return;
    if (currentGame.currentTurn !== 'computer') return;

    setTimeout(() => {
      try {
        console.log('Computer attacking...');
        const result = currentGame.triggerComputerAttack();
        console.log('Computer attack result:', result);
        render();
      } catch (error) {
        console.log('Computer attack error:', error);
      }
    }, 500);
  }

  function attachClickHandlers() {
    console.log('Attaching click handlers...');
    
    const computerCells = document.querySelectorAll('[data-player="computer"]');
    console.log(`Found ${computerCells.length} computer cells`);
    
    if (computerCells.length === 0) {
      console.error('No computer cells found! Trying again in 100ms...');
      setTimeout(attachClickHandlers, 100);
      return;
    }

    computerCells.forEach(cell => {
      // Remove any existing listeners by cloning
      const newCell = cell.cloneNode(true);
      cell.parentNode.replaceChild(newCell, cell);
      
      newCell.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Computer cell clicked', {
          turn: currentGame.currentTurn,
          gameOver: currentGame.gameOver,
          row: newCell.dataset.row,
          col: newCell.dataset.col
        });
        
        if (currentGame.currentTurn !== 'human') {
          console.log('Not human turn');
          return;
        }
        if (currentGame.gameOver) {
          console.log('Game is over');
          return;
        }

        const row = parseInt(newCell.dataset.row);
        const col = parseInt(newCell.dataset.col);

        try {
          console.log('Calling humanAttack with', [row, col]);
          const result = currentGame.humanAttack([row, col]);
          console.log('Attack result:', result);
          
          if (currentGame.gameOver) {
            console.log('Game over! Winner:', currentGame.winner);
          }
          
          render();
          
          if (!currentGame.gameOver && currentGame.currentTurn === 'computer') {
            computerTurn();
          }
        } catch (error) {
          console.log('Attack error:', error.message);
        }
      });
    });
    
    console.log('Click handlers attached successfully');
  }

  // Store reference for debugging
  if (typeof window !== 'undefined') {
    window.debug = window.debug || {};
    window.debug.domController = this;
    window.debug.currentGame = currentGame;
  }

  return {
    render
  };
}

export default DOMController;
