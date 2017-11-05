import Vue from 'vue'
import Router from 'vue-router'
import MapShow from '@/components/MapShow'
import MapForm from '@/components/MapForm'
import MapBbox from '@/components/MapBbox'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/maps/:mapName',
      name: 'MapShow',
      component: MapShow,
      props: true
    },
    {
      path: '/maps/:mapName/bbox',
      name: 'MapBbox',
      component: MapBbox,
      props: true
    },
    {
      path: '/',
      name: 'Index',
      component: MapForm
    }
  ]
})
