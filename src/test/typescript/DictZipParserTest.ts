import { ROOT_PATH } from './../../main/typescript/constant';
import { Log } from './../../main/typescript/util/log';
import { DictZipParser } from '../../main/typescript/dictzip/DictZipParser';
import * as path from 'path';

describe('DictZipParser test', () => {

    let logger = Log.getLogger();

    let simpleDictFile = path.join(ROOT_PATH, 'src/test/resources/simple_dict_file.txt.dz');

    it("#parse", async () => {
        let dictZipParser = new DictZipParser(simpleDictFile);
        let parsedBuffer = await dictZipParser.parse(2);

        let parsedString = parsedBuffer.toString('utf8');
        logger.debug(parsedString);
    });
});