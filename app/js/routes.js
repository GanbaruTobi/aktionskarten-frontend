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
    .state('map', {
      url: '/map/:name',
      templateUrl: 'partials/map.html',
      controller: 'MapCtrl'
    })
    .state('map.new', {
      url: '^/map/',
      templateUrl: 'partials/map.html',
      controller: 'MapCtrl'
    });
}
);
