'use strict';

angular.module('image.text')

.directive('edTextAlignButtons', ['text', function (text) {
    return {
        compile: function (el) {
            el.on('click', 'i', function(e) {
                var align = e.currentTarget.dataset.align;

                text.setProperty('textAlign', align);
                el.find('i').removeClass('active');
                $(e.currentTarget).addClass('active');

            });
        }
    };
}])
