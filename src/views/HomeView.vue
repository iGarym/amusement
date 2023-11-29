<script setup lang="ts"></script>

<template>
  <main min-h-screen text-center>
    <div inline-flex flex-col items-center gap-8 pt-20vh md:(flex-row pt-30vh)>
      <img w-28 src="@/assets/logo.svg" />
      <ul list-circle text-left>
        <li>
          <router-link to="/bg1">Interactive Background 1.</router-link>
        </li>
      </ul>
    </div>
  </main>
</template>

<style scoped>
a {
  --at-apply: underline underline-offset-2 decoration-dotted;
}
</style>
