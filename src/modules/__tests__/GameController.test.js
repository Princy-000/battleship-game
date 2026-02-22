import GameController from '../GameController.js';
import Ship from '../../factories/Ship.js';

describe('GameController', () => {
  let game;

  beforeEach(() => {
    game = GameController('Player 1', { skipDefaultShips: true });
  });

  test('initializes game with human and computer players', () => {
    expect(game.humanPlayer).toBeDefined();
    expect(game.computerPlayer).toBeDefined();
    expect(game.humanPlayer.type).toBe('human');
    expect(game.computerPlayer.type).toBe('computer');
  });

  test('human player can attack computer', () => {
    const ship = Ship(3);
    game.computerPlayer.placeShip([[0,0], [0,1], [0,2]], ship);
    
    const result = game.humanAttack([0,0]);
    
    expect(result).toBe('hit');
  });

  test('turn switches after human attack', () => {
    // Place multiple ships so game doesn't end
    const ship1 = Ship(3);
    const ship2 = Ship(3);
    game.computerPlayer.placeShip([[0,0], [0,1], [0,2]], ship1);
    game.computerPlayer.placeShip([[2,0], [2,1], [2,2]], ship2);
    
    game.humanAttack([0,0]);
    
    // After a non-winning attack, turn should be computer
    expect(game.currentTurn).toBe('computer');
  });

  test('computer can attack', () => {
    const humanShip = Ship(3);
    game.humanPlayer.placeShip([[0,0], [0,1], [0,2]], humanShip);
    
    // Set turn to computer
    game.setTurn('computer');
    
    const result = game.triggerComputerAttack();
    
    expect(result).toBeDefined();
  });

  test('turn switches back after computer attack', () => {
    const humanShip = Ship(3);
    game.humanPlayer.placeShip([[0,0], [0,1], [0,2]], humanShip);
    
    // Set turn to computer
    game.setTurn('computer');
    game.triggerComputerAttack();
    
    expect(game.currentTurn).toBe('human');
  });

  test('prevents human from attacking out of turn', () => {
    // First, make a human attack to switch turn
    const ship = Ship(3);
    game.computerPlayer.placeShip([[0,0], [0,1], [0,2]], ship);
    game.humanAttack([0,0]); // This switches turn to computer
    
    // Now try to attack again as human
    expect(() => {
      game.humanAttack([0,1]);
    }).toThrow('Not your turn!');
  });

  test('prevents attacking same spot twice', () => {
    // Place multiple ships so game doesn't end
    const ship1 = Ship(3);
    const ship2 = Ship(3);
    game.computerPlayer.placeShip([[0,0], [0,1], [0,2]], ship1);
    game.computerPlayer.placeShip([[2,0], [2,1], [2,2]], ship2);
    
    game.humanAttack([3,3]); // miss, turn becomes computer
    
    // For testing, set turn back to human
    game.setTurn('human');
    
    expect(() => {
      game.humanAttack([3,3]);
    }).toThrow('Already attacked this coordinate!');
  });

  test('detects when human wins', () => {
    // Place three ships that can be sunk one by one
    const ship1 = Ship(1);
    const ship2 = Ship(1);
    const ship3 = Ship(1);
    game.computerPlayer.placeShip([[0,0]], ship1);
    game.computerPlayer.placeShip([[1,1]], ship2);
    game.computerPlayer.placeShip([[2,2]], ship3);
    
    // Sink first ship (non-winning)
    const result1 = game.humanAttack([0,0]);
    expect(result1).toBe('hit');
    expect(game.gameOver).toBe(false);
    expect(game.winner).toBeNull();
    
    // Set turn back to human
    game.setTurn('human');
    
    // Sink second ship (still not winning)
    const result2 = game.humanAttack([1,1]);
    expect(result2).toBe('hit');
    expect(game.gameOver).toBe(false);
    expect(game.winner).toBeNull();
    
    // Set turn back to human
    game.setTurn('human');
    
    // Sink third ship - this should end the game
    const result3 = game.humanAttack([2,2]);
    
    // Game should be over after the winning attack
    expect(result3).toBe('hit');
    expect(game.gameOver).toBe(true);
    expect(game.winner).toBe('human');
  });

  test('detects when computer wins', () => {
    // Mock computer attacks
    jest.spyOn(game.computerPlayer, 'makeRandomAttack')
      .mockReturnValueOnce([0,0])
      .mockReturnValueOnce([0,1])
      .mockReturnValueOnce([1,0]);
    
    // Place multiple ships on human's board
    const ship1 = Ship(2);
    const ship2 = Ship(1);
    game.humanPlayer.placeShip([[0,0], [0,1]], ship1);
    game.humanPlayer.placeShip([[1,0]], ship2);
    
    // Human attacks (miss) to give computer turn
    const humanResult = game.humanAttack([5,5]);
    expect(humanResult).toBe('miss');
    expect(game.gameOver).toBe(false);
    
    // First computer attack (not winning)
    const result1 = game.triggerComputerAttack();
    expect(result1).toBe('hit');
    expect(game.gameOver).toBe(false);
    expect(game.winner).toBeNull();
    
    // Second computer attack (still not winning)
    game.setTurn('computer');
    const result2 = game.triggerComputerAttack();
    expect(result2).toBe('hit');
    expect(game.gameOver).toBe(false);
    expect(game.winner).toBeNull();
    
    // Third computer attack - should end game
    game.setTurn('computer');
    const result3 = game.triggerComputerAttack();
    
    expect(result3).toBe('hit');
    expect(game.gameOver).toBe(true);
    expect(game.winner).toBe('computer');
  });

  test('resets game properly', () => {
    // Play some moves
    const ship1 = Ship(2);
    const ship2 = Ship(2);
    game.computerPlayer.placeShip([[0,0], [0,1]], ship1);
    game.computerPlayer.placeShip([[2,2], [2,3]], ship2);
    
    game.humanAttack([0,0]); // hit
    game.setTurn('human');
    game.humanAttack([2,2]); // hit
    
    game.reset();
    
    expect(game.currentTurn).toBe('human');
    expect(game.gameOver).toBe(false);
    expect(game.winner).toBeNull();
    
    // Should be able to attack after reset
    const newShip = Ship(2);
    game.computerPlayer.placeShip([[5,5], [5,6]], newShip);
    const result = game.humanAttack([5,5]);
    expect(result).toBe('hit');
  });
});
