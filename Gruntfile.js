// Generated on 2014-04-24 using generator-angular 0.8.0
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function(grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            js: {
                files: ['./*.js'],
                tasks: ['jshint:all'],
                options: {
                    livereload: 35730 //true
                }
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '*.js'
            ]
        }
    });

    grunt.registerTask('default',  function(){
        return grunt.task.run(['lint']);
    });

    grunt.registerTask('lint', [
        'watch',
        'newer:jshint:all'
        ]
    );
};
