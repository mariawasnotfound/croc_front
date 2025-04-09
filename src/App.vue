<template>
  <div>
    <Login v-if="!token" @login-success="handleLogin" />
    <Select v-else :token="token" />
  </div>
</template>


<script>
import Login from "./components/Login.vue";
import Select from "./components/Select.vue";


export default {
  components: { Login, Select },
  data() {
    return {
      token: null,
    };
  },
  methods: {
    handleLogin(token) {
      this.token = token;
    },
  },
};
</script>
