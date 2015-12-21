'use strict';

/*global mapApp, turf*/

mapApp
  // Grid Service to generate grids for map
  .service('grid', ['gridCells', 'leafletData',
    function(gridCells, leafletData) {
      var units = 'kilometers';

      this.generateOverlay = function(bounds) {
        var bottomLeft = [bounds.southWest.lng, bounds.southWest.lat];
        var bottomRight = [bounds.northEast.lng, bounds.southWest.lat];
        var topRight = [bounds.northEast.lng, bounds.northEast.lat];

        // calculate distance for bottomLeft and bottomRight to be able to
        // divide bbox into gridCells amount of cells
        var dist = turf.distance(turf.point(bottomLeft), turf.point(bottomRight), units);
        var cellWidth = dist/gridCells;

        // grid for bbox of bottomLeft, topRight
        var extent = bottomLeft.concat(topRight);
        return turf.squareGrid(extent, cellWidth, units);
      };
    }
  ])

  // API service to interact with backend api
  .service('api', ['$http', 'domain', 'apiPrefix',
    function($http, domain, apiPrefix) {
      var baseUrl = '//' + domain + apiPrefix;

      this.getMapList = function() {
        return $http.get(baseUrl);
      };

      this.getMap = function(name) {
        return $http.get(baseUrl + name);
      };

      this.getFeaturesForMap = function(name) {
        var url = baseUrl + name + '/features';
        return $http.get(url);
      };
    }
  ]);
