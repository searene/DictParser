import { DictionaryFinder, DictMap } from './../../main/typescript/DictionaryFinder';
import { ROOT_PATH } from './../../main/typescript/constant';
import { Node } from './../../main/typescript/Tree';
import { Log } from '../../main/typescript/util/log';
import { WordTree } from '../../main/typescript/Tree';
import { DSLStateMachine } from '../../main/typescript/DSLStateMachine';
import { StateMachine } from '../../main/typescript/StateMachine';
import { assert } from 'chai';
import { getEncodingInFile } from '../../main/typescript/EncodingDetector';
import * as mocha from 'mocha';
import * as fsp from 'fs-promise';
import * as path from 'path';

let logger = Log.getLogger();

describe('Test DictionaryFinder', () => {
	it('#scan', async () => {
		let scanFolder = path.join(ROOT_PATH, 'src/test/resources/scan');
		let dbPath = path.join(ROOT_PATH, 'src/test/resources/dictParser.db');

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
		indexMap: {
			'trivial card': {pos: 182, len: 206},
			'sample entry': {pos: 388, len: 29476},
			'example': {pos: 388, len: 29476},
			'sample  card': {pos: 388, len: 29476},
			'sample headword': {pos: 388, len: 29476},
			'typical card': {pos: 29864, len: 3762},
			'resourceCard': {pos: 33626, len: 180}
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
		indexMap: {
			'trivial card': {pos: 182, len: 202}
		}
	}]);
}