<script setup lang="ts">
const route = useRoute()

navigateTo({ ...route, name: 'purchase-link' }, { redirectCode: 301 })
</script>
