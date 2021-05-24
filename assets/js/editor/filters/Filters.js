'use strict';

angular.module('image.filters')

.service('filters', ['$rootScope', 'canvas', 'history', function ($rootScope, canvas, history) {

    var filters = {

        all: [
            { name: 'grayscale' },
            { name: 'invert' },
            { name: 'sepia' },
            { name: 'sepia2' },
            {
                name: 'removeWhite',
                options: {
                    distance: { current: 10 },
                    threshold: { current: 50 }
                }
            },
            {
                name: 'brightness',
                options: {
                    brightness: { current: 50 }
                }
            },
            {
                name: 'noise',
                options: {
                    noise: { current: 40, max: 600 }
                }
            },
            {
                name: 'GradientTransparency',
                displayName: 'Gradient',
                options: {
                    threshold: { current: 40 }
                }
            },
            {
                name: 'pixelate',
                options: {
                    blocksize: { max: 40, current: 2 }
                }
            },
            {
                name: 'sharpen',
                uses: 'Convolute',
                matrix: [ 0, -1,  0, -1,  5, -1, 0, -1,  0 ]
            },
            {
                name: 'blur',
                uses: 'Convolute',
                matrix: [ 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9 ]
            },
            {
                name: 'emboss',
                uses: 'Convolute',
                matrix: [ 1,   1,  1, 1, 0.7, -1, -1,  -1, -1 ]
            },
            {
                name: 'tint',
                options: {
                    opacity: { current: 0.5, min: 0.1, max: 1, step: 0.1 },
                    color: { colorpicker: true, current: '#FF4081' }
                }
            },
            {
                name: 'multiply',
                options: {
                    color: { colorpicker: true, current: '#FF4081' }
                }
            },
            {
                name: 'blend',
                options: {
                    mode: { current: 'add', select: true, available: ['add', 'multiply', 'subtract', 'diff', 'screen', 'lighten', 'darken'] },
                    alpha: { current: 0.5, min: 0.1, max: 1, step: 0.1 },
                    color: { colorpicker: true, current: '#FF4081' }

                }
            }

        ],

        appliedFilters: [],

        applyFilter: function(filter) {
            if ( ! this.filterExists(filter)) return;

            if (this.filterAlreadyApplied(filter.name)) {
                return this.removeFilter(filter);
            }

            $rootScope.isLoading();
            filters.markAsApplied(filter.name);

            //need to use timeout to display loading spinner properly
            setTimeout(function() {
                canvas.fabric.forEachObject(function(obj) {
                    if (obj.applyFilters) {
                        obj.filters.push(filters.getFilter(filter));
                        obj.applyFilters(canvas.fabric.renderAll.bind(canvas.fabric));
                    }
                });

                history.add('filter: '+(filter.displayName || filter.name), 'brightness-6');
                filters.lastAppliedFilter = filter;
                $rootScope.isNotLoading();
            }, 30);
        },

        removeFilter: function(filter) {
            if ( ! this.filterExists(filter)) return;

            $rootScope.isLoading();
            filters.unmarkAsApplied(filter.name);

            setTimeout(function() {
                canvas.fabric.forEachObject(function(obj) {
                    if (obj.applyFilters) {
                        for (var i = 0; i < obj.filters.length; i++) {
                            if (obj.filters[i].name.toLowerCase() === filter.name.toLowerCase()) {
                                obj.filters.splice(i, 1);
                                obj.applyFilters(canvas.fabric.renderAll.bind(canvas.fabric));
                            }
                        }
                    }
                });

                filters.lastAppliedFilter = false;
                $rootScope.isNotLoading();
            }, 30);
        },

        applyValue: function(filterName, optionName, optionValue) {
            $rootScope.isLoading();

            setTimeout(function() {
                canvas.fabric.forEachObject(function(obj) {
                    if (obj.applyFilters) {
                        for (var i = 0; i < obj.filters.length; i++) {
                            var filter = obj.filters[i];

                            if (filter.type.toLowerCase() === filterName.toLowerCase()) {
                                filter[optionName] = optionValue;
                                obj.applyFilters(canvas.fabric.renderAll.bind(canvas.fabric));
                            }
                        }
                    }
                });

                $rootScope.isNotLoading();
            }, 30);
        },

        filterAlreadyApplied: function(name) {
            return this.appliedFilters.indexOf(name) !== -1
        },

        markAsApplied: function(name) {
            if (this.appliedFilters.indexOf(name) === -1) {
                this.appliedFilters.push(name);
            }
        },

        unmarkAsApplied: function(name) {
            for (var i = 0; i < this.appliedFilters.length; i++) {
                if (this.appliedFilters[i] === name) {
                    this.appliedFilters.splice(i, 1);
                }
            }
        },

        filterExists: function(filter) {
            return fabric.Image.filters[fabric.util.string.capitalize(filter.uses || filter.name, true)] !== undefined;
        },

        getFilter: function(filter) {
            var newFilter;

            if (filter.uses) {
                newFilter = new fabric.Image.filters[fabric.util.string.capitalize(filter.uses, true)]({ matrix: filter.matrix });
            }

            else {
                var options = {};

                for (var key in filter.options) {
                    options[key] = filter.options[key].current;
                }

                newFilter = new fabric.Image.filters[fabric.util.string.capitalize(filter.name, true)](options);
            }

            newFilter.name = filter.name;

            return newFilter;
        },
    };

    return filters;

}]);