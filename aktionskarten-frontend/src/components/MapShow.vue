<template>
    <l-map ref="map" id="map" :zoom=13>
      <l-tilelayer :url="url" :attribution="attribution"></l-tilelayer>
      <l-geojson :v-if="grid" :geojson="grid" :options="gridOptions" /></l-geojson>
      <l-geojson :v-if="features" :geojson="features" :options="featureOptions" /></l-geojson>
    </l-map>
</template>

<script>
import Vue from 'vue'
import Vue2Leaflet from 'vue2-leaflet'
import get from 'axios'
import L from 'leaflet'

Vue.component('l-map', Vue2Leaflet.Map)
Vue.component('l-tilelayer', Vue2Leaflet.TileLayer)
Vue.component('l-geojson', Vue2Leaflet.GeoJSON)

export default {
  name: 'MapShow',
  props: ['mapName'],
  data () {
    return {
      baseUrl: 'http://localhost:5000/api/maps/',
      url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      bounds: null,
      grid: null,
      gridOptions: {
        style (f) { return f.properties }
      },
      features: [],
      featureOptions: {
        style (f) { return f.properties },
        pointToLayer (feature, latlng) {
          if (feature.properties.radius) {
            return L.circle(latlng,
              feature.properties.radius,
              feature.properties
            )
          }

          try {
            return L.marker(latlng, {icon: L.icon(feature.properties)})
          } catch (err) { console.log(err) }
          return L.marker(latlng)
        },
        onEachFeature (feature, layer) {
          layer.id = feature.properties.id
        }
      }
    }
  },

  computed: {
    mapUrl () { return this.baseUrl + this.mapName }
  },

  watch: {
    // center map
    bounds (newBounds) {
      this.$refs.map.fitBounds(newBounds)
    }
  },

  methods: {
    loadMap () {
      // get bounds of map
      get(this.mapUrl).then(response => {
        console.log(response)
        var bbox = response.data.bbox
        var a = L.GeoJSON.coordsToLatLng(bbox.slice(0, 2))
        var b = L.GeoJSON.coordsToLatLng(bbox.slice(2, 4))
        this.bounds = [a, b]
      })

      // load grid
      this.grid = []
      get(this.mapUrl + '/grid').then(response => {
        this.grid = response.data
      })

      // load features
      this.features = []
      get(this.mapUrl + '/features').then(response => {
        this.features = response.data
      })
    }
  },

  mounted () {
    this.loadMap()
  }
}
</script>

<style scoped>
@import "~leaflet/dist/leaflet.css";
</style>
