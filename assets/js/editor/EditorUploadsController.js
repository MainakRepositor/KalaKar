angular.module('ImageEditor').controller('EditorUploadsController', ['$scope', '$rootScope', '$http', '$state', 'photos', 'canvas', 'folders', 'utils', function($scope, $rootScope, $http, $state, photos, canvas, folders, utils) {

    //uploaded photos user has access to
    $scope.photos = [];

    $scope.openImage = function(photo) {
        canvas.openImage(photo.absoluteUrl);
    };

    //on photo uploaded event open that image in editor
    $rootScope.$on('photos.uploaded', function(e, data) {
        if (data.uploaded && data.uploaded.length) {
            $scope.photos.unshift(data.uploaded[0]);
            $scope.openImage(data.uploaded[0]);
        }
    });

    photos.getAll().success(function(data) {
        $scope.photos = data;
    })
}]);