import Player from './Player.js';
import SmartAI from '../modules/SmartAI.js';

function SmartComputerPlayer(name = 'Smart Computer') {
  const player = Player('computer', name);
  const ai = SmartAI();
  
  // Override the makeRandomAttack to use smart targeting
  const originalMakeRandomAttack = player.makeRandomAttack;
  
  player.makeRandomAttack = function(enemyBoard) {
    // Use AI to get next attack
    const attack = ai.getNextAttack(enemyBoard);
    
    // Simulate the attack to register result (will be done by GameController)
    // We'll register the result later when we know it
    
    return attack;
  };
  
  // Add method to register attack results
  player.registerAttackResult = function(coordinates, result) {
    ai.registerAttackResult(coordinates, result);
  };
  
  // Add method to get potential targets (for debugging)
  player.getPotentialTargets = function() {
    return ai.getPotentialTargets();
  };
  
  return player;
}

export default SmartComputerPlayer;
