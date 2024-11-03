export const sum = (array: Array<number | boolean>) => {
  return array.reduce((acc: number, curr) => {
    return acc + (curr as number);
  }, 0);
}
