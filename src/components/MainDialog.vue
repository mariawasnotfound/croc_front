<template>
  <div class="main-dialog">
    <!-- Шапка с информацией о сотруднике -->
    <div class="header">
      <div class="title">
        {{ organizationName }} / {{ departmentName }} / {{ position }}: {{ staffName }}
      </div>
    </div>

    <!-- Блок фильтров и выбора даты -->
    <div class="filters">
      <div class="date-controls">
        <button class="arrow-button" @click="shiftPeriod(-1)" aria-label="Предыдущий период">←</button>

        <div class="date-input-container">
          <input 
            v-model="dateRange" 
            type="text" 
            placeholder="ДД.ММ.ГГ - ДД.ММ.ГГ"
            class="date-input"
            readonly
            aria-label="Диапазон дат"
          >
          <button class="calendar-button" @click="toggleCalendar" aria-label="Открыть календарь">📅</button>

          <!-- Календарь с возможностью выбора периода -->
          <v-date-picker
            v-if="calendarVisible"
            v-model="calendarRange"
            is-range
            :mode="periodType === 'day' ? 'single' : 'range'"
            :popover="{ visibility: 'click' }"
            @clickOutside="calendarVisible = false"
          />
        </div>

        <button class="arrow-button" @click="shiftPeriod(1)" aria-label="Следующий период">→</button>
      </div>

      <!-- Выбор типа периода -->
      <div class="period-type">
        <button 
          :class="{ active: periodType === 'day' }" 
          @click="setPeriodType('day')"
        >
          День
        </button>
        <button 
          :class="{ active: periodType === 'week' }" 
          @click="setPeriodType('week')"
        >
          Неделя
        </button>
      </div>
    </div>

    <!-- Журнал задач -->
    <div class="journal">
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Дата и время задачи</th>
            <th>Пациент</th>
            <th>Дата рождения</th>
            <th>Палата</th>
            <th>Измерения</th>
            <th>Лек. препараты</th>
            <th>Диета</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(task, index) in filteredTasks" 
            :key="index" 
            :class="{ inactive: task.inactive }"
          >
            <td> 
              <input 
                type="checkbox" 
                v-model="task.inactive" 
                @change="onTaskCheck(task)"
                :id="'task-checkbox-' + index"
              >
              <label :for="'task-checkbox-' + index" class="visually-hidden">Отметить задачу как выполненную</label>
            </td>
            <td>{{ formatDateTime(task.dateTime) }}</td>
            <td>{{ task.patient }}</td>
            <td>{{ formatDate(task.birthDate) }}</td>
            <td>{{ task.room }}</td>
            <td>{{ task.measurements }}</td>
            <td>{{ task.medications }}</td>
            <td>{{ task.diet }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { fetchStaffInfo } from '../request/staff.js';
import { fetchTasks } from '../request/tasks.js';

export default {
  props: {
    organizationId: {
      type: String,
      required: true
    },
    departmentId: {
      type: String,
      required: true
    }
  },
  
  data() {
    const today = new Date();
    const dateStr = this.formatDate(today);

    return {
      organizationName: '',
      departmentName: '',
      position: '',
      staffName: '',
      tasks: [],
      dateRange: `${dateStr} - ${dateStr}`,
      periodType: 'day',
      calendarVisible: false,
      calendarRange: {
        start: today,
        end: today
      },
      isLoading: false,
      error: null
    };
  },

  computed: {
    filteredTasks() {
      const [startStr, endStr] = this.dateRange.split(' - ');
      const startDate = this.parseDate(startStr);
      const endDate = this.parseDate(endStr);

      return this.tasks.filter(task => {
        const taskDate = this.parseDate(task.dateTime);
        if (taskDate < startDate || taskDate > endDate) return false;
        return true;
      });
    }
  },

  watch: {
    calendarRange(val) {
      if (val?.start && val?.end) {
        if (this.periodType === 'day') {
          this.dateRange = `${this.formatDate(val.start)} - ${this.formatDate(val.start)}`;
        } else {
          this.dateRange = `${this.formatDate(val.start)} - ${this.formatDate(val.end)}`;
        }
      }
    },
    periodType(newVal) {
      if (newVal === 'day') {
        const dateStr = this.formatDate(new Date());
        this.dateRange = `${dateStr} - ${dateStr}`;
      } else {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        this.dateRange = `${this.formatDate(startOfWeek)} - ${this.formatDate(endOfWeek)}`;
      }
    }
  },

  async mounted() {
    await this.loadData();
  },
  
  methods: {
    // Загрузка всех данных
    async loadData() {
      this.isLoading = true;
      try {
        await Promise.all([this.loadStaffInfo(), this.loadTasks()]);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        this.error = 'Не удалось загрузить данные';
      } finally {
        this.isLoading = false;
      }
    },

    // Форматирование даты
    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('ru-RU');
    },
    
    // Форматирование даты и времени
    formatDateTime(datetime) {
      if (!datetime) return '';
      const d = new Date(datetime);
      return d.toLocaleString('ru-RU');
    },
    
    // Парсинг даты из строки
    parseDate(dateStr) {
      if (!dateStr) return new Date();
      const [day, month, year] = dateStr.split('.');
      return new Date(`${year}-${month}-${day}T00:00:00`);
    },

    // Загрузка информации о сотруднике
    async loadStaffInfo() {
      try {
        const staffInfo = await fetchStaffInfo(this.organizationId, this.departmentId);

        if (staffInfo) {
          this.organizationName = staffInfo.organizationName || 'Не указано';
          this.departmentName = staffInfo.departmentName || 'Не указано';
          this.position = staffInfo.position || 'Не указано';
          this.staffName = `${staffInfo.surname || ''} ${staffInfo.name || ''} ${staffInfo.lastname || ''}`.trim();
        }
      } catch (error) {
        console.error('Ошибка загрузки информации о сотруднике:', error);
        throw error;
      }
    },
    
    // Загрузка задач
    async loadTasks() {
      try {
        const tasks = await fetchTasks(
          this.organizationId,
          this.departmentId
        );
        this.tasks = tasks.map(task => ({ ...task, inactive: false }));
      } catch (error) {
        console.error('Ошибка загрузки задач:', error);
        throw error;
      }
    },
    
    // Обработка отметки задачи
    onTaskCheck(task) {
      fetch('/api/update-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          taskId: task.id,
          inactive: task.inactive
        }),
        credentials: "include"
      }).catch(error => {
        console.error('Ошибка при обновлении задачи:', error);
        task.inactive = !task.inactive; // Откат изменения
      });
    },

    // Сдвиг периода
    shiftPeriod(direction) {
      const [startStr, endStr] = this.dateRange.split(' - ');
      let startDate = this.parseDate(startStr);
      let endDate = this.parseDate(endStr);
      
      if (this.periodType === 'day') {
        startDate.setDate(startDate.getDate() + direction);
        endDate = new Date(startDate);
      } else {
        const diff = endDate - startDate;
        startDate.setDate(startDate.getDate() + (direction * 7));
        endDate = new Date(startDate.getTime() + diff);
      }

      this.dateRange = `${this.formatDate(startDate)} - ${this.formatDate(endDate)}`;
      this.calendarRange = { start: startDate, end: endDate };
    },
    
    // Установка типа периода
    setPeriodType(type) {
      this.periodType = type;
    },

    // Переключение календаря
    toggleCalendar() {
      this.calendarVisible = !this.calendarVisible;
    }
  }
};
</script>

<style scoped>
/* Стили остаются такими же, как в вашем исходном коде */
.main-dialog {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 5px;
}

.date-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-input-container {
  position: relative;
}

.date-input {
  padding: 8px 30px 8px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 200px;
}

.calendar-button {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
}

.arrow-button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

.period-type {
  display: flex;
  gap: 10px;
}

.period-type button {
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.period-type button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.journal {
  overflow-x: auto;
}

.inactive {
  color: gray;
  text-decoration: line-through;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
  position: sticky;
  top: 0;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>