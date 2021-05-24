angular.module('image.shapes')

.service('polygon', ['$rootScope', '$mdDialog', 'canvas', function ($rootScope, $mdDialog, canvas) {

    var self = {

        mode: 'add',
        currentShape: false,

        onMouseMove: function(event) {
            var pos = canvas.fabric.getPointer(event.e);
            if (self.mode === "edit" && self.currentShape) {
                var points = self.currentShape.get("points");
                points[points.length - 1].x = pos.x - self.currentShape.get("left");
                points[points.length - 1].y = pos.y - self.currentShape.get("top");
                self.currentShape.set({
                    points: points
                });
                canvas.fabric.renderAll();
            }
        },

        onMouseDown: function(event) {
            var pos = canvas.fabric.getPointer(event.e);

            if (self.mode === "add") {
                var poly = new fabric.Polygon([{
                    x: pos.x,
                    y: pos.y
                }, {
                    x: pos.x + 0.5,
                    y: pos.y + 0.5
                }], {
                    fill: 'black',
                    opacity: 1,
                    selectable: false
                });
                self.currentShape = poly;
                self.currentShape.name = 'polygon';
                canvas.fabric.add(self.currentShape);
                self.mode = "edit";
            } else if (self.mode === "edit" && self.currentShape && self.currentShape.type === "polygon") {
                var points = self.currentShape.get("points");
                points.push({
                    x: pos.x - self.currentShape.get("left"),
                    y: pos.y - self.currentShape.get("top")
                });
                self.currentShape.set({
                    points: points
                });
                canvas.fabric.renderAll();
            }
        },

        onEscape: function(e) {
            if ((!e && self.currentShape) || e && e.keyCode === 27) {
                if (self.mode === 'edit' || self.mode === 'add') {
                    self.mode = 'normal';
                    self.currentShape.set({
                        selectable: true
                    });

                    self.currentShape._calcDimensions();
                    self.currentShape.setCoords();

                    canvas.fabric.setActiveObject(self.currentShape);
                    canvas.fabric.renderAll();
                } else {
                    self.mode = 'add';
                }

                self.currentShape = null;
            }
        },

        onClick: function(e) {
            var clickedInModal = $(e.target).closest('.md-dialog-container')[0];

            if (e.target.nodeName !== 'CANVAS' && $(e.target).closest('.shape').data('name') !== 'polygon' && !clickedInModal) {
                self.disable();
            }
        },

        enable: function() {
            if (this.enabled) return;

            this.enabled = true;
            canvas.fabric.on('mouse:move', self.onMouseMove);
            canvas.fabric.on('mouse:down', self.onMouseDown);
            fabric.util.addListener(window, 'keyup', self.onEscape);

            setTimeout(function() {
                fabric.util.addListener(window, 'click', self.onClick);
            }, 20);

            $mdDialog.show({
                templateUrl: 'modals/polygon.html',
                clickOutsideToClose: true,
                controller: ['$scope', '$mdDialog', function($scope, $mdDialog) {
                    $scope.closeModal = $mdDialog.hide;
                }]
            });
        },

        disable: function() {
            this.enabled = false;
            canvas.fabric.off('mouse:move', self.onMouseMove);
            canvas.fabric.off('mouse:down', self.onMouseDown);
            fabric.util.removeListener(window, 'keyup', self.onEscape);
            fabric.util.removeListener(window, 'click', self.onClick);
            self.onEscape();
        }
    };

    return self;

}]);