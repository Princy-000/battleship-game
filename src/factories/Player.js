import Gameboard from './Gameboard.js';

function Player(type, name) {
  const gameboard = Gameboard();
  const attacksMade = new Set(); // Track attacks for computer player

  function makeRandomAttack(enemyBoard) {
    let row, col;
    let coordKey;
    
    // Keep trying until we find an unattacked coordinate
    do {
      row = Math.floor(Math.random() * 10);
      col = Math.floor(Math.random() * 10);
      coordKey = `${row},${col}`;
    } while (attacksMade.has(coordKey));
    
    attacksMade.add(coordKey);
    return [row, col];
  }

  function attack(coordinates, enemyBoard) {
    const coordKey = `${coordinates[0]},${coordinates[1]}`;
    
    if (type === 'human') {
      // For human, we don't track attacks - Gameboard handles duplicates
      return enemyBoard.receiveAttack(coordinates);
    } else {
      // For computer, we ensure no duplicates
      if (attacksMade.has(coordKey)) {
        throw new Error("Already attacked this coordinate");
      }
      attacksMade.add(coordKey);
      return enemyBoard.receiveAttack(coordinates);
    }
  }

  function placeShip(coordinates, ship) {
    gameboard.placeShip(coordinates, ship);
  }

  return {
    type,
    name,
    gameboard,
    makeRandomAttack,
    attack,
    placeShip
  };
}

export default Player;
