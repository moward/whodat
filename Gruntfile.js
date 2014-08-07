module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    eslint: {
      src: ['Gruntfile.js', '*.js', 'public/scripts/*.js']
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-eslint');

  // Default task(s).
  grunt.registerTask('default', ['eslint']);

};
