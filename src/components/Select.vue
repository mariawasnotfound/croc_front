<template>
  <div class="container">
    <div class="select-container">
      <select v-model="selectedOrg" @change="loadDepartments">
        <option disabled value="">Выберите мед. организацию</option>
        <option v-for="org in organizations" :key="org.id" :value="org.id">{{ org.name }}</option>
      </select>

      <select v-model="selectedDept" :disabled="!selectedOrg">
        <option disabled value="">Выберите отделение</option>
        <option v-for="dept in departments" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
      </select>

      <button :disabled="!selectedDept" @click="select">Выбрать</button>
    </div>
  </div>
</template>

<script>
import { getOrganizationsOfStaff } from "../request/organizations.js";
import { getDepartmentsOfStaff } from "../request/departments.js";

export default {
  data() {
    return {
      organizations: [],
      departments: [],
      selectedOrg: "",
      selectedDept: ""
    };
  },
  computed: {
    filteredDepartments() {
      if (!this.selectedOrg) return [];
      return this.allDepartments.filter(dept => dept.organization_id === this.selectedOrg);
    }
  },
  async created() {
    try {
      [this.organizations, this.allDepartments] = await Promise.all([
        getOrganizationsOfStaff(),
        getDepartmentsOfStaff()
      ]);
    } catch (error) {
      alert(error.message);
    }
  },
  methods: {
    async loadDepartments() {
      this.selectedDept = "";
    },
    select() {
      this.$emit("select-success", {
        organizationId: this.selectedOrg,
        departmentId: this.selectedDept
      });
    },
  },
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