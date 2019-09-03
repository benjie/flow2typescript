import test from 'ava'
import { sync } from 'glob'
import { readFile, writeFile } from 'mz/fs'
import { basename, dirname, resolve } from 'path'
import { compile } from '../src'

// Kind of hacky thing to figure out if -u or --update-snapshots was passed to AVA.
// We manually write expected output in this test.
// It's more clear, and allows us to have input and output files for each test.
const argvString = process.env.npm_config_argv as string
const argv = JSON.parse(argvString || '')
const argvOriginal = argv.original || []
const update =
  argvOriginal.includes('-u') || argvOriginal.includes('--update-snapshots')

const inputPaths = sync(resolve(__dirname, `../../test/**/input.txt`))
const tests = inputPaths.map(inputPath => ({
  inputPath,
  outputPath: dirname(inputPath) + '/output.txt',
  name: basename(dirname(inputPath))
}))

tests.forEach(({ name, inputPath, outputPath }) =>
  test(name, async t => {
    try {
      const input = await readFile(inputPath, 'utf-8')
      const output = await compile(input, inputPath)
      if (update) {
        await writeFile(outputPath, output)
        t.pass()
      } else {
        const expectedOutput = await readFile(outputPath, 'utf-8')
        t.is(output, expectedOutput)
      }
    } catch (e) {
      console.log('error', e)
    }
  })
)
