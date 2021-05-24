'use strict';

angular.module('ImageEditor')

.controller('ZoomController', ['$rootScope', '$scope', 'canvas', function($rootScope, $scope, canvas) {

    $scope.canvas = canvas;
    $scope.zoom = 1;
    $scope.maxScale = 200;
    $scope.minScale = 30;

    $rootScope.$on('editor.mainImage.loaded', function() { $scope.fitToScreen() });
    $rootScope.$on('canvas.openedNew', function() { $scope.fitToScreen() });

    $scope.$watch('canvas.currentZoom', function(newValue) {
        var canvasZoom = newValue * 100;

        if (canvasZoom !== $scope.zoom) {
            $scope.zoom = canvasZoom;
        }
    });

    $scope.fitToScreen = function () {
        $scope.zoom = canvas.currentZoom * 100;
            
        if (canvas.mainImage) {
            var oWidth = canvas.mainImage.originalState.width,
                oHeight = canvas.mainImage.originalState.height;
        } else {
            var oWidth = canvas.original.width,
                oHeight = canvas.original.height;
        }

        var maxScale = Math.min(3582 / oHeight, 5731 / oWidth) * 100,
            minScale = Math.min(141 / oHeight, 211 / oWidth) * 100;

        $scope.maxScale = Math.ceil(maxScale);
        $scope.minScale = Math.ceil(minScale);

        canvas.zoom(canvas.currentZoom);
    };

    //make sure we adjust zoom slider properly on history change
    $rootScope.$on('history.loaded', function() {
        $scope.zoom = canvas.currentScale * 100;
    });

    $scope.doZoom = function () {
        canvas.zoom($scope.zoom / 100);
    };

    $scope.getCurrentZoom = function() {
        return Math.round(canvas.currentZoom * 100);
    };
}]);



