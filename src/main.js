import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import VCalendar from 'v-calendar'

const app = createApp(App).mount('#app')
app.use(VCalendar, {})
app.mount('#app')
