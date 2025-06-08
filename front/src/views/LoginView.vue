<template>
  <Login @login-success="handleLogin" />
</template>

<script>
import Login from "../components/Login.vue"

export default {
  components: { Login },
  methods: {
    handleLogin() {
      this.$router.push('/select')
    }
  }
}
</script>