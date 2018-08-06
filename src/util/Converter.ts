import * as path from 'path';
// import * as ReadLine from "readline";

// import { WORD_FORMS_PATH } from "../Constant";
import { WordForms } from "../DictionaryFinder";

// async function convertWordFormsFile(wordFormsFolder: string = WORD_FORMS_PATH) {
//     const files = await fse.readdir(wordFormsFolder);
//     for(const file of files) {
//         const result: WordForms = {};
//         if(path.extname(file) === '.json') { continue; }
//         const convertedFileName = path.basename(file) + '.json';
//         if(files.indexOf(convertedFileName) > -1) {
//             // the file has already been converted
//             continue;
//         }
//         const lineReader = ReadLine.createInterface({
//             input: fse.createReadStream(file)
//         });
//         lineReader.on('line', line => {
//             const words: string[] = line.split(/[\s,:]+/);
//
//             const originalWord = words[0];
//             const transformedWords = words.slice(1);
//             for(const transformedWord of transformedWords) {
//
//             }
//         });
//     }
// }
