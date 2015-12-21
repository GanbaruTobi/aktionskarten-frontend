'use strict';

/*global mapApp, L, turf*/

mapApp.controller('MapCtrl',
  ['$scope', 'api', 'defaults', '$stateParams', 'leafletData', 'grid',
    function ($scope, api, defaults, $stateParams, leafletData, grid) {
      var name = $stateParams.name;

      var DefaultIcon = L.Icon.extend({
        options: {
          iconSize: new L.Point(defaults.marker.iconSize, defaults.marker.iconSize),
          iconUrl: defaults.marker.iconUrl
        }
      });


      // we need direct access to featureGroup therefor we can not use overlay
      // functionality of ui-leaflet
      var features = L.featureGroup();
      angular.extend($scope, {
        name: 'Unnamed',
        center : {
          lat: defaults.lat,
          lng: defaults.lng,
          zoom: defaults.zoom
        },
        layers: {
          baselayers: {
            osm: {
              name: 'OpenStreetMap',
              url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              type: 'xyz'
            }
          }
        },
        controls: {
          draw: {
            draw : {
              marker: {
                icon: new DefaultIcon()
              }
            },
            edit: {
              featureGroup : features
            }
          }
        }
      });

      // if map identifier name is not given, render empty map
      if (!name) {
        // try to get location of user to center map
        $scope.center.autoDiscover = true;

      } else {
        $scope.name = name;
        // Load map
        api.getMap(name).success(function(data) {
          // center map by calculating center of bbox
          var centerPt = turf.center(data);
          angular.extend($scope.center, {
            lng: centerPt.geometry.coordinates[0],
            lat: centerPt.geometry.coordinates[1]
          });
        });

        // Load features for map, get them from geojson and add them to layer
        api.getFeaturesForMap(name).success(function(data) {
          L.geoJson(data, {
            pointToLayer: function(feature, latlng) {
              return new L.marker(latlng, {icon: new DefaultIcon()});
            },
            onEachFeature : function(feature, layer) {
                // save each feature in our FeatureGroup, sadly we can't use
                // L.geoJSON itself in combination with Leaflet.Draw
              features.addLayer(layer);
            }
          });
        });
      }

      // Everytime you zoom or move the map, bounds will be changed.
      // Therefor we watch bounds and regenerate the grid.
      var gridLayer;
      $scope.$watch('bounds', function() {
        if($scope.bounds) {
          var gridOverlay = grid.generateOverlay($scope.bounds);

          // add grid as geoJson layer to map
          // don't use ui-leaflet geoJSONShape because we need to set as
          // background layer
          leafletData.getMap().then(function(map) {
            // remove old grid
            if (gridLayer)
              map.removeLayer(gridLayer);

            gridLayer = L.geoJson(gridOverlay, {
              style: {
                weight: 2,
                fillOpacity: 0,  // disable fill color
                color: 'grey'
              }
            });

            // add layer and set to background
            map.addLayer(gridLayer);
            gridLayer.bringToBack();
          });
        }
      });

      // add our features to map and update on changes
      leafletData.getMap().then(function(map) {
        map.addLayer(features);
        map.on('draw:created', function (e) {
          // save feature as layer in FeatureGroup
          features.addLayer(e.layer);
        });
      });
    }
  ]
);

mapApp.controller('IndexCtrl',
  ['$scope', 'api',
    function ($scope, api) {
      api.getMapList().success(function(data) {
        angular.extend($scope, {
          maps: data
        });
      });
    }
  ]
);
