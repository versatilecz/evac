<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template id="app">
  <head>
    <h1>Evakuační system</h1>

    <nav>
      <RouterLink to="/"> Přehled </RouterLink>

      <RouterLink to="/config"> Nastavení </RouterLink>

      <RouterLink to="/locations"> Lokace </RouterLink>
      <RouterLink to="/rooms"> Místnosti </RouterLink>
      <RouterLink to="/scanners"> Skenery </RouterLink>
      <RouterLink to="/alarms"> Alarmy </RouterLink>
      <RouterLink to="/emails"> E-Maily </RouterLink>
      <RouterLink to="/devices"> Zařízení </RouterLink>
      <RouterLink to="/tools"> Nástroje </RouterLink>
    </nav>
  </head>

  <main>
    <RouterView />
  </main>

  <footer>
    <small>All rights reserved by Brulisto</small>
  </footer>
</template>
