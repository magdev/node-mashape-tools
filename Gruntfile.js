'use strict';

module.exports = function(grunt) {
	// Show elapsed time at the end
	require('time-grunt')(grunt);
	// Load all grunt tasks
	require('load-grunt-tasks')(grunt);

	// Project configuration.
	grunt.initConfig({
		jshint : {
			options : {
				jshintrc : '.jshintrc',
				reporter : require('jshint-stylish')
			},
			gruntfile : {
				src : 'Gruntfile.js'
			},
			lib : {
				src : [ 'lib/**/*.js' ]
			}
		},
		watch : {
			gruntfile : {
				files : '<%= jshint.gruntfile.src %>',
				tasks : [ 'jshint:gruntfile' ]
			},
			lib : {
				files : '<%= jshint.lib.src %>',
				tasks : [ 'jshint:lib' ]
			}
		},
        simplemocha: {
            options: {
                globals: ['expect'],
                timeout: 3000,
                ignoreLeaks: false,
                ui: 'bdd',
                reporter: 'tap'
            },
            all: { src: ['test/*_test.js'] }
        }
	});
	
    grunt.loadNpmTasks('grunt-simple-mocha');

	// Default task.
	grunt.registerTask('default', [ 'jshint', 'simplemocha' ]);
};
