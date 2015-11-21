
mapApp.config(function($stateProvider, $urlRouterProvider) {
  //
  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/");
  //
  // Now set up the states
  $stateProvider
  .state('home', {
    url: "/",
    templateUrl: "components/home/homeView.html"
  })
  .state('map', {
    url: "/:name/",
    templateUrl: "components/map/mapView.html"
  })
  .state('boundaries', {
    url: "/:name/boundaries",
    templateUrl: "components/map/mapView.html"
  })
  .state('map2', {
    url: "/:name/",
    templateUrl: "components/map/mapView.html"
  })
  .state('map3', {
    url: "/:name/",
    templateUrl: "components/map/mapView.html"
  });
});
