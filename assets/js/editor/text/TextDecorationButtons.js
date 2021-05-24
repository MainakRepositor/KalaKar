'use strict';

angular.module('image.text')

.directive('edTextDecorationButtons', ['text', function (text) {
    return {
        compile: function (el) {
            el.on('click', '.toolbar-btn', function(e) {
                var name = e.currentTarget.dataset.decoration;

                var decorations = text.toggleTextDecoration(name);

                el.find('.toolbar-btn').removeClass('active');

                for (var i = 0; i < decorations.length; i++) {
                    el.find('[data-decoration="'+decorations[i].trim()+'"]').addClass('active');
                }
            });
        }
    };
}])
