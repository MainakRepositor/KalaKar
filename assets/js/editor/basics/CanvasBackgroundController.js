angular.module('image.basics')

.controller('CanvasBackgroundController', ['$scope', '$rootScope', 'canvas', 'history', function($scope, $rootScope, canvas, history) {

    $scope.setBackground = function(color) {
        canvas.fabric.setBackgroundColor(color);
        canvas.fabric.renderAll();
    };

    $scope.apply = function() {
        $rootScope.activePanel = false;
        history.add('Canvas Color', 'format-color-fill');
    };

    $scope.cancel = function() {
        $rootScope.activePanel = false;
        canvas.fabric.setBackgroundColor('');
        canvas.fabric.renderAll();
    };
}]);