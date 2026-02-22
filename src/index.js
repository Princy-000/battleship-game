import GameController from './modules/GameController.js';
import PlacementController from './modules/PlacementController.js';
import './../public/css/styles.css';

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const gameContainer = document.getElementById('app');
  
  // Create game container if it doesn't exist
  if (!gameContainer) {
    const container = document.createElement('div');
    container.id = 'app';
    document.body.appendChild(container);
  }
  
  // Create game instance with no ships initially
  const game = GameController('Player 1', { skipDefaultShips: true });
  
  // Show placement UI first
  const placementController = PlacementController(game, document.getElementById('app'));
  placementController.render();
  
  console.log('Battleship placement UI initialized!');
});
