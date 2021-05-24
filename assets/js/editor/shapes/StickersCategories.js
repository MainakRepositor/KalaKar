angular.module('image.shapes')

.directive('edStickersCategories', function() {
    return {
        restrict: 'A',
        link: function($scope, el) {

            //load sticker images into open category when stickers tab is opened
            var unbind = $scope.$watch('activeTab', function(newTab) {
                if (newTab !== 'stickers') return;

                var cat = $('.category-stickers.open');

                cat.find('img').each(function() {
                    this.src = this.dataset.src;
                });

                cat.parent().addClass('loaded');

                unbind();
            });

            //load sticker images for the category that just been opened
            el.on('click', '.category-header', function(e) {
                $scope.$apply(function() {
                    $scope.setActiveCategory(e.target.dataset.name);
                });

                var category = $(e.currentTarget).parent();

                if ( ! category.hasClass('loaded')) {
                    category.addClass('loaded').find('img').each(function() {
                        this.src = this.dataset.src;
                    });
                }
            });
        }
   	}
});