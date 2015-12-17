'use strict';

mapApp.config(function($stateProvider, $urlRouterProvider) {
  //$urlRouterProvider.otherwise("/");

  // routes for app
  $stateProvider
    .state('home', {
      url: "/",
      templateUrl: "partials/home.html",
      controller: function($scope) {
        console.log("Main");
      }
    })
    .state('map', {
      url: "/map/:name",
      templateUrl: "partials/map.html",
      controller: 'MapController'
    })
    .state('map.new', {
      url: "^/map/",
      templateUrl: "partials/map.html",
      controller: 'MapController'
    })
  }
);
