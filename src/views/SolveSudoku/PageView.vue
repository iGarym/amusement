<script lang="ts" setup>
import { ref, shallowRef } from 'vue'
import { solveSudoku, chunk, clamp } from './utils'

const initCells = () => Array.from({ length: 81 }, () => null)

const state = shallowRef<(number | null)[]>(initCells())
const onChange = (evt: Event, idx: number) => {
  const value = Number((evt.target as HTMLInputElement).value)
  state.value[idx] = value ? clamp(value, [1, 9]) : null
}

const disabled = shallowRef<boolean>(false)
const result = shallowRef<number[]>([])

const reset = () => {
  state.value = initCells()
  result.value = []
}

const boardRef = ref()
const solve = () => {
  try {
    disabled.value = true
    const solution = solveSudoku(chunk(state.value, 9))
    result.value = solution.flat()
  } catch (error) {
    boardRef.value?.classList.add('flashing')
    setTimeout(() => {
      boardRef.value?.classList.remove('flashing')
    }, 2000)
  } finally {
    disabled.value = false
  }
}
</script>

<template>
  <div w-screen h-screen flex flex-col items-center pt-2vh sm:pt-15vh>
    <h1 p-4>Solve Sudoku</h1>

    <div flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4>
      <div ref="boardRef" class="board">
        <div v-for="(v, idx) of state" :key="idx" class="cell">
          <input
            class="input"
            :value="v"
            type="number"
            min="1"
            max="9"
            step="1"
            @change="(evt) => onChange(evt, idx)"
          />
        </div>
      </div>

      <div inline-flex flex-row gap-4 sm:flex-col>
        <button type="button" class="btn" :disabled="disabled" @click="solve">
          <svg
            class="w-4 h-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 10"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M1 5h12m0 0L9 1m4 4L9 9"
            />
          </svg>
        </button>

        <button type="button" class="btn" :disabled="disabled" @click="reset">
          <svg class="w-4 h-4" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
            <g
              fill="none"
              fill-rule="evenodd"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              transform="translate(2, 2)"
            >
              <path
                d="m12.5 1.5c2.4138473 1.37729434 4 4.02194088 4 7 0 4.418278-3.581722 8-8 8s-8-3.581722-8-8 3.581722-8 8-8"
              />
              <path d="m12.5 5.5v-4h4" />
            </g>
          </svg>
        </button>
      </div>

      <div class="board">
        <div v-for="v of 81" :key="v" class="cell">{{ result[v - 1] }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.board {
  --at-apply: grid grid-cols-9 w-64 h-64 bg-white;
}

.cell {
  --at-apply: border-l border-t border-solid text-center color-black;
}

.cell:nth-child(9n + 1) {
  --at-apply: border-l-0;
}

.cell:nth-child(-n + 9) {
  --at-apply: border-t-0;
}

.cell:nth-child(3n + 1) {
  --at-apply: border-l-coolgray;
}

.cell:nth-child(n + 1):nth-child(-n + 9),
.cell:nth-child(n + 28):nth-child(-n + 36),
.cell:nth-child(n + 55):nth-child(-n + 63) {
  --at-apply: border-t-coolgray;
}

.input {
  --at-apply: w-full h-full p-0 text-center outline-none focus:shadow-inner focus:shadow-zinc-500;
}
.input::-webkit-outer-spin-button,
.input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.btn {
  --at-apply: text-white bg-blue-700 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center me-2 transition-all duration-300 ease-in-out;
}
.btn:not(:disabled) {
  --at-apply: hover:bg-blue-800 active:ring-4 active:outline-none active:ring-blue-300;
}

.btn[disabled] {
  --at-apply: bg-coolgray-300 text-coolgray-500 cursor-not-allowed;
}

.flashing {
  animation: flashing 1s infinite;
}
@keyframes flashing {
  0% {
    box-shadow: 0 0 0 0 #fff;
  }

  50% {
    box-shadow: 0 0 14px 4px rgb(250, 142, 142);
  }

  100% {
    box-shadow: 0 0 0 0 #fff;
  }
}
</style>
