/* in the case that the number of spots becomes rather high, then there
   should perhaps be a separate container for the selected spots, to
   not need to loop through all of them when adjusting or deleting */

(function() {
    var self;
    var SpotAdjuster = function(camera, spots, calibrationData) {
        self = this;
        self.camera = camera;
        self.spots = spots;
        self.calibrationData = calibrationData;
        self.adjustFactor = 10;
    };

    SpotAdjuster.prototype = {
        adjust: function(direction) {
            var movement = Vec2.Vec2(0, 0);
            if(direction === self.camera.dir.left) {
                movement.x -= this.adjustFactor;
            }
            else if(direction === self.camera.dir.up) {
                movement.y -= this.adjustFactor;
            }
            else if(direction === self.camera.dir.right) {
                movement.x += this.adjustFactor;
            }
            else if(direction === self.camera.dir.down) {
                movement.y += this.adjustFactor;
            }
            for(var i = 0; i < self.spots.spots.length; ++i) {
                if(self.spots.spots[i].selected) {
                    var arrayPosOffset = Vec2.divide(movement, self.spots.spacer);
                    self.spots.spots[i].newArrayPosition = Vec2.add(self.spots.spots[i].newArrayPosition, arrayPosOffset);
                    self.spots.spots[i].renderPosition = Vec2.add(self.spots.spots[i].renderPosition, movement);
                }
            }
        },
        deleteSpots: function() {
            for(var i = self.spots.spots.length - 1; i >= 0; --i) {
                if(self.spots.spots[i].selected) {
                    self.spots.spots.splice(i, 1);
                }
            }
        },
        addSpot: function(position) {
            var renderPosition = self.camera.mouseToCameraPosition(position);
            var adjustedPosition = Vec2.subtract(renderPosition, self.calibrationData.TL);
            // we don't want negative array coordinates
            adjustedPosition = Vec2.clamp(adjustedPosition, 0);
            // this array positioning is very naive! it should take
            // into account the array positions of the spots around it
            var newArrayPosition = Vec2.add(Vec2.divide(adjustedPosition, self.spots.spacer), Vec2.Vec2(1, 1));
            var arrayPosition = Vec2.round(newArrayPosition);
            var newSpot = {
                'arrayPosition': arrayPosition,
                'newArrayPosition': newArrayPosition,
                'renderPosition': renderPosition,
                'selected': false
            };
            // inserting the spot in order in the array
            var newSpotOrder = arrayPosition.y * self.calibrationData.arraySize.x + arrayPosition.x;
            for(var i = 0; i < self.spots.spots.length; ++i) {
                var spotPos = self.spots.spots[i].arrayPosition;
                var spotOrder = spotPos.y * self.calibrationData.arraySize.x + spotPos.x;
                if(newSpotOrder <= spotOrder) {
                    self.spots.spots.splice(i, 0, newSpot);
                    break;
                }
                else if(newSpotOrder > spotOrder) {
                    // if it is bigger than the last spot, append it to the array
                    if(i == self.spots.spots.length - 1) {
                        self.spots.spots.push(newSpot);
                        break; // required to not check it against itself
                    }
                    // otherwise check the next spot
                }
            }
        }
    };

    this.SpotAdjuster = SpotAdjuster;

}).call(self);
