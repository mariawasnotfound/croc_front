<template>
  <div class="main-dialog">
    <!-- Шапка -->
    <div class="header">
      <button class="menu-button" @click="toggleFullscreenMenu">☰</button>
      <div class="title">
        {{ organizationName }} / {{ departmentName }} / {{ position }}: {{ staffName }}
      </div>
      <button class="logout-button" @click="logout">Выйти</button>
    </div>
    <!-- Фильтры даты -->
    <div class="filters">
      <div class="date-controls">
        <button class="arrow-button" @click="shiftPeriod(-1)">←</button>
        <div class="date-input-container">
          <input v-model="dateRangeInput" type="text" placeholder="ДД.ММ.ГГ - ДД.ММ.ГГ"
            class="date-input" @focus="showCalendar" @blur="handleDateInputBlur">
          <button class="calendar-button" @click.stop="toggleCalendar">📅</button>
          <div v-if="calendarVisible" class="calendar-wrapper">
            <v-date-picker v-model="calendarRange" is-range @input="handleCalendarSelect"
              @clickOutside="closeCalendar" :masks="{ input: 'DD.MM.YYYY' }" />
          </div>
        </div>
        <button class="arrow-button" @click="shiftPeriod(1)">→</button>
      </div>
      <div class="period-indicator">{{ periodIndicator }}</div>
    </div>
    <!-- Журнал задач -->
    <div class="journal">
      <table v-if="tasks.length > 0">
        <thead>
          <tr>
            <th></th>
            <th @click="sortBy('scheduledAt')">
              Время выполнения
              <span class="sort-indicator" :class="getSortIndicatorClass('scheduledAt')">▲▼</span>
            </th>
            <th @click="sortBy('completedAt')">
              Задача выполнена
              <span class="sort-indicator" :class="getSortIndicatorClass('completedAt')">▲▼</span>
            </th>
            <th @click="sortBy('patientFullName')">
              Пациент
              <span class="sort-indicator" :class="getSortIndicatorClass('patientFullName')">▲▼</span>
            </th>
            <th @click="sortBy('birthDate')">
              Дата рождения
              <span class="sort-indicator" :class="getSortIndicatorClass('birthDate')">▲▼</span>
            </th>
            <th @click="sortBy('ward')">
              Палата
              <span class="sort-indicator" :class="getSortIndicatorClass('ward')">▲▼</span>
            </th>
            <th @click="sortBy('measures')">
              Измерения
              <span class="sort-indicator" :class="getSortIndicatorClass('measures')">▲▼</span>
            </th>
            <th @click="sortBy('preparations')">
              Лек. препараты
              <span class="sort-indicator" :class="getSortIndicatorClass('preparations')">▲▼</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(task, index) in tasks" :key="index" :class="{ inactive: task.inactive }"
            @click="showPatientDetails(task)">
            <td @click.stop>
              <input type="checkbox" v-model="task.inactive" @change="onTaskCheck(task)"
                :id="'task-checkbox-' + index">
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
                <th @click="sortBy('scheduledAt')">
                  Время выполнения
                  <span class="sort-indicator" :class="getSortIndicatorClass('scheduledAt')">▲▼</span>
                </th>
                <th @click="sortBy('completedAt')">
                  Задача выполнена
                  <span class="sort-indicator" :class="getSortIndicatorClass('completedAt')">▲▼</span>
                </th>
                <th @click="sortBy('patientFullName')">
                  Пациент
                  <span class="sort-indicator" :class="getSortIndicatorClass('patientFullName')">▲▼</span>
                </th>
                <th @click="sortBy('birthDate')">
                  Дата рождения
                  <span class="sort-indicator" :class="getSortIndicatorClass('birthDate')">▲▼</span>
                </th>
                <th @click="sortBy('ward')">
                  Палата
                  <span class="sort-indicator" :class="getSortIndicatorClass('ward')">▲▼</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(task, index) in nearestTasks" :key="'nearest-' + index"
                @click="showPatientDetails(task)">
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
    <!-- Меню -->
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
    <!-- Модальное окно пациента -->
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
          <!-- Кнопка "Выполнить" для лекарств -->
          <button v-if="selectedPatient.medicationInfo && !selectedTask.completedAt"
                  @click="executeMedicationTask"
                  class="save-button"
                  :disabled="isLoading">
            {{ isLoading ? 'Сохранение...' : 'Выполнить' }}
          </button>
          <!-- Показатели -->
          <div class="vital-signs" v-if="selectedPatient.measureType">
            <h4>Показатели:</h4>
            <div class="info-row" v-if="selectedPatient.measureType === 'bloodPressure'">
              <span class="label">Давление:</span>
              <input v-model="selectedPatient.bloodPressure"
                     class="value-input"
                     placeholder="120/80"
                     @input="onFieldChange('bloodPressure')" />
              <span v-if="validationErrors.bloodPressure" class="error-text">{{ validationErrors.bloodPressure }}</span>
            </div>
            <div class="info-row" v-if="selectedPatient.measureType === 'respiratoryRate'">
              <span class="label">ЧДД:</span>
              <input v-model.number="selectedPatient.respiratoryRate"
                     class="value-input"
                     placeholder="16"
                     @input="onFieldChange('respiratoryRate')" />
              <span v-if="validationErrors.respiratoryRate" class="error-text">{{ validationErrors.respiratoryRate }}</span>
            </div>
            <div class="info-row" v-if="selectedPatient.measureType === 'heartRate'">
              <span class="label">ЧСС:</span>
              <input v-model.number="selectedPatient.heartRate"
                     class="value-input"
                     placeholder="72"
                     @input="onFieldChange('heartRate')" />
              <span v-if="validationErrors.heartRate" class="error-text">{{ validationErrors.heartRate }}</span>
            </div>
            <div class="info-row" v-if="selectedPatient.measureType === 'temperature'">
              <span class="label">Температура:</span>
              <input v-model="selectedPatient.temperature"
                     class="value-input"
                     placeholder="36.7"
                     @input="onFieldChange('temperature')" />
              <span v-if="validationErrors.temperature" class="error-text">{{ validationErrors.temperature }}</span>
            </div>
            <button @click="saveAllMeasures" class="save-button" :disabled="isLoading">
              {{ isLoading ? 'Сохранение...' : 'Сохранить показатели' }}
            </button>
          </div>
          <!-- Инфо о лекарствах -->
          <div v-if="selectedPatient.medicationInfo" class="medication-info">
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
        </div>
      </div>
    </div>
    <!-- Модальное окно подтверждения задачи -->
    <div v-if="isTaskConfirmModalVisible" class="confirm-modal-overlay" @click.self="hideTaskConfirmModal">
      <div class="confirm-modal">
        <h4>Подтверждение действия</h4>
        <p>Вы уверены, что хотите отметить задачу как выполненную?</p>
        <div class="confirm-buttons">
          <button @click="confirmTaskCheck" class="confirm-button">Да</button>
          <button @click="hideTaskConfirmModal" class="cancel-button">Нет</button>
        </div>
      </div>
    </div>
    <!-- Модальное окно подтверждения редактирования -->
    <div v-if="isEditConfirmModalVisible" class="confirm-modal-overlay" @click.self="hideEditConfirmModal">
      <div class="confirm-modal">
        <h4>Подтверждение действия</h4>
        <p>Вы хотите отредактировать выполненную задачу?</p>
        <div class="confirm-buttons">
          <button @click="confirmEditTask" class="confirm-button">Да</button>
          <button @click="hideEditConfirmModal" class="cancel-button">Нет</button>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script>
