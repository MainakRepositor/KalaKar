'use strict';

angular.module('image.directives')

.directive('edRenderBrushes', ['$rootScope', '$compile', function ($rootScope, $compile) {
    return {
        link: function ($scope, el) {
            var template = '<div ng-repeat="brush in drawing.availableBrushes" ng-class="{ active: drawing.activeBrushName == brush }" class="brush animated-in-sequence" ng-click="changeBrush(brush)">'+
                '<img class="img-responsive" ng-src="assets/images/brushes/{{brush}}.png"/>'+
                '<div class="brush-name">{{ brush }}</div>'+
            '</div>';

            var unbind = $rootScope.$on('tab.changed', function(e, name) {
                if (name === 'drawing') {
                    $scope.$apply(function() {
                        el.append($compile(template)($scope));
                    });
                    unbind();
                }
            });
        }
    };
}]);
