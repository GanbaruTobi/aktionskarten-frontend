'use strict';

/*global mapApp, L*/

mapApp.controller('MapCtrl',
  ['$scope', 'mapsApi', 'defaults', '$stateParams', 'leafletData', 'grid', 'boundsHelper',
    function ($scope, mapsApi, defaults, $stateParams, leafletData, grid, boundsHelper) {
      var mapName = $stateParams.mapName;

      var DefaultIcon = L.Icon.extend({
        options: {
          iconSize: new L.Point(defaults.marker.iconSize, defaults.marker.iconSize),
          iconUrl: defaults.marker.iconUrl
        }
      });
      var gridLayer;
      var borderLayer;

      // we need direct access to featureGroup therefor we can not use overlay
      // functionality of ui-leaflet
      var features = L.featureGroup();
      angular.extend($scope, {
        name: 'Unnamed',
        center : {
          lat: defaults.lat,
          lng: defaults.lng,
          zoom: defaults.zoom
        },
        layers: {
          baselayers: {
            osm: {
              name: 'OpenStreetMap',
              url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              type: 'xyz'
            }
          }
        },
        controls: {
          draw: {
            draw : {
              marker: {
                icon: new DefaultIcon()
              }
            },
            edit: {
              featureGroup : features
            }
          }
        }
      });

      // if map identifier mapName is not given, render empty map
      if (!mapName) {
        // try to get location of user to center map
        $scope.center.autoDiscover = true;
      } else {
        // load map
        angular.extend($scope, {
          mapName: mapName,
          restMap: mapsApi.one(mapName)
        });

        $scope.restMap.get().then(function(data) {
          // center map by calculating center of bbox
          angular.extend($scope.bounds,
            boundsHelper.getBounds(data.bbox)
          );

          // add grid for better orientation to map
          gridLayer = L.geoJson(grid.generateGridOverlay(data.bbox), {
            style: {
              weight: 2,
              fillOpacity: 0,  // disable fill color
              color: 'grey'
            }
          });

          // generate Bbox layer
          borderLayer = L.rectangle(
            [[$scope.bounds.southWest.lat, $scope.bounds.southWest.lng],
            [$scope.bounds.northEast.lat, $scope.bounds.northEast.lng]],
            {
              weight: 5,
              fillOpacity: 0,
              color: 'red'
            }
          );
          // mark as bbox
          borderLayer.bbox=true;

          leafletData.getMap().then(function(map) {
            // add layers and set to background
            if (gridLayer) {
              map.addLayer(gridLayer);
              gridLayer.bringToBack();
            }
            if (borderLayer) {
              features.addLayer(borderLayer);
            }
          });
        });

        // Load features for map, get them from geojson and add them to layer
        $scope.restMap.one('features').get().then(function(data) {
          L.geoJson(data, {
            pointToLayer: function(feature, latlng) {
              return new L.marker(latlng, {icon: new DefaultIcon()});
            },
            onEachFeature : function(feature, layer) {
              // check if feature is a circle
              if (feature.properties && feature.properties.radius) {
                layer = L.circle(layer.getLatLng(),feature.properties.radius);
              }
              layer.id = feature.id;
              // save each feature in our FeatureGroup, sadly we can't use
              // L.geoJSON itself in combination with Leaflet.Draw
              features.addLayer(layer);
            }
          });
        });
      }

      // add our features to map and update on changes
      leafletData.getMap().then(function(map) {
        map.addLayer(features);

        map.on('draw:created', function (e) {
          var geo = JSON.stringify(e.layer.toGeoJSON().geometry);
          var postData = {geo: geo, map: $scope.mapName};

          // if the layer is a circle save radius to properties
          if (e.layer.getRadius)
            postData.radius = e.layer.getRadius();

          // save feature as layer in FeatureGroup
          $scope.restMap.all('features').post(postData).then(
            function(data){e.layer.id = data.id;}
          );
          features.addLayer(e.layer);
        });

        map.on('draw:edited', function (e) {
          //save edited layers
          e.layers.eachLayer(function(layer){
            var geo = JSON.stringify(layer.toGeoJSON().geometry);
            if (layer.bbox) {
              // bbox has been edited
              $scope.restMap.patch({bbox: geo});

              // regenerate grid layer
              map.removeLayer(gridLayer);
              var bbox = layer.getBounds().toBBoxString().split(',').map(parseFloat);
              gridLayer = L.geoJson(grid.generateGridOverlay(bbox), {
                style: {
                  weight: 2,
                  fillOpacity: 0,  // disable fill color
                  color: 'grey'
                }
              });
              map.addLayer(gridLayer);
              gridLayer.bringToBack();
            } else {
              var patchData ={geo: geo, map: $scope.mapName};
              if (layer.getRadius)
                patchData.radius = layer.getRadius();
              $scope.restMap.one('features', layer.id).patch(patchData);
            }
          });
        });

        map.on('draw:deleted', function(e) {
          e.layers.eachLayer(function(layer){
            $scope.restMap.one('features', layer.id).remove();
          });
        });

      });
    }
  ]
);

mapApp.controller('IndexCtrl',
  ['$scope', 'mapsApi',
    function ($scope, mapsApi) {
      angular.extend($scope, {
        maps: mapsApi.getList().$object
      });
    }
  ]
);
