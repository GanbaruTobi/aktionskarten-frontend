
mapApp.config(function($stateProvider, $urlRouterProvider) {
  //
  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/");
  //
  // Now set up the states
  $stateProvider
  .state('home', {
    url: "/",
    templateUrl: "partials/home.html"
  })
  .state('map', {
    url: "/:name/",
    templateUrl: "partials/map.html"
  })
  .state('boundaries', {
    url: "/:name/boundaries",
    templateUrl: "partials/map.html"
  })
  .state('map2', {
    url: "/:name/",
    templateUrl: "partials/map.html"
  })
  .state('map3', {
    url: "/:name/",
    templateUrl: "partials/map.html"
  });
});
