"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const is_there_1 = __importDefault(require("is-there"));
const rimraf_1 = require("rimraf");
const run_1 = require("./run");
describe(run_1.run, () => {
    let mockConsoleLog;
    beforeAll(() => {
        mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    });
    beforeEach(async () => {
        await (0, rimraf_1.rimraf)('example/style01.css.d.ts');
    });
    afterAll(() => {
        mockConsoleLog.mockRestore();
    });
    it('generates type definition files', async () => {
        await (0, run_1.run)('example', { watch: false });
        expect((0, is_there_1.default)(node_path_1.default.normalize('example/style01.css.d.ts'))).toBeTruthy();
    });
});
//# sourceMappingURL=run.test.js.map