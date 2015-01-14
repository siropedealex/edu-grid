'use strict';
// Angular Init
var app = angular.module('app', [
	'eduGrid'
]);

app.controller('appController', ['$scope','$http','dataFactoryGrid', function ($scope,$http,dataFactoryGrid) {
     $scope.field={key: 'vcodcen',type: 'date',col:'col-md-6',label: 'Código',placeholder: 'Denominación',autofocus:'',required: true }
										
	
	$scope.userFieldsFormGrid=[	  
			        {key: 'campo1',type: 'text',col:'col-md-6',label: 'Código',placeholder: 'Código',autofocus:'',required: true },
					{key: 'campo2',type: 'text',col:'col-md-6',label: 'Código',placeholder: 'Código',autofocus:'',required: true },
					{key: 'campo3',type: 'text',col:'col-md-12',label: 'Código',placeholder: 'Código',autofocus:'',required: true }
				];
	
	$scope.avancedSearchFieldsFormGrid=[	  
			        {key: 'fecha_ini_1',type: 'date',col:'col-md-4',label: 'Fecha inicio',placeholder: 'Fecha inicio',autofocus:'',required: false },
					{key: 'fecha_fin_1',type: 'date',col:'col-md-4',label: 'Fecha fin',placeholder: 'Fecha fin',autofocus:'',required: false },
					{key: 'fecha_ini_2',type: 'date',col:'col-md-4',label: 'Fecha inicio',placeholder: 'Fecha inicio',autofocus:'',required: false },
					{key: 'fecha_fin_2',type: 'date',col:'col-md-4',label: 'Fecha fin',placeholder: 'Fecha fin',autofocus:'',required: false },
					{key: 'tipo',type: 'text',col:'col-md-12',label: 'Tipo',placeholder: 'Tipo',autofocus:'',required: false }
				];
	
	$scope.ciudades=[
			        {   value:'ABANILLA',
						 name: 'Abanilla2'		
					}, {
						value:'MURCIA',
						name: 'Murcia2'
					}, {
						value:'ABARÁN',
						name: 'Abarán2'
					}
				];
				
	$scope.municipios=[
					{
						"value":"ABANILLA",
						"name": "Abanilla"	
					},{
						"value":"ABARAN",
						"name": "Abarán2"	
					},{
						"value":"MURCIA",
						"name": "Murcia"	
					},{
						"value":"CARTAGENA",
						"name": "Cartagena"
					},{
						"value":"ALCANTARILLA",
						"name": "Alcantarilla"
					},{
						"value":"ABUDEITE",
						"name": "Albudeite"
					}
				]			
				
	

    $scope.options = {
        heading: 'Demo eduGrid',
		showOverlayLoading:false,
		showOverlayFormUser:false,
        showRefreshButton: true,
		showExtraButtonTopLeft:false,
        showAddButton: true,
        showPagination: true,
        showItemsPerPage: true,
		
		allFieldsGlobalSearch:false,
		fieldsGlobalSearch:['vdencen','vdomcen'],
		
        showSearch: true,
		showAvancedSearch:true,
        showMetaData: true,
        paginationWidth: 3,
		
		showButtonsGridUserPre:true,
		showButtonsGridUserPost:true,
		
		
		showRowNumber:true,
		showSelectRow:true,
		
        crudUri:'api/v1/centros/:id',
		actions:{
				 getAll: {method:'GET', url: 'api\/v1\/centros\/\?getData', params:{}, headers:{'Access-Control-Allow-Credentials': true}, isArray:true},
				 getCount: {method:'GET', url: 'api\/v1\/centros\/\?getCount', params:{}, headers:{'Access-Control-Allow-Credentials': true}, isArray:false}
				},
		fieldFk:'codigo',
		valueFk:'30000018',
        fieldKey:'vcodcen',
		fieldKeyLabel:'código',
        height:300,
        listFields: [
                 {label: 'Código', column: 'vcodcen', weight: '7',type:'text'},
                 {label: 'Denominación', column: 'vdencen', weight: '50',type:'text'},
                 {label: 'Domicilio', column: 'vdomcen', weight: '20',type:'text'},
                 {label: 'Localidad', column: 'vloccen', weight: '10',type:'text'},
                 {label: 'Municipio', column: 'vmuncen', weight: '10',type:'text'}
        ],
        metaData:{
		   panelType:"info",
           limit:50,
		   orderBy:'vcodcen',
		   order:'asc'
        },
        listListeners: {
		    onPageLoadComplete:function(rows){
            	//console.log('onPageLoadComplete rows:'+angular.toJson(rows));
            },
            onRowClick:function(row){
            	console.log('click row:'+angular.toJson(row));
            },onExtraButtonClick:function(){
            	console.log('click extra button:');
            },transformParams:function(oParams){
				console.log('transformParams :'+angular.toJson(oParams));
				return oParams;
			}
        },
		
        buttonsUserPre: [
                  {label: 'Ejecutar', class: '', glyphicon: 'flash', button: false,
					  onclick: function (row) {
						  console.log('ejecutar consulta:', row);
					  },
					  disabled: function (row) {
						  //console.log('disabled button:', row);
						  return false;
					  }
				  }
				  
              ],
        buttonsUserPost: [
            {label: 'Ejecutar', class: '', glyphicon: 'flash', button: false, onclick: function (row) {
                console.log('ejecutar consulta:', row);
            }}
        ],
		formUser:{
		    width:'700px',
			fields:$scope.userFieldsFormGrid,
			events:{
					continue: function () {
                      console.log('form User continue button:');
					  $scope.options.gridControl.showOverlayFormUser(false)
                  },
				  cancel: function () {
                      console.log('form User cancel button');
					  $scope.options.formUser.result={};
					  $scope.options.gridControl.showOverlayFormUser(false)
                  }
			  },
		     result:{}
		},
		formAvancedSearch:{
			width:'1200',
			fields:$scope.avancedSearchFieldsFormGrid
		}
    };
}])

