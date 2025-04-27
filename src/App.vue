<template>
  <div>
    <Login v-if="!isLogged" @login-success="handleLogin" />
    <div v-else>
      <button @click="handleLogout" class="logout-button">Выйти</button>
      <Select v-if="!organizationId || !departmentId" @select-success="handleSelect" />
      <MainDialog
        v-else
        :organization-id="organizationId"
        :department-id="departmentId"
      />
    </div>
  </div>
</template>

<script>
import Login from "./components/Login.vue";
import Select from "./components/Select.vue";
import MainDialog from "./components/MainDialog.vue";
import { logout } from "./request/logout.js";

export default {
  components: { Login: Login, Select: Select, MainDialog },
  data() {
    return {
      isLogged: false,
      organizationId: null,
      departmentId: null
    };
  },
  methods: {
    handleLogin() {
      this.isLogged = true;
    },
    handleSelect({ organizationId, departmentId }) {
      this.organizationId = organizationId;
      this.departmentId = departmentId;
    },
    async handleLogout() {
      try {
        await logout();
        this.isLogged = false;
        this.organizationId = null;
        this.departmentId = null;
      } catch (error) {
        alert(error.message);
      }
    }
  },
};
</script>

<style scoped>
.logout-button {
  margin: 10px auto;
  display: block;
  padding: 10px 20px;
  font-size: 18px;
  background: #ff6666;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.logout-button:hover {
  background: #ff3333;
}
</style>