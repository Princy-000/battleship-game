function SmartAI() {
  // Track all attacked coordinates
  const attacked = new Set();
  
  // Track hits that haven't been fully explored
  const hits = [];
  const hitMap = new Map(); // Track direction for each hit chain
  
  // Current hunting state
  let currentShipHits = [];
  let currentDirection = null;
  let lastHit = null;

  function getNextAttack(enemyGameboard) {
    // If we're hunting a ship
    if (currentShipHits.length > 0) {
      const nextTarget = getNextHuntTarget();
      if (nextTarget) return nextTarget;
    }
    
    // If we have hits to explore
    if (hits.length > 0) {
      const [row, col] = hits[0];
      
      // Try each direction in order
      const directions = [[-1,0], [1,0], [0,-1], [0,1]];
      
      for (let [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        const key = `${newRow},${newCol}`;
        
        if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10 && !attacked.has(key)) {
          return [newRow, newCol];
        }
      }
      
      // If all directions tried, remove this hit
      hits.shift();
      return getNextAttack(enemyGameboard);
    }
    
    // Random attack
    let row, col, key;
    do {
      row = Math.floor(Math.random() * 10);
      col = Math.floor(Math.random() * 10);
      key = `${row},${col}`;
    } while (attacked.has(key));
    
    return [row, col];
  }

  function getNextHuntTarget() {
    if (currentShipHits.length === 0) return null;
    
    // Determine direction from first two hits
    if (currentShipHits.length === 1) {
      // Try all directions from the first hit
      const [row, col] = currentShipHits[0];
      const directions = [[-1,0], [1,0], [0,-1], [0,1]];
      
      for (let [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        const key = `${newRow},${newCol}`;
        
        if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10 && !attacked.has(key)) {
          return [newRow, newCol];
        }
      }
    } else {
      // We have at least 2 hits, determine direction
      const [r1, c1] = currentShipHits[0];
      const [r2, c2] = currentShipHits[1];
      
      const dr = r2 - r1;
      const dc = c2 - c1;
      
      // Try continuing in same direction
      const lastHit = currentShipHits[currentShipHits.length - 1];
      const nextRow = lastHit[0] + dr;
      const nextCol = lastHit[1] + dc;
      const nextKey = `${nextRow},${nextCol}`;
      
      if (nextRow >= 0 && nextRow < 10 && nextCol >= 0 && nextCol < 10 && !attacked.has(nextKey)) {
        return [nextRow, nextCol];
      }
      
      // Try opposite direction
      const firstHit = currentShipHits[0];
      const oppRow = firstHit[0] - dr;
      const oppCol = firstHit[1] - dc;
      const oppKey = `${oppRow},${oppCol}`;
      
      if (oppRow >= 0 && oppRow < 10 && oppCol >= 0 && oppCol < 10 && !attacked.has(oppKey)) {
        return [oppRow, oppCol];
      }
    }
    
    // If no valid targets, clear hunting state
    currentShipHits = [];
    return null;
  }

  function registerAttackResult(coordinates, result) {
    const [row, col] = coordinates;
    const key = `${row},${col}`;
    
    // Track attacked coordinates
    attacked.add(key);
    
    if (result === 'hit') {
      // Add to current ship hits
      currentShipHits.push([row, col]);
      lastHit = [row, col];
      
      // Also add to hits stack for fallback
      hits.push([row, col]);
    } else if (result === 'sunk') {
      // Clear current hunting state
      currentShipHits = [];
      currentDirection = null;
      lastHit = null;
      
      // Remove related hits from stack (simplified)
      hits.length = 0;
    }
  }

  function getPotentialTargets() {
    const targets = [];
    
    // Add current hunt targets
    if (currentShipHits.length > 0) {
      const nextTarget = getNextHuntTarget();
      if (nextTarget) targets.push(nextTarget);
    }
    
    // Add hits stack targets
    for (let [row, col] of hits) {
      const directions = [[-1,0], [1,0], [0,-1], [0,1]];
      for (let [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        const key = `${newRow},${newCol}`;
        if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10 && !attacked.has(key)) {
          targets.push([newRow, newCol]);
        }
      }
    }
    
    return targets;
  }

  return {
    getNextAttack,
    registerAttackResult,
    getPotentialTargets
  };
}

export default SmartAI;
