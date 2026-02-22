import Gameboard from '../Gameboard';

describe('Gameboard Factory', () => {
  test('creates a 10x10 board', () => {
    const gameboard = Gameboard();
    expect(gameboard.board.length).toBe(10);
    expect(gameboard.board[0].length).toBe(10);
  });

  test('places a ship at specific coordinates', () => {
    const gameboard = Gameboard();
    const ship = { 
      length: 3,
      hits: 0,
      hit: function() { this.hits++ },
      isSunk: function() { return this.hits >= this.length }
    };
    
    gameboard.placeShip([[0,0], [0,1], [0,2]], ship);
    
    expect(gameboard.board[0][0]).toBe(ship);
    expect(gameboard.board[0][1]).toBe(ship);
    expect(gameboard.board[0][2]).toBe(ship);
  });

  test('prevents placing ship out of bounds', () => {
    const gameboard = Gameboard();
    const ship = { 
      length: 3,
      hits: 0,
      hit: function() { this.hits++ },
      isSunk: function() { return this.hits >= this.length }
    };
    
    expect(() => {
      gameboard.placeShip([[9,9], [9,10], [9,11]], ship);
    }).toThrow();
  });

  test('prevents placing ships overlapping', () => {
    const gameboard = Gameboard();
    const ship1 = { 
      length: 2,
      hits: 0,
      hit: function() { this.hits++ },
      isSunk: function() { return this.hits >= this.length }
    };
    const ship2 = { 
      length: 2,
      hits: 0,
      hit: function() { this.hits++ },
      isSunk: function() { return this.hits >= this.length }
    };
    
    gameboard.placeShip([[0,0], [0,1]], ship1);
    
    expect(() => {
      gameboard.placeShip([[0,1], [0,2]], ship2);
    }).toThrow();
  });

  test('receiveAttack hits a ship', () => {
    const gameboard = Gameboard();
    const ship = { 
      length: 3, 
      hits: 0,
      hit: function() { this.hits++ },
      isSunk: function() { return this.hits >= this.length }
    };
    
    gameboard.placeShip([[0,0], [0,1], [0,2]], ship);
    const result = gameboard.receiveAttack([0,1]);
    
    expect(ship.hits).toBe(1);
    expect(result).toBe('hit');
  });

  test('receiveAttack records missed shots', () => {
    const gameboard = Gameboard();
    
    const result = gameboard.receiveAttack([5,5]);
    
    expect(gameboard.missedAttacks).toContainEqual([5,5]);
    expect(result).toBe('miss');
  });

  test('receiveAttack prevents attacking same spot twice', () => {
    const gameboard = Gameboard();
    
    gameboard.receiveAttack([3,3]);
    
    expect(() => {
      gameboard.receiveAttack([3,3]);
    }).toThrow();
  });

  test('reports when all ships are sunk', () => {
    const gameboard = Gameboard();
    const ship1 = { 
      length: 2, 
      hits: 0,
      hit: function() { this.hits++ },
      isSunk: function() { return this.hits >= this.length }
    };
    const ship2 = { 
      length: 2, 
      hits: 0,
      hit: function() { this.hits++ },
      isSunk: function() { return this.hits >= this.length }
    };
    
    gameboard.placeShip([[0,0], [0,1]], ship1);
    gameboard.placeShip([[2,2], [2,3]], ship2);
    
    gameboard.receiveAttack([0,0]);
    gameboard.receiveAttack([0,1]);
    gameboard.receiveAttack([2,2]);
    gameboard.receiveAttack([2,3]);
    
    expect(gameboard.allShipsSunk()).toBe(true);
  });
});
