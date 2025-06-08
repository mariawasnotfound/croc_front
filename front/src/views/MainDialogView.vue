<template>
  <MainDialog
    :organization-id="organizationId"
    :department-id="departmentId"
    @open-menu="showMenu = true"
    @staff-info-updated="updateStaffInfo"
  />
</template>

<script>
import MainDialog from "../components/MainDialog.vue"

export default {
  components: { MainDialog },
  data() {
    return {
      organizationId: localStorage.getItem('organizationId'),
      departmentId: localStorage.getItem('departmentId'),
      showMenu: false
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