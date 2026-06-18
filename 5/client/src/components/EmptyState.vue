<template>
  <div class="empty-state">
    <div class="empty-icon">📝</div>
    <p class="empty-text">暂无记账记录</p>
    <p class="empty-hint">点击上方"添加记录"开始记账吧！</p>
  </div>
</template>

<style scoped>
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #bbb;
}
.empty-icon {
  font-size: 56px;
  margin-bottom: 16px;
}
.empty-text {
  font-size: 18px;
  color: #999;
  margin-bottom: 8px;
}
.empty-hint {
  font-size: 14px;
  color: #bbb;
}
</style>
