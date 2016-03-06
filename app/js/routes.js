'use strict';

/*global mapApp*/

mapApp.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');

  // routes for app
  $stateProvider
    .state('index', {
      url: '/',
      templateUrl: 'partials/home.html',
      controller: 'IndexCtrl'
    })
    .state('new_map', {
      url: '/map/',
      templateUrl: 'partials/map.html',
      controller: 'MapCtrl'
    })
    .state('map', {
      url: '/map/:mapName',
      templateUrl: 'partials/map.html',
      controller: 'MapCtrl'
    });
}
);
