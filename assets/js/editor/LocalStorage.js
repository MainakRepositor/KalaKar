angular.module('ImageEditor')

.factory('localStorage', function() {
	var storage = {

		/**
		 * How long (days) data will be cached in local storage.
		 * 
		 * @type {Number}
		 */
		expireAfter: 2,

		/**
		 * Retrieve value under given key from local storage.
		 * 
		 * @param  string key
		 * @return mixed
		 */
		get: function(key) {
			var value = JSON.parse(localStorage.getItem(key));
			
			if ( ! value || ! storage.isValid(value.time)) {
				return false;
			}

			return value.value;
		},

		/**
		 * Store value into browser local storage.
		 * 
		 * @param string key
		 * @param mixed value
		 */
		set: function(key, value) {
			var data = { value: value, time: new Date().getTime() };

			return localStorage.setItem(key, JSON.stringify(data));
		},

		/**
		 * Whether or not cache with given time is considered expired.
		 * 
		 * @param  string  time
		 * @return {Boolean}
		 */
		isValid: function(time) {
			var days = (new Date().getTime() - new Date(time).getTime())/(1000*60*60*24);

			return days < storage.expireAfter;
		}
	};

	return storage;
});