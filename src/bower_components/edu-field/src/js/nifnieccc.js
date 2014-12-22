
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

function valida_nif_cif_nie(a) 
{
   
	var temp=a.toUpperCase();
	var cadenadni="TRWAGMYFPDXBNJZSQVHLCKE";
 
	if (temp!==''){
		//si no tiene un formato valido devuelve error
		if ((!/^[A-Z]{1}[0-9]{7}[A-Z0-9]{1}$/.test(temp) && !/^[T]{1}[A-Z0-9]{8}$/.test(temp)) && !/^[0-9]{8}[A-Z]{1}$/.test(temp))
		{
			return 0;
		}
 
		//comprobacion de NIFs estandar
		if (/^[0-9]{8}[A-Z]{1}$/.test(temp))
		{
			posicion = a.substring(8,0) % 23;
			letra = cadenadni.charAt(posicion);
			var letradni=temp.charAt(8);
			if (letra == letradni)
			{
			   	return 1;
			}
			else
			{
				return -1;
			}
		}
 
		//algoritmo para comprobacion de codigos tipo CIF
		suma = parseInt(a[2])+parseInt(a[4])+parseInt(a[6]);
	
		for (i = 1; i < 8; i += 2)
		{
			temp1 = 2 * parseInt(a[i]);
			temp1 += '';
			temp1 = temp1.substring(0,1);
			temp2 = 2 * parseInt(a[i]);
			temp2 += '';
			temp2 = temp2.substring(1,2);
			if (temp2 == '')
			{
				temp2 = '0';
			}
 
			suma += (parseInt(temp1) + parseInt(temp2));
		}
		suma += '';
		n = 10 - parseInt(suma.substring(suma.length-1, suma.length));
 
		//comprobacion de NIFs especiales (se calculan como CIFs)
		if (/^[KLM]{1}/.test(temp))
		{
			if (a[8] == String.fromCharCode(64 + n))
			{
			    //console.log("NIF 1");
				return 1;
			}
			else
			{
			    //console.log("NIF -1");
				return -1;
			}
		}

		//comprobacion de CIFs
		if (/^[ABCDEFGHJNPQRSUVW]{1}/.test(temp))
		{
			temp = n + '';
			if (a[8] == String.fromCharCode(64 + n) || a[8] == parseInt(temp.substring(temp.length-1, temp.length)))
			{
				return 2;
			}
			else
			{
				return -2;
			}
		}

		//comprobacion de NIEs
		//T
		if (/^[T]{1}/.test(temp))
		{
			if (a[8] == /^[T]{1}[A-Z0-9]{8}$/.test(temp))
			{
				return 3;
			}
			else
			{
				return -3;
			}
		}
 
		//XYZ
		if (/^[XYZ]{1}/.test(temp))
		{
			pos = str_replace(['X', 'Y', 'Z'], ['0','1','2'], temp).substring(0, 8) % 23;
			if (a[8] == cadenadni.substring(pos, pos + 1))
			{
				return 3;
			}
			else
			{
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

function ss(f,r,i,o)
{
	var valor=$(f).val().toUpperCase();

	//podemos encontrarnos números con 11 o 12 dígitos
	if(valor.length!=12 && valor.length!=11){
		return "Número Seguridad Social no válido";
	}
	//sacamos las partes…
	var a=parseInt(valor.substring(0,2));
	var b=valor.substring(2,(valor.length-2));
	var c=parseInt(valor.substring((valor.length-2),(valor.length)));
	
	// si el numero b (la parte central) empieza por 0 hay que quitar primero los ceros
	var cero=b.substring(0,1);
	if(cero=='0' ){
		for(var i=0;i<b.length;i++){
			if(b[0]==0){
				b=b.substring(1, b.length);
			}else{
				break;
			}
		}
	}
	var d=0;
	if(valor.length==11)
	{
	   if(parseInt(b)<1000000)
	     d=parseInt(b)+(parseInt(a)*1000000);
	   else d=parseInt(a+''+b);
	}else if (valor.length==12)
	{
	  if(parseInt(b)<10000000)
	    d=parseInt(b)+(parseInt(a)*10000000);
	  else d=parseInt(a+''+b);
	}else
	{
	  return -1;//"Número Seguridad Social no válido";
	}
	//alert("d:"+d);
	var dc=d%97;
	
	if(c!=dc){
		return -1;//"Número Seguridad Social no válido";
		
	}else{
		return 1;
	}
}


function str_replace(search, replace, subject) {
 
    var f = search, r = replace, s = subject;
    var ra = r instanceof Array, sa = s instanceof Array, f = [].concat(f), r = [].concat(r), i = (s = [].concat(s)).length;
 
    while (j = 0, i--) {
        if (s[i]) {
            while (s[i] = s[i].split(f[j]).join(ra ? r[j] || "" : r[0]), ++j in f){};
        }
    };
 
    return sa ? s : s[0];
}