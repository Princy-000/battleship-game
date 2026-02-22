function Gameboard() {
  // Create 10x10 board filled with null
  const board = Array(10).fill().map(() => Array(10).fill(null));
  const ships = [];
  const missedAttacks = [];
  const attackedCoordinates = new Set(); // Track all attacked spots

  function placeShip(coordinates, ship) {
    console.log('Gameboard.placeShip called with:', { coordinates, shipLength: ship.length });
    
    // Check if all coordinates are within bounds
    for (let [row, col] of coordinates) {
      if (row < 0 || row >= 10 || col < 0 || col >= 10) {
        throw new Error("Ship placement out of bounds");
      }
    }
    
    // Check if any coordinate is already occupied
    for (let [row, col] of coordinates) {
      if (board[row][col] !== null) {
        throw new Error("Ship overlaps with existing ship");
      }
    }
    
    // Place the ship on the board
    for (let [row, col] of coordinates) {
      board[row][col] = ship;
    }
    
    // Store ship with its coordinates for later reference
    ships.push({ ship, coordinates });
    console.log('Ship placed. Total ships:', ships.length);
  }

  function receiveAttack(coordinates) {
    console.log('Gameboard.receiveAttack called with:', coordinates);
    const [row, col] = coordinates;
    const coordKey = `${row},${col}`;
    
    // Check if already attacked (either hit or miss)
    if (attackedCoordinates.has(coordKey)) {
      console.log('Already attacked this coordinate');
      throw new Error("Already attacked this coordinate");
    }
    
    attackedCoordinates.add(coordKey);
    
    // Check if hit a ship
    if (board[row][col] !== null) {
      const ship = board[row][col];
      console.log('Hit ship at', coordinates, 'before hit - hits:', ship.hits);
      ship.hit();
      console.log('After hit - hits:', ship.hits, 'isSunk:', ship.isSunk());
      return 'hit';
    } else {
      console.log('Miss at', coordinates);
      missedAttacks.push([row, col]);
      return 'miss';
    }
  }

  function allShipsSunk() {
    console.log('Checking all ships sunk. Total ships:', ships.length);
    ships.forEach(({ ship }, index) => {
      console.log(`Ship ${index}: hits=${ship.hits}, length=${ship.length}, isSunk=${ship.isSunk()}`);
    });
    const result = ships.every(({ ship }) => ship.isSunk());
    console.log('All ships sunk?', result);
    return result;
  }

  return {
    board,
    ships,
    missedAttacks,
    placeShip,
    receiveAttack,
    allShipsSunk
  };
}

export default Gameboard;
