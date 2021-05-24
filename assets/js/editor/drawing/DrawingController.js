angular.module('image.drawing')

.controller('DrawingController', ['$scope', '$rootScope', 'canvas', 'drawing', 'history', function($scope, $rootScope, canvas, drawing, history) {
	$scope.drawing = drawing;
    window.fb = canvas.fabric;

	$scope.changeBrush = function(brush, $event) {
		$scope.openPanel('drawing', $event);

		if ( ! drawing.isEnabled) {
			drawing.enable();
		}

		drawing.changeBrush(brush);
	};

	$scope.finishAddingDrawingsToCanvas = function() {
		$rootScope.activePanel = false;

        if (canvas.mainImage) {
            canvas.fabric.setActiveObject(canvas.mainImage);
        }

		canvas.fabric.forEachObject(function(obj) {
			if (obj.name === 'freeDrawing') {
				obj.removeOnCancel = false;
			}
		});

        drawing.disable();
		history.add('added drawing', 'brush');
	};

	$scope.cancelAddingDrawingsToCanvas = function() {
        canvas.fabric.forEachObject(function (obj) {
			if (obj.name === 'freeDrawing' && obj.removeOnCancel) {
				canvas.fabric.remove(obj);
			}
		});

		drawing.disable();
        canvas.fabric.renderAll();
		$rootScope.activePanel = false;
	};

	$rootScope.$on('tab.changed', function(e, name) {
		if (name !== 'drawing') {
			drawing.disable();
			$scope.cancelAddingDrawingsToCanvas();
		}
	});

	canvas.fabric.on('path:created', function(e) {
		if (drawing.isEnabled) {
			e.path.setOptions(canvas.imageStatic);
			e.path.name = 'freeDrawing';
			e.path.removeOnCancel = true;
		}
	});
}]);