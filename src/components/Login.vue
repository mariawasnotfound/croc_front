<template>
  <div class="login-container">
    <input v-model="username" type="text" placeholder="Логин" />
    <input v-model="password" type="password" placeholder="Пароль" />
    <button @click="handleLogin" :disabled="!username || !password">Войти</button>
  </div>
</template>

<script>
import { login } from "../request/authorisation.js";

export default {
  data() {
    return {
      username: "",
      password: "",
    };
  },
  methods: {
    async handleLogin() {
      try {
        const token = await login(this.username, this.password);
        this.$emit("login-success", token);
      } catch (error) {
        alert(error.message);
      }
    },
  },
};
</script>

<style scoped>
.login-container {
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