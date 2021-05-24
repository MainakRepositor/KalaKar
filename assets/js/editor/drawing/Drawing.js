angular.module('image.drawing', [])

.service('drawing', ['$rootScope', 'canvas', function ($rootScope, canvas) {

    var drawing = {

        availableBrushes: ['pencil', 'vLine', 'diamond', 'hLine', 'circle', 'square', 'spray'],

        defaultBrushName: 'pencil',

        activeBrushName: false,

        isEnabled: false,

        params: {
            shadowColor: '#1E89E6',
            brushWidth: 9,
            brushColor: '#000',
            shadowBlur: 30,
            shadowOffsetX: 10,
            shadowOffsetY: 10,
            enableShadow: false
        },

        enable: function() {
            canvas.fabric.isDrawingMode = true;
            this.changeBrush(this.defaultBrushName);

            if ( ! this.shadow) {
                this.shadow = new fabric.Shadow({
                    color: this.params.shadowColor,
                    blur: this.params.shadowBlur,
                    offsetX: this.params.shadowOffsetX,
                    offsetY: this.params.shadowOffsetY
                });
            }

            this.isEnabled = true;
        },

        disable: function() {
            canvas.fabric.isDrawingMode = false;
            this.isEnabled = false;
        },

        setShadowProperty: function(name, value) {
            if (canvas.fabric.freeDrawingBrush.shadow[name]) {
                canvas.fabric.freeDrawingBrush.shadow[name] = value;
            }
        },

        setProperty: function(name, value) {
            if (canvas.fabric.freeDrawingBrush[name]) {
                canvas.fabric.freeDrawingBrush[name] = value;
            }
        },

        toggleShadow: function(on) {
            if (on) {
                canvas.fabric.freeDrawingBrush.shadow = this.shadow;
            } else {
                this.shadow = canvas.fabric.freeDrawingBrush.shadow;
                canvas.fabric.freeDrawingBrush.shadow = undefined;
            }
        },
        
        changeBrush: function(name) {
            this.activeBrushName = name;
            name = this.makeBrushName(name);

            //check if it's a base fabric brush
            if (fabric[name]) {
                canvas.fabric.freeDrawingBrush = new fabric[name](canvas.fabric);

            //check if it's a custom brush that we have already made
            } else if (this[name]) {
                canvas.fabric.freeDrawingBrush = this[name];

            //check if we can make a request brush
            } else if (this['make'+name]) {
                canvas.fabric.freeDrawingBrush = this['make'+name]();
            }

            canvas.fabric.freeDrawingBrush.width  = this.params.brushWidth;
            canvas.fabric.freeDrawingBrush.color  = this.params.brushColor;

            if (this.params.enableShadow) {
                canvas.fabric.freeDrawingBrush.shadow = this.shadow;
            }
        },

        /**
         * Compile a fabric brush function name from given name.
         *
         * @param name (pencil)
         * @returns string (PencilBrush)
         */
        makeBrushName: function(name) {
            return name.charAt(0).toUpperCase()+name.slice(1) + 'Brush';
        },

        makeVLineBrush: function() {
            this.VLineBrush = new fabric.PatternBrush(canvas.fabric);

            this.VLineBrush.getPatternSrc = function() {

                var patternCanvas = fabric.document.createElement('canvas');
                patternCanvas.width = patternCanvas.height = 10;
                var ctx = patternCanvas.getContext('2d');

                ctx.strokeStyle = this.color;
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(0, 5);
                ctx.lineTo(10, 5);
                ctx.closePath();
                ctx.stroke();

                return patternCanvas;
            };

            return this.VLineBrush;
        },

        makeDiamondBrush: function () {
            this.DiamondBrush = new fabric.PatternBrush(canvas.fabric);

            this.DiamondBrush.getPatternSrc = function() {

                var squareWidth = 10, squareDistance = 5;
                var patternCanvas = fabric.document.createElement('canvas');
                var rect = new fabric.Rect({
                    width: squareWidth,
                    height: squareWidth,
                    angle: 45,
                    fill: this.color
                });

                var canvasWidth = rect.getBoundingRectWidth();

                patternCanvas.width = patternCanvas.height = canvasWidth + squareDistance;
                rect.set({ left: canvasWidth / 2, top: canvasWidth / 2 });

                var ctx = patternCanvas.getContext('2d');
                rect.render(ctx);

                return patternCanvas;
            };

            return this.DiamondBrush;
        },

        makeHLineBrush: function () {
            this.HLineBrush = new fabric.PatternBrush(canvas.fabric);

            this.HLineBrush.getPatternSrc = function() {

                var patternCanvas = fabric.document.createElement('canvas');
                patternCanvas.width = patternCanvas.height = 10;
                var ctx = patternCanvas.getContext('2d');

                ctx.strokeStyle = this.color;
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(5, 0);
                ctx.lineTo(5, 10);
                ctx.closePath();
                ctx.stroke();

                return patternCanvas;
            };

            return this.HLineBrush;
        },

        makeSquareBrush: function () {
            this.SquareBrush = new fabric.PatternBrush(canvas.fabric);

            this.SquareBrush.getPatternSrc = function() {

                var squareWidth = 10, squareDistance = 2;

                var patternCanvas = fabric.document.createElement('canvas');
                patternCanvas.width = patternCanvas.height = squareWidth + squareDistance;
                var ctx = patternCanvas.getContext('2d');

                ctx.fillStyle = this.color;
                ctx.fillRect(0, 0, squareWidth, squareWidth);

                return patternCanvas;
            };

            return this.SquareBrush;
        }

    };

    return drawing;

}]);