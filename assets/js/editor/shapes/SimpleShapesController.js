angular.module('image.shapes', [])

.controller('SimpleShapesController', ['$scope', '$rootScope', '$timeout', 'canvas', 'simpleShapes', function($scope, $rootScope, $timeout, canvas, simpleShapes) {
	$scope.shapes = simpleShapes;

    $scope.available = ['rect', 'triangle', 'circle', 'ellipse', 'polygon'];

    $scope.isPanelEnabled = function() {
        var obj = canvas.fabric.getActiveObject();
        return obj && $scope.available.indexOf(obj.name) > -1 && simpleShapes.selected.options;
    };

    canvas.fabric.on('object:selected', function(object) {
        if ($rootScope.activeTab !== 'simple-shapes') return;
        simpleShapes.selectShape(object.target.name);
    });
}]);