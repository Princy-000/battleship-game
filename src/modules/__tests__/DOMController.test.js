/**
 * @jest-environment jsdom
 */

import DOMController from '../DOMController';
import GameController from '../GameController';
import Ship from '../../factories/Ship';

describe('DOMController', () => {
  let game;
  let domController;
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'game-container';
    document.body.appendChild(container);

    game = GameController('Player 1', { skipDefaultShips: true });
    
    const ship1 = Ship(2);
    const ship2 = Ship(2);
    game.humanPlayer.placeShip([[0,0], [0,1]], ship1);
    game.computerPlayer.placeShip([[5,5], [5,6]], ship2);

    domController = DOMController(game, container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('creates board containers', () => {
    domController.render();
    
    const humanBoard = document.getElementById('human-board');
    const computerBoard = document.getElementById('computer-board');
    
    expect(humanBoard).toBeTruthy();
    expect(computerBoard).toBeTruthy();
  });

  test('renders 10x10 grids for both players', () => {
    domController.render();
    
    const humanCells = document.querySelectorAll('#human-board .cell');
    const computerCells = document.querySelectorAll('#computer-board .cell');
    
    expect(humanCells.length).toBe(100);
    expect(computerCells.length).toBe(100);
  });

  test('shows human player ships on their board', () => {
    domController.render();
    
    const cell1 = document.querySelector('[data-player="human"][data-row="0"][data-col="0"]');
    const cell2 = document.querySelector('[data-player="human"][data-row="0"][data-col="1"]');
    const emptyCell = document.querySelector('[data-player="human"][data-row="5"][data-col="5"]');
    
    expect(cell1.classList.contains('ship')).toBe(true);
    expect(cell2.classList.contains('ship')).toBe(true);
    expect(emptyCell.classList.contains('ship')).toBe(false);
  });

  test('hides computer player ships', () => {
    domController.render();
    
    const cell = document.querySelector('[data-player="computer"][data-row="5"][data-col="5"]');
    
    expect(cell.classList.contains('ship')).toBe(false);
  });

  test('marks hits on boards', () => {
    domController.render();
    
    game.humanAttack([5,5]);
    domController.render();
    
    const hitCell = document.querySelector('[data-player="computer"][data-row="5"][data-col="5"]');
    expect(hitCell.classList.contains('hit')).toBe(true);
  });

  test('marks misses on boards', () => {
    domController.render();
    
    game.humanAttack([9,9]);
    domController.render();
    
    const missCell = document.querySelector('[data-player="computer"][data-row="9"][data-col="9"]');
    expect(missCell.classList.contains('miss')).toBe(true);
  });

  test('turn management works correctly', () => {
    domController.render();
    
    // Initial state: human's turn
    expect(game.currentTurn).toBe('human');
    
    // Human attacks
    game.humanAttack([5,5]);
    
    // After human attack, turn becomes computer
    expect(game.currentTurn).toBe('computer');
    
    // Computer attacks
    game.triggerComputerAttack();
    
    // After computer attack, turn back to human
    expect(game.currentTurn).toBe('human');
  });

  test('shows game over message', () => {
    const freshGame = GameController('Player 1', { skipDefaultShips: true });
    const ship = Ship(1);
    freshGame.computerPlayer.placeShip([[0,0]], ship);
    
    const freshDOM = DOMController(freshGame, container);
    freshDOM.render();
    
    freshGame.humanAttack([0,0]);
    freshDOM.render();
    
    const gameOverMessage = document.getElementById('game-over-message');
    expect(gameOverMessage).toBeTruthy();
    expect(gameOverMessage.textContent).toContain('You win!');
  });

  test('attaches click handlers to computer board', () => {
    domController.render();
    
    const computerCell = document.querySelector('[data-player="computer"][data-row="3"][data-col="3"]');
    
    game.humanAttack = jest.fn();
    computerCell.click();
    
    expect(game.humanAttack).toHaveBeenCalledWith([3, 3]);
  });

  test('disables clicking on human board', () => {
    domController.render();
    
    const humanCell = document.querySelector('[data-player="human"][data-row="3"][data-col="3"]');
    
    game.humanAttack = jest.fn();
    humanCell.click();
    
    expect(game.humanAttack).not.toHaveBeenCalled();
  });

  test('disables clicking during computer turn', () => {
    domController.render();
    
    // Set turn to computer
    game.setTurn('computer');
    
    const computerCell = document.querySelector('[data-player="computer"][data-row="3"][data-col="3"]');
    
    game.humanAttack = jest.fn();
    computerCell.click();
    
    expect(game.humanAttack).not.toHaveBeenCalled();
  });

  test('reset button clears and re-renders', () => {
    domController.render();
    
    game.humanAttack([5,5]);
    
    const resetButton = document.getElementById('reset-game');
    resetButton.click();
    
    const hitCell = document.querySelector('[data-player="computer"][data-row="5"][data-col="5"]');
    expect(hitCell.classList.contains('hit')).toBe(false);
  });
});
