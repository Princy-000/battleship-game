import Ship from '../Ship.js';

describe('Ship Factory', () => {
  test('creates a ship with given length', () => {
    const ship = Ship(3);
    expect(ship.length).toBe(3);
  });

  test('initializes with 0 hits', () => {
    const ship = Ship(3);
    expect(ship.hits).toBe(0);
  });

  test('hit() increases hits count', () => {
    const ship = Ship(3);
    ship.hit();
    expect(ship.hits).toBe(1);
  });

  test('isSunk() returns false when hits < length', () => {
    const ship = Ship(3);
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(false);
  });

  test('isSunk() returns true when hits >= length', () => {
    const ship = Ship(2);
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(true);
  });
});
