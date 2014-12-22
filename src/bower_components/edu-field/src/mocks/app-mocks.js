angular.module('e2e-mocks', ['ngMockE2E'])
.run(function($httpBackend,$http,$log,$filter,filterFilter) {
    // Do your mock
    var baseApiUrl = 'api/v1';
    var centros=null;
	var municipios=null;
    var orderBy = $filter('orderBy');
    
   
    // GET all temas from temas array with filters
    $httpBackend.whenGET(/services\/temasservice\/temas(\?([a-z0-9$_\.\+!\*\'\(\),;:@&=-]|%[0-9a-f]{2})*)*/).respond(function(method, url,data,headers) {
		console.log("llamada a GET services/temaservice/temas?algo=algo "+method + " params:"+ url.split('?')[1]+ " url:"+url);
        return [200, getAll(url,temas), {}];
	});
	// GET all subtemas from subtemas array with filters
    $httpBackend.whenGET(/services\/subtemasservice\/subtemas(\?([a-z0-9$_\.\+!\*\'\(\),;:@&=-]|%[0-9a-f]{2})*)*/).respond(function(method, url,data,headers) {
		console.log("llamada a GET services/subtemasservice/subtemas?algo=algo "+method + " params:"+ url.split('?')[1]+ " url:"+url);
        return [200, getAll(url,subtemas), {}];
	});
	
	var getAll=function(url,entities){
		var params={};
        params=queryStringToJSON(url.split('?')[1]);
		var reverse=(params.order.toUpperCase()==='ASC')?false:true;
        var entitiesFiltered=filterFilter(entities, params.filter);
        entitiesFiltered = orderBy(entitiesFiltered, params.orderby, reverse);
        console.log("entitiesFiltered:"+ entitiesFiltered.length);
        var entitiesPaged=getPagedData(entitiesFiltered,params.limit, params.offset, params.filter);
        console.log("entitiesPaged:"+entitiesPaged.length);
        return entitiesPaged;
	}
	
	// GET all municipios from municipios array with filters
    $httpBackend.whenGET(/api\/v1\/municipios(\?([a-z0-9$_\.\+!\*\'\(\),;:@&=-]|%[0-9a-f]{2})*)*/).respond(function(method, url,data,headers) {
        console.log("llamada a GET api/v1/municipios?algo=algo "+method + " params:"+ url.split('?')[1]+ " url:"+url);
        var params={};
		var querystring=url.split('?');
		if (querystring.length==1){
		  params.filter='';
		  params.field='';
		  params.orderby='asc';
		}else{
			params=queryStringToJSON(querystring[1]);
		}
        var municipiosFiltered=filterFilter(municipios, params.filter);
		//console.log(".........=params:"+angular.toJson(params) + " municipiosFiltrados:" +angular.toJson(municipiosFiltered));
        municipiosFiltered = orderBy(municipiosFiltered, params.orderby, false);
        console.log("municipiosFiltered:"+ municipiosFiltered.length);
		 console.log("municipiosFiltered:"+ angular.toJson(municipiosFiltered));
        return [200, municipiosFiltered, {}];
    });
	
	
    // GET count centers from array
    $httpBackend.whenGET(/api\/v1\/centros\/count(\?([a-z0-9$_\.\+!\*\'\(\),;:@&=-]|%[0-9a-f]{2})*)*/).respond(function(method, url,data,headers) {
        console.log("llamada a GET api/v1/centros/count "+method + " url:"+ url);
		var params={};
        params=queryStringToJSON(url.split('?')[1]);
        var centrosFiltered=filterFilter(centros, params.filter);
	    return [200, {"count":centrosFiltered.length}, {}]; 
    });           
    
	

	
    // GET one center from array
    $httpBackend.whenGET(/api\/v1\/centros\/([0-9a-zA-Z$_\.\+!\*\'\(\),;:@&=-])+/).respond(function(method, url,data,headers) {
        console.log("llamada a GET api/v1/centros/:id "+method + " "+ url+ " "+url.split('/')[3]);
        var centro="";
        for(i=0;i<centros.length;i++){
            if(centros[i].vcodcen==url.split('/')[3]){
                centro=centros[i];
            }
        }
        return [200, centro, {}];
    });
     
     // GET all centers from centers array with filters
    $httpBackend.whenGET(/api\/v1\/centros(\?([a-z0-9$_\.\+!\*\'\(\),;:@&=-]|%[0-9a-f]{2})*)*/).respond(function(method, url,data,headers) {
        console.log("llamada a GET api/v1/centros?algo=algo "+method + " "+ url.split('?')[1]+ " url:"+url);
        var params={};
        params=queryStringToJSON(url.split('?')[1]);
		var reverse=(params.order.toUpperCase()==='ASC')?false:true;
        var centrosFiltered=filterFilter(centros, params.filter);
        centrosFiltered = orderBy(centrosFiltered, params.orderby, reverse);
        console.log("centrosFiltered:"+ centrosFiltered.length);
        var centrosPaged=getPagedData(centrosFiltered,params.limit, params.offset, params.filter);
        console.log("centrosPaged:"+centrosPaged.length);
        return [200, centrosPaged, {}];
    });

     
    // ADD a new center to centers array
    $httpBackend.whenPOST(/api\/v1\/centros/).respond(function(method, url, data,headers) {
      console.log("llamada a POST api/v1/centros data:"+angular.toJson(data));	
      var centro = angular.fromJson(data);
      centros.push(centro);
      $cookies.eduCrudCentros = centros;
      return [200, centro, {}];
    });
    
    // UPDATE a center IN centers array
    $httpBackend.whenPUT(/api\/v1\/centros\/([0-9a-zA-Z$_\.\+!\*\'\(\),;:@&=-])+/).respond(function(method, url, data,headers) {
        console.log("llamada a PUT api/v1/centros/:id METHOD:"+method + " URL:"+ url+ " ID:"+url.split('/')[3]);
        for(i=0;i<centros.length;i++){
            if(centros[i].vcodcen==url.split('/')[3]){
                centros.splice(i, 1);
            }
        }
        var centro = angular.fromJson(data);
        centros.push(centro);
        $cookies.eduCrudCentros = centros;
        return [200, centro, {}];
    });
    
    // DELETE a new center to centers array
    $httpBackend.whenDELETE(/api\/v1\/centros\/([0-9a-zA-Z$_\.\+!\*\'\(\),;:@&=-])+/).respond(function(method, url,data,headers) {
        console.log("llamada a DELETE api/v1/centros/:id "+method + " "+ url.split('/')[3]);
        var centro="";
        for(i=0;i<centros.length;i++){
            if(centros[i].vcodcen==url.split('/')[3]){
                centro=centros[i];
                centros.splice(i, 1);
            }
        }
        $cookies.eduCrudCentros = centros;
        return [200, centro, {}];
      });
    
    
    
    // Don't mock the html views
    $httpBackend.whenGET(/views\/\w+.*/).passThrough();
     
    // For everything else, don't mock
    $httpBackend.whenGET(/^\w+.*/).passThrough();
    $httpBackend.whenPOST(/^\w+.*/).passThrough();
    $httpBackend.whenPUT(/^\w+.*/).passThrough();
    $httpBackend.whenDELETE(/^\w+.*/).passThrough();
    
    /*
     * helpers
     */
    
    var setPagingData = function(data, offset, limit){
        console.log("setPagingData: offset:"+offset+ " limit:"+limit)
        return data.slice(offset, (offset*1) + (limit*1));
        
    }
    
    var getPagedData = function (data,limit, offset, searchText) {
        var dataf;
        if (searchText) {
            var ft = searchText.toLowerCase();
            dataf = data.filter(function(item) {
                return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
            });
            return setPagingData(dataf,offset,limit);
                                       
        } else {
            console.log("getPagedData sin searchText: offset:" + offset +" limit:" + limit);
            return setPagingData(data,offset,limit);
        }
    };
    
    var queryStringToJSON=function(queryString) {
        var pairs = queryString.split('&');
    
        var result = {};
        pairs.forEach(function(pair) {
            pair = pair.split('=');
            result[pair[0]] = decodeURIComponent(pair[1] || '');
        });

        return JSON.parse(JSON.stringify(result));
    }
    
    municipios=[
{
    "value":"ABANILLA",
	"name": "Abanilla",
	"group":"grupo1"	
},{
    "value":"ABARAN",
	"name": "Abaran",
	"group":"grupo1"	
},{
    "value":"MURCIA",
	"name": "Murcia",
	"group":"grupo1"	
},{
    "value":"CARTAGENA",
	"name": "Cartagena",
	"group":"grupo1"	
},{
    "value":"ALCANTARILLA",
	"name": "Alcantarilla",
	"group":"grupo2"	
},
{
    "value":"ABUDEITE",
	"name": "Albudeite",
	"group":"grupo2"	
}
]
    
  });
 
angular.module('app').requires.push('e2e-mocks');