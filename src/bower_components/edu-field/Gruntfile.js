'use strict';
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		componentConfig: {
			hostname: 'localhost', // change to 0.0.0.0 to listen on all connections
			base: 'src',
			port: 4000,
			livereloadport: 35701
		},
		connect: {
			dev: {
				options: {
					hostname: '<%= componentConfig.hostname %>',
					port: '<%= componentConfig.port %>',
					base: '<%= componentConfig.base %>',
					livereload: '<%= componentConfig.livereloadport %>'
				}
			}
		},
		'gh-pages': {
			options: {
				base: '<%= componentConfig.base %>'
			},
			src: ['**']
		},
		clean: {
			build: ['.tmp/**/*', 'dist/**/*']
		},
		copy: {
			build: {
				files: [
					{
						expand: true,
						cwd: '<%= componentConfig.base %>/',
						src: ['js/*.*','directives/*.*', 'modules/*.*', 'css/*.*', '!.jshintrc'],
						dest: '.tmp/'
					}
				]
			},
			deploy: {
				files: [{
					expand: true,
					cwd: '.tmp',
					src: ['<%=pkg.name %>.js', '<%=pkg.name %>.min.js', '<%=pkg.name %>.min.map','<%=pkg.name %>.css', '<%=pkg.name %>.min.css'],
					dest: 'dist/'
				}]
			}
		},
		concat: {
			build: {
				// specifing files so that they are added in this order
				options: {
					banner:'/*\n'+
						   ' <%=pkg.name %> v<%=pkg.version%>\n'+
						   ' (c) Educarm, http://www.educarm.es\n'+
						   ' License: MIT\n'+
						   '*/\n'
				},
				src: ['.tmp/modules/*.js', '.tmp/directives/*.js', '.tmp/*.js', '.tmp/js/*.js'],
				dest: '.tmp/<%=pkg.name %>.js'
			}
		},
		uglify: {
			 build: {
			    options: {
					banner:'/*\n'+
						   ' <%=pkg.name %> v<%=pkg.version%>\n'+
						   ' (c) Educarm, http://www.educarm.es\n'+
						   ' License: MIT\n'+
						   '*/\n',
				    mangle: true,
				    sourceMap: true
				},
				src: '.tmp/<%=pkg.name %>.js',
				dest: '.tmp/<%=pkg.name %>.min.js'
			}
		},
		cssmin: {
		  combine: {
			files: {
			  '.tmp/<%=pkg.name %>.css': ['.tmp/css/*.css']
			}
		  },minify: {
			expand: true,
			cwd:'.tmp/',
			src: '<%=pkg.name %>.css',
			dest: '.tmp/',
			ext: '.min.css'
		  }
		},
		ngtemplates: {
			build: {
				cwd: '.tmp/',
				src: [
					'**/*.html'
				],
				dest: '.tmp/<%=pkg.name %>-templates.js',
				options: {
					module: '<%=pkg.name %>.tpl',
					htmlmin: {
						collapseBooleanAttributes: true,
						collapseWhitespace: true,
						removeAttributeQuotes: true,
						removeComments: true, // Only if you don't use comment directives!
						removeEmptyAttributes: true,
						removeRedundantAttributes: true,
						removeScriptTypeAttributes: true,
						removeStyleLinkTypeAttributes: true
					}
				}
			}
		},
		ngmin: {
			build: {
				src: '.tmp/<%=pkg.name %>.js',
				dest: '.tmp/<%=pkg.name %>.js'
			}
		},
		watch: {
			livereload: {
				files: ['<%= componentConfig.base %>/**/*.{js,html}'],
				options: {
					livereload: '<%= componentConfig.livereloadport %>'
				}
			}
		}

	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-gh-pages');
	grunt.loadNpmTasks('grunt-angular-templates');
	grunt.loadNpmTasks('grunt-ngmin');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('publish', [
		'gh-pages'
	]);

	grunt.registerTask('dev', [
		'connect:dev',
		'watch'
	]);

	grunt.registerTask('build', [
		'clean:build',
		'copy:build',
		'ngtemplates:build',
		'concat:build',
		'ngmin:build',
		'uglify:build',
		'cssmin',
		'copy:deploy'
	]);
};