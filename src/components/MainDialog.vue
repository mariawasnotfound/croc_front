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
          >
          <button class="calendar-button" @click="showCalendar">📅</button>
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
        <button 
          :class="{ active: periodType === 'all' }" 
          @click="setPeriodType('all')"
        >
          Всё
        </button>
      </div>

      <button class="filter-button" @click="showFilters">Фильтр</button>
    </div>

    <div class="journal">
      <table>
        <thead>
          <tr>
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
          <tr v-for="(task, index) in filteredTasks" :key="index">
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

    <CalendarModal 
      v-if="showCalendarModal" 
      @close="hideCalendar"
      @select="handleDateSelect"
    />
    
    <FilterModal 
      v-if="showFilterModal" 
      @close="hideFilters"
      @apply="applyFilters"
    />
    
    <MainMenu 
      v-if="showMainMenu" 
      @close="toggleMenu"
    />
  </div>
</template>

<script>
import { fetchStaffInfo } from '@/request/staff.js';
import { fetchTasks } from '@/request/tasks.js';
import CalendarModal from '@/components/CalendarModal.vue';
import FilterModal from '@/components/FilterModal.vue';
import MainMenu from '@/components/MainMenu.vue';

export default {
  components: {
    CalendarModal,
    FilterModal,
    MainMenu
  },
  
  props: {
    token: {
      type: String,
      required: true
    },
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
    return {
      organizationName: '',
      departmentName: '',
      position: '',
      staffName: '',
      tasks: [],
      dateRange: this.getDefaultDateRange(),
      periodType: 'day',
      showCalendarModal: false,
      showFilterModal: false,
      showMainMenu: false,
      activeFilters: {}
    };
  },
  
  computed: {
    filteredTasks() {
      return this.tasks.filter(task => {
        const taskDate = new Date(task.dateTime);
        const [startDate, endDate] = this.parseDateRange();
        
        if (taskDate < startDate || taskDate > endDate) {
          return false;
        }
        
        for (const key in this.activeFilters) {
          if (task[key] !== this.activeFilters[key]) {
            return false;
          }
        }
        
        return true;
      });
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
        );
      } catch (error) {
        console.error('Ошибка загрузки задач:', error);
      }
    },
    
    getDefaultDateRange() {
      const today = new Date();
      const formattedDate = this.formatDate(today);
      return `${formattedDate} - ${formattedDate}`;
    },
    
    formatDate(date) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    },
    
    parseDateRange() {
      const [startStr, endStr] = this.dateRange.split(' - ');
      const startDate = this.parseDate(startStr);
      const endDate = this.parseDate(endStr);
      return [startDate, endDate];
    },
    
    parseDate(dateStr) {
      const [day, month, year] = dateStr.split('.');
      return new Date(year, month - 1, day);
    },
    
    shiftPeriod(direction) {
      const [startDate, endDate] = this.parseDateRange();
      const diff = endDate - startDate;
      
      const newStartDate = new Date(startDate);
      newStartDate.setDate(newStartDate.getDate() + direction);
      
      const newEndDate = new Date(newStartDate);
      newEndDate.setDate(newEndDate.getDate() + diff / (1000 * 60 * 60 * 24));
      
      this.dateRange = `${this.formatDate(newStartDate)} - ${this.formatDate(newEndDate)}`;
    },
    
    setPeriodType(type) {
      this.periodType = type;
      const today = new Date();
      
      if (type === 'day') {
        this.dateRange = `${this.formatDate(today)} - ${this.formatDate(today)}`;
      } else if (type === 'week') {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        this.dateRange = `${this.formatDate(startOfWeek)} - ${this.formatDate(endOfWeek)}`;
      } else {
        if (this.tasks.length > 0) {
          const dates = this.tasks.map(t => new Date(t.dateTime));
          const minDate = new Date(Math.min(...dates));
          const maxDate = new Date(Math.max(...dates));
          this.dateRange = `${this.formatDate(minDate)} - ${this.formatDate(maxDate)}`;
        }
      }
    },
    
    showCalendar() {
      this.showCalendarModal = true;
    },
    
    hideCalendar() {
      this.showCalendarModal = false;
    },
    
    handleDateSelect(startDate, endDate) {
      this.dateRange = `${this.formatDate(startDate)} - ${this.formatDate(endDate)}`;
      this.hideCalendar();
    },
    
    showFilters() {
      this.showFilterModal = true;
    },
    
    hideFilters() {
      this.showFilterModal = false;
    },
    
    applyFilters(filters) {
      this.activeFilters = filters;
      this.hideFilters();
    },
    
    toggleMenu() {
      this.showMainMenu = !this.showMainMenu;
    }
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

.filter-button {
  padding: 5px 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.journal {
  overflow-x: auto;
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