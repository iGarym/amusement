/**
 * 判断数独是否合法
 * NOTE: 合法不代表有解
 */

type PartialSudokuGroup = (number | null)[]
type PartialSudokuGrid = PartialSudokuGroup[]
type SudokuGrid = number[][]

function isValidGroup(group: PartialSudokuGroup): boolean {
  const values = group.filter((n): n is number => n !== null)
  return new Set(values).size === values.length
}

function isValidSudoku(board: PartialSudokuGrid): boolean {
  // 检查行
  for (const row of board) {
    if (!isValidGroup(row)) {
      return false
    }
  }

  // 检查列
  for (let col = 0; col < 9; col++) {
    const column = board.map((row) => row[col])
    if (!isValidGroup(column)) {
      return false
    }
  }

  // 检查 3x3 子网格
  for (let rowStart = 0; rowStart < 9; rowStart += 3) {
    for (let colStart = 0; colStart < 9; colStart += 3) {
      const subgrid = []
      for (let row = rowStart; row < rowStart + 3; row++) {
        for (let col = colStart; col < colStart + 3; col++) {
          subgrid.push(board[row][col])
        }
      }
      if (!isValidGroup(subgrid)) {
        return false
      }
    }
  }

  // 如果所有检查都通过，则数独有效
  return true
}

function backtrackSudoku(board: PartialSudokuGrid): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        for (let num = 1; num <= 9; num++) {
          if (isValidPlacement(board, row, col, num)) {
            board[row][col] = num
            if (backtrackSudoku(board)) {
              return true
            }
            board[row][col] = null
          }
        }
        return false
      }
    }
  }
  return true
}

function isValidPlacement(
  board: PartialSudokuGrid,
  row: number,
  col: number,
  num: number
): boolean {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) return false
    if (board[i][col] === num) return false
    const subRow = 3 * Math.floor(row / 3) + Math.floor(i / 3)
    const subCol = 3 * Math.floor(col / 3) + (i % 3)
    if (board[subRow][subCol] === num) return false
  }
  return true
}

export function solveSudoku(board: PartialSudokuGrid): SudokuGrid {
  if (!isValidSudoku(board)) {
    throw new Error('当前数独不合法')
  }

  const newBoard = board.map((row) => row.slice()) as PartialSudokuGrid

  if (backtrackSudoku(newBoard)) {
    return newBoard as SudokuGrid
  } else {
    throw new Error('当前数独无有效解')
  }
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const res: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size))
  }
  return res
}

export function clamp(num: number, [min, max]: [number, number]): number {
  return Math.min(Math.max(num, min), max)
}
