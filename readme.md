# Programming Challenge

This [challenge](challenge.md) required creating a node application that would download the top 10+ packages from npm's ["most depended-upon packages"](https://www.npmjs.com/browse/depended?offset=) page. I used [async](https://www.npmjs.com/package/async), [request](https://www.npmjs.com/package/request), and [cheerio](https://www.npmjs.com/package/cheerio) to scrape the package names from the npm site's html. Each package is then downloaded to a target directory using [package-json](https://www.npmjs.com/package/package-json) to get meta-data, and [download-package-tarball](https://www.npmjs.com/package/download-package-tarball) to download the package itself. As far as I can tell, there is not a public api/service to get the packages in that specific order, so I had to scrape the html, to get that information. Unfortunately, the npm site itself would also randomly return no results; I throttled down the number of concurrent requests, and also built in a mechanism to rerun failed requests for that operation. 

## Dependencies
 - [async](https://www.npmjs.com/package/async)
 - [cheerio](https://www.npmjs.com/package/cheerio)
 - [download-package-tarball](https://www.npmjs.com/package/download-package-tarball)
 - [package-json](https://www.npmjs.com/package/package-json)
 - [request](https://www.npmjs.com/package/request)
 - [debug-level](https://www.npmjs.com/package/debug-level)
 - Existance of page: ["most depended-upon packages"](https://www.npmjs.com/browse/depended?offset=)

 **Test Dependencies**
 - [async](https://www.npmjs.com/package/async)
 - [get-folder-size](https://www.npmjs.com/package/get-folder-size)
 - [fs-extra](https://www.npmjs.com/package/fs-extra)
 - [lodash.flatten](https://www.npmjs.com/package/lodash.flatten)
 - [path](https://www.npmjs.com/package/path)
 - [run-series](https://www.npmjs.com/package/run-series)
 - [tape](https://www.npmjs.com/package/tape)

## Sample Installation (docker)
	# Clone repo locally
	git clone https://github.com/mathew-fleisch/homework-node.git

	# Move to repo
	cd homework-node

	# Get container/image
	docker pull node:8

	# Run container (* change node:8 to node8:cached after docker commit)
	docker run -it -v $(pwd):/app node:8 bash

	# Update container (inside docker container)
	apt-get update && apt-get install -y npm && cd /app && npm install

	# Save container state (from host) *optional
	docker commit CONTAINER-ID node8:cached

	# Run code (inside docker container)
	npm test


## Configuration
	ASYNC_LIMIT      -> Number of concurrent requests for each async operation (default:10)
	COUNT            -> Number of packages to download (default:10)
	DEBUG_LEVEL      -> ERROR,INFO,DEBUG
	PACKAGE_URL      -> Entry point url, to scrape (default: https://www.npmjs.com/browse/depended?offset=)
	SCRAPE_LIMIT     -> npm url fails with more than one request at a time (default: 1)
	TARGET_DIRECTORY -> Where the packages will be downloaded to (default: ./packages)

## Usage

	# Standard usage (default count: 10)

	$  npm test

	> eaze-programming-challenge@1.0.0 test /app
	> node test.js

	  LOG [NPM Downloader]  NPM Package Downloader Started +0ms
	TAP version 13
	# download
	Expecting: 10
	  LOG [NPM Downloader]  Package Downloaded[1]: commander (2.14.1) +1s
	  LOG [NPM Downloader]  Package Downloaded[2]: react (16.2.0) +58ms
	  LOG [NPM Downloader]  Package Downloaded[3]: chalk (2.3.1) +83ms
	  LOG [NPM Downloader]  Package Downloaded[4]: debug (3.1.0) +6ms
	  LOG [NPM Downloader]  Package Downloaded[5]: request (2.83.0) +130ms
	  LOG [NPM Downloader]  Package Downloaded[6]: express (4.16.2) +17ms
	  LOG [NPM Downloader]  Package Downloaded[7]: bluebird (3.5.1) +295ms
	  LOG [NPM Downloader]  Package Downloaded[8]: async (2.6.0) +576ms
	  LOG [NPM Downloader]  Package Downloaded[9]: moment (2.20.1) +1s
	  LOG [NPM Downloader]  Package Downloaded[10]: lodash (4.17.5) +4s
	ok 1 files found: 55 (scoped:"0" + unscoped:"10")
	ok 2 min 5k per package
	ok 3 _.map exists

	1..3
	# tests 3
	# pass  3

	# ok






	# ------------------------------------------- #







	# Setting configuration variables to increase count to 55 and set debug level to 1/info

	$ DEBUG_LEVEL=INFO COUNT=55 npm test

	> eaze-programming-challenge@1.0.0 test /app
	> node test.js

	  LOG [NPM Downloader]  NPM Package Downloader Started +0ms
	TAP version 13
	# download
	Expecting: 55
	  INFO [NPM Downloader]  packages per page: 36 +675ms
	  INFO [NPM Downloader]  count:55 > page_size:36  -> Pagination required +0ms
	  INFO [NPM Downloader]  page_offset => round-up(count:55 / page_size:36 -> 1.53) - 1 = 1 +0ms
	  INFO [NPM Downloader]  Current offset => (page:1 * page_size:36) = 36 +0ms
	  INFO [NPM Downloader]  url: https://www.npmjs.com/browse/depended?offset=36 +1ms
	  INFO [NPM Downloader]  Packages to Download: 55 +568ms
	  LOG [NPM Downloader]  Package Downloaded[1]: chalk (2.3.1) +1s
	  LOG [NPM Downloader]  Package Downloaded[2]: commander (2.14.1) +24ms
	  LOG [NPM Downloader]  Package Downloaded[3]: react (16.2.0) +5ms
	  LOG [NPM Downloader]  Package Downloaded[4]: debug (3.1.0) +117ms
	  LOG [NPM Downloader]  Package Downloaded[5]: underscore (1.8.3) +116ms
	  LOG [NPM Downloader]  Package Downloaded[6]: request (2.83.0) +1ms
	  LOG [NPM Downloader]  Package Downloaded[7]: express (4.16.2) +6ms
	  LOG [NPM Downloader]  Package Downloaded[8]: mkdirp (0.5.1) +167ms
	  LOG [NPM Downloader]  Package Downloaded[9]: glob (7.1.2) +18ms
	  LOG [NPM Downloader]  Package Downloaded[10]: prop-types (15.6.0) +87ms
	  LOG [NPM Downloader]  Package Downloaded[11]: colors (1.1.2) +50ms
	  LOG [NPM Downloader]  Package Downloaded[12]: bluebird (3.5.1) +122ms
	  LOG [NPM Downloader]  Package Downloaded[13]: body-parser (1.18.2) +71ms
	  LOG [NPM Downloader]  Package Downloaded[14]: react-dom (16.2.0) +14ms
	  LOG [NPM Downloader]  Package Downloaded[15]: minimist (1.2.0) +111ms
	  LOG [NPM Downloader]  Package Downloaded[16]: q (1.5.1) +25ms
	  LOG [NPM Downloader]  Package Downloaded[17]: fs-extra (5.0.0) +159ms
	  LOG [NPM Downloader]  Package Downloaded[18]: uuid (3.2.1) +1ms
	  LOG [NPM Downloader]  Package Downloaded[19]: classnames (2.2.5) +155ms
	  LOG [NPM Downloader]  Package Downloaded[20]: yargs (11.0.0) +165ms
	  LOG [NPM Downloader]  Package Downloaded[21]: through2 (2.0.3) +50ms
	  LOG [NPM Downloader]  Package Downloaded[22]: babel-core (6.26.0) +42ms
	  LOG [NPM Downloader]  Package Downloaded[23]: async (2.6.0) +448ms
	  LOG [NPM Downloader]  Package Downloaded[24]: gulp-util (3.0.8) +35ms
	  LOG [NPM Downloader]  Package Downloaded[25]: inquirer (5.1.0) +105ms
	  LOG [NPM Downloader]  Package Downloaded[26]: winston (2.4.0) +111ms
	  LOG [NPM Downloader]  Package Downloaded[27]: gulp (3.9.1) +64ms
	  LOG [NPM Downloader]  Package Downloaded[28]: semver (5.5.0) +81ms
	  LOG [NPM Downloader]  Package Downloaded[29]: yeoman-generator (2.0.2) +1ms
	  LOG [NPM Downloader]  Package Downloaded[30]: axios (0.17.1) +239ms
	  LOG [NPM Downloader]  Package Downloaded[31]: jquery (3.3.1) +143ms
	  LOG [NPM Downloader]  Package Downloaded[32]: babel-preset-es2015 (6.24.1) +27ms
	  LOG [NPM Downloader]  Package Downloaded[33]: object-assign (4.1.1) +7ms
	  LOG [NPM Downloader]  Package Downloaded[34]: rimraf (2.6.2) +42ms
	  LOG [NPM Downloader]  Package Downloaded[35]: cheerio (1.0.0-rc.2) +23ms
	  LOG [NPM Downloader]  Package Downloaded[36]: babel-loader (7.1.2) +143ms
	  LOG [NPM Downloader]  Package Downloaded[37]: coffee-script (1.12.7) +90ms
	  LOG [NPM Downloader]  Package Downloaded[38]: babel-polyfill (6.26.0) +43ms
	  LOG [NPM Downloader]  Package Downloaded[39]: redux (3.7.2) +8ms
	  LOG [NPM Downloader]  Package Downloaded[40]: babel-runtime (6.26.0) +673ms
	  LOG [NPM Downloader]  Package Downloaded[41]: shelljs (0.8.1) +96ms
	  LOG [NPM Downloader]  Package Downloaded[42]: js-yaml (3.10.0) +127ms
	  LOG [NPM Downloader]  Package Downloaded[43]: mocha (5.0.0) +447ms
	  LOG [NPM Downloader]  Package Downloaded[44]: zone.js (0.8.20) +239ms
	  LOG [NPM Downloader]  Package Downloaded[45]: superagent (3.8.2) +800ms
	  LOG [NPM Downloader]  Package Downloaded[46]: moment (2.20.1) +725ms
	  LOG [NPM Downloader]  Package Downloaded[47]: yosay (2.0.1) +404ms
	  LOG [NPM Downloader]  Package Downloaded[48]: webpack (3.11.0) +157ms
	  LOG [NPM Downloader]  Package Downloaded[49]: mongoose (5.0.4) +2s
	  LOG [NPM Downloader]  Package Downloaded[50]: @angular/core (5.2.4) +44ms
	  LOG [NPM Downloader]  Package Downloaded[51]: lodash (4.17.5) +5s
	  LOG [NPM Downloader]  Package Downloaded[52]: aws-sdk (2.192.0) +3s
	  LOG [NPM Downloader]  Package Downloaded[53]: core-js (2.5.3) +3s
	  LOG [NPM Downloader]  Package Downloaded[54]: @angular/common (5.2.4) +8s
	  LOG [NPM Downloader]  Package Downloaded[55]: rxjs (5.5.6) +9s
	ok 1 files found: 55 (scoped:"2" + unscoped:"53")
	ok 2 min 5k per package
	ok 3 _.map exists

	1..3
	# tests 3
	# pass  3

	# ok