'use strict';

/*global mapApp, L*/

mapApp.controller('MapCtrl',
  ['$scope', 'mapsApi', 'defaults', '$stateParams', 'leafletData', 'grid', 'boundsHelper', '$location', '$document', 'validStyleKeys',
    function ($scope, mapsApi, defaults, $stateParams, leafletData, grid, boundsHelper, $location, $document, validStyleKeys) {
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
        newMapOverlay: true
      });

      if (mapName) {
        var restMap = mapsApi.one(mapName);
 
        // if mapName is given check if it exists
        restMap.get().then(function(mapData){
          // it exists therefore load map
          angular.extend($scope, {
            newMapOverlay: false,
            restMap: restMap,
            mapName: mapName,
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
              },
              custom: L.control.styleEditor({
                position: 'topleft',
                openOnLeafletDraw: true,
                useGrouping: false
              })
            }
          });

          // center map by calculating center of bbox
          angular.extend($scope.bounds,
            boundsHelper.getBounds(mapData.bbox)
          );

          // add grid for better orientation to map
          gridLayer = grid.generateGridOverlay(mapData.bbox);

          // generate Bbox layer
          borderLayer = L.rectangle(
            [[$scope.bounds.southWest.lat, $scope.bounds.southWest.lng],
              [$scope.bounds.northEast.lat, $scope.bounds.northEast.lng]],
            {
              className: 'border-layer'
            }
          );
          // mark as bbox
          borderLayer.bbox=true;

          leafletData.getMap().then(function(map) {

            // resize map after css is applied correctly
            $document.ready(function(){map.invalidateSize();});

            // add layers and set to background
            if (gridLayer) {
              map.addLayer(gridLayer);
              gridLayer.bringToBack();
            }
            if (borderLayer) {
              map.addLayer(borderLayer);
            }
          });

          // Load features for map, get them from geojson and add them to layer
          $scope.restMap.one('features').get().then(function(featureData) {
            L.geoJson(featureData, {
              pointToLayer: function(feature, latlng) {
                return new L.marker(latlng, {icon: new DefaultIcon()});
              },
              style: function(feature) {
                return feature.properties;
              },
              onEachFeature : function(feature, layer) {
                // check if feature is a circle
                if (feature.properties && feature.properties.radius) {
                  layer = L.circle(layer.getLatLng(),
                    feature.properties.radius,
                    feature.properties
                  );
                }
                layer.id = feature.id;

                for (var k in feature.properties.style)
                  layer.options[k] = feature.properties.style[k];

                // save each feature in our FeatureGroup, sadly we can't use
                // L.geoJSON itself in combination with Leaflet.Draw
                features.addLayer(layer);
              }
            });
          });

          // add our features to map and update on changes
          leafletData.getMap().then(function(map) {
            map.addLayer(features);
            map.on('move', function() {
              // regenerate grid
              map.removeLayer(gridLayer);
              var bbox = map.getBounds().toBBoxString().split(',').map(parseFloat);
              gridLayer = grid.generateGridOverlay(bbox);
              map.addLayer(gridLayer);
              gridLayer.bringToBack();
              borderLayer.setBounds(map.getBounds());

              // save new bbox in backend
              var geo = JSON.stringify(borderLayer.toGeoJSON().geometry);
              $scope.restMap.patch({bbox: geo});

            });
            map.on('draw:created', function (e) {
              var geo = JSON.stringify(e.layer.toGeoJSON().geometry);
              var postData = {geo: geo, map: $scope.mapName};

              // if the layer is a circle save radius to properties
              if (e.layer.getRadius)
                postData.radius = e.layer.getRadius();

              var style = {};
              for (var k in e.layer.options) {
                if (validStyleKeys.indexOf(k) >= 0 && !!e.layer.options[k]) {
                  style[k] = e.layer.options[k];
                }
              }
              postData.style = style;

              // save feature as layer in FeatureGroup
              $scope.restMap.all('features').post(postData).then(
                function(featureData){e.layer.id = featureData.id;}
              );
              features.addLayer(e.layer);
            });

            map.on('draw:edited', function (e) {
              //save edited layers
              e.layers.eachLayer(function(layer){
                var geo = JSON.stringify(layer.toGeoJSON().geometry);
                var patchData ={geo: geo, map: $scope.mapName};
                if (layer.getRadius)
                  patchData.radius = layer.getRadius();
                $scope.restMap.one('features', layer.id).patch(patchData);
              });

            });

            // Persist style changes
            map.on('styleeditor:changed', function(e){
              var feature = $scope.restMap.one('features', e.id);

              var style = {};
              for (var k in e.options) {
                if (validStyleKeys.indexOf(k) >= 0 && !!e.options[k]) {
                  style[k] = e.options[k];
                }
              }
              feature.style = style;
              feature.patch();
            });

            // remove deleted features
            map.on('draw:deleted', function(e) {
              e.layers.eachLayer(function(layer){
                $scope.restMap.one('features', layer.id).remove();
              });
            });

          });
        }).catch(function(){
          // map with mapName does not exist
          angular.extend($scope, {
            mapName: mapName,
            center: {
              autoDiscover: true
            },
            // show only rectangle to enable user to create bbox
            controls: {
              draw: {
                draw : {
                  polyline: false,
                  polygon: false,
                  circle: false,
                  marker: false
                }
              }
            }
          });

          // if first rectangle is created it is the bbox -> create map
          leafletData.getMap().then(function(map) {
            map.on('draw:created', function (e) {
              var geo = JSON.stringify(e.layer.toGeoJSON().geometry);
              mapsApi.post({
                name: $scope.mapName,
                bbox: geo,
                public: $scope.mapPublic,
                editable: $scope.mapEditable
              }).then(function(){
                window.location.reload();
              });
            });
          });
        });
      } else {
        // no mapName is given -> create map
        angular.extend($scope, {
          mapName: '',
          center: {
            autoDiscover: true
          },
          // show only rectangle to enable user to create bbox
          controls: {
            draw: {
              draw : {
                polyline: false,
                polygon: false,
                circle: false,
                marker: false
              }
            }
          }
        });

        // if first rectangle is created it is the bbox -> create map
        leafletData.getMap().then(function(map) {
          map.on('draw:created', function (e) {
            var geo = JSON.stringify(e.layer.toGeoJSON().geometry);
            mapsApi.post({
              name: $scope.mapName,
              bbox: geo,
              public: $scope.mapPublic,
              editable: $scope.mapEditable
            }).then(function(){
              $location.path('/map/'+$scope.mapName);
            });
          });
        });
      }
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

