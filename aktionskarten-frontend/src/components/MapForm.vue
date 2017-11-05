<template>
  <section class="section">
    <div class="container">
    <h1 class="title">Aktionskarten</h1>
    <h2 class="subtitle">
        Your map for your weekly political activism.
    </h2>
    <form @submit="submit()">
      <div class="field is-grouped">
      <p class="control is-expanded">
        <input class="input" type="text" v-model="mapName" placeholder="Name of new map">
      </p>
      <p class="control">
        <a class="button is-info">
          Create Map
        </a>
      </p>
      </div>
    </form>
  </div>
  </div>
  </section>
</template>

<script>
import get from 'axios'

export default {
  name: 'MapNew',
  data () {
    return {
      'mapName': ''
    }
  },
  methods: {
    submit () {
      var url = 'http://localhost:5000/api/maps/' + this.mapName

      get(url).then(response => {
        this.$router.push({name: 'MapShow', params: {mapName: this.mapName}})
      })
      .catch(error => {
        if (error.response) {
          console.log(error.response.data)
          console.log(error.response.status)
          console.log(error.response.headers)
        }
        this.$router.push({name: 'MapBbox', params: {mapName: this.mapName}})
      })
    }
  }
}
</script>

<style>
html, body, #map, #app {
    margin: 0;
    height: 100%;
    width: 100%;
}
</style>
