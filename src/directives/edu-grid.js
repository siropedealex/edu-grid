
 eduGridDirectives.directive('eduGrid', function () {
        return {
            restrict: "A",
            replace: true,
            transclude: false,
            scope: {
                options: '='
            },
            templateUrl:'directives/edu-grid.tpl.html',
            link: function ($scope,$filter) {
			
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
                        $scope.options.listFields[fieldKey].renderer = function (input, row, column,type) {
							return input;
                        };
                    }
                }
               
            },
            // ------------------------------------------------------------------------------------------- //
            //    CONTROLLER
            // ------------------------------------------------------------------------------------------- //
            controller: function ($scope,$log,dataFactoryGrid,$timeout) {
				if (!$scope.hasOwnProperty('options')) {
                    throw new Error('options are required!');
                }
				
				// ---
				// SETUP
				// ---
			    $scope.options.selectionRows=[];
				$scope.options.formAvancedSearchResult={};
				$scope.showOverlayFormSearch=false;
				$scope.options.gridControl={};
			    $scope.options.metaData.offset=0;
				$scope.options.showOverlayLoading=false;
				$scope.currentPage = undefined;
				$scope.currentPage={
            	                       offset:0,
            	                       label:1
            	                   };
				$scope.gridStyle={};
                $scope.gridStyle.height=$scope.options.height+'px';
				
				//extract type of fieldKey
				var typeFieldKey="";
				for(var i=0;i<$scope.options.listFields.length;i++){
					if($scope.options.listFields[i].column==$scope.options.fieldKey){
						typeFieldKey=$scope.options.listFields[i].type;
						break;
					}
				}
				
				// ---
				// METHODS
				// ---
				$scope.internalControl = $scope.options.gridControl || {};
			  
				$scope.internalControl.refresh = function() {
					$scope.refresh();  
				}
				
				$scope.internalControl.showOverlayLoading = function(bShow) {
					$scope.options.showOverlayLoadingGrid=bShow;  
				}
			  
				$scope.internalControl.showOverlayFormUser = function(bShow) {
					$scope.options.showOverlayFormUser=bShow;  
				}
				
				$scope.internalControl.showOverlayFormAvancedSearch = function(bShow) {
					$scope.showOverlayFormAvancedSearch=bShow;  
				}
				
				$scope.internalControl.showOverlayFormSuccessError = function(type,text,duration) {
					$scope.options.overlayFormSuccessErrorGrid={};
					$scope.options.overlayFormSuccessErrorGrid.show=true;
					$scope.options.overlayFormSuccessErrorGrid.type=type=='1'?'success':'danger';
					$scope.options.overlayFormSuccessErrorGrid.message=text;
					var closeForm=function(){
						$scope.options.overlayFormSuccessErrorGrid.show=false;
						$scope.$apply() ;
					}
					$timeout(closeForm,duration);
				}
				
				$scope.internalControl.showButtonsUserPre = function(bShow) {
					$scope.options.showButtonsGridUserPre=bShow;  
				}
				$scope.internalControl.showButtonsUserPost = function(bShow) {
					$scope.options.showButtonsGridUserPost=bShow;  
				}

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
                };
				
				// ---
                // Calculate pagination
                // ---	  
											                
				$scope.pagination=function(){
            		   var paginationWidth = $scope.options.paginationWidth || 2;
	                    var limit = $scope.options.metaData.limit;
	                    var offset = $scope.options.metaData.offset;
	                    var total = $scope.options.metaData.total;
	
	                    $scope.pages = [];
	                    if (!(isNaN(limit) || isNaN(offset) || isNaN(total))) {
	                        var numPages = Math.ceil(total / limit);
	                        var startPage = Math.floor(offset / limit) - Math.floor(paginationWidth / 2);
	                        startPage = (startPage < 0) ? 0 : startPage;
	
	                        var currentPageId = Math.floor(offset / limit);
	                        for (var i = startPage; i < Math.min(numPages, startPage + paginationWidth); i++) {
	                            var newPage = {
	                                label: i + 1,
	                                offset:( i+0) * limit
	                            };
	                            if (i === currentPageId) {
	                                $scope.currentPage = newPage;
	                            }
	                            $scope.pages.push(newPage);
	                        }
	                    }
            	};
            	
            	$scope.api=null;
				
            	if( typeof $scope.options.crudUri!=='undefined' && $scope.options.crudUri!==''){
					$scope.api=dataFactoryGrid($scope.options.crudUri,(typeof $scope.options.actions!=='undefined'?$scope.options.actions:''));
            	};
            	
                $scope.handleButtonClick = function (callback, entry) {
				    $scope.selectedRow=entry;
                    if (typeof callback === 'function') {
                        callback(entry);
                    } 
                };
    			
                $scope.onRowClick = function(clickedEntry) {
					if(typeof clickedEntry!=='undefined'){
						for(var i=0;i<$scope.list.length;i++){
							if($scope.list[i][$scope.options.fieldKey]==clickedEntry[$scope.options.fieldKey]){
								clickedEntry.clicked=true;//!clickedEntry.clicked;
							}else{
								$scope.list[i].clicked=false;
							}
						}
						if (!$scope.options.hasOwnProperty('listListeners')|| typeof $scope.options.listListeners.onRowClick !== 'function')
							return;
					    $scope.options.listListeners.onRowClick(clickedEntry);
					}
							
                    
                };
				
				$scope.onPageLoadComplete = function(rows) {
                    if (!$scope.options.hasOwnProperty('listListeners')
                        || typeof $scope.options.listListeners.onPageLoadComplete !== 'function')
                        return;
					$scope.options.listListeners.onPageLoadComplete($scope.list);
                };
				
				
				
				// ---
				// PAGINATION METHODS
				// --- 
				
				
				
                $scope.setPage = function (page) {
                	$log.log("setPage:"+angular.toJson(page));
                	$scope.options.metaData.offset=page.offset;
                	$scope.pagination();
                	$scope.refresh(); 
                };
                $scope.setFirstPage = function () {
                    if ($scope.options.metaData === undefined) return;
                    $scope.options.metaData.offset=0;
                    $scope.pagination();
                    $scope.refresh(); 
                };
                $scope.setPreviousPage = function () {
                    if ($scope.options.metaData === undefined) return;
                    var currentOffset = $scope.currentPage.offset;
                    $scope.options.metaData.offset=$scope.currentPage.offset-$scope.options.metaData.limit;
                    $scope.pagination();
                    $scope.refresh();
                };
                $scope.setNextPage = function () {
                    if ($scope.options.metaData === undefined) return;
                    var currentOffset = $scope.currentPage.offset;
                    $scope.options.metaData.offset=$scope.currentPage.offset+$scope.options.metaData.limit;
                    $scope.pagination();
                    $scope.refresh(); 
                };
                $scope.setLastPage = function () {
                	$log.log("setLastPage");
                    if ($scope.options.metaData === undefined) return;
                    var numPages = Math.ceil($scope.options.metaData.total / $scope.options.metaData.limit);
                    $scope.options.metaData.offset=numPages*$scope.options.metaData.limit-$scope.options.metaData.limit;
                    $scope.pagination();
                    $scope.refresh(); 
                };

                $scope.isOnFirstPage = function () {
                    if ($scope.options.metaData === undefined) return;
                    return $scope.options.metaData.offset == 0;
                };

                $scope.isOnLastPage = function () {
                    if ($scope.options.metaData === undefined) return;
                    var numPages = Math.ceil($scope.options.metaData.total / $scope.options.metaData.limit);
					return $scope.options.metaData.offset == numPages * $scope.options.metaData.limit - $scope.options.metaData.limit;
                };

                // ---
                // GET DATA
                // ---	
                $scope.getData = function (oParams) {
                	//var oParams={};
                	if(typeof $scope.options.metaData.limit!=='undefined' && typeof $scope.options.metaData.offset!=='undefined'){
                        oParams.limit=$scope.options.metaData.limit;
                        oParams.filter=(typeof $scope.searchQuery!=='undefined'?$scope.searchQuery.toUpperCase().trim():'');
                        oParams.offset=$scope.options.metaData.offset;
						oParams.orderby=$scope.options.metaData.orderBy;
						oParams.order=$scope.options.metaData.order;
                    };
                    
					if($scope.options.hasOwnProperty("fieldFk") && typeof $scope.options.fieldFk!='undefined' && $scope.options.hasOwnProperty("valueFk") && typeof $scope.options.valueFk!='undefined'){
						oParams["fieldFk"]=$scope.options.fieldFk;
						oParams["valueFk"]=$scope.options.valueFk;
					}
					
					if ($scope.options.hasOwnProperty('listListeners') && typeof $scope.options.listListeners.transformParams == 'function'){
                       oParams=$scope.options.listListeners.transformParams(oParams);
					}
					
	                $scope.api.getAll(oParams,function (data) {  
                        //$scope.searchQuery="";					
	             		$scope.list =data;
						$scope.onPageLoadComplete($scope.list);
						for( var i=0;i< $scope.list.length;i++){
							var bExists=false;
							for( var j=0;j< $scope.options.selectionRows.length;j++){
								if($scope.options.selectionRows[j]==$scope.list[i][$scope.options.fieldKey]){
									$scope.list[i].selected=true;
									bExists=true;
									break;
								}
							}
							if(!bExists){
								$scope.list[i].selected=false;
							}
						}
						
	                    $scope.pagination();
						
						$scope.options.showOverlayLoadingGrid=false;
	                });
                };
                
                $scope.refresh=function(){
					var oParams={};
					oParams.filter=(typeof $scope.searchQuery!=='undefined'?$scope.searchQuery.toUpperCase().trim():'');
					if($scope.options.hasOwnProperty("fieldFk") && typeof $scope.options.fieldFk!='undefined' && $scope.options.hasOwnProperty("valueFk") && typeof $scope.options.valueFk!='undefined'){
						oParams["fieldFk"]=$scope.options.fieldFk;
						oParams["valueFk"]=$scope.options.valueFk;
					}
					if($scope.options.hasOwnProperty("formAvancedSearch") && typeof $scope.options.formAvancedSearchResult!='undefined'){
					
						for(var key in $scope.options.formAvancedSearchResult){
							oParams[key]=$scope.options.formAvancedSearchResult[key];
						}
						
					}
					$scope.options.showOverlayLoadingGrid=true;
					
					if ($scope.options.hasOwnProperty('listListeners') && typeof $scope.options.listListeners.transformParams == 'function'){
                       oParams=$scope.options.listListeners.transformParams(oParams);
					}
					
					$scope.api.getCount(oParams,function (data) {
                   	    	$scope.options.metaData.total=data.count;
                   	    	$scope.getData(oParams);
                    });
					if ($scope.options.hasOwnProperty('listListeners') && typeof $scope.options.listListeners.onButtonRefreshClick == 'function'){
                       $scope.options.listListeners.onButtonRefreshClick($scope.list);
					}
					//CLEAN form field searchQuery
					//$scope.searchQuery="";
					//CLEAN formAvancedSearchResult
					//$scope.options.formAvancedSearchResult="";
					
                };
				
                setTimeout(function(){
	     	       $scope.refresh();
	            },500); 
				
                // ON CLICK EXTRA BUTTON
				$scope.clickExtraButton=function(value){ 
					if ($scope.options.hasOwnProperty('listListeners') && typeof $scope.options.listListeners.onExtraButtonClick == 'function'){
                       $scope.options.listListeners.onExtraButtonClick();
					}
				}
				
                // ON CLICK SELECT ALL ROWS CHECKBOX
				$scope.changeSelectAllRows=function(value){
					if (value){
						for( var i=0;i< $scope.list.length;i++){
							$scope.list[i].selected=true;
						}
					}else{
						for( var i=0;i< $scope.list.length;i++){
							$scope.list[i].selected=false;
						}
					}
				}
				
                // ON CLICK SELECT ROWS CHECKBOX
				 $scope.checkSelectRow=function(row){
					if(!row.selected){
						var bExists=false;
						for( var i=0;i< $scope.options.selectionRows.length;i++){
							if($scope.options.selectionRows[i]==row[$scope.options.fieldKey]){
								bExists=true;
								break;
							}
						}
						if(!bExists){
							$scope.options.selectionRows.push((typeFieldKey=='text')?row[$scope.options.fieldKey]+"":row[$scope.options.fieldKey]);
						}
					}else{
						
						for( var i=0;i< $scope.options.selectionRows.length;i++){
							if($scope.options.selectionRows[i]==row[$scope.options.fieldKey]){
								$scope.options.selectionRows.splice( i, 1 );
								break;
							}
						}
					}
				}
				
                // ON ORDER CHANGE
                $scope.changeOrder = function (field, orderBy, order) {
                	$scope.options.metaData.orderBy=orderBy;
				    $scope.options.metaData.order=order.toUpperCase();
                	$scope.refresh();
                   
                    for (var fieldKey in $scope.options.listFields) {
                        if ($scope.options.listFields[fieldKey] === field) continue;
                        $scope.options.listFields[fieldKey].order = '';
                    }
                    field.order = order;
                };

                
				
                // ON CHANGE ITEMS PER PAGE
				var timerOnChangeItemsPerPage=null;
                $scope.onChangeItemsPerPage=function(){
					clearInterval(timerOnChangeItemsPerPage);
					timerOnChangeItemsPerPage = setInterval(function(){$scope.refresh();clearInterval(timerOnChangeItemsPerPage);}, 750);
				};
                
              
				// ---
                // ON SEARCH
                // ---	
				 var timerOnChangeSearchQuery=null;
                 $scope.onChangeSearchQuery=function(){
					clearInterval(timerOnChangeSearchQuery);
					timerOnChangeSearchQuery = setInterval(function(){$scope.refresh();clearInterval(timerOnChangeSearchQuery);}, 750);

				 };
				 
				
				// ---
                // ON AVANCEDSEARCH
                // ---	
				 $scope.onClickAvancedSearch=function(){
					$scope.showOverlayFormAvancedSearch=true;
				 }
				 
				
				// ---
                // ON CONTINUE BUTTON FORM AVANCED SEARCH
                // ---	
				 $scope.formAvancedSearchEventsContinue=function(){
					$scope.refresh();
					$scope.showOverlayFormAvancedSearch=false;
					if ($scope.options.hasOwnProperty('listListeners') && typeof $scope.options.listListeners.onFormAvancedSearchContinueClick == 'function'){
                       $scope.options.listListeners.onFormAvancedSearchContinueClick($scope.options.formAvancedSearchResult);
					}
					//$scope.options.formAvancedSearchResult={};
				 }
				 
				
				// ---
                // ON CANCEL BUTTON FORM AVANCED SEARCH
                // ---	
				 $scope.formAvancedSearchEventsCancel=function(){
					$scope.options.formAvancedSearchResult={};
					$scope.showOverlayFormAvancedSearch=false;
					if ($scope.options.hasOwnProperty('listListeners') && typeof $scope.options.listListeners.onFormAvancedSearchCancelClick == 'function'){
                       $scope.options.listListeners.onFormAvancedSearchCancelClick();
					}
				}

				// ---
                // ON CLEAN BUTTON FORM AVANCED SEARCH
                // ---	
				 $scope.formAvancedSearchEventsClean=function(){
					$scope.options.formAvancedSearchResult={};
					if ($scope.options.hasOwnProperty('listListeners') && typeof $scope.options.listListeners.onFormAvancedSearchCleanClick == 'function'){
                       $scope.options.listListeners.onFormAvancedSearchCleanClick();
					}
				}	    				
            }
        };
    });
