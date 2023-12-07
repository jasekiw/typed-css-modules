#!/usr/bin/env node
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
Object.defineProperty(exports, "__esModule", { value: true });
const yargs = __importStar(require("yargs"));
const run_1 = require("./run");
const yarg = yargs
    .usage('Create .css.d.ts from CSS modules *.css files.\nUsage: $0 [options] <search directory>')
    .example('$0 src/styles', '')
    .example('$0 src -o dist', '')
    .example('$0 -p styles/**/*.icss -w', '')
    .detectLocale(false)
    .demand(['_'])
    .alias('p', 'pattern')
    .describe('p', 'Glob pattern with css files')
    .string('p')
    .alias('o', 'outDir')
    .describe('o', 'Output directory')
    .string('o')
    .alias('l', 'listDifferent')
    .describe('l', 'List any files that are different than those that would be generated. If any are different, exit with a status code 1.')
    .boolean('l')
    .alias('w', 'watch')
    .describe('w', "Watch input directory's css files or pattern")
    .boolean('w')
    .alias('c', 'camelCase')
    .describe('c', 'Convert CSS class tokens to camelcase')
    .boolean('c')
    .alias('e', 'namedExports')
    .describe('e', 'Use named exports as opposed to default exports to enable tree shaking.')
    .boolean('e')
    .alias('d', 'dropExtension')
    .describe('d', 'Drop the input files extension')
    .boolean('d')
    .alias('s', 'silent')
    .describe('s', 'Silent output. Do not show "files written" messages')
    .boolean('s')
    .alias('f', 'followSymlinks')
    .describe('f', 'Follow symlinks')
    .boolean('f')
    .alias('h', 'help')
    .help('h')
    .version(require('../package.json').version);
main();
async function main() {
    const argv = yarg.argv;
    if (argv.h) {
        yarg.showHelp();
        return;
    }
    let searchDir;
    if (argv._ && argv._[0]) {
        searchDir = argv._[0];
    }
    else if (argv.p) {
        searchDir = './';
    }
    else {
        yarg.showHelp();
        return;
    }
    await (0, run_1.run)(searchDir, {
        pattern: argv.p,
        outDir: argv.o,
        watch: argv.w,
        camelCase: argv.c,
        namedExports: argv.e,
        dropExtension: argv.d,
        silent: argv.s,
        listDifferent: argv.l,
        followSymlinks: argv.f,
    });
}
//# sourceMappingURL=cli.js.map