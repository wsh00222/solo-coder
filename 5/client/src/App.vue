<template>
  <LedgerView />
</template>

<script setup>
import LedgerView from './views/LedgerView.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f0f2f5;
  color: #333;
  -webkit-font-smoothing: antialiased;
}
.ledger-app {
  max-width: 860px;
  margin: 0 auto;
  padding: 24px 16px;
}
</style>
