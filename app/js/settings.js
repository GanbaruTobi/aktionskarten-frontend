'use strict';

/*global mapApp*/

mapApp
  .constant('domain', 'http://localhost:8080')
  .constant('apiPrefix', '/api/v1/')
  .constant('gridCells', 10)
  .constant('defaults', {
    lat: 51.505,   // London
    lng: -0.09,    // London
    zoom: 11,
    marker : {
      iconSize: 24,
      iconUrl : 'img/logos/24x24/attention.png'
    }
  })
  .constant(
    'validStyleKeys', [
      'color', 'weight', 'opacity', 'fillColor', 'fillOpacity', 'dashArray', 'radius'
    ]
  );
