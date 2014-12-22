//funciones de validacion
var modo_validacion_general;

function esBarra(cad,pos){
	var letra = cad.substr(pos,1);
	if (letra=="/") return true;
	else return false;
}

function esDosPuntos(cad,pos){
	var letra = cad.substr(pos,1);
	if (letra==":") return true;
	else return false;
}

//convierte una letra en numero si puede dentro de una cadena en una posicion dada
function valorLetra(cadena,pos){
	return parseInt(cadena.substr(pos,1));
}

//toma una letra dentro de una cadena 
function cogeLetra(cadena,pos){
	return cadena.substr(pos,1);
}

//comprueba si una letra dentro de una cadena es un numero o no
function esNumero(cadena,pos){
	var letra = cogeLetra(cadena,pos);
	if ((letra>="0") && (letra<="9")) return true;
	else return false;
}

//indica cuantos digitos hay a partir de una posicion dada, modifica la posicion
function cuantosNumeros(cad,pos){
	var res = 0;
	var len = cad.length;
	var letra;
	letra = cad.substr(pos,1);
	while ((pos<len) && (letra>="0") && (letra<="9")) {
		res = res + 1;
		pos =pos + 1;
		if (pos<len) letra = cad.substr(pos,1);
	}
	return res;
}

//devuelve una cadena de error si hay error
//jgr59k 16/01/2007 13:37 h. Función que comprueba si una dirección de correo está bien construida, por ejemplo, xxx@yyyy.zz
function compruebaEmail(campo,valor) {
		
	/*DGILG  5/06/2009 
	if ( valor.indexOf('@', 0)==-1 || valor.indexOf('.',0)==-1 ) {		
		return "el campo "+campo+" = "+valor+" no es un email correcto\n";	
	}		
		return "";
	*/
	//function checkMail(campo,valor) {
	if (valor.length == 0) {		
		return ""
      	//return true;
      }
	var emailPat=/^(.+)@(.+)$/;
      var specialChars="\\(\\)<>@,;:\\\\\\\"\\.\\[\\]";
      var validChars="\[^\\s" + specialChars + "\]";
      var quotedUser="(\"[^\"]*\")";
      var ipDomainPat=/^(\d{1,3})[.](\d{1,3})[.](\d{1,3})[.](\d{1,3})$/;
      var atom=validChars + '+';
      var word="(" + atom + "|" + quotedUser + ")";
      var userPat=new RegExp("^" + word + "(\\." + word + ")*$");
      var domainPat=new RegExp("^" + atom + "(\\." + atom + ")*$");
      var matchArray=valor.match(emailPat);
      if (matchArray == null) {
		//return false;
		return "el campo "+campo+" = "+valor+" no es un email correcto\n";	
      	
	}

	var user=matchArray[1];
      var domain=matchArray[2];
      if (user.match(userPat) == null) {
		return "el campo "+campo+" = "+valor+" no es un email correcto\n";	
      	//return false;
	}
      var IPArray = domain.match(ipDomainPat);
      if (IPArray != null) {
      	for (var i = 1; i <= 4; i++) {
            	if (IPArray[i] > 255) {
						return "el campo "+campo+" = "+valor+" no es un email correcto\n";	
                        //return false;
			}
		}
		return "";
            //return true;
	}
      var domainArray=domain.match(domainPat);
      if (domainArray == null) {
		return "el campo "+campo+" = "+valor+" no es un email correcto\n";	
      	//return false;
	}
      var atomPat=new RegExp(atom,"g");
      var domArr=domain.match(atomPat);
      var len=domArr.length;
      if ((domArr[domArr.length-1].length < 2) ||
      	(domArr[domArr.length-1].length > 3)) {
		return "el campo "+campo+" = "+valor+" no es un email correcto\n";	
		//return false;
      }
	if (len < 2) {
		return "el campo "+campo+" = "+valor+" no es un email correcto\n";	
      	//return false;
      }
	//return true;
	return "";
//}
}

