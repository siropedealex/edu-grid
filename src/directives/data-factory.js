
eduGridServices.factory('dataFactoryGrid', [ '$resource', function ( $resource) {
    return function (uri,actions) {
	    var defActions={
						getAll: {method:'GET', params:{}, withCredentials: true, isArray:true},
						getCount: {method:'GET', url: uri + '/count', params:{}, withCredentials: true, isArray:false},
						
		};
		
		if (typeof actions!=='undefined' && actions!==''){
			for(keyAction in actions){
				for(keyDefAction in defActions){
					if(keyAction==keyDefAction){
						defActions[keyDefAction]=actions[keyAction];
					}
				}
			}
		}
    	return $resource(	uri ,
							{},
							defActions
		);        
    };
}]);





