import { getFileName, getIfExistFile, getUrl, logSuccess, writeFile } from './helpers.js';
import { connect } from 'puppeteer-real-browser';
import { TOTAL_COUNT_PAGES } from './constants.js';

const parsing = async () => {
	console.log('----- START -----');

	const pageNumbersArray = Array.from({ length: TOTAL_COUNT_PAGES }, (_, i) => i + 1);

	for (const pageNumber of pageNumbersArray) {
		if (getIfExistFile(pageNumber)) {
			logSuccess(`The file \'${getFileName(pageNumber)}.csv\' already exists! Continue...`);
			continue;
		}

		const { page, browser } = await connect({});

		const url = getUrl(pageNumber);

		console.log('\n[Processing] url:', url);
		console.log('Await DDOS Guard...');

		//check if the page redirects
		let url_redirected = false;

		page.on('response', (response) => {
			const status = response.status();
			//[301, 302, 303, 307, 308, 403]
			if (status >= 300 && status <= 403) {
				url_redirected = true;
			}
		});

		//goto page
		await page.goto(url, { timeout: 0, waitUntil: 'networkidle2' });

		//if page redireced , we wait for navigation end
		if (url_redirected) await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

		//finally , we remove listeners in case the response event fire more than once
		page.removeAllListeners('response');

		const items = await page.evaluate(() => {
			// @ts-ignore
			return Array.from(document.querySelectorAll('li>a.link.serp__group-col-item')).map(
				(item) => {
					// @ts-ignore
					return item.innerText;
				},
			);
		});

		await writeFile(getFileName(pageNumber), items.join(';\n'));

		console.log(
			`Papge ${pageNumber < 10 ? 0 : ''}${pageNumber} success! Count per page: ${items.length}`,
		);

		await browser.close();
	}

	console.log('----- END -----');
};

parsing();
