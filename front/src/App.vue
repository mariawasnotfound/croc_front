<template>
  <router-view />
</template>

<script>
export default {
  name: 'App',
  mounted() {
    this.HandlesPageClose();
  },
  methods: {
    HandlesPageClose() {
      sessionStorage.removeItem('isPageReload');
      window.addEventListener('beforeunload', () => {
        sessionStorage.setItem('isPageReload', 'true');
      });
      window.addEventListener('pagehide', () => {
        if (!sessionStorage.getItem('isPageReload')) {
          this.cleanUpSession();
        }
      });
    },
    cleanUpSession() {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('organizationId');
      localStorage.removeItem('departmentId');
    }
  }
}
</script>