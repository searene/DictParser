import { ROOT_PATH } from '../../../constant';
import { Log } from '../../../util/log';
import { WordTree } from '../../../Tree';
import { DSLStateMachine } from '../../../dictionaries/dsl/DSLStateMachine';
import { StateMachine } from "../../../StateMachine";
import { assert } from 'chai';
import { getEncodingInFile } from '../../../EncodingDetector';
import * as fsp from 'fs-promise';
import * as path from 'path';

let logger = Log.getLogger();

describe("Test DSLStateMachine", () => {
    describe("Test run", () => {

		let simpleEntryContents: string;
		let mediumEntryContents: string;
		let complexEntryContents: string;
		let typicalEntryContents: string;

		before(async () => {
			let dslFile: string = path.join(ROOT_PATH, 'src/test/resources/dsl/sample.dsl');
			let encoding = (await getEncodingInFile(dslFile));
			simpleEntryContents = await readFile(dslFile, encoding.encoding, 5, 6);
			mediumEntryContents = await readFile(dslFile, encoding.encoding, 214, 216);
			complexEntryContents = await readFile(dslFile, encoding.encoding, 8, 190);
			typicalEntryContents = await readFile(dslFile, encoding.encoding, 192, 212);
		});

        it("Simple entry test", () => {

            let stateMachine: StateMachine = new DSLStateMachine(simpleEntryContents);
            let wordTree: WordTree = stateMachine.run();

			let s = wordTree.toString();
			// logger.info(s);

        });
        it("Medium entry test", () => {

            let stateMachine: StateMachine = new DSLStateMachine(mediumEntryContents);
            let wordTree: WordTree = stateMachine.run();

			let s = wordTree.toString();
			// logger.info(s);

        });
        it("Complex entry test", () => {

            let stateMachine: StateMachine = new DSLStateMachine(complexEntryContents);
            let wordTree: WordTree = stateMachine.run();
			let s = wordTree.toString();
			// logger.info(s);

        });
        it("Typical entry test", () => {

            let stateMachine: StateMachine = new DSLStateMachine(typicalEntryContents);
            let wordTree: WordTree = stateMachine.run();

        });
    });
});

async function readFile(filePath: string, encoding: string, startLine: number, endLine: number): Promise<string> {
	let fileContents: string = await fsp.readFile(filePath, {encoding: encoding});

	// replace \r\n with \n so we won't deal with \r any more
	fileContents = fileContents.replace(/\r?\n|\r/g, "\n");

	let lines = fileContents.split(/\n/);
	return lines.slice(startLine - 1, endLine).join("\n");
}
