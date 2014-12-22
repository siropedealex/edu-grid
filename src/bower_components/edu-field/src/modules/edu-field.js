// Main eduField Module

//Declare app level module which depends on filters, and services
var eduFieldServices = angular.module('edu-field.services', []);
var eduFieldDirectives = angular.module('edu-field.directives', []);
var eduFieldFilters = angular.module('edu-field.filters', []);
var eduFieldTpl=angular.module('edu-field.tpl',[]);
// initialization of services into the main module
angular.module('eduField', ['edu-field.services', 'edu-field.directives', 'edu-field.filters','edu-field.tpl','ngResource','textAngular','angularFileUpload','ui.bootstrap']);