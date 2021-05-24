angular.module('image.text')

.controller('TextController', ['$scope', '$rootScope', '$timeout', 'canvas', 'text', 'fonts', function($scope, $rootScope, $timeout, canvas, text, fonts) {
	$scope.text  = text;
	$scope.fonts = fonts;

	$scope.opacity = 1;
	$scope.fontSize = 25;
	$scope.enableOutline = true;
	$scope.filters = {
		category: 'handwriting',
		family: ''
	};

    $scope.isPanelEnabled = function() {
        var obj = canvas.fabric.getActiveObject();
        return obj && obj.name === 'text' && $rootScope.activeTab === 'text';
    };

	$scope.changeFont = function(font, e) {
        var active = canvas.fabric.getActiveObject();
		$rootScope.openPanel('text', e);

		if ( ! active || active.name !== 'text') {
			var newText = new fabric.IText('Double click me to edit my contents.', {
				fontWeight: 400,
				fontSize: 28 / canvas.currentZoom,
				fill: '#fff',
				removeOnCancel: true,
				name: 'text'
			});

			canvas.fabric.add(newText);
            newText.setTop(25);
            newText.setLeft(25);
			canvas.fabric.setActiveObject(newText);
			canvas.fabric.renderAll();
		}

        text.setProperty('fontFamily', font);
	};

	$scope.cancelAddingTextToCanvas = function() {
		var textObject = text.getTextObject();

		if (textObject.removeOnCancel) {
			text.removeTextFromCanvas(textObject);
		}

		$rootScope.activePanel = false;
	};

	$scope.finishAddingTextToCanvas = function() {
		var textObject = text.getTextObject();

		$rootScope.activePanel = false;
		$rootScope.$emit('text.added', textObject);
		canvas.fabric.setActiveObject(canvas.mainImage);
		fonts.createLinkToFont(textObject.fontFamily);
	};

	$rootScope.$on('tab.changed', function(e, name) {
		if (name == 'text') {
			var textObject = $scope.text.getTextObject();

			//if we can find an existing text object set it as active
			if (textObject) {
				textObject.removeOnCancel = false;
				canvas.fabric.setActiveObject(textObject);
			}
		}
	});

	fonts.getAll($scope.filters);
}]);