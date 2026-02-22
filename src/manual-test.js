import GameController from './modules/GameController.js';
import Ship from './factories/Ship.js';

console.log('=== MANUAL TEST ===');

// Create game
const game = GameController('Test Player', { skipDefaultShips: true });
console.log('Game created, initial turn:', game.currentTurn);

// Place ships
const ship1 = Ship(1);
const ship2 = Ship(1);
const ship3 = Ship(1);
game.computerPlayer.placeShip([[0,0]], ship1);
game.computerPlayer.placeShip([[1,1]], ship2);
game.computerPlayer.placeShip([[2,2]], ship3);

console.log('Placed 3 ships on computer board');
console.log('Computer player ships:', game.computerPlayer.gameboard.ships.length);

// Test turn switching
console.log('\n--- Testing turn switch ---');
let result1 = game.humanAttack([0,0]);
console.log('Attack 1 result:', result1);
console.log('Turn after attack:', game.currentTurn);
console.log('Game over:', game.gameOver);
console.log('Winner:', game.winner);

// Check ship status after first attack
console.log('\n--- Ship status after attack 1 ---');
game.computerPlayer.gameboard.ships.forEach((item, i) => {
  console.log(`Ship ${i}: hits=${item.ship.hits}, isSunk=${item.ship.isSunk()}`);
});

// Set turn back to human
game.setTurn('human');
console.log('Turn set to human:', game.currentTurn);

let result2 = game.humanAttack([1,1]);
console.log('\nAttack 2 result:', result2);
console.log('Turn after attack:', game.currentTurn);
console.log('Game over:', game.gameOver);
console.log('Winner:', game.winner);

// Check ship status after second attack
console.log('\n--- Ship status after attack 2 ---');
game.computerPlayer.gameboard.ships.forEach((item, i) => {
  console.log(`Ship ${i}: hits=${item.ship.hits}, isSunk=${item.ship.isSunk()}`);
});

// Set turn back to human
game.setTurn('human');
console.log('Turn set to human:', game.currentTurn);

let result3 = game.humanAttack([2,2]);
console.log('\nAttack 3 result:', result3);
console.log('Turn after attack:', game.currentTurn);
console.log('Game over:', game.gameOver);
console.log('Winner:', game.winner);

// Check ship status after third attack
console.log('\n--- Ship status after attack 3 ---');
game.computerPlayer.gameboard.ships.forEach((item, i) => {
  console.log(`Ship ${i}: hits=${item.ship.hits}, isSunk=${item.ship.isSunk()}`);
});

// Final check
console.log('\n=== FINAL STATE ===');
console.log('Game over:', game.gameOver);
console.log('Winner:', game.winner);
console.log('All ships sunk:', game.computerPlayer.gameboard.allShipsSunk());

console.log('\n=== TEST COMPLETE ===');
