'use strict';

/*global L, mapApp, turf*/

mapApp
  // Helper to calculate bounds from bbox
  .service('boundsHelper', ['gridCells', 'leafletBoundsHelpers',
    function (gridCells, leafletBoundsHelpers) {
      var units = 'kilometers';

      this.getBounds = function(bbox) {
        var bounds = leafletBoundsHelpers.createBoundsFromArray(
          [[bbox[3], bbox[2]],
          [bbox[1], bbox[0]]]
        );
        if (bounds.southWest.lng > bounds.northEast.lng ||
            bounds.southWest.lat > bounds.northEast.lat)
          throw new Error('ValueError');
        return bounds;
      };

      // return all 4 points of bbox as turf points
      this.getTurfBounds = function(bbox) {
        var bounds = this.getBounds(bbox);
        return {
          northWest: turf.point([bounds.southWest.lng, bounds.northEast.lat]),
          northEast: turf.point([bounds.northEast.lng, bounds.northEast.lat]),
          southEast: turf.point([bounds.northEast.lng, bounds.southWest.lat]),
          southWest: turf.point([bounds.southWest.lng, bounds.southWest.lat])
        };
      };

      // calculate distance
      // divide bbox length into gridCells amount of cells
      this.getCellWidth = function(bbox) {
        var bounds = this.getTurfBounds(bbox);
        var dist = turf.distance(bounds['southWest'], bounds['southEast'], units);
        return dist/gridCells;
      };

      // get linestring between two turf points
      this.getLine = function(point1, point2) {
        return turf.linestring([
          point1.geometry.coordinates,
          point2.geometry.coordinates
        ]);
      };

      // get featurecollections with the points  for the gridNames
      this.getGridLines = function(bbox) {
        var gridLines = {};

        var bounds = this.getTurfBounds(bbox);
        var cellWidth = this.getCellWidth(bbox);

        var orientations = {
          'north': ['northWest', 'northEast'],
          'south': ['southWest', 'southEast'],
          'east':  ['southEast', 'northEast'],
          'west':  ['southWest', 'northWest']
        };

        var point1, point2, line, offset;
        for(var orientation in orientations) {
          point1 = bounds[orientations[orientation][0]];
          point2 = bounds[orientations[orientation][1]];
          line = this.getLine(point1, point2);
          offset = turf.lineDistance(line, units) % cellWidth;

          point1 = turf.along(line, cellWidth/2, units);
          line = this.getLine(point1, point2);
          if (orientation == 'east' || orientation == 'west') {
            // lastlast  point needs extra calculation, because we do not enforce squares
            point2 = turf.along(line, turf.lineDistance(line, units)-offset/2, units);
            line = this.getLine(point1, point2);
          }

          var pointLine = turf.pointGrid(turf.extent(line), cellWidth, units);
          if (orientation == 'east' || orientation == 'west') {
            // features should be from north to south
            pointLine.features.push(point2);
            pointLine.features = pointLine.features.reverse();
          }

          gridLines[orientation] = pointLine;
        }
        return gridLines;
      };

      this.generateMarker = function(point, orientation, gridName) {
        var anchors = [0, 0];
        if (orientation == 'east' || orientation == 'south') {
          anchors = [12,12];
        }
        var icon = L.divIcon({
          className:'grid_name '+orientation,
          html:gridName,
          iconAnchor: anchors
        });
        // add to featureGroup
        return L.marker(
          point.geometry.coordinates.reverse(),
          {'icon': icon }
        );
      };
    }
  ])

  // Grid Service to generate grids for map
  .service('grid', ['boundsHelper',
    function(boundsHelper) {
      var units = 'kilometers';

      this.generateGridOverlay = function(bbox) {
        var layers = L.featureGroup();

        // grid for bbox of bottomLeft, topRight
        var borderOverlay = turf.bboxPolygon(bbox);
        var extent = turf.extent(borderOverlay);
        var cellWidth = boundsHelper.getCellWidth(bbox);
        var geojson = turf.squareGrid(extent, cellWidth, units);

        // show grid only in bounds
        for (var i=0; i<geojson.features.length; i++) {
          geojson.features[i] = turf.intersect(geojson.features[i], borderOverlay);
        }
        layers.addLayer(
          L.geoJson(geojson, {
            style: {
              weight: 2,
              fillOpacity: 0,  // disable fill color
              color: 'grey'
            }
          })
        );
        layers.addLayer(
          this.generateGridNames(bbox)
        );
        return layers;
      };

      this.generateGridNames = function(bbox) {
        var marker = L.featureGroup();
        // chars naming the grid
        var startChars = {
          north: 'A', south: 'A',
          east: 1, west: 1
        };

        var gridLines = boundsHelper.getGridLines(bbox);

        var pointLine, gridName;
        for (var orientation in gridLines) {
          gridName = startChars[orientation];
          pointLine = gridLines[orientation];

          // crate a marker for every point
          for (var point in pointLine.features) {
            point = pointLine.features[point];
            // add to featureGroup
            marker.addLayer(
              boundsHelper.generateMarker(point, orientation, gridName)
            );
            // prepare next char for naming grid
            if (typeof(gridName) == 'string')
              gridName = String.fromCharCode(gridName.charCodeAt(0) + 1);
            else
              gridName++;
          }
        }
        return marker;
      };
    }
  ])

  // API service to interact with backend api
  .service('mapsApi', ['$http', 'domain', 'apiPrefix', 'Restangular',
    function($http, domain, apiPrefix, restangular) {
      var baseUrl = 'http://' + domain + apiPrefix;
      restangular.setBaseUrl(baseUrl);
      restangular.setRequestSuffix('/');
      return restangular.service('maps');
    }
  ]);
