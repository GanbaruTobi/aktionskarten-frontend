'use strict';

mapApp
  .service('api', ['$http', 'domain', 'apiPrefix',
    function($http, domain, apiPrefix){
        var baseUrl = "//" + domain + apiPrefix;

        this.getMapList = function(cb) {
            $http.get(baseUrl).success(cb);
        }

        this.getMap = function(name, cb) {
          $http.get(baseUrl + name).success(cb);
        }

        this.getFeaturesForMap = function(name, cb) {
          var url = baseUrl + name + '/features';
          $http.get(url).success(cb);
        }
      }
    ]
  );
