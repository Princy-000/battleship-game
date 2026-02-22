import GameController from './GameController.js';
import DOMController from './DOMController.js';
import Ship from '../factories/Ship.js';

function PlacementController(game, container) {
  console.log('PlacementController initialized with game:', game);
  let currentGame = game;
  let rootContainer = container;
  
  // Available ships to place
  const ships = [
    { name: 'Carrier', length: 5, placed: false },
    { name: 'Battleship', length: 4, placed: false },
    { name: 'Cruiser', length: 3, placed: false },
    { name: 'Submarine', length: 3, placed: false },
    { name: 'Destroyer', length: 2, placed: false }
  ];
  
  let selectedShip = null;
  let shipOrientation = 'horizontal';
  let placedShips = [];

  function render() {
    console.log('Rendering placement UI');
    rootContainer.innerHTML = '';
    
    const container = document.createElement('div');
    container.className = 'placement-container';
    
    // Title
    const title = document.createElement('h2');
    title.textContent = 'Place Your Ships';
    container.appendChild(title);
    
    // Instructions
    const instructions = document.createElement('p');
    instructions.className = 'instructions';
    instructions.innerHTML = 'Click a ship, then click on the grid to place. Press R to rotate.';
    container.appendChild(instructions);
    
    // Main layout
    const mainLayout = document.createElement('div');
    mainLayout.className = 'placement-layout';
    
    // Ship list on left
    const shipList = createShipList();
    mainLayout.appendChild(shipList);
    
    // Grid in center
    const grid = createPlacementGrid();
    mainLayout.appendChild(grid);
    
    container.appendChild(mainLayout);
    
    // Controls at bottom
    const controls = createControls();
    container.appendChild(controls);
    
    rootContainer.appendChild(container);
  }
  
  function createShipList() {
    const shipList = document.createElement('div');
    shipList.id = 'ship-list';
    shipList.className = 'ship-list';
    
    ships.forEach(ship => {
      if (!ship.placed) {
        const shipItem = document.createElement('div');
        shipItem.className = 'ship-item';
        shipItem.dataset.ship = ship.name;
        shipItem.textContent = `${ship.name} (${ship.length})`;
        
        shipItem.addEventListener('click', (e) => {
          e.stopPropagation();
          console.log('Ship selected:', ship.name);
          
          // Deselect previous
          if (selectedShip) {
            document.querySelectorAll('.ship-item').forEach(item => {
              item.classList.remove('selected');
            });
          }
          
          // Select this ship
          selectedShip = ship;
          shipItem.classList.add('selected');
        });
        
        shipList.appendChild(shipItem);
      }
    });
    
    return shipList;
  }
  
  function createPlacementGrid() {
    const grid = document.createElement('div');
    grid.id = 'placement-grid';
    grid.className = 'placement-grid';
    
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const cell = document.createElement('div');
        cell.className = 'placement-cell';
        cell.dataset.row = row;
        cell.dataset.col = col;
        
        // Check if this cell has a placed ship
        const isPlaced = placedShips.some(({ coords }) => 
          coords.some(([r, c]) => r === row && c === col)
        );
        
        if (isPlaced) {
          cell.classList.add('placed');
        }
        
        // Add hover preview
        cell.addEventListener('mouseover', () => handleCellHover(row, col));
        cell.addEventListener('mouseout', handleCellOut);
        cell.addEventListener('click', (e) => {
          e.stopPropagation();
          console.log('Cell clicked:', row, col);
          handleCellClick(row, col);
        });
        
        grid.appendChild(cell);
      }
    }
    
    return grid;
  }
  
  function createControls() {
    const controls = document.createElement('div');
    controls.className = 'placement-controls';
    
    // Random placement button
    const randomBtn = document.createElement('button');
    randomBtn.id = 'random-placement';
    randomBtn.textContent = 'Random Placement';
    randomBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleRandomPlacement();
    });
    controls.appendChild(randomBtn);
    
    // Reset button
    const resetBtn = document.createElement('button');
    resetBtn.id = 'reset-placement';
    resetBtn.textContent = 'Reset';
    resetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleReset();
    });
    controls.appendChild(resetBtn);
    
    // Start game button
    const startBtn = document.createElement('button');
    startBtn.id = 'start-game';
    startBtn.textContent = 'Start Game';
    startBtn.disabled = !allShipsPlaced();
    startBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleStartGame();
    });
    controls.appendChild(startBtn);
    
    return controls;
  }
  
  function handleCellHover(row, col) {
    if (!selectedShip) return;
    
    // Clear previous preview
    document.querySelectorAll('.placement-cell').forEach(cell => {
      cell.classList.remove('preview', 'invalid');
    });
    
    // Generate preview coordinates
    const coords = [];
    for (let i = 0; i < selectedShip.length; i++) {
      if (shipOrientation === 'horizontal') {
        coords.push([row, col + i]);
      } else {
        coords.push([row + i, col]);
      }
    }
    
    // Check if placement is valid
    const isValid = isValidPlacement(coords);
    
    // Highlight preview cells
    coords.forEach(([r, c]) => {
      const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
      if (cell) {
        cell.classList.add('preview');
        if (!isValid) {
          cell.classList.add('invalid');
        }
      }
    });
  }
  
  function handleCellOut() {
    document.querySelectorAll('.placement-cell').forEach(cell => {
      cell.classList.remove('preview', 'invalid');
    });
  }
  
  function handleCellClick(row, col) {
    console.log('handleCellClick called with', row, col, 'selectedShip:', selectedShip);
    console.log('currentGame:', currentGame);
    
    if (!selectedShip) {
      console.log('No ship selected');
      return;
    }
    
    if (!currentGame || !currentGame.humanPlayer) {
      console.log('Game not properly initialized');
      return;
    }
    
    // Generate ship coordinates
    const coords = [];
    for (let i = 0; i < selectedShip.length; i++) {
      if (shipOrientation === 'horizontal') {
        coords.push([row, col + i]);
      } else {
        coords.push([row + i, col]);
      }
    }
    
    console.log('Attempting to place ship at:', coords);
    
    // Check if placement is valid
    if (!isValidPlacement(coords)) {
      console.log('Invalid placement');
      return;
    }
    
    // Create REAL ship using Ship factory
    const ship = Ship(selectedShip.length);
    
    try {
      console.log('Calling placeShip on humanPlayer');
      currentGame.humanPlayer.placeShip(coords, ship);
      console.log('Ship placed successfully');
      
      // Mark ship as placed
      selectedShip.placed = true;
      placedShips.push({ ship: selectedShip, coords });
      
      // Clear selection
      selectedShip = null;
      
      // Update start button state
      const startBtn = document.getElementById('start-game');
      if (startBtn) {
        startBtn.disabled = !allShipsPlaced();
      }
      
      // Re-render
      render();
    } catch (error) {
      console.log('Error placing ship:', error.message);
    }
  }
  
  function isValidPlacement(coords) {
    // Check bounds
    for (let [r, c] of coords) {
      if (r < 0 || r >= 10 || c < 0 || c >= 10) {
        console.log('Out of bounds:', r, c);
        return false;
      }
    }
    
    // Check overlap with placed ships
    for (let [r, c] of coords) {
      const isOccupied = placedShips.some(({ coords: shipCoords }) =>
        shipCoords.some(([sr, sc]) => sr === r && sc === c)
      );
      if (isOccupied) {
        console.log('Cell occupied:', r, c);
        return false;
      }
    }
    
    return true;
  }
  
  function allShipsPlaced() {
    return ships.every(ship => ship.placed);
  }
  
  function handleRandomPlacement() {
    console.log('Random placement clicked');
    
    // Create a completely new game instance
    const newGame = GameController('Player 1', { skipDefaultShips: true });
    currentGame = newGame;
    
    // Reset ships array completely
    ships.forEach(ship => { ship.placed = false; });
    placedShips = [];
    selectedShip = null;
    
    // Make a copy of ships to place
    const shipsToPlace = [...ships];
    
    // Place each ship randomly
    shipsToPlace.forEach(ship => {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 1000;
      
      while (!placed && attempts < maxAttempts) {
        const row = Math.floor(Math.random() * 10);
        const col = Math.floor(Math.random() * 10);
        const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
        
        const coords = [];
        for (let i = 0; i < ship.length; i++) {
          if (orientation === 'horizontal') {
            coords.push([row, col + i]);
          } else {
            coords.push([row + i, col]);
          }
        }
        
        // Check if placement is valid on the new board
        let valid = true;
        for (let [r, c] of coords) {
          if (r < 0 || r >= 10 || c < 0 || c >= 10) {
            valid = false;
            break;
          }
          // Check against already placed ships in this session
          const isOccupied = placedShips.some(({ coords: shipCoords }) =>
            shipCoords.some(([sr, sc]) => sr === r && sc === c)
          );
          if (isOccupied) {
            valid = false;
            break;
          }
        }
        
        if (valid) {
          const shipObj = Ship(ship.length);
          currentGame.humanPlayer.placeShip(coords, shipObj);
          ship.placed = true;
          placedShips.push({ ship, coords });
          placed = true;
          console.log(`Randomly placed ${ship.name} at`, coords);
        }
        
        attempts++;
      }
      
      if (!placed) {
        console.log(`Failed to place ${ship.name} randomly, retrying...`);
        // If we failed to place a ship, restart the whole process
        handleRandomPlacement();
        return;
      }
    });
    
    render();
  }
  
  function handleReset() {
    console.log('Reset clicked');
    
    // Create fresh game
    currentGame = GameController('Player 1', { skipDefaultShips: true });
    
    // Reset ships
    ships.forEach(ship => { ship.placed = false; });
    placedShips = [];
    selectedShip = null;
    
    render();
  }
  
  function handleStartGame() {
    console.log('Start game clicked, all ships placed:', allShipsPlaced());
    if (allShipsPlaced()) {
      // Hide placement UI and show game
      rootContainer.innerHTML = '';
      
      // Create game container
      const gameContainer = document.createElement('div');
      gameContainer.id = 'game-container';
      rootContainer.appendChild(gameContainer);
      
      // Place computer ships randomly using REAL Ship factory
      const computerShipConfigs = [
        { length: 5 },
        { length: 4 },
        { length: 3 },
        { length: 3 },
        { length: 2 }
      ];
      
      computerShipConfigs.forEach(({ length }) => {
        let placed = false;
        let attempts = 0;
        
        while (!placed && attempts < 1000) {
          const row = Math.floor(Math.random() * 10);
          const col = Math.floor(Math.random() * 10);
          const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
          
          const coords = [];
          for (let i = 0; i < length; i++) {
            if (orientation === 'horizontal') {
              coords.push([row, col + i]);
            } else {
              coords.push([row + i, col]);
            }
          }
          
          // Check if placement is valid on computer's board
          let valid = true;
          for (let [r, c] of coords) {
            if (r < 0 || r >= 10 || c < 0 || c >= 10) {
              valid = false;
              break;
            }
            if (currentGame.computerPlayer.gameboard.board[r][c] !== null) {
              valid = false;
              break;
            }
          }
          
          if (valid) {
            const shipObj = Ship(length);
            currentGame.computerPlayer.placeShip(coords, shipObj);
            placed = true;
          }
          
          attempts++;
        }
      });
      
      console.log('Game started with:', {
        humanShips: currentGame.humanPlayer.gameboard.ships.length,
        computerShips: currentGame.computerPlayer.gameboard.ships.length
      });
      
      // Initialize and render game
      const domController = DOMController(currentGame, gameContainer);
      domController.render();
    }
  }
  
  // Keyboard controls for rotation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
      console.log('Rotating ship');
      shipOrientation = shipOrientation === 'horizontal' ? 'vertical' : 'horizontal';
      
      // Update preview if hovering
      const hoveredCell = document.querySelector('.placement-cell:hover');
      if (hoveredCell && selectedShip) {
        const row = parseInt(hoveredCell.dataset.row);
        const col = parseInt(hoveredCell.dataset.col);
        handleCellHover(row, col);
      }
    }
  });
  
  // Store reference for debugging
  if (typeof window !== 'undefined') {
    window.debug = window.debug || {};
    window.debug.placementController = this;
    window.debug.placementShips = ships;
    window.debug.placedShips = placedShips;
  }
  
  return {
    render,
    // For testing
    setGame: (newGame) => { currentGame = newGame; }
  };
}

export default PlacementController;
