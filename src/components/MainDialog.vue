<template>
  <div class="main-dialog">
    <div class="header">
      <div class="title">
        {{ organizationName }} / {{ departmentName }} / {{ position }}: {{ staffName }}
      </div>
      <button class="menu-button" @click="toggleMenu">☰</button>
    </div>

    <div class="filters">
      <div class="date-controls">
        <button class="arrow-button" @click="shiftPeriod(-1)">←</button>

        <div class="date-input-container">
          <input 
            v-model="dateRange" 
            type="text" 
            placeholder="ДД.ММ.ГГ - ДД.ММ.ГГ"
            class="date-input"
            readonly
          >
          <button class="calendar-button" @click="toggleCalendar">📅</button>

          <v-date-picker
            v-if="calendarVisible"
            v-model="calendarRange"
            is-range
            :popover="{ visibility: 'click' }"
          />
        </div>

        <button class="arrow-button" @click="shiftPeriod(1)">→</button>
      </div>

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
          <tr v-for="(task, index) in filteredTasks" :key="index" 
          :class="{inactive: task.inactive}">
            <td> 
              <input type="checkbox" v-model="task.inactive" @change="onTaskCheck(task)">
            </td>
            <td>{{ task.dateTime }}</td>
            <td>{{ task.patient }}</td>
            <td>{{ task.birthDate }}</td>
            <td>{{ task.room }}</td>
            <td>{{ task.measurements }}</td>
            <td>{{ task.medications }}</td>
            <td>{{ task.diet }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    />
  </div>
</template>

<script>
import { fetchStaffInfo } from '../request/staff.js';
import { fetchTasks } from '../request/tasks.js';

export default {

  
  props: {
    token: String,
    organizationId: String,
    departmentId: String
  },
  
  data() {
    const today = new Date();
    const dateStr = today.toLocaleDateString('ru-RU');

    return {
      organizationName: '',
      departmentName: '',
      position: '',
      staffName: '',
      tasks: [],
      dateRange: `${dateStr} - ${dateStr}`,
      periodType: 'day',
      activeFilters: {},

      calendarVisible: false,
      calendarRange: {
        start: today,
        end: today
      }
    };
  },

  computed: {
    filteredTasks() {
      const [startStr, endStr] = this.dateRange.split(' - ');
      const startTime = Date.parse(startStr);
      const endTime = Date.parse(endStr);

      return this.tasks.filter(task => {
        const taskTime = Date.parse(task.dateTime);
        if (taskTime < startTime || taskTime > endTime) return false;

        return Object.entries(this.activeFilters).every(([key, value]) =>
          !value || String(task[key]).includes(String(value))
        );
      });
    }
  },

  watch: {
    calendarRange(val) {
      if (val?.start && val?.end) {
        this.dateRange = `${val.start.toLocaleDateString('ru-RU')} - ${val.end.toLocaleDateString('ru-RU')}`;
      }
    }
  },

  async mounted() {
    await this.loadStaffInfo();
    await this.loadTasks();
  },
  
  methods: {
    async loadStaffInfo() {
      try {
        const staffInfo = await fetchStaffInfo(
          this.token, 
          this.organizationId, 
          this.departmentId
        );
        this.organizationName = staffInfo.organizationName;
        this.departmentName = staffInfo.departmentName;
        this.position = staffInfo.position;
        this.staffName = `${staffInfo.surname} ${staffInfo.name} ${staffInfo.lastname}`;
      } catch (error) {
        console.error('Ошибка загрузки информации о сотруднике:', error);
      }
    },
    
    async loadTasks() {
      try {
        this.tasks = await fetchTasks(
          this.token,
          this.organizationId,
          this.departmentId
        ).map(task => ({ ...task, inactive: false }));
      } catch (error) {
        console.error('Ошибка загрузки задач:', error);
      }
    },
    
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
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Ошибка при обновлении задачи');
        }
          return response.json();
      })
      .then(data => {
        console.log('Успешно обновлено:', data);
      })
      .catch(error => {
        console.error('Ошибка при отправке:', error);
      });
    },

    shiftPeriod(direction) {
      const [startStr, endStr] = this.dateRange.split(' - ');
      const startDate = new Date(Date.parse(startStr));
      const endDate = new Date(Date.parse(endStr));
      const diff = endDate - startDate;

      startDate.setDate(startDate.getDate() + direction);
      const newEndDate = new Date(startDate.getTime() + diff);

      this.dateRange = `${startDate.toLocaleDateString('ru-RU')} - ${newEndDate.toLocaleDateString('ru-RU')}`;
      this.calendarRange = { start: startDate, end: newEndDate };
    },
    
    setPeriodType(type) {
      this.periodType = type;
      const today = new Date();

      if (type === 'day') {
        const dateStr = today.toLocaleDateString('ru-RU');
        this.dateRange = `${dateStr} - ${dateStr}`;
        this.calendarRange = { start: today, end: today };
      } else if (type === 'week') {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        this.dateRange = `${startOfWeek.toLocaleDateString('ru-RU')} - ${endOfWeek.toLocaleDateString('ru-RU')}`;
        this.calendarRange = { start: startOfWeek, end: endOfWeek };
      }
    },

    toggleCalendar() {
      this.calendarVisible = !this.calendarVisible;
    },
  }
};
</script>

<style scoped>
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

.menu-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
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
</style>