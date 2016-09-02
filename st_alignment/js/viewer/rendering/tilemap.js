'use strict';

(function() {
    var self;
    var Tilemap = function(tilemapLevels) {
        self = this;
        self.loadTilemap = function(tilemap) {
            self.tilemapLevels = tilemap.tilemapLevels;
            self.tilesize = Vec2.Vec2(tilemap.tileWidth, tilemap.tileHeight);
            self.tilemaps = {};
            for(var tilemapLevel in tilemap.tilemaps) {
                if(tilemap.tilemaps.hasOwnProperty(tilemapLevel)) {
                    var newTilemap = [];
                    for(var i = 0; i < tilemap.tilemaps[tilemapLevel].length; ++i) {
                        var imageRow = [];
                        for(var j = 0; j < tilemap.tilemaps[tilemapLevel][i].length; ++j) {
                            var image = new Image();
                            image.src = tilemap.tilemaps[tilemapLevel][i][j]; 
                            imageRow.push(image);
                        }
                        newTilemap.push(imageRow);
                    }
                    self.tilemaps[tilemapLevel] = newTilemap;
                } 
            }

        }
    };

    Tilemap.prototype = {
        getRenderableImages: function(tilePosition, tilemapLevel, radius) {
            radius = radius || 3;
            var tilePositions = self.getSurroundingTilePositions(tilePosition, tilemapLevel, radius);
            var images = self.getImagesAtTilePositions(tilePositions, tilemapLevel);
            return images;
        },
        getImagesAtTilePositions: function(tilePositions, tilemapLevel) {
            /* given a set of tile positions and a tile map level,
               the relevant images are returned from the tile map */
            var images = [];
            for(var i = 0; i < tilePositions.length; ++i) {
                var tile = Vec2.Vec2(tilePositions[i].x, tilePositions[i].y);
                var image = self.tilemaps[tilemapLevel][tile.x][tile.y]; 

                image.renderPosition = Vec2.scale(Vec2.multiply(tile, self.tilesize), tilemapLevel);
                image.scaledSize = Vec2.scale(self.tilesize, tilemapLevel);
                images.push(image);
            }
            return images;
        },
        getSurroundingTilePositions: function(tilePosition, tilemapLevel, radius) {
            /* given a specific tile position, the surrounding valid
               tile positions within a certain radius are returned.
               the radius variable includes the centre tile position */
            radius = radius || 3;
            var positions = [];
            var negBoundary = 1 - radius;
            var posBoundary = 0 + radius;
            var i = 0;
            for(var y = negBoundary; y < posBoundary; ++y) {
                for(var x = negBoundary; x < posBoundary; ++x) {
                    var xPos = tilePosition.x + x;
                    var yPos = tilePosition.y + y;
                    // make sure it is a valid tile
                    var tilemapHeight = self.tilemaps[tilemapLevel][0].length;
                    var tilemapWidth  = self.tilemaps[tilemapLevel].length;
                    if(!(xPos < 0 || xPos >= tilemapWidth ||
                         yPos < 0 || yPos >= tilemapHeight)) {
                        positions.push(Vec2.Vec2(xPos, yPos));
                        ++i;
                    }
                }
            }
            return positions;
        },
        getTilePosition: function(imagePosition, tilemapLevel) {
            /* calculates the tile position from a given image
               position, i.e. converts image to tile coordinates */
            var tileSizeInImageCoords = Vec2.scale(self.tilesize, tilemapLevel);
            var tilePos = Vec2.truncate(Vec2.divide(imagePosition, tileSizeInImageCoords));
            return tilePos;
        }
    };

    this.Tilemap = Tilemap;
  
}).call(this);
