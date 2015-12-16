'use strict';

mapApp.controller('MainController', function ($scope) {

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
});

mapApp.controller('MapController', function ($scope,  SETTINGS, $stateParams, leafletData, $http) {
  name = $stateParams.name

    $http.get(SETTINGS.backendUrl+name).then(function(result){
        
        angular.extend($scope, {
          center: {
            lat: result.data.geometry.coordinates[0][0][0],
            lng: result.data.geometry.coordinates[0][0][1],
            zoom: 12
          }
        });
      
      $scope.data = result.data.geometry
  });
});
