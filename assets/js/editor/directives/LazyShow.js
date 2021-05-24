'use strict';

angular.module('image.directives').directive('edLazyShow', ['$animate', function ($animate) {

    return {
        multiElement: true,
        transclude: 'element',
        replace: true,
        priority: 600,
        terminal: true,
        restrict: 'A',
        link: function ($scope, $element, $attr, $ctrl, $transclude) {
            var loaded,
            stopWatching = $scope.$watch($attr.edLazyShow, function(value) {
                if(value && ! loaded) {
                    loaded = true;
                    $transclude(function(clone) {
                        clone[clone.length++] = document.createComment(' end ngLazyShow: ' + $attr.ngLazyShow + ' ');
                        $animate.enter(clone, $element.parent(), $element);
                        $element = clone;
                    });
                    stopWatching();
                }
            });
        }
    };

}]);