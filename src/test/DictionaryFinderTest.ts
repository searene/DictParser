import { DictionaryFinder, DictMap } from '../DictionaryFinder';
import { TEST_RESOURCE_PATH } from '../Constant';
import { Log } from '../util/log';
import { assert } from 'chai';
import * as mocha from 'mocha';
import * as fsp from 'fs-promise';
import * as path from 'path';

let logger = Log.getLogger();

describe('Test DictionaryFinder', () => {
	it('#scan', async () => {
		let scanFolder = path.join(TEST_RESOURCE_PATH, 'scan');
		let dbPath = path.join(TEST_RESOURCE_PATH, 'dictParser.db');

		let dictionaryFinder = new DictionaryFinder();
		let dictMapList: DictMap[] = await dictionaryFinder.scan(scanFolder, dbPath);
		checkDictMapList(dictMapList, scanFolder);

		// check db file
		dictMapList = JSON.parse(await fsp.readFile(dbPath, {encoding: 'utf8'}));
		checkDictMapList(dictMapList, scanFolder);
	});
});

function checkDictMapList(dictMapList: DictMap[], scanFolder: string) {
	assert.deepEqual(dictMapList, [{
		dict: {
			dictPath: path.join(scanFolder, 'dsl/sample.dsl'),
			dictType: 'dsl',
			resource: path.join(scanFolder, 'dsl/sample.dsl.dz.files.zip'),
		},
		meta: {
			'NAME': 'Sample DSL Dictionary',
			'INDEX_LANGUAGE': 'English',
			'CONTENTS_LANGUAGE': 'English'
		},
		originalWords: {
			'trivial card': {pos: 182, len: 206},
			'sample entry': {pos: 388, len: 29476},
			'example': {pos: 416, len: 29448},
			'sample  card': {pos: 434, len: 29430},
			'sample headword': {pos: 492, len: 29372},
			'typical card': {pos: 29864, len: 3762},
			'resourceCard': {pos: 33626, len: 180}
		},
        transformedWords: {
            'examples': {pos: 416, len: 29448},
            'exampled': {pos: 416, len: 29448},
            'exampling': {pos: 416, len: 29448}
        }
	}, {
		dict: {
			dictPath: path.join(scanFolder, 'dz/simple.dsl.dz'),
			dictType: 'dsl',
			resource: '',
		},
		meta: {
			'NAME': 'Simple DSL Dictionary',
			'INDEX_LANGUAGE': 'English',
			'CONTENTS_LANGUAGE': 'English'
		},
		originalWords: {
			'trivial card': {pos: 182, len: 202}
		},
        transformedWords: {}
	}]);
}
