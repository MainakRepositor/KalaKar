'use strict';

angular.module('ImageEditor')

.factory('keybinds', ['$rootScope', function($rootScope) {

    var keybinds = {

        fabric: false,

        init: function(fabric) {
            this.fabric = fabric;
            init();
        },

        destroy: function() {
            $('.canvas-container').off("keydown", processKeys, false);
        }
    };

    function init() {
        $(document).on('keydown', handleKeyDown);
    }

    function handleKeyDown(e) {
        e = e || window.event;

        if ([37, 38, 39, 40].indexOf(e.keyCode) > -1) moveObject(e);
        if (e.keyCode === 46) deleteObject();

    }

    function deleteObject() {
        var activeObject = keybinds.fabric.getActiveObject();

        if (activeObject) {
            keybinds.fabric.remove(activeObject);
            keybinds.fabric.renderAll();
        }
    }

    function moveObject(e) {
        var movementDelta = 2;

        var activeObject = keybinds.fabric.getActiveObject();
        var activeGroup = keybinds.fabric.getActiveGroup();

        if (e.keyCode === 37) {
            e.preventDefault();
            if (activeObject) {
                var a = activeObject.get('left') - movementDelta;
                activeObject.set('left', a);
            }
            else if (activeGroup) {
                var a = activeGroup.get('left') - movementDelta;
                activeGroup.set('left', a);
            }

        } else if (e.keyCode === 39) {
            e.preventDefault();
            if (activeObject) {
                var a = activeObject.get('left') + movementDelta;
                activeObject.set('left', a);
            }
            else if (activeGroup) {
                var a = activeGroup.get('left') + movementDelta;
                activeGroup.set('left', a);
            }

        } else if (e.keyCode === 38) {
            e.preventDefault();
            if (activeObject) {
                var a = activeObject.get('top') - movementDelta;
                activeObject.set('top', a);
            }
            else if (activeGroup) {
                var a = activeGroup.get('top') - movementDelta;
                activeGroup.set('top', a);
            }

        } else if (e.keyCode === 40) {
            e.preventDefault();
            if (activeObject) {
                var a = activeObject.get('top') + movementDelta;
                activeObject.set('top', a);
            }
            else if (activeGroup) {
                var a = activeGroup.get('top') + movementDelta;
                activeGroup.set('top', a);
            }
        }

        if (activeObject) {
            activeObject.setCoords();
            keybinds.fabric.renderAll();
        } else if (activeGroup) {
            activeGroup.setCoords();
            keybinds.fabric.renderAll();
        }
    }

    return keybinds;
}]);