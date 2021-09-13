module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        files: {
          'js/myprofile.min.js' : ['js/myprofile.js'],
          'js/login-reg.min.js' : ['js/login-reg.js'],
          'js/index.min.js' : ['js/index.js']
        }
      }
    }, // Uglify ends
    sass: { // Task
      dist: { // Target
        options: { // Target options
          style: 'expanded'
        },
        files: { // Dictionary of files
          'css/style.css': 'sass/style.scss', // 'destination': 'source'
        }
      }
    }, // Sass ends
    watch: {
      scripts: {
        files: ['js/index.js','js/login-reg.js', 'js/myprofile.js', 'sass/style.scss', 'index.html'],
        tasks: ['uglify', 'sass', 'jshint'],
        options: {
          spawn: false,
        },
      },
    },
    // watch ends
    csslint: {
      strict: {
        options: {
          import: 2
        },
        src: ['css/style.css']
      },
      lax: {
        options: {
          import: false
        },
        src: ['css/style.css']
      }
    },
    // css lint finishes
    jshint: {
      all: ['Gruntfile.js', 'js/index.js', 'js/myprofile.js', 'js/login-reg.js'],
      options: {
        esversion: 6
      }
    },
    htmllint: {
      options: {},
      src: [
        'index.html'
      ],
    },
    // html lint finishes
  }); // init Config Ends

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-htmllint');


  // Default task(s).
  grunt.registerTask('default', ['sass', 'watch', 'htmllint']);
  grunt.registerTask('prod', ['uglify']);
  grunt.registerTask('cssvalidate', ['csslint', 'jshint']);
  grunt.registerTask('jslint', ['jshint']);

};
