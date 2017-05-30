
angular.module('crudBank', [
  'ngRoute',
  'crudBank.todo',
  'restangular','crudBankTemplates'
])
.config(function ($routeProvider, RestangularProvider) {
  'use strict';
  $routeProvider
    .when('/todo', {
      controller: 'TodoCtrl',
      templateUrl: '/crudBank/todo/todo.html'
    })
    .otherwise({
      redirectTo: '/todo'
    });

  RestangularProvider.setBaseUrl('/api');
  RestangularProvider.setRestangularFields({
    id: '_id'
  });
});
