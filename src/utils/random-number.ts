/**
 * @module random.js
 * @description
 * This functions return random numbers. Simple as that.
 * @author pgSystemTester
 * @see {@link https://stackoverflow.com/a/1527820/6814267}
 */

/**
 * @function getRandomArbitrary
 * @param {Number} min - minimum possible value of generated number @default 1000000
 * @param {Number} max - maximum possible value of generated number @default 10000000
 * @returns Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomArbitrary(min:number = 1000000, max:number = 10000000): number {
  return Math.random() * (max - min) + min
}

/**
 * @function getRandomInt
 * @param {Number} min - minimum possible value of generated number @default 1000000
 * @param {Number} max - maximum possible value of generated number @default 10000000
 * @returns
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min:number = 1000000, max:number = 10000000): number {
  const minVal = Math.ceil(min)
  const maxVal = Math.floor(max)
  return Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal
}

export { getRandomArbitrary, getRandomInt }
