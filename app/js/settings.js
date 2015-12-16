'use strict';

mapApp
  .constant('protocol', 'http')
  .constant('domain', 'localhost')
  .constant('port', '8080')
  .constant('apiPrefix', '/api/v1/maps/')
  .service('SETTINGS', ['protocol', 'domain', 'port', 'apiPrefix',
      function(protocol, domain,port,apiPrefix){
        this.backendUrl = protocol+"://"+domain+":"+port+apiPrefix;
      }
    ]
  );
