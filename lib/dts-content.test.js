"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
const node_assert_1 = __importDefault(require("node:assert"));
const is_there_1 = __importDefault(require("is-there"));
const rimraf_1 = require("rimraf");
const dts_creator_1 = require("./dts-creator");
describe('DtsContent', () => {
    describe('#tokens', () => {
        it('returns original tokens', async () => {
            const content = await new dts_creator_1.DtsCreator().create('fixtures/testStyle.css');
            node_assert_1.default.equal(content.tokens[0], 'myClass');
        });
    });
    describe('#inputFilePath', () => {
        it('returns original CSS file name', async () => {
            const content = await new dts_creator_1.DtsCreator().create(node_path_1.default.normalize('fixtures/testStyle.css'));
            node_assert_1.default.equal(node_path_1.default.relative(process.cwd(), content.inputFilePath), node_path_1.default.normalize('fixtures/testStyle.css'));
        });
    });
    describe('#relativeInputFilePath', () => {
        it('returns relative original CSS file name', async () => {
            const content = await new dts_creator_1.DtsCreator().create(node_path_1.default.normalize('fixtures/testStyle.css'));
            node_assert_1.default.equal(content.relativeInputFilePath, node_path_1.default.normalize('fixtures/testStyle.css'));
        });
    });
    describe('#outputFilePath', () => {
        it('adds d.ts to the original filename', async () => {
            const content = await new dts_creator_1.DtsCreator().create(node_path_1.default.normalize('fixtures/testStyle.css'));
            node_assert_1.default.equal(node_path_1.default.relative(process.cwd(), content.outputFilePath), node_path_1.default.normalize('fixtures/testStyle.css.d.ts'));
        });
        it('can drop the original extension when asked', async () => {
            const content = await new dts_creator_1.DtsCreator({ dropExtension: true }).create(node_path_1.default.normalize('fixtures/testStyle.css'));
            node_assert_1.default.equal(node_path_1.default.relative(process.cwd(), content.outputFilePath), node_path_1.default.normalize('fixtures/testStyle.d.ts'));
        });
    });
    describe('#relativeOutputFilePath', () => {
        it('adds d.ts to the original filename', async () => {
            const content = await new dts_creator_1.DtsCreator().create(node_path_1.default.normalize('fixtures/testStyle.css'));
            node_assert_1.default.equal(node_path_1.default.relative(process.cwd(), content.relativeOutputFilePath), node_path_1.default.normalize('fixtures/testStyle.css.d.ts'));
        });
        it('can drop the original extension when asked', async () => {
            const content = await new dts_creator_1.DtsCreator({ dropExtension: true }).create(node_path_1.default.normalize('fixtures/testStyle.css'));
            node_assert_1.default.equal(node_path_1.default.relative(process.cwd(), content.relativeOutputFilePath), node_path_1.default.normalize('fixtures/testStyle.d.ts'));
        });
    });
    describe('#formatted', () => {
        it('returns formatted .d.ts string', async () => {
            const content = await new dts_creator_1.DtsCreator({ EOL: '\n' }).create('fixtures/testStyle.css');
            node_assert_1.default.equal(content.formatted, `\
declare const styles: {
  readonly "myClass": string;
};
export = styles;

`);
        });
        it('returns named exports formatted .d.ts string', async () => {
            const content = await new dts_creator_1.DtsCreator({ namedExports: true, EOL: '\n' }).create('fixtures/testStyle.css');
            node_assert_1.default.equal(content.formatted, `\
export const __esModule: true;
export const myClass: string;

`);
        });
        it('returns camelcase names when using named exports as formatted .d.ts string', async () => {
            const content = await new dts_creator_1.DtsCreator({ namedExports: true, EOL: '\n' }).create('fixtures/kebabedUpperCase.css');
            node_assert_1.default.equal(content.formatted, `\
export const __esModule: true;
export const myClass: string;

`);
        });
        it('returns empty object exportion when the result list has no items', async () => {
            const content = await new dts_creator_1.DtsCreator({ EOL: '\n' }).create('fixtures/empty.css');
            node_assert_1.default.equal(content.formatted, 'export {};');
        });
        describe('#camelCase option', () => {
            it('camelCase == true: returns camelized tokens for lowercase classes', async () => {
                const content = await new dts_creator_1.DtsCreator({ camelCase: true, EOL: '\n' }).create('fixtures/kebabed.css');
                node_assert_1.default.equal(content.formatted, `\
declare const styles: {
  readonly "myClass": string;
};
export = styles;

`);
            });
            it('camelCase == true: returns camelized tokens for uppercase classes ', async () => {
                const content = await new dts_creator_1.DtsCreator({ camelCase: true, EOL: '\n' }).create('fixtures/kebabedUpperCase.css');
                node_assert_1.default.equal(content.formatted, `\
declare const styles: {
  readonly "myClass": string;
};
export = styles;

`);
            });
            it('camelCase == "dashes": returns camelized tokens for dashes only', async () => {
                const content = await new dts_creator_1.DtsCreator({ camelCase: 'dashes', EOL: '\n' }).create('fixtures/kebabedUpperCase.css');
                node_assert_1.default.equal(content.formatted, `\
declare const styles: {
  readonly "MyClass": string;
};
export = styles;

`);
            });
        });
    });
    describe('#checkFile', () => {
        let mockExit;
        let mockConsoleLog;
        let mockConsoleError;
        beforeAll(() => {
            mockExit = jest.spyOn(process, 'exit').mockImplementation(exitCode => {
                throw new Error(`process.exit: ${exitCode}`);
            });
            mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
            mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
        });
        beforeEach(() => {
            jest.clearAllMocks();
        });
        afterAll(() => {
            mockExit.mockRestore();
            mockConsoleLog.mockRestore();
            mockConsoleError.mockRestore();
        });
        it('return false if type file is missing', async () => {
            const content = await new dts_creator_1.DtsCreator({ EOL: '\n' }).create(node_path_1.default.normalize('fixtures/empty.css'));
            const result = await content.checkFile();
            node_assert_1.default.equal(result, false);
        });
        it('returns false if type file content is different', async () => {
            const content = await new dts_creator_1.DtsCreator({ EOL: '\n' }).create(node_path_1.default.normalize('fixtures/different.css'));
            const result = await content.checkFile();
            node_assert_1.default.equal(result, false);
        });
        it('returns true if type files match', async () => {
            const content = await new dts_creator_1.DtsCreator({ EOL: '\n' }).create(node_path_1.default.normalize('fixtures/testStyle.css'));
            const result = await content.checkFile();
            node_assert_1.default.equal(result, true);
        });
    });
    describe('#writeFile', () => {
        beforeEach(async () => {
            await (0, rimraf_1.rimraf)(node_path_1.default.normalize('fixtures/testStyle.css.d.ts'));
        });
        it('accepts a postprocessor sync function', async () => {
            const content = await new dts_creator_1.DtsCreator().create(node_path_1.default.normalize('fixtures/testStyle.css'));
            await content.writeFile(formatted => `// this banner was added to the .d.ts file automatically.\n${formatted}`);
        });
        it('accepts a postprocessor async function', async () => {
            const content = await new dts_creator_1.DtsCreator().create(node_path_1.default.normalize('fixtures/testStyle.css'));
            await content.writeFile(async (formatted) => `// this banner was added to the .d.ts file automatically.\n${formatted}`);
        });
        it('writes a .d.ts file', async () => {
            const content = await new dts_creator_1.DtsCreator().create(node_path_1.default.normalize('fixtures/testStyle.css'));
            await content.writeFile();
            expect((0, is_there_1.default)(node_path_1.default.normalize('fixtures/testStyle.css.d.ts'))).toBeTruthy();
        });
    });
    describe('#deleteFile', () => {
        beforeEach(async () => {
            await promises_1.default.writeFile(node_path_1.default.normalize('fixtures/none.css.d.ts'), '', 'utf8');
        });
        it('delete a .d.ts file', async () => {
            const content = await new dts_creator_1.DtsCreator().create(node_path_1.default.normalize('fixtures/none.css'), undefined, false, true);
            await content.deleteFile();
            expect((0, is_there_1.default)(node_path_1.default.normalize('fixtures/none.css.d.ts'))).toBeFalsy();
        });
        afterAll(async () => {
            await (0, rimraf_1.rimraf)(node_path_1.default.normalize('fixtures/none.css.d.ts'));
        });
    });
});
//# sourceMappingURL=dts-content.test.js.map