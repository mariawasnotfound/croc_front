<template>
  <div>
    <Login v-if="!token" @login-success="handleLogin" />
    <Select
      v-else-if="!organizationId || !departmentId"
      :token="token"
      @select-success="handleSelect"
    />
    <MainDialog
      v-else
      :token="token"
      :organization-id="organizationId"
      :department-id="departmentId"
    />
  </div>
</template>

<script>
import Login from "./components/Login.vue";
import Select from "./components/Select.vue";
import MainDialog from "./components/MainDialog.vue";

export default {
  components: { Login: Login, Select: Select, MainDialog },
  data() {
    return {
      token: null,
      organizationId: null,
      departmentId: null
    };
  },
  methods: {
    handleLogin(token) {
      this.token = token;
    },
    handleSelect({ organizationId, departmentId }) {
      this.organizationId = organizationId;
      this.departmentId = departmentId;
    }
  },
};
</script>
