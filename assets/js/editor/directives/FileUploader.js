angular.module('image.directives')

.directive('edFileUploader', ['$parse', '$mdDialog', '$mdBottomSheet', function($parse, $mdDialog, $mdBottomSheet) {
    var validTypes = ['png', 'jpg', 'jpeg', 'gif'];

    return {
        restrict: 'A',
        link: function($scope, el, attrs) {
            var setter = $parse(attrs.edFileUploader)($scope);

            $(el[0]).on('change', function(e) {
                var reader = new FileReader();

                reader.onload = function(event) {
                    var mime = event.target.result.split(",")[0].split(":")[1].split(";")[0].split('/')[1];

                    if (validTypes.indexOf(mime) < 0) {
                        //
                    }

                    if (setter) {
                        setter(event.target.result);

                        if (typeof attrs.edCloseAfter !== 'undefined') {
                            $mdDialog.hide();
                            $mdBottomSheet.hide();
                        }
                    }
                };

                if (e.target.files[0].name.match('.json')) {
                    reader.readAsText(e.target.files[0]);
                } else {
                    reader.readAsDataURL(e.target.files[0]);
                }
            });
        }
   	}
}]);