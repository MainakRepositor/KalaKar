angular.module('image.filters', [])

.controller('FiltersController', ['$scope', '$rootScope', 'canvas', 'filters', function($scope, $rootScope, canvas, filters) {

    $scope.filters = filters;

    $rootScope.$on('history.loaded', function () {
        if ( ! canvas.mainImage) return;

        var appliedFilters = [];

        for (var i = 0; i < canvas.mainImage.filters.length; i++) {
            appliedFilters.push(canvas.mainImage.filters[i].name);
        }

        $scope.$apply(function() {
            filters.appliedFilters = appliedFilters;
        });
    });
}]);
