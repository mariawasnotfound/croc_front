<template>
  <transition name="fade">
    <div 
      v-if="visible"
      class="fullscreen-menu-overlay"
      @click.self="close"
    >
      <div class="fullscreen-menu">
        <button class="close-button" @click="close">×</button>
        
        <div class="user-info">
          <h2>{{ user.name }}</h2>
          <p>{{ user.position }}</p>
          <p>{{ user.organization }}</p>
        </div>

        <nav class="menu-nav">
          <ul class="menu-items">
            <li 
              v-for="item in menuItems" 
              :key="item.route"
              @click="navigateTo(item.route)"
              :class="{ active: isActive(item.route) }"
            >
              <span class="menu-icon">{{ item.icon }}</span>
              <span class="menu-text">{{ item.text }}</span>
            </li>
          </ul>
        </nav>

        <div class="menu-footer">
          <button class="logout-button" @click="logout">
            <span class="logout-icon">⎋</span>
            Выйти из системы
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    user: {
      type: Object,
      required: true,
      default: () => ({
        name: '',
        position: '',
        organization: ''
      })
    }
  },

  data() {
    return {
      menuItems: [
        { route: '/main', text: 'Главная', icon: '⌂' },
        { route: '/schedule', text: 'Расписание', icon: '⏰' },
        { route: '/patients', text: 'Пациенты', icon: '⚕' },
        { route: '/reports', text: 'Отчеты', icon: '📊' },
        { route: '/settings', text: 'Настройки', icon: '⚙' }
      ]
    }
  },

  methods: {
    close() {
      this.$emit('close')
    },

    navigateTo(route) {
      this.close()
      this.$router.push(route)
    },

    logout() {
      this.close()
      this.$emit('logout')
    },

    isActive(route) {
      return this.$route.path === route
    }
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.fullscreen-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
}

.fullscreen-menu {
  background-color: #fff;
  width: 90%;
  max-width: 500px;
  height: 90%;
  border-radius: 15px;
  padding: 30px;
  position: relative;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 30px;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  transition: color 0.2s;
}

.close-button:hover {
  color: #333;
}

.user-info {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.user-info h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.user-info p {
  margin: 5px 0 0;
  color: #666;
  font-size: 16px;
}

.menu-nav {
  flex: 1;
  overflow-y: auto;
}

.menu-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-items li {
  padding: 15px 20px;
  margin: 5px 0;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}

.menu-items li:hover {
  background-color: #f5f5f5;
}

.menu-items li.active {
  background-color: #e3f2fd;
  color: #1976d2;
}

.menu-icon {
  font-size: 22px;
  margin-right: 15px;
  width: 24px;
  text-align: center;
}

.menu-text {
  font-size: 18px;
}

.menu-footer {
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.logout-button {
  background: none;
  border: none;
  color: #f44336;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 5px;
  transition: background-color 0.2s;
}

.logout-button:hover {
  background-color: #ffebee;
}

.logout-icon {
  margin-right: 10px;
  font-size: 18px;
}

@media (max-width: 600px) {
  .fullscreen-menu {
    width: 95%;
    height: 95%;
    padding: 20px;
  }
  
  .menu-text {
    font-size: 16px;
  }
}
</style>