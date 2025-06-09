<template>
  <div v-if="isAuthenticated">
    <MainDialog
      :organization-id="organizationId"
      :department-id="departmentId"
      @open-menu="showMenu = true"
      @staff-info-updated="updateStaffInfo"
    />
  </div>
</template>

<script>
import MainDialog from "../components/MainDialog.vue"

export default {
  components: { MainDialog },
  data() {
    return {
      organizationId: localStorage.getItem('organizationId'),
      departmentId: localStorage.getItem('departmentId'),
      showMenu: false,
      isAuthenticated: localStorage.getItem('isAuthenticated') === 'true'
    }
  },
  mounted() {
    if (!this.isAuthenticated) {
      this.$router.push('/login');
    }
  },
  methods: {
    updateStaffInfo(info) {
        this.staffInfo = {
        fullName: info.staffName,
        organization: info.organizationName,
        department: info.departmentName
      };
    }
  }
}
</script>