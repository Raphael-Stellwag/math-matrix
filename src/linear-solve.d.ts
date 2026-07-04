declare module 'linear-solve' {
  export function solve(matrix: number[][], vector: number[]): number[];
  export function invert(matrix: number[][]): number[][];
}
