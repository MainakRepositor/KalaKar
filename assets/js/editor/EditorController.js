angular.module('ImageEditor').controller('EditorController', ['$scope', '$rootScope', '$http', '$state', 'folders', 'canvas', 'saver', 'photos', 'utils', 'selectedItem', function($scope, $rootScope, $http, $state, folders, canvas, saver, photos, utils, selectedItem) {

    //reference to image currently open in editor (if any)
    $scope.active = {};

    //update image in database
    saver.saveImage = function() {
        $scope.ajaxInProgress = true;

        var payload = getDesignPayload($scope.active);

        if (payload.id) {
            var promise = selectedItem.update(payload);
        } else {
            var promise = photos.save(payload);
        }

        promise.success(function(data) {
            utils.showToast('savedPhotoSuccessfully', true);
            $scope.active = data;
        }).finally(function() {
            $scope.ajaxInProgress = false;
        });

        $rootScope.$emit('activity.happened', 'edited', 'photo', [payload]);
    };

    //get payload to send to backend for updating image
    function getDesignPayload(photo) {
        canvas.fabric.deactivateAll().renderAll();

        var fabricData  = canvas.fabric.toDatalessJSON(['selectable', 'name']);
        fabricData.customActions = angular.copy($rootScope.editorCustomActions);

        //if photo corners were rounded we'll need to encode image as png for transparency
        var extension = fabricData.customActions && fabricData.customActions.roundCorners ? 'png' : photo.extension,
            imageData   = canvas.fabric.toDataURL({ format: extension || 'png', quality: 1 }),
            dimensions  = canvas.original;

        for (var i = 0; i < fabricData.objects.length; i++) {
            var obj = fabricData.objects[i];

            if (obj.name === 'mainImage') {
                obj.src = $scope.active.originalUrl;
                break;
            }
        }
        console.log(fabricData);
        if ( ! angular.isString(fabricData)) {
            fabricData = JSON.stringify(fabricData);
        }

        return {
            id: photo.id,
            name: photo.name || $rootScope.userPreset.name,
            folder_id: photo.folder_id || folders.selected.id,
            serialized_editor_state: fabricData,
            imageData:  imageData,
            width: dimensions.width,
            height: dimensions.height,
            extension: extension
        };
    }

    var unbind = $rootScope.$on('canvas.init', function() {
        //load image into editor if we have an id in url
        if ($state.params.id) {
            $http.get($rootScope.baseUrl+'photos/'+$state.params.id).success(function(photo) {
                $scope.active = photo;
                selectedItem.set(photo);

                //if we have a serialized state, load that
                if (photo.serialized_editor_state) {
                    canvas.loadFromJSON(photo, loadCustomActions);

                    //otherwise just load image from absolute url
                } else {
                    canvas.loadMainImage(photo.originalUrl);
                }

                $rootScope.started = true;
            });

            //otherwise open a preset if we have one set on $rootScope
        } else {
            canvas.openNew($rootScope.userPreset.width, $rootScope.userPreset.height, $rootScope.userPreset.name);
            $rootScope.started = true;
        }
    });

    $scope.$on('$destroy', function() {
        canvas.destroy();
        $rootScope.started = false;
        unbind();
    });

    //prevent fonts pagination links from changing the state
    $('.pagination').click('a', function(e) { e.preventDefault() });

    function loadCustomActions(photo) {
        var state = JSON.parse(photo.serialized_editor_state);

        if (state.customActions && ! $.isEmptyObject(state.customActions)) {
            canvas.fabric.clear();
            canvas.zoom(1);
            canvas.loadMainImage(photo.absoluteUrl);
        }
    }
}]);