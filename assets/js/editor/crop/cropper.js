angular.module('image.crop', [])

.service('cropper', ['$rootScope', 'cropzone', 'canvas', 'history', function($rootScope, cropzone, canvas, history) {
	
	var cropper = {

		start: function(e) {
			if (cropzone.initiated) return;
			
			cropzone.add();
			$rootScope.openPanel('crop', e);
		},

		stop: function(e) {
			cropzone.remove();
			$rootScope.activePanel = false;
		},

		crop: function() {
			if ( ! cropzone.initiated) return false;

			cropzone.hide();
		    var image = new Image();

		    image.onload = function() {
		        var fabricImage = new fabric.Image(this, canvas.imageStatic);
                fabricImage.name = 'mainImage';

		        canvas.mainImage && canvas.mainImage.remove();
                canvas.fabric.clear();
		        canvas.fabric.setWidth(Math.ceil(cropzone.rect.getWidth()));
		        canvas.fabric.setHeight(Math.ceil(cropzone.rect.getHeight()));

        		canvas.fabric.add(fabricImage);
                fabricImage.moveTo(0);
                fabricImage.center();
        		canvas.mainImage = fabricImage;
        		cropzone.remove();

                history.add('crop', 'crop');

				$rootScope.$apply(function() {
					$rootScope.activePanel = false;
				});
		    };

            canvas.zoom(1);

            $rootScope.editorCustomActions.crop = {
                left: cropzone.rect.getLeft(),
                top: cropzone.rect.getTop(),
                width: Math.ceil(cropzone.rect.getWidth()),
                height: Math.ceil(cropzone.rect.getHeight())
            };

		    image.src = canvas.fabric.toDataURL({
		        left: cropzone.rect.getLeft(),
		        top: cropzone.rect.getTop(),
		        width: Math.ceil(cropzone.rect.getWidth()),
		        height: Math.ceil(cropzone.rect.getHeight())
		    });

            canvas.original.width = Math.ceil(cropzone.rect.getWidth());
            canvas.original.height = Math.ceil(cropzone.rect.getHeight());
		}

	};

	return cropper;

}]);