angular.module('app', ['wlParse'])
    .config(['wlParseConfigProvider',
        function (provider) {
            provider.setApplicationId('LdQSecCz3ppmtXstroD63B674aLryG7BBfke0KOO');
            provider.setApiKey('TfXTgI3Twdczy0BmzCsElN2gapogkbYKcyqw9bYN');
        }
    ])
    .controller('MainCtrl', function($scope, parseResource){
        var Todo = parseResource('todos');

        var getTodos = function() {
            $scope.todos = Todo.query();
        };

        /**
         * [addTodo description]
         */
        $scope.addTodo = function() {
            var todo = new Todo($scope.newTodo);
            todo.save().then(function(todo){
                $scope.newTodo = null;
                $scope.todos.unshift(todo);
            });
        };

        /**
         * [removeTodo description]
         */
        $scope.removeTodo = function() {
            var index = this.$index;

            this.todo.remove().then(function(){
                $scope.todos.splice(index, 1);
            });
        };

        getTodos();
    });