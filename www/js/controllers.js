angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $ionicScrollDelegate) {

        $scope.timeTaken = 0;
        $scope.currentColor = "nothing so far";

        $scope.smarties = [
            {
                name: "red",
                color: [186, 26, 33, 0]
            },
            {
                name: "yellow",
                color: [217, 197, 94, 0]
            },
            {
                name: "green",
                color: [100, 200, 119, 0]
            },
            {
                name: "blue",
                color: [29, 180, 220, 0]
            },
            {
                name: "pink",
                color: [231, 128, 159, 0]
            },
            {
                name: "purple",
                color: [163, 130, 166, 0]
            },
            {
                name: "orange",
                color: [233, 102, 50, 0]
            },
            {
                name: "brown",
                color: [160, 82, 45, 0]
            }
        ];

        var canvas = document.getElementById('myCanvas');
        var context = canvas.getContext('2d');

        function rgbToLab(r, g, b) {
            var xyz = rgbToXyz(r, g, b);
            return xyzToLab(xyz[0], xyz[1], xyz[2]);
        }
        function rgbToXyz(r, g, b) {
            var _r = (r / 255);
            var _g = (g / 255);
            var _b = (b / 255);

            if (_r > 0.04045) {
                _r = Math.pow(((_r + 0.055) / 1.055), 2.4);
            }
            else {
                _r = _r / 12.92;
            }

            if (_g > 0.04045) {
                _g = Math.pow(((_g + 0.055) / 1.055), 2.4);
            }
            else {
                _g = _g / 12.92;
            }

            if (_b > 0.04045) {
                _b = Math.pow(((_b + 0.055) / 1.055), 2.4);
            }
            else {
                _b = _b / 12.92;
            }

            _r = _r * 100;
            _g = _g * 100;
            _b = _b * 100;

            X = _r * 0.4124 + _g * 0.3576 + _b * 0.1805;
            Y = _r * 0.2126 + _g * 0.7152 + _b * 0.0722;
            Z = _r * 0.0193 + _g * 0.1192 + _b * 0.9505;

            return [X, Y, Z];
        }
        function xyzToLab(x, y, z) {
            var ref_X = 95.047;
            var ref_Y = 100.000;
            var ref_Z = 108.883;

            var _X = x / ref_X;
            var _Y = y / ref_Y;
            var _Z = z / ref_Z;

            if (_X > 0.008856) {
                _X = Math.pow(_X, (1 / 3));
            }
            else {
                _X = (7.787 * _X) + (16 / 116);
            }

            if (_Y > 0.008856) {
                _Y = Math.pow(_Y, (1 / 3));
            }
            else {
                _Y = (7.787 * _Y) + (16 / 116);
            }

            if (_Z > 0.008856) {
                _Z = Math.pow(_Z, (1 / 3));
            }
            else {
                _Z = (7.787 * _Z) + (16 / 116);
            }

            var CIE_L = (116 * _Y) - 16;
            var CIE_a = 500 * (_X - _Y);
            var CIE_b = 200 * (_Y - _Z);

            return { L: CIE_L, A: CIE_a, B:CIE_b };
        }

        function componentToHex(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }

        function rgbToHex(r, g, b) {
            return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
        }

        function invert(rgb) {
            //rgb = [].slice.call(arguments).join(",").replace(/rgb\(|\)|rgba\(|\)|\s/gi, '').split(',');
            for (var i = 0; i < rgb.length; i++) rgb[i] = (i === 3 ? 1 : 255) - rgb[i];
            return rgb;
        }

        function getColorMatch(color) {
            var currentMin = 100;
            var colorName = null;
            for (var i = 0; i < $scope.smarties.length; i++) {
                var deltae = DeltaE.getDeltaE00(rgbToLab(color[0], color[1], color[2]), rgbToLab($scope.smarties[i].color[0], $scope.smarties[i].color[1], $scope.smarties[i].color[2]));
                if (deltae < currentMin) {
                    currentMin = deltae;
                    colorName = $scope.smarties[i].name;
                }
            }
            return colorName;
        }

        $scope.calculatePositions = function() {
            var start = new Date().getTime();
            // load image from data url
            var imageObj = new Image();
            imageObj.onload = function() {
                var imageSize = 1;
                var width = context.canvas.width * imageSize;
                var height = context.canvas.height * imageSize;
                context.drawImage(this, 0, 0, width, height);

                var STEP = 1;
                var STEPARRAY = 4 * STEP;
                var LINE_HEIGHT = 4 * width;
                console.time("getImageData");
                var data = context.getImageData(0, 0, width, height).data;
                console.timeEnd("getImageData");
                context.fillStyle = "rgba(0, 0, 0, 1)";
                var deltaE = DeltaE.getDeltaE00;

                var location = width * 4;
                for (y = 1; y < height; y = y + STEP) {
                    for (x = 0; x < width; x = x + STEP) {
                        if (deltaE(rgbToLab(data[location], data[location + 1], data[location + 2]),
                                rgbToLab(data[location - 4], data[location - 3], data[location - 2])) > 5) {
                            context.fillRect(x, y, 1, 1);
                        } else if (deltaE(rgbToLab(data[location], data[location + 1], data[location + 2]),
                                rgbToLab(data[location - LINE_HEIGHT], data[location - LINE_HEIGHT + 1], data[location - LINE_HEIGHT + 2])) > 5) {
                            context.fillRect(x, y, 1, 1);
                         }
                        location = location + STEPARRAY;
                    }
                }

                $scope.$apply(function () {
                    $scope.timeTaken = new Date().getTime() - start;
                });
                console.log($scope.timeTaken);
            };

            imageObj.src = 'img/smarties2.jpg';

        };

        $scope.clickOnSmartie = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            canvasX = $event.layerX;
            canvasY = $event.layerY + $ionicScrollDelegate.getScrollPosition().top;

            var data = context.getImageData(canvasX, canvasY, 1, 1).data;

            var div = document.getElementById('myColor');
            div.style.backgroundColor = rgbToHex(data[0], data[1], data[2]);
            $scope.currentColor = getColorMatch([data[0], data[1], data[2]]);
        };


    })

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  }
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
