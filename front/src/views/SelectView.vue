<template>
  <Select @select-success="handleSelect" />
</template>

<script>
import Select from "../components/Select.vue"

export default {
  components: { Select },
  methods: {
    handleSelect({ organizationId, departmentId }) {
      localStorage.setItem('organizationId', organizationId)
      localStorage.setItem('departmentId', departmentId)
      this.$router.push('/main')
    }
  }
}
</script>