<template>
  <div class="container">
    <div class="select-container">
      <select v-model="selectedOrg" @change="loadDepartments">
        <option disabled value="">Выберите мед. организацию</option>
        <option v-for="org in organizations" :key="org.id" :value="org.id">
          {{ org.name }}
        </option>
      </select>

      <select v-model="selectedDept" :disabled="!selectedOrg">
        <option disabled value="">Выберите отделение</option>
        <option v-for="dept in departments" :key="dept.id" :value="dept.id">
          {{ dept.name }}
        </option>
      </select>

      <button :disabled="!selectedDept" @click="select">Выбрать</button>
    </div>
  </div>
</template>

<script>
import { getOrganizationsOfStaff } from "../request/organizations.js";
import { getDepartmentsOfStaff } from "../request/departments.js";
import { saveUserInfo } from "../request/save.js";

export default {
  data() {
    return {
      organizations: [],
      allDepartments: [],
      departments: [],
      selectedOrg: "",
      selectedDept: "",
      isLoading: false,
      error: null
    };
  },
  computed: {
    filteredDepartments() {
      if (!this.selectedOrg) return [];
      return this.allDepartments.filter(dept => dept.pid === this.selectedOrg);
    }
  },
  async created() {
    try {
      const [orgsResponse, deptsResponse] = await Promise.all([
        getOrganizationsOfStaff(),
        getDepartmentsOfStaff()
      ]);
      
      this.organizations = orgsResponse.organizations || [];
      this.allDepartments = deptsResponse.departments || [];
      this.departments = this.filteredDepartments;
      
    } catch (error) {
      console.error("Error loading data:", error);
      alert(error.message);
    }
  },
  methods: {
    loadDepartments() {
      this.selectedDept = "";
      this.departments = this.filteredDepartments;
    },
    async select() {
      try {
        this.error = null;
        this.isLoading = true;

        await saveUserInfo({
          organizationId: this.selectedOrg,
          departmentId: this.selectedDept
        });

        // После успешного сохранения переходим к главному окну
        this.$emit("select-success", {
          organizationId: String(this.selectedOrg),
          departmentId: String(this.selectedDept)
        });

      } catch (error) {
        console.error("Ошибка:", error);
        this.error = error.message || "Ошибка сервера";
        // Можно добавить более информативное сообщение для пользователя
        alert("Не удалось сохранить выбор. Пожалуйста, попробуйте снова.");
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 90vh;
}

.select-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px;
  width: 400px;
  background: lightblue;
  border-radius: 12px;
  border: 2px solid #000;
  position: relative;
}

select, button {
  padding: 12px;
  font-size: 18px;
  width: 100%;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-text {
  color: #555;
  font-style: italic;
  position: absolute;
  bottom: 10px;
}
</style>