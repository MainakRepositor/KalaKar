angular.module('ImageEditor')

.service('canvas', ['$rootScope', '$mdDialog', 'keybinds', function($rootScope, $mdDialog, keybinds) {

	var canvas = {

        original: {},

        //store window width and height so we don't execute
        //functions unnecessarily on resize event if they didn't change
        oldWindowDimensions: {
            width: window.innerWidth,
            height: window.innerHeight
        },

		mainImage: false,
		fabric: false,
		ctx: false,
		container: false,
		viewport: false,
		offset: false,
		element: false,

        minWidth: 50,
        minHeight: 50,

		imageStatic: {
            locked: true,
			selectable: false,
	      	evented: false,
	      	lockMovementX: true,
	      	lockMovementY: true,
	      	lockRotation: true,
	      	lockScalingX: true,
	      	lockScalingY: true,
	      	lockUniScaling: true,
	      	hasControls: false,
	      	hasBorders: false
		},

        destroy: function() {
            this.fabric.dispose();
            this.mainImage = false;
            this.fabric = false;
            this.ctx = false;
            this.container = false;
            this.viewport = false;
            this.offset = false;
            this.element = false;
            this.original = {};
            this.currentZoom = 1;
            $rootScope.editorCustomActions = {};
            $(window).off('resize');
            keybinds.destroy();
        },

		start: function(url) {
            this.element = document.getElementById('canvas');
            this.fabric = new fabric.Canvas('canvas');
            this.ctx = this.fabric.getContext('2d');
            this.container = $('.canvas-container');
            this.viewport = document.getElementById('viewport');
            $rootScope.editorCustomActions = {};

            this.fabric.selection = false; 
            this.fabric.renderOnAddRemove = false;

            fabric.Object.prototype.borderColor = '#2196F3';
            fabric.Object.prototype.cornerColor = '#2196F3';
            fabric.Object.prototype.transparentCorners = false;

            if ( ! url) url = $rootScope.getParam('url');

            if (url) {
                this.loadMainImage(url);
                $rootScope.started = true;
            } else if ($rootScope.getParam('blankCanvasSize')) {
                var size = $rootScope.getParam('blankCanvasSize');
                this.openNew(size.width, size.height, 'newCanvas');
                $rootScope.started = true;
            }

            if ( ! $rootScope.started && ! $rootScope.isIntegrationMode && ! $rootScope.delayEditorStart) {
                $mdDialog.show({
                    template: $('#main-image-upload-dialog-template').html(),
                    controller: 'TopPanelController',
                    clickOutsideToClose: false
                });
            }

            $(window).off('resize').on('resize', function(e) {
                if (canvas.oldWindowDimensions.height !== e.target.innerHeight ||
                    canvas.oldWindowDimensions.width !== e.target.innerWidth) {
                    canvas.fitToScreen();
                }

                canvas.oldWindowDimensions.width = e.target.innerWidth;
                canvas.oldWindowDimensions.height = e.target.innerHeight;
            });

            $rootScope.$emit('canvas.init');

            keybinds.init(this.fabric);

            if ($rootScope.getParam('onLoad')) {
                $rootScope.getParam('onLoad')(this.viewport, $rootScope, window); 
            }
        },

        hideModals: function() {
            $mdDialog.hide();
        },

        mergeObjects: function() {
            canvas.zoom(1);
            this.fabric.deactivateAll();
            var data = this.fabric.toDataURL();
            this.fabric.clear();
            this.loadMainImage(data);
        },

        loadFromJSON: function(design, callback) {
            canvas.fabric.loadFromJSON(design.serialized_editor_state || design.state, function() {
                canvas.fabric.forEachObject(function(obj) {

                    //reapply any filters object used to have
                    if (obj.applyFilters && obj.filters.length) {
                        obj.applyFilters(canvas.fabric.renderAll.bind(canvas.fabric));
                    }

                    //assign new reference to mainImage property
                    if (obj.name == 'mainImage') {
                        canvas.mainImage = obj;
                    }
                });

                if (design.width && design.height) {
                    canvas.fabric.setWidth(design.width);
                    canvas.fabric.setHeight(design.height);
                    canvas.original.height = design.height;
                    canvas.original.width = design.width;
                }

                canvas.fabric.renderAll();
                canvas.fabric.calcOffset();
                canvas.fitToScreen();
                $rootScope.$emit('history.loaded');

                callback && callback(design);
            });
        },

        /**
         * Create a new image with given dimensions.
         *
         * @param {int|string} width
         * @param {int|string} height
         * @param {string|undefined} name
         */
        openNew: function(width, height, name) {
            width = width < this.minWidth ? this.minWidth : width;
            height = height < this.minHeight ? this.minHeight : height;

            this.fabric.clear();
            this.fabric.setWidth(width);
            this.fabric.setHeight(height);
            this.fabric.renderAll();
            canvas.fitToScreen();

            //save the dimensions so we can scale images opened later to them
            $rootScope.userPreset = {
                width: width,
                height: height,
                name: name
            };

            canvas.original.height = height;
            canvas.original.width = width;

            $rootScope.$emit('canvas.openedNew');
        },

        center: function(obj) {
            obj.center();

            if (canvas.zoom > 100) {
                obj.setLeft(10);
                obj.setTop(35);
            }

            obj.setCoords();
        },

        serialize: function() {
            return this.fabric.toJSON(['selectable', 'name']);
        },

		loadMainImage: function(url, height, width, dontFit, callback) {
			var object;

			fabric.util.loadImage(url, function (img) {
                //img.crossOrigin = 'anonymous';

			    object = new fabric.Image(img, canvas.imageStatic);
			    object.name = 'mainImage';

                if (width && height) {
                    object.width = width;
                    object.height = height;
                }

			    canvas.mainImage = object;

                canvas.fabric.forEachObject(function(obj) {
                    if (obj.name == 'mainImage') {
                        canvas.fabric.remove(obj);
                    }
                });
			    canvas.fabric.add(object);
			   	object.top = -0.5;
			   	object.left = -0.5;
			    object.moveTo(0);

			    canvas.fabric.setHeight(object.height);
			    canvas.fabric.setWidth(object.width);

                canvas.original.height = object.height;
                canvas.original.width = object.width;

				if ( ! dontFit) {
                    canvas.fitToScreen();
                }

				$rootScope.$apply(function() {
					$rootScope.$emit('editor.mainImage.loaded');
				});

                if (callback) {
                    callback();
                }
			});
		},

        /**
         * Open image at given url in canvas.
         *
         * @param {string} url
         */
        openImage: function(url) {
            canvas.zoom(1);
            fabric.util.loadImage(url, function(image) {
                if ( ! image) return;

                var object = new fabric.Image(image);
                object.name = 'image';

                //use either main image or canvas dimensions as outter boundaries for scaling new image
                var maxWidth  = canvas.mainImage ? canvas.mainImage.getWidth() : canvas.fabric.getWidth(),
                    maxHeight = canvas.mainImage ? canvas.mainImage.getHeight() : canvas.fabric.getHeight();

                //if image is wider or heigher then the current canvas, we'll scale id down
                if (object.width >= maxWidth || object.height >= maxHeight) {

                    //calc new image dimensions (main image height - 10% and width - 10%)
                    var newWidth  = maxWidth - (0.1 * maxWidth),
                        newHeight = maxHeight - (0.1 * maxHeight),
                        scale     = 1 / (Math.min(newHeight / object.getHeight(), newWidth / object.getWidth()));

                    //scale newly uploaded image to the above dimesnsions
                    object.scaleX = object.scaleX * (1 / scale);
                    object.scaleY = object.scaleY * (1 / scale);
                }

                //center and render newly uploaded image on the canvas
                canvas.fabric.add(object);
                object.left = (canvas.fabric.getWidth() - object.getWidth()) / 2;
                object.top = (canvas.fabric.getHeight() - object.getHeight()) / 2;
                object.setCoords();
                canvas.fabric.setActiveObject(object);
                canvas.fabric.renderAll();

                canvas.fitToScreen();
            });
        },

        getDataURL: function(options) {
            if ( ! options) options = {};

            //ignore zoom when getting data url
            options.multiplier = 1 / canvas.currentZoom;

            return this.fabric.toDataURL(options);
        },

        currentZoom: 1,

        zoom: function(scaleFactor) {
            this.fabric.setZoom(scaleFactor);
            this.fabric.setHeight(this.original.height * scaleFactor);
            this.fabric.setWidth(this.original.width * scaleFactor);

            this.currentZoom = scaleFactor;
        },

        fitToScreen: function () {
            var maxWidth  = canvas.viewport.offsetWidth - 40,
                maxHeight = canvas.viewport.offsetHeight - 120,
                outter    = canvas.mainImage || canvas.fabric,
            	scale     = Math.min(maxHeight / outter.getHeight(), maxWidth / outter.getWidth());

            if (outter.getHeight() > maxHeight || outter.getWidth() > maxWidth) {
                canvas.zoom(scale); 
            }
        }
	};

	return canvas;

}]);