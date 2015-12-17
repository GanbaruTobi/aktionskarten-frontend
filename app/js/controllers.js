'use strict';

mapApp.controller('MainController', ["$scope", function ($scope) {

  // else use London as center
  $scope.center = {
    lat: 51.505,
    lng: -0.09,
    zoom: 12
  };

  // try to get location of user to center map
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position){
      $scope.$apply(function(){
        $scope.center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          zoom: 12
        };
      });
    });
  };
}]);

mapApp.controller('MapController',
  ["$scope", "$http", "api", "$stateParams", "leafletData",
    function ($scope, $http, api, $stateParams, leafletData) {
      var name = $stateParams.name;
      api.getMap(name, function(data) {
        angular.extend($scope, {
          center: {
                lat: data.geometry.coordinates[0][0][1],
                lng: data.geometry.coordinates[0][0][0],
                zoom: 12
          }
        })
      });

      api.getFeaturesForMap(name, function(data) {
        angular.extend($scope, {
            geojson: { data : data }
        })
      });
    }
  ]
);
