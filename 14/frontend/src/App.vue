<template>
  <div id="app-root">
    <el-container class="app-container">
      <el-header class="app-header">
        <div class="header-inner">
          <div class="brand" @click="router.push('/')">
            <el-icon :size="24" color="#409EFF"><Tools /></el-icon>
            <span class="brand-name">设备借用登记系统</span>
          </div>
          <div class="header-nav">
            <router-link to="/equipment" class="nav-link">
              <el-icon><Grid /></el-icon>
              <span>设备管理</span>
            </router-link>
          </div>
        </div>
      </el-header>
      <el-main class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
      <el-footer class="app-footer">
        <span>© 2024 设备借用登记系统 | 数据持久化存储</span>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Tools, Grid } from '@element-plus/icons-vue'

const router = useRouter()
</script>

<style>
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  background-color: #f5f7fa;
  color: #303133;
  -webkit-font-smoothing: antialiased;
}

#app-root {
  min-height: 100vh;
}
</style>

<style scoped>
.app-container {
  min-height: 100vh;
}

.app-header {
  background: linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%);
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.06);
  padding: 0;
  height: 60px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1440px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.brand-name {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, #409EFF, #66b1ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.5px;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  color: #606266;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-link:hover {
  background-color: #ecf5ff;
  color: #409EFF;
}

.nav-link.router-link-active {
  background-color: #ecf5ff;
  color: #409EFF;
}

.app-main {
  background-color: #f5f7fa;
  padding: 0;
  min-height: calc(100vh - 60px - 50px);
}

.app-footer {
  background-color: #ffffff;
  border-top: 1px solid #ebeef5;
  height: 50px;
  line-height: 50px;
  text-align: center;
  color: #909399;
  font-size: 13px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .header-inner {
    padding: 0 16px;
  }
  .brand-name {
    font-size: 16px;
  }
  .nav-link span {
    display: none;
  }
}
</style>
