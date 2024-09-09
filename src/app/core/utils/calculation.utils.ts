// export function bankRound(value: number): number {
//   const roundedValue = Math.round(value * 100) / 100;
//   const decimalPart = roundedValue % 1;

//   if (decimalPart === 0.5) {
//     return Math.floor(roundedValue) % 2 === 0
//       ? Math.floor(roundedValue)
//       : Math.ceil(roundedValue);
//   }

//   return roundedValue;
// }

export function bankRound(value: number): number {
  const factor = Math.pow(10, 2);
  const n = value * factor;
  const rounded = Math.round(n);
  const isHalfway = Math.abs(n - rounded) === 0.5;
  if (isHalfway) {
    return (Math.floor(n) % 2 === 0 ? Math.floor(n) : Math.ceil(n)) / factor;
  }
  return rounded / factor;
}
