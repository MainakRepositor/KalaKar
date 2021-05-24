angular.module('image.basics')

.controller('RoundedCornersController', ['$scope', '$rootScope', 'canvas', 'history', function($scope, $rootScope, canvas, history) {

    $scope.radius = 50;

    $scope.startRoundedCorners = function(e) {
        if ($rootScope.activePanel === 'round') return;

        $rootScope.openPanel('round', e);

        $scope.rect = new fabric.Rect({
            width: canvas.original.width,
            height: canvas.original.height,
            rx: $scope.radius,
            ry: $scope.radius,
            opacity: 1,
            fill: 'transparent',
            name: 'rounding-rect',
            stroke: '#fff',
            strokeDashArray: [5, 5],
            selectable: false,
            evented: false,
            ignore: true
        });

        canvas.fabric.add($scope.rect);
        canvas.fabric.renderAll();
    };

    $scope.adjustPreview = function() {
        if ( ! $scope.rect) return;

        $scope.rect.set({
            rx: $scope.radius, ry: $scope.radius
        });
        canvas.fabric.renderAll();
    };

    $scope.cancel = function(leavePanel) {
        canvas.fabric.remove($scope.rect);
        $scope.rect  = false;
        $scope.radius = 50;
        canvas.fabric.renderAll();

        if ( !leavePanel) {
            $rootScope.activePanel = false;
        }
    };

    $scope.apply = function() {
        $rootScope.editorCustomActions.roundCorners = angular.copy($scope.radius);

        canvas.fabric.remove($scope.rect);
        canvas.zoom(1);

        canvas.fabric.clipTo = function(ctx) {
            $scope.rect.render(ctx);
            canvas.fabric.clipTo = false;
        };
        var data = canvas.fabric.toDataURL(); //canvas.getDataURL();
        canvas.fabric.clear();
        $scope.cancel();

        canvas.loadMainImage(data, false, false, false, function() {
            $rootScope.$apply(function() {
                history.add('Round Corners', 'panorama-wide-angle');
            });
        });
    };

    $rootScope.$on('tab.changed', function(e, newTab, oldTab) {
        if (oldTab === 'basics' && $scope.rect && newTab !== 'basics') {
            $scope.cancel();
        }
    });

    $rootScope.$watch('activePanel', function(newPanel, oldPanel) {
        if (newPanel !== 'round' && oldPanel === 'round') {
            $scope.cancel(true);
        }
    });
}]);