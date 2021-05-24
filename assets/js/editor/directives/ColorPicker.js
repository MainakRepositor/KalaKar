'use strict';

angular.module('image.directives')

.directive('edColorPicker', ['$rootScope', '$parse', function ($rootScope, $parse) {
    return {
        link: function ($scope, el, attrs) {
            var flat = 'edFlat' in attrs;

            $scope.$watch(attrs.ngDisabled, function(newVal) {
                if (newVal) {
                    el.spectrum('disable');
                } else {
                    el.spectrum('enable');
                }
            });

            var params = {
                color: attrs.startColor,
                clickoutFiresChange: true,
                showPalette: !flat,
                palette: colorsForPicker,
                preferredFormat: 'hex',
                showAlpha: true,
                showInput: true,
                flat: flat,
                showButtons: !flat
            },
            setter = function(selectedColor) {
                $parse(attrs.edColorPicker)($scope, {color: selectedColor.toString()});
                el.val(selectedColor.toString());
            };

            if (attrs.edDiscrete !== undefined) {
                el.on('dragstop.spectrum', function(e, selectedColor) {
                    setter(selectedColor);
                });

                params.change = function(selectedColor) {
                    setter(selectedColor);
                }
            } else {
                params.move = function(selectedColor) {
                    setter(selectedColor);
                }
            }

            el.spectrum(params);
        }
    };
}]);
