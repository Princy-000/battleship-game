import Player from '../Player.js';
import Gameboard from '../Gameboard';

describe('Player Factory', () => {
  test('creates a human player', () => {
    const player = Player('human', 'Player 1');
    expect(player.type).toBe('human');
    expect(player.name).toBe('Player 1');
  });

  test('creates a computer player', () => {
    const player = Player('computer', 'AI');
    expect(player.type).toBe('computer');
    expect(player.name).toBe('AI');
  });

  test('player has their own gameboard', () => {
    const player = Player('human', 'Player 1');
    expect(player.gameboard).toBeDefined();
    expect(player.gameboard.board).toBeDefined();
    expect(player.gameboard.board.length).toBe(10);
  });

  test('computer player can make random attack', () => {
    const player = Player('computer', 'AI');
    const enemyBoard = Gameboard();
    
    const attack = player.makeRandomAttack(enemyBoard);
    
    expect(attack).toHaveLength(2);
    expect(attack[0]).toBeGreaterThanOrEqual(0);
    expect(attack[0]).toBeLessThan(10);
    expect(attack[1]).toBeGreaterThanOrEqual(0);
    expect(attack[1]).toBeLessThan(10);
  });

  test('computer player does not attack same coordinate twice', () => {
    const player = Player('computer', 'AI');
    const enemyBoard = Gameboard();
    
    // Mock the receiveAttack to track calls
    let attacks = [];
    enemyBoard.receiveAttack = (coord) => {
      attacks.push(coord);
      return 'miss';
    };
    
    // Make 100 random attacks (should be possible on 10x10)
    for (let i = 0; i < 100; i++) {
      const coord = player.makeRandomAttack(enemyBoard);
      enemyBoard.receiveAttack(coord);
    }
    
    // Check for duplicates
    const uniqueAttacks = new Set(attacks.map(coord => coord.join(',')));
    expect(uniqueAttacks.size).toBe(attacks.length);
  });

  test('human player can make specific attack', () => {
    const player = Player('human', 'Player 1');
    const enemyBoard = Gameboard();
    
    // Mock the receiveAttack
    enemyBoard.receiveAttack = jest.fn((coord) => 'miss');
    
    player.attack([3,5], enemyBoard);
    
    expect(enemyBoard.receiveAttack).toHaveBeenCalledWith([3,5]);
  });

  test('player can place ships on their own board', () => {
    const player = Player('human', 'Player 1');
    const ship = { length: 3 };
    
    player.placeShip([[0,0], [0,1], [0,2]], ship);
    
    expect(player.gameboard.board[0][0]).toBe(ship);
    expect(player.gameboard.board[0][1]).toBe(ship);
    expect(player.gameboard.board[0][2]).toBe(ship);
  });
});
