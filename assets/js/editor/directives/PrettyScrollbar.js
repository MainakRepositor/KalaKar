angular.module('image.directives')

.directive('edPrettyScrollbar', function() {
    return {
        restrict: 'A',
        compile: function(el, attrs) {
            setTimeout(function() {
                el.mCustomScrollbar({
                    theme: attrs.edScrollTheme || 'inset',
                    scrollInertia: 300,
                    autoExpandScrollbar: false,
                    axis: attrs.edScrollAxis || 'x',
                    advanced: { autoExpandHorizontalScroll:true },
                });
            }, 1)
        }
   	}
})

//fix some bug between custom scrollbar and material slider
.directive('edIeSliderFix', function() {
    return {
        restrict: 'A',
        template: '<div class="slider-fix-outter" style="height: 2px; position: absolute"><div class="slider-fix-inner" style="height: 1px; overflow: auto;">IE FIX</div></div>',
        compile: function(el) {
            el.find('.slider-fix-inner').mCustomScrollbar();
        }
    }
});