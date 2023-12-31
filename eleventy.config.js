const eleventyImg = require("@11ty/eleventy-img");
const eleventyNavigation = require("@11ty/eleventy-navigation");
const yaml = require("js-yaml");
const { parse } = require('csv-parse/sync');
const { EleventyRenderPlugin } = require("@11ty/eleventy");
const generateSVG = require('./svg.js')

function imageShortcode(src, alt = '', cls = '', sizes = [], widths = [300, 600]) {
    let file = "./content/assets/img/" + src
	let options = { widths: widths, formats: ['auto'], outputDir: "./_site/img/", };
	eleventyImg(file, options);

	let imageAttributes = { class: cls, alt, sizes, loading: "lazy", decoding: "async", };
	let metadata = eleventyImg.statsSync(file, options);
	return eleventyImg.generateHTML(metadata, imageAttributes);
}

module.exports = function(eleventyConfig) {
    eleventyConfig.addPlugin(eleventyNavigation);
    eleventyConfig.addPlugin(EleventyRenderPlugin);
    eleventyConfig.addShortcode("svg", generateSVG);
    eleventyConfig.addShortcode("renderVariable", async function (template, data) {
        const { renderTemplate } = eleventyConfig.javascriptFunctions;
        return await renderTemplate(template, 'njk', data );
    });
    eleventyConfig.addNunjucksShortcode("image", imageShortcode);
    // eleventyConfig.addGlobalData("courses", () => {console.log()})
    eleventyConfig.addCollection("courses", function(collectionApi) {
       return collectionApi.getFilteredByGlob('./content/courses.njk'); 
    });
    eleventyConfig.addNunjucksFilter("filterCourses", function(collection, filter) {
        if (filter) {
            const regex = new RegExp(filter);
            return collection.filter(course => regex.test(course.data.item.Code))
        }
        return collection;
    });
    eleventyConfig.addCollection("partners", function(collectionApi) {
        return collectionApi.getFilteredByGlob('./content/partners.njk'); 
    });
    eleventyConfig.addNunjucksFilter("getPartner", function(collection, key) {   
        return collection.find(partner => partner.data.item.key == key)
    });    
    eleventyConfig.addDataExtension("yaml", contents => yaml.load(contents));
    eleventyConfig.addDataExtension("csv", contents => parse(contents, { columns: true, skip_empty_lines: true }));

    return {
        dir: {
			input: "./content",          
			includes: "../_includes", 
            layouts: "../_layouts",
			data: "../_data",
			output: "./_site",
		},
        markdownTemplateEngine: "njk",
	}
}
