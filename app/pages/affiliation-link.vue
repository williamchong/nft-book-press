<script setup lang="ts">
const route = useRoute()
const localeRoute = useLocaleRoute()

navigateTo(localeRoute({ ...route, name: 'purchase-link' }) as typeof route, { redirectCode: 301 })
</script>
