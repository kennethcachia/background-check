
module.exports = function (grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    watch: {
      source: {
        files: ['background-check.js'],
        tasks: ['clean', 'jshint', 'uglify', 'copy']
      },
      examples: {
        files: ['examples/*.js', '!examples/*.min.js'],
        tasks: ['jshint']
      }
    },

    jshint: {
      files: ['background-check.js', 'examples/*.js', '!examples/*.min.js'],
      options: {
        'white': true,
        'indent': 2,
        'curly': true,
        'eqnull': true,
        'latedef': true,
        'newcap': true,
        'noarg': true,
        'eqeqeq': true,
        'immed': true,
        'undef': true,
        'unused': true,
        'browser': true,
        'globals': {
          'console': false,
          'define': false,
          'require': false
        }
      }
    },

    clean: {
      all: ['background-check.min.js', 'examples/background-check.min.js']
    },

    uglify: {
      options: {
        banner: '/* BackgroundCheck\n   <%= pkg.homepage %>\n   v<%=pkg.version %> */\n\n'
      },
      build: {
        src: 'background-check.js',
        dest: 'background-check.min.js'
      }
    },

    copy: {
      min: {
        src: 'background-check.min.js',
        dest: 'examples/background-check.min.js'
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['watch']);

};
