angular.module('image.crop')

.controller('CropController', ['$scope', '$rootScope', 'cropper', 'cropzone', function($scope, $rootScope, cropper, cropzone) {

	$scope.cropper = cropper;
	$scope.cropzone = cropzone;

    $rootScope.$on('tab.changed', function(e, newTab, oldTab) {
       if (oldTab === 'basics' && newTab !== 'basics') {
           cropper.stop();
       }
    });

    $rootScope.$watch('activePanel', function(newPanel, oldPanel) {
        if (newPanel !== 'crop' && oldPanel === 'crop') {
            cropzone.remove();
        }
    });

	$rootScope.$on('cropzone.added', function() {
		$scope.width = Math.round(cropzone.rect.width);
		$scope.height = Math.round(cropzone.rect.height);
	});
}]);