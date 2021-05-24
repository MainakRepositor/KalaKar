'use strict';

angular.module('ImageEditor')

.factory('saver', ['$rootScope', '$mdDialog', '$http', '$timeout', 'canvas', 'cropper', 'history', function($rootScope, $mdDialog, $http, $timeout, canvas, cropper, history) {

	var saver = {

        saveImage: function(format, quality, name, e) {
            canvas.fabric.deactivateAll();
            cropper.stop();

            if ($rootScope.isDemo) {
                return this.handleDemoSiteSave(e);
            }

            if ($rootScope.isIntegrationMode) {
                return this.handleIntegrationModeSave(format, quality, name);
            }

            this.saveToComputer(format, quality, name);
        },

        handleIntegrationModeSave: function(format, quality, name) {
            canvas.zoom(1);
            var data = this.getDataUrl(format, quality);

            this.handleCallbacks(data, name);

            //firefox integration mode fix
            $('.md-dialog-container').remove();
            
            $mdDialog.hide();
            $rootScope.pixie.close();
        },

        saveToComputer: function(format, quality, name) {
            canvas.zoom(1);

            var link = document.createElement('a'),
                data = this.getDataUrl(format, quality);

            this.handleCallbacks(data, name);

            //browser supports html5 download attribute
            if (typeof link.download !== 'undefined') {
                link.download = (name || 'image')+'.'+format;
                link.href = data;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            //canvas blob and file saver workaround
            else {
                canvas.fabric.lowerCanvasEl.toBlob(function(blob) {
                    saveAs(blob, name+'.'+format);
                }, 'image/'+format, quality);
            }

            $mdDialog.hide();
        },

        handleCallbacks: function(data, name) {
            //replace image src with new data url in original window
            if ($rootScope.getParam('replaceOriginal') && $rootScope.getParam('image')) {
                $rootScope.getParam('image').src = data;
            }

            //send image data to user specified url
            if ($rootScope.getParam('saveUrl')) {
                $http.post($rootScope.getParam('saveUrl'), { data: data, name: name });
            }

            if ($rootScope.getParam('onSave')) {
                var img = $rootScope.getParam('image') || new Image(data);
                $rootScope.getParam('onSave')(data, img, name);
            }
        },

        handleDemoSiteSave: function(e) {
            $('.demo-alert').one($rootScope.animationEndEvent, function() {
                $(this).removeClass('animated shake');  e.target.blur();
            }).addClass('animated shake');
        },

        getDataUrl: function(format, quality) {
            if (format === 'json') {
                return "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history.getCurrentCanvasState()));
            }

            return canvas.fabric.toDataURL({
                format: format || 'png',
                quality: (quality || 8) / 10
            });
        }
	};

	return saver;
}]);