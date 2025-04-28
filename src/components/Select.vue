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
import { fetchOrganizations } from "../request/organizations.js";
import { fetchDepartments } from "../request/departments.js";

export default {
  data() {
    return {
      organizations: [],
      departments: [],
      selectedOrg: "",
      selectedDept: "",
    };
  },
  async created() {
    try {
      this.organizations = await fetchOrganizations();
    } catch (error) {
      alert(error.message);
    }
  },
  methods: {
    async loadDepartments() {
      if (!this.selectedOrg) return;
      try {
        this.departments = await fetchDepartments(this.selectedOrg);
      } catch (error) {
        alert(error.message);
      }
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
  height: 200px;
  margin: auto;
  background: lightblue;
  border-radius: 12px;
  border: 2px solid #000;
}

input, select, button {
  padding: 12px;
  font-size: 18px;
  width: 100%;
}
</style>