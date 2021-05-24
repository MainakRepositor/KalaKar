'use strict';

angular.module('ImageEditor', ['ngMaterial', 'ngAnimate', 'ui.sortable', 'image.crop', 'image.text', 'image.drawing', 'image.filters', 'image.shapes', 'image.directives', 'image.basics'])

.config(['$mdThemingProvider', function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('deep-orange')
        .accentPalette('brown'); 
}])

.controller('MainController', ['$rootScope', '$scope', '$timeout', '$$rAF', '$mdBottomSheet', 'canvas', 'history', 'simpleShapes', 'filters', function($rootScope, $scope, $timeout, $$rAF, $mdBottomSheet, canvas, history, simpleShapes, filters) {

    //true after user uploads an image or create a new canvas
    $rootScope.started = false;

    //check if we're on a demo site
    $rootScope.isDemo = document.URL.indexOf('pixie.vebto.com') > -1;

    $rootScope.isIntegrationMode = false; 

    //check if we're running in integration mode
    try {
        if (window.self !== window.top) { 
            $('script', window.parent.document).each(function(i, node) {
                if (node.src.indexOf('pixie-integrate') > -1) {
                    $rootScope.isIntegrationMode = true;
                    return false;
                }
            });
        }
    } catch (e) {
        $rootScope.isIntegrationMode = false;
    }

    //get a reference to top window if we're inside iframe
    if ($rootScope.isIntegrationMode) {
        $rootScope.pixie = window.parent.Pixie;
    }

    $rootScope.getParam = function(name) {
        if ($rootScope.pixie) {
            return $rootScope.pixie.getParams()[name];
        } else if (window.PixieParams) {
            return window.PixieParams[name];
        }
    };

    canvas.start();

    //make actions panels draggable
    $('.actions-menu').draggable({
        handle: '.menu-header',
        containment: 'body'
    });

	$rootScope.canvas = canvas;
	$rootScope.history = history;
    $rootScope.shapes = simpleShapes;
	$rootScope.loading = false;
    $rootScope.animationEndEvent = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
    $rootScope.transitionEndEvent = 'webkitTransitionEnd mozTransitionEnd MSTransitionEnd oatransitionend atransitionend transitionend';

    $rootScope.maxPanelHeight = $(window).height() - 120;

    $rootScope.openPanel = function(name, e) {
        if ($rootScope.activePanel === name) return;

        $rootScope.activePanel = name;

        var panel = $('[data-name="'+name+'"]');

        var clickRect = e.target.getBoundingClientRect();
        var panelRect = panel[0].getBoundingClientRect();

        var scaleX = Math.min(0.5, clickRect.width / panelRect.width);
        var scaleY = Math.min(0.5, clickRect.height / panelRect.height);

        panel.removeClass('transition-in').css('transform', 'translate3d(' +
            (-panelRect.left + clickRect.left + clickRect.width/2 - panelRect.width/2) + 'px,' +
            (-panelRect.top + clickRect.top + clickRect.height/2 - panelRect.height/2) + 'px,' +
            '0) scale(' + scaleX + ',' + scaleY + ')'
        );

        $$rAF(function() {
            $(panel).addClass('transition-in').css('transform', '');
        });
    };

	$rootScope.isLoading = function() {
		$timeout(function() {
			$rootScope.loading = true;
		});
	};

	$rootScope.isNotLoading = function() {
		$timeout(function() {
			$rootScope.loading = false;
		});
	};

	$rootScope.activePanel = false;
    $rootScope.activeTab   = false;

	$rootScope.keys = {
		google_fonts: 'AIzaSyDhc_8NKxXjtv69htFcUPe6A7oGSQ4om2o',
	};

	$rootScope.$watch('activePanel', function() {
		setTimeout(function () {
			$(window).resize(); 
		}, 100);
	});
    
    $rootScope.resetUI = function() {
        $timeout(function() {
            $rootScope.activePanel = null;
            $rootScope.activeTab   = 'basics';
            simpleShapes.selected  = null;
            filters.appliedFilters = [];
            $rootScope.history.all = [];
        });
    };

    //open corresponding tab in left panel when user selects an object
    canvas.fabric.on('object:selected', function(e) {
        if (e.target.name == 'text') {
            $rootScope.activeTab = 'text';
        } else if (e.target.name == 'sticker' && $rootScope.activeTab !== 'stickers') {
            $rootScope.activeTab = 'stickers';
        } else if (e.target.name && $rootScope.activeTab !== 'simple-shapes') {
            for (var i = 0; i < simpleShapes.available.length; i++) {
                var shape = simpleShapes.available[i];

                if (shape.name === e.target.name && $rootScope.activeTab !== 'simple-shapes') {
                    simpleShapes.selected = shape;
                    $rootScope.activeTab = 'simple-shapes';
                }
            }
        }

        $timeout(angular.noop);
    });

    //Close object panel when object is de-selected
    canvas.fabric.on('selection:cleared', function() {
        $timeout(angular.noop);
    });

    //deselect all objects when clicking outside canvas
    $('#viewport').on('click', function(e) {
        if (e.target.id === 'viewport') {
            $timeout(function() {
                canvas.fabric.deactivateAll().renderAll();
            });
        }
    });

    $scope.openBottomSheet = function(name) {
        $mdBottomSheet.show({
            template: $('#'+name+'-sheet-template').html(),
            controller: 'BottomSheetController'
        });
    }; 

    //cleanup. remove color picker containers on scope destroy.
    $scope.$on('$destroy', function() {
        $('.sp-container').remove();
    });

     $rootScope.spacify = function(text) {
        if (text) {
            var temp = text.replace( /([A-Z])/g, " $1" );
            return temp.charAt(0).toUpperCase() + temp.slice(1);
        }
     };
}])

.controller('BottomSheetController', ['$rootScope', '$scope', '$mdBottomSheet', '$mdDialog', 'simpleShapes', function($rootScope, $scope, $mdBottomSheet, $mdDialog, simpleShapes) {
    $scope.shapes = simpleShapes;

    $scope.showDialog = function($event) {
        $mdDialog.show({
            template: $('#texture-upload-dialog-template').html(),
            targetEvent: $event,
            controller: 'BottomSheetController'
        });
    }
}]);