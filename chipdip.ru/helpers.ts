import { encode } from 'windows-1251';
import * as fs from 'fs';
import { OUTPUT_DIRECTORY, TITLE_FILE } from './constants.js';

export const sleep = (milliseconds = 1000) => {
	console.info('sleep...');
	const date = Date.now();
	let currentDate = null;
	do {
		currentDate = Date.now();
	} while (currentDate - date < milliseconds);
};

export const writeFile = async (fileName: string, text: string) => {
	let textEncoded = '';
	let isWithoutEncoding = false;

	try {
		textEncoded = encode(text);
	} catch (error) {
		textEncoded = text;
		isWithoutEncoding = true;
	}

	if (!fs.existsSync(OUTPUT_DIRECTORY)) fs.mkdirSync(OUTPUT_DIRECTORY);

	return fs.writeFile(
		`${OUTPUT_DIRECTORY}/${fileName}${isWithoutEncoding ? '_without_encoding' : ''}.csv`,
		textEncoded,
		function (error) {
			if (error) {
				return console.log(error);
			}
			logSuccess(`The file \'${fileName}.csv\' was successfully written`);
		},
	);
};

export const wait = async (milliseconds = 1000) => {
	return new Promise<void>((res, rej) => setTimeout(() => res(), milliseconds));
};

export const logSuccess = (s: string) => console.log('\x1b[32m%s\x1b[0m', s);

export const getUrl = (i: number) => `https://www.chipdip.ru/manufacturer?page=${i}`;

export const getFileName = (i: number) => `${TITLE_FILE}_page_${i < 10 ? 0 : ''}${i}`;

export const getIfExistFile = (i: number) => {
	return (
		fs.existsSync(`${OUTPUT_DIRECTORY}/${getFileName(i)}.csv`) ||
		fs.existsSync(`${OUTPUT_DIRECTORY}/${getFileName(i)}_without_encoding.csv`)
	);
};
