// Main eduCrud Module
//Declare app level module which depends on filters, and services
var eduGridServices = angular.module('edu-grid.services', []);
var eduGridDirectives = angular.module('edu-grid.directives', []);
var eduGridFilters = angular.module('edu-grid.filters', []);
var eduGridTpl = angular.module('edu-grid.tpl', []);
// initialization of services into the main module
angular.module('eduGrid', [
  'edu-grid.services',
  'edu-grid.directives',
  'edu-grid.filters',
  'edu-grid.tpl',
  'ngResource',
  'ui.bootstrap',
  'eduField'
]);
eduGridServices.factory('dataFactoryGrid', [
  '$resource',
  function ($resource) {
    return function (uri, actions) {
      var defActions = {
          getAll: {
            method: 'GET',
            params: {},
            withCredentials: true,
            isArray: true
          },
          getCount: {
            method: 'GET',
            url: uri + '/count',
            params: {},
            withCredentials: true,
            isArray: false
          }
        };
      if (typeof actions !== 'undefined' && actions !== '') {
        for (keyAction in actions) {
          for (keyDefAction in defActions) {
            if (keyAction == keyDefAction) {
              defActions[keyDefAction] = actions[keyAction];
            }
          }
        }
      }
      return $resource(uri, {}, defActions);
    };
  }
]);
eduGridDirectives.directive('eduGrid', function () {
  return {
    restrict: 'A',
    replace: true,
    transclude: false,
    scope: { options: '=' },
    templateUrl: 'directives/edu-grid.tpl.html',
    link: function ($scope, $filter) {
      if (!$scope.hasOwnProperty('options')) {
        throw new Error('options are required!');
      }
      /**
                 * Prepare fields
                 */
      for (var fieldKey in $scope.options.listFields) {
        $scope.options.listFields.sorting = '';
        if (typeof $scope.options.listFields[fieldKey].renderer !== 'function') {
          $scope.options.listFields[fieldKey].orderByValue = $scope.options.listFields[fieldKey].column;
          $scope.options.listFields[fieldKey].renderer = function (input, row, column, type) {
            return input;
          };
        }
      }
    },
    controller: [
      '$scope',
      '$log',
      'dataFactoryGrid',
      '$timeout',
      function ($scope, $log, dataFactoryGrid, $timeout) {
        if (!$scope.hasOwnProperty('options')) {
          throw new Error('options are required!');
        }
        // ---
        // SETUP
        // ---
        $scope.options.selectionRows = [];
        $scope.options.formAvancedSearchResult = {};
        $scope.showOverlayFormSearch = false;
        $scope.options.gridControl = {};
        $scope.options.metaData.offset = 0;
        $scope.options.showOverlayLoading = false;
        $scope.currentPage = undefined;
        $scope.currentPage = {
          offset: 0,
          label: 1
        };
        $scope.gridStyle = {};
        $scope.gridStyle.height = $scope.options.height + 'px';
        //extract type of fieldKey
        var typeFieldKey = '';
        for (var i = 0; i < $scope.options.listFields.length; i++) {
          if ($scope.options.listFields[i].column == $scope.options.fieldKey) {
            typeFieldKey = $scope.options.listFields[i].type;
            break;
          }
        }
        // ---
        // METHODS
        // ---
        $scope.internalControl = $scope.options.gridControl || {};
        $scope.internalControl.refresh = function () {
          $scope.refresh();
        };
        $scope.internalControl.showOverlayLoading = function (bShow) {
          $scope.options.showOverlayLoadingGrid = bShow;
        };
        $scope.internalControl.showOverlayFormUser = function (bShow) {
          $scope.options.showOverlayFormUser = bShow;
        };
        $scope.internalControl.showOverlayFormAvancedSearch = function (bShow) {
          $scope.showOverlayFormAvancedSearch = bShow;
        };
        $scope.internalControl.showOverlayFormSuccessError = function (type, text, duration) {
          $scope.options.overlayFormSuccessErrorGrid = {};
          $scope.options.overlayFormSuccessErrorGrid.show = true;
          $scope.options.overlayFormSuccessErrorGrid.type = type == '1' ? 'success' : 'danger';
          $scope.options.overlayFormSuccessErrorGrid.message = text;
          var closeForm = function () {
            $scope.options.overlayFormSuccessErrorGrid.show = false;
            $scope.$apply();
          };
          $timeout(closeForm, duration);
        };
        $scope.internalControl.showButtonsUserPre = function (bShow) {
          $scope.options.showButtonsGridUserPre = bShow;
        };
        $scope.internalControl.showButtonsUserPost = function (bShow) {
          $scope.options.showButtonsGridUserPost = bShow;
        };
        // ---
        // ENABLE DESING-ELEMENTS
        // ---
        $scope.showHeadingBar = $scope.options.heading || $scope.showMetaData || $scope.showRefreshButton;
        $scope.showFooterBar = $scope.options.showPagination || $scope.options.showItemsPerPage || $scope.options.showSearch;
        // ---
        // ADJUST COLUMNS ORDER
        // ---
        for (var field in $scope.options.listFields) {
          if ($scope.options.listFields[field].column.toUpperCase() == $scope.options.metaData.orderBy.toUpperCase()) {
            $scope.options.listFields[field].order = $scope.options.metaData.order;
          }
        }
        ;
        // ---
        // Calculate pagination
        // ---	  
        $scope.pagination = function () {
          var paginationWidth = $scope.options.paginationWidth || 2;
          var limit = $scope.options.metaData.limit;
          var offset = $scope.options.metaData.offset;
          var total = $scope.options.metaData.total;
          $scope.pages = [];
          if (!(isNaN(limit) || isNaN(offset) || isNaN(total))) {
            var numPages = Math.ceil(total / limit);
            var startPage = Math.floor(offset / limit) - Math.floor(paginationWidth / 2);
            startPage = startPage < 0 ? 0 : startPage;
            var currentPageId = Math.floor(offset / limit);
            for (var i = startPage; i < Math.min(numPages, startPage + paginationWidth); i++) {
              var newPage = {
                  label: i + 1,
                  offset: (i + 0) * limit
                };
              if (i === currentPageId) {
                $scope.currentPage = newPage;
              }
              $scope.pages.push(newPage);
            }
          }
        };
        $scope.api = null;
        if (typeof $scope.options.crudUri !== 'undefined' && $scope.options.crudUri !== '') {
          $scope.api = dataFactoryGrid($scope.options.crudUri, typeof $scope.options.actions !== 'undefined' ? $scope.options.actions : '');
        }
        ;
        $scope.handleButtonClick = function (callback, entry) {
          $scope.selectedRow = entry;
          if (typeof callback === 'function') {
            callback(entry);
          }
        };
        $scope.onRowClick = function (clickedEntry) {
          if (typeof clickedEntry !== 'undefined') {
            for (var i = 0; i < $scope.list.length; i++) {
              if ($scope.list[i][$scope.options.fieldKey] == clickedEntry[$scope.options.fieldKey]) {
                clickedEntry.clicked = true;  //!clickedEntry.clicked;
              } else {
                $scope.list[i].clicked = false;
              }
            }
            if (!$scope.options.hasOwnProperty('listListeners') || typeof $scope.options.listListeners.onRowClick !== 'function')
              return;
            $scope.options.listListeners.onRowClick(clickedEntry);
          }
        };
        $scope.onPageLoadComplete = function (rows) {
          if (!$scope.options.hasOwnProperty('listListeners') || typeof $scope.options.listListeners.onPageLoadComplete !== 'function')
            return;
          $scope.options.listListeners.onPageLoadComplete($scope.list);
        };
        // ---
        // PAGINATION METHODS
        // --- 
        $scope.setPage = function (page) {
          $log.log('setPage:' + angular.toJson(page));
          $scope.options.metaData.offset = page.offset;
          $scope.pagination();
          $scope.refresh();
        };
        $scope.setFirstPage = function () {
          if ($scope.options.metaData === undefined)
            return;
          $scope.options.metaData.offset = 0;
          $scope.pagination();
          $scope.refresh();
        };
        $scope.setPreviousPage = function () {
          if ($scope.options.metaData === undefined)
            return;
          var currentOffset = $scope.currentPage.offset;
          $scope.options.metaData.offset = $scope.currentPage.offset - $scope.options.metaData.limit;
          $scope.pagination();
          $scope.refresh();
        };
        $scope.setNextPage = function () {
          if ($scope.options.metaData === undefined)
            return;
          var currentOffset = $scope.currentPage.offset;
          $scope.options.metaData.offset = $scope.currentPage.offset + $scope.options.metaData.limit;
          $scope.pagination();
          $scope.refresh();
        };
        $scope.setLastPage = function () {
          $log.log('setLastPage');
          if ($scope.options.metaData === undefined)
            return;
          var numPages = Math.ceil($scope.options.metaData.total / $scope.options.metaData.limit);
          $scope.options.metaData.offset = numPages * $scope.options.metaData.limit - $scope.options.metaData.limit;
          $scope.pagination();
          $scope.refresh();
        };
        $scope.isOnFirstPage = function () {
          if ($scope.options.metaData === undefined)
            return;
          return $scope.options.metaData.offset == 0;
        };
        $scope.isOnLastPage = function () {
          if ($scope.options.metaData === undefined)
            return;
          var numPages = Math.ceil($scope.options.metaData.total / $scope.options.metaData.limit);
          return $scope.options.metaData.offset == numPages * $scope.options.metaData.limit - $scope.options.metaData.limit;
        };
        // ---
        // GET DATA
        // ---	
        $scope.getData = function (oParams) {
          //var oParams={};
          if (typeof $scope.options.metaData.limit !== 'undefined' && typeof $scope.options.metaData.offset !== 'undefined') {
            oParams.limit = $scope.options.metaData.limit;
            oParams.filter = typeof $scope.searchQuery !== 'undefined' ? $scope.searchQuery.toUpperCase().trim() : '';
            oParams.offset = $scope.options.metaData.offset;
            oParams.orderby = $scope.options.metaData.orderBy;
            oParams.order = $scope.options.metaData.order;
          }
          ;
          if ($scope.options.hasOwnProperty('fieldFk') && typeof $scope.options.fieldFk != 'undefined' && $scope.options.hasOwnProperty('valueFk') && typeof $scope.options.valueFk != 'undefined') {
            oParams['fieldFk'] = $scope.options.fieldFk;
            oParams['valueFk'] = $scope.options.valueFk;
          }
          if ($scope.options.hasOwnProperty('listListeners') && typeof $scope.options.listListeners.transformParams == 'function') {
            oParams = $scope.options.listListeners.transformParams(oParams);
          }
          $scope.api.getAll(oParams, function (data) {
            //$scope.searchQuery="";					
            $scope.list = data;
            $scope.onPageLoadComplete($scope.list);
            for (var i = 0; i < $scope.list.length; i++) {
              var bExists = false;
              for (var j = 0; j < $scope.options.selectionRows.length; j++) {
                if ($scope.options.selectionRows[j] == $scope.list[i][$scope.options.fieldKey]) {
                  $scope.list[i].selected = true;
                  bExists = true;
                  break;
                }
              }
              if (!bExists) {
                $scope.list[i].selected = false;
              }
            }
            $scope.pagination();
            $scope.options.showOverlayLoadingGrid = false;
          });
        };
        $scope.refresh = function () {
          var oParams = {};
          oParams.filter = typeof $scope.searchQuery !== 'undefined' ? $scope.searchQuery.toUpperCase().trim() : '';
          if ($scope.options.hasOwnProperty('fieldFk') && typeof $scope.options.fieldFk != 'undefined' && $scope.options.hasOwnProperty('valueFk') && typeof $scope.options.valueFk != 'undefined') {
            oParams['fieldFk'] = $scope.options.fieldFk;
            oParams['valueFk'] = $scope.options.valueFk;
          }
          if ($scope.options.hasOwnProperty('formAvancedSearch') && typeof $scope.options.formAvancedSearchResult != 'undefined') {
            for (var key in $scope.options.formAvancedSearchResult) {
              oParams[key] = $scope.options.formAvancedSearchResult[key];
            }
          }
          $scope.options.showOverlayLoadingGrid = true;
          if ($scope.options.hasOwnProperty('listListeners') && typeof $scope.options.listListeners.transformParams == 'function') {
            oParams = $scope.options.listListeners.transformParams(oParams);
          }
          $scope.api.getCount(oParams, function (data) {
            $scope.options.metaData.total = data.count;
            $scope.getData(oParams);
          });
          if ($scope.options.hasOwnProperty('listListeners') && typeof $scope.options.listListeners.onButtonRefreshClick == 'function') {
            $scope.options.listListeners.onButtonRefreshClick($scope.list);
          }  //CLEAN form field searchQuery
             //$scope.searchQuery="";
             //CLEAN formAvancedSearchResult
             //$scope.options.formAvancedSearchResult="";
        };
        setTimeout(function () {
          $scope.refresh();
        }, 500);
        // ON CLICK EXTRA BUTTON
        $scope.clickExtraButton = function (value) {
          if ($scope.options.hasOwnProperty('listListeners') && typeof $scope.options.listListeners.onExtraButtonClick == 'function') {
            $scope.options.listListeners.onExtraButtonClick();
          }
        };
        // ON CLICK SELECT ALL ROWS CHECKBOX
        $scope.changeSelectAllRows = function (value) {
          if (value) {
            for (var i = 0; i < $scope.list.length; i++) {
              $scope.list[i].selected = true;
            }
          } else {
            for (var i = 0; i < $scope.list.length; i++) {
              $scope.list[i].selected = false;
            }
          }
        };
        // ON CLICK SELECT ROWS CHECKBOX
        $scope.checkSelectRow = function (row) {
          if (!row.selected) {
            var bExists = false;
            for (var i = 0; i < $scope.options.selectionRows.length; i++) {
              if ($scope.options.selectionRows[i] == row[$scope.options.fieldKey]) {
                bExists = true;
                break;
              }
            }
            if (!bExists) {
              $scope.options.selectionRows.push(typeFieldKey == 'text' ? row[$scope.options.fieldKey] + '' : row[$scope.options.fieldKey]);
            }
          } else {
            for (var i = 0; i < $scope.options.selectionRows.length; i++) {
              if ($scope.options.selectionRows[i] == row[$scope.options.fieldKey]) {
                $scope.options.selectionRows.splice(i, 1);
                break;
              }
            }
          }
        };
        // ON ORDER CHANGE
        $scope.changeOrder = function (field, orderBy, order) {
          $scope.options.metaData.orderBy = orderBy;
          $scope.options.metaData.order = order.toUpperCase();
          $scope.refresh();
          for (var fieldKey in $scope.options.listFields) {
            if ($scope.options.listFields[fieldKey] === field)
              continue;
            $scope.options.listFields[fieldKey].order = '';
          }
          field.order = order;
        };
        // ON CHANGE ITEMS PER PAGE
        var timerOnChangeItemsPerPage = null;
        $scope.onChangeItemsPerPage = function () {
          clearInterval(timerOnChangeItemsPerPage);
          timerOnChangeItemsPerPage = setInterval(function () {
            $scope.refresh();
            clearInterval(timerOnChangeItemsPerPage);
          }, 750);
        };
        // ---
        // ON SEARCH
        // ---	
        var timerOnChangeSearchQuery = null;
        $scope.onChangeSearchQuery = function () {
          clearInterval(timerOnChangeSearchQuery);
          timerOnChangeSearchQuery = setInterval(function () {
            $scope.refresh();
            clearInterval(timerOnChangeSearchQuery);
          }, 750);
        };
        // ---
        // ON AVANCEDSEARCH
        // ---	
        $scope.onClickAvancedSearch = function () {
          $scope.showOverlayFormAvancedSearch = true;
        };
        // ---
        // ON CONTINUE BUTTON FORM AVANCED SEARCH
        // ---	
        $scope.formAvancedSearchEventsContinue = function () {
          $scope.refresh();
          $scope.showOverlayFormAvancedSearch = false;
          if ($scope.options.hasOwnProperty('listListeners') && typeof $scope.options.listListeners.onFormAvancedSearchContinueClick == 'function') {
            $scope.options.listListeners.onFormAvancedSearchContinueClick($scope.options.formAvancedSearchResult);
          }  //$scope.options.formAvancedSearchResult={};
        };
        // ---
        // ON CANCEL BUTTON FORM AVANCED SEARCH
        // ---	
        $scope.formAvancedSearchEventsCancel = function () {
          $scope.options.formAvancedSearchResult = {};
          $scope.showOverlayFormAvancedSearch = false;
          if ($scope.options.hasOwnProperty('listListeners') && typeof $scope.options.listListeners.onFormAvancedSearchCancelClick == 'function') {
            $scope.options.listListeners.onFormAvancedSearchCancelClick();
          }
        };
        // ---
        // ON CLEAN BUTTON FORM AVANCED SEARCH
        // ---	
        $scope.formAvancedSearchEventsClean = function () {
          $scope.options.formAvancedSearchResult = {};
          if ($scope.options.hasOwnProperty('listListeners') && typeof $scope.options.listListeners.onFormAvancedSearchCleanClick == 'function') {
            $scope.options.listListeners.onFormAvancedSearchCleanClick();
          }
        };
      }
    ]
  };
});
angular.module('edu-grid.tpl').run([
  '$templateCache',
  function ($templateCache) {
    'use strict';
    $templateCache.put('directives/edu-grid.tpl.html', '<div><div class=box><div class="panel panel-{{options.metaData.panelType}}"><div class=panel-heading ng-show=showHeadingBar><div class=row><div class=col-md-1><a href="" class="btn btn-primary btn-xs" ng-show=options.showExtraButtonTopLeft ng-click=clickExtraButton()><span class="glyphicon glyphicon-plus-sign"></span> {{options.snippets.extraButtonTop || \'Nuevo\'}}</a></div><div class=col-md-7><strong>{{options.heading}}</strong></div><div class=col-md-3><span ng-show=options.showMetaData>{{options.snippets.showingItems || \'Filas\'}} {{options.metaData.offset+1}} - {{(options.metaData.offset+options.metaData.limit > options.metaData.total) ? (options.metaData.total) : (options.metaData.offset + options.metaData.limit)}} {{options.snippets.of || \'de\'}} {{options.metaData.total}}</span></div><div class=col-md-1><a class="glyphicon glyphicon-refresh btn btn-xs" ng-show=options.showRefreshButton ng-click=refresh()></a> <a href="" class="btn btn-primary btn-xs" ng-show=options.showExtraButtonTopRight ng-click=clickExtraButton()><span class="glyphicon glyphicon-plus-sign"></span> {{options.snippets.extraButtonTop || \'Nuevo\'}}</a></div></div></div><div class=panel-body><div ng-style=gridStyle style=overflow:auto><table class="table table-condensed table-hover table-striped"><thead><tr><th ng-if=options.showRowNumber></th><th ng-if=options.showButtonsGridUserPre ng-repeat="button in options.buttonsUserPre"></th><th ng-if=options.showSelectRow></th><th ng-repeat="field in options.listFields" width={{field.weight}}%><span ng-show="field.order==\'asc\'"><i class="glyphicon glyphicon-sort-by-alphabet"></i> <a ng-click="changeOrder(field, field.orderByValue, \'desc\')">{{field.label}}</a></span> <span ng-show="field.order==\'desc\'"><i class="glyphicon glyphicon-sort-by-alphabet-alt"></i> <a ng-click="changeOrder(field, field.orderByValue, \'asc\')">{{field.label}}</a></span> <span ng-hide="field.order.length>0"><a ng-click="changeOrder(field, field.orderByValue, \'desc\')">{{field.label}}</a></span></th><th ng-if=options.showButtonsGridUserPost ng-repeat="button in options.buttonsUserPost"></th></tr></thead><tbody><tr ng-show="list.length < 1"><td colspan={{options.listFields.length+options.buttons.length}}><span class="glyphicon glyphicon-info-sign"></span> <span>{{options.snippets.emptyGridText || \'No hay datos\'}}</span></td></tr><tr ng-repeat="entry in list" ng-click=onRowClick(entry)><td ng-if=options.showRowNumber><button ng-if=entry.clicked type=button class="btn btn-success btn-xs">{{options.metaData.offset+1+$index}}</button> <button ng-if=!entry.clicked type=button class="btn btn-primary btn-xs">{{options.metaData.offset+1+$index}}</button></td><td ng-if=options.showButtonsGridUserPre ng-repeat="button in options.buttonsUserPre"><div ng-if=!button.button><div ng-if="button.glyphicon.length>0"><a class="btn btn-xs" ng-click="handleButtonClick(button.onclick, entry)" ng-disabled=button.disabled(entry)><i class="glyphicon glyphicon-{{button.glyphicon}}" title={{button.label}}></i></a></div><div ng-if="button.iconPath.length>0"><img ng-src=button.iconPath alt="{{button.label}}"></div></div><button ng-if=button.button ng-click="handleButtonClick(button.onclick, entry)" ng-disabled=button.disabled(entry)><i ng-if="button.glyphicon.length>0" class="glyphicon glyphicon-{{button.glyphicon}}" title={{button.label}}></i> <img ng-if="button.iconPath.length>0" ng-src=button.iconPath alt="{{button.label}}">{{button.label}}</button></td><td ng-if=options.showSelectRow><input type=checkbox ng-click=checkSelectRow(entry) ng-model="entry.selected"></td><td ng-repeat="field in options.listFields" ng-click=onRowClick()><div ng-if="field.type!=\'number\' && field.type!=\'date\' && field.type!=\'date-time\'  && field.type!=\'input-checkbox\' && field.type!=\'input-text\' && field.type!=\'input-date\' && field.type!=\'input-select\' && field.type!=\'input-radio\'">{{field.renderer(entry[field.column], entry, field.column,field.type)}}</div><div ng-if="field.type==\'number\'" class=pull-right>{{field.renderer(entry[field.column], entry, field.column,field.type)}}</div><div ng-if="field.type==\'date\'">{{entry[field.column] | date:\'dd-MM-yyyy\'}}</div><div ng-if="field.type==\'input-checkbox\'"><input type=checkbox ng-model=entry[field.column]></div><div ng-if="field.type==\'input-text\'"><input ng-model=entry[field.column]></div><div ng-if="field.type==\'input-date\'"><input type=date ng-model=entry[field.column]></div><div ng-if="field.type==\'input-select\'"><select><option>1</option><option>2</option></select></div></td><td ng-if=options.showButtonsGridUserPost ng-repeat="button in options.buttonsUserPost"><div ng-if=!button.button><div ng-if="button.glyphicon.length>0"><a class="btn btn-xs" ng-click="handleButtonClick(button.onclick, entry)" ng-disabled=button.disabled(entry)><i class="glyphicon glyphicon-{{button.glyphicon}}" title={{button.label}}></i></a></div><div ng-if="button.iconPath.length>0"><img ng-src=button.iconPath alt="{{button.label}}"></div></div><button ng-if=button.button ng-click="handleButtonClick(button.onclick, entry)" ng-disabled=button.disabled(entry)><i ng-if="button.glyphicon.length>0" class="glyphicon glyphicon-{{button.glyphicon}}" title={{button.label}}></i> <img ng-if="button.iconPath.length>0" ng-src=button.iconPath alt="{{button.label}}">{{button.label}}</button></td></tr></tbody></table></div></div><div class=panel-footer ng-show=showFooterBar><div class=row><div class=col-md-4><ul ng-show=options.showPagination class="pagination pagination col" style="margin: 0px 0px; font-weight: bold"><li ng-class="{\'disabled\':isOnFirstPage()}"><span ng-show=isOnFirstPage() class="glyphicon glyphicon-step-backward btn-xs"></span> <a ng-show=!isOnFirstPage() class="glyphicon glyphicon-step-backward btn-xs" ng-click=setFirstPage()></a></li><li ng-class="{\'disabled\':isOnFirstPage()}"><span ng-show=isOnFirstPage() class="glyphicon glyphicon-fast-backward btn-xs"></span> <a ng-show=!isOnFirstPage() class="glyphicon glyphicon-backward btn-xs" ng-click=setPreviousPage()></a></li><li data-ng-repeat="page in pages" ng-class="{\'disabled\':currentPage.label == page.label}"><a ng-show="currentPage.label != page.label" ng-click=setPage(page) class=btn-xs>{{page.label}}</a> <span ng-show="currentPage.label == page.label" class=btn-xs>{{page.label}}</span></li><li ng-class="{\'disabled\':isOnLastPage()}"><span ng-show=isOnLastPage() class="glyphicon glyphicon-fast-forward btn-xs"></span> <a ng-show=!isOnLastPage() class="glyphicon glyphicon-forward btn-xs" ng-click=setNextPage()></a></li><li ng-class="{\'disabled\':isOnLastPage()}"><span ng-show=isOnLastPage() class="glyphicon glyphicon-step-forward btn-xs"></span> <a ng-show=!isOnLastPage() class="glyphicon glyphicon-step-forward btn-xs" ng-click=setLastPage()></a></li></ul></div><div class=col-md-3><div ng-show=options.showItemsPerPage><label for=ag_itemsperpage>{{options.snippets.itemsPerPage || \'Items por p&aacute;gina:\'}}</label><input id=ag_itemsperpage class=form-inline type=number ng-model=options.metaData.limit ng-change=onChangeItemsPerPage() style="width: 50px"> <a class="glyphicon glyphicon-list-alt btn-xs"></a></div></div><div class=col-md-3 ng-show=options.showSearch><div><label for=ag_search>{{options.snippets.search || \'Buscar:\'}}</label><input class=form-inline ng-model=searchQuery ng-change="onChangeSearchQuery()"></div></div><div class=col-md-2 ng-show=options.showAvancedSearch><div><a class="glyphicon glyphicon-search btn btn-primary btn-sm" ng-click=onClickAvancedSearch()>{{options.snippets.avancedSearch || \' Avanzada\'}}</a></div></div></div></div></div><div ng-show=options.showOverlayLoadingGrid class=overlay><img class=centrado alt="" src="data:image/gif;base64,R0lGODlhQgBCAPMAAP///wAAAExMTHp6etzc3KCgoPj4+BwcHMLCwgAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAQgBCAAAE/xDISau9VBzMu/8VcRTWsVXFYYBsS4knZZYH4d6gYdpyLMErnBAwGFg0pF5lcBBYCMEhR3dAoJqVWWZUMRB4Uk5KEAUAlRMqGOCFhjsGjbFnnWgliLukXX5b8jUUTEkSWBNMc3tffVIEA4xyFAgCdRiTlWxfFl6MH0xkITthfF1fayxxTaeDo5oUbW44qaBpCJ0tBrmvprc5GgKnfqWLb7O9xQQIscUamMJpxC4pBYxezxi6w8ESKU3O1y5eyts/Gqrg4cnKx3jmj+gebevsaQXN8HDJyy3J9OCc+AKycCVQWLZfAwqQK5hPXR17v5oMWMhQEYKLFwmaQTDgl5OKHP8cQjlGQCHIKftOqlzJsqVLPwJiNokZ86UkjDg5emxyIJHNnDhtCh1KtGjFkt9WAgxZoGNMny0RFMC4DyJNASZtips6VZkEp1P9qZQ3VZFROGLPfiiZ1mDKHBApwisZFtWkmNSUIlXITifWtv+kTl0IcUBSlgYEk2tqa9PhZ2/Fyd3UcfIQAwXy+jHQ8R0+zHVHdQZ8A7RmIZwFeN7TWMpS1plJsxmNwnAYqc4Sx8Zhb/WPyqMynwL9eMrpQwlfTOxQco1gx7IvOPLNmEJmSbbrZf3c0VmRNUVeJZe0Gx9H35x9h6+HXjj35dgJfYXK8RTd6B7K1vZO/3qFi2MV0cccemkkhJ8w01lA4ARNHegHUgpCBYBUDgbkHzwRAAAh+QQJCgAAACwAAAAAQgBCAAAE/xDISau9VAjMu/8VIRTWcVjFYYBsSxFmeVYm4d6gYa5U/O64oGQwsAwOpN5skipWiEKPQXBAVJq0pYTqnCB8UU5KwJPAVEqK7mCbrLvhyxRZobYlYMD5CYxzvmwUR0lbGxNHcGtWfnoDZYd0EyKLGAgClABHhi8DmCxjj3o1YYB3Em84UxqmACmEQYghJmipVGRqCKE3BgWPa7RBqreMGGfAQnPDxGomymGqnsuAuh4FI7oG0csAuRYGBgTUrQca2ts5BAQIrC8aBwPs5xzg6eEf1lzi8qf06foVvMrtm7fO3g11/+R9SziwoZ54DoPx0CBgQAGIEefRWyehwACKGv/gZeywcV3BFwg+hhzJIV3Bbx0IXGSJARxDmjhz6tzJs4NKkBV7SkJAtOi6nyDh8FRnlChGoVCjSp0aRqY5ljZjplSpNKdRfxQ8Jp3ZE1xTjpkqFuhGteQicFQ1xmWEEGfWXWKfymPK9kO2jxZvLstW1GBLwI54EiaqzxoRvSPVrYWYsq8byFWxqcOs5vFApoKlEEm8L9va0DVHo06F4HQUA6pxrQZoGIBpyy1gEwlVuepagK1xg/BIWpLn1wV6ASfrgpcuj5hkPpVOIbi32lV3V+8U9pVVNck5ByPiyeMjiy+Sh3C9L6VyN9qZJEruq7X45seNe0Jfnfkp+u1F4xEjKx6tF006NPFS3BCv2AZgTwTwF1ZX4QnFSzQSSvLeXOrtEwEAIfkECQoAAAAsAAAAAEIAQgAABP8QyEmrvVQIzLv/FSEU1nFYhWCAbEsRx1aZ5UG4OGgI9ny+plVuCBiQKoORr1I4DCyDJ7GzEyCYziVlcDhOELRpJ6WiGGJCSVhy7k3aXvGlGgfwbpM1ACabNMtyHGCAEk1xSRRNUmwmV4F7BXhbAot7ApIXCJdbMRYGA44uZGkSIptTMG5vJpUsVQOYAIZiihVtpzhVhAAGCKQ5vaQiQVOfGr+PZiYHyLlJu8mMaI/GodESg7EfKQXIBtrXvp61F2Sg10RgrBwEz7DoLcONH5oa3fBUXKzNc2TW+Fic8OtAQBzAfv8OKgwBbmEOBHiSRIHo0AWBFMuwPdNgpGFFAJr/li3D1KuAu48YRBIgMHAPRZSeDLSESbOmzZs4oVDaKTFnqZVAgUbhSamVzYJIIb70ybSp06eBkOb81rJklCg5k7IkheBq0UhTgSpdKeFqAYNOZa58+Q0qBpluAwWDSRWYyXcoe0Gc+abrRL7XviGAyNLDxSj3bArey+EuWJ+LG3ZF+8YjNW9Ac5m0LEYv4A8GTCaGp5fykNBGPhNZrHpcajOFi8VmM9i0K9G/EJwVI9VM7dYaR7Pp2Fn3L8GcLxREZtJaaMvLXwz2NFvOReG6Mel+sbvvUtKbmQgvECf0v4K2k+kWHnp8eeO+v0f79PhLdz91sts6C5yFfJD3FVIHHnoWkPVRe7+Qt196eSkongXw4fQcCnW41F9F0+ETAQAh+QQJCgAAACwAAAAAQgBCAAAE/xDISau9dAjMu/8VISCWcFiFYIBsS4lbJcSUSbg4aMxrfb68nFBSKFg0xhpNgjgMUM9hZye4URCC6MRUGRxI18NSesEOehIqGjCjUK1pU5KMMSBlVd9LXCmI13QWMGspcwADWgApiTtfgRIEBYCHAoYEA2AYWHCHThZ2nCyLgG9kIgehp4ksdlmAKZlCfoYAjSpCrWduCJMuBrxAf1K5vY9xwmTExp8mt4GtoctNzi0FmJMG0csAwBUGs5pZmNtDWAeeGJdZBdrk6SZisZoaA5LuU17n9jpm7feK53Th+FXs3zd//xJOyKbQGAIriOp1a9giErwYCCJGZEexQ8ZzIP8PGPplDRGtjj7OVUJI4CHKeQhfypxJs6bNDyU11rs5IaTPnBpP0oTncwzPo0iTKjXWMmbDjPK8IShikmfIlVeslSwwseZHn1G0sitY0yLINGSVEnC6lFVXigbi5iDJ8WW2tWkXTpWYd9tdvGkjFXlrdy1eDlOLsG34t9hUwgwTyvV2d6Big4efDe6LqylnDt+KfO6cGddmNwRGf5qcxrNp0SHqDmnqzbBqblxJwR7WklTvuYQf7yJL8IXL2rfT5c7KCUEs2gt/G5waauoa57vk/Ur9L1LXb12x6/0OnVxoQC3lcQ1xXC93d2stOK8ur3x0u9YriB+ffBl4+Sc5158LMdvJF1Vpbe1HTgQAIfkECQoAAAAsAAAAAEIAQgAABP8QyEmrvXQMzLv/lTEUliBYxWCAbEsRwlaZpUC4OCgKK0W/pl5uWCBVCgLE7ERBxFDGYUc0UDYFUclvMkhWnExpB6ERAgwx8/Zsuk3Qh6z4srNybb4wAKYHIHlzHjAqFEh2ABqFWBRoXoESBAVmEkhZBANuGJeHXTKMmDkphC8amUN8pmxPOAaik4ZzSJ4ScIA5VKO0BJOsCGaNtkOtZY9TAgfBUri8xarJYsOpzQAIyMxjVbwG0tN72gVxGGSl3VJOB+GaogXc5ZoD6I7YGpLuU/DI9Trj7fbUyLlaGPDlD0OrfgUTnkGosAUCNymKEGzYIhI+JghE0dNH8QKZY+j/8jEikJFeRwwgD4xAOJChwowuT8qcSbOmzQ5FRugscnNCypD5IkYc0VML0JB9iipdyrQptIc9yRyysC1jETkzU2IxZfVqgYk2yRxNdxUB2KWRUtK65nSX02Lb2NoTETOE1brNwFljse2q25MiQnLUZPWsTBghp76QiLegXpXi2GlrnANqCHCz9g3uVu0AZYMZDU8zEFKuZtHdSKP7/Cb0r7/KDPwCaRr010kkWb8hkEq15xyRDA/czIr3JNWZdcCeYNbUQLlxX/CmCgquWTO5XxzKvnt5ueGprjc5tC0Vb+/TSJ4deNbsyPXG54rXHn4qyeMPa5+Sxp351JZU6SbMGXz+2YWeTOxZ4F4F9/UE4BeKRffWHgJ6EAEAIfkECQoAAAAsAAAAAEIAQgAABP8QyEmrvXQMzLv/lTEglmYhgwGuLEWYlbBVg0C0OCim9DwZMlVuCECQKoVRzCdBCAqWApTY2d0oqOkENkkeJ04m9fIqCCW7M0BGEQnUbu34YvD2rhIugMDGBucdLzxgSltMWW0CAl9zBAhqEnYTBAV4ZAOWBU8WdZYrWZBWY3w2IYpyK3VSkCiMOU6uboM4dQNmbQSQtI+Jf0Sqt4Acsp45tcHCpr5zqsXJfLOfBbwhzsl7unWbFwhSlddUTqcclN664IE1iq5k3tTow5qn53Td3/AcCAdP9FXv+JwQWANIEFfBZAIjSRHY7yAGSuoESHDkbWFDhy8U7dsnxwBFbw7/O2iUgYxOrpDk7qFcybKly5cIK7qDSUHjgY37uumcNo3mBAE3gQaV6LOo0aNI4XkcGFJnFUc62bEUesCWJYpR/7nMeDPoFCNGTiatBZSogYtHCTBN2sIjWnAi1po08vaavqpy0UBlyFJE15L1wNaF9yKo1ImCjTq5KWYS3xCDh2gFUOcAqg8G6AK8G3lY2M4sgOzL+/QxQANBSQf+dxZ0m5KiD7jObBqx6gsDqlbgMzqHI7E/avu+6Yp3Y8zAHVty20ETo7IWXtz2l1zt1Uz72ty8fM2jVrVq1GK5ieSmaxC/4TgKv/zmcqDHAXmHZH23J6CoOONLPpG/eAoFZIdEHHz4LEWfJwSY55N30RVD3IL87VFMDdOh9B88EQAAIfkECQoAAAAsAAAAAEIAQgAABP8QyEmrvbQUzLv/lVEg1jBYyGCAbEsRw1aZ5UC4OCiq80kZplVuCECQKprjhEZJyZpPIkZUuL1iPeRAKSEIfFIOQiOUAAtlANMc/Jm4YQsVXuAtwQAYvtiOcwhkTVsZUU5uAlZ+BghpEkkvaB2AiQB1UWZVOWORP3WNOAZflABAApc6m41jcDiGh3agqT8Eny4GtK+1LHO6fmxfvbsanL4hJrBhi5nFFV7IIJOfBsF+uCEIphiAI6PMLikC2VObjN62A+E2H9sj1OYi6cQetxrd5hXYpu5y1vfj9v4CXpgmkBkBK6sQ9CvYYke6LqtGGNknEEa4i+LMHBwxgqEHdOn/ynG4RTHgJI8oU6pcyXKlkZcwW5Y4gPGiEY4JZc6gyVPAgT06gwodStQjSaFjAGokEDOoz3iUmMJUWNKfxZ7iXh6sarTOUzNcZS4sqmgsQxFKRzI1WxDBgZ8Ub0llK7DUW3kD54YtBuOtAFYT9BLFdlfbVjl7W4jslHEX08Qf3AqAPItqwFA00+o4SLcYZkRSblmeMI2yiDSf98ode1hKgZ8hnmq+wLmRXMoE3o7CDPTD0WYHmxwAPAEblwE05ajzdZsCcjzJJ7zGY+AtceaPK+im8Fb4ASQ0KXdoHvhtmu6kt5P22VvR6CXRJ6Cf4POS2wPip3yqr/17hvjSnVKXGnry+VcefkjNV6AF1gmV2ykKOgIaWRT4FFAEACH5BAkKAAAALAAAAABCAEIAAAT/EMhJq720FMy7/5VREJZmIYUBriwlbpUZD2prf289FUM4pLeghIA4jWKwCWFQrCCaQo4BpRsWoBLZBDEgUZa9aIdwreYoPxfPzMOKLdNjBrhLAgxpCpf+xpy3cll2S1giXX0SU1UST4UIXhhkVXtwgSxECIt/Qng0IW03cZkVZJBBXG6dnqGNZgaLNgYEbD+wLKK2iIkDvLm3rbqVtYhxvm9gxhdEs3DJx7BTTJHAwUJgeRdT1NUrZLyHHpiPztWGvKMgsk/kwVzDsczcHVOm8vY47PfdXo0E8fo2iBQQwGuIuCf/AHLwRpAgtjvqGin0wItgmXkJJ1oopbGjx48g/0MCPNhPZIUBAlKqJLjskct6IlE2VBnGpM2bOHN6lJXPHgqYLmQtA+pRJsFHX1r6ywgSzEoBMJbO6jmRiMwwr3SGo6p1Xtadlla88sdVDIKUq/BJLRsFj0o+ftaaXKLSTVKyOc+mtONiaiWA6NRAjXXggF1detmSKnxAsQcDAg4IcHyHMeXHKhUTsKzGsQgzKok+5ozmQM0gA0/fyXxjQOFFmw2LiV0P8gG+ILjAKnz67OEtArDIrCTaBoLCplyfTpnBtIvIv4kV5oucQuEvkmNIvoyhwGvsja0fcFF9AuTB8gwUduNd9fXSfI9PtvdQQmTq45urBqBlovoD9bxn3hd3NsVmgYATRFZcVeiJV4IAC5rEnD0RAAAh+QQJCgAAACwAAAAAQgBCAAAE/xDISau9FCHMu/+VgRBWUVhEYYBsS4lbhZyy6t6gaFNFPBmmFW4IIJAqhFEN2bNoiB6YcJL0SUy1IxUL7VSnAGmGJgHuyiZt9wJTA2bg5k++Pa/ZGnBS/dxazW5QBgRgEnsvCIUhShMzVmWMLnuFYoJBISaPOV9IkUOOmJc4gyNgBqddg6YFA3Y3pIl3HWauo5OybCa1Q6SKuCm7s4mKqLgXhBY6moa3xkQpAwPLZVXIzi1A0QWByXvW1xwi2rGbSb7gVNHkLqfn6GHf7/Lh7vM31kZGxfbYM9ED1EaM0MfPi4l/rf6cGsit4JV/PeqpcojhEMWLGDNq3Agln0cjHP8nIBz50WPIhwIGpFRJ5qTLlzBjrkEgLaSGhoYKCDjA80DIaCl7qBnQs+cAnAWhpVwZo6eAbTJ1qARYBCnMeDI7DqgHDohVNkQPtOSHICjXH2EPbL0IRIDbdRjK8hTw9V3blNMApM1LkYDKpxiI1hIxDy6kVq948u1CIOVZEI0PCHjM6y/lcHMvV3bccSfdF8FYiDBlmVfmCoK76Bzrl/MNop8pEOBZl0Pj2GgB31tbYSdVCWX5lh2aEgVUWQh4gkk9wS2P4j/eyjOwc+xONTszOH8++V0ByXrAU+D5Yidp3dcMKK7w/beE7BRYynCruQWX+GIrSGYPncfYedQd4AYZeS+Ix9FsAliwX2+4adTYfwQ+VxtG/V0TAQAh+QQJCgAAACwAAAAAQgBCAAAE/xDISau9FCHMu/+VgRCWZhGIAa4sJW6VGRdqa39vPSFFWKS3oIRAqqCKO9gEpdwhhRgDSjccxZoAzRNAKPSgHRGBmqP8XDwybwsOHa9UmcRwpnSBbU55aU3aC090gHlzYyd9c3hRillyEyJUK0SGLlNggpGCWCBSI5GWUF1bmpErUkRkBqUtUmpeq6ZHsIQAgjRtp5S0Ll6MUJ2zuD/BF6ilqrvFxzybhZ7JQl29epO60DheXmwWudbX3Dy9xI+T48kEA8M3qua7rd/wks3x0TUH9wKD9DYiXukSBe4JPCBg3j4+BdINSNekiwCBAg52SJgOUDAEAwxKBCWxo8ePIP9DwhtIUmQFigtTFnhIkqBJMyljfnlJs6bNm/Qwajz4hoNDiDRlMgpIMiPNLjEXwoCoD2e/lEO24VzSbuqHLlUJiVk34N5MiRjztaMjcEDWPHRS+irBUoBUnisXvu1KcOfGhQUxdL0Vwi6YtSL+tSDw0G8QwmYJESZ4loWBAQISg1ksoDEryJIPP6zMy/IjRo8jW6YcaS+YlV9rYW7clbMdgm9BEHYbAnJq2QPYPBxgJy8HjE/icmvaBgFjCrYpCIg4Qfij5bFxPUz98Mny3sx3iIYX0PWQ4xMeulhOJvk1A9VPRq7gEnk+I+S/ebFgWnl2CQjWz/CI/kCk9kvE9xIUAQCGd4AF0NGE3m3XnZSZVfpdEwEAIfkECQoAAAAsAAAAAEIAQgAABP8QyEmrvZQQzLv/laFZCGIRiAGuLCVuFXqmbQ2KNFWGpWr/ANGJ4JvIMghYRgnEvIoSQ7KyQzKD1Sbn6dJAj9Geq3TVhryxnCSLNSHV5gt3Iv0yUUwpXIsYlDV5RB0iX2xRgjUDBwJXc0B6UFgFZR8GB5eRL1p4PAV7K5aXeQaRNaRQep8soQelcWOeri2ssnGptbMCB26vIbGJBwOlYL0hpSKTGIqXBcVNKAXJGAiXi5TOWwjRqhUF1QK42EEE24gfBMu84hfkk+EX2u/OhOv1K8T2Zojf0vmz0NEkFNBVLZg6f3K0RVt4Z+A3hB0WejLHbsBBiF3kYdzIsaPHjyz/CBZcBJKCxJMiCwooOSHagAIvXzZjSbOmzZvitF3kyIkDuWUkS8JkCGVASgF+WEKL+dINwZcaMeoZegjnlqhWO5DDamuKqXQ8B1jUaMDhgQJczUgRO9YDgqfXEJYV28+Ct0U7O/60iMHbJyn5KIbhm0tA3jjohL0yoAtcPQN008YQQFnyKraWgzRGxQ0UnLmKbRCg7JiC0ZlA+qCOgtmG0dJGKMcFgQ52FKo10JWiPCADYQzomMDs7SszlcomBawWm3w15KSPKa8GIJsCZRdIj4cWN9D2aNvX6RhFJfawFsaMtFcI39Lw5O3OAlYwepD9GuUkzGNDf8W+ZvgefWeBEn8AGDUbQuhcRGAfxtnD3DoRAAAh+QQJCgAAACwAAAAAQgBCAAAE/xDISau9lBDMu/8VcRSWZhmEAa4shRxHuVVI2t6gAc+TSaE2nBAwGFgEoxBPApQNPbokpXAQKEMI1a/29FAPWokInFkCwwDgsnuCkSgwREY+QdF7NTTb8joskUY9SxpmBFl7EggDawCAGQd3FyhohoyTOANVen2MLXZ6BghcNwZIZBSZgUOGoJV6KwSmaAYFr54Gs6KHQ6VVnYhMrmxRAraIoaLGpEiRwEx5N5m1J83OTK92v1+Q1ry6vwAIpgLg3dS6yhPbA+nmdqJBHwaZ3OYchtA3BNP2GJf9AD0YCggMlwRTAwqUIygJXwE6BUzBEDCgGsMtoh4+NFOAXpWLHP8y1oh3YZ9FkGlIolzJsqXLlzgkwpgIcwKCAjhzPhSApCcMVTBvCtV4sqbRo0iTshFak1WHfQN6WgmaM5+EiFWqUFxIMJROnDN4UuSX1E5OMVyPGlSKaF+7bqHenogqoKi9fQ/lponIk+zFUAkVthPHc9FLwGA58K17FO9DDBH9PguoMuXjFgSi2u2SWTKvwnpx0MIZ2h/ogLQSlq5QauuW1axJpvac4/QUAW+GKGo2G3ZEwxl4ws5QZE3qzSU9R80NIHO5fUsUMX82/II4drcjFXGR8EdxgPMYoyKHCmhmoM1V9/s9iyIait6x1+mIXEjrNeKmw59SMUSR6l5UE1EjM9txN1049RUUlR771fFfUw1OEJUF38E0TzURJkLbUR31EwEAOwAAAAAAAAAAAA=="></div><div class=overlay ng-show=showOverlayFormAvancedSearch><div class="panel panel-default centrado" style=width:{{options.formAvancedSearch.width||500}}px><div class=panel-heading><h4>{{options.snippets.formAvancedSearchTitle || "B&uacute;squeda Avanzada"}}</h4></div><div class=panel-body><form name=formAvancedSearchFieldsFormG novalidate><h4>{{options.snippets.formAvancedSearchMessage}}</h4><div ng-repeat="field in options.formAvancedSearch.fields"><div edu-field options=field value=options.formAvancedSearchResult[field.key]></div></div><div><h5>{{options.snippets.formAvancedSearchNota}}</h5></div></form></div><div class=panel-footer><div class=row><div class="col-md-offset-3 col-md-9"><button ng-click=formAvancedSearchEventsContinue() ng-disabled=formAvancedSearch.$invalid class="btn btn-sm btn-primary">{{options.snippets.formAvancedSearchButtonContinue || \'Aceptar\'}}</button> <button ng-click=formAvancedSearchEventsCancel() class="btn btn-sm">{{options.snippets.formAvancedSearchButtonCancel || \'Cancelar\'}}</button> <button ng-click=formAvancedSearchEventsClean() class="btn btn-sm">{{options.snippets.formAvancedSearchButtonClean || \'Limpiar\'}}</button></div></div></div></div></div><div class=overlay ng-show=options.showOverlayFormUser><div class="panel panel-default centrado" style=width:{{options.formUser.width}}><div class=panel-heading><h4>{{options.snippets.formUserTitle}}</h4></div><div class=panel-body><form name=formUser novalidate><h4>{{options.snippets.formUserMessage}}</h4><div class="form-group {{field.col}}" ng-repeat="field in options.formUser.fields"><label for={{field.key}} class=ng-binding style=align:left>{{field.label}} {{field.required ? \'*\' : \'\'}}</label><input class=form-control id={{field.key}} name={{field.key}} ng-model=options.formUser.result[field.key] placeholder={{field.placeholder}} ng-required=field.required ng-disabled=field.disabled></div><div><h5>{{options.snippets.formUserNota}}</h5></div></form></div><div class=panel-footer><div class=row><div class="col-md-offset-3 col-md-9"><button ng-click=options.formUser.events.continue(selectedRow) ng-disabled=formUser.$invalid class="btn btn-sm btn-primary">{{options.snippets.formUserButtonContinue || \'Aceptar\'}}</button> <button ng-click=options.formUser.events.cancel() class="btn btn-sm">{{options.snippets.formUserButtonCancel || \'Cancelar\'}}</button></div></div></div></div></div><div class=overlay ng-show=options.overlayFormSuccessErrorGrid.show><div class="panel panel-{{options.overlayFormSuccessErrorGrid.type|| \'info\'}} centrado" style=min-width:{{options.overlayFormSuccessErrorGrid.width||200}}px><div class=panel-heading><span ng-if="options.overlayFormSuccessErrorGrid.type==\'success\'" class="glyphicon glyphicon-ok pull-right"></span> <span ng-if="options.overlayFormSuccessErrorGrid.type==\'danger\'" class="glyphicon glyphicon-remove pull-right"></span><br></div><div class=panel-body><h4>{{options.overlayFormSuccessErrorGrid.message}}</h4></div><div class=panel-footer><div class=row><div class="col-md-offset-3 col-md-9"><button ng-click="options.overlayFormSuccessErrorGrid.show=false" class="btn btn-sm btn-primary">{{options.snippets.overlayFormSuccessErrorGrid || \'Aceptar\'}}</button></div></div></div></div></div></div></div>');
  }
]);