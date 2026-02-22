import Player from '../factories/Player.js';
import SmartComputerPlayer from '../factories/SmartComputerPlayer.js';
import Ship from '../factories/Ship.js';

function GameController(humanName = 'Player', options = {}) {
  const { skipDefaultShips = false, useSmartAI = true } = options;
  
  // Initialize players
  const humanPlayer = Player('human', humanName);
  const computerPlayer = useSmartAI ? SmartComputerPlayer('Computer') : Player('computer', 'Computer');
  
  // Game state
  let _currentTurn = 'human';
  let _gameOver = false;
  let _winner = null;
  
  // Track attacks made by human (to prevent duplicates)
  const humanAttacks = new Set();

  // Ship configurations
  const shipConfigs = [
    { length: 5, name: 'Carrier' },
    { length: 4, name: 'Battleship' },
    { length: 3, name: 'Cruiser' },
    { length: 3, name: 'Submarine' },
    { length: 2, name: 'Destroyer' }
  ];

  function isValidPlacement(gameboard, coords) {
    for (let [row, col] of coords) {
      if (row < 0 || row >= 10 || col < 0 || col >= 10) return false;
      if (gameboard.board[row][col] !== null) return false;
    }
    return true;
  }

  function generateRandomPlacement(gameboard, length) {
    const maxAttempts = 1000;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const startRow = Math.floor(Math.random() * 10);
      const startCol = Math.floor(Math.random() * 10);
      const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';
      
      const coords = [];
      for (let i = 0; i < length; i++) {
        if (direction === 'horizontal') {
          coords.push([startRow, startCol + i]);
        } else {
          coords.push([startRow + i, startCol]);
        }
      }
      
      if (isValidPlacement(gameboard, coords)) {
        return coords;
      }
    }
    
    return null;
  }

  function placeShipsRandomly(player) {
    console.log(`Placing ships randomly for ${player.type}`);
    shipConfigs.forEach(({ length }) => {
      const ship = Ship(length);
      const coords = generateRandomPlacement(player.gameboard, length);
      
      if (coords) {
        player.placeShip(coords, ship);
        console.log(`Placed ${player.type} ship of length ${length} at`, coords);
      } else {
        console.log(`Failed to place ${player.type} ship of length ${length}, retrying...`);
        // If we can't place a ship, reset and try again
        player.gameboard = Player('temp').gameboard;
        placeShipsRandomly(player);
        return;
      }
    });
    console.log(`${player.type} now has ${player.gameboard.ships.length} ships`);
  }

  function initializeShips() {
    if (skipDefaultShips) return;
    placeShipsRandomly(humanPlayer);
    placeShipsRandomly(computerPlayer);
  }
  
  // Only initialize if not skipping ships
  if (!skipDefaultShips) {
    initializeShips();
  }

  function checkAllShipsSunk(player) {
    const ships = player.gameboard.ships;
    if (ships.length === 0) return false;
    return ships.every(({ ship }) => ship.isSunk());
  }

  function humanAttack(coordinates) {
    console.log('humanAttack called with', coordinates);
    if (_gameOver) throw new Error("Game is already over!");
    if (_currentTurn !== 'human') throw new Error("Not your turn!");
    
    const coordKey = `${coordinates[0]},${coordinates[1]}`;
    if (humanAttacks.has(coordKey)) throw new Error("Already attacked this coordinate!");
    
    humanAttacks.add(coordKey);
    const result = computerPlayer.gameboard.receiveAttack(coordinates);
    console.log('humanAttack result:', result);
    
    if (checkAllShipsSunk(computerPlayer)) {
      console.log('All computer ships sunk!');
      _gameOver = true;
      _winner = 'human';
    } else {
      console.log('Switching turn to computer');
      _currentTurn = 'computer';
    }
    
    return result;
  }

  function computerAttack() {
    console.log('computerAttack called');
    if (_gameOver) return null;
    if (_currentTurn !== 'computer') return null;
    
    const attack = computerPlayer.makeRandomAttack(humanPlayer.gameboard);
    console.log('Computer attacking:', attack);
    
    const result = humanPlayer.gameboard.receiveAttack(attack);
    console.log('Computer attack result:', result);
    
    // Register the result with smart AI
    if (computerPlayer.registerAttackResult) {
      computerPlayer.registerAttackResult(attack, result);
    }
    
    if (checkAllShipsSunk(humanPlayer)) {
      console.log('All human ships sunk!');
      _gameOver = true;
      _winner = 'computer';
    } else {
      console.log('Switching turn back to human');
      _currentTurn = 'human';
    }
    
    return result;
  }

  function triggerComputerAttack() {
    console.log('triggerComputerAttack called');
    return computerAttack();
  }

  function reset() {
    console.log('Game reset - creating new game with ships');
    
    // Create new players
    const newHumanPlayer = Player('human', humanName);
    const newComputerPlayer = useSmartAI ? SmartComputerPlayer('Computer') : Player('computer', 'Computer');
    
    // Replace the old players' gameboards with new ones
    humanPlayer.gameboard = newHumanPlayer.gameboard;
    computerPlayer.gameboard = newComputerPlayer.gameboard;
    
    // Clear attacks
    humanAttacks.clear();
    
    // Reset game state
    _currentTurn = 'human';
    _gameOver = false;
    _winner = null;
    
    // Place new random ships for both players
    if (!skipDefaultShips) {
      placeShipsRandomly(humanPlayer);
      placeShipsRandomly(computerPlayer);
    }
    
    console.log('Reset complete:', {
      humanShips: humanPlayer.gameboard.ships.length,
      computerShips: computerPlayer.gameboard.ships.length
    });
  }

  function setTurn(turn) {
    console.log('Setting turn to:', turn);
    if (turn === 'human' || turn === 'computer') {
      _currentTurn = turn;
    }
  }

  return {
    humanPlayer,
    computerPlayer,
    get currentTurn() { return _currentTurn; },
    get gameOver() { return _gameOver; },
    get winner() { return _winner; },
    humanAttack,
    triggerComputerAttack,
    reset,
    setTurn
  };
}

export default GameController;
