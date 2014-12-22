/*
 edu-field v0.0.4
 (c) Educarm, http://www.educarm.es
 License: MIT
*/
// Main eduField Module
//Declare app level module which depends on filters, and services
var eduFieldServices = angular.module('edu-field.services', []);
var eduFieldDirectives = angular.module('edu-field.directives', []);
var eduFieldFilters = angular.module('edu-field.filters', []);
var eduFieldTpl = angular.module('edu-field.tpl', []);
// initialization of services into the main module
angular.module('eduField', [
  'edu-field.services',
  'edu-field.directives',
  'edu-field.filters',
  'edu-field.tpl',
  'ngResource',
  'textAngular',
  'angularFileUpload',
  'ui.bootstrap'
]);
eduFieldDirectives.directive('eduComplete', [
  '$parse',
  '$http',
  '$sce',
  '$timeout',
  function ($parse, $http, $sce, $timeout) {
    return {
      restrict: 'EA',
      scope: {
        'id': '@id_',
        'name': '@name',
        'onblur': '&onblur',
        'onfocus': '&onfocus',
        'autofocus': '=autofocus',
        'required': '=required',
        'placeholder': '@placeholder',
        'selectedObject': '=selectedobject',
        'url': '@url',
        'urldataloadall': '@urldataloadall',
        'dataField': '@datafield',
        'titleField': '@titlefield',
        'descriptionField': '@descriptionfield',
        'imageField': '@imagefield',
        'imageUri': '@imageuri',
        'inputClass': '@inputclass',
        'userPause': '@pause',
        'localData': '=localdata',
        'searchFields': '@searchfields',
        'minLengthUser': '@minlength',
        'matchClass': '@matchclass'
      },
      template: '<div class="eduComplete-holder"><input id="{{id}}" name="{{name}}" autofocus="{{autofocus}}" ng-blur="onblur()" ng-focus="onfocus()" ng-change="onchange()" ng-required="{{required}}" ng-model="searchStr" type="text" placeholder="{{placeholder}}" class="{{inputClass}}" onmouseup="this.select();" ng-focus="resetHideResults()" ng-blur="hideResults()" /><div id="{{id}}_dropdown" class="eduComplete-dropdown" ng-if="showDropdown"><div class="eduComplete-searching" ng-show="searching">Buscando...</div><div class="eduComplete-searching" ng-show="!searching && (!results || results.length == 0)">No hay resultados</div><div class="eduComplete-row" ng-repeat="result in results" ng-click="selectResult(result)" ng-mouseover="hoverRow()" ng-class="{\'eduComplete-selected-row\': $index == currentIndex}"><div ng-if="imageField" class="eduComplete-image-holder"><img ng-if="result.image && result.image != \'\'" ng-src="{{result.image}}" class="eduComplete-image"/><div ng-if="!result.image && result.image != \'\'" class="eduComplete-image-default"></div></div><div class="eduComplete-title" ng-if="matchClass" ng-bind-html="result.title"></div><div class="eduComplete-title" ng-if="!matchClass">{{ result.title }}</div><div ng-if="result.description && result.description != \'\'" class="eduComplete-description">{{result.description}}</div></div></div></div>',
      link: function ($scope, elem, attrs) {
        $scope.lastSearchTerm = null;
        $scope.currentIndex = null;
        $scope.justChanged = false;
        $scope.searchTimer = null;
        $scope.hideTimer = null;
        $scope.searching = false;
        $scope.pause = 500;
        $scope.minLength = 3;
        if ($scope.urldataloadall && $scope.urldataloadall != '') {
          $http.get($scope.urldataloadall, {}).success(function (responseData, status, headers, config) {
            $scope.localData = responseData;
            console.log('Todos los datos:' + angular.toJson(responseData));  //$scope.processResults( responseData , str);
          }).error(function (data, status, headers, config) {
            console.log('error');
          });
        }
        if ($scope.minLengthUser && $scope.minLengthUser != '') {
          $scope.minLength = $scope.minLengthUser;
        }
        if ($scope.userPause) {
          $scope.pause = $scope.userPause;
        }
        isNewSearchNeeded = function (newTerm, oldTerm) {
          return newTerm.length >= $scope.minLength && newTerm != oldTerm;
        };
        $scope.processResults = function (responseData, str) {
          if (responseData && responseData.length > 0) {
            $scope.results = [];
            var titleFields = [];
            if ($scope.titleField && $scope.titleField != '') {
              titleFields = $scope.titleField.split(',');
            }
            for (var i = 0; i < responseData.length; i++) {
              // Get title variables
              var titleCode = [];
              for (var t = 0; t < titleFields.length; t++) {
                titleCode.push(responseData[i][titleFields[t]]);
              }
              var description = '';
              if ($scope.descriptionField) {
                description = responseData[i][$scope.descriptionField];
              }
              var data = '';
              if ($scope.dataField) {
                data = responseData[i][$scope.dataField];
              }
              var imageUri = '';
              if ($scope.imageUri) {
                imageUri = $scope.imageUri;
              }
              var image = '';
              if ($scope.imageField) {
                image = imageUri + responseData[i][$scope.imageField];
              }
              var text = titleCode.join(' ');
              if ($scope.matchClass) {
                var re = new RegExp(str, 'i');
                var strPart = text.match(re)[0];
                text = $sce.trustAsHtml(text.replace(re, '<span class="' + $scope.matchClass + '">' + strPart + '</span>'));
              }
              var resultRow = {
                  title: text,
                  description: description,
                  image: image,
                  data: data
                };
              $scope.results[$scope.results.length] = resultRow;
            }
          } else {
            $scope.results = [];
          }
        };
        $scope.searchTimerComplete = function (str) {
          // Begin the search
          if (str && str != '' && str.length >= $scope.minLength) {
            if ($scope.localData) {
              var searchFields = $scope.searchFields.split(',');
              var matches = [];
              for (var i = 0; i < $scope.localData.length; i++) {
                var match = false;
                for (var s = 0; s < searchFields.length; s++) {
                  match = match || typeof $scope.localData[i][searchFields[s]] === 'string' && typeof str === 'string' && $scope.localData[i][searchFields[s]].toLowerCase().indexOf(str.toLowerCase()) >= 0;
                }
                if (match) {
                  matches[matches.length] = $scope.localData[i];
                }
              }
              $scope.searching = false;
              $scope.processResults(matches, str);
            } else {
              $http.get($scope.url + str + '&field=' + $scope.titleField, {}).success(function (responseData, status, headers, config) {
                $scope.searching = false;
                $scope.processResults(responseData, str);
              }).error(function (data, status, headers, config) {
                console.log('error');
              });
            }
          }
        };
        $scope.hideResults = function () {
          $scope.hideTimer = $timeout(function () {
            $scope.showDropdown = false;
          }, $scope.pause);
        };
        $scope.resetHideResults = function () {
          if ($scope.hideTimer) {
            $timeout.cancel($scope.hideTimer);
          }
          ;
        };
        $scope.hoverRow = function (index) {
          $scope.currentIndex = index;
        };
        $scope.keyPressed = function (event) {
          if (!(event.which == 38 || event.which == 40 || event.which == 13)) {
            if (!$scope.searchStr || $scope.searchStr == '') {
              $scope.showDropdown = false;
              $scope.lastSearchTerm = null;
            } else if (isNewSearchNeeded($scope.searchStr, $scope.lastSearchTerm)) {
              $scope.lastSearchTerm = $scope.searchStr;
              $scope.showDropdown = true;
              $scope.currentIndex = -1;
              $scope.results = [];
              if ($scope.searchTimer) {
                $timeout.cancel($scope.searchTimer);
              }
              $scope.searching = true;
              $scope.searchTimer = $timeout(function () {
                $scope.searchTimerComplete($scope.searchStr);
              }, $scope.pause);
            }
          } else {
            event.preventDefault();
          }
        };
        //cuando hay cambios en el value del control autocomplete
        $scope.$watch('selectedObject', function (value) {
          if (typeof value !== 'undefined') {
            //coloca en el input text que ve el usuario el titulo o nombre que corresponde al valor que hay en la propiedad value del control autocomplete
            var titleField = '';
            var str = $scope.selectedObject;
            if ($scope.titleField && $scope.titleField != '') {
              titleFields = $scope.titleField.split(',');
            }
            if ($scope.localData) {
              var matches = [];
              for (var i = 0; i < $scope.localData.length; i++) {
                var match = false;
                match = typeof $scope.localData[i][$scope.dataField] === 'string' && typeof str === 'string' && $scope.localData[i][$scope.dataField].toLowerCase().indexOf(str.toLowerCase()) >= 0;
                if (match) {
                  //matches[matches.length] = $scope.localData[i];
                  $scope.searchStr = '';
                  for (var t = 0; t < titleFields.length; t++) {
                    if (t == 0) {
                      $scope.searchStr = $scope.localData[i][titleFields[t]];
                    } else {
                      $scope.searchStr = $scope.searchStr + ' ' + $scope.localData[i][titleFields[t]];
                    }
                  }
                  break;
                }
              }
              $scope.searching = false;
            } else {
              $http.get($scope.url + str + '&field=' + $scope.dataField, {}).success(function (data, status, headers, config) {
                $scope.searching = false;
                if (data.length > 0) {
                  $scope.searchStr = '';
                  for (var t = 0; t < titleFields.length; t++) {
                    if (t == 0) {
                      $scope.searchStr = data[0][titleFields[t]];
                    } else {
                      $scope.searchStr = $scope.searchStr + ' ' + data[0][titleFields[t]];
                    }
                  }
                }
              }).error(function (data, status, headers, config) {
                console.log('error');
              });
            }
          } else {
            // cuando ponemos el value del autocomplete a null o vacio, elimina la el contenido del textbox que ve el usuario
            $scope.searchStr = '';
          }
        });
        $scope.selectResult = function (result) {
          if ($scope.matchClass) {
            result.title = result.title.toString().replace(/(<([^>]+)>)/gi, '');
          }
          $scope.searchStr = $scope.lastSearchTerm = result.title;
          $scope.selectedObject = result.data;
          $scope.showDropdown = false;
          $scope.results = [];
        };
        var inputField = elem.find('input');
        inputField.on('keyup', $scope.keyPressed);
        elem.on('keyup', function (event) {
          if (event.which === 40) {
            if ($scope.results && $scope.currentIndex + 1 < $scope.results.length) {
              $scope.currentIndex++;
              $scope.$apply();
              event.preventDefault;
              event.stopPropagation();
            }
            $scope.$apply();
          } else if (event.which == 38) {
            if ($scope.currentIndex >= 1) {
              $scope.currentIndex--;
              $scope.$apply();
              event.preventDefault;
              event.stopPropagation();
            }
          } else if (event.which == 13) {
            if ($scope.results && $scope.currentIndex >= 0 && $scope.currentIndex < $scope.results.length) {
              $scope.selectResult($scope.results[$scope.currentIndex]);
              $scope.$apply();
              event.preventDefault;
              event.stopPropagation();
            } else {
              $scope.results = [];
              $scope.$apply();
              event.preventDefault;
              event.stopPropagation();
            }
          } else if (event.which == 27) {
            $scope.results = [];
            $scope.showDropdown = false;
            $scope.$apply();
          } else if (event.which == 8) {
            $scope.selectedObject = null;
            $scope.$apply();
          }
        });
      }
    };
  }
]);
'use strict';
eduFieldDirectives.directive('dynamicName', [
  '$compile',
  function ($compile) {
    return {
      restrict: 'A',
      terminal: true,
      priority: 1000,
      link: function (scope, element, attrs) {
        element.attr('name', scope.$eval(attrs.dynamicName));
        element.removeAttr('dynamic-name');
        $compile(element)(scope);
      }
    };
  }
]);
eduFieldDirectives.directive('dateInput', [
  'dateFilter',
  function (dateFilter) {
    return {
      require: 'ngModel',
      template: '<input type="date" ></input>',
      replace: true,
      link: function (scope, elm, attrs, ngModelCtrl) {
        ngModelCtrl.$formatters.unshift(function (modelValue) {
          return dateFilter(modelValue, 'yyyy-MM-dd');
        });
        ngModelCtrl.$parsers.unshift(function (viewValue) {
          return new Date(viewValue);
        });
      }
    };
  }
]);
eduFieldDirectives.directive('dateTimeInput', [
  'dateFilter',
  function (dateFilter) {
    return {
      require: 'ngModel',
      template: '<input type="datetime-local"></input>',
      replace: true,
      link: function (scope, elm, attrs, ngModelCtrl) {
        ngModelCtrl.$formatters.unshift(function (modelValue) {
          return dateFilter(modelValue, 'yyyy-MM-ddTHH:mm');
        });
        ngModelCtrl.$parsers.unshift(function (viewValue) {
          return new Date(viewValue);
        });
      }
    };
  }
]);
eduFieldDirectives.directive('eduField', [
  '$http',
  '$compile',
  '$templateCache',
  '$timeout',
  function formField($http, $compile, $templateCache, $timeout) {
    var getTemplateUrl = function (type) {
      var templateUrl = '';
      switch (type) {
      case 'textbutton':
        templateUrl = 'directives/edu-field-textbutton-tpl.html';
        break;
      case 'button':
        templateUrl = 'directives/edu-field-button-tpl.html';
        break;
      case 'hidden':
        templateUrl = 'directives/edu-field-hidden-tpl.html';
        break;
      case 'literal':
        templateUrl = 'directives/edu-field-literal-tpl.html';
        break;
      case 'upload':
        templateUrl = 'directives/edu-field-upload-tpl.html';
        break;
      case 'nifniecif':
        templateUrl = 'directives/edu-field-nifniecif-tpl.html';
        break;
      case 'iban':
        templateUrl = 'directives/edu-field-iban-tpl.html';
        break;
      case 'autocomplete':
        templateUrl = 'directives/edu-field-autocomplete-tpl.html';
        break;
      case 'range':
        templateUrl = 'directives/edu-field-range-tpl.html';
        break;
      case 'textedit':
        templateUrl = 'directives/edu-field-textedit-tpl.html';
        break;
      case 'url':
        templateUrl = 'directives/edu-field-url-tpl.html';
        break;
      case 'time':
        templateUrl = 'directives/edu-field-time-tpl.html';
        break;
      case 'week':
        templateUrl = 'directives/edu-field-week-tpl.html';
        break;
      case 'month':
        templateUrl = 'directives/edu-field-month-tpl.html';
        break;
      case 'date':
        templateUrl = 'directives/edu-field-date-tpl.html';
        break;
      case 'date-time':
        templateUrl = 'directives/edu-field-date-time-tpl.html';
        break;
      case 'textarea':
        templateUrl = 'directives/edu-field-textarea-tpl.html';
        break;
      case 'radio':
        templateUrl = 'directives/edu-field-radio-tpl.html';
        break;
      case 'select':
        templateUrl = 'directives/edu-field-select-tpl.html';
        break;
      case 'number':
        templateUrl = 'directives/edu-field-number-tpl.html';
        break;
      case 'checkbox':
        templateUrl = 'directives/edu-field-checkbox-tpl.html';
        break;
      case 'password':
        templateUrl = 'directives/edu-field-password-tpl.html';
        break;
      case 'hidden':
        templateUrl = 'directives/edu-field-hidden-tpl.html';
        break;
      case 'email':
        templateUrl = 'directives/edu-field-email-tpl.html';
        break;
      case 'text':
        templateUrl = 'directives/edu-field-text-tpl.html';
        break;
      default:
        templateUrl = null;
        break;
      }
      return templateUrl;
    };
    return {
      restrict: 'AE',
      transclude: true,
      scope: {
        options: '=options',
        value: '=value'
      },
      link: function fieldLink($scope, $element, $attr, ctrl) {
        if (!$scope.hasOwnProperty('options')) {
          throw new Error('options are required!');
        }
        // load the correct template
        var templateUrl = $scope.options.templateUrl || getTemplateUrl($scope.options.type);
        if (templateUrl) {
          $http.get(templateUrl, { cache: $templateCache }).success(function (data) {
            $element.html(data);
            $compile($element.contents())($scope);
          });
        } else {
          console.log('eduField Error: plantilla tipo \'' + $scope.options.type + '\' no soportada.');
        }
        // validate field
        $scope.$dirty = false;
        $scope.$invalid = false;
        $scope.$invalidRequired = false;
        $scope.$invalidPattern = false;
        $scope.$invalidMinlength = false;
        $scope.$invalidMaxlength = false;
        $scope.$invalidMin = false;
        $scope.$invalidMax = false;
        // ---
        // CALLBACKS
        // ---
        $scope.onClick = function () {
          if ($scope.options.hasOwnProperty('fieldListeners') && typeof $scope.options.fieldListeners.onClick == 'function') {
            $scope.options.fieldListeners.onClick($scope.value);
          }
        };
        $scope.onChange = function () {
          if ($scope.options.hasOwnProperty('fieldListeners') && typeof $scope.options.fieldListeners.onChange == 'function') {
            $scope.options.fieldListeners.onChange($scope.value);
          }
        };
        $scope.onInit = function () {
          var callInit = function () {
            $scope.options.fieldListeners.onInit($scope.value);
            $scope.$apply();
          };
          if ($scope.options.hasOwnProperty('fieldListeners') && typeof $scope.options.fieldListeners.onInit == 'function') {
            $timeout(callInit, 2000);
          }
        };
        $scope.onFocus = function () {
          if ($scope.options.hasOwnProperty('fieldListeners') && typeof $scope.options.fieldListeners.onFocus == 'function') {
            $scope.options.fieldListeners.onFocus($scope.value);
          }
        };
        $scope.onBlur = function () {
          var elementClass = $element.find('[id^=\'' + $scope.id + '\']').attr('class');
          $element.find('[id^=\'' + $scope.id + '\']').attr('blur', true);
          if (typeof elementClass !== 'undefined') {
            var aClass = elementClass.split(' ');
            for (var i = 0; i < aClass.length; i++) {
              if (aClass[i] === 'ng-dirty') {
                $scope.$dirty = true;
              } else if (aClass[i] == 'ng-invalid') {
                $scope.$invalid = true;
              } else if (aClass[i] == 'ng-invalid-required') {
                $scope.$invalidRequired = true;
              } else if (aClass[i] == 'ng-invalid-pattern') {
                $scope.$invalidPattern = true;
              } else if (aClass[i] == 'ng-invalid-minlength') {
                $scope.$invalidMinlength = true;
              } else if (aClass[i] == 'ng-invalid-maxlength') {
                $scope.$invalidMaxlength = true;
              } else if (aClass[i] == 'ng-invalid-min') {
                $scope.$invalidMin = true;
              } else if (aClass[i] == 'ng-invalid-max') {
                $scope.$invalidMax = true;
              } else if (aClass[i] == 'ng-valid') {
                $scope.$invalid = false;
              } else if (aClass[i] == 'ng-valid-required') {
                $scope.$invalidRequired = false;
              } else if (aClass[i] == 'ng-valid-pattern') {
                $scope.$invalidPattern = false;
              } else if (aClass[i] == 'ng-valid-minlength') {
                $scope.$invalidMinlength = false;
              } else if (aClass[i] == 'ng-valid-maxlength') {
                $scope.$invalidMaxlength = false;
              }
            }
          }
          if ($scope.options.hasOwnProperty('fieldListeners') && typeof $scope.options.fieldListeners.onBlur == 'function') {
            $scope.options.fieldListeners.onBlur($scope.value);
          }
        };
      },
      controller: [
        '$scope',
        'FileUploader',
        function fieldController($scope, FileUploader) {
          // component control
          $scope.options.fieldControl = {};
          $scope.internalControl = $scope.options.fieldControl || {};
          // ---
          // METHODS
          // ---  
          $scope.internalControl.upload = function (idxFile) {
            console.log('llamada a file upload file:' + idxFile);
            if ($scope.options.type = 'upload') {
              $scope.uploader.queue[idxFile - 1].upload();
            }
          };
          $scope.internalControl.refresh = function (value) {
            if ($scope.options.type = 'select') {
              $scope.refreshSelect(value);
            }
          };
          // ---
          // CONTROL TYPE= iban
          // ---
          $scope.ibanValidator = function () {
            return {
              test: function (value) {
                return IBAN.isValid(value);
              }
            };
          }();
          // ---
          // CONTROL TYPE= nif nie cif
          // ---
          $scope.nifniecifValidator = function () {
            return {
              test: function (value) {
                var sValid = valida_nif_cif_nie(value);
                if (sValid > 0)
                  return true;
                else
                  return false;
              }
            };
          }();
          // ---
          // CONTROL TYPE= ss
          // ---
          $scope.ssValidator = function () {
            return {
              test: function (value) {
                var sValid = ss(value);
                if (sValid >= 0)
                  return true;
                else
                  return false;
              }
            };
          }();
          // ---
          // CONTROL TYPE= uploader
          // ---
          // create a uploader with options
          var uploader = $scope.uploader = new FileUploader({ url: $scope.options.url });
          // FILTERS
          uploader.filters.push({
            name: 'customFilter',
            fn: function (item, options) {
              return this.queue.length < 10;
            }
          });
          // CALLBACKS
          uploader.onWhenAddingFileFailed = function (item, filter, options) {
            if ($scope.options.hasOwnProperty('fieldListeners') && typeof $scope.options.fieldListeners.onWhenAddingFileFailed == 'function') {
              $scope.options.fieldListeners.onWhenAddingFileFailed(item, filter, options);
            }
          };
          uploader.onAfterAddingFile = function (fileItem) {
            if ($scope.options.hasOwnProperty('fieldListeners') && typeof $scope.options.fieldListeners.onAfterAddingFile == 'function') {
              $scope.options.fieldListeners.onAfterAddingFile(fileItem);
            }
          };
          uploader.onAfterAddingAll = function (addedFileItems) {
            if ($scope.options.hasOwnProperty('fieldListeners') && typeof $scope.options.fieldListeners.onAfterAddingAll == 'function') {
              $scope.options.fieldListeners.onAfterAddingAll(addedFileItems);
            }
          };
          uploader.onBeforeUploadItem = function (item) {
            if ($scope.options.hasOwnProperty('fieldListeners') && typeof $scope.options.fieldListeners.onBeforeUploadItem == 'function') {
              $scope.options.fieldListeners.onBeforeUploadItem(item);
            }
          };
          uploader.onProgressItem = function (fileItem, progress) {
            if ($scope.options.hasOwnProperty('fieldListeners') && typeof $scope.options.fieldListeners.onProgressItem == 'function') {
              $scope.options.fieldListeners.onProgressItem(fileItem, progress);
            }
          };
          uploader.onProgressAll = function (progress) {
            if ($scope.options.hasOwnProperty('fieldListeners') && typeof $scope.options.fieldListeners.onProgressAll == 'function') {
              $scope.options.fieldListeners.onProgressAll(progress);
            }
          };
          uploader.onSuccessItem = function (fileItem, response, status, headers) {
            if ($scope.options.hasOwnProperty('fieldListeners') && typeof $scope.options.fieldListeners.onSuccessItem == 'function') {
              $scope.options.fieldListeners.onSuccessItem(fileItem, response, status, headers);
            }
          };
          uploader.onErrorItem = function (fileItem, response, status, headers) {
            if ($scope.options.hasOwnProperty('fieldListeners') && typeof $scope.options.fieldListeners.onErrorItem == 'function') {
              $scope.options.fieldListeners.onErrorItem(fileItem, response, status, headers);
            }
          };
          uploader.onCancelItem = function (fileItem, response, status, headers) {
            if ($scope.options.hasOwnProperty('fieldListeners') && typeof $scope.options.fieldListeners.onCancelItem == 'function') {
              $scope.options.fieldListeners.onCancelItem(fileItem, response, status, headers);
            }
          };
          uploader.onCompleteItem = function (fileItem, response, status, headers) {
            if ($scope.options.hasOwnProperty('fieldListeners') && typeof $scope.options.fieldListeners.onCompleteItem == 'function') {
              $scope.options.fieldListeners.onCompleteItem(fileItem, response, status, headers);
            }
          };
          uploader.onCompleteAll = function () {
            if ($scope.options.hasOwnProperty('fieldListeners') && typeof $scope.options.fieldListeners.onCompleteAll == 'function') {
              $scope.options.fieldListeners.onCompleteAll();
            }
          };
          // ---
          // CONTROL TYPE= SELECT
          // ---
          $scope.refreshSelect = function (value) {
            //if($scope.options.selecttypesource=='url' && (typeof $scope.options.autoload=='undefined' || $scope.options.autoload==true )){
            if ($scope.options.selecttypesource == 'url' && true) {
              var sUrl = $scope.options.selectsource;
              if (typeof value != 'undefined') {
                sUrl = sUrl + '&' + value;
              }
              $http.get(sUrl).success(function (data, status, headers, config) {
                $scope.optionsSelect = data;
                for (var i = 0; i < $scope.optionsSelect.length; i++) {
                  if (!$scope.optionsSelect[i].hasOwnProperty('value')) {
                    $scope.optionsSelect[i].value = $scope.optionsSelect[i][$scope.options.optionvalue];
                  }
                  if (!$scope.optionsSelect[i].hasOwnProperty('name')) {
                    if ($scope.options.selectconcatvaluename) {
                      $scope.optionsSelect[i].name = $scope.optionsSelect[i][$scope.options.optionvalue] + ' - ' + $scope.optionsSelect[i][$scope.options.optionname];
                    } else {
                      $scope.optionsSelect[i].name = $scope.optionsSelect[i][$scope.options.optionname];
                    }
                    delete $scope.optionsSelect[i][$scope.options.optionname];
                    delete $scope.optionsSelect[i][$scope.options.optionvalue];
                  } else {
                    if ($scope.options.selectconcatvaluename) {
                      $scope.optionsSelect[i].name = $scope.optionsSelect[i]['value'] + ' - ' + $scope.optionsSelect[i]['name'];
                    } else {
                      $scope.optionsSelect[i].name = $scope.optionsSelect[i][$scope.options.optionname];
                    }
                  }
                }
                $scope.onInit();
              }).error(function (data, status, headers, config) {
              });
            } else if ($scope.options.selecttypesource == 'array') {
              $scope.optionsSelect = $scope.options.selectsource;
              $scope.$watchCollection('optionsSelect', function () {
                if (typeof $scope.optionsSelect != 'undefined') {
                  for (var i = 0; i < $scope.optionsSelect.length; i++) {
                    if (!$scope.optionsSelect[i].hasOwnProperty('value')) {
                      $scope.optionsSelect[i].value = $scope.optionsSelect[i][$scope.options.optionvalue];
                    }
                    if (!$scope.optionsSelect[i].hasOwnProperty('name')) {
                      if ($scope.options.selectconcatvaluename) {
                        $scope.optionsSelect[i].name = $scope.optionsSelect[i][$scope.options.optionvalue] + ' - ' + $scope.optionsSelect[i][$scope.options.optionname];
                      } else {
                        $scope.optionsSelect[i].name = $scope.optionsSelect[i][$scope.options.optionname];
                      }
                      delete $scope.optionsSelect[i][$scope.options.optionvalue];
                      delete $scope.optionsSelect[i][$scope.options.optionname];
                    } else {
                      if ($scope.options.selectconcatvaluename) {
                        $scope.optionsSelect[i].name = $scope.optionsSelect[i]['value'] + ' - ' + $scope.optionsSelect[i]['name'];
                      } else {
                        $scope.optionsSelect[i].name = $scope.optionsSelect[i][$scope.options.optionname];
                      }
                    }
                  }
                }
                $scope.onInit();
              });
            }
          };
          //if($scope.options.type=='select'){
          //	$scope.refreshSelect();
          //}
          if ($scope.options.type == 'select') {
            if ($scope.options.selecttypesource == 'url' && (typeof $scope.options.autoload == 'undefined' || $scope.options.autoload == true)) {
              var sUrl = $scope.options.selectsource;
              $http.get(sUrl).success(function (data, status, headers, config) {
                $scope.optionsSelect = data;
                for (var i = 0; i < $scope.optionsSelect.length; i++) {
                  if (!$scope.optionsSelect[i].hasOwnProperty('value')) {
                    $scope.optionsSelect[i].value = $scope.optionsSelect[i][$scope.options.optionvalue];
                  }
                  if (!$scope.optionsSelect[i].hasOwnProperty('name')) {
                    if ($scope.options.selectconcatvaluename) {
                      $scope.optionsSelect[i].name = $scope.optionsSelect[i][$scope.options.optionvalue] + ' - ' + $scope.optionsSelect[i][$scope.options.optionname];
                    } else {
                      $scope.optionsSelect[i].name = $scope.optionsSelect[i][$scope.options.optionname];
                    }
                    delete $scope.optionsSelect[i][$scope.options.optionname];
                    delete $scope.optionsSelect[i][$scope.options.optionvalue];
                  } else {
                    if ($scope.options.selectconcatvaluename) {
                      $scope.optionsSelect[i].name = $scope.optionsSelect[i]['value'] + ' - ' + $scope.optionsSelect[i]['name'];
                    } else {
                      $scope.optionsSelect[i].name = $scope.optionsSelect[i][$scope.options.optionname];
                    }
                  }
                }
                $scope.onInit();
              }).error(function (data, status, headers, config) {
              });
            } else if ($scope.options.selecttypesource == 'array') {
              $scope.optionsSelect = $scope.options.selectsource;
              $scope.$watchCollection('optionsSelect', function () {
                if (typeof $scope.optionsSelect != 'undefined') {
                  for (var i = 0; i < $scope.optionsSelect.length; i++) {
                    if (!$scope.optionsSelect[i].hasOwnProperty('value')) {
                      $scope.optionsSelect[i].value = $scope.optionsSelect[i][$scope.options.optionvalue];
                    }
                    if (!$scope.optionsSelect[i].hasOwnProperty('name')) {
                      if ($scope.options.selectconcatvaluename) {
                        $scope.optionsSelect[i].name = $scope.optionsSelect[i][$scope.options.optionvalue] + ' - ' + $scope.optionsSelect[i][$scope.options.optionname];
                      } else {
                        $scope.optionsSelect[i].name = $scope.optionsSelect[i][$scope.options.optionname];
                      }
                      delete $scope.optionsSelect[i][$scope.options.optionvalue];
                      delete $scope.optionsSelect[i][$scope.options.optionname];
                    } else {
                      if ($scope.options.selectconcatvaluename) {
                        $scope.optionsSelect[i].name = $scope.optionsSelect[i]['value'] + ' - ' + $scope.optionsSelect[i]['name'];
                      } else {
                        $scope.optionsSelect[i].name = $scope.optionsSelect[i][$scope.options.optionname];
                      }
                    }
                  }
                }
                $scope.onInit();
              });
            }
          }
          // default value
          if (typeof $scope.options.default !== 'undefined') {
            $scope.value = $scope.options.default;
          }
          // set field id and name
          $scope.id = $scope.options.id || $scope.options.key;
          $scope.name = $scope.options.name || $scope.options.key;
        }
      ]
    };
  }
]);
angular.module('edu-field.tpl').run([
  '$templateCache',
  function ($templateCache) {
    'use strict';
    $templateCache.put('directives/edu-field-autocomplete-tpl.html', '<div class="form-group {{options.col}}" ng-class="{\'has-error\':  $invalid, \'has-success\': !$invalid && $dirty}" style=position:relative><label for={{id}}>{{options.label}} {{options.required ? \'*\' : \'\'}}</label><edu-complete id_={{id}} name={{name}} onblur=onBlur() onfocus=onFocus() autofocus required placeholder={{options.placeholder}} pause={{autocpause}} selectedobject=value url={{options.autocurldata}} urldataloadall={{options.autocurldataloadall}} localdata=options.autoclocaldata searchfields={{options.autocsearchfields}} datafield={{options.autocfieldvalue}} titlefield={{options.autocfieldtitle}} descriptionfield={{options.autocdescriptionfield}} imagefield={{options.autocfieldimg}} minlength={{options.autocminlength}} inputclass="form-control form-control-small"><div class="help-block has-error" ng-show=$invalid style=position:absolute;top:50px><small class=error ng-show=$invalidRequired>Campo obligatorio. Introduzca un valor</small> <small class=error ng-show=$invalidMinlength>Debe tener al menos {{options.min}} caracteres</small> <small class=error ng-show=$invalidMaxlength>No puede tener m\xe1s de {{options.max}} caracteres</small> <small class=error ng-show=$invalidPattern>Introduzca un valor v\xe1lido</small></div></div>');
    $templateCache.put('directives/edu-field-button-tpl.html', '<div class="form-group {{options.col}}"><button type=button ng-click=options.onClick() class="btn btn-{{options.state}} btn-{{options.size}}" ng-disabled=options.disabled>{{options.label}}</button></div>');
    $templateCache.put('directives/edu-field-checkbox-tpl.html', '<div class="checkbox {{options.col}}" ng-class="{\'has-error\':  $invalid, \'has-success\': !$invalid && $dirty}" style=position:relative><label><input type=checkbox id={{id}} name=name autofocus ng-false-value="\'N\'" ng-true-value="\'S\'" ng-disabled={{options.disabled}} ng-model=value ng-blur=onBlur() ng-focus=onFocus() ng-change=onChange()> {{options.label}} {{options.required ? \'*\' : \'\'}}</label><div class="help-block has-error" ng-show=$invalid style=position:absolute;top:50px><small class=error ng-show=$invalidRequired>Campo obligatorio. Introduzca un valor</small></div></div>');
    $templateCache.put('directives/edu-field-cif-tpl.html', '<div class="form-group {{options.col}}" ng-class="{\'has-error\':  $invalid, \'has-success\': !$invalid && $dirty}" style=position:relative><label for={{id}}>{{options.label}} {{options.required ? \'*\' : \'\'}}</label><div class=input-group><span class=input-group-btn><button class="btn btn-default" type=button>CIF</button></span><div class=input-group><input style=min-width:250px class=form-control id={{id}} name={{name}} autofocus placeholder={{options.placeholder}} autofocus ng-required={{options.required}} ng-disabled={{options.disabled}} ng-minlength={{options.min}} ng-maxlength={{options.max}} ng-pattern="nifniecifValidator(\'cif\')" ng-model=value ng-blur=onBlur() ng-focus=onFocus() ng-change=onChange()></div></div><div class="help-block has-error" ng-show=$invalid style=position:absolute;top:50px><small class=error ng-show=$invalidRequired>Campo obligatorio. Introduzca un CIF</small> <small class=error ng-show=$invalidMinlength>Debe tener al menos {{options.min}} caracteres</small> <small class=error ng-show=$invalidMaxlength>No puede tener m\xe1s de {{options.max}} caracteres</small> <small class=error ng-show=$invalidPattern>Introduzca un NIF/NIE v\xe1lido</small></div></div>');
    $templateCache.put('directives/edu-field-date-time-tpl.html', '<div class="form-group {{options.col}}" ng-class="{\'has-error\':  $invalid, \'has-success\': !$invalid && $dirty}" style=position:relative><label for={{id}}>{{options.label}} {{options.required ? \'*\' : \'\'}}</label><input date-time-input class=form-control id={{id}} name={{name}} placeholder={{options.placeholder}} autofocus ng-required={{options.required}} ng-disabled={{options.disabled}} ng-model=value ng-blur=onBlur() ng-focus=onFocus() ng-change=onChange()><div class="help-block has-error" ng-show=$invalid style=position:absolute;top:50px><small class=error ng-show=$invalidRequired>Campo obligatorio. Introduzca una fecha y una hora</small> <small class=error ng-show=$invalidPattern>Introduzca un fecha y una hora v\xe1lida</small></div></div>');
    $templateCache.put('directives/edu-field-date-tpl.html', '<div class="form-group {{options.col}}" ng-class="{\'has-error\':  $invalid, \'has-success\': !$invalid && $dirty}" style=position:relative><label for={{id}}>{{options.label}} {{options.required ? \'*\' : \'\'}}</label><input type=date class=form-control id={{id}} name={{name}} placeholder={{options.placeholder}} autofocus ng-model=value ng-blur=onBlur() ng-focus=onFocus() ng-change=onChange() ng-required={{options.required}} ng-disabled={{options.disabled}}><div class="help-block has-error" ng-show=$invalid style=position:absolute;top:50px><small class=error ng-show=$invalidRequired>Campo obligatorio. Introduzca una fecha</small> <small class=error ng-show=$invalidPattern>Introduzca un fecha v\xe1lida (dd-mm-aaaa)</small></div></div>');
    $templateCache.put('directives/edu-field-email-tpl.html', '<div class="form-group {{options.col}}" ng-class="{\'has-error\':  $invalid, \'has-success\': !$invalid && $dirty}" style=position:relative><label for={{id}}>{{options.label}} {{options.required ? \'*\' : \'\'}}</label><input class=form-control id={{id}} name={{name}} placeholder={{options.placeholder}} autofocus ng-required={{options.required}} ng-disabled={{options.disabled}} ng-pattern="/^[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+(?:[A-Z]{2}|es|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum)\\b$/" ng-minlength={{options.min}} ng-maxlength={{options.max}} ng-model=value ng-blur=onBlur() ng-focus=onFocus() ng-change=onChange()><div class="help-block has-error" ng-show=$invalid style=position:absolute;top:50px><small class=error ng-show=$invalidRequired>Campo obligatorio. Introduzca un email</small> <small class=error ng-show=$invalidMinlength>Debe tener al menos {{options.min}} caracteres</small> <small class=error ng-show=$invalidMaxlength>No puede tener m\xe1s de {{options.max}} caracteres</small> <small class=error ng-show=$invalidPattern>Introduzca un email v\xe1lido</small></div></div>');
    $templateCache.put('directives/edu-field-hidden-tpl.html', '<input type=hidden class=form-control id={{id}} name={{name}} ng-model=value ng-change=onChange()>');
    $templateCache.put('directives/edu-field-iban-tpl.html', '<div class="form-group {{options.col}}" ng-class="{\'has-error\':  $invalid, \'has-success\': !$invalid && $dirty}" style=position:relative><label for={{id}}>{{options.label}} {{options.required ? \'*\' : \'\'}}</label><div class=input-group><span class=input-group-btn><button class="btn btn-default" type=button>IBAN</button></span> <input style=width:250px class=form-control id={{id}} name={{name}} autofocus placeholder={{options.placeholder}} autofocus ng-required={{options.required}} ng-disabled={{options.disabled}} ng-pattern=ibanValidator ng-minlength={{options.min}} ng-maxlength={{options.max}} ng-model=value ng-blur=onBlur() ng-focus=onFocus() ng-change=onChange()></div><div class="help-block has-error" ng-show=$invalid style=position:absolute;top:50px><small class=error ng-show=$invalidRequired>Campo obligatorio. Introduzca un IBAN</small> <small class=error ng-show=$invalidMinlength>Debe tener al menos {{options.min}} caracteres</small> <small class=error ng-show=$invalidMaxlength>No puede tener m\xe1s de {{options.max}} caracteres</small> <small class=error ng-show=$invalidPattern>Introduzca un IBAN v\xe1lido</small></div></div>');
    $templateCache.put('directives/edu-field-literal-tpl.html', '<div class="form-group {{options.col}}"><label for={{id}}>{{options.label}} {{options.required ? \'*\' : \'\'}}</label><div id={{id}}>{{options.text}}</div></div>');
    $templateCache.put('directives/edu-field-month-tpl.html', '<div class="form-group {{options.col}}" ng-class="{\'has-error\':  $invalid, \'has-success\': !$invalid && $dirty}" style=position:relative><label for={{id}}>{{options.label}} {{options.required ? \'*\' : \'\'}}</label><input type=month class=form-control id={{id}} name={{name}} autofocus placeholder={{options.placeholder}} autofocus ng-required={{options.required}} ng-disabled={{options.disabled}} ng-pattern="/^(19|20)\\d\\d[- \\/](0[1-9]|1[012])$/" ng-model=value ng-blur=onBlur() ng-focus=onFocus() ng-change=onChange()><div class="help-block has-error" ng-show=$invalid style=position:absolute;top:50px><small class=error ng-show=$invalidRequired>Campo obligatorio. Introduzca un mes</small> <small class=error ng-show=$invalidPattern>Introduzca un mes v\xe1lido</small></div></div>');
    $templateCache.put('directives/edu-field-nie-tpl.html', '<div class="form-group {{options.col}}" ng-class="{\'has-error\':  $invalid, \'has-success\': !$invalid && $dirty}" style=position:relative><label for={{id}}>{{options.label}} {{options.required ? \'*\' : \'\'}}</label><div class=input-group><span class=input-group-btn><button class="btn btn-default" type=button>{{options.textbutton}}</button></span><div class=input-group><input style=min-width:250px class=form-control id={{id}} name={{name}} autofocus placeholder={{options.placeholder}} autofocus ng-required={{options.required}} ng-disabled={{options.disabled}} ng-minlength={{options.min}} ng-maxlength={{options.max}} ng-pattern=nifniecifValidator ng-model=value ng-blur=onBlur() ng-focus=onFocus() ng-change=onChange()></div></div><div class="help-block has-error" ng-show=$invalid style=position:absolute;top:50px><small class=error ng-show=$invalidRequired>Campo obligatorio. Introduzca un NIE</small> <small class=error ng-show=$invalidMinlength>Debe tener al menos {{options.min}} caracteres</small> <small class=error ng-show=$invalidMaxlength>No puede tener m\xe1s de {{options.max}} caracteres</small> <small class=error ng-show=$invalidPattern>Introduzca un NIF/NIE v\xe1lido</small></div></div>');
    $templateCache.put('directives/edu-field-nif-tpl.html', '<div class="form-group {{options.col}}" ng-class="{\'has-error\':  $invalid, \'has-success\': !$invalid && $dirty}" style=position:relative><label for={{id}}>{{options.label}} {{options.required ? \'*\' : \'\'}}</label><div class=input-group><span class=input-group-btn><button class="btn btn-default" type=button>NIF</button></span><div class=input-group><input style=min-width:250px class=form-control id={{id}} name={{name}} autofocus placeholder={{options.placeholder}} autofocus ng-required={{options.required}} ng-disabled={{options.disabled}} ng-minlength={{options.min}} ng-maxlength={{options.max}} ng-pattern="nifniecifValidator(\'nif\')" ng-model=value ng-blur=onBlur() ng-focus=onFocus() ng-change=onChange()></div></div><div class="help-block has-error" ng-show=$invalid style=position:absolute;top:50px><small class=error ng-show=$invalidRequired>Campo obligatorio. Introduzca un NIF</small> <small class=error ng-show=$invalidMinlength>Debe tener al menos {{options.min}} caracteres</small> <small class=error ng-show=$invalidMaxlength>No puede tener m\xe1s de {{options.max}} caracteres</small> <small class=error ng-show=$invalidPattern>Introduzca un NIF/NIE v\xe1lido</small></div></div>');
    $templateCache.put('directives/edu-field-nifniecif-tpl.html', '<div class="form-group {{options.col}}" ng-class="{\'has-error\':  $invalid, \'has-success\': !$invalid && $dirty}" style=position:relative><label for={{id}}>{{options.label}} {{options.required ? \'*\' : \'\'}}</label><div class=input-group><span class=input-group-btn><button class="btn btn-default" type=button>{{options.textbutton}}</button></span> <input style=min-width:250px class=form-control id={{id}} name={{name}} autofocus placeholder={{options.placeholder}} autofocus ng-required={{options.required}} ng-disabled={{options.disabled}} ng-minlength={{options.min}} ng-maxlength={{options.max}} ng-pattern=nifniecifValidator ng-model=value ng-blur=onBlur() ng-focus=onFocus() ng-change=onChange()></div><div class="help-block has-error" ng-show=$invalid style=position:absolute;top:50px><small class=error ng-show=$invalidRequired>Campo obligatorio. Introduzca un {{options.textbutton|| \'N\xfamero de documento\'}}</small> <small class=error ng-show=$invalidMinlength>Debe tener al menos {{options.min}} caracteres</small> <small class=error ng-show=$invalidMaxlength>No puede tener m\xe1s de {{options.max}} caracteres</small> <small class=error ng-show=$invalidPattern>Introduzca un {{options.textbutton|| \'N\xfamero de documento\'}} v\xe1lido</small></div></div>');
    $templateCache.put('directives/edu-field-number-tpl.html', '<div class="form-group {{options.col}}" ng-class="{\'has-error\':  $invalid, \'has-success\': !$invalid && $dirty}" style=position:relative><label for={{id}}>{{options.label}} {{options.required ? \'*\' : \'\'}}</label><input class=form-control id={{id}} placeholder={{options.placeholder}} autofocus ng-required={{options.required}} ng-disabled={{options.disabled}} ng-pattern="{{options.pattern?options.pattern:\'/^-?[0-9]+$/\'}}" ng-model=value ng-blur=onBlur() ng-focus=onFocus() ng-change=onChange()><div class="help-block has-error" ng-show=$invalid style=position:absolute;top:50px><small class=error ng-show=$invalidRequired>Campo obligatorio. Introduzca un valor.</small> <small class=error ng-show=$invalidPattern>Introduzca un n\xfamero v\xe1lido.</small></div></div>');
    $templateCache.put('directives/edu-field-password-tpl.html', '<div class="form-group {{options.col}}" ng-class="{\'has-error\':  $invalid, \'has-success\': !$invalid && $dirty}" style=position:relative><label for={{id}}>{{options.label}} {{options.required ? \'*\' : \'\'}}</label><input type=password class=form-control id={{id}} autofocus ng-blur=onBlur() ng-focus=onFocus() ng-change=onChange() autofocus ng-required={{options.required}} ng-disabled={{options.disabled}} ng-pattern={{options.pattern}} ng-model=value><div class="help-block has-error" ng-show=$invalid style=position:absolute;top:50px><small class=error ng-show=$invalidRequired>Campo obligatorio. Introduzca un valor</small> <small class=error ng-show=$invalidMinlength>Debe tener al menos {{options.min}} caracteres</small> <small class=error ng-show=$invalidMaxlength>No puede tener m\xe1s de {{options.max}} caracteres</small> <small class=error ng-show=$invalidPattern>Introduzca un valor v\xe1lido</small></div></div>');
    $templateCache.put('directives/edu-field-radio-tpl.html', '<div class="radio-group {{options.col}}" ng-class="{\'has-error\':  $invalid, \'has-success\': !$invalid && $dirty}" style=position:relative><label class=control-label>{{options.label}} {{options.required ? \'*\' : \'\'}}</label><div class=radio ng-repeat="(key, option) in options.options"><label><input type=radio id="{{id + \'_\'+ $index}}" autofocus ng-value=option.value ng-required={{options.required}} ng-model=$parent.value ng-blur=onBlur() ng-focus=onFocus() ng-change=onChange()> {{option.name}}</label></div><div class="help-block has-error" ng-show=$invalid style=position:absolute;top:50px><small class=error ng-show=$invalidRequired>Campo obligatorio. Introduzca un valor.</small></div></div>');
    $templateCache.put('directives/edu-field-range-tpl.html', '<div class="form-group {{options.col}}"><label for={{id}}>{{options.label}} {{options.required ? \'*\' : \'\'}}</label><input type=range class=form-control id={{id}} autofocus placeholder={{options.placeholder}} ng-required=options.required ng-disabled=options.disabled min={{options.min}} max={{options.max}} ng-model=value></div>');
    $templateCache.put('directives/edu-field-select-remote-tpl.html', '<div class="form-group {{options.col}}"><label for={{id}}>{{options.label}} {{options.required ? \'*\' : \'\'}}</label><div edu-select-remote ng-model=value autofocus ng-required={{options.required}} ng-disabled={{options.disabled}} uri-data={{options.uridata}} field-value={{options.fieldvalue}} field-name={{options.fieldname}}></div></div>');
    $templateCache.put('directives/edu-field-select-tpl.html', '<div class="form-group {{options.col}}" ng-class="{\'has-error\':  $invalid, \'has-success\': !$invalid && $dirty}" style=position:relative><label for={{id}}>{{options.label}} {{options.required ? \'*\' : \'\'}}</label><select class=form-control id={{id}} autofocus dependent-control={{options.dependentControl}} ng-blur=onBlur() ng-focus=onFocus() ng-change=onChange() ng-model=value ng-required=options.required ng-disabled=options.disabled ng-init="value = options.options[options.default]" ng-options="option.value as option.name for option in optionsSelect"></select><div class="help-block has-error" ng-show=$invalid style=position:absolute;top:50px><small class=error ng-show=$invalidRequired>Campo obligatorio. Introduzca un valor</small> <small class=error ng-show=$invalidMinlength>Debe tener al menos {{options.min}} caracteres</small> <small class=error ng-show=$invalidMaxlength>No puede tener m\xe1s de {{options.max}} caracteres</small> <small class=error ng-show=$invalidPattern>Introduzca un valor v\xe1lido</small></div></div>');
    $templateCache.put('directives/edu-field-text-tpl.html', '<div class="form-group {{options.col}}" ng-class="{\'has-error\':  $invalid, \'has-success\': !$invalid && $dirty}" style=position:relative><label for={{id}}>{{options.label}} {{options.required ? \'*\' : \'\'}}</label><input class=form-control id={{id}} name={{name}} placeholder={{options.placeholder}} autofocus ng-required={{options.required}} ng-disabled={{options.disabled}} ng-pattern={{options.pattern}} ng-minlength={{options.min}} ng-maxlength={{options.max}} ng-model=value ng-blur=onBlur() ng-focus=onFocus() ng-change=onChange()><div class="help-block has-error" ng-show=$invalid style=position:absolute;top:50px><small class=error ng-show=$invalidRequired>Campo obligatorio. Introduzca un valor</small> <small class=error ng-show=$invalidMinlength>Debe tener al menos {{options.min}} caracteres</small> <small class=error ng-show=$invalidMaxlength>No puede tener m\xe1s de {{options.max}} caracteres</small> <small class=error ng-show=$invalidPattern>Introduzca un valor v\xe1lido</small></div></div>');
    $templateCache.put('directives/edu-field-textarea-tpl.html', '<div class="form-group {{options.col}}" ng-class="{\'has-error\':  $invalid, \'has-success\': !$invalid && $dirty}" style=position:relative><label for={{id}}>{{options.label}} {{options.required ? \'*\' : \'\'}}</label><textarea type=text class=form-control id={{id}} rows={{options.rows}} placeholder={{options.placeholder}} autofocus ng-required={{options.required}} ng-disabled={{options.disabled}} ng-model=value ng-blur=onBlur() ng-focus=onFocus() ng-change=onChange()>\n' + '\t</textarea><div class="help-block has-error" ng-show=$invalid style=position:absolute;top:50px><small class=error ng-show=$invalidRequired>Campo obligatorio. Introduzca un valor</small> <small class=error ng-show=$invalidMinlength>Debe tener al menos {{options.min}} caracteres</small> <small class=error ng-show=$invalidMaxlength>No puede tener m\xe1s de {{options.max}} caracteres</small> <small class=error ng-show=$invalidPattern>Introduzca un valor v\xe1lido</small></div></div>');
    $templateCache.put('directives/edu-field-textbutton-tpl.html', '<div class="form-group {{options.col}}" ng-class="{\'has-error\':  $invalid, \'has-success\': !$invalid && $dirty}" style=position:relative><label for={{id}}>{{options.label}} {{options.required ? \'*\' : \'\'}}</label><div class=input-group><span class=input-group-btn><a ng-click=onClick() class="btn btn-{{options.typebutton||\'default\'}}"><i class="fa fa-{{options.icon}}"></i> {{options.textbutton}}</a></span> <input class=form-control id={{id}} name={{name}} placeholder={{options.placeholder}} autofocus ng-required={{options.required}} ng-disabled={{options.disabled}} ng-pattern={{options.pattern}} ng-minlength={{options.min}} ng-maxlength={{options.max}} ng-model=value ng-blur=onBlur() ng-focus=onFocus() ng-change=onChange()></div><div class="help-block has-error" ng-show=$invalid style=position:absolute;top:50px><small class=error ng-show=$invalidRequired>Campo obligatorio. Introduzca un valor</small> <small class=error ng-show=$invalidMinlength>Debe tener al menos {{options.min}} caracteres</small> <small class=error ng-show=$invalidMaxlength>No puede tener m\xe1s de {{options.max}} caracteres</small> <small class=error ng-show=$invalidPattern>Introduzca un valor v\xe1lido</small></div></div>');
    $templateCache.put('directives/edu-field-textedit-tpl.html', '<div class="form-group {{options.col}}" ng-class="{\'has-error\':  $invalid, \'has-success\': !$invalid && $dirty}" style=position:relative><label for={{id}}>{{options.label}} {{options.required ? \'*\' : \'\'}}</label><div text-angular id={{id}} name={{name}} ta-toolbar="options.toolbar || [[\'h1\',\'h2\',\'h3\'],[\'bold\',\'italics\']] " ng-model=value ng-required={{options.required}} autofocus ng-blur=onBlur() ng-focus=onFocus() ng-change=onChange()></div><div class="help-block has-error" ng-show=$invalid style=position:absolute;top:50px><small class=error ng-show=$invalidRequired>Campo obligatorio. Introduzca un valor</small></div></div>');
    $templateCache.put('directives/edu-field-time-tpl.html', '<div class="form-group {{options.col}}" ng-class="{\'has-error\':  $invalid, \'has-success\': !$invalid && $dirty}" style=position:relative><label for={{id}}>{{options.label}} {{options.required ? \'*\' : \'\'}}</label><input type=time class=form-control id={{id}} name={{name}} placeholder={{options.placeholder}} autofocus ng-required={{options.required}} ng-disabled={{options.disabled}} ng-pattern="/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/" ng-model=value ng-blur=onBlur() ng-focus=onFocus() ng-change=onChange()><div class="help-block has-error" ng-show=$invalid style=position:absolute;top:50px><small class=error ng-show=$invalidRequired>Campo obligatorio. Introduzca una hora</small> <small class=error ng-show=$invalidPattern>Introduzca una hora v\xe1lida</small></div></div>');
    $templateCache.put('directives/edu-field-upload-tpl.html', '<div class="form-group {{options.col}}" ng-class="{\'has-error\':  $invalid, \'has-success\': !$invalid && $dirty}" style=position:relative><label for={{id}}>{{options.label}} {{options.required ? \'*\' : \'\'}}</label><div class={{options.col}}><input ng-if=options.multiple nv-file-select="" uploader=uploader type=file multiple> <input ng-if=!options.multiple nv-file-select="" uploader=uploader type="file"></div><div class={{options.col}} style="margin-bottom: 40px"><p>Archivos en cola: <strong ng-repeat="item in uploader.queue">{{ item.file.name }}</strong></p><table class=table><thead><tr ng-show=options.showbuttons><th width=50%>Nombre</th><th ng-show=uploader.isHTML5>Tama\xf1o</th><th>Estado</th><th>Acciones</th></tr></thead><tbody><tr ng-repeat="item in uploader.queue" ng-show=options.showbuttons><td><strong>{{ item.file.name }}</strong></td><td ng-show=uploader.isHTML5 nowrap>{{ item.file.size/1024/1024|number:2 }} MB</td><td class=text-center><span ng-show=item.isSuccess><i class="glyphicon glyphicon-ok"></i></span> <span ng-show=item.isCancel><i class="glyphicon glyphicon-ban-circle"></i></span> <span ng-show=item.isError><i class="glyphicon glyphicon-remove"></i></span></td><td nowrap><button type=button class="btn btn-success btn-xs" ng-click=item.upload() ng-disabled="item.isReady || item.isUploading || item.isSuccess"><span class="glyphicon glyphicon-upload"></span> Subir</button> <button type=button class="btn btn-warning btn-xs" ng-click=item.cancel() ng-disabled=!item.isUploading><span class="glyphicon glyphicon-ban-circle"></span> Cancelar</button> <button type=button class="btn btn-danger btn-xs" ng-click=item.remove()><span class="glyphicon glyphicon-trash"></span> Eliminar</button></td></tr></tbody></table><table ng-show=options.showprogressbar style=width:100%><tr><td>Progreso:</td></tr><tr><td><div class=progress><div class=progress-bar role=progressbar ng-style="{ \'width\': uploader.progress + \'%\' }"></div></div></td></tr></table></div><div class="help-block has-error" ng-show=$invalid style=position:absolute;top:50px><small class=error ng-show=$invalidRequired>Campo obligatorio. Introduzca un valor</small></div></div>');
    $templateCache.put('directives/edu-field-url-tpl.html', '<div class="form-group {{options.col}}" ng-class="{\'has-error\':  $invalid, \'has-success\': !$invalid && $dirty}" style=position:relative><label for={{id}}>{{options.label}} {{options.required ? \'*\' : \'\'}}</label><input class=form-control id={{id}} name=name placeholder={{options.placeholder}} ng-blur=onBlur() ng-focus=onFocus() ng-change=onChange() autofocus ng-required={{options.required}} ng-disabled={{options.disabled}} ng-pattern="/^(https?:\\/\\/)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\\/\\w \\.-]*)*\\/?$/" ng-minlength={{options.min}} ng-maxlength={{options.max}} ng-model=value><div class="help-block has-error" ng-show=$invalid style=position:absolute;top:50px><small class=error ng-show=$invalidRequired>Campo obligatorio. Introduzca una url</small> <small class=error ng-show=$invalidMinlength>Debe tener al menos {{options.min}} caracteres</small> <small class=error ng-show=$invalidMaxlength>No puede tener m\xe1s de {{options.max}} caracteres</small> <small class=error ng-show=$invalidPattern>Introduzca una url v\xe1lida</small></div></div>');
    $templateCache.put('directives/edu-field-week-tpl.html', '<div class="form-group {{options.col}}" ng-class="{\'has-error\':  $invalid, \'has-success\': !$invalid && $dirty}" style=position:relative><label for={{id}}>{{options.label}} {{options.required ? \'*\' : \'\'}}</label><input type=week class=form-control id={{id}} name={{name}} placeholder={{options.placeholder}} autofocus ng-required={{options.required}} ng-disabled={{options.disabled}} ng-pattern="/^(19|20)\\d\\d[-\\/]W(0[1-9]|[1-4][0-9]|5[0123])$/" ng-model=value ng-blur=onBlur() ng-focus=onFocus() ng-change=onChange()><div class="help-block has-error" ng-show=$invalid style=position:absolute;top:50px><small class=error ng-show=$invalidRequired>Campo obligatorio. Introduzca una semana</small> <small class=error ng-show=$invalidPattern>Introduzca una semana v\xe1lida</small></div></div>');
  }
]);
//funciones de validacion
var modo_validacion_general;
function esBarra(cad, pos) {
  var letra = cad.substr(pos, 1);
  if (letra == '/')
    return true;
  else
    return false;
}
function esDosPuntos(cad, pos) {
  var letra = cad.substr(pos, 1);
  if (letra == ':')
    return true;
  else
    return false;
}
//convierte una letra en numero si puede dentro de una cadena en una posicion dada
function valorLetra(cadena, pos) {
  return parseInt(cadena.substr(pos, 1));
}
//toma una letra dentro de una cadena 
function cogeLetra(cadena, pos) {
  return cadena.substr(pos, 1);
}
//comprueba si una letra dentro de una cadena es un numero o no
function esNumero(cadena, pos) {
  var letra = cogeLetra(cadena, pos);
  if (letra >= '0' && letra <= '9')
    return true;
  else
    return false;
}
//indica cuantos digitos hay a partir de una posicion dada, modifica la posicion
function cuantosNumeros(cad, pos) {
  var res = 0;
  var len = cad.length;
  var letra;
  letra = cad.substr(pos, 1);
  while (pos < len && letra >= '0' && letra <= '9') {
    res = res + 1;
    pos = pos + 1;
    if (pos < len)
      letra = cad.substr(pos, 1);
  }
  return res;
}
//devuelve una cadena de error si hay error
//jgr59k 16/01/2007 13:37 h. Funci�n que comprueba si una direcci�n de correo est� bien construida, por ejemplo, xxx@yyyy.zz
function compruebaEmail(campo, valor) {
  /*DGILG  5/06/2009 
	if ( valor.indexOf('@', 0)==-1 || valor.indexOf('.',0)==-1 ) {		
		return "el campo "+campo+" = "+valor+" no es un email correcto\n";	
	}		
		return "";
	*/
  //function checkMail(campo,valor) {
  if (valor.length == 0) {
    return '';
  }
  var emailPat = /^(.+)@(.+)$/;
  var specialChars = '\\(\\)<>@,;:\\\\\\"\\.\\[\\]';
  var validChars = '[^\\s' + specialChars + ']';
  var quotedUser = '("[^"]*")';
  var ipDomainPat = /^(\d{1,3})[.](\d{1,3})[.](\d{1,3})[.](\d{1,3})$/;
  var atom = validChars + '+';
  var word = '(' + atom + '|' + quotedUser + ')';
  var userPat = new RegExp('^' + word + '(\\.' + word + ')*$');
  var domainPat = new RegExp('^' + atom + '(\\.' + atom + ')*$');
  var matchArray = valor.match(emailPat);
  if (matchArray == null) {
    //return false;
    return 'el campo ' + campo + ' = ' + valor + ' no es un email correcto\n';
  }
  var user = matchArray[1];
  var domain = matchArray[2];
  if (user.match(userPat) == null) {
    return 'el campo ' + campo + ' = ' + valor + ' no es un email correcto\n';  //return false;
  }
  var IPArray = domain.match(ipDomainPat);
  if (IPArray != null) {
    for (var i = 1; i <= 4; i++) {
      if (IPArray[i] > 255) {
        return 'el campo ' + campo + ' = ' + valor + ' no es un email correcto\n';  //return false;
      }
    }
    return '';  //return true;
  }
  var domainArray = domain.match(domainPat);
  if (domainArray == null) {
    return 'el campo ' + campo + ' = ' + valor + ' no es un email correcto\n';  //return false;
  }
  var atomPat = new RegExp(atom, 'g');
  var domArr = domain.match(atomPat);
  var len = domArr.length;
  if (domArr[domArr.length - 1].length < 2 || domArr[domArr.length - 1].length > 3) {
    return 'el campo ' + campo + ' = ' + valor + ' no es un email correcto\n';  //return false;
  }
  if (len < 2) {
    return 'el campo ' + campo + ' = ' + valor + ' no es un email correcto\n';  //return false;
  }
  //return true;
  return '';  //}
}
//ayuda para calcular los dias que tiene el mes de febrero
function esBisiesto(anio) {
  var BISIESTO;
  if (anio % 4 == 0) {
    if (anio % 100 == 0) {
      if (anio % 400 == 0)
        BISIESTO = true;
      else
        BISIESTO = false;
    } else
      BISIESTO = true;
  } else
    BISIESTO = false;
  return BISIESTO;
}
//devuelve una cadena de error si hay error
//opcionalmente se puede pasar el formato del numero como tercer parametro
//el formato es: F, F2,F4 (2/4, 2 y 4 digitos para el a�o, respectivamente)
function compruebaFecha(campo, valor) {
  var error;
  var iDia, iMes, iAno;
  var dia, mes, ano;
  var maxdia = new Array(-1, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
  //codigo para calcular el numero de digitos del a�o y el mensaje de error
  var formato = 'F';
  if (compruebaFecha.arguments.length > 2)
    formato = compruebaFecha.arguments[2];
  var digitosAno;
  var auxErr;
  if (formato == 'F') {
    digitosAno = 4;
    //ojo OBLIGATORIAMENTE debe ser 4 para que luego compruebe los de 2
    auxErr = '2 o 4';
  } else if (formato == 'F2') {
    digitosAno = 2;
    auxErr = '2';
  } else if (formato == 'F4') {
    digitosAno = 4;
    auxErr = '4';
  }
  error = '';
  iDia = cuantosNumeros(valor, 0);
  if (iDia == 1 || iDia == 2) {
    if (esBarra(valor, iDia)) {
      iMes = cuantosNumeros(valor, iDia + 1);
      if (iMes == 1 || iMes == 2) {
        if (esBarra(valor, iDia + 1 + iMes)) {
          iAno = cuantosNumeros(valor, iDia + 1 + iMes + 1);
          //agm88x 20-6-2006: a�adido para formatos de 2/4 y 4 digitos he complicado la formula
          if (iAno == digitosAno || formato == 'F' && iAno == 2) {
            if (iDia + 1 + iMes + 1 + iAno == valor.length) {
              dia = parseInt(valor.substr(0, iDia), 10);
              mes = parseInt(valor.substr(iDia + 1, iMes), 10);
              ano = parseInt(valor.substr(iDia + 1 + iMes + 1, iAno), 10);
              //arreglo para los meses bisiestos
              if (esBisiesto(ano))
                maxdia[2] = 29;
              else
                maxdia[2] = 28;
              if (dia >= 1 && mes >= 1 && mes <= 12 && dia <= maxdia[mes] && ano >= 0)
                error = '';
              else
                error = 'rango de dias/mes/a\ufffdo invalido';
            } else
              error = 'la longitud de la fecha es incorrecta';
          } else
            error = 'el a\ufffdo es de ' + auxErr + ' d\ufffdgitos';
        } else
          error = 'no se ha encontrado la barra separadora del a\ufffdo';
      } else
        error = 'el mes es de 1 o 2 d\ufffdgitos';
    } else
      error = 'no se ha encontrado la barra separadora del mes';
  } else
    error = 'el dia es de 1 o 2 d\ufffdgitos';
  if (error != '')
    error = 'Campo ' + campo + ' = ' + valor + ', ' + error + '\n';
  else {
  }
  return error;
}
//devuelve una cadena de error si hay error
function compruebaHora(campo, valor) {
  var error;
  var iHora, iMinutos;
  var hora, minutos;
  error = '';
  iHora = cuantosNumeros(valor, 0);
  if (iHora == 1 || iHora == 2) {
    if (esDosPuntos(valor, iHora)) {
      iMinutos = cuantosNumeros(valor, iHora + 1);
      if (iMinutos == 2) {
        if (iHora + 1 + iMinutos == valor.length) {
          hora = parseInt(valor.substr(0, iHora), 10);
          minutos = parseInt(valor.substr(iHora + 1, valor.length), 10);
          if (hora >= 0 && hora <= 23 && minutos >= 0 && minutos <= 59)
            error = '';
          else
            error = 'rango de hora:minutos invalido';
        } else
          error = 'la longitud de la hora introducida es incorrecta';
      } else
        error = 'Los minutos son de 2 d\ufffdgitos';
    } else
      error = 'No se ha encontrado los dos puntos que separan la hora de los minutos';
  } else
    error = 'La hora es de 1 o 2 d\ufffdgitos';
  if (error != '')
    error = 'Campo ' + campo + ' = ' + valor + ', ' + error + '\n';
  return error;
}
//devuelve una cadena de error si hay error
function compruebaMoneda(campo, valor) {
  //obligo a que los numeros introducidos tengan el formato: +/-#.###.###,##
  var error = '';
  var reg = /^-?\d{1,3}(\.?\d{3})*(\,\d{1,2})?$/;
  if (!reg.test(valor))
    error = 'el campo ' + campo + ' = ' + valor + ' no tiene formato moneda\n';
  return error;  /*	var iDigitos = 0;
	var pos = 0;
	var letra = "";
	var max = valor.length;
	var primeraLetra = cogeLetra(valor,pos);
	var posComa = 0;
	var i = 0;

	//si la primera letra es + o - avanzo la posicion
	if ((primeraLetra=="+") || (primeraLetra=="-"))	pos++;

	//busco si hay una , (de momento debe ser obligatoria)
	posComa = valor.indexOf(",");
	if (posComa!=-1){
		//ahora recorro la cadena desde posComa hasta pos y voy contando los # al 3 espero un .
		iDigitos = 0;
		i = posComa-1;	//salto la ,
		//cuento los decimales a partir de la coma. deben ser unicamente 2
		if (cuantosNumeros(valor,posComa+1)!=2) error = "el campo "+campo+ " = "+valor+" no es un numero. Debe haber dos decimales\n";
		while ((i>=pos) && (error=="")){
			letra = cogeLetra(valor,i);
			if (iDigitos<3){
				if ((letra>="0") && (letra<="9")) iDigitos++;
				else error = "el campo "+campo+ " = "+valor+" no es un numero. Esperaba un digito.\n";
			} else {
				if (letra==".") iDigitos=0;
				else error = "el campo "+campo+ " = "+valor+" no es un numero. Esperaba un .\n";
			}
			i--;
		}
	} else error = "el campo "+campo+ " = "+valor+" no es un numero. El formato es +/-#.###.###,##\n";

//	antigua funcion, lastima que no sea lo que ellos quieren
//	if (isNaN(parseFloat(valor))) error = "el campo "+campo+ " = "+valor+" no es un numero\n";
	return error;*/
}
//devuelve una cadena de error si hay error
//opcionalmente se puede pasar el formato del numero como tercer parametro
//el formato es: N, N(numeroDigitos), N(numeroDigitos,numeroDecimales)
function compruebaNumero(campo, valor) {
  var error = '';
  var formato = '';
  var numDigitos = -9999;
  var numDecimales = -9999;
  var reg = /^-?\d{1,3}(\.?\d{3})*(\,\d+)?$/;
  /*	if (compruebaNumero.arguments.length>2){
		formato = compruebaNumero.arguments[2];
		var re = /\(|\)|,/;
		var arr = formato.split(re);
		var i = 0;
		var txt = "";
		for(i=0;i<arr.length;i++){
			
			txt = txt + i + " = "+arr[i]+"\n";
		}
		alert(txt);
		//	var reg = /^\d{1,3}(\.+\d{3})*(\,\d{2})+$/;
	} else ;
*/
  if (!reg.test(valor))
    error = 'el campo ' + campo + ' = ' + valor + ' no es un numero valido\n';
  return error;
}
//devuelve una cadena de error si hay error
//opcionalmente se puede pasar el formato del numero como tercer parametro
//el formato es: I, Ix donde x es el n�mero de d�gitos m�ximo permitido
function compruebaEntero(campo, valor, numDigitos) {
  var error = '';
  if (numDigitos != '') {
    var reg = new RegExp('^-?\\d{1,' + numDigitos + '}$');
  } else {
    var reg = /^-?\d+$/;
  }
  if (!reg.test(valor)) {
    if (numDigitos != '') {
      error = 'el campo ' + campo + ' = ' + valor + ' no es un entero v\ufffdlido o supera la longitud m\ufffdxima de ' + numDigitos + ' digitos\n';
    } else {
      error = 'el campo ' + campo + ' = ' + valor + ' no es un entero v\ufffdlido\n';
    }
  }
  return error;
}
//devuelve una cadena de error si el valor no es un codigo CCC correcto
function compruebaCCC(campo, valor) {
  var c1;
  var c2;
  var c3;
  var c4;
  var m1, m2, d1, d2, digito1, digito2;
  var error = '';
  var ccc = valor;
  //comprobacion de 20 digitos
  if (ccc.length != 20) {
    error = 'el campo ' + campo + ' no tiene 20 digitos:' + valor + '\n';
    return error;
  }
  c1 = ccc.substr(0, 4);
  c2 = ccc.substr(4, 4);
  c3 = ccc.substr(8, 2);
  c4 = ccc.substr(10, 10);
  //	alert("c1="+c1+" c2="+c2+" c3="+c3+" c4="+c4);
  m1 = 4 * c1.substr(0, 1) + 8 * c1.substr(1, 1) + 5 * c1.substr(2, 1) + 10 * c1.substr(3, 1) + 9 * c2.substr(0, 1) + 7 * c2.substr(1, 1) + 3 * c2.substr(2, 1) + 6 * c2.substr(3, 1);
  m2 = 1 * c4.substr(0, 1) + 2 * c4.substr(1, 1) + 4 * c4.substr(2, 1) + 8 * c4.substr(3, 1) + 5 * c4.substr(4, 1) + 10 * c4.substr(5, 1) + 9 * c4.substr(6, 1) + 7 * c4.substr(7, 1) + 3 * c4.substr(8, 1) + 6 * c4.substr(9, 1);
  //	alert("m1="+m1+" m2="+m2);
  d1 = 11 - m1 % 11;
  d2 = 11 - m2 % 11;
  if (d1 == 10)
    d1 = 1;
  if (d1 == 11)
    d1 = 0;
  if (d2 == 10)
    d2 = 1;
  if (d2 == 11)
    d2 = 0;
  //	alert("d1="+d1+" d2="+d2);
  if (d1 != c3.substr(0, 1)) {
    error = 'el campo ' + campo + ' tiene el primer digito de control del CCC inv\ufffdlido\n';
    return error;
  }
  if (d2 != c3.substr(1, 1)) {
    error = 'el campo ' + campo + ' tiene el segundo digito de control del CCC inv\ufffdlido\n';
    return error;
  }
  return error;
}
//comprueba si es un NIF bien formado
//modificado el 6-10-2008 para la nueva normativa
function esNIF(campo, cadena) {
  var valor;
  var indice;
  var tabla;
  var cadena2;
  var letra;
  var esperado, actual;
  var error = '';
  var primeraLetra = cogeLetra(cadena, 0);
  //para el caso de NIEs que empiecen por X,Y o Z es lo mismo que un NIF que empieza por 0,1 o 2 respectivamente
  if (primeraLetra == 'X')
    cadena = '0' + cadena.substr(1);
  if (primeraLetra == 'Y')
    cadena = '1' + cadena.substr(1);
  if (primeraLetra == 'Z')
    cadena = '2' + cadena.substr(1);
  tabla = 'TRWAGMYFPDXBNJZSQVHLCKET';
  //TRWAGMYFPDXBNJZSQVHLCKET
  cadena2 = cadena.substr(0, 8);
  letra = cogeLetra(cadena2, 0);
  while (letra == '0') {
    cadena2 = cadena2.substr(1);
    letra = cogeLetra(cadena2, 0);
  }
  valor = parseInt(cadena2);
  indice = valor % 23;
  esperado = cogeLetra(tabla, indice);
  actual = cogeLetra(cadena, 8);
  //alert('cadena:'+cadena+' cadena(0,8):'+cadena.substr(0,8)+' valor:'+valor+' indice:'+indice+' esperado:'+esperado+' actual:'+actual);
  if (esperado != actual)
    error = 'Campo ' + campo + ' = ' + valor + ' el NIF es incorrecto, deberia acabar en ' + esperado + '\n';
  return error;
}
//comprueba si es un CIF bien formado
//modificado el 6-10-2008 para la nueva normativa
function esCIF(campo, cadena) {
  var primeraLetra;
  var ultimaLetra;
  var suma;
  var suma2;
  var act;
  var i;
  var tabla;
  var error = '';
  //compruebo que la primera letra sea del tipo aceptado
  primeraLetra = cogeLetra(cadena, 0);
  ultimaLetra = cogeLetra(cadena, 8);
  tabla = 'ABCDEFGHJKLMNPQRSUVWXYZ';
  tablaEspecial = 'CKLMNPQRSW';
  if (tabla.indexOf(primeraLetra) == -1)
    error = 'la primera letra no es valida';
  else if (primeraLetra == 'X' || primeraLetra == 'Y' || primeraLetra == 'Z') {
    //para el caso de CIF que empiecen por X,Y o Z es lo mismo que un NIF que empieza por 0,1 o 2 Respectivamente
    error = error + esNIF(campo, cadena);
  } else {
    //para el resto de casos...realizo la suma de pares e impares y todo eso.
    suma = valorLetra(cadena, 2) + valorLetra(cadena, 4) + valorLetra(cadena, 6);
    for (i = 0; i < 4; i++) {
      act = valorLetra(cadena, 2 * i + 1) * 2;
      if (act >= 10)
        act = act - 9;
      //-10 +1
      suma = suma + act;
    }
    suma = 10 - suma % 10;
    /*
		suma = valorLetra(cadena,2)+valorLetra(cadena,4)+valorLetra(cadena,6);
		suma2 = 0;
		for(i=0;i<4;i++){
			act = valorLetra(cadena,2*i+1)*2;
			suma2 = suma2 + act;
			if (suma2>=10) suma2 = suma2 - 9;				//-10 +1
		}
		if (suma2>=10) suma2 = suma2 - 9;				//-10 +1
		suma = suma + suma2;
		suma = 10 - (suma % 10);
*/
    //comprobacion del digito de control para varios casos
    if (tablaEspecial.indexOf(primeraLetra) != -1) {
      //caso de organismos autonomos
      if (ultimaLetra != String.fromCharCode(64 + suma))
        error = error + 'CIF incorrecto, deberia acabar en ' + String.fromCharCode(64 + suma);
    } else {
      //el resto de casos
      suma = suma % 10;
      //alert(ultimaLetra+" "+suma);
      if (ultimaLetra != suma.toString())
        error = error + 'CIF incorrecto, deberia acabar en ' + suma;
    }
  }
  if (error != '')
    error = 'Campo ' + campo + ' = ' + cadena + ', ' + error + '\n';
  return error;
}
//devuelve una cadena de error
function compruebaCIFNIF(campo, valor) {
  var error = '';
  //pasar a mayusculas y quitar los caracteres raros
  valor = valor.toUpperCase();
  //efren incorporando la validaci�n de pasaportes
  //si las tres primeras letras son PAS no comprueba y admite meter un texto plano sin comprobaci�n
  if (valor.substring(0, 3) == 'PAS') {
    return error;
  }
  //veo los casos mas basicos y desdoblo la funcion
  if (valor.length == 9) {
    if (esNumero(valor, 0) || cogeLetra(valor, 0) == 'X')
      error = error + esNIF(campo, valor);
    else
      error = error + esCIF(campo, valor);
  } else
    error = 'El campo ' + campo + ' = ' + valor + ' debe contener 9 d\ufffdgitos\n';
  return error;
}
//devuelve una cadena de error
function compruebaCIF(campo, valor) {
  var error = '';
  //pasar a mayusculas y quitar los caracteres raros
  valor = valor.toUpperCase();
  //veo los casos mas basicos y desdoblo la funcion
  if (valor.length == 9)
    error = error + esCIF(campo, valor);
  else
    error = 'El campo ' + campo + ' = ' + valor + ' debe contener 9 d\ufffdgitos\n';
  return error;
}
//devuelve una cadena de error
function compruebaNIF(campo, valor) {
  var error = '';
  //pasar a mayusculas y quitar los caracteres raros
  valor = valor.toUpperCase();
  //veo los casos mas basicos y desdoblo la funcion
  if (valor.length == 9)
    error = error + esNIF(campo, valor);
  else
    error = 'El campo ' + campo + ' = ' + valor + ' debe contener 9 d\ufffdgitos\n';
  return error;
}
//comprueba si una cadena de texto es un numero de la seguridad social valido
//comprueba si una cadena de texto es un numero de la seguridad social valido
function compruebaSS(campo, valor) {
  var error = '';
  var limpio = '';
  var ch = '';
  var i, aa, bb, cc, num1, num2, num3, num4, modulo, intermedio, lenbb;
  //El numero de la seguridad social debe entrarse con este formato:
  //28/1234567/40
  //o bien:
  //28/12345678/40
  //En funci�n de que se trate del numero de una empresa
  //o del numero de un trabajador.
  limpio = '';
  for (i = 0; i < valor.length; i++) {
    ch = valor.charAt(i);
    if (ch >= '0' && ch <= '9')
      limpio = limpio + ch;
  }
  //Si no tiene 11 � 12 digitos, no es v�lido
  var len = limpio.length;
  if (len == 11 || len == 12) {
    //1=aa
    //2=bb
    //3=cc
    aa = limpio.substring(0, 2);
    bb = limpio.substring(2, len - 2);
    cc = limpio.substring(len - 2, len);
    intermedio = '000000000000' + bb.toString();
    lenbb = bb.toString().length;
    num1 = aa + intermedio.substr(intermedio.length - 8);
    //Cdbl(Cstr(Cdbl(aa))+Format(Cstr(Cdbl(bb)),"00000000"))
    num2 = aa + intermedio.substr(intermedio.length - 7);
    //Cdbl(Cstr(Cdbl(aa))+Format(Cstr(Cdbl(bb)),"0000000"))
    num3 = aa + intermedio.substr(intermedio.length - 6);
    //Cdbl(Cstr(Cdbl(aa))+Format(Cstr(Cdbl(bb)),"000000"))
    num4 = aa + intermedio.substr(intermedio.length - 5);
    //Cdbl(Cstr(Cdbl(aa))+Format(Cstr(Cdbl(bb)),"00000"))
    if (intermedio.length - 8 < lenbb)
      num1 = cc + 1;
    if (intermedio.length - 7 < lenbb)
      num2 = cc + 1;
    if (intermedio.length - 6 < lenbb)
      num3 = cc + 1;
    if (intermedio.length - 5 < lenbb)
      num4 = cc + 1;
    if (num1 % 97 != cc && num2 % 97 != cc && num3 % 97 != cc && num4 % 97 != cc)
      error = 'El campo ' + campo + ' = ' + valor + ' no es un numero de la seguridad social valido';
  } else
    error = 'El campo ' + campo + ' = ' + valor + ' debe contener 11 o 12 digitos';
  return error;
}
//llama a una funcion en la pagina del usuario que trata la validacion
function compruebaValidacion(funcion, opcion, formato) {
  if (modo_validacion_general == 'completo') {
    //deberia comprobar si existe una funcion con ese nombre pero...ahi va eso.
    return eval(funcion + '()');
  } else
    return '';
}
//devuelve una cadena de error
function compruebaMultivaluado(campo, valor, formato) {
  var str = '';
  var j = 0;
  var k = 0;
  //quito los caracteres de la izquierda hasta el siguiente a los :
  while (formato != '' && formato.substr(0, 1) != ':')
    formato = formato.substr(1);
  formato = formato.substr(1);
  var sizeFormato = formato.length;
  var valores = '';
  while (k != -1) {
    k = formato.indexOf('#', j);
    //separador usado para el formato multivaluado
    if (k != -1) {
      str = formato.substr(j, k - j);
      j = k + 1;
    } else if (j < sizeFormato) {
      str = formato.substr(j);
    }
    if (valor == str)
      return '';
    if (valores == '')
      valores = str;
    else
      valores = valores + ', ' + str;
  }
  return 'Campo ' + campo + ' = ' + valor + ', se esperaba: ' + valores + '\n';
}
//comprueba una lista de valores segun su tipo
function compruebaListaCampos(campo, valor, formato) {
  var error = '';
  var str = '';
  var sizeValor = valor.length;
  var j = 0;
  var k = 0;
  var primeraLetraFormato = formato.substr(0, 1);
  var restoFormato = formato.substr(1);
  var indiceSeparadorLista = formato.indexOf('_', 1);
  var etiquetaSeparadorLista = formato.substr(indiceSeparadorLista + 1);
  var separadorLista = String.fromCharCode(13, 10);
  //Retorno de carro y alimentaci�n de l�nea por defecto como separador de listas.
  var formatoSinSeparadorLista = formato.substr(0, indiceSeparadorLista);
  if (etiquetaSeparadorLista != -1) {
    switch (etiquetaSeparadorLista) {
    case 'B':
      //Coma ","
      separadorLista = ',';
      break;
    case 'C':
      //Coma ";"
      separadorLista = ';';
      break;
    case 'D':
      //Coma "|"
      separadorLista = '|';
      break;
    case 'E':
      //Coma "#"
      separadorLista = '#';
      break;
    case 'F':
      //Coma "~"
      separadorLista = '~';
      break;
    case 'A':
      separadorLista = String.fromCharCode(13, 10);
      //Retorno de carro y alimentaci�n de l�nea por defecto como separador de listas.
      break;
    }
  }
  //alert("indiceSeparadorLista = " + indiceSeparadorLista);
  //alert("etiquetaSeparadorLista = " + etiquetaSeparadorLista);
  //alert("separadorLista = " + separadorLista);
  //alert("formatoSinSeparadorLista = " + formatoSinSeparadorLista);
  while (k != -1) {
    k = valor.indexOf(separadorLista, j);
    if (k != -1) {
      str = valor.substr(j, k - j);
      j = k + separadorLista.length;
    } else if (j < sizeValor) {
      str = valor.substr(j);
    }
    if (primeraLetraFormato == '')
      error = error;
    else if (primeraLetraFormato == 'T')
      error = error;
    else if (primeraLetraFormato == 'F')
      error = error + compruebaFecha(campo, str, formatoSinSeparadorLista);
    else if (primeraLetraFormato == 'N')
      error = error + compruebaNumero(campo, str, formatoSinSeparadorLista);
    else if (formatoSinSeparadorLista == 'EMAIL')
      error = error + compruebaEmail(campo, str, formatoSinSeparadorLista);
    else if (primeraLetraFormato == 'E')
      error = error + compruebaMoneda(campo, str);
    else if (formatoSinSeparadorLista == 'SS')
      error = error + compruebaSS(campo, str);
    else if (primeraLetraFormato == 'C') {
      if (restoFormato == 'N')
        error = error + compruebaNIF(campo, str);
      else if (restoFormato == 'C')
        error = error + compruebaCIF(campo, str);
      else
        error = error + compruebaCIFNIF(campo, str);
    } else if (primeraLetraFormato == 'M')
      error = error + compruebaMultivaluado(campo, str, restoFormato);
    else
      error = error + 'Formato inv\ufffdlido: ' + campo + ' = ' + valor + ', formato=' + formato + '\n';
  }
  return error;
}
function compruebaCampo(campo, valor, opcion, formato) {
  var str = '';
  var primeraLetraFormato = formato.substr(0, 1);
  var restoFormato = formato.substr(1);
  //	alert("Comprueba "+campo+" = "+valor+" "+opcion+" "+formato);
  if (valor == '') {
    //si es opcional no comprueba nada
    if (modo_validacion_general == 'completo' && (opcion == 'O' || opcion == 'OL'))
      str = str + 'Campo ' + campo + ': no puede ser vac\ufffdo\n';
  } else {
    //dependiendo del formato llamo a una funcion u otra
    if (primeraLetraFormato == '')
      str = str;
    else if (primeraLetraFormato == 'T')
      str = str;
    else if (primeraLetraFormato == 'F')
      str = str + compruebaFecha(campo, valor, formato);
    else if (primeraLetraFormato == 'N')
      str = str + compruebaNumero(campo, valor, formato);
    else if (formato == 'EMAIL')
      str = str + compruebaEmail(campo, valor);
    else if (primeraLetraFormato == 'E')
      str = str + compruebaMoneda(campo, valor);
    else if (formato == 'CCC')
      str = str + compruebaCCC(campo, valor);
    else if (formato == 'SS')
      str = str + compruebaSS(campo, valor);
    else if (primeraLetraFormato == 'C') {
      if (restoFormato == 'N')
        str = str + compruebaNIF(campo, valor);
      else if (restoFormato == 'C')
        str = str + compruebaCIF(campo, valor);
      else
        str = str + compruebaCIFNIF(campo, valor);
    } else if (primeraLetraFormato == 'M')
      str = str + compruebaMultivaluado(campo, valor, formato);
    else if (primeraLetraFormato == 'L')
      str = str + compruebaListaCampos(campo, valor, restoFormato);
    else if (primeraLetraFormato == 'H')
      str = str + compruebaHora(campo, valor);
    else if (primeraLetraFormato == 'I')
      str = str + compruebaEntero(campo, valor, restoFormato);
    else
      str = str + 'Formato inv\ufffdlido: ' + campo + ' = ' + valor + ', opcion=' + opcion + ' formato=' + formato + '\n';
  }
  return str;
}
//devuelve true si hay error
//los parametros de entrada son tripletas de la forma: campo, opcion, formato
function compruebaCampos() {
  var args = compruebaCampos.arguments.length;
  var i;
  var campo, opcion, formato;
  var str = '';
  var obj;
  var valor;
  var error;
  for (i = 0; i < args; i += 3) {
    campo = compruebaCampos.arguments[i];
    opcion = compruebaCampos.arguments[i + 1];
    formato = compruebaCampos.arguments[i + 2];
    //AGM88X 10-10-2005: funcion especial de validacion. Formato V
    if (formato.substr(0, 1) == 'V') {
      str = str + compruebaValidacion(campo, opcion, formato);
    } else {
      //prosigo con el tratamiento normal de campos
      obj = document.all[campo];
      if (obj) {
        //determino el valor del objeto en sus diversas maneras
        if (obj.length) {
          //AGM88X 28-4-2006: arreglo 'definitivamente' el valor para los select
          if (obj.selectedIndex != null && obj.selectedIndex >= 0)
            valor = obj.options[obj.selectedIndex].text;
          else {
            //el nombre esta repetido creo un string y recooro el array
            valor = '';
            for (j = 0; j < obj.length; j++) {
              //obtengo el valor de cada objeto individual
              var objAct = obj[j];
              var valorAct = '';
              if (objAct.selectedIndex != null && objAct.selectedIndex >= 0)
                valorAct = objAct.options[objAct.selectedIndex].text;
              else
                valorAct = objAct.value;
              //y lo inserto en el valor final separado por /n
              if (valor == '')
                valor = valorAct;
              else
                valor = valor + String.fromCharCode(13, 10) + valorAct;
            }
          }
        } else {
          if (obj.selectedIndex != null && obj.selectedIndex >= 0)
            valor = obj.options[obj.selectedIndex].text;
          else
            valor = obj.value;
        }
        str = str + compruebaCampo(campo, valor, opcion, formato);
      } else
        str = str + 'Falta campo: ' + campo + '\n ' + formato;
    }
  }
  if (str != '') {
    alert('Errores en compruebaCampos:\n' + str);
    return true;
  } else
    return false;
}
//funcion usada cuando se dispone de los tres campos columna: campo, opcion,formato
function compruebaCamposExtendido(campos, opciones, formatos) {
  var error = false;
  var parametros = '';
  //AGM88X 11-10-2005 A�ado el nuevo formato de lista de campos con "~"
  if (typeof campos == 'object' && campos[0]) {
    //caso de la nueva implementacion en arrays
    var lc = campos;
    var lo = opciones;
    var lf = formatos;
    for (var i = 0; i < lc.length; i++) {
      if (parametros != '')
        parametros = parametros + ',';
      parametros = parametros + '\'' + lc[i] + '\',\'' + lo[i] + '\',\'' + lf[i] + '\'';
    }
    error = eval('compruebaCampos(' + parametros + ')');
    return error;
  } else {
    //resto de casos implementados en strings con dos separadores distintos
    if (campos.indexOf('~') > 0) {
      //caso de separador con ~
      var lc = campos.split('~');
      var lo = opciones.split('~');
      var lf = formatos.split('~');
      for (var i = 0; i < lc.length; i++) {
        if (parametros != '')
          parametros = parametros + ',';
        parametros = parametros + '\'' + lc[i] + '\',\'' + lo[i] + '\',\'' + lf[i] + '\'';
      }
      error = eval('compruebaCampos(' + parametros + ')');
      return error;
    } else {
      //sigo con la version antigua: separador con retorno de carro
      var str = '';
      var str2 = '';
      var str3 = '';
      var sizeCampos = campos.length;
      var sizeOpciones = opciones.length;
      var sizeFormatos = formatos.length;
      var j = 0;
      var k = 0;
      var j2 = 0;
      var k2 = 0;
      var j3 = 0;
      var k3 = 0;
      while (k != -1) {
        k = campos.indexOf(String.fromCharCode(13, 10), j);
        k2 = opciones.indexOf(String.fromCharCode(13, 10), j2);
        k3 = formatos.indexOf(String.fromCharCode(13, 10), j3);
        if (k != -1) {
          str = campos.substr(j, k - j);
          j = k + 2;
        } else if (j < sizeCampos) {
          str = campos.substr(j);
        }
        if (k2 != -1) {
          str2 = opciones.substr(j2, k2 - j2);
          j2 = k2 + 2;
        } else if (j2 < sizeOpciones) {
          str2 = opciones.substr(j2);
        }
        if (k3 != -1) {
          str3 = formatos.substr(j3, k3 - j3);
          j3 = k3 + 2;
        } else if (j3 < sizeFormatos) {
          str3 = formatos.substr(j3);
        }
        if (parametros == '')
          parametros = parametros + '\'' + str + '\',\'' + str2 + '\',\'' + str3 + '\'';
        else
          parametros = parametros + ',\'' + str + '\',\'' + str2 + '\',\'' + str3 + '\'';
      }
      error = eval('compruebaCampos(' + parametros + ')');
      return error;
    }
  }
}
function compruebaCamposDocumento() {
  //modo_validacion_general ="completo";
  modo_validacion_general = compruebaCamposDocumento.arguments.length > 0 ? compruebaCamposDocumento.arguments[0] : 'completo';
  var error = false;
  var campos = document.ListaCampos;
  var opciones = document.ListaOpcionCampos;
  var formatos = document.ListaFormatoCampos;
  if (campos && opciones && formatos) {
    error = compruebaCamposExtendido(campos, opciones, formatos);
  }
  //else alert("No existe campo opciones o formato.\nSe guardaran los datos sin chequeo!\nCampos="+campos+"\nopciones="+opciones+"\nFormatos="+formatos);
  return error;
}
function compruebaCamposDocumento2() {
  modo_validacion_general = compruebaCamposDocumento2.arguments.length > 0 ? compruebaCamposDocumento2.arguments[0] : 'completo';
  var error = false;
  var campos = document.ListaCampos;
  var opciones = document.ListaOpcionCampos;
  var formatos = document.ListaFormatoCampos;
  if (campos && opciones && formatos) {
    error = compruebaCamposExtendido(campos, opciones, formatos);
  }
  //else alert("No existe campo opciones o formato.\nSe guardaran los datos sin chequeo!\nCampos="+campos+"\nopciones="+opciones+"\nFormatos="+formatos);
  return error;
}
(function (exports) {
  // Array.prototype.map polyfill
  // code from https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/map
  if (!Array.prototype.map) {
    Array.prototype.map = function (fun) {
      'use strict';
      if (this === void 0 || this === null)
        throw new TypeError();
      var t = Object(this);
      var len = t.length >>> 0;
      if (typeof fun !== 'function')
        throw new TypeError();
      var res = new Array(len);
      var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
      for (var i = 0; i < len; i++) {
        // NOTE: Absolute correctness would demand Object.defineProperty
        //       be used.  But this method is fairly new, and failure is
        //       possible only if Object.prototype or Array.prototype
        //       has a property |i| (very unlikely), so use a less-correct
        //       but more portable alternative.
        if (i in t)
          res[i] = fun.call(thisArg, t[i], i, t);
      }
      return res;
    };
  }
  var A = 'A'.charCodeAt(0), Z = 'Z'.charCodeAt(0);
  /**
     * Prepare an IBAN for mod 97 computation by moving the first 4 chars to the end and transforming the letters to
     * numbers (A = 10, B = 11, ..., Z = 35), as specified in ISO13616.
     *
     * @param {string} iban the IBAN
     * @returns {string} the prepared IBAN
     */
  function iso13616Prepare(iban) {
    iban = iban.toUpperCase();
    iban = iban.substr(4) + iban.substr(0, 4);
    return iban.split('').map(function (n) {
      var code = n.charCodeAt(0);
      if (code >= A && code <= Z) {
        // A = 10, B = 11, ... Z = 35
        return code - A + 10;
      } else {
        return n;
      }
    }).join('');
  }
  /**
     * Calculates the MOD 97 10 of the passed IBAN as specified in ISO7064.
     *
     * @param iban
     * @returns {number}
     */
  function iso7064Mod97_10(iban) {
    var remainder = iban, block;
    while (remainder.length > 2) {
      block = remainder.slice(0, 9);
      remainder = parseInt(block, 10) % 97 + remainder.slice(block.length);
    }
    return parseInt(remainder, 10) % 97;
  }
  /**
     * Parse the BBAN structure used to configure each IBAN Specification and returns a matching regular expression.
     * A structure is composed of blocks of 3 characters (one letter and 2 digits). Each block represents
     * a logical group in the typical representation of the BBAN. For each group, the letter indicates which characters
     * are allowed in this group and the following 2-digits number tells the length of the group.
     *
     * @param {string} structure the structure to parse
     * @returns {RegExp}
     */
  function parseStructure(structure) {
    // split in blocks of 3 chars
    var regex = structure.match(/(.{3})/g).map(function (block) {
        // parse each structure block (1-char + 2-digits)
        var format, pattern = block.slice(0, 1), repeats = parseInt(block.slice(1), 10);
        switch (pattern) {
        case 'A':
          format = '0-9A-Za-z';
          break;
        case 'B':
          format = '0-9A-Z';
          break;
        case 'C':
          format = 'A-Za-z';
          break;
        case 'F':
          format = '0-9';
          break;
        case 'L':
          format = 'a-z';
          break;
        case 'U':
          format = 'A-Z';
          break;
        case 'W':
          format = '0-9a-z';
          break;
        }
        return '([' + format + ']{' + repeats + '})';
      });
    return new RegExp('^' + regex.join('') + '$');
  }
  /**
     * Create a new Specification for a valid IBAN number.
     *
     * @param countryCode the code of the country
     * @param length the length of the IBAN
     * @param structure the structure of the undernying BBAN (for validation and formatting)
     * @param example an example valid IBAN
     * @constructor
     */
  function Specification(countryCode, length, structure, example) {
    this.countryCode = countryCode;
    this.length = length;
    this.structure = structure;
    this.example = example;
  }
  /**
     * Lazy-loaded regex (parse the structure and construct the regular expression the first time we need it for validation)
     */
  Specification.prototype._regex = function () {
    return this._cachedRegex || (this._cachedRegex = parseStructure(this.structure));
  };
  /**
     * Check if the passed iban is valid according to this specification.
     *
     * @param {String} iban the iban to validate
     * @returns {boolean} true if valid, false otherwise
     */
  Specification.prototype.isValid = function (iban) {
    return this.length == iban.length && this.countryCode === iban.slice(0, 2) && this._regex().test(iban.slice(4)) && iso7064Mod97_10(iso13616Prepare(iban)) == 1;
  };
  /**
     * Convert the passed IBAN to a country-specific BBAN.
     *
     * @param iban the IBAN to convert
     * @param separator the separator to use between BBAN blocks
     * @returns {string} the BBAN
     */
  Specification.prototype.toBBAN = function (iban, separator) {
    return this._regex().exec(iban.slice(4)).slice(1).join(separator);
  };
  /**
     * Convert the passed BBAN to an IBAN for this country specification.
     * Please note that <i>"generation of the IBAN shall be the exclusive responsibility of the bank/branch servicing the account"</i>.
     * This method implements the preferred algorithm described in http://en.wikipedia.org/wiki/International_Bank_Account_Number#Generating_IBAN_check_digits
     *
     * @param bban the BBAN to convert to IBAN
     * @returns {string} the IBAN
     */
  Specification.prototype.fromBBAN = function (bban) {
    if (!this.isValidBBAN(bban)) {
      throw new Error('Invalid BBAN');
    }
    var remainder = iso7064Mod97_10(iso13616Prepare(this.countryCode + '00' + bban)), checkDigit = ('0' + (98 - remainder)).slice(-2);
    return this.countryCode + checkDigit + bban;
  };
  /**
     * Check of the passed BBAN is valid.
     * This function only checks the format of the BBAN (length and matching the letetr/number specs) but does not
     * verify the check digit.
     *
     * @param bban the BBAN to validate
     * @returns {boolean} true if the passed bban is a valid BBAN according to this specification, false otherwise
     */
  Specification.prototype.isValidBBAN = function (bban) {
    return this.length - 4 == bban.length && this._regex().test(bban);
  };
  var countries = {};
  function addSpecification(IBAN) {
    countries[IBAN.countryCode] = IBAN;
  }
  addSpecification(new Specification('AD', 24, 'F04F04A12', 'AD1200012030200359100100'));
  addSpecification(new Specification('AE', 23, 'F03F16', 'AE070331234567890123456'));
  addSpecification(new Specification('AL', 28, 'F08A16', 'AL47212110090000000235698741'));
  addSpecification(new Specification('AT', 20, 'F05F11', 'AT611904300234573201'));
  addSpecification(new Specification('AZ', 28, 'U04A20', 'AZ21NABZ00000000137010001944'));
  addSpecification(new Specification('BA', 20, 'F03F03F08F02', 'BA391290079401028494'));
  addSpecification(new Specification('BE', 16, 'F03F07F02', 'BE68539007547034'));
  addSpecification(new Specification('BG', 22, 'U04F04F02A08', 'BG80BNBG96611020345678'));
  addSpecification(new Specification('BH', 22, 'U04A14', 'BH67BMAG00001299123456'));
  addSpecification(new Specification('BR', 29, 'F08F05F10U01A01', 'BR9700360305000010009795493P1'));
  addSpecification(new Specification('CH', 21, 'F05A12', 'CH9300762011623852957'));
  addSpecification(new Specification('CR', 21, 'F03F14', 'CR0515202001026284066'));
  addSpecification(new Specification('CY', 28, 'F03F05A16', 'CY17002001280000001200527600'));
  addSpecification(new Specification('CZ', 24, 'F04F06F10', 'CZ6508000000192000145399'));
  addSpecification(new Specification('DE', 22, 'F08F10', 'DE89370400440532013000'));
  addSpecification(new Specification('DK', 18, 'F04F09F01', 'DK5000400440116243'));
  addSpecification(new Specification('DO', 28, 'U04F20', 'DO28BAGR00000001212453611324'));
  addSpecification(new Specification('EE', 20, 'F02F02F11F01', 'EE382200221020145685'));
  addSpecification(new Specification('ES', 24, 'F04F04F01F01F10', 'ES9121000418450200051332'));
  addSpecification(new Specification('FI', 18, 'F06F07F01', 'FI2112345600000785'));
  addSpecification(new Specification('FO', 18, 'F04F09F01', 'FO6264600001631634'));
  addSpecification(new Specification('FR', 27, 'F05F05A11F02', 'FR1420041010050500013M02606'));
  addSpecification(new Specification('GB', 22, 'U04F06F08', 'GB29NWBK60161331926819'));
  addSpecification(new Specification('GE', 22, 'U02F16', 'GE29NB0000000101904917'));
  addSpecification(new Specification('GI', 23, 'U04A15', 'GI75NWBK000000007099453'));
  addSpecification(new Specification('GL', 18, 'F04F09F01', 'GL8964710001000206'));
  addSpecification(new Specification('GR', 27, 'F03F04A16', 'GR1601101250000000012300695'));
  addSpecification(new Specification('GT', 28, 'A04A20', 'GT82TRAJ01020000001210029690'));
  addSpecification(new Specification('HR', 21, 'F07F10', 'HR1210010051863000160'));
  addSpecification(new Specification('HU', 28, 'F03F04F01F15F01', 'HU42117730161111101800000000'));
  addSpecification(new Specification('IE', 22, 'U04F06F08', 'IE29AIBK93115212345678'));
  addSpecification(new Specification('IL', 23, 'F03F03F13', 'IL620108000000099999999'));
  addSpecification(new Specification('IS', 26, 'F04F02F06F10', 'IS140159260076545510730339'));
  addSpecification(new Specification('IT', 27, 'U01F05F05A12', 'IT60X0542811101000000123456'));
  addSpecification(new Specification('KW', 30, 'U04A22', 'KW81CBKU0000000000001234560101'));
  addSpecification(new Specification('KZ', 20, 'F03A13', 'KZ86125KZT5004100100'));
  addSpecification(new Specification('LB', 28, 'F04A20', 'LB62099900000001001901229114'));
  addSpecification(new Specification('LI', 21, 'F05A12', 'LI21088100002324013AA'));
  addSpecification(new Specification('LT', 20, 'F05F11', 'LT121000011101001000'));
  addSpecification(new Specification('LU', 20, 'F03A13', 'LU280019400644750000'));
  addSpecification(new Specification('LV', 21, 'U04A13', 'LV80BANK0000435195001'));
  addSpecification(new Specification('MC', 27, 'F05F05A11F02', 'MC5811222000010123456789030'));
  addSpecification(new Specification('MD', 24, 'U02F18', 'MD24AG000225100013104168'));
  addSpecification(new Specification('ME', 22, 'F03F13F02', 'ME25505000012345678951'));
  addSpecification(new Specification('MK', 19, 'F03A10F02', 'MK07250120000058984'));
  addSpecification(new Specification('MR', 27, 'F05F05F11F02', 'MR1300020001010000123456753'));
  addSpecification(new Specification('MT', 31, 'U04F05A18', 'MT84MALT011000012345MTLCAST001S'));
  addSpecification(new Specification('MU', 30, 'U04F02F02F12F03U03', 'MU17BOMM0101101030300200000MUR'));
  addSpecification(new Specification('NL', 18, 'U04F10', 'NL91ABNA0417164300'));
  addSpecification(new Specification('NO', 15, 'F04F06F01', 'NO9386011117947'));
  addSpecification(new Specification('PK', 24, 'U04A16', 'PK36SCBL0000001123456702'));
  addSpecification(new Specification('PL', 28, 'F08F16', 'PL61109010140000071219812874'));
  addSpecification(new Specification('PS', 29, 'U04A21', 'PS92PALS000000000400123456702'));
  addSpecification(new Specification('PT', 25, 'F04F04F11F02', 'PT50000201231234567890154'));
  addSpecification(new Specification('RO', 24, 'U04A16', 'RO49AAAA1B31007593840000'));
  addSpecification(new Specification('RS', 22, 'F03F13F02', 'RS35260005601001611379'));
  addSpecification(new Specification('SA', 24, 'F02A18', 'SA0380000000608010167519'));
  addSpecification(new Specification('SE', 24, 'F03F16F01', 'SE4550000000058398257466'));
  addSpecification(new Specification('SI', 19, 'F05F08F02', 'SI56263300012039086'));
  addSpecification(new Specification('SK', 24, 'F04F06F10', 'SK3112000000198742637541'));
  addSpecification(new Specification('SM', 27, 'U01F05F05A12', 'SM86U0322509800000000270100'));
  addSpecification(new Specification('TN', 24, 'F02F03F13F02', 'TN5910006035183598478831'));
  addSpecification(new Specification('TR', 26, 'F05A01A16', 'TR330006100519786457841326'));
  addSpecification(new Specification('VG', 24, 'U04F16', 'VG96VPVG0000012345678901'));
  var NON_ALPHANUM = /[^a-zA-Z0-9]/g, EVERY_FOUR_CHARS = /(.{4})(?!$)/g;
  /**
     * Utility function to check if a variable is a String.
     *
     * @param v
     * @returns {boolean} true if the passed variable is a String, false otherwise.
     */
  function isString(v) {
    return typeof v == 'string' || v instanceof String;
  }
  /**
     * Check if an IBAN is valid.
     *
     * @param {String} iban the IBAN to validate.
     * @returns {boolean} true if the passed IBAN is valid, false otherwise
     */
  exports.isValid = function (iban) {
    if (!isString(iban)) {
      return false;
    }
    iban = this.electronicFormat(iban);
    var countryStructure = countries[iban.slice(0, 2)];
    return !!countryStructure && countryStructure.isValid(iban);
  };
  /**
     * Convert an IBAN to a BBAN.
     *
     * @param iban
     * @param {String} [separator] the separator to use between the blocks of the BBAN, defaults to ' '
     * @returns {string|*}
     */
  exports.toBBAN = function (iban, separator) {
    if (typeof separator == 'undefined') {
      separator = ' ';
    }
    iban = this.electronicFormat(iban);
    var countryStructure = countries[iban.slice(0, 2)];
    if (!countryStructure) {
      throw new Error('No country with code ' + iban.slice(0, 2));
    }
    return countryStructure.toBBAN(iban, separator);
  };
  /**
     * Convert the passed BBAN to an IBAN for this country specification.
     * Please note that <i>"generation of the IBAN shall be the exclusive responsibility of the bank/branch servicing the account"</i>.
     * This method implements the preferred algorithm described in http://en.wikipedia.org/wiki/International_Bank_Account_Number#Generating_IBAN_check_digits
     *
     * @param countryCode the country of the BBAN
     * @param bban the BBAN to convert to IBAN
     * @returns {string} the IBAN
     */
  exports.fromBBAN = function (countryCode, bban) {
    var countryStructure = countries[countryCode];
    if (!countryStructure) {
      throw new Error('No country with code ' + countryCode);
    }
    return countryStructure.fromBBAN(this.electronicFormat(bban));
  };
  /**
     * Check the validity of the passed BBAN.
     *
     * @param countryCode the country of the BBAN
     * @param bban the BBAN to check the validity of
     */
  exports.isValidBBAN = function (countryCode, bban) {
    if (!isString(bban)) {
      return false;
    }
    var countryStructure = countries[countryCode];
    return countryStructure && countryStructure.isValidBBAN(this.electronicFormat(bban));
  };
  /**
     *
     * @param iban
     * @param separator
     * @returns {string}
     */
  exports.printFormat = function (iban, separator) {
    if (typeof separator == 'undefined') {
      separator = ' ';
    }
    return this.electronicFormat(iban).replace(EVERY_FOUR_CHARS, '$1' + separator);
  };
  /**
     *
     * @param iban
     * @returns {string}
     */
  exports.electronicFormat = function (iban) {
    return iban.replace(NON_ALPHANUM, '').toUpperCase();
  };
  /**
     * An object containing all the known IBAN specifications.
     */
  exports.countries = countries;
}(typeof exports == 'undefined' ? this.IBAN = {} : exports));
//***********************************************************************************************
//*** COMPROBACIÓN CIF
//*** return:
//*** 1 = NIF ok
//*** 2 = CIF ok
//*** 3 = NIE ok
//*** -1 = NIF error
//*** -2 = CIF error
//*** -3 = NIE error
//*** 0 = ??? error
//***********************************************************************************************
function valida_nif_cif_nie(a) {
  var temp = a.toUpperCase();
  var cadenadni = 'TRWAGMYFPDXBNJZSQVHLCKE';
  if (temp !== '') {
    //si no tiene un formato valido devuelve error
    if (!/^[A-Z]{1}[0-9]{7}[A-Z0-9]{1}$/.test(temp) && !/^[T]{1}[A-Z0-9]{8}$/.test(temp) && !/^[0-9]{8}[A-Z]{1}$/.test(temp)) {
      return 0;
    }
    //comprobacion de NIFs estandar
    if (/^[0-9]{8}[A-Z]{1}$/.test(temp)) {
      posicion = a.substring(8, 0) % 23;
      letra = cadenadni.charAt(posicion);
      var letradni = temp.charAt(8);
      if (letra == letradni) {
        return 1;
      } else {
        return -1;
      }
    }
    //algoritmo para comprobacion de codigos tipo CIF
    suma = parseInt(a[2]) + parseInt(a[4]) + parseInt(a[6]);
    for (i = 1; i < 8; i += 2) {
      temp1 = 2 * parseInt(a[i]);
      temp1 += '';
      temp1 = temp1.substring(0, 1);
      temp2 = 2 * parseInt(a[i]);
      temp2 += '';
      temp2 = temp2.substring(1, 2);
      if (temp2 == '') {
        temp2 = '0';
      }
      suma += parseInt(temp1) + parseInt(temp2);
    }
    suma += '';
    n = 10 - parseInt(suma.substring(suma.length - 1, suma.length));
    //comprobacion de NIFs especiales (se calculan como CIFs)
    if (/^[KLM]{1}/.test(temp)) {
      if (a[8] == String.fromCharCode(64 + n)) {
        //console.log("NIF 1");
        return 1;
      } else {
        //console.log("NIF -1");
        return -1;
      }
    }
    //comprobacion de CIFs
    if (/^[ABCDEFGHJNPQRSUVW]{1}/.test(temp)) {
      temp = n + '';
      if (a[8] == String.fromCharCode(64 + n) || a[8] == parseInt(temp.substring(temp.length - 1, temp.length))) {
        return 2;
      } else {
        return -2;
      }
    }
    //comprobacion de NIEs
    //T
    if (/^[T]{1}/.test(temp)) {
      if (a[8] == /^[T]{1}[A-Z0-9]{8}$/.test(temp)) {
        return 3;
      } else {
        return -3;
      }
    }
    //XYZ
    if (/^[XYZ]{1}/.test(temp)) {
      pos = str_replace([
        'X',
        'Y',
        'Z'
      ], [
        '0',
        '1',
        '2'
      ], temp).substring(0, 8) % 23;
      if (a[8] == cadenadni.substring(pos, pos + 1)) {
        return 3;
      } else {
        return -3;
      }
    }
  }
  return 0;
}
//***********************************************************************************************
//*** COMPROBACIÓN NÚMERO SEGURIDAD SOCIAL
//*** return: 
//*** 1 = SS ok
//*** -1 = SS error
//***********************************************************************************************
function ss(f, r, i, o) {
  var valor = $(f).val().toUpperCase();
  //podemos encontrarnos números con 11 o 12 dígitos
  if (valor.length != 12 && valor.length != 11) {
    return 'N\xfamero Seguridad Social no v\xe1lido';
  }
  //sacamos las partes…
  var a = parseInt(valor.substring(0, 2));
  var b = valor.substring(2, valor.length - 2);
  var c = parseInt(valor.substring(valor.length - 2, valor.length));
  // si el numero b (la parte central) empieza por 0 hay que quitar primero los ceros
  var cero = b.substring(0, 1);
  if (cero == '0') {
    for (var i = 0; i < b.length; i++) {
      if (b[0] == 0) {
        b = b.substring(1, b.length);
      } else {
        break;
      }
    }
  }
  var d = 0;
  if (valor.length == 11) {
    if (parseInt(b) < 1000000)
      d = parseInt(b) + parseInt(a) * 1000000;
    else
      d = parseInt(a + '' + b);
  } else if (valor.length == 12) {
    if (parseInt(b) < 10000000)
      d = parseInt(b) + parseInt(a) * 10000000;
    else
      d = parseInt(a + '' + b);
  } else {
    return -1;  //"Número Seguridad Social no válido";
  }
  //alert("d:"+d);
  var dc = d % 97;
  if (c != dc) {
    return -1;  //"Número Seguridad Social no válido";
  } else {
    return 1;
  }
}
function str_replace(search, replace, subject) {
  var f = search, r = replace, s = subject;
  var ra = r instanceof Array, sa = s instanceof Array, f = [].concat(f), r = [].concat(r), i = (s = [].concat(s)).length;
  while (j = 0, i--) {
    if (s[i]) {
      while (s[i] = s[i].split(f[j]).join(ra ? r[j] || '' : r[0]), ++j in f) {
      }
      ;
    }
  }
  ;
  return sa ? s : s[0];
}