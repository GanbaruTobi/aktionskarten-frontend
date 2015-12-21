'use strict';

mapApp
  .service('api', ['$http', 'domain', 'apiPrefix',
    function($http, domain, apiPrefix){
        var baseUrl = "//" + domain + apiPrefix;

        this.getMapList = function() {
            return $http.get(baseUrl);
        }

        this.getMap = function(name) {
          return $http.get(baseUrl + name);
        }

        this.getFeaturesForMap = function(name) {
          var url = baseUrl + name + '/features';
          return $http.get(url);
        }
      }
    ]
  );
