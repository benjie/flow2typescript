import { parse } from '@babel/parser'
import generate from '@babel/generator'
import traverse, { Node, Visitor, VisitNode } from '@babel/traverse'
import { File } from '@babel/types'
import { dropWhile, pullAt } from 'lodash'
import { EOL } from 'os'
import { relative } from 'path'
import { toTs } from './convert'

export type Warning = [string, string, number, number]

export async function compile(code: string, filename: string) {
  const parsed = parse(code, {
    plugins: ['classProperties', 'flow', 'objectRestSpread'],
    sourceType: 'module'
  })
  let [warnings, ast] = await convert(parsed)

  warnings.forEach(([message, issueURL, line, column]) => {
    console.log(
      `Warning: ${message} (at ${relative(
        __dirname,
        filename
      )}: line ${line}, column ${column}). See ${issueURL}`
    )
  })

  return addTrailingSpace(
    trimLeadingNewlines(generate(stripAtFlowAnnotation(ast)).code)
  )
}

/**
 * @internal
 */
export async function convert(ast: File): Promise<[Warning[], File]>
export async function convert<T extends Node>(
  ast: T
): Promise<[Warning[], Node]> {
  let warnings: Warning[] = []
  const outAst = toTs(ast, warnings)
  const visit: VisitNode<any, any> = path => {
    path.replaceWith(toTs(path.node, warnings))
  }
  const visitor: Visitor<Node> = {
    GenericTypeAnnotation: visit,
    TypeCastExpression: visit,
    TypeParameterDeclaration: visit,
    ObjectTypeAnnotation: visit,
    FunctionTypeAnnotation: visit,
    ObjectTypeIndexer: visit,
    InterfaceDeclaration: visit,
    NullableTypeAnnotation: visit,
    OpaqueType: visit,
    TypeAlias: visit,
    TypeAnnotation: visit,
    ImportDeclaration: visit,
    ExportNamedDeclaration: visit,
    VoidTypeAnnotation: visit,
    ObjectTypeProperty: visit
  }
  traverse(outAst, visitor)
  return [warnings, outAst]
}

function stripAtFlowAnnotation(ast: File): File {
  let { leadingComments } = ast.program.body[0]
  if (leadingComments) {
    let index = leadingComments.findIndex(_ => _.value.trim() === '@flow')
    if (index > -1) {
      pullAt(leadingComments, index)
    }
  }
  return ast
}

function addTrailingSpace(file: string): string {
  if (file.endsWith(EOL)) {
    return file
  }
  return file + EOL
}

function trimLeadingNewlines(file: string): string {
  return dropWhile(file.split(EOL), _ => !_).join(EOL)
}
