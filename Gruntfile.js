
module.exports = function (grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    watch: {
      source: {
        files: ['background-check.js'],
        tasks: ['clean:source', 'jshint', 'uglify', 'copy']
      },

      examples: {
        files: ['examples/src/*/*.*'],
        tasks: ['clean:examples', 'assemble']
      },

      examplesJS: {
        files: ['examples/build/scripts/*.js', '!examples/build/scripts/*.min.js'],
        tasks: ['jshint']
      }
    },

    assemble: {
      options: {
        flatten: true,
        data: 'examples/src/data/*.json',
        layout: 'examples/src/layouts/default.hbs',
        partials: ['examples/src/partials/*.hbs']
      },
      build: {
        files: [{
          src: ['examples/src/pages/*.hbs'],
          dest: 'examples/build/'
        }]
      }
    },

    jshint: {
      files: ['background-check.js', 'examples/build/scripts/*.js', '!examples/build/scripts/*.min.js'],
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
      source: ['background-check.min.js', 'examples/build/scripts/background-check.min.js'],
      examples: ['examples/build/*.html']
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
        dest: 'examples/build/scripts/background-check.min.js'
      }
    }

  });

  grunt.loadNpmTasks('assemble');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['watch']);

};
