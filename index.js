'use strict'


const packageJson = require('package-json')
const request = require('request')
const cheerio = require('cheerio')
const async = require('async')

const PACKAGE_URL = process.env.PACKAGE_URL || 'https://www.npmjs.com/browse/depended?offset='
const DEBUG = process.env.DEBUG || false;


// packageJson('lodash').then(json => {
//     console.log(json)
//     //=> {name: 'ava', ...}
// })



 // console.log(process.env)


module.exports = downloadPackages

// Placeholder (todo: get package tar)
function getPackages(packages, callback) {
    if(DEBUG) {
        console.log('Total: '+packages.length)
        for (var i = 0; i < packages.length; i++) { console.log(i+': '+packages[i]) }
    }
}


function parsePackagePage(url, callback) {
    request(url, (error, response, html) => {
        if(error) return callback(error)

        const packages = []
        const $ = cheerio.load(html)

        $('.name').each((index, obj) => {
            const package_name = obj.attribs.href.replace(/\/package\//, '')

            // if(DEBUG) console.log('[parsing]'+index+': '+package_name)

            packages.push(package_name);
        })

        if(packages && packages.length > 0) {
            if(DEBUG) console.log('packages on this page: '+packages.length)
            return callback(null, packages)
        }

        callback(new Error('No packages found on this page: '+url))
    })
}

function downloadPackages (count, callback) {
    if(DEBUG) console.log('downloadPackages('+count+',callback)')

    let paged_url = PACKAGE_URL
    let page_offset = 1

    // Get the first page to get the number of packages shown, per page
    parsePackagePage(PACKAGE_URL, (error, packages) => {
        if(error) return callback(error)

        // Set the number of packages per page
        const page_size = packages.length
        if(DEBUG) console.log('package count: '+page_size)

        // If the requested number of packages is larger than the page size, grab the rest
        if(count < page_size) {
            // Multiple page requests not needed. Get packages
            if(DEBUG) console.log('count:'+count+' is less than page_size:'+page_size)
            packages = packages.slice(0, count)
            getPackages(packages);
        } else {
            if(DEBUG) console.log('count:'+count+' is greater than page_size:'+page_size)

            // Get the number of pages (-1 because the first page is already in memory)
            page_offset = Math.ceil(count / page_size) - 1
            if(DEBUG) console.log('page_offset => Math.ceil(count:'+count+' / page_size:'+page_size+') - 1 = '+page_offset)

            // Build array of urls to grab
            let urls = []
            for(let page = 1; page <= page_offset; page++) {
                let offset = (page * page_size)
                if(DEBUG) console.log('offset => (page:'+page+' * page_size:'+page_size+') = '+offset)

                let url = PACKAGE_URL+offset
                urls.push(url)
            }

            // Get each page in array
            async.map(urls, function(url, cb) {
                if(DEBUG) console.log('url: '+url);
                parsePackagePage(url, (error, more_packages) => {
                    if(error) return cb(error)

                    console.log("async: "+url)
                    packages = packages.concat(more_packages)
                    cb()
                })
            }, (error) => {
                if(error) return callback(error)

                packages = packages.slice(0, count)
                getPackages(packages);
            })
        }


        if(callback) callback()
    })
}

