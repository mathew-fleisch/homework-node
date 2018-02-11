# Programming Challenge

This [challenge](challenge.md) required creating a node application that would download the top 10+ packages from npm's ["most depended-upon packages"](https://www.npmjs.com/browse/depended?offset=) page. I used [async](https://www.npmjs.com/package/async), [request](https://www.npmjs.com/package/request), and [cheerio](https://www.npmjs.com/package/cheerio) to scrape the package names from the npm site's html. Each package is then downloaded to a target directory using [package-json](https://www.npmjs.com/package/package-json) to get meta-data, and [download-package-tarball](https://www.npmjs.com/package/download-package-tarball) to download the package itself. As far as I can tell, there is not a public api/service to get the packages in that specific order, so I had to scrape the html, to get that information. Unfortunately, the npm site itself would also randomly return no results; I throttled down the number of concurrent requests, and also built in a mechanism to rerun failed requests for that operation. 

## Dependencies

 - [async](https://www.npmjs.com/package/async)
 - [request](https://www.npmjs.com/package/request)
 - [cheerio](https://www.npmjs.com/package/cheerio)
 - [package-json](https://www.npmjs.com/package/package-json)
 - [download-package-tarball](https://www.npmjs.com/package/download-package-tarball)
 - Existance of page: ["most depended-upon packages"](https://www.npmjs.com/browse/depended?offset=)

## Configuration

	ASYNC_LIMIT      -> Number of concurrent requests for each async operation (default:10)
	COUNT            -> Number of packages to download (default:10)
	DEBUG            -> Debug levels: 0->off, 1->info, 2->debug (default:0)
	PACKAGE_URL      -> Entry point url, to scrape (default: https://www.npmjs.com/browse/depended?offset=)
	SCRAPE_LIMIT     -> npm url fails with more than one request at a time (default: 1)
	TARGET_DIRECTORY -> Where the packages will be downloaded to (default: ./packages)

## Usage

	# Standard usage (default count: 10)

	$ npm test

	> @ test /app
	> node test.js

	TAP version 13
	# download
	Expecting: 10
	Package Downloaded[1]: chalk (2.3.1)
	Package Downloaded[2]: commander (2.14.1)
	Package Downloaded[3]: debug (3.1.0)
	Package Downloaded[4]: react (16.2.0)
	Package Downloaded[5]: request (2.83.0)
	Package Downloaded[6]: express (4.16.2)
	Package Downloaded[7]: bluebird (3.5.1)
	Package Downloaded[8]: async (2.6.0)
	Package Downloaded[9]: moment (2.20.1)
	Package Downloaded[10]: lodash (4.17.5)
	ok 1 has 10 files
	ok 2 min 5k per package
	ok 3 _.map exists

	1..3
	# tests 3
	# pass  3

	# ok






	# ------------------------------------------- #







	# Setting configuration variables to increase count to 55 and set debug level to 1/info

	$ COUNT=55 DEBUG=1 npm test

	> @ test /app
	> node test.js

	TAP version 13
	# download
	Expecting Count: 55
	packages per page: 36
	count:55 > page_size:36  -> Pagination required
	page_offset => round-up(count:55 / page_size:36 -> 1.53) - 1 = 1
	Current offset => (page:1 * page_size:36) = 36
	url: https://www.npmjs.com/browse/depended?offset=36
	Packages to Download: 55
	Package Downloaded[1]: chalk (2.3.1)
	Package Downloaded[2]: commander (2.14.1)
	Package Downloaded[3]: react (16.2.0)
	Package Downloaded[4]: debug (3.1.0)
	Package Downloaded[5]: request (2.83.0)
	Package Downloaded[6]: express (4.16.2)
	Package Downloaded[7]: underscore (1.8.3)
	Package Downloaded[8]: prop-types (15.6.0)
	Package Downloaded[9]: mkdirp (0.5.1)
	Package Downloaded[10]: body-parser (1.18.2)
	Package Downloaded[11]: glob (7.1.2)
	Package Downloaded[12]: colors (1.1.2)
	Package Downloaded[13]: bluebird (3.5.1)
	Package Downloaded[14]: minimist (1.2.0)
	Package Downloaded[15]: through2 (2.0.3)
	Package Downloaded[16]: uuid (3.2.1)
	Package Downloaded[17]: classnames (2.2.5)
	Package Downloaded[18]: fs-extra (5.0.0)
	Package Downloaded[19]: react-dom (16.2.0)
	Package Downloaded[20]: yeoman-generator (2.0.2)
	Package Downloaded[21]: async (2.6.0)
	Package Downloaded[22]: q (1.5.1)
	Package Downloaded[23]: gulp-util (3.0.8)
	Package Downloaded[24]: cheerio (1.0.0-rc.2)
	Package Downloaded[25]: yargs (11.0.0)
	Package Downloaded[26]: babel-core (6.26.0)
	Package Downloaded[27]: winston (2.4.0)
	Package Downloaded[28]: inquirer (5.1.0)
	Package Downloaded[29]: jquery (3.3.1)
	Package Downloaded[30]: gulp (3.9.1)
	Package Downloaded[31]: semver (5.5.0)
	Package Downloaded[32]: babel-preset-es2015 (6.24.1)
	Package Downloaded[33]: object-assign (4.1.1)
	Package Downloaded[34]: rimraf (2.6.2)
	Package Downloaded[35]: axios (0.17.1)
	Package Downloaded[36]: redux (3.7.2)
	Package Downloaded[37]: babel-loader (7.1.2)
	Package Downloaded[38]: coffee-script (1.12.7)
	Package Downloaded[39]: yosay (2.0.1)
	Package Downloaded[40]: babel-polyfill (6.26.0)
	Package Downloaded[41]: babel-runtime (6.26.0)
	Package Downloaded[42]: shelljs (0.8.1)
	Package Downloaded[43]: js-yaml (3.10.0)
	Package Downloaded[44]: superagent (3.8.2)
	Package Downloaded[45]: mocha (5.0.0)
	Package Downloaded[46]: moment (2.20.1)
	Package Downloaded[47]: zone.js (0.8.20)
	Package Downloaded[48]: webpack (3.11.0)
	Package Downloaded[49]: mongoose (5.0.4)
	Package Downloaded[50]: @angular/core (5.2.4)
	Package Downloaded[51]: lodash (4.17.5)
	Package Downloaded[52]: aws-sdk (2.192.0)
	Package Downloaded[53]: core-js (2.5.3)
	Package Downloaded[54]: @angular/common (5.2.4)
	Package Downloaded[55]: rxjs (5.5.6)
	ok 1 has 55 files
	ok 2 min 5k per package
	ok 3 _.map exists

	1..3
	# tests 3
	# pass  3

	# ok
