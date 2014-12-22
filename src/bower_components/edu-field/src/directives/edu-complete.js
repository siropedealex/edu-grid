

eduFieldDirectives.directive('eduComplete', function ($parse, $http, $sce, $timeout) {
    return {
        restrict: 'EA',
        scope: {
            "id": "@id_",
			"name": "@name",
			"onblur":"&onblur",
			"onfocus":"&onfocus",
			"autofocus":"=autofocus",
			//"onchange":"&onchange",
			"required":"=required",
            "placeholder": "@placeholder",
            "selectedObject": "=selectedobject",
            "url": "@url",
			"urldataloadall":"@urldataloadall",
            "dataField": "@datafield",
            "titleField": "@titlefield",
            "descriptionField": "@descriptionfield",
            "imageField": "@imagefield",
            "imageUri": "@imageuri",
            "inputClass": "@inputclass",
            "userPause": "@pause",
            "localData": "=localdata",
            "searchFields": "@searchfields",
            "minLengthUser": "@minlength",
            "matchClass": "@matchclass"
        },
        template: '<div class="eduComplete-holder"><input id="{{id}}" name="{{name}}" autofocus="{{autofocus}}" ng-blur="onblur()" ng-focus="onfocus()" ng-change="onchange()" ng-required="{{required}}" ng-model="searchStr" type="text" placeholder="{{placeholder}}" class="{{inputClass}}" onmouseup="this.select();" ng-focus="resetHideResults()" ng-blur="hideResults()" /><div id="{{id}}_dropdown" class="eduComplete-dropdown" ng-if="showDropdown"><div class="eduComplete-searching" ng-show="searching">Buscando...</div><div class="eduComplete-searching" ng-show="!searching && (!results || results.length == 0)">No hay resultados</div><div class="eduComplete-row" ng-repeat="result in results" ng-click="selectResult(result)" ng-mouseover="hoverRow()" ng-class="{\'eduComplete-selected-row\': $index == currentIndex}"><div ng-if="imageField" class="eduComplete-image-holder"><img ng-if="result.image && result.image != \'\'" ng-src="{{result.image}}" class="eduComplete-image"/><div ng-if="!result.image && result.image != \'\'" class="eduComplete-image-default"></div></div><div class="eduComplete-title" ng-if="matchClass" ng-bind-html="result.title"></div><div class="eduComplete-title" ng-if="!matchClass">{{ result.title }}</div><div ng-if="result.description && result.description != \'\'" class="eduComplete-description">{{result.description}}</div></div></div></div>',

        link: function($scope, elem, attrs) {
            $scope.lastSearchTerm = null;
            $scope.currentIndex = null;
            $scope.justChanged = false;
            $scope.searchTimer = null;
            $scope.hideTimer = null;
            $scope.searching = false;
            $scope.pause = 500;
            $scope.minLength = 3;
			
			if($scope.urldataloadall && $scope.urldataloadall !=""){
				
				$http.get($scope.urldataloadall, {}).
                            success(function(responseData, status, headers, config) {
                                $scope.localData=responseData;
								console.log("Todos los datos:"+angular.toJson(responseData));
								//$scope.processResults( responseData , str);
                            }).
                            error(function(data, status, headers, config) {
                                console.log("error");
                            });
			
			}
            
            if ($scope.minLengthUser && $scope.minLengthUser != "") {
                $scope.minLength = $scope.minLengthUser;
            }

            if ($scope.userPause) {
                $scope.pause = $scope.userPause;
            }

            isNewSearchNeeded = function(newTerm, oldTerm) {
                return newTerm.length >= $scope.minLength && newTerm != oldTerm
            }

            $scope.processResults = function(responseData, str) {
                if (responseData && responseData.length > 0) {
                    $scope.results = [];

                    var titleFields = [];
                    if ($scope.titleField && $scope.titleField != "") {
                        titleFields = $scope.titleField.split(",");
                    }

                    for (var i = 0; i < responseData.length; i++) {
                        // Get title variables
                        var titleCode = [];

                        for (var t = 0; t < titleFields.length; t++) {
                            titleCode.push(responseData[i][titleFields[t]]);
                        }

                        var description = "";
                        if ($scope.descriptionField) {
                            description = responseData[i][$scope.descriptionField];
                        }
						
                        var data="";
						 if ($scope.dataField) {
                            data = responseData[i][$scope.dataField];
                        }
						
                        var imageUri = "";
                        if ($scope.imageUri) {
                            imageUri = $scope.imageUri;
                        }

                        var image = "";
                        if ($scope.imageField) {
                            image = imageUri + responseData[i][$scope.imageField];
                        }

                        var text = titleCode.join(' ');
                        if ($scope.matchClass) {
                            var re = new RegExp(str, 'i');
                            var strPart = text.match(re)[0];
                            text = $sce.trustAsHtml(text.replace(re, '<span class="'+ $scope.matchClass +'">'+ strPart +'</span>'));
                        }
                        var resultRow = {
                            title: text,
                            description: description,
                            image: image,
							data:data
                            //originalObject: responseData[i]
                        }
                        $scope.results[$scope.results.length] = resultRow;
						
                    }


                } else {
                    $scope.results = [];
                }
            }

            $scope.searchTimerComplete = function(str) {
                // Begin the search

                if (str && str!="" && str.length >= $scope.minLength) {
                    if ($scope.localData) {
                        var searchFields = $scope.searchFields.split(",");

                        var matches = [];

                        for (var i = 0; i < $scope.localData.length; i++) {
                            var match = false;

                            for (var s = 0; s < searchFields.length; s++) {
                                match = match || (typeof $scope.localData[i][searchFields[s]] === 'string' && typeof str === 'string' && $scope.localData[i][searchFields[s]].toLowerCase().indexOf(str.toLowerCase()) >= 0);
                            }

                            if (match) {
                                matches[matches.length] = $scope.localData[i];
                            }
                        }

                        $scope.searching = false;
                        $scope.processResults(matches, str);
						

                    } else {
                        $http.get($scope.url + str+'&field='+$scope.titleField, {}).
                            success(function(responseData, status, headers, config) {
                                $scope.searching = false;
								$scope.processResults( responseData , str);
                            }).
                            error(function(data, status, headers, config) {
                                console.log("error");
                            });
                    }
                }
            }

            $scope.hideResults = function() {
                $scope.hideTimer = $timeout(function() {
                    $scope.showDropdown = false;
                }, $scope.pause);
            };

            $scope.resetHideResults = function() {
                if($scope.hideTimer) {
                    $timeout.cancel($scope.hideTimer);
                };
            };

            $scope.hoverRow = function(index) {
                $scope.currentIndex = index;
            }

            $scope.keyPressed = function(event) {
                if (!(event.which == 38 || event.which == 40 || event.which == 13)) {
                    if (!$scope.searchStr || $scope.searchStr == "") {
                        $scope.showDropdown = false;
                        $scope.lastSearchTerm = null
                    } else if (isNewSearchNeeded($scope.searchStr, $scope.lastSearchTerm)) {
                        $scope.lastSearchTerm = $scope.searchStr
                        $scope.showDropdown = true;
                        $scope.currentIndex = -1;
                        $scope.results = [];

                        if ($scope.searchTimer) {
                            $timeout.cancel($scope.searchTimer);
                        }

                        $scope.searching = true;

                        $scope.searchTimer = $timeout(function() {
                            $scope.searchTimerComplete($scope.searchStr);
                        }, $scope.pause);
                    }
                } else {
                    event.preventDefault();
                }
            }
			
			//cuando hay cambios en el value del control autocomplete
			$scope.$watch('selectedObject', function(value) {  
			  if(typeof value!=='undefined'){//coloca en el input text que ve el usuario el titulo o nombre que corresponde al valor que hay en la propiedad value del control autocomplete
				 var titleField="";
				 var str=$scope.selectedObject;
				 if ($scope.titleField && $scope.titleField != "") {
					 titleFields = $scope.titleField.split(",");
				 }
				 
				 if ($scope.localData) {
                        var matches = [];
                        for (var i = 0; i < $scope.localData.length; i++) {
                            var match = false;
                            match = (typeof $scope.localData[i][$scope.dataField] === 'string' && typeof str === 'string' && $scope.localData[i][$scope.dataField].toLowerCase().indexOf(str.toLowerCase()) >= 0);
                            if (match) {
                                //matches[matches.length] = $scope.localData[i];
								$scope.searchStr="";
								for (var t = 0; t < titleFields.length; t++) {
									if(t==0){
										$scope.searchStr= $scope.localData[i][titleFields[t]];
									}else{
										$scope.searchStr=$scope.searchStr+ " " + $scope.localData[i][titleFields[t]];
									}
								}
								break;
                            }
                        }
                        
                        $scope.searching = false;
                    } else {
                        $http.get($scope.url + str+'&field='+$scope.dataField, {}).
                            success(function(data, status, headers, config) {
                                $scope.searching = false;
								
								if(data.length>0){
								   $scope.searchStr="";
									for (var t = 0; t < titleFields.length; t++) {
										if(t==0){
											$scope.searchStr= data[0][titleFields[t]];
										}else{
											$scope.searchStr=$scope.searchStr+ " " + data[0][titleFields[t]];
										}
									}
								}
								
                            }).
                            error(function(data, status, headers, config) {
                                console.log("error");
                            });
                    }
				}else{ // cuando ponemos el value del autocomplete a null o vacio, elimina la el contenido del textbox que ve el usuario
					 $scope.searchStr="";
				}	
             });

            $scope.selectResult = function(result) {
                if ($scope.matchClass) {
                    result.title = result.title.toString().replace(/(<([^>]+)>)/ig, '');
                }
                $scope.searchStr = $scope.lastSearchTerm = result.title;
				$scope.selectedObject = result.data;
                $scope.showDropdown = false;
                $scope.results = [];
            }

            var inputField = elem.find('input');

            inputField.on('keyup', $scope.keyPressed);

            elem.on("keyup", function (event) {
                if(event.which === 40) {
                    if ($scope.results && ($scope.currentIndex + 1) < $scope.results.length) {
                        $scope.currentIndex ++;
                        $scope.$apply();
                        event.preventDefault;
                        event.stopPropagation();
                    }

                    $scope.$apply();
                } else if(event.which == 38) {
                    if ($scope.currentIndex >= 1) {
                        $scope.currentIndex --;
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
});

