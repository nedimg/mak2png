const spritezero = require('@mapbox/spritezero');
const fs = require('fs');
const fsExtra = require('fs-extra');
const glob = require('glob');
const path = require('path');
const mkdirp = require('mkdirp');

const makiSourceFolder = 'svgs_with_stroke';
const PIXEL_RATIOS = [1, 2];

// do some preprocessing of maki svgs. Pick wanted icons from `svgs` folder
// and rename and put into `input` folder
[
    { maki: 'building-15', dingo: 'building' },
    { maki: 'hospital-15', dingo: 'hospital' },
    { maki: 'rail-15', dingo: 'train' },
    { maki: 'airport-15', dingo: 'airplane' },
    { maki: 'cemetery-15', dingo: 'cemetery' },
    { maki: 'museum-15', dingo: 'museum' },
    { maki: 'park-alt1-15', dingo: 'forest' },
    { maki: 'school-15', dingo: 'school' },
    { maki: 'small-city-15', dingo: 'small_city' },
    { maki: 'medium-city-15', dingo: 'medium_city' },
    { maki: 'capital-city-15', dingo: 'capital_city' },
    { maki: 'major-city-15', dingo: 'major_city' },
].forEach(function(makiIcon) {
    const makiIconPath = path.resolve(path.join(__dirname, `${makiSourceFolder}/${makiIcon.maki}.svg`));
    const mappedPath = path.resolve(path.join(__dirname, `input/${makiIcon.dingo}.svg`));
    fsExtra.copySync(makiIconPath, mappedPath)
});

var svgs = glob
    .sync(path.resolve(path.join(__dirname, 'input/*.svg')))
    .map(function(f) {
        return {
            svg: fs.readFileSync(f),
            id: path.basename(f).replace('.svg', '')
        };
    });

// for each pixel ratio, generate json and png
PIXEL_RATIOS.forEach(function(pxRatio) {
    var pxRatioSuffix = pxRatio > 1 ? `@${pxRatio}x` : '';
    var pngPath = path.resolve(path.join(__dirname, `output/sprite${pxRatioSuffix}.png`));
    var jsonPath = path.resolve(path.join(__dirname, `output/sprite${pxRatioSuffix}.json`));

    const generate = function() {
        // Pass `true` in the layout parameter to generate a data layout
        // suitable for exporting to a JSON sprite manifest file.
        spritezero.generateLayout({ imgs: svgs, pixelRatio: pxRatio, format: true }, function(err, dataLayout) {
            if (err) return;
                fs.writeFileSync(jsonPath, JSON.stringify(dataLayout));
            });
        
        // Pass `false` in the layout parameter to generate an image layout
        // suitable for exporting to a PNG sprite image file.
        spritezero.generateLayout({ imgs: svgs, pixelRatio: pxRatio, format: false }, function(err, imageLayout) {
            spritezero.generateImage(imageLayout, function(err, image) {
                if (err) return;
                fs.writeFileSync(pngPath, image);
            });
        });
    }
    
    if (fs.existsSync(path.dirname(jsonPath))) {
        generate();
    } else {
        mkdirp(path.dirname(jsonPath), function (err) {
            if (err) console.error(err)
            else generate();
        });
    }
});
