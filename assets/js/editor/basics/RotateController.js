angular.module('image.basics', [])

.controller('RotateController', ['$scope', '$rootScope', 'canvas', 'history', function($scope, $rootScope, canvas, history) {

        $scope.angle = 0;

        $scope.startRotator = function($event) {
            history.add('rotate-original-state', 'backup', true);
            $scope.openPanel('rotate', $event);
        };

        $scope.applyRotation = function() {
            $rootScope.activePanel = false;
            history.add('rotation', 'rotate-right');
        };

        $scope.cancel = function() {
            history.load('rotate-original-state');
            $rootScope.activePanel = false;
            $scope.angle = 0;
        };

        //rotate properly by scaling canvas to new height after rotating main image by 90 degrees
        $scope.rotateProper = function(originalAngle) {
            canvas.zoom(1);
            var angle = (canvas.mainImage.getAngle() + originalAngle) % 360;

            var height = Math.abs(canvas.mainImage.getWidth()*(Math.sin(angle*Math.PI/180)))+Math.abs(canvas.mainImage.getHeight()*(Math.cos(angle*Math.PI/180))),
                width = Math.abs(canvas.mainImage.getHeight()*(Math.sin(angle*Math.PI/180)))+Math.abs(canvas.mainImage.getWidth()*(Math.cos(angle*Math.PI/180)));

            canvas.fabric.setWidth(width * canvas.currentZoom);
            canvas.fabric.setHeight(height * canvas.currentZoom);
            canvas.original.height = height;
            canvas.original.width  = width;
            canvas.mainImage.center();

            canvas.fabric.forEachObject(function(obj) {
                obj.rotate((obj.getAngle() + originalAngle) % 360);
                obj.setCoords();
            });

            $rootScope.editorCustomActions.rotate = originalAngle;
            canvas.fabric.renderAll();
            canvas.fitToScreen();
        };

        //only rotate the objects of canvas while leaving canvas width/height intact
        $scope.rotate = function(angle, direction) {
            if ( ! angle || angle > 360 || angle < 0) return;
            var resetOrigin = false;

            canvas.fabric.forEachObject(function(obj) {

                if (direction && direction === 'left') {
                    angle = obj.getAngle() - 90;
                } else if (direction && direction === 'right') {
                    angle = obj.getAngle() + 90;
                }

                if ((obj.originX !== 'center' || obj.originY !== 'center') && obj.centeredRotation) {
                    $scope.setOriginToCenter && $scope.setOriginToCenter(obj);
                    resetOrigin = true;
                }

                angle = angle > 360 ? 90 : angle < 0 ? 270 : angle;

                obj.setAngle(angle).setCoords();

                if (resetOrigin) {
                    $scope.setCenterToOrigin && $scope.setCenterToOrigin(obj);
                }
            });

            canvas.fitToScreen();
            canvas.fabric.renderAll();
        };

        $scope.setOriginToCenter = function (obj) {
            obj._originalOriginX = obj.originX;
            obj._originalOriginY = obj.originY;

            var center = obj.getCenterPoint();

            obj.set({
                originX: 'center',
                originY: 'center',
                left: center.x,
                top: center.y
            });
        };

        $scope.setCenterToOrigin = function (obj) {
            var originPoint = obj.translateToOriginPoint(
                obj.getCenterPoint(),
                obj._originalOriginX,
                obj._originalOriginY);

            obj.set({
                originX: obj._originalOriginX,
                originY: obj._originalOriginY,
                left: originPoint.x,
                top: originPoint.y
            });
        };
}]);