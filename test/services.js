/* global describe, beforeEach, module, inject, it, expect */

describe('generate an grid overlay with grid service', function() {
  var grid;

  beforeEach(module('mapApp'));
  beforeEach(inject(function($injector) {
    grid = $injector.get('grid');
  }));

  var southWest = [52.436339, 13.241272];
  var northEast = [52.574681, 13.579102];
  var bbox = southWest.concat(northEast);

  it('grid generation should fail in case points are flipped', function() {
    var bboxFlipped = northEast.concat(southWest);
    expect(function() {
      grid.generateGridOverlay(bboxFlipped);
    }).toThrow(new Error('ValueError'));
  });


  it('southEast of bbox box should be inside of border overlay', function() {
    var overlay = grid.generateBorderOverlay(bbox);
    var tSouthWest = turf.point(southWest);

    expect(turf.inside(tSouthWest, overlay)).toBeTruthy();
  });

});
