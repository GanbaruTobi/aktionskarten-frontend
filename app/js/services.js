'use strict';

/*global mapApp, turf*/

mapApp
  // Helper to calculate bounds from bbox
  .service('boundsHelper', ['leafletBoundsHelpers',
    function (leafletBoundsHelpers) {
      this.getBounds = function(bbox) {
        return leafletBoundsHelpers.createBoundsFromArray(
          [[bbox[3], bbox[2]],
          [bbox[1], bbox[0]]]
        );
      };
    }
  ])

  // Grid Service to generate grids for map
  .service('grid', ['gridCells', 'boundsHelper',
    function(gridCells, boundsHelper) {
      var units = 'kilometers';

      this.generateBorderOverlay = function(bbox) {
        return turf.bboxPolygon(bbox);
      };

      this.generateGridOverlay = function(bbox) {
        var bounds = boundsHelper.getBounds(bbox);
        var bottomLeft = [bounds.southWest.lng, bounds.southWest.lat];
        var bottomRight = [bounds.northEast.lng, bounds.southWest.lat];
        var topRight = [bounds.northEast.lng, bounds.northEast.lat];

        // calculate distance for bottomLeft and bottomRight to be able to
        // divide bbox into gridCells amount of cells
        var dist = turf.distance(turf.point(bottomLeft), turf.point(bottomRight), units);
        var cellWidth = dist/gridCells;

        // grid for bbox of bottomLeft, topRight
        var extent = bottomLeft.concat(topRight);
        var geojson = turf.squareGrid(extent, cellWidth, units);
        var borderOverlay = this.generateBorderOverlay(bbox);
        // show grid only in bounds
        for (var i=0; i<geojson.features.length; i++) {
          geojson.features[i] = turf.intersect(geojson.features[i], borderOverlay);
        }
        return geojson;
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
