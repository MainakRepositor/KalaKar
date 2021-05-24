angular.module('image.basics')

.controller('ResizeController', ['$scope', '$rootScope', 'canvas', 'history', function($scope, $rootScope, canvas, history) {

    $scope.constrainProportions = true;

    $scope.percent = 100;

    $scope.startResizer = function($event) {
        $scope.width  = $scope.usePercentages ? 100 : Math.ceil(canvas.original.width);
        $scope.height = $scope.usePercentages ? 100 : Math.ceil(canvas.original.height);
        history.add('beforeResize', false, true);
        canvas.zoom(1);
        $scope.openPanel('resize', $event);
    };

    /**
     * Toggle resizing mode between percentages and pixles.
     *
     * @param {boolean} usePercentages
     */
    $scope.togglePercentages = function(usePercentages) {
        if (usePercentages) {
            $scope.width = ($scope.width / canvas.original.width) * 100;
            $scope.height = ($scope.height / canvas.original.height) * 100;
        } else {
            $scope.width = ($scope.width * canvas.original.width) / 100;
            $scope.height = ($scope.height * canvas.original.height) / 100;
        }
    };

    $scope.apply = function() {
        var currentWidth  = Math.ceil(canvas.original.width),
            currentHeight = Math.ceil(canvas.original.height),
            newWidth      = Math.ceil($scope.width),
            newHeight     = Math.ceil($scope.height);

        if ($scope.usePercentages) {
            var widthScale    = $scope.width / 100;
            var heightScale   = $scope.height / 100;
        } else {
            var widthScale    = $scope.width / canvas.original.width;
            var heightScale   = $scope.height / canvas.original.height;
        }

        if (currentWidth === newWidth && currentHeight === newHeight) return;

        resize(widthScale, heightScale);

        $rootScope.activePanel = false;
        history.add('resize', 'open-width');
        canvas.fitToScreen();
    };

    $scope.close = function() {
        $rootScope.activePanel = false;
        canvas.fitToScreen();
    };

    $scope.aspectToHeight = function(newWidth) {
        if ( ! $scope.constrainProportions) return;

        if ($scope.usePercentages) {
            $scope.height = newWidth;
        } else {
            var wRatio = parseFloat((canvas.original.width / newWidth).toPrecision(3));
            $scope.height = Math.ceil(canvas.original.height / wRatio);
        }
    };

    $scope.aspectToWidth = function(newHeight) {
        if ( ! $scope.constrainProportions) return;

        if ($scope.usePercentages) {
            $scope.width = newHeight;
        } else {
            var hRatio = parseFloat((canvas.original.height / newHeight).toPrecision(3));
            $scope.width = Math.floor(canvas.original.width / hRatio);
        }
    };

    function resize(widthScale, heightScale) {
        var newHeight = Math.round(canvas.original.height * heightScale),
            newWidth  = Math.round(canvas.original.width * widthScale);

        canvas.fabric.setHeight(newHeight);
        canvas.fabric.setWidth(newWidth);
        canvas.original.width = newWidth;
        canvas.original.height = newHeight;

        var objects = canvas.fabric.getObjects();
        for (var i in objects) {
            var scaleX = objects[i].scaleX;
            var scaleY = objects[i].scaleY;
            var left = objects[i].left;
            var top = objects[i].top;

            var tempScaleX = scaleX * widthScale;
            var tempScaleY = scaleY * heightScale;
            var tempLeft = left * widthScale;
            var tempTop = top * heightScale;

            objects[i].scaleX = tempScaleX;
            objects[i].scaleY = tempScaleY;
            objects[i].left = tempLeft;
            objects[i].top = tempTop;

            objects[i].setCoords();
        }

        canvas.fabric.renderAll();
    }
}]);