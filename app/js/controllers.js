'use strict';

mapApp.controller('MapCtrl',
  ["$scope", "api", "defaults", "$stateParams", "leafletData",
    function ($scope, api, defaults, $stateParams, leafletData) {
      var name = $stateParams.name;

      // set defaults for map positioning (as fallback)
      angular.extend($scope, {
        name: "Unnamed",
        center : {
          lat: defaults.lat,
          lng: defaults.lng,
          zoom: defaults.zoom,
        },
        layers: {
          baselayers: {
            osm: {
              name: 'OpenStreetMap',
              url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              type: 'xyz'
            },
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
          angular.extend($scope, {
            center: {
              lat: data.geometry.coordinates[0][0][1],
              lng: data.geometry.coordinates[0][0][0],
              zoom: 11
            }
          })
        });

        // Load features for map
        api.getFeaturesForMap(name).success(function(data) {
          angular.extend($scope, {
              geojson: { data : data }
          })
        });
      }
    }
  ]
);

mapApp.controller('IndexCtrl',
  ["$scope", "api",
    function ($scope, api) {
      api.getMapList().success(function(data) {
        angular.extend($scope, {
          maps: data
        })
      })
    }
  ]
);
