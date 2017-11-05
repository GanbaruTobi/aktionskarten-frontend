<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
@import "~bulma/css/bulma.css";
html, body, #map, #app {
    margin: 0;
    height: 100%;
    width: 100%;
}
</style>
