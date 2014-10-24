// Main eduCrud Module

//Declare app level module which depends on filters, and services
var eduGridServices = angular.module('edu-grid.services', []);
var eduGridDirectives = angular.module('edu-grid.directives', []);
var eduGridFilters = angular.module('edu-grid.filters', []);
var eduGridTpl=angular.module('edu-grid.tpl',[]);
// initialization of services into the main module
angular.module('eduGrid', ['edu-grid.services', 'edu-grid.directives', 'edu-grid.filters','edu-grid.tpl','ngResource','ui.bootstrap','eduField']);