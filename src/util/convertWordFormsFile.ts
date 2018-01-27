import * as fse from 'fs-extra';
import * as path from 'path';
import * as ReadLine from "readline";

import { WORD_FORMS_PATH } from "../Constant";
import { WordForms } from "../DictionaryFinder";

async function convert(wordFormsFolder: string = WORD_FORMS_PATH) {
    let files = await fse.readdir(wordFormsFolder);
    for(let file of files) {
        let result: WordForms = {};
        if(path.extname(file) == '.json') continue;
        let convertedFileName = path.basename(file) + '.json';
        if(files.indexOf(convertedFileName) > -1) {
            // the file has already been converted
            continue;
        }
        let lineReader = ReadLine.createInterface({
            input: fse.createReadStream(file)
        });
        lineReader.on('line', line => {
            let words: string[] = line.split(/[\s,:]+/);

            let originalWord = words[0];
            let transformedWords = words.slice(1);
            for(let transformedWord of transformedWords) {

            }
        });
    }
}
