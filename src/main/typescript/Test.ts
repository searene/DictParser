// import { ROOT_PATH } from './constant';
// import * as path from 'path';
// import DictZipParser from './dictzip/DictZipParser';

// let simpleDictFile = path.join(ROOT_PATH, 'src/test/resources/simple_dict_file.txt.dz');

// async function test() {
//     try {
//         let dictZipParser = new DictZipParser(simpleDictFile);
//         let parsedBuffer = await dictZipParser.parse(0, 3);

//         let parsedString = parsedBuffer.toString('utf8');
//         console.log(parsedString);
//     } catch(e) {
//         console.error(e.message);
//     }
// }

// test();