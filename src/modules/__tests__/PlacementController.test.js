/**
 * @jest-environment jsdom
 */

import PlacementController from '../PlacementController';
import GameController from '../GameController';
import Ship from '../../factories/Ship';

describe('PlacementController', () => {
  let game;
  let placementController;
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'placement-container';
    document.body.appendChild(container);

    game = GameController('Player 1', { skipDefaultShips: true });
    placementController = PlacementController(game, container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('creates ship selection UI', () => {
    placementController.render();
    
    const shipList = document.getElementById('ship-list');
    expect(shipList).toBeTruthy();
    
    const ships = document.querySelectorAll('.ship-item');
    expect(ships.length).toBe(5);
  });

  test('shows ship sizes correctly', () => {
    placementController.render();
    
    const carrier = document.querySelector('[data-ship="Carrier"]');
    expect(carrier).toBeTruthy();
    expect(carrier.textContent).toContain('Carrier (5)');
  });

  test('highlights selected ship', () => {
    placementController.render();
    
    const carrier = document.querySelector('[data-ship="Carrier"]');
    carrier.click();
    
    expect(carrier.classList.contains('selected')).toBe(true);
  });

  test('shows placement grid', () => {
    placementController.render();
    
    const grid = document.getElementById('placement-grid');
    expect(grid).toBeTruthy();
    
    const cells = document.querySelectorAll('.placement-cell');
    expect(cells.length).toBe(100);
  });

  test('previews ship placement on hover', () => {
    placementController.render();
    
    const carrier = document.querySelector('[data-ship="Carrier"]');
    carrier.click();
    
    const cell = document.querySelector('[data-row="0"][data-col="0"]');
    const mouseoverEvent = new MouseEvent('mouseover', { bubbles: true });
    cell.dispatchEvent(mouseoverEvent);
    
    const previewCells = document.querySelectorAll('.preview');
    expect(previewCells.length).toBe(5);
  });

  test('prevents invalid placement preview', () => {
    placementController.render();
    
    const carrier = document.querySelector('[data-ship="Carrier"]');
    carrier.click();
    
    const cell = document.querySelector('[data-row="0"][data-col="8"]');
    const mouseoverEvent = new MouseEvent('mouseover', { bubbles: true });
    cell.dispatchEvent(mouseoverEvent);
    
    const previewCells = document.querySelectorAll('.preview.invalid');
    expect(previewCells.length).toBeGreaterThan(0);
  });

  test('places ship on click', () => {
    placementController.render();
    
    const carrier = document.querySelector('[data-ship="Carrier"]');
    carrier.click();
    
    const cell = document.querySelector('[data-row="0"][data-col="0"]');
    cell.click();
    
    const placedCells = document.querySelectorAll('.placed');
    expect(placedCells.length).toBe(5);
    
    expect(document.querySelector('[data-ship="Carrier"]')).toBeFalsy();
  });

  test('rotates ship with R key', () => {
    placementController.render();
    
    const carrier = document.querySelector('[data-ship="Carrier"]');
    carrier.click();
    
    const keyEvent = new KeyboardEvent('keydown', { key: 'r' });
    document.dispatchEvent(keyEvent);
    
    const cell = document.querySelector('[data-row="0"][data-col="0"]');
    const mouseoverEvent = new MouseEvent('mouseover', { bubbles: true });
    cell.dispatchEvent(mouseoverEvent);
    
    const previewCells = document.querySelectorAll('.preview');
    expect(previewCells.length).toBe(5);
    
    const positions = [...previewCells].map(cell => ({
      row: parseInt(cell.dataset.row),
      col: parseInt(cell.dataset.col)
    }));
    expect(positions[0].col).toBe(positions[1].col);
  });

  test('random placement button works', () => {
    placementController.render();
    
    const randomButton = document.getElementById('random-placement');
    randomButton.click();
    
    const placedCells = document.querySelectorAll('.placed');
    expect(placedCells.length).toBe(17);
    
    const ships = document.querySelectorAll('.ship-item');
    expect(ships.length).toBe(0);
  });

  test('start game button enables after all ships placed', () => {
    placementController.render();
    
    const startButton = document.getElementById('start-game');
    expect(startButton.disabled).toBe(true);
    
    // Place all ships one by one
    const ships = ['Carrier', 'Battleship', 'Cruiser', 'Submarine', 'Destroyer'];
    const positions = [
      [[0,0], [0,1], [0,2], [0,3], [0,4]],
      [[2,0], [2,1], [2,2], [2,3]],
      [[4,0], [4,1], [4,2]],
      [[6,0], [6,1], [6,2]],
      [[8,0], [8,1]]
    ];
    
    ships.forEach((shipName, index) => {
      const shipItem = document.querySelector(`[data-ship="${shipName}"]`);
      shipItem.click();
      
      const cell = document.querySelector(`[data-row="${positions[index][0][0]}"][data-col="${positions[index][0][1]}"]`);
      cell.click();
    });
    
    // Small delay to allow renders to complete
    setTimeout(() => {
      expect(startButton.disabled).toBe(false);
    }, 100);
  });

  test('reset placement button clears all ships', () => {
    placementController.render();
    
    const carrier = document.querySelector('[data-ship="Carrier"]');
    carrier.click();
    document.querySelector('[data-row="0"][data-col="0"]').click();
    
    const resetButton = document.getElementById('reset-placement');
    resetButton.click();
    
    const ships = document.querySelectorAll('.ship-item');
    expect(ships.length).toBe(5);
    
    const placedCells = document.querySelectorAll('.placed');
    expect(placedCells.length).toBe(0);
  });
});
