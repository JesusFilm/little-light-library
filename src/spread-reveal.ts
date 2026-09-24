/** One coherent spread is visible while loading; live popup construction is never exposed. */
export function spreadReveal(
  waiting: boolean,
  age: number,
  opening: boolean,
  reduced: boolean,
  hasSource: boolean,
  hasDestination: boolean,
) {
  if (waiting)
    return {
      stage: false,
      waitingPaper: hasSource,
      stationarySource: false,
      destinationPaper: false,
    };
  const turning = !opening && !reduced && age < 0.58;
  return {
    stage: !turning && (reduced || !opening || age >= 1.55),
    waitingPaper: false,
    stationarySource: turning && hasSource,
    destinationPaper: turning && hasDestination,
  };
}
