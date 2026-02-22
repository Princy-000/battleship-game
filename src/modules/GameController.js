import Player from '../factories/Player.js';
import Ship from '../factories/Ship.js';

function GameController(humanName = 'Player', options = {}) {
  const { skipDefaultShips = false } = options;
  
  // Initialize players
  const humanPlayer = Player('human', humanName);
  const computerPlayer = Player('computer', 'Computer');
  
  // Game state (private)
  let _currentTurn = 'human';
  let _gameOver = false;
  let _winner = null;
  
  // Track attacks made by human (to prevent duplicates)
  const humanAttacks = new Set();

  // Pre-place some ships for both players (unless skipped for testing)
  function initializeDefaultShips() {
    if (skipDefaultShips) return;
    
    const humanShips = [
      { length: 5, coords: [[0,0], [0,1], [0,2], [0,3], [0,4]] },
      { length: 4, coords: [[2,0], [2,1], [2,2], [2,3]] }
    ];
    
    humanShips.forEach(({ length, coords }) => {
      const ship = Ship(length);
      try {
        humanPlayer.placeShip(coords, ship);
      } catch (e) {}
    });
    
    const computerShips = [
      { length: 5, coords: [[9,5], [9,6], [9,7], [9,8], [9,9]] },
      { length: 4, coords: [[7,0], [7,1], [7,2], [7,3]] }
    ];
    
    computerShips.forEach(({ length, coords }) => {
      const ship = Ship(length);
      try {
        computerPlayer.placeShip(coords, ship);
      } catch (e) {}
    });
  }
  
  initializeDefaultShips();

  function checkAllShipsSunk(player) {
    const ships = player.gameboard.ships;
    if (ships.length === 0) return false;
    return ships.every(({ ship }) => ship.isSunk());
  }

  function humanAttack(coordinates) {
    // Check if game is over
    if (_gameOver) {
      throw new Error("Game is already over!");
    }
    
    // Check if it's human's turn
    if (_currentTurn !== 'human') {
      throw new Error("Not your turn!");
    }
    
    const coordKey = `${coordinates[0]},${coordinates[1]}`;
    
    // Check if already attacked this spot
    if (humanAttacks.has(coordKey)) {
      throw new Error("Already attacked this coordinate!");
    }
    
    humanAttacks.add(coordKey);
    
    // Perform attack
    const result = computerPlayer.gameboard.receiveAttack(coordinates);
    
    // Check if computer's ships are all sunk
    if (checkAllShipsSunk(computerPlayer)) {
      _gameOver = true;
      _winner = 'human';
    } else {
      // Switch turn to computer
      _currentTurn = 'computer';
    }
    
    return result;
  }

  function computerAttack() {
    // Check if game is over
    if (_gameOver) return null;
    
    // Check if it's computer's turn
    if (_currentTurn !== 'computer') return null;
    
    // Get random attack from computer
    const attack = computerPlayer.makeRandomAttack(humanPlayer.gameboard);
    
    // Perform attack
    const result = humanPlayer.gameboard.receiveAttack(attack);
    
    // Check if human's ships are all sunk
    if (checkAllShipsSunk(humanPlayer)) {
      _gameOver = true;
      _winner = 'computer';
    } else {
      // Switch turn back to human
      _currentTurn = 'human';
    }
    
    return result;
  }

  function triggerComputerAttack() {
    return computerAttack();
  }

  function reset() {
    // Create fresh players
    const newHumanPlayer = Player('human', humanName);
    const newComputerPlayer = Player('computer', 'Computer');
    
    // Copy properties
    Object.assign(humanPlayer, newHumanPlayer);
    Object.assign(computerPlayer, newComputerPlayer);
    
    // Clear attacks
    humanAttacks.clear();
    
    // Reset game state
    _currentTurn = 'human';
    _gameOver = false;
    _winner = null;
  }

  function setTurn(turn) {
    if (turn === 'human' || turn === 'computer') {
      _currentTurn = turn;
    }
  }

  // Use getters to ensure we always return current values
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
