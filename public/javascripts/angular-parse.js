angular.module('wlParse', ['ng', 'ngRoute', 'ngResource'])
    .factory('parseResource', function($resource, $q, $http, wlParseConfig){
        /**
         * [ParseResourceFactory description]
         *
         * @param {[type]} className [description]
         */
        function ParseResourceFactory(className) {
            /**
             * [ParseResource description]
             *
             * @param {[type]} value [description]
             */
            function ParseResource(value) {
                angular.copy(value || {}, this);
            }

            /**
             * [query description]
             *
             * @return {[type]} [description]
             */
            ParseResource.query = function(){
                console.debug('ParseResource.query');

                var ret = [];
                var requestPromise = $http({
                    url: 'https://api.parse.com/1/classes/' + className,
                    method: 'GET',
                    headers: {
                        'X-Parse-Application-Id': wlParseConfig.getApplicationId(),
                        'X-Parse-REST-API-Key': wlParseConfig.getApiKey()
                    }
                }).then(
                    function successCallback(response){
                        // Reset the array length
                        ret.length = 0;

                        // Wrap all returned object into a ParseResource object
                        angular.forEach(response.data.results, function(responseItem){
                            ret.push(new ParseResource(responseItem));
                        });

                        // Manually resolve the promise
                        ret.$resolved = true;

                        // Assign the ret as the parseResource property on the response object
                        response.parseResource = ret;

                        return response;
                    }
                );

                // Here we're returning a object that is 'like' a promise and containt
                // a reference to the real promise.
                ret.$promise = requestPromise;
                ret.$resolved = false;

                return ret;
            };

            /**
             * [get description]
             *
             * @param  {[type]} data [description]
             *
             * @return {[type]}      [description]
             */
            ParseResource.get = function(objectId) {
                console.debug('ParseResource.get');

                var ret = new ParseResource();

                if(!objectId){
                    throw new Error('You need to inform the objectId of the entity');
                }

                var requestPromise = $http({
                    url: 'https://api.parse.com/1/classes/' + className + '/' + objectId,
                    method: 'GET',
                    headers: {
                        'X-Parse-Application-Id': wlParseConfig.getApplicationId(),
                        'X-Parse-REST-API-Key': wlParseConfig.getApiKey()
                    }
                }).then(
                    function successCallback(response){
                        angular.copy(response.data, ret);

                        // Manually resolve the promise
                        ret.$resolved = true;

                        // Assign the ret as the parseResource property on the response object
                        response.parseResource = ret;

                        return response;
                    }
                );

                ret.$promise = requestPromise;
                ret.$resolved = false;

                return ret;
            };

            /**
             * [save description]
             *
             * @return {[type]}            [description]
             */
            ParseResource.prototype.save = function() {
                console.debug('ParseResource.prototype.save');

                var self = this;
                var url = 'https://api.parse.com/1/classes/' + className;
                var method = 'POST';

                if ('objectId' in this) {
                    url = url + '/' + this.objectId;
                    method = 'PUT';
                }

                var defer = $q.defer();
                var request = $http({
                    url: url,
                    method: method,
                    data: this,
                    headers: {
                        'X-Parse-Application-Id': wlParseConfig.getApplicationId(),
                        'X-Parse-REST-API-Key': wlParseConfig.getApiKey()
                    }
                }).then(
                    function successCallback(response){
                        // If the request method was POST means that we need to fetch the
                        // saved entity using another request.
                        if (response.config.method === 'POST') {
                            ParseResource.get(response.data.objectId)
                                .$promise.then(function(response){
                                    defer.resolve(response.parseResource);
                                });
                        }
                        else { // (PUT) -> Update operation
                            self.updatedAt = response.data.updatedAt;
                            defer.resolve(self);
                        }
                    }
                );

                return defer.promise;
            };

            /**
             * [delete description]
             *
             * @return {[type]} [description]
             */
            ParseResource.prototype.remove = function() {
                return $http({
                    url: 'https://api.parse.com/1/classes/' + className + '/' + this.objectId,
                    method: 'DELETE',
                    headers: {
                        'X-Parse-Application-Id': wlParseConfig.getApplicationId(),
                        'X-Parse-REST-API-Key': wlParseConfig.getApiKey()
                    }
                });
            };

            return ParseResource;
        }

        return ParseResourceFactory;
    })
    .provider('wlParseConfig', [
        function () {
            this.$get = function () {
                var applicationId = this.applicationId;
                var apiKey = this.apiKey;

                return {
                    getApplicationId: function() {
                        return applicationId;
                    },
                    getApiKey: function() {
                        return apiKey;
                    },
                    getUser: function () {
                        return this.user;
                    },
                    setUser: function (user) {
                        this.user = user;
                    }
                };
            };

            this.setApplicationId = function (appId) {
                this.applicationId = appId;
            };

            this.setApiKey = function (apiKey) {
                this.apiKey = apiKey;
            };
        }
    ]);