//ayuda para calcular los dias que tiene el mes de febrero
function esBisiesto(anio) {
var BISIESTO;
	if(anio%4==0){
		if(anio%100==0){
			if(anio%400==0) BISIESTO=true;
			else BISIESTO=false;
		} else BISIESTO=true;
	} else BISIESTO=false;
	return BISIESTO; 
}

//devuelve una cadena de error si hay error
//opcionalmente se puede pasar el formato del numero como tercer parametro
//el formato es: F, F2,F4 (2/4, 2 y 4 digitos para el año, respectivamente)
function compruebaFecha(campo,valor){
	var error;
	var iDia,iMes,iAno;
	var dia,mes,ano;
	var maxdia = new Array(-1,31,29,31,30,31,30,31,31,30,31,30,31);

	//codigo para calcular el numero de digitos del año y el mensaje de error
	var formato = "F";
	if (compruebaFecha.arguments.length>2) formato = compruebaFecha.arguments[2];
	var digitosAno;
	var auxErr;
	if (formato=="F"){
		digitosAno = 4;	//ojo OBLIGATORIAMENTE debe ser 4 para que luego compruebe los de 2
		auxErr = "2 o 4";
	} else if (formato=="F2") {
		digitosAno = 2;
		auxErr = "2";
	} else if (formato=="F4") {
		digitosAno = 4;
		auxErr = "4";
	}

	error = "";
	iDia = cuantosNumeros(valor,0);
	if ((iDia==1) || (iDia==2)) {
		if (esBarra(valor,iDia)) {
			iMes = cuantosNumeros(valor,iDia+1);
			if ((iMes==1) || (iMes==2)) {
				if (esBarra(valor,iDia+1+iMes)) {
					iAno = cuantosNumeros(valor,iDia+1+iMes+1);
					//agm88x 20-6-2006: añadido para formatos de 2/4 y 4 digitos he complicado la formula
					if ((iAno==digitosAno) || ((formato=="F") && (iAno==2))) {
						if (iDia+1+iMes+1+iAno==valor.length) {
							dia = parseInt(valor.substr(0,iDia),10);
							mes = parseInt(valor.substr(iDia+1,iMes),10);
							ano = parseInt(valor.substr(iDia+1+iMes+1,iAno),10);
							//arreglo para los meses bisiestos
							if (esBisiesto(ano)) maxdia[2]=29;
							else maxdia[2]=28;
	
							if ((dia>=1) && (mes>=1) && (mes<=12) && (dia<=maxdia[mes]) && (ano>=0)) error = "";
							else error = "rango de dias/mes/año invalido";
						} else error = "la longitud de la fecha es incorrecta";
					} else error = "el año es de "+auxErr+" dígitos";
				} else error = "no se ha encontrado la barra separadora del año";
			} else error = "el mes es de 1 o 2 dígitos";
		} else error = "no se ha encontrado la barra separadora del mes";
	} else error = "el dia es de 1 o 2 dígitos";
	
	if (error!="") error = "Campo "+campo+" = "+valor+", "+error+"\n";
	else {
		//ha paso el filtro sintactico, ahora comprobare si 
	}
	return error;
}

//devuelve una cadena de error si hay error
function compruebaHora(campo,valor){
	var error;
	var iHora, iMinutos;
	var hora, minutos;

	error = "";
	iHora = cuantosNumeros(valor,0);

	if ((iHora==1) || (iHora==2)) {
		if (esDosPuntos(valor,iHora)) {
			iMinutos = cuantosNumeros(valor,iHora+1);
			if (iMinutos==2) {
				if (iHora+1+iMinutos==valor.length) {
					hora = parseInt(valor.substr(0,iHora), 10);
					minutos = parseInt(valor.substr(iHora+1,valor.length),10);					
					if ((hora>=0) && (hora<=23) && (minutos>=0) && (minutos<=59)) error = "";
					else error = "rango de hora:minutos invalido";
				} else error = "la longitud de la hora introducida es incorrecta";
			} else error = "Los minutos son de 2 dígitos";
		} else error = "No se ha encontrado los dos puntos que separan la hora de los minutos";
	} else error = "La hora es de 1 o 2 dígitos";
	
	if (error!="") error = "Campo "+campo+" = "+valor+", "+error+"\n";
	return error;
}

