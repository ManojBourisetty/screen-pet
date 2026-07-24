export const HOUSE_MARGIN_X = 28;
export const HOUSE_MARGIN_BOTTOM = 18;
export const HOUSE_WIDTH = 96;
export const HOUSE_HEIGHT = 86;

// Puppy footprint is ~140x108 and motion.js clamps its top-left y to at most
// (bounds.height - 12 - 108). Keep house/bowl targets a little above that so
// the puppy visually reaches the ground line without being re-clamped upward.
const GROUND_Y_OFFSET = 132;

export function getHousePosition(bounds) {
  return {
    x: HOUSE_MARGIN_X,
    y: bounds.height - HOUSE_MARGIN_BOTTOM - HOUSE_HEIGHT,
  };
}

export function getHouseFrontSpot(bounds) {
  const house = getHousePosition(bounds);
  return { x: house.x + HOUSE_WIDTH * 0.55, y: bounds.height - GROUND_Y_OFFSET };
}

export function getBowlSpot(bounds) {
  const house = getHousePosition(bounds);
  return { x: house.x + HOUSE_WIDTH + 40, y: bounds.height - GROUND_Y_OFFSET };
}
