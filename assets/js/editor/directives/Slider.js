angular.module('image.directives')

.directive('edSlider', function() {
    return {
        restrict: 'E',
        template: '<div class="ed-range-slider"><div class="ed-slider-inner"><div class="slider-extender"></div><div class="focus-handle"></div></div></div>',
        replace: true,
        require: 'ngModel',
        link: function($scope, el, attrs, ctrl) {
            var elem = el.find('.ed-slider-inner');

            $scope.$watch(attrs.ngModel, function(n, o) {
                if (!n || n < min || n > max) return;
                elem.slider('value', n);
            });

            if (angular.isDefined(attrs.ngDisabled)) {
                attrs.$observe('disabled', function(isDisabled) {
                    if (isDisabled) {
                        elem.slider('disable');
                    } else {
                        elem.slider('enable');
                    }
                })
            }

            function bindAttributes() {
                attrs.min ? attrs.$observe('min', updateMin) : '';
                attrs.max ? attrs.$observe('max', updateMax) : '';
                attrs.step ? attrs.$observe('step', updateStep) : '';

                function updateMin(val) {
                    elem.slider('option', 'min', parseFloat(val)); min = val;
                }

                function updateMax(val) {
                    elem.slider('option', 'max', parseFloat(val)); max = val;
                }

                function updateStep(val) {
                    elem.slider('option', 'step', parseFloat(val));
                }
            }

            function updateModel(e, ui) {
                ctrl.$setViewValue(ui.value);
            }

            var isDiscrete = angular.isDefined(attrs.edDiscrete),
                options    = { create: bindAttributes, range: 'min'}, min, max;

            isDiscrete ? options.stop = updateModel : options.slide = updateModel;
            elem.slider(options);
        }
    }
});