/**
 * Converts a number of seconds into a time string in the format "00:00:00".
 * @param {number} seconds - The number of seconds to convert.
 * @returns {string} The duration in time string format.
 */
export function parseSeconds(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const hoursString = hours.toString().padStart(2, '0');
  const minutesString = minutes.toString().padStart(2, '0');
  const secondsString = remainingSeconds.toString().padStart(2, '0');

  return `${hoursString}:${minutesString}:${secondsString}`;
}
