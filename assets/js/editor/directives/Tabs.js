'use strict';

angular.module('image.directives', [])

.directive('edTabs', ['$rootScope', function ($rootScope) {
    return {
        link: function ($scope, el, attrs) {
            var blockClicks = false;

            $('#'+attrs.edTabs).addClass('open');
            $('[data-activates="'+attrs.edTabs+'"]').addClass('active');

            el.find('#navigation-bar').on('click', '.nav-item', function (e) {
                if (blockClicks === true) return;

                $scope.$apply(function() {
                    blockClicks = true;
                    $rootScope.activeTab = e.currentTarget.dataset.activates;
                });
            });

            $rootScope.$watch('activeTab', function(newTab, oldTab) {
                if (newTab && newTab !== oldTab) {
                    var oldTabNode = oldTab ? el.find('#'+oldTab) : el.find('.tab.open');
                    changeTab(newTab, oldTabNode, el.find('#'+newTab), $('[data-activates="'+newTab+'"]'));
                }
            });

            var changeTab = function(name, oldTab, newTab, tabButton) {
                var inAnimation  = 'fadeInLeft',
                    outAnimation = 'fadeOutRight';

                if (tabButton.hasClass('active')) return;

                //tab navigation
                $('.nav-item.active').removeClass('active');
                tabButton.addClass('active');

                //tabs
                if (parseInt(newTab.data('index')) < parseInt(oldTab.data('index'))) {
                    outAnimation = 'fadeOutLeft';
                    inAnimation  = 'fadeInRight';
                }

                oldTab.addClass('animated '+outAnimation).one($rootScope.animationEndEvent, function() {
                    if (newTab[0].id === $scope.activeTab) {
                        $(this).removeClass('open '+outAnimation);
                    }
                });
                newTab.addClass('open animated '+inAnimation).one($rootScope.animationEndEvent, function() {
                    $(this).removeClass(inAnimation);
                });

                $rootScope.$emit('tab.changed', name, oldTab[0].id);
                $rootScope.activePanel = false;

                setTimeout(function() {
                    newTab.removeClass('fadeOutRight fadeOutLeft');
                    blockClicks = false;
                }, 270)
            }
        }
    };
}]);
