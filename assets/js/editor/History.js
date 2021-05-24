'use strict';

angular.module('ImageEditor')

.factory('history', ['$rootScope', 'canvas', function($rootScope, canvas) {

	var history = {

		all: [],

        //used for backing up canvas and other serializations
        //that are not visible to the user
        ignored: [], 

		add: function(name, icon, ignore) {
            var prop = ignore ? 'ignored' : 'all';

            //make sure don't have duplicates in ignored array
            if (prop === 'ignored') { 
                for (var i = 0; i < this.ignored.length; i++) {
                    if (this.ignored[i].name === name) {
                        this.ignored.splice(i, 1)
                    }
                }
            }

			this[prop].unshift({
				name: name,
				state: canvas.fabric.toJSON(['selectable', 'name']),
				index: this.all.length+1,
				icon: icon,
                zoom: canvas.zoom,
				canvasWidth: canvas.original.width || canvas.fabric.getWidth(),
				canvasHeight: canvas.original.height || canvas.fabric.getHeight()
			});
		},

        get: function(name, prop) {
            if ( !prop) prop = 'ignored';

            for (var i = 0; i < history[prop].length; i++) {
                if (history[prop][i].name === name) {
                    return history[prop][i];
                }
            }
        },

        getCurrentCanvasState: function() {
            return {
                state: canvas.fabric.toJSON(['selectable', 'name']),
                index: this.all.length+1,
                zoom: canvas.zoom,
                canvasWidth: canvas.original.width || canvas.fabric.getWidth(),
                canvasHeight: canvas.original.height || canvas.fabric.getHeight()
            }
        },

		load: function(item) {
			$rootScope.isLoading();

            //if we get passed a name, fetch a matching history item
            if (angular.isString(item)) {
                item = this.get(item);
            }

            if ( ! item) {
                return $rootScope.isNotLoading();
            }

			setTimeout(function() {
				canvas.fabric.loadFromJSON(item.state, function() {
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

                    canvas.zoom(1);

                    if (item.canvasWidth && item.canvasHeight) {
                        canvas.fabric.setWidth(item.canvasWidth);
                        canvas.fabric.setHeight(item.canvasHeight);
                        canvas.original.width = item.canvasWidth;
                        canvas.original.height = item.canvasHeight;
                    }

                    canvas.fabric.renderAll();
                    canvas.fabric.calcOffset();
                    $rootScope.isNotLoading();
                    canvas.fitToScreen();
                    $rootScope.$emit('history.loaded');
				});
			}, 30);
		}
	};

	return history;
}]);