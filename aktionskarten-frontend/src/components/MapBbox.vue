<template>
  <l-map ref="map" id="map" :zoom=13 :center="center">
    <l-draw :options="drawOptions" @l-created="created"></l-draw>
    <l-tilelayer :url="url" :attribution="attribution"></l-tilelayer>
  </l-map>
</template>

<script>
import L from 'leaflet'
import Vue from 'vue'
import Vue2Leaflet from 'vue2-leaflet'
import Vue2LeafletDraw from '@/components/LeafletDraw'
import axios from 'axios'

Vue.component('l-map', Vue2Leaflet.Map)
Vue.component('l-draw', Vue2LeafletDraw)

export default {
  name: 'MapNewBbox',
  props: ['mapName'],
  data () {
    return {
      url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      center: [52.4991, 13.4181],
      drawOptions: {
        draw: {
          polyline: false,
          polygon: false,
          circle: false,
          marker: false,
          circlemarker: false
        },
        edit: false
      }
    }
  },
  methods: {
    created (e) {
      var config = {
        headers: { 'Content-Type': 'application/json' }
      }
      var bounds = e.layer.getBounds()
      var bbox = L.GeoJSON.latLngsToCoords([bounds.getSouthEast(), bounds.getNorthWest()])
      var data = {
        name: this.mapName,
        bbox: [].concat.apply([], bbox)
      }
      axios.post('http://localhost:5000/api/maps', data, config)
      .then(response => {
        console.log(response)
        this.$router.push({name: 'MapShow', params: {mapName: response.data.id}})
      })
    }
  }

}
</script>

<style scoped>
@import "~leaflet/dist/leaflet.css";
</style>
