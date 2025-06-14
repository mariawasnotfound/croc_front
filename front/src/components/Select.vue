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
      departments: [],
      selectedOrg: "",
      selectedDept: "",
      isLoading: false,
      error: null
    };
  },
  async created() {
    try {
      this.isLoading = true;
      const orgsResponse = await getOrganizationsOfStaff();
      this.organizations = orgsResponse.organizations || [];
    } catch (error) {
      console.error("Error loading organizations:", error);
      this.error = error.message;
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    async loadDepartments() {
      if (!this.selectedOrg) return;
      
      this.selectedDept = "";
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await getDepartmentsOfStaff(this.selectedOrg);
        this.departments = response.departments || [];
        
        if (this.departments.length === 0) {
          this.error = "Нет доступных отделений для выбранной организации";
        }
      } catch (error) {
        console.error("Ошибка загрузки отделений:", error);
        this.error = error.message;
        this.departments = [];
      } finally {
        this.isLoading = false;
      }
    },
    async select() {
      try {
        this.isLoading = true;
        this.error = null;
        
        await saveUserInfo({
          organizationId: this.selectedOrg,
          departmentId: this.selectedDept
        });

        this.$emit("select-success", {
          organizationId: this.selectedOrg,
          departmentId: this.selectedDept
        });
      } catch (error) {
        console.error("Ошибка сохранения:", error);
        this.error = error.message || "Ошибка сервера";
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