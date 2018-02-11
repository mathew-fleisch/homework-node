'use strict'
/**
 * @author   Mathew Fleisch [mathew.fleisch@gmail.com]
 * @created  2018.02.11
 * @abstract
 *    Download node packages from npm's "most depended-upon packages" list. By
 *    default, the top 10 packages will be downloaded, but that number can be
 *    adjusted with a 'COUNT' variable, at run time. If the 'COUNT' is larger
 *    than the number of packages on each page, the package names are aggregated
 *    before they are downloaded.
 *
 */


const download_package_tarball = require('download-package-tarball')
const package_json = require('package-json')
const request = require('request')
const cheerio = require('cheerio')
const async = require('async')


// Entry point url to scrape
const PACKAGE_URL = process.env.PACKAGE_URL || 'https://www.npmjs.com/browse/depended?offset='
// Where the packages will be downloaded to
const TARGET_DIRECTORY = process.env.TARGET_DIRECTORY || './packages'
// Number of concurrent requests for each async operation
const ASYNC_LIMIT = process.env.ASYNC_LIMIT || 10
// npm url fails with more than one request at a time (recommend not changing)
const SCRAPE_LIMIT = process.env.SCRAPE_LIMIT || 1
// Debug levels: 0->off, 1->info, 2->debug
const DEBUG = process.env.DEBUG || 0


module.exports = downloadPackages

/**
 * This function will first grab the tarball url and then download it,
 * to TARGET_DIRECTORY, based on a package name.
 * @param  {array}    packages - list of package names
 * @param  {Function} callback - Callback function
 * @return {none}
 */
function getPackages(packages, callback) {
    if(DEBUG) console.log('Packages to Download: '+packages.length)

    let package_info = []

    async.mapLimit(packages, ASYNC_LIMIT, (pack, cb) => {
        package_json(pack).then(json => {
            if(DEBUG > 1) console.log('get_metadata('+json['name']+')')

            package_info.push({
                'name':json['name'],
                'version':json['version'],
                'url':json['dist']['tarball']
            })
            cb()
        })
    }, (error) => {
        if(error) return callback(error)

        if(DEBUG > 1) console.log('Package Info: ',package_info)

        let download_count = 0
        async.mapLimit(package_info, ASYNC_LIMIT, (pack, cb) => {
            download_package_tarball({
                url: pack['url'],
                dir: TARGET_DIRECTORY
            }).then(() => {
                download_count++
                console.log('Package Downloaded['+download_count+']: '+pack['name']
                    +' ('+pack['version']+')'
                )
                cb()
            }).catch(err => {
              console.log('The file could not be downloaded properly',err)
              return cb(err)
            })
        }, (err) => {
            if(err) return cb(err)

            return callback()
        })
    })
}


/**
 * This function will scrape the contents of the url and return array of package names
 * @param  {string}        url - Site to scrape for package names
 * @param  {Function} callback - Callback function
 * @return {array}       array - List of package names, scraped from site
 */
function parsePackagePage(url, callback) {
    request(url, (error, response, html) => {
        if(error) return callback(error)

        const packages = []
        const $ = cheerio.load(html)
        // Loop over each package url by class-name
        $('.name').each((index, obj) => {
            if(DEBUG > 1) console.log('parsing['+index+']: '+obj.children[0].data)

            // Save each package in local array
            packages.push(obj.children[0].data)
        })

        if(packages && packages.length > 0) {
            return callback(null, packages)
        } else {
            // TODO: Limit retries
            console.log('Page failed... Try again ['+url+']')
            parsePackagePage(url, callback)
        }
    })
}

/**
 * This function is the entry point for this application. It will first pull
 * down the package names, in the order listed in PACKAGE_URL. If the 'count'
 * variable is less than the number of packages on the first page (page_size),
 * the list is truncated, and the packages are downloaded. Other wise, the
 * package name list is expanded by requesting additional pages and once the
 * list of package names is larger than count, the list is truncated to 'count',
 * and the packages are downloaded.
 * @param  {int}         count - Number of packages to download
 * @param  {Function} callback - Callback function
 * @return {callback}
 * Note: I had to set the number-of-requests-at-one-time to 1 because npm's
 *       site would randomly give me a page with no data.
 */
function downloadPackages (count, callback) {
    if(DEBUG > 1) console.log('downloadPackages('+count+',callback)')

    let paged_url = PACKAGE_URL
    let page_offset = 1

    // Get the first page to get the number of packages shown, per page
    parsePackagePage(PACKAGE_URL, (error, packages) => {
        if(error) return callback(error)

        // Set the number of packages per page
        const page_size = packages.length
        if(DEBUG) console.log('packages per page: '+page_size)

        // If the requested number of packages is larger than the page size, grab the rest
        if(count < page_size) {
            // Multiple page requests not needed. Get packages
            if(DEBUG) console.log('count:'+count+' < page_size:'+page_size+'  -> No pagination required')
            packages = packages.slice(0, count)

            return getPackages(packages, (error) => {
                if(error) return callback(error)

                return callback()
            })
        } else {
            if(DEBUG) console.log('count:'+count+' > page_size:'+page_size+'  -> Pagination required')

            // Get the number of pages (-1 because the first page is already in memory)
            page_offset = Math.ceil(count / page_size) - 1
            if(DEBUG) console.log('page_offset => round-up(count:'+count+' / page_size:'+page_size+' -> '+(count / page_size).toFixed(2)+') - 1 = '+page_offset)

            // Build array of urls to grab
            let urls = []
            for(let page = 1; page <= page_offset; page++) {
                let offset = (page * page_size)
                if(DEBUG) console.log('Current offset => (page:'+page+' * page_size:'+page_size+') = '+offset)

                let url = PACKAGE_URL+offset
                urls.push(url)
            }

            // Get each page in array
            async.mapLimit(urls, SCRAPE_LIMIT, (url, cb) => {
                if(DEBUG) console.log('url: '+url)
                parsePackagePage(url, (error, more_packages) => {
                    if(error) return cb(error)

                    packages = packages.concat(more_packages)
                    cb()
                })
            }, (error) => {
                if(error) return callback(error)

                packages = packages.slice(0, count)
                return getPackages(packages, (error) => {
                    if(error) return callback(error)

                    return callback()
                })
            })
        }
    })
}

