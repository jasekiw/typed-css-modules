"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const node_assert_1 = __importDefault(require("node:assert"));
const dts_creator_1 = require("./dts-creator");
describe(dts_creator_1.DtsCreator, () => {
    describe('#create', () => {
        it('returns DtsContent instance simple css', async () => {
            const content = await new dts_creator_1.DtsCreator().create('fixtures/testStyle.css');
            node_assert_1.default.equal(content.contents.length, 1);
            node_assert_1.default.equal(content.contents[0], 'readonly "myClass": string;');
        });
        it('rejects an error with invalid CSS', async () => {
            await expect(() => new dts_creator_1.DtsCreator().create('fixtures/errorCss.css')).rejects.toMatchObject({
                name: 'CssSyntaxError',
            });
        });
        it('returns DtsContent instance from composing css', async () => {
            const content = await new dts_creator_1.DtsCreator().create('fixtures/composer.css');
            node_assert_1.default.equal(content.contents.length, 1);
            node_assert_1.default.equal(content.contents[0], 'readonly "root": string;');
        });
        it('returns DtsContent instance from composing css whose has invalid import/composes', async () => {
            const content = await new dts_creator_1.DtsCreator().create('fixtures/invalidComposer.scss');
            node_assert_1.default.equal(content.contents.length, 1);
            node_assert_1.default.equal(content.contents[0], 'readonly "myClass": string;');
        });
        it('returns DtsContent instance from the pair of path and contents', async () => {
            const content = await new dts_creator_1.DtsCreator().create('fixtures/somePath', `.myClass { color: red }`);
            node_assert_1.default.equal(content.contents.length, 1);
            node_assert_1.default.equal(content.contents[0], 'readonly "myClass": string;');
        });
        it('returns DtsContent instance combined css', async () => {
            const content = await new dts_creator_1.DtsCreator().create('fixtures/combined/combined.css');
            node_assert_1.default.equal(content.contents.length, 3);
            node_assert_1.default.equal(content.contents[0], 'readonly "block": string;');
            node_assert_1.default.equal(content.contents[1], 'readonly "box": string;');
            node_assert_1.default.equal(content.contents[2], 'readonly "myClass": string;');
        });
    });
    describe('#modify path', () => {
        it('can be set outDir', async () => {
            const content = await new dts_creator_1.DtsCreator({ searchDir: 'fixtures', outDir: 'dist' }).create(node_path_1.default.normalize('fixtures/testStyle.css'));
            node_assert_1.default.equal(node_path_1.default.relative(process.cwd(), content.outputFilePath), node_path_1.default.normalize('dist/testStyle.css.d.ts'));
        });
    });
});
//# sourceMappingURL=dts-creator.test.js.map