'use strict';

const multipipe = require('multipipe');
const svgicons2svgfont = require('gulp-svgicons2svgfont');
const filter = require('streamfilter');
const spawn = require('gulp-spawn');
const svg2ttf = require('gulp-svg2ttf');
const ttf2eot = require('gulp-ttf2eot');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');

function gulpFontIcon(options = {}) {
  options.formats = options.formats || ['ttf', 'eot', 'woff'];
  options.clone = options.formats.includes('svg');
  options.timestamp = options.timestamp || Math.round(Date.now() / 1000);

  // Generating SVG font and saving her
  const svgicons2svgfontStream = svgicons2svgfont(options);

  // Generating TTF font and saving it
  const createAutohintStream = () => {
    const hintPath = typeof options.autohint === 'string' ? options.autohint : 'ttfautohint';

    // Filter to pass only TTF files for autohinting
    const nonTTFfilter = filter((file, unused, cb) => {
      cb(file.path.endsWith('.ttf') === false);
    }, {
      objectMode: true,
      restore: true,
      passthrough: true,
    });

    return multipipe(
      nonTTFfilter,
      spawn({
        cmd: '/bin/sh',
        args: [
          '-c',
          `cat | "${hintPath}" --symbol --fallback-script=latn` +
          ' --windows-compatibility --no-info /dev/stdin /dev/stdout | cat',
        ],
      }),
      nonTTFfilter.restore
    );
  };

  const result = multipipe([
    svgicons2svgfontStream,
    svg2ttf(options),
    // Apply autohinting if specified
    options.autohint && createAutohintStream(),
    // Convert TTF to EOT if specified
    options.formats.includes('eot') && ttf2eot({ clone: true }),
    // Convert TTF to WOFF if specified
    options.formats.includes('woff') && ttf2woff({ clone: true }),
    // Convert TTF to WOFF2 if specified
    options.formats.includes('woff2') && ttf2woff2({ clone: true }),
    // Filter out TTF files if not needed
    !options.formats.includes('ttf') && filter((file, unused, cb) => {
      cb(file.path.endsWith('.ttf'));
    }, {
      objectMode: true,
      passthrough: true,
    }),
  ].filter(Boolean));

  // Re-emit codepoint mapping event
  svgicons2svgfontStream.on('glyphs', (glyphs) => {
    result.emit('glyphs', glyphs, options);
  });

  return result;
}

module.exports = gulpFontIcon;
