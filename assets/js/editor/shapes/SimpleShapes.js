angular.module('image.shapes')

.filter('orderOptions', function() {
    return function(items, field, reverse) {
        var filtered = [];
        angular.forEach(items, function(item, key) {
            item.name = key;
            filtered.push(item);
        });
        filtered.sort(function (a, b) {
            return (a[field] > b[field] ? 1 : -1);
        });
        if(reverse) filtered.reverse();

        return filtered;
    };
})

.service('simpleShapes', ['$rootScope', 'canvas', 'polygon', 'history', function ($rootScope, canvas, polygon, history) {

    var shapes = {

        gradients: edGradients,

        textures: new Array(28),

        baseOptions: {
            main: {
                enabled: true,
                opacity: { type: 'slider', current: 1, min: 0.1, max: 1, step: 0.1 },
                fill: { type: 'colorpicker', current: '#263238', hidden: true }
            },
            border: {
                enabled: false,
                onToggle: 'toggleBorder',
                stroke: { type: 'colorpicker', current: '#2196F3', displayName: 'Color' },
                strokeWidth: { type: 'slider', current: 5, max: 40, displayName: 'Width' }
            },
            shadow: {
                enabled: false,
                onToggle: 'toggleShadow',
                color: { type: 'colorpicker', current: 'rgba(0,0,0,0.5)'},
                blur: { type: 'slider', current: 5, max: 80 },
                offsetX: { type: 'slider', current: 8, max: 30 },
                offsetY: { type: 'slider', current: 5, max: 30 }
            }
        },

        available: [],

        selected: false,

        fillWithGradient: function(index, type) {
            var shape = canvas.fabric.getActiveObject();

            shape.setGradient(type||'fill', this.gradients[index]);

            canvas.fabric.renderAll();
        },

        fillWithImage: function(url) {
            var shape = canvas.fabric.getActiveObject();

            fabric.util.loadImage(url, function(img) {
                shape.setPatternFill({ source: img });
                canvas.fabric.renderAll();
            });
        },

        addToCanvas: function(shape) {
            if ( ! this.shapeExists(shape)) return;
            this.selected = shape;

            //we might need to enable a drawing mode instead
            //of added a shape to canvas if we get passed polygon
            if (shape.service && shape.service.enable) {
                return shape.service.enable();
            }

            var fabricShape = this.createNewShape(shape);

            canvas.fabric.add(fabricShape);
            canvas.center(fabricShape);
            canvas.fabric.setActiveObject(fabricShape);
            canvas.fabric.renderAll();

            history.add('Added: '+shape.name, 'panorama-vertical');
        },

        applyValue: function(group, name, option, value) {
            var setter = 'set'+fabric.util.string.capitalize(option, true),
                shape  = this.getShape(name);

            if (group === 'shadow') {
                return this.applyShadowValue(shape, option, value);
            }

            if (this.selected && this.selected.name === name) {

                //use setter if available, other simply assign the value
                shape[setter] ? shape[setter](value) : shape[option] = value;
                shape.setCoords();
                canvas.fabric.setActiveObject(shape);
                canvas.fabric.renderAll();
            }
        },

        applyShadowValue: function(shape, option, value) {
            if ( ! shape) return;

            var options = {
                color: this.selected.options.shadow.color.current,
                blur: this.selected.options.shadow.blur.current,
                offsetX: this.selected.options.shadow.offsetX.current,
                offsetY: this.selected.options.shadow.offsetY.current
            };

            if (option && value) {
                options[option] = value;
            }

            shape.setShadow(options);
            canvas.fabric.renderAll();
        },

        toggleShadow: function(name, on) {
            if (on) {
                this.applyShadowValue(this.getShape(name));
            } else {
                this.getShape(name).setShadow(false);
                canvas.fabric.renderAll();
            }
        },

        /**
         * Toggle border on/off on active object in the canvas.
         *
         * @param name
         * @param on
         */
        toggleBorder: function(name, on) {
            if (on) {
                this.getShape(name).setStroke(this.selected.options.border.stroke);
            } else {
                this.getShape(name).setStroke(false);
            }

            canvas.fabric.renderAll();
        },

        shapeExists: function(shape) {
            for (var i = 0; i < this.available.length; i++) {
                if (this.available[i].name === shape.name) {
                    return true;
                }
            }
        },

        /**
         * Return a first available fabric object that matches given name.
         *
         * @param name
         * @returns {fabric.Object|*}
         */
        getShape: function(name) {
            var active = canvas.fabric.getActiveObject();

            if (active && active.name === name) {
                return active;
            }

            canvas.fabric.forEachObject(function(obj) {
                if (obj.name === name) {
                    canvas.fabric.setActiveObject(obj);
                    return active = obj;
                }
            });

            return active;
        },

        /**
         * Create new fabric shape from given config object.
         *
         * @param shape
         */
        createNewShape: function(shape) {
            var shapeName = fabric.util.string.capitalize(shape.name, true);

            if (fabric[shapeName]) {

                var options = {
                    strokeWidth: shape.options.border.strokeWidth.current,
                };

                angular.forEach(shape.options.main, function(val, key) {
                    if (typeof val !== 'boolean') {
                       options[key] = val.current;
                    }
                });

                if (shape.options.points) {
                    var newShape = new fabric[shapeName](shape.options.points.current, options);
                } else {
                    var newShape = new fabric[shapeName](options);
                }

                newShape.name = shape.name;

                return newShape;
            }
        },

        selectShape: function(name) {
            if ( ! name || this.selected.name === name) return;

            for (var i = 0; i < this.available.length; i++) {
                if (this.available[i].name === name) {
                    return this.selected = this.available[i];
                }
            }
        }
    };

    var circleOptions = angular.copy(shapes.baseOptions);
    circleOptions.main.radius = { type: 'slider', current: 72, min: 20 };

    shapes.available.push({
        name: 'circle',
        options: circleOptions
    });

    var rectOptions = angular.copy(shapes.baseOptions);
    rectOptions.main.width = { type: 'slider', current: 140 };
    rectOptions.main.height = { type: 'slider', current: 140 };

    shapes.available.push({
        name: 'rect',
        displayName: 'rectangle',
        options: rectOptions
    });

    var triangleOptions = angular.copy(shapes.baseOptions);
    triangleOptions.main.width = { type: 'slider', current: 140, min: 25 };
    triangleOptions.main.height = { type: 'slider', current: 140, min: 25 };

    shapes.available.push({
        name: 'triangle',
        options: triangleOptions
    });

    var ellipse = angular.copy(shapes.baseOptions);
    ellipse.main.rx = { type: 'slider', current: 80, displayName: 'horizontal radius' };
    ellipse.main.ry = { type: 'slider', current: 30, displayName: 'vertical radius' };

    shapes.available.push({
        name: 'ellipse',
        options: ellipse
    });

    shapes.available.push({
        name: 'polygon',  options: angular.copy(shapes.baseOptions), service: polygon
    });

    return shapes;
}]);