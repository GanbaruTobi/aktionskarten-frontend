<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import L from 'leaflet'
import 'leaflet-draw'

const events = [
  L.Draw.Event.CREATED,
  L.Draw.Event.EDITED,
  L.Draw.Event.DELETED,
  L.Draw.Event.DRAWSTART,
  L.Draw.Event.DRAWSTOP,
  L.Draw.Event.DRAWVERTEX,
  L.Draw.Event.EDITSTART,
  L.Draw.Event.EDITMOVE,
  L.Draw.Event.EDITRESIZE,
  L.Draw.Event.EDITVERTEX,
  L.Draw.Event.EDITSTOP,
  L.Draw.Event.DELETESTART,
  L.Draw.Event.DELETESTOP,
  L.Draw.Event.TOOLBAROPENED,
  L.Draw.Event.TOOLBARCLOSED
]

export default {
  props: [ 'options' ],
  watch: {
    options () {
      this._remove()
      this._add()
    }
  },
  mounted () {
    this._add()
  },
  beforeDestroy () {
    this._remove()
  },
  methods: {
    deferredMountedTo (parent) {
      this.parent = parent
      var that = this.mapObject
      for (var i = 0; i < this.$children.length; i++) {
        this.$children[i].deferredMountedTo(that)
      }

      events.forEach((event) => {
        if (event) {
          const eventName = event.replace('draw:', '')
          const exposedName = 'l-' + eventName
          this.parent.on(event, (ev) => {
            this.$emit(exposedName, ev)
          })
        }
      })

      this.parent.addControl(this.mapObject)
    },
    _remove () {
      this.parent.removeControl(this.mapObject)
    },
    _add () {
      this.mapObject = new L.Control.Draw(this.options)
      if (this.$parent._isMounted) {
        this.deferredMountedTo(this.$parent.mapObject)
      }
    }
  }
}
</script>
