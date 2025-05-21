<template>
  <div class="main-dialog">
    <!-- Шапка с информацией о сотруднике -->
    <div class="header">
      <button class="menu-button" @click="toggleFullscreenMenu">☰</button>
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
            v-model="dateRangeInput" 
            type="text" 
            placeholder="ДД.ММ.ГГ - ДД.ММ.ГГ"
            class="date-input"
            @focus="showCalendar"
            @blur="handleDateInputBlur"
            aria-label="Диапазон дат"
          >
          <button class="calendar-button" @click.stop="toggleCalendar" aria-label="Открыть календарь">📅</button>

          <!-- Календарь с возможностью выбора периода -->
          <div v-if="calendarVisible" class="calendar-wrapper">
            <v-date-picker
              v-model="calendarRange"
              is-range
              @input="handleCalendarSelect"
              @clickOutside="closeCalendar"
              :masks="{ input: 'DD.MM.YYYY' }"
            />
          </div>
        </div>

        <button class="arrow-button" @click="shiftPeriod(1)" aria-label="Следующий период">→</button>
      </div>

      <!-- Индикатор периода -->
      <div class="period-indicator">
        {{ periodIndicator }}
      </div>
    </div>

    <!-- Журнал задач -->
    <div class="journal">
      <table v-if="tasks.length > 0">
        <thead>
          <tr>
            <th></th>
            <th>Время выполнения</th>
            <th>Задача выполнена</th>
            <th>Пациент</th>
            <th>Дата рождения</th>
            <th>Палата</th>
            <th>Измерения</th>
            <th>Лек. препараты</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(task, index) in tasks" 
            :key="index" 
            :class="{ inactive: task.inactive }"
            @click="showPatientDetails(task)"
          >
            <td @click.stop> 
              <input 
                type="checkbox" 
                v-model="task.inactive" 
                @change="onTaskCheck(task)"
                :id="'task-checkbox-' + index"
              >
              <label :for="'task-checkbox-' + index" class="visually-hidden">Отметить задачу как выполненную</label>
            </td>
            <td>{{ formatDateTime(task.scheduledAt) }}</td>
            <td>{{ task.completedAt ? formatDateTime(task.completedAt) : '—' }}</td>
            <td>{{ task.patientFullName }}</td>
            <td>{{ formatDate(task.birthDate) }}</td>
            <td>{{ task.ward }}</td>
            <td>{{ task.measures }}</td>
            <td>{{ task.preparations }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else class="no-tasks-message">
        <p class="no-tasks-title">Задач на текущий день нет</p>
        
        <div v-if="nearestTasks.length > 0" class="nearest-tasks">
          <h4>Ближайшие задачи:</h4>
          <table>
            <thead>
              <tr>
                <th>Время выполнения</th>
                <th>Задача выполнена</th>
                <th>Пациент</th>
                <th>Дата рождения</th>
                <th>Палата</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(task, index) in nearestTasks" 
                :key="'nearest-' + index"
                @click="showPatientDetails(task)"
              >
                <td>{{ formatDateTime(task.scheduledAt) }}</td>
                <td>{{ task.completedAt ? formatDateTime(task.completedAt) : '—' }}</td>
                <td>{{ task.patientFullName }}</td>
                <td>{{ formatDate(task.birthDate) }}</td>
                <td>{{ task.ward }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Полноэкранное модальное окно меню -->
    <div v-if="menuVisible" class="fullscreen-menu-overlay" @click.self="closeMenu">
      <div class="fullscreen-menu">
        <button class="close-button" @click="closeMenu">×</button>
        <h2>Меню</h2>
        <ul class="menu-items">
          <li @click="navigateTo('dashboard')">Главная</li>
          <li @click="navigateTo('profile')">Профиль</li>
          <li @click="navigateTo('settings')">Настройки</li>
          <li @click="logout">Выйти</li>
        </ul>
      </div>
    </div>

    <!-- Модальное окно с деталями пациента -->
    <div v-if="selectedPatient" class="patient-modal-overlay" @click.self="closeModal">
      <div class="patient-modal">
        <button class="close-button" @click="closeModal">×</button>
        <h3>Информация о пациенте</h3>
        
        <div class="patient-info">
          <div class="info-row">
            <span class="label">ФИО:</span>
            <span class="value">{{ selectedPatient.patientFullName }}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Дата рождения:</span>
            <span class="value">{{ formatDate(selectedPatient.birthDate) }}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Палата:</span>
            <span class="value">{{ selectedPatient.ward }}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Врач:</span>
            <span class="value">{{ selectedPatient.doctorFullName }}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Диагноз:</span>
            <span class="value">{{ selectedPatient.diagnosis }}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Аллергия:</span>
            <span class="value">{{ selectedPatient.allergy || 'Нет данных' }}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Дата и время задачи:</span>
            <span class="value">{{ formatDateTime(selectedTask.scheduledAt) }}</span>
          </div>
          
          <div class="vital-signs">
            <h4>Показатели:</h4>
            <div class="info-row">
              <span class="label">Давление:</span>
              <input v-model="selectedPatient.bloodPressure" class="value-input" placeholder="Введите давление">
            </div>
            <div class="info-row">
              <span class="label">ЧДД:</span>
              <input v-model="selectedPatient.respiratoryRate" class="value-input" placeholder="Введите ЧДД">
            </div>
            <div class="info-row">
              <span class="label">ЧСС:</span>
              <input v-model="selectedPatient.heartRate" class="value-input" placeholder="Введите ЧСС">
            </div>
            <button @click="updatePatientMeasures" class="save-button":disabled="isLoading">
              {{ isLoading ? 'Сохранение...' : 'Сохранить показатели' }}
            </button>
          </div>
          
          <!-- Блок с информацией о лекарстве для задач типа preparation -->
          <div class="medication-info" v-if="selectedPatient.medicationInfo">
            <h4>Информация о лекарстве:</h4>
            <div class="info-row">
              <span class="label">Название:</span>
              <span class="value">{{ selectedPatient.medicationInfo.name }}</span>
            </div>
            <div class="info-row">
              <span class="label">Дозировка:</span>
              <span class="value">{{ selectedPatient.medicationInfo.dosage }} мг</span>
            </div>
            <div class="info-row">
              <span class="label">Количество:</span>
              <span class="value">{{ selectedPatient.medicationInfo.quantity }}</span>
            </div>
            <div class="info-row">
              <span class="label">Наркотическое:</span>
              <span class="value">{{ selectedPatient.medicationInfo.narcotic }}</span>
            </div>
          </div>
          
          <div class="tasks-list" v-if="selectedPatient.tasks && selectedPatient.tasks.length">
            <h4>Задачи:</h4>
            <ul>
              <li v-for="(task, idx) in selectedPatient.tasks" :key="idx">
                {{ task.description }} ({{ formatDateTime(task.dateTime) }})
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getHeader } from '../request/staff.js';
import { getInPeriod } from '../request/tasks.js';
import { getPreparationData, getMeasureData } from '../request/patient.js';
import { updatePreparationTask, updateMeasureTask } from '../request/update.js';
import { DatePicker } from 'v-calendar';

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
      dateRangeInput: `${dateStr} - ${dateStr}`,
      calendarRange: {
        start: new Date(),
        end: new Date()
      },
      calendarVisible: false,
      'v-date-picker': DatePicker,
      isLoading: false,
      error: null,
      selectedPatient: null,
      selectedTask: null,
      menuVisible: false,
      debounceLoadTasks: null
    };
  },

  computed: {  
    // Ближайшие задания
    nearestTasks() {
      if (this.tasks.length === 0) return [];
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return this.tasks
        .filter(task => {
          const taskDate = new Date(task.scheduledAt);
          return !task.inactive && taskDate >= today;
        })
        .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
        .slice(0, 5);
    },
    
    periodIndicator() {
      const [startStr, endStr] = this.dateRangeInput.split(' - ');
      const startDate = this.parseDate(startStr);
      const endDate = this.parseDate(endStr);
      
      if (startStr === endStr) {
        return 'День: ' + this.formatDate(startDate);
      }
      
      const diffDays = Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      
      if (diffDays === 7) {
        return 'Неделя: ' + startStr + ' - ' + endStr;
      }
      
      return `Период: ${diffDays} дней`;
    }
  },

  watch: {
    calendarRange: {
      handler(newVal) {
        if (newVal?.start && newVal?.end) {
          this.dateRangeInput = `${this.formatDate(newVal.start)} - ${this.formatDate(newVal.end)}`;
          this.loadTasks();
        }
      },
      deep: true
    }
  },

  async mounted() {
    await this.loadData();
  },
  
  methods: {
    // Загрузка данных
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

    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('ru-RU');
    },
    
    formatDateTime(datetime) {
      if (!datetime) return '';
      const d = new Date(datetime);
      return d.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    parseDate(dateStr) {
      if (!dateStr) return new Date();
      const [day, month, year] = dateStr.split('.');
      return new Date(`${year}-${month}-${day}T00:00:00`);
    },

    // Информация о пользователе
    async loadStaffInfo() {
      try {
        const staffInfo = await getHeader();
        this.staffName = staffInfo.name;
        this.position = staffInfo.position;
        this.organizationName = staffInfo.organizationName;
        this.departmentName = staffInfo.departmentName;
      } catch (error) {
        console.error('Не удалось загрузить информацию о сотруднике:', error);
        this.staffName = 'Неизвестный сотрудник';
        this.position = 'Должность не указана';
        this.organizationName = 'Организация не указана';
        this.departmentName = 'Отделение не указано';
        this.error = 'Не удалось загрузить информацию о сотруднике';
      }
    },

    // Подробная информация о задаче
    async showPatientDetails(task) {
      try {
        this.isLoading = true;
        const isMeasureTask = task.measures !== null;
        const isPreparationTask = task.preparations !== null;
        
        let taskDetails = null;
        if (isMeasureTask) {
          taskDetails = await getMeasureData(task.id);
        } else if (isPreparationTask) {
          taskDetails = await getPreparationData(task.id);
        }
        
        this.selectedTask = task;
        this.selectedPatient = {
          patientFullName: `${taskDetails.patientSurname} ${taskDetails.patientFirstname} ${taskDetails.patientLastname}`,
          birthDate: taskDetails.birthDate,
          ward: taskDetails.ward,
          doctorFullName: `${taskDetails.doctorSurname} ${taskDetails.doctorFirstname} ${taskDetails.doctorLastname}`,
          diagnosis: taskDetails.diagnosis,
          allergy: taskDetails.allergy || 'Нет данных',
          bloodPressure: isMeasureTask ? (taskDetails.result?.bloodPressure || 'Не измерялось') : 'Не измерялось',
          respiratoryRate: isMeasureTask ? (taskDetails.result?.respiratoryRate || 'Не измерялось') : 'Не измерялось',
          heartRate: isMeasureTask ? (taskDetails.result?.heartRate || 'Не измерялось') : 'Не измерялось',
          tasks: [
            {
              description: isMeasureTask ? taskDetails.taskName : taskDetails.taskName,
              dateTime: task.scheduledAt
            }
          ]
        };
        if (isPreparationTask) {
          this.selectedPatient.medicationInfo = {
            name: taskDetails.taskName,
            dosage: taskDetails.dosage,
            quantity: taskDetails.quantity,
            narcotic: taskDetails.narcotic ? 'Да' : 'Нет'
          };
        }
        
      } catch (error) {
        console.error('Ошибка загрузки деталей задачи:', error);
        this.error = 'Не удалось загрузить информацию о пациенте';
      } finally {
        this.isLoading = false;
      }
    },
    
    // Загрузка задач
    async loadTasks() {
      if (this.debounceLoadTasks) {
        clearTimeout(this.debounceLoadTasks);
      }
      
      this.debounceLoadTasks = setTimeout(async () => {
        try {
          const [startStr, endStr] = this.dateRangeInput.split(' - ');
          const toISODate = (dateStr) => {
            const [day, month, year] = dateStr.split('.');
            return `${year}-${month}-${day}`;
          };
          
          const response = await getInPeriod(toISODate(startStr), toISODate(endStr));
          this.tasks = Array.isArray(response?.tasks) ? response.tasks.flat() : [];
        } catch (error) {
          console.error('Ошибка загрузки задач:', error);
          this.tasks = [];
          this.error = 'Не удалось загрузить задачи';
        }
      }, 300);
    },

    // Галочка (задача выполнена)
    async onTaskCheck(task) {
      try {
        this.isLoading = true;
        const isMeasureTask = task.measures !== null;
        const isPreparationTask = task.preparations !== null;
          
        if (task.inactive && !task.completedAt) {
          task.completedAt = new Date().toISOString();
            
          if (isMeasureTask && !task.result) {
            task.result = {
              bloodPressure: 'Не измерялось',
              respiratoryRate: 'Не измерялось',
              heartRate: 'Не измерялось'
            };
          }
            
          if (isMeasureTask) {
            await updateMeasureTask(task.id, {
              completedAt: task.completedAt,
              result: task.result
            });
          } else if (isPreparationTask) {
            await updatePreparationTask(task.id, {
              completedAt: task.completedAt
            });
          }
        } else if (!task.inactive) {
          task.completedAt = null;
        }
      } catch (error) {
        console.error('Ошибка при обновлении задачи:', error);
        task.inactive = !task.inactive;
        task.completedAt = null;
        this.error = 'Не удалось обновить задачу';
      } finally {
        this.isLoading = false;
      }
    },
    
    // Добавление значений измерений
    async updatePatientMeasures() {
      try {
        this.isLoading = true;
        if (!this.selectedTask || !this.selectedPatient) return;
        const prepareValue = (value) => {
          if (value === 'Не измерялось' || value === null || value === undefined) {
            return null;
          }
          const num = Number(value);
          return isNaN(num) ? null : num;
        };

        await updateMeasureTask(this.selectedTask.id, {
          completedAt: this.selectedTask.completedAt || new Date().toISOString(),
          result: {
            bloodPressure: prepareValue(this.selectedPatient.bloodPressure),
            respiratoryRate: prepareValue(this.selectedPatient.respiratoryRate),
            heartRate: prepareValue(this.selectedPatient.heartRate)
          }
        });
        this.selectedTask.completedAt = this.selectedTask.completedAt || new Date().toISOString();
        this.selectedTask.inactive = true;
        const taskIndex = this.tasks.findIndex(t => t.id === this.selectedTask.id);
        if (taskIndex !== -1) {
          this.tasks[taskIndex] = { ...this.selectedTask };
        }
        
        this.closeModal();
        this.$emit('task-updated');
      } catch (error) {
        console.error('Ошибка при обновлении показателей:', error);
        this.error = 'Не удалось обновить показатели: ' + (error.message || 'Неизвестная ошибка');
        this.selectedTask.inactive = false;
      } finally {
        this.isLoading = false;
      }
    },
    
    toggleFullscreenMenu() {
      this.menuVisible = !this.menuVisible;
    },
    
    closeMenu() {
      this.menuVisible = false;
    },
    
    navigateTo(route) {
      this.closeMenu();
      this.$router.push(route);
    },
    
    logout() {
      this.closeMenu();
      // Реализация выхода
    },
    
    showCalendar() {
      this.calendarVisible = true;
    },
    
    closeCalendar() {
      this.calendarVisible = false;
    },
    
    toggleCalendar() {
      this.calendarVisible = !this.calendarVisible;
    },
    
    handleCalendarSelect(range) {
      this.calendarRange = range;
      this.closeCalendar();
    },
    
    handleDateInputBlur() {
      const dates = this.dateRangeInput.split(' - ');
      if (dates.length === 2) {
        try {
          const startDate = this.parseDate(dates[0].trim());
          const endDate = this.parseDate(dates[1].trim());
          
          if (startDate && endDate && startDate <= endDate) {
            this.calendarRange = { start: startDate, end: endDate };
            return;
          }
        } catch (e) {
          console.error('Invalid date format');
        }
      }
      
      // Восстановление предыдущего значения при ошибке
      this.dateRangeInput = `${this.formatDate(this.calendarRange.start)} - ${this.formatDate(this.calendarRange.end)}`;
    },
    
    shiftPeriod(direction) {
      const diffDays = Math.ceil(
        (this.calendarRange.end - this.calendarRange.start) / (1000 * 60 * 60 * 24)
      ) + 1;
      
      const newStart = new Date(this.calendarRange.start);
      newStart.setDate(newStart.getDate() + direction * diffDays);
      
      const newEnd = new Date(this.calendarRange.end);
      newEnd.setDate(newEnd.getDate() + direction * diffDays);
      
      this.calendarRange = { start: newStart, end: newEnd };
    },
    
    closeModal() {
      this.selectedPatient = null;
      this.selectedTask = null;
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
.menu-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 5px 10px;
  margin-right: 10px;
}

.menu-button:hover {
  background-color: #e0e0e0;
  border-radius: 4px;
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

.v-date-picker {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-top: 5px;
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

.no-tasks-message {
  padding: 20px;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 5px;
  margin-top: 20px;
}

.no-tasks-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
}

.nearest-tasks {
  margin-top: 20px;
  text-align: left;
}

.nearest-tasks h4 {
  margin-bottom: 10px;
  color: #555;
}

.nearest-tasks table {
  width: 100%;
  margin-top: 10px;
}

.nearest-tasks th, 
.nearest-tasks td {
  padding: 8px;
  text-align: left;
  border: 1px solid #ddd;
}

.nearest-tasks th {
  background-color: #f2f2f2;
}

/* Стили для модального окна */
.patient-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.patient-modal {
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.close-button:hover {
  color: #333;
}

.patient-info {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.label {
  font-weight: bold;
  color: #555;
}

.value {
  text-align: right;
}

.medication-info {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 2px solid #f0f0f0;
}
.value-input {
  width: 100px;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.save-button {
  margin-top: 10px;
  padding: 8px 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-button:hover {
  background-color: #45a049;
}

.save-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* Делаем строки таблицы кликабельными */
.journal tbody tr {
  cursor: pointer;
}

.journal tbody tr:hover {
  background-color: #f5f5f5;
}
.fullscreen-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.fullscreen-menu {
  background-color: white;
  width: 90%;
  height: 90%;
  border-radius: 10px;
  padding: 30px;
  position: relative;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.fullscreen-menu .close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 30px;
  background: none;
  border: none;
  cursor: pointer;
}

.fullscreen-menu h2 {
  font-size: 28px;
  margin-bottom: 30px;
  text-align: center;
  color: #333;
}

.menu-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-items li {
  padding: 15px 20px;
  font-size: 20px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-items li:hover {
  background-color: #f5f5f5;
}

/* Стили для индикатора периода */
.period-indicator {
  padding: 8px 15px;
  background-color: #f0f0f0;
  border-radius: 4px;
  font-size: 14px;
  color: #555;
}

/* Дополнительные стили для календаря */
.calendar-wrapper {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-top: 5px;
}

.date-input-container {
  position: relative;
}
</style>