import { getHeader } from '../request/staff.js';
import { getInPeriod } from '../request/tasks.js';
import { getPreparationData, getMeasureData } from '../request/patient.js';
import { enqueueMeasureUpdate, resetTask } from '../request/update.js';
import { logout as fetchLogout } from '../request/logout.js';
import { DatePicker } from 'v-calendar';

export default {
  props: {
    organizationId: String,
    departmentId: String
  },
  components: {
    'v-date-picker': DatePicker
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
      isEditConfirmModalVisible: false,
      dateRangeInput: `${dateStr} - ${dateStr}`,
      calendarRange: { start: new Date(), end: new Date() },
      calendarVisible: false,
      isLoading: false,
      error: null,
      selectedPatient: null,
      selectedTask: null,
      menuVisible: false,
      debounceLoadTasks: null,
      validationErrors: {},
      isConfirmModalVisible: false,
      sortConfig: {
        key: null,
        direction: 1
      },
      isTaskConfirmModalVisible: false,
      currentTaskToConfirm: null
    };
  },
  computed: {
    nearestTasks() {
      if (this.tasks.length === 0) return [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return this.tasks
        .filter(task => !task.inactive && new Date(task.scheduledAt) >= today)
        .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
        .slice(0, 5);
    },
    periodIndicator() {
      const [startStr, endStr] = this.dateRangeInput.split(' - ');
      const startDate = this.parseDate(startStr);
      const endDate = this.parseDate(endStr);
      if (startStr === endStr) return 'День: ' + this.formatDate(startDate);
      const diffDays = Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      return diffDays === 7 ? 'Неделя: ' + startStr + ' - ' + endStr : `Период: ${diffDays} дней`;
    }
  },
  watch: {
    calendarRange: {
      deep: true,
      handler(newVal) {
        if (newVal?.start && newVal?.end) {
          this.dateRangeInput = `${this.formatDate(newVal.start)} - ${this.formatDate(newVal.end)}`;
          this.loadTasks();
        }
      }
    }
  },
  async mounted() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      this.$router.push('/login');
      return;
    }
    await this.loadData();
  },
  methods: {
    detectMeasureType(measuresText) {
      if (!measuresText) return null;
      measuresText = measuresText.toLowerCase();
      if (measuresText.includes('давление')) return 'bloodPressure';
      if (measuresText.includes('температура')) return 'temperature';
      if (measuresText.includes('частота дыхания')) return 'respiratoryRate';
      if (measuresText.includes('пульс')) return 'heartRate';
      return null;
    },
    onFieldChange(field) {
      const value = this.selectedPatient[field];
      let isValid = true;
      switch (field) {
        case 'bloodPressure':
          isValid = this.validateBloodPressure(value);
          break;
        case 'respiratoryRate':
          isValid = this.validateRespiratoryRate(value);
          break;
        case 'heartRate':
          isValid = this.validateHeartRate(value);
          break;
        case 'temperature':
          isValid = this.validateTemperature(value);
          break;
      }
      if (isValid && this.selectedTask && value !== undefined && value !== '') {
        enqueueMeasureUpdate(this.selectedTask.id, 'result', String(value));
      }
      return isValid;
    },
    validateBloodPressure(value) {
      const regex = /^(\d{2,3})\/(\d{2,3})$/;
      if (!regex.test(value)) {
        this.validationErrors.bloodPressure = 'Формат: 120/80';
        return false;
      }
      this.validationErrors.bloodPressure = null;
      return true;
    },
    validateRespiratoryRate(value) {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 6 || num > 40) {
        this.validationErrors.respiratoryRate = 'Введите число от 6 до 40';
        return false;
      }
      this.validationErrors.respiratoryRate = null;
      return true;
    },
    validateHeartRate(value) {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 30 || num > 200) {
        this.validationErrors.heartRate = 'Введите число от 30 до 200';
        return false;
      }
      this.validationErrors.heartRate = null;
      return true;
    },
    validateTemperature(value) {
      const num = parseFloat(value.replace(',', '.'));
      if (isNaN(num) || num < 34 || num > 42) {
        this.validationErrors.temperature = 'Введите число от 34 до 42';
        return false;
      }
      this.validationErrors.temperature = null;
      return true;
    },
    showSaveConfirmation() {
      if (!this.onFieldChange(this.selectedPatient.measureType)) return;
      this.isConfirmModalVisible = true;
    },
    hideSaveConfirmation() {
      this.isConfirmModalVisible = false;
    },
    showMedicationConfirm() {
      this.isConfirmModalVisible = true;
    },
    async executeMedicationTask() {
      this.hideSaveConfirmation();
      try {
        this.isLoading = true;
        await enqueueMeasureUpdate(this.selectedTask.id, 'completedAt', new Date().toISOString());
        this.selectedTask.completedAt = new Date().toISOString();
        this.selectedTask.inactive = true;
        this.closeModal();
      } catch (error) {
        console.error('Ошибка при выполнении задачи:', error);
        this.error = 'Не удалось выполнить задачу';
      } finally {
        this.isLoading = false;
      }
    },
    async saveAllMeasuresConfirmed() {
      if (this.selectedPatient.medicationInfo) {
        await this.executeMedicationTask();
      } else {
        await this.saveAllMeasures();
      }
    },
    async loadData() {
      this.isLoading = true;
      try {
        if (!localStorage.getItem('isAuthenticated')) {
          console.log('Пользователь не авторизован. Перенаправление на страницу входа.');
          this.$router.push('/login');
          return;
        }
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
    async loadStaffInfo() {
      try {
        const staffInfo = await getHeader();
        if (!staffInfo) {
          console.warn('Данные о сотруднике не найдены');
          return;
        }
        this.staffName = staffInfo.name;
        this.position = staffInfo.position;
        this.organizationName = staffInfo.organizationName;
        this.departmentName = staffInfo.departmentName;
      } catch (error) {
        console.error('Ошибка загрузки информации о сотруднике:', error);
        this.staffName = 'Неизвестный сотрудник';
      }
    },
    async showPatientDetails(task) {
      try {
      this.isLoading = true;
      this.selectedTask = task;

      let taskDetails;
      if (task.measures !== null) {
        taskDetails = await getMeasureData(task.id);
      } else if (task.preparations !== null) {
        taskDetails = await getPreparationData(task.id);
      }

      this.selectedPatient = {
        patientFullName: `${taskDetails.patientSurname} ${taskDetails.patientFirstname} ${taskDetails.patientLastname}`,
        birthDate: taskDetails.birthDate,
        ward: taskDetails.ward,
        doctorFullName: `${taskDetails.doctorSurname} ${taskDetails.doctorFirstname} ${taskDetails.doctorLastname}`,
        diagnosis: taskDetails.diagnosis,
        allergy: taskDetails.allergy || 'Нет данных'
      };

      const measureType = this.detectMeasureType(task.measures);
      this.selectedPatient.measureType = measureType;

      if (measureType) {
        this.selectedPatient[measureType] = taskDetails.result || '';
      }

      if (task.preparations !== null) {
        this.selectedPatient.medicationInfo = {
          name: taskDetails.taskName,
          dosage: taskDetails.dosage,
          quantity: taskDetails.quantity,
          narcotic: taskDetails.narcotic ? 'Да' : 'Нет'
        };
      }

    } catch (error) {
      console.error('Ошибка при открытии деталей пациента:', error);
      this.error = 'Не удалось загрузить информацию о пациенте';
    } finally {
      this.isLoading = false;
    }
    },
    async saveAllMeasures() {
      if (!this.selectedTask || !this.selectedPatient) return;
      try {
        this.isLoading = true;
        const measureType = this.selectedPatient.measureType;
        const value = this.selectedPatient[measureType];
        if (!value) throw new Error('Значение не введено');
        await enqueueMeasureUpdate(this.selectedTask.id, 'result', String(value));
        this.selectedTask.result = value;
        this.selectedTask.completedAt = this.selectedTask.completedAt || new Date().toISOString();
        this.selectedTask.inactive = true;
        this.closeModal();
      } catch (error) {
        console.error('Ошибка при обновлении показателей:', error);
        this.error = 'Не удалось сохранить показатели';
      } finally {
        this.isLoading = false;
      }
    },
    async loadTasks() {
      if (this.debounceLoadTasks) clearTimeout(this.debounceLoadTasks);
      this.debounceLoadTasks = setTimeout(async () => {
        try {
          const [startStr, endStr] = this.dateRangeInput.split(' - ');
          const toISODate = (dateStr) => {
            const [day, month, year] = dateStr.split('.');
            return `${year}-${month}-${day}`;
          };
          const response = await getInPeriod(toISODate(startStr), toISODate(endStr));
          this.tasks = Array.isArray(response?.tasks) ? response.tasks.flat() : [];
          this.sortTasks();
        } catch (error) {
          console.error('Ошибка загрузки задач:', error);
          this.tasks = [];
        }
      }, 300);
    },
    sortTasks() {
      if (!this.sortConfig.key) return;
      const key = this.sortConfig.key;
      const direction = this.sortConfig.direction;
      this.tasks.sort((a, b) => {
        // Сначала невыполненные задачи
        if (a.inactive !== b.inactive) {
          return a.inactive ? 1 : -1;
        }

        let valA = a[key];
        let valB = b[key];

        if (key === 'scheduledAt' || key === 'completedAt') {
          valA = new Date(valA);
          valB = new Date(valB);
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) return -1 * direction;
        if (valA > valB) return 1 * direction;
        return 0;
      });
    },
    sortBy(key) {
      const config = this.sortConfig;
      if (config.key === key) {
        config.direction *= -1;
      } else {
        config.key = key;
        config.direction = 1;
      }
      this.sortTasks();
    },
    getSortIndicatorClass(key) {
      if (this.sortConfig.key !== key) return '';
      return this.sortConfig.direction === 1 ? 'asc' : 'desc';
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
    showEditConfirmModal() {
      this.isEditConfirmModalVisible = true;
    },
    hideEditConfirmModal() {
      this.isEditConfirmModalVisible = false;
      this.currentTaskToConfirm = null;
    },
    async confirmEditTask() {
      this.hideEditConfirmModal();
      this.showPatientDetails(this.currentTaskToConfirm);
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
          console.error('Неверный формат даты');
        }
      }
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
    },
    showTaskConfirmModal() {
      this.isTaskConfirmModalVisible = true;
    },
    hideTaskConfirmModal() {
      this.isTaskConfirmModalVisible = false;
      this.currentTaskToConfirm = null;
    },
    async confirmTaskCheck() {
      const task = this.currentTaskToConfirm;
      if (!task) return;

      try {
        if (task.inactive) {
          // Если пользователь снял галочку — сброс задачи
          await this.resetTask(task);
        } else {
          // Если пользователь поставил галочку — отметка как выполненная
          await enqueueMeasureUpdate(task.id, 'completedAt', new Date().toISOString());
          task.completedAt = new Date().toISOString();
          task.inactive = true;
          this.closeModal();
        }
      } catch (error) {
        console.error('Ошибка при обновлении задачи:', error.message);
        this.error = 'Не удалось сохранить изменения';
      } finally {
        this.hideTaskConfirmModal();
      }
    },
    async onTaskCheck(task) {
      this.currentTaskToConfirm = task;
      if (task.completedAt) {
        this.showEditConfirmModal();
      } else if (task.inactive) {
        this.showTaskConfirmModal();
      } else {
        try {
          await resetTask(task.id);
          task.completedAt = null;
          task.inactive = false;

          if (this.selectedPatient && this.selectedPatient.measureType) {
            this.selectedPatient[this.selectedPatient.measureType] = '';
          }

          this.closeModal();
        } catch (error) {
          console.error('Ошибка при сбросе задачи:', error.message);
          this.error = 'Не удалось сбросить задачу';
        }
      }
    },
    showResetConfirmModal() {
      this.isResetConfirmModalVisible = true;
    },
    hideResetConfirmModal() {
      this.isConfirmModalVisible = false;
      this.currentTaskToConfirm = null;
    },
    async confirmResetTask() {
      await this.resetTask(this.currentTaskToConfirm);
      this.hideResetConfirmModal();
    },
    async confirmTaskCheck() {
      const task = this.currentTaskToConfirm;
      if (!task) return;

      try {
        await enqueueMeasureUpdate(task.id, 'completedAt', new Date().toISOString());
        task.completedAt = new Date().toISOString();
        task.inactive = true;
        this.closeModal();
      } catch (error) {
        console.error('Ошибка при отметке задачи как выполненной:', error);
        this.error = 'Не удалось сохранить изменения';
      } finally {
        this.hideTaskConfirmModal();
      }
    },
    async logout() {
      try {
        await fetchLogout();
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('organizationId');
        localStorage.removeItem('departmentId');
        this.$router.push('/login');
      } catch (error) {
        alert(error.message);
        console.error(error);
      }
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
.logout-button {
  padding: 10px 20px;
  font-size: 18px;
  background: #ff6666;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-left: auto;
}
.logout-button:hover {
  background: #ff3333;
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
.period-indicator {
  padding: 8px 15px;
  background-color: #f0f0f0;
  border-radius: 4px;
  font-size: 14px;
  color: #555;
}
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
/* Стили для ошибок и модального окна подтверждения */
.confirm-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
}
.confirm-modal {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.confirm-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
.confirm-button,
.cancel-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.confirm-button {
  background-color: #4CAF50;
  color: white;
}
.confirm-button:hover {
  background-color: #45a049;
}
.cancel-button {
  background-color: #ccc;
  color: black;
}
.cancel-button:hover {
  background-color: #bbb;
}
.error-text {
  color: red;
  font-size: 12px;
  margin-left: 10px;
}
/* Сортировка */
.sort-indicator {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-left: 5px;
  font-size: 12px;
  color: #999;
  cursor: pointer;
  transition: transform 0.2s;
}
.sort-indicator.asc {
  color: #007bff;
  transform: rotate(0deg);
}
.sort-indicator.desc {
  color: #007bff;
  transform: rotate(180deg);
}
</style>