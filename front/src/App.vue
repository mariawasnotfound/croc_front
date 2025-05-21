<template>
  <div class="app-container">
    <Login v-if="!isLogged" @login-success="handleLogin" />
    <div v-else>
      <div class="header-container">
        <button @click="handleLogout" class="logout-button">Выйти</button>
      </div>
      
      <div class="content-container">
        <Select v-if="showSelect" @select-success="handleSelect" />
        <template v-else>
          <Menu 
            v-if="showMenu"
            :staff-info="staffInfo"
            @close-menu="showMenu = false"
          />
          <MainDialog
            v-show="!showMenu"
            :organization-id="organizationId"
            :department-id="departmentId"
            @open-menu="showMenu = true"
            @staff-info-updated="updateStaffInfo"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import Login from "./components/Login.vue";
import Select from "./components/Select.vue";
import MainDialog from "./components/MainDialog.vue";
import Menu from "./components/Menu.vue";
import { logout } from "./request/logout.js";

export default {
  components: { Login, Select, MainDialog, Menu },
  data() {
    return {
      isLogged: false,
      organizationId: null,
      departmentId: null,
      showSelect: true,
      showMenu: false,
      staffInfo: {
        fullName: "",
        organization: "",
        department: ""
      }
    };
  },
  methods: {
    handleLogin() {
      this.isLogged = true;
    },
    handleSelect({ organizationId, departmentId }) {
      this.organizationId = organizationId;
      this.departmentId = departmentId;
      this.showSelect = false;
    },
    async handleLogout() {
      try {
        await logout();
        this.isLogged = false;
        this.organizationId = null;
        this.departmentId = null;
        this.showSelect = true;
        this.showMenu = false;
      } catch (error) {
        alert(error.message);
      }
    },
    updateStaffInfo(info) {
      this.staffInfo = {
        fullName: info.staffName,
        organization: info.organizationName,
        department: info.departmentName
      };
    }
  }
};
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header-container {
  display: flex;
  justify-content: flex-end;
  background-color: #f5f5f5;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 100;
}

.content-container {
  flex: 1;
  padding: 20px;
  position: relative;
}

.logout-button {
  padding: 10px 20px;
  font-size: 18px;
  background: #ff6666;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-button:hover {
  background: #ff3333;
}
</style>