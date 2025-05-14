import { createApp } from 'vue';
import App from './App.vue';
import { setupCalendar, Calendar, DatePicker } from 'v-calendar';
import 'v-calendar/dist/style.css';

const app = createApp(App);

setupCalendar(app, {});

app.component('VCalendar', Calendar);
app.component('VDatePicker', DatePicker);

app.mount('#app');