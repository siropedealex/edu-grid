#edu-field
##Introducci&oacute;n
edu-fiel es un input de datos desarrollado en [AngularJS](http://angularjs.org/) que permite la creación de inputs para form.



##Dependencias
edu-grid est&aacute; construido utilizando varias librer&iacute;as javascript:
    
- [AngularJS](http://angularjs.org/)
Framework utilizado para desarrollar el componente.
- [Bootstrap](http://getbootstrap.com/)
Framework en el que se basa el aspecto del grid.
- [Angular-resource](https://docs.angularjs.org/api/ngResource)
Una factoria que crea un recurso que permite interactuar con fuentes de datos RESTful.
- [jQuery](http://jquery.com/)
Dependencia de Bootstrap
- [Angular-sanitize](https://docs.angularjs.org/api/ngSanitize)
Módulo que provee las funcionalidades para sanitize HTML.

***

##Utilizaci&oacute;n
####Importar el c&oacute;digo
Lo primero que hay que hacer es importar en la p&aacute;gina los ficheros javascript forman el componente

    <style href="edu-field.js"></style>
    
    <script src="edu-field.js"></script>
####options
Como se ha escrito previamente, uno de los objetivos de edu-field es permitir el uso del componente sin tener que desarrollar
ning&uacute;n tipo de c&oacute;digo javascript, el uso m&aacute;s simple posible ser&aacute; utilizar el tag html <div edu-field /> junto con las opciones
donde parametrizaremos el componente.

    <div edu-field options={ ....} />

####edu-field options
Lo ideal es indicar los parámetros utilizando para ello el atributo options que contendr&aacute; un objeto json con la lista de propiedades necesarias para la correcta configuración del componente:

First Header | Second Header
------------ | -------------
Content from cell 1 | Content from cell 2
Content in the first column | Content in the second column


      
##Desarrollo
```bash
# Clone this repo (or your fork).
git clone https://github.com/educarm/edu-field.git
cd edu-field

# Install all the dev dependencies
$ npm install
# Install bower components
$ bower install

# run the local server and the file watcher
$ grunt dev
```
##Distribución
```bash
# Build component
$ grunt build
```
##Demo
[edu-field demo](https://raw.githack.com/educarm/edu-field/master/src/demo-dev.html)
