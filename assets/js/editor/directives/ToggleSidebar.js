angular.module('image.directives')

.directive('edToggleSidebar', function() {
    return {
        restrict: 'A',
        compile: function(el, attrs) {
            var sidebar = $('#left-sidebar');

            el.on('click', function() {
                sidebar.toggleClass('open');
            });
        }
   	}
});