//devuelve una cadena de error si hay error
function compruebaMoneda(campo,valor){
	//obligo a que los numeros introducidos tengan el formato: +/-#.###.###,##
	var error = "";
	var reg = /^-?\d{1,3}(\.?\d{3})*(\,\d{1,2})?$/;
	if (!reg.test(valor)) error = "el campo "+campo+ " = "+valor+" no tiene formato moneda\n";
	return error;


/*	var iDigitos = 0;
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
function compruebaNumero(campo,valor){
	var error = "";
	var formato = "";
	var numDigitos=-9999;
	var numDecimales=-9999;
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
	if (!reg.test(valor)) error = "el campo "+campo+ " = "+valor+" no es un numero valido\n";

	return error;
}

//devuelve una cadena de error si hay error
//opcionalmente se puede pasar el formato del numero como tercer parametro
//el formato es: I, Ix donde x es el número de dígitos máximo permitido
function compruebaEntero(campo,valor,numDigitos){
	var error = "";

	if (numDigitos != "")
	{
		var reg = new RegExp("^-?\\d{1,"+numDigitos+"}$");
	}
	else{
		var reg = /^-?\d+$/;
	}

	if (!reg.test(valor)){
		if (numDigitos != "")
		{
			error = "el campo "+campo+ " = "+valor+" no es un entero válido o supera la longitud máxima de "+numDigitos+" digitos\n";
		} 
		else {
			error = "el campo "+campo+ " = "+valor+" no es un entero válido\n";
		}

	}

	return error;
}

//devuelve una cadena de error si el valor no es un codigo CCC correcto
function compruebaCCC(campo,valor){
	var c1;
	var c2;
	var c3;
	var c4;
	var m1,m2,d1,d2,digito1,digito2;
	var error = "";
	var ccc = valor;
	
	//comprobacion de 20 digitos
	if (ccc.length!=20) {
		error = "el campo "+campo+" no tiene 20 digitos:"+valor+"\n";
		return error;
	}

	c1 = ccc.substr(0,4);
	c2 = ccc.substr(4,4);
	c3 = ccc.substr(8,2);
	c4 = ccc.substr(10,10);

//	alert("c1="+c1+" c2="+c2+" c3="+c3+" c4="+c4);

	m1 = 4*(c1.substr(0,1)) + 8*(c1.substr(1,1)) + 5*(c1.substr(2,1)) + 10*(c1.substr(3,1))
		+9*(c2.substr(0,1)) + 7*(c2.substr(1,1)) + 3*(c2.substr(2,1)) +  6*(c2.substr(3,1));
	m2 = 1*(c4.substr(0,1)) + 2*(c4.substr(1,1)) + 4*(c4.substr(2,1)) +  8*(c4.substr(3,1))
		+5*(c4.substr(4,1)) +10*(c4.substr(5,1)) + 9*(c4.substr(6,1)) +  7*(c4.substr(7,1))
		+3*(c4.substr(8,1)) + 6*(c4.substr(9,1));

//	alert("m1="+m1+" m2="+m2);

	d1 = 11 - (m1 % 11);
	d2 = 11 - (m2 % 11);
	if (d1==10) d1 = 1;
	if (d1==11) d1 = 0;
	if (d2==10) d2 = 1;
	if (d2==11) d2 = 0;

//	alert("d1="+d1+" d2="+d2);

	if (d1!=(c3.substr(0,1))){
		error = "el campo "+campo+" tiene el primer digito de control del CCC inválido\n"
		return error;
	}

	if (d2!=(c3.substr(1,1))){
		error = "el campo "+campo+" tiene el segundo digito de control del CCC inválido\n"
		return error;
	}

	return error;
}

//comprueba si es un NIF bien formado
//modificado el 6-10-2008 para la nueva normativa
function esNIF(campo,cadena){
	var valor;
	var indice;
	var tabla;
	var cadena2;
	var letra;
	var esperado,actual;
	var error = "";
	
	var primeraLetra = cogeLetra(cadena,0);
	//para el caso de NIEs que empiecen por X,Y o Z es lo mismo que un NIF que empieza por 0,1 o 2 respectivamente
	if (primeraLetra == "X") cadena = "0"+cadena.substr(1);
	if (primeraLetra == "Y") cadena = "1"+cadena.substr(1);
	if (primeraLetra == "Z") cadena = "2"+cadena.substr(1);

	tabla = "TRWAGMYFPDXBNJZSQVHLCKET";
	       //TRWAGMYFPDXBNJZSQVHLCKET

	
	cadena2 = cadena.substr(0,8);
	letra=cogeLetra(cadena2,0);
	while (letra == '0')
		{
		cadena2 = cadena2.substr(1);
		letra=cogeLetra(cadena2,0);
		}

	valor = parseInt(cadena2);
	indice = (valor % 23);

	
	esperado = cogeLetra(tabla,indice);
	actual = cogeLetra(cadena,8);

	//alert('cadena:'+cadena+' cadena(0,8):'+cadena.substr(0,8)+' valor:'+valor+' indice:'+indice+' esperado:'+esperado+' actual:'+actual);
	if (esperado != actual)
		error = "Campo "+campo+" = "+valor+" el NIF es incorrecto, deberia acabar en "+esperado+"\n";
	
	return error;
}

//comprueba si es un CIF bien formado
//modificado el 6-10-2008 para la nueva normativa
function esCIF(campo,cadena){
	var primeraLetra;
	var ultimaLetra;
	var suma;
	var suma2;
	var act;
	var i;
	var tabla;
	var error = "";
	
	//compruebo que la primera letra sea del tipo aceptado
	primeraLetra = cogeLetra(cadena,0);
	ultimaLetra = cogeLetra(cadena,8);
	tabla = "ABCDEFGHJKLMNPQRSUVWXYZ";

	tablaEspecial = "CKLMNPQRSW";
	if (tabla.indexOf(primeraLetra)==-1) error = "la primera letra no es valida";
	else if ((primeraLetra == "X")||(primeraLetra == "Y")||(primeraLetra == "Z")){
		//para el caso de CIF que empiecen por X,Y o Z es lo mismo que un NIF que empieza por 0,1 o 2 Respectivamente
		error = error +esNIF(campo,cadena);
	} else {
		//para el resto de casos...realizo la suma de pares e impares y todo eso.
		suma = valorLetra(cadena,2)+valorLetra(cadena,4)+valorLetra(cadena,6);
		for(i=0
			;i<4;i++){
			act = valorLetra(cadena,2*i+1)*2;
			if (act>=10) act = act - 9;				//-10 +1
			suma = suma + act;
		}
		suma = 10 - (suma % 10);
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
		if (tablaEspecial.indexOf(primeraLetra)!=-1){
			//caso de organismos autonomos
			if (ultimaLetra!=String.fromCharCode(64+suma))
				error = error + "CIF incorrecto, deberia acabar en "+String.fromCharCode(64+suma);
		} else {
			//el resto de casos
			suma = suma % 10;
			//alert(ultimaLetra+" "+suma);
			if (ultimaLetra!=suma.toString())
				error = error + "CIF incorrecto, deberia acabar en "+suma;
		}
	}
	
	if (error!="") error = "Campo "+campo+" = "+cadena+", "+error+"\n";
	return error;
}

//devuelve una cadena de error
function compruebaCIFNIF(campo,valor){
	var error = "";
	
	//pasar a mayusculas y quitar los caracteres raros
	valor = valor.toUpperCase();
	
	//efren incorporando la validación de pasaportes
	//si las tres primeras letras son PAS no comprueba y admite meter un texto plano sin comprobación
	if (valor.substring(0,3) == "PAS") {
		return error;
	}
	
	//veo los casos mas basicos y desdoblo la funcion
	if (valor.length==9){
		if ((esNumero(valor,0))||(cogeLetra(valor,0)=="X")) error = error + esNIF(campo,valor);
		else error = error + esCIF(campo,valor);
	} else error = "El campo "+campo+" = "+valor+" debe contener 9 dígitos\n";

	return error;
}

//devuelve una cadena de error
function compruebaCIF(campo,valor){
	var error = "";
	
	//pasar a mayusculas y quitar los caracteres raros
	valor = valor.toUpperCase();
	
	//veo los casos mas basicos y desdoblo la funcion
	if (valor.length==9) error = error + esCIF(campo,valor);
	else error = "El campo "+campo+" = "+valor+" debe contener 9 dígitos\n";

	return error;
}

//devuelve una cadena de error
function compruebaNIF(campo,valor){
	var error = "";
	
	//pasar a mayusculas y quitar los caracteres raros
	valor = valor.toUpperCase();

	//veo los casos mas basicos y desdoblo la funcion
	if (valor.length==9) error = error + esNIF(campo,valor);
	else error = "El campo "+campo+" = "+valor+" debe contener 9 dígitos\n";

	return error;
}

//comprueba si una cadena de texto es un numero de la seguridad social valido
//comprueba si una cadena de texto es un numero de la seguridad social valido
function compruebaSS(campo,valor){
	var error = "";
	var limpio = "";
	var ch = '';
	var i,aa, bb, cc, num1, num2, num3, num4 ,modulo, intermedio, lenbb;
	//El numero de la seguridad social debe entrarse con este formato:
	//28/1234567/40
	//o bien:
	//28/12345678/40
	//En función de que se trate del numero de una empresa
	//o del numero de un trabajador.
	
	limpio="";
	for(i=0;i<valor.length;i++){
		ch = valor.charAt(i);
		if ((ch>='0')&&(ch<='9')) limpio = limpio+ch;
	}
	
	//Si no tiene 11 ó 12 digitos, no es válido
	var len = limpio.length;
	if ((len==11) || (len==12)) {
	//1=aa
	//2=bb
	//3=cc
	aa=limpio.substring(0,2);
	bb=limpio.substring(2,len-2);
	cc=limpio.substring(len-2,len);
	
	intermedio = "000000000000"+bb.toString();
	lenbb= bb.toString().length;

	num1 = aa + intermedio.substr(intermedio.length-8); //Cdbl(Cstr(Cdbl(aa))+Format(Cstr(Cdbl(bb)),"00000000"))
	num2 = aa + intermedio.substr(intermedio.length-7);//Cdbl(Cstr(Cdbl(aa))+Format(Cstr(Cdbl(bb)),"0000000"))
	num3 = aa + intermedio.substr(intermedio.length-6);//Cdbl(Cstr(Cdbl(aa))+Format(Cstr(Cdbl(bb)),"000000"))
	num4 = aa + intermedio.substr(intermedio.length-5);//Cdbl(Cstr(Cdbl(aa))+Format(Cstr(Cdbl(bb)),"00000"))

	if (intermedio.length-8 < lenbb) num1=cc + 1;
	if (intermedio.length-7 < lenbb) num2=cc + 1;
	if (intermedio.length-6 < lenbb) num3=cc + 1;
	if (intermedio.length-5 < lenbb) num4=cc + 1;

	
	if (((num1 % 97) != cc) &&  ((num2 % 97) != cc) && ((num3 % 97) != cc) &&  ((num4 % 97) != cc))                        
		error="El campo "+campo+" = "+valor+" no es un numero de la seguridad social valido";
	} else error="El campo "+campo+" = "+valor+" debe contener 11 o 12 digitos";
	return error;
}

//llama a una funcion en la pagina del usuario que trata la validacion
function compruebaValidacion(funcion,opcion,formato){
	if (modo_validacion_general=="completo") {
		//deberia comprobar si existe una funcion con ese nombre pero...ahi va eso.
		return eval(funcion+"()");
	} else return "";
}

//devuelve una cadena de error
function compruebaMultivaluado(campo,valor,formato){
	var str = "";
	var j = 0;
	var k=0;
	
	//quito los caracteres de la izquierda hasta el siguiente a los :
	while ((formato!="") && (formato.substr(0,1)!=":")) formato = formato.substr(1);
	formato = formato.substr(1);
	var sizeFormato = formato.length;
	var valores = "";
		
	while (k!=-1){
		k = formato.indexOf("#",j);	//separador usado para el formato multivaluado
		if (k!=-1){
			str = formato.substr(j,k-j);
			j=k+1;
		} else if (j<sizeFormato){
			str = formato.substr(j);
		}
		
		if (valor==str) return "";
		if (valores=="") valores = str;
		else valores = valores + ", "+str;
	}
	return "Campo "+campo+" = "+valor+", se esperaba: "+valores+"\n";
}

//comprueba una lista de valores segun su tipo
function compruebaListaCampos(campo,valor,formato){
	var error = "";
	var str = "";
	var sizeValor = valor.length;
	var j = 0;
	var k=0;
	var primeraLetraFormato = formato.substr(0,1);
	var restoFormato = formato.substr(1);	
	var indiceSeparadorLista = formato.indexOf('_',1);
	var etiquetaSeparadorLista = formato.substr(indiceSeparadorLista + 1);
	var separadorLista = String.fromCharCode(13,10);  //Retorno de carro y alimentación de línea por defecto como separador de listas.
	var formatoSinSeparadorLista = formato.substr(0,indiceSeparadorLista);	
	
	
	if (etiquetaSeparadorLista != -1){			
		switch (etiquetaSeparadorLista){
			case 'B' :			//Coma ","
				separadorLista = ",";				
				break;
			case 'C' :			//Coma ";"
				separadorLista = ";";
				break;
			case 'D' :			//Coma "|"
				separadorLista = "|";
				break;
			case 'E' :			//Coma "#"
				separadorLista = "#";
				break;
			case 'F' :			//Coma "~"
				separadorLista = "~";
				break;
			case 'A' :			
				separadorLista = String.fromCharCode(13,10);  //Retorno de carro y alimentación de línea por defecto como separador de listas.
				break;			
		}
	}
	
	//alert("indiceSeparadorLista = " + indiceSeparadorLista);
	//alert("etiquetaSeparadorLista = " + etiquetaSeparadorLista);
	//alert("separadorLista = " + separadorLista);
	//alert("formatoSinSeparadorLista = " + formatoSinSeparadorLista);
		
	while (k!=-1){
		k = valor.indexOf(separadorLista,j);
		if (k!=-1){
			str = valor.substr(j,k-j);
			j = k + separadorLista.length;
		} else if (j<sizeValor){
			str = valor.substr(j);
		}
		
		if (primeraLetraFormato=="") error = error;
		else if (primeraLetraFormato=="T") error = error;
		else if (primeraLetraFormato=="F") error = error + compruebaFecha(campo,str,formatoSinSeparadorLista);
		else if (primeraLetraFormato=="N") error = error + compruebaNumero(campo,str,formatoSinSeparadorLista);
		else if (formatoSinSeparadorLista=="EMAIL") error = error + compruebaEmail(campo,str,formatoSinSeparadorLista);
		else if (primeraLetraFormato=="E") error = error + compruebaMoneda(campo,str);
		else if (formatoSinSeparadorLista=="SS") error = error + compruebaSS(campo,str);
		else if (primeraLetraFormato=="C") {
			if (restoFormato=="N") error = error + compruebaNIF(campo,str);
			else if (restoFormato=="C") error = error + compruebaCIF(campo,str);
			else error = error + compruebaCIFNIF(campo,str);
		} else if (primeraLetraFormato=="M") error = error + compruebaMultivaluado(campo,str,restoFormato);
		else error = error + "Formato inválido: "+campo+" = "+valor+", formato="+formato+"\n";
	}
	return error;
}

function compruebaCampo(campo,valor,opcion,formato){
	var str = "";
	var primeraLetraFormato = formato.substr(0,1);
	var restoFormato = formato.substr(1);
	
//	alert("Comprueba "+campo+" = "+valor+" "+opcion+" "+formato);
	if (valor=="") {
		//si es opcional no comprueba nada
		if ((modo_validacion_general=="completo") &&
			((opcion=="O") || (opcion=="OL")))
			str = str + "Campo "+campo+": no puede ser vacío\n";
	} else {
		//dependiendo del formato llamo a una funcion u otra
		if (primeraLetraFormato=="") str = str;
		else if (primeraLetraFormato=="T") str = str;
		else if (primeraLetraFormato=="F") str = str + compruebaFecha(campo,valor,formato);
		else if (primeraLetraFormato=="N") str = str + compruebaNumero(campo,valor,formato);
		else if 		(formato=="EMAIL") str = str + compruebaEmail(campo,valor);
		else if (primeraLetraFormato=="E") str = str + compruebaMoneda(campo,valor);
		else if			  (formato=="CCC") str = str + compruebaCCC(campo,valor);
		else if			   (formato=="SS") str = str + compruebaSS(campo,valor);
		else if (primeraLetraFormato=="C") {
			if (restoFormato=="N") str = str + compruebaNIF(campo,valor);
			else if (restoFormato=="C") str = str + compruebaCIF(campo,valor);
			else str = str + compruebaCIFNIF(campo,valor);
		} else if (primeraLetraFormato=="M") str = str + compruebaMultivaluado(campo,valor,formato);
		else if (primeraLetraFormato=="L") str = str + compruebaListaCampos(campo,valor,restoFormato);
		else if (primeraLetraFormato=="H") str = str + compruebaHora(campo,valor);
		else if (primeraLetraFormato=="I") str = str + compruebaEntero(campo,valor,restoFormato);
		else str = str + "Formato inválido: "+campo+" = "+valor+", opcion="+opcion+" formato="+formato+"\n";
	}
	return str;
}

//devuelve true si hay error
//los parametros de entrada son tripletas de la forma: campo, opcion, formato
function compruebaCampos(){
	var args = compruebaCampos.arguments.length;
	var i;
	var campo,opcion,formato;
	var str = "";
	var obj;
	var valor;
	var error;
	for (i=0;i<args;i+=3){
		campo = compruebaCampos.arguments[i];
		opcion = compruebaCampos.arguments[i+1];
		formato = compruebaCampos.arguments[i+2];
		//AGM88X 10-10-2005: funcion especial de validacion. Formato V
		if (formato.substr(0,1)=="V"){
			str = str + compruebaValidacion(campo,opcion,formato);
		} else {
			//prosigo con el tratamiento normal de campos
			obj = document.all[campo];
			if (obj) {
				//determino el valor del objeto en sus diversas maneras
				if (obj.length){
					//AGM88X 28-4-2006: arreglo 'definitivamente' el valor para los select
					if (obj.selectedIndex!=null && obj.selectedIndex>=0) valor = obj.options[obj.selectedIndex].text;
					else{
						//el nombre esta repetido creo un string y recooro el array
						valor = "";
						for(j=0;j<obj.length;j++){
							//obtengo el valor de cada objeto individual
							var objAct = obj[j];
							var valorAct = "";
							if (objAct.selectedIndex!=null && objAct.selectedIndex>=0) valorAct = objAct.options[objAct.selectedIndex].text;
							else valorAct = objAct.value;

							//y lo inserto en el valor final separado por /n
							if (valor=="") valor = valorAct;
							else valor = valor + String.fromCharCode(13,10)+ valorAct;
						}
					}
				} else{
					if (obj.selectedIndex!=null && obj.selectedIndex>=0) valor = obj.options[obj.selectedIndex].text;
					else valor = obj.value;
				}
				str = str + compruebaCampo(campo,valor,opcion,formato);
			} else str = str + "Falta campo: "+campo+"\n "+formato;
		}
	}
	if (str!="") {
		alert("Errores en compruebaCampos:\n"+str);
		return true;
	} else return false;
}

//funcion usada cuando se dispone de los tres campos columna: campo, opcion,formato
function compruebaCamposExtendido(campos,opciones,formatos){
	var error = false;
	var parametros = "";

	//AGM88X 11-10-2005 Añado el nuevo formato de lista de campos con "~"
	if ((typeof campos=="object") && (campos[0])){
		//caso de la nueva implementacion en arrays
		var lc = campos;
		var lo = opciones;
		var lf = formatos;
		for (var i=0;i<lc.length;i++) {
			if (parametros!="") parametros = parametros+",";
			parametros = parametros+"'"+lc[i]+"','"+lo[i]+"','"+lf[i]+"'";
		}
		error = eval("compruebaCampos("+parametros+")");
		return error;
	} else {
		//resto de casos implementados en strings con dos separadores distintos
		if (campos.indexOf("~")>0){
			//caso de separador con ~
			var lc = campos.split("~");
			var lo = opciones.split("~");
			var lf = formatos.split("~");
			for (var i=0;i<lc.length;i++) {
				if (parametros!="") parametros = parametros+",";
				parametros = parametros+"'"+lc[i]+"','"+lo[i]+"','"+lf[i]+"'";
			}
	
			error = eval("compruebaCampos("+parametros+")");
			return error;
		} else {
			//sigo con la version antigua: separador con retorno de carro
			var str = "";
			var str2 = "";
			var str3 = "";
		
			var sizeCampos = campos.length;
			var sizeOpciones = opciones.length;
			var sizeFormatos = formatos.length;
	
			var j = 0;
			var k=0;
			var j2 = 0;
			var k2 = 0;
			var j3 = 0;
			var k3 = 0;

			while (k!=-1){
				k = campos.indexOf(String.fromCharCode(13,10),j);
				k2 = opciones.indexOf(String.fromCharCode(13,10),j2);
				k3 = formatos.indexOf(String.fromCharCode(13,10),j3);
				if (k!=-1){
					str = campos.substr(j,k-j);
					j=k+2;
				} else if (j<sizeCampos){
					str = campos.substr(j);
				}
		
				if (k2!=-1){
					str2 = opciones.substr(j2,k2-j2);
					j2=k2+2;
				} else if (j2<sizeOpciones){
					str2 = opciones.substr(j2);
				}
		
				if (k3!=-1){
					str3 = formatos.substr(j3,k3-j3);
					j3=k3+2;
				} else if (j3<sizeFormatos){
					str3 = formatos.substr(j3);
				}
		
				if (parametros=="") parametros = parametros+"'"+str+"','"+str2+"','"+str3+"'";
				else parametros = parametros+",'"+str+"','"+str2+"','"+str3+"'";
			}
	
			error = eval("compruebaCampos("+parametros+")");
			return error;
		}
	}
}

function compruebaCamposDocumento(){
	//modo_validacion_general ="completo";
	modo_validacion_general = (compruebaCamposDocumento.arguments.length>0)?compruebaCamposDocumento.arguments[0]:"completo";
	var error = false;
	var campos = document.ListaCampos;
	var opciones = document.ListaOpcionCampos;
	var formatos = document.ListaFormatoCampos;
	if (campos && opciones && formatos){
		error = compruebaCamposExtendido(campos,opciones,formatos);
	} //else alert("No existe campo opciones o formato.\nSe guardaran los datos sin chequeo!\nCampos="+campos+"\nopciones="+opciones+"\nFormatos="+formatos);
	return error;
}
function compruebaCamposDocumento2(){
	modo_validacion_general = (compruebaCamposDocumento2.arguments.length>0)?compruebaCamposDocumento2.arguments[0]:"completo";
	var error = false;
	var campos = document.ListaCampos;
	var opciones = document.ListaOpcionCampos;
	var formatos = document.ListaFormatoCampos;
	if (campos && opciones && formatos){
		error = compruebaCamposExtendido(campos,opciones,formatos);
	} //else alert("No existe campo opciones o formato.\nSe guardaran los datos sin chequeo!\nCampos="+campos+"\nopciones="+opciones+"\nFormatos="+formatos);
	return error;
}

