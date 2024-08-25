export function bankRound(value: number): number {
  const roundedValue = Math.round(value * 100) / 100;
  const decimalPart = roundedValue % 1;

  if (decimalPart === 0.5) {
    return Math.floor(roundedValue) % 2 === 0
      ? Math.floor(roundedValue)
      : Math.ceil(roundedValue);
  }

  return roundedValue;
}
