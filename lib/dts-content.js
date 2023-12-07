"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DtsContent = void 0;
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const is_there_1 = __importDefault(require("is-there"));
const mkdirp = __importStar(require("mkdirp"));
const util = __importStar(require("util"));
const camelcase_1 = __importDefault(require("camelcase"));
const chalk_1 = __importDefault(require("chalk"));
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
class DtsContent {
    constructor(options) {
        this.dropExtension = options.dropExtension;
        this.rootDir = options.rootDir;
        this.searchDir = options.searchDir;
        this.outDir = options.outDir;
        this.rInputPath = options.rInputPath;
        this.rawTokenList = options.rawTokenList;
        this.namedExports = options.namedExports;
        this.camelCase = options.camelCase;
        this.EOL = options.EOL;
        // when using named exports, camelCase must be enabled by default
        // (see https://webpack.js.org/loaders/css-loader/#namedexport)
        // we still accept external control for the 'dashes' option,
        // so we only override in case is false or undefined
        if (this.namedExports && !this.camelCase) {
            this.camelCase = true;
        }
        this.resultList = this.createResultList();
    }
    get contents() {
        return this.resultList;
    }
    get formatted() {
        if (!this.resultList || !this.resultList.length)
            return '';
        if (this.namedExports) {
            return (['export const __esModule: true;', ...this.resultList.map(line => 'export ' + line), ''].join(os.EOL) + this.EOL);
        }
        return (['declare const styles: {', ...this.resultList.map(line => '  ' + line), '};', 'export = styles;', ''].join(os.EOL) + this.EOL);
    }
    get tokens() {
        return this.rawTokenList;
    }
    get outputFilePath() {
        return path.join(this.rootDir, this.outDir, this.outputFileName);
    }
    get relativeOutputFilePath() {
        return path.join(this.outDir, this.outputFileName);
    }
    get inputFilePath() {
        return path.join(this.rootDir, this.searchDir, this.rInputPath);
    }
    get relativeInputFilePath() {
        return path.join(this.searchDir, this.rInputPath);
    }
    async checkFile(postprocessor = (formatted) => formatted) {
        if (!(0, is_there_1.default)(this.outputFilePath)) {
            console.error(chalk_1.default.red(`[ERROR] Type file needs to be generated for '${this.relativeInputFilePath}'`));
            return false;
        }
        const finalOutput = postprocessor(this.formatted);
        const fileContent = (await readFile(this.outputFilePath)).toString();
        if (fileContent !== finalOutput) {
            console.error(chalk_1.default.red(`[ERROR] Check type definitions for '${this.relativeOutputFilePath}'`));
            return false;
        }
        return true;
    }
    async writeFile(postprocessor = (formatted) => formatted) {
        const finalOutput = postprocessor(this.formatted);
        const outPathDir = path.dirname(this.outputFilePath);
        if (!(0, is_there_1.default)(outPathDir)) {
            mkdirp.sync(outPathDir);
        }
        let isDirty = false;
        if (!(0, is_there_1.default)(this.outputFilePath)) {
            isDirty = true;
        }
        else {
            const content = (await readFile(this.outputFilePath)).toString();
            if (content !== finalOutput) {
                isDirty = true;
            }
        }
        if (isDirty) {
            await writeFile(this.outputFilePath, finalOutput, 'utf8');
        }
    }
    createResultList() {
        const convertKey = this.getConvertKeyMethod(this.camelCase);
        const result = this.rawTokenList
            .map(k => convertKey(k))
            .map(k => (!this.namedExports ? 'readonly "' + k + '": string;' : 'const ' + k + ': string;'));
        return result;
    }
    getConvertKeyMethod(camelCaseOption) {
        switch (camelCaseOption) {
            case true:
                return camelcase_1.default;
            case 'dashes':
                return this.dashesCamelCase;
            default:
                return key => key;
        }
    }
    /**
     * Replaces only the dashes and leaves the rest as-is.
     *
     * Mirrors the behaviour of the css-loader:
     * https://github.com/webpack-contrib/css-loader/blob/1fee60147b9dba9480c9385e0f4e581928ab9af9/lib/compile-exports.js#L3-L7
     */
    dashesCamelCase(str) {
        return str.replace(/-+(\w)/g, function (match, firstLetter) {
            return firstLetter.toUpperCase();
        });
    }
    get outputFileName() {
        const outputFileName = this.dropExtension ? removeExtension(this.rInputPath) : this.rInputPath;
        return outputFileName + '.d.ts';
    }
}
exports.DtsContent = DtsContent;
function removeExtension(filePath) {
    const ext = path.extname(filePath);
    return filePath.replace(new RegExp(ext + '$'), '');
}
//# sourceMappingURL=dts-content.js.map