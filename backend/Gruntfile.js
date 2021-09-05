module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'index.js',
        dest: 'index.min.js'
      }
    }, // Uglify ends
    watch: {
      scripts: {
        files: ['index.js', 'index.html', 'gruntfile.js'],
        tasks: ['uglify', 'sass', 'jshint'],
        options: {
          spawn: false,
        },
      },
    },
    // watch ends

    // css lint finishes
    jshint: {
      all: ['Gruntfile.js', 'index.js']
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
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-htmllint');


  // Default task(s).
  grunt.registerTask('default', ['watch', 'htmllint']);
  grunt.registerTask('prod', ['uglify']);
  grunt.registerTask('jslint', ['jshint']);

};
