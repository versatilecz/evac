<script setup>

import { RouterLink, RouterView } from 'vue-router'
</script>

<template id="app">
  <head>
    <h1>Evac system location</h1>

    <nav>
          <RouterLink to="/">Dashboard</RouterLink>

          <RouterLink to="/config">Config</RouterLink>

          <RouterLink to="/area">Area</RouterLink>
          <RouterLink to="/scanners">Scanners</RouterLink>
          <RouterLink to="/devices">Devices</RouterLink>
          <RouterLink to="/tools">Tools</RouterLink>

    </nav>
  </head>

  <main>
    <RouterView />
  </main>

  <footer>
    <small>All rights reserved by Brulisto</small>
  </footer>
</template>
