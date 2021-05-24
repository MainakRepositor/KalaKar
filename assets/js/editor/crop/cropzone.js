angular.module('image.crop')

.service('cropzone', ['$rootScope', 'canvas', function($rootScope, canvas) {

	var cropzone = {

		rect: {},

		dragging: false,

		initiated: false,

		minHeight: 25,

		minWidth: 25,

		setWidth: function(width) {
            if ( ! width) return;

            width = parseInt(width);

			if (width < this.minWidth) {
				width = this.minWidth;
			}

			if (width > canvas.original.width) {
				width = canvas.original.width - 25;
			}

            this.rect.width = width;
			this.rect.setTop((canvas.original.height - this.rect.getHeight()) / 2);
			this.rect.setLeft((canvas.original.width - this.rect.getWidth()) / 2);
			this.rect.setCoords();
			this.drawGrid();
			this.drawOverlay();
			canvas.fabric.renderAll();
		},

		setHeight: function(height) {
            if ( ! height) return;

            height = parseInt(height);

			if (height < this.minHeight) {
				height = this.minHeight;
			}

            if (height > canvas.original.height) {
                height = canvas.original.height - 25;
            }

            this.rect.height = height;
			this.rect.setTop((canvas.original.height - this.rect.getHeight()) / 2);
			this.rect.setLeft((canvas.original.width - this.rect.getWidth()) / 2);
			this.rect.setCoords();
			this.drawGrid();
			this.drawOverlay();
			canvas.fabric.renderAll();
		},

		add: function() {
			this.drawMainZone();
			this.drawOverlay();
			this.drawGrid();
			this.attachEvents();

			canvas.fabric.renderAll();

			this.initiated = true;

			$rootScope.$emit('cropzone.added');
		},

		constrainWithinCanvas: function(object) {
		    var x = object.getLeft(), y = object.getTop();
		    var w = object.getWidth(), h = object.getHeight();
		    var maxX = canvas.original.width - w;
		    var maxY = canvas.original.height - h;

		    if (x < 0) {
		    	object.set('left', 0);
		    }
		    if (y < 0) {
		        object.set('top', 0);
			}
		    if (x > maxX) {
		        object.set('left', maxX);
		    }
		    if (y > maxY) {
		    	object.set('top', maxY);
		    }
		},

		constrainWithinCanvasOnScaling: function(object) {

		    var minX = object.getLeft();
		    var minY = object.getTop();
		    var maxX = object.getLeft() + object.getWidth();
		    var maxY = object.getTop() + object.getHeight();

		    if (minX < 0 || maxX > canvas.original.width) {
		        var lastScaleX = this.lastScaleX || 1;
		        object.setScaleX(lastScaleX);
		    }

		    if (minX < 0) {
		        object.setLeft(0);
		    }

		    if (minY < 0 || maxY > canvas.original.height) {
		        var lastScaleY = this.lastScaleY || 1;
		        object.setScaleY(lastScaleY);
		    }

		    if (minY < 0) {
		        object.setTop(0);
		    }

		    if (object.getWidth() < this.minWidth) {
		        object.width = this.minWidth;
		        object.setScaleX(1);
		    }

		    if (object.getHeight() < this.minHeight) {
		       object.height = this.minHeight;
		       object.setScaleY(1);
		    }

		    this.lastScaleX = object.getScaleX();
		    this.lastScaleY = object.getScaleY();
		},

		onMouseDown: function(event) {
			if (event.target && (event.target.name === 'cropzone' || event.target.name === 'crop.grid')) return;

			cropzone.dragging = true;

			//hide cropzone on single click on overlay
			cropzone.overlay.visible = false;
			cropzone.grid.visible = false;
			cropzone.rect.visible = false;

			//start position for drawing a cropzone
		    cropzone.rect.left = event.e.pageX - canvas.fabric._offset.left;
		    cropzone.rect.top = event.e.pageY - canvas.fabric._offset.top;

		    //make sure cropzone scale is 1 for accurate coordinates
		    cropzone.rect.scale(1);
            cropzone.overlay.scale(1);
            cropzone.grid.scale(1);
		    cropzone.mousex = event.e.pageX;
		    cropzone.mousey = event.e.pageY;

		    //prevent selection of objects while dragging
		    canvas.fabric.selection = false;

		    cropzone.drawOverlay();
		},

		onMouseMove: function(event) {
			if ( ! cropzone.dragging) return;

			var width  = event.e.pageX - cropzone.mousex,
				height = event.e.pageY - cropzone.mousey;

			//prevent cropzone going over the right edge
			if (canvas.offset.left + canvas.original.width < event.e.pageX) {
				width = (canvas.offset.left + canvas.original.width) - cropzone.mousex;
			}

			//left edge
			if (canvas.offset.left > event.e.pageX) {
				width = canvas.offset.left - cropzone.mousex;
			}

			//bottom edge
			if (canvas.offset.top + canvas.original.height < event.e.pageY) {
				height = (canvas.offset.top + canvas.original.height) - cropzone.mousey;
			}

			//top edge
			if (canvas.offset.top > event.e.pageY) {
				height = canvas.offset.top - cropzone.mousey;
			}

			cropzone.rect.width = width;
        	cropzone.rect.height = height;
        	cropzone.rect.moveTo(3);
            cropzone.rect.setCoords();
        	cropzone.drawOverlay();
	        cropzone.drawGrid();

			if ( ! cropzone.rect.visible) {
				cropzone.rect.visible = true;
				cropzone.overlay.visible = true;
				cropzone.grid.visible = true;
			}
		},

		onMouseUp: function() {
		   	cropzone.dragging = false;
		    canvas.fabric.selection = true;
		    cropzone.rect.setCoords();
            cropzone.grid.setCoords();
            cropzone.overlay.setCoords();

		    if (cropzone.rect.visible) {
		    	canvas.fabric.setActiveObject(cropzone.rect);
			}
		},

		attachEvents: function() {

			//redraw cropzone grid and overlay when cropzone is resized
			this.rect.on('moving', function() {
				cropzone.constrainWithinCanvas(cropzone.rect);
				cropzone.drawOverlay();
				cropzone.drawGrid();
			});

			this.rect.on('scaling', function(e) {
				cropzone.constrainWithinCanvasOnScaling(cropzone.rect, e);
				cropzone.drawOverlay();
				cropzone.drawGrid();
			});

			canvas.fabric.on("mouse:down", cropzone.onMouseDown);
			canvas.fabric.on("mouse:move", cropzone.onMouseMove);
			canvas.fabric.on("mouse:up", cropzone.onMouseUp);
		},

		remove: function() {
			canvas.fabric.off("mouse:down", cropzone.onMouseDown);
			canvas.fabric.off("mouse:move", cropzone.onMouseMove);
			canvas.fabric.off("mouse:up", cropzone.onMouseUp);

			canvas.fabric.remove(this.rect);
			canvas.fabric.remove(this.grid);
			canvas.fabric.remove(this.overlay);
            canvas.fabric.renderAll();
			this.initiated = false;
		},

		hide: function() {
			this.rect.visible = false;
			this.rect.hasControls = false;
			this.grid.visible = false;
			this.overlay.visible = false;
		},

		getOptimalDimensions: function () {
            var width = canvas.original.width / 2,
                height = canvas.original.height / 2,
                left = canvas.original.width / 4,
                top = canvas.original.height / 4;

			if (canvas.viewport.offsetWidth < canvas.original.width) {
				width = canvas.viewport.offsetWidth / 2;
				left = canvas.viewport.offsetWidth / 4;

			}

            if (canvas.viewport.offsetHeight < canvas.original.height) {
                height = canvas.viewport.offsetHeight / 2;
                top = canvas.viewport.offsetHeight / 4;
            }

			return {width: width, height: height, left: left, top: top};
		},

		drawMainZone: function() {
			var dimensions = this.getOptimalDimensions();

			this.rect = new fabric.Rect({
			    fill: 'transparent',
			    stroke: 'rgba(255, 255, 255, 0.6)',
			    hasBorders: false,
			    width: dimensions.width,
			    height: dimensions.height,
			    left: dimensions.left,
			    top: dimensions.top,
			    hasRotatingPoint: false,
			    name: 'cropzone',
			    cornerColor: 'rgba(255, 255, 255, 0.6)',
			    transparentCorners: false,
                ignore: true
			});

			canvas.fabric.add(this.rect);
			this.rect.moveTo(3);
			canvas.fabric.setActiveObject(cropzone.rect);
		},

		drawGrid: function() {

			if ( ! this.initiated) {
				this.line1 = new fabric.Line([], { stroke: 'rgba(255, 255, 255, 0.6)', strokeWidth: 1, selectable: false, evented: false });
				this.line2 = new fabric.Line([], { stroke: 'rgba(255, 255, 255, 0.6)', strokeWidth: 1, selectable: false, evented: false });
				this.line3 = new fabric.Line([], { stroke: 'rgba(255, 255, 255, 0.6)', strokeWidth: 1, selectable: false, evented: false });
				this.line4 = new fabric.Line([], { stroke: 'rgba(255, 255, 255, 0.6)', strokeWidth: 1, selectable: false, evented: false });
				this.grid = new fabric.Group([this.line1, this.line2, this.line3, this.line4]);
				this.grid.originY = 'left';
				this.grid.originX = 'top';
                this.grid.ignore = true;
                this.grid.selectable = false;
				canvas.fabric.add(this.grid);
		    	this.grid.moveTo(10);
			}

			this.grid.width = this.rect.getWidth();
			this.grid.height = this.rect.getHeight();
			this.grid.left = this.rect.getLeft();
			this.grid.top = this.rect.getTop();

			var width  = cropzone.rect.getWidth() / 3,
				height = cropzone.rect.getHeight() / 3;

			this.line1.set({
				x1: width,
				y1: 0,
				x2: width,
				y2: cropzone.grid.getHeight(),
			});

			this.line2.set({
				x1: width * 2,
				y1: 0,
				x2: width * 2,
				y2: cropzone.grid.getHeight()
			});

			this.line3.set({
				x1: 0,
				y1: height,
				x2: cropzone.grid.getWidth(),
				y2: height
			});

			this.line4.set({
				x1: 0,
				y1: height * 2,
				x2: cropzone.grid.getWidth(),
				y2: height * 2
			});

			this.constrainWithinCanvas(this.grid);
		},

		drawOverlay: function() {

	    	if ( ! this.initiated) {
	    		this.topRect = new fabric.Rect({fill: 'rgba(0,0,0,0.7)', selectable: true, evented: false});
	    		this.rightRect = new fabric.Rect({fill: 'rgba(0,0,0,0.7)', selectable: true, evented: false});
	    		this.bottomRect = new fabric.Rect({fill: 'rgba(0,0,0,0.7)', selectable: true, evented: false});
	    		this.leftRect = new fabric.Rect({fill: 'rgba(0,0,0,0.7)', selectable: true, evented: false});
	    		this.overlay = new fabric.Group([this.topRect, this.rightRect, this.bottomRect, this.leftRect]);
                this.overlay.ignore = true;
                this.overlay.name = 'grid.overlay';
				canvas.fabric.add(this.overlay);
				this.overlay.moveTo(1);
	    	}

    		this.topRect.set({
	    		left: 0,
				top: 0,
				width: canvas.original.width,
				height: this.rect.getHeight() < 0 ? this.rect.getTop() - Math.abs(this.rect.getHeight()) : this.rect.getTop(),
	    	});

	    	this.rightRect.set({
	    		left: this.rect.getWidth() < 0 ? this.rect.getLeft() : this.rect.getLeft() + this.rect.getWidth(),
				top: this.rect.getTop(),
				width: this.rect.getWidth() < 0 ? canvas.original.width - (this.rect.getLeft() + this.rect.getWidth()) - Math.abs(this.rect.getWidth()) : canvas.original.width - (this.rect.getLeft() + this.rect.getWidth()),
				height: this.rect.getHeight(),
	    	});

	    	this.bottomRect.set({
	    		left: 0,
				top: this.rect.getHeight() < 0 ? this.rect.getTop() : this.rect.getTop() + this.rect.getHeight(),
				width: canvas.original.width,
				height: this.rect.getHeight() < 0 ? canvas.original.height - (this.rect.getTop()) : canvas.original.height - (this.rect.getTop() + this.rect.getHeight()),
	    	});

	    	this.leftRect.set({
	    		left: 0,
				top: this.rect.getTop(),
				width: this.rect.getWidth() > 0 ? this.rect.getLeft() : this.rect.getLeft() - Math.abs(this.rect.getWidth()),
				height: this.rect.getHeight(),
	    	});


	    }
	};

	return cropzone;

}]);