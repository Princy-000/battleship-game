import SmartAI from '../SmartAI';
import Gameboard from '../../factories/Gameboard';
import Ship from '../../factories/Ship';

describe('SmartAI', () => {
  let ai;
  let gameboard;
  let enemyGameboard;

  beforeEach(() => {
    ai = SmartAI();
    gameboard = Gameboard();
    enemyGameboard = Gameboard();
    
    // Place a ship for testing
    const ship = Ship(3);
    enemyGameboard.placeShip([[2,2], [2,3], [2,4]], ship);
  });

  test('starts in search mode with random attacks', () => {
    const attack = ai.getNextAttack(enemyGameboard);
    
    expect(attack).toHaveLength(2);
    expect(attack[0]).toBeGreaterThanOrEqual(0);
    expect(attack[0]).toBeLessThan(10);
    expect(attack[1]).toBeGreaterThanOrEqual(0);
    expect(attack[1]).toBeLessThan(10);
  });

  test('switches to hunt mode after a hit', () => {
    // First attack hits
    ai.registerAttackResult([2,2], 'hit');
    
    // Next attack should be adjacent
    const nextAttack = ai.getNextAttack(enemyGameboard);
    const adjacentMoves = [[1,2], [3,2], [2,1], [2,3]];
    
    expect(adjacentMoves).toContainEqual(nextAttack);
  });

  test('tracks potential ship positions', () => {
    ai.registerAttackResult([2,2], 'hit');
    ai.registerAttackResult([2,3], 'hit');
    
    const potentialTargets = ai.getPotentialTargets();
    
    // Should include the next logical positions
    expect(potentialTargets).toContainEqual([2,1]);
    expect(potentialTargets).toContainEqual([2,4]);
    expect(potentialTargets).toContainEqual([1,2]);
    expect(potentialTargets).toContainEqual([3,2]);
  });

  test('does not repeat attacks', () => {
    ai.registerAttackResult([2,2], 'hit');
    ai.registerAttackResult([2,2], 'hit'); // Should ignore
    
    const nextAttack = ai.getNextAttack(enemyGameboard);
    expect(nextAttack).not.toEqual([2,2]);
  });

  test('returns to search mode after sinking ship', () => {
    // Hit a ship multiple times
    ai.registerAttackResult([2,2], 'hit');
    ai.registerAttackResult([2,3], 'hit');
    ai.registerAttackResult([2,4], 'sunk'); // Ship sunk
    
    // Should go back to random/search mode
    const attack = ai.getNextAttack(enemyGameboard);
    
    // Not necessarily adjacent to previous hits
    const isRandom = attack[0] >= 0 && attack[0] < 10 && attack[1] >= 0 && attack[1] < 10;
    expect(isRandom).toBe(true);
  });

  test('handles multiple ships correctly', () => {
    // Hit first ship
    ai.registerAttackResult([2,2], 'hit');
    
    // While hunting, hit a different ship
    ai.registerAttackResult([5,5], 'hit');
    
    const potentialTargets = ai.getPotentialTargets();
    
    // Should track both ships' potential positions
    expect(potentialTargets.length).toBeGreaterThan(0);
  });

  test('prioritizes direction after two hits', () => {
    // Two hits in same direction
    ai.registerAttackResult([2,2], 'hit');
    ai.registerAttackResult([2,3], 'hit');
    
    const nextAttack = ai.getNextAttack(enemyGameboard);
    
    // Should prioritize continuing in same direction
    expect(nextAttack).toEqual([2,4]);
  });

  test('tries opposite direction if first direction fails', () => {
    ai.registerAttackResult([2,2], 'hit');
    ai.registerAttackResult([2,3], 'hit');
    
    // Mock that [2,4] is already attacked
    ai.registerAttackResult([2,4], 'miss');
    
    const nextAttack = ai.getNextAttack(enemyGameboard);
    
    // Should try opposite direction
    expect(nextAttack).toEqual([2,1]);
  });
});
