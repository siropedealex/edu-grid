#edu-grid
##Introducci&oacute;n
edu-grid es un grid de datos desarrollado en [AngularJS](http://angularjs.org/) que permite la creación de grid.



##Dependencias
edu-form est&aacute; construido utilizando varias librer&iacute;as javascript:
    
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

    <style href="edu-grid.css"></style>
    
    <script src="edu-grid.js"></script>
####options
Como se ha escrito previamente, uno de los objetivos de edu-grid es permitir el uso del componente sin tener que desarrollar
ning&uacute;n tipo de c&oacute;digo javascript, el uso m&aacute;s simple posible ser&aacute; utilizar el tag html <div edu-grid /> junto con las opciones
donde parametrizaremos el componente.

    <div edu-grid options={ ....} />

####edu-grid options
Lo ideal es indicar los parámetros utilizando para ello el atributo options que contendr&aacute; un objeto json con la lista de propiedades necesarias para la correcta configuración del componente:
....
....
....
....



      
##Desarrollo
```bash
# Clone this repo (or your fork).
git clone https://github.com/educarm/edu-grid.git
cd edu-grid

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
[edu-grid demo](https://raw.githack.com/educarm/edu-grid/master/src/demo-dev.html)
