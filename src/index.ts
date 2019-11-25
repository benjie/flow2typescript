import { parse } from '@babel/parser';
import generate from '@babel/generator';
import traverse, { Node, Visitor, VisitNode } from '@babel/traverse';
import { File, CommentBlock, CommentLine } from '@babel/types';
import { dropWhile, pullAt } from 'lodash';
import { EOL } from 'os';
import { relative } from 'path';
import { toTs } from './convert';

export type Warning = [string, string, number, number];

export async function compile(code: string, filename: string) {
  const parsed = parse(code, {
    plugins: ['classProperties', 'flow', 'objectRestSpread'],
    sourceType: 'module'
  });
  let [warnings, ast] = await convert(parsed, code);

  warnings.forEach(([message, issueURL, line, column]) => {
    console.log(
      `Warning: ${message} (at ${relative(
        __dirname,
        filename
      )}: line ${line}, column ${column}). See ${issueURL}`
    );
  });

  return addTrailingSpace(
    trimLeadingNewlines(
      generate(stripAtFlowAnnotation(ast), {
        retainLines: true
      }).code
    )
  );
}

function backfillMissingComments<T extends Node>(ast: T, code: string): void {
  // Add missing comments
  const comments: (CommentBlock | CommentLine)[] = (ast as any).comments;
  const seenComments: (CommentBlock | CommentLine)[] = [];

  const checkSeen = (c: CommentBlock | CommentLine) => {
    if (comments.includes(c) && !seenComments.includes(c)) {
      seenComments.push(c);
    }
  };

  traverse(ast, {
    enter(path) {
      const node = path.node;
      if (node.leadingComments) {
        node.leadingComments.forEach(checkSeen);
      }
      if (node.trailingComments) {
        node.trailingComments.forEach(checkSeen);
      }
      if (node.innerComments) {
        node.innerComments.forEach(checkSeen);
      }
    }
  });

  const unseenComments: (CommentBlock | CommentLine)[] = [];
  comments.forEach(c => {
    if (!seenComments.includes(c)) {
      unseenComments.push(c);
    }
  });

  if (unseenComments.length > 0) {
    console.log(
      'The following comments are not represented in leadingComments, trailingComments or innerComments of any node in the AST:'
    );
    console.log(unseenComments);
    console.log('Attempting to add them back into the AST');
    traverse(ast, {
      enter(path) {
        let node = path.node;
        if (node && (node as any).typeAnnotation) {
          node = (node as any).typeAnnotation;
        }
        for (const comment of unseenComments) {
          if (
            node.end &&
            node.end < comment.start &&
            node.end > comment.start - 20
          ) {
            const inBetween = code.substring(node.end, comment.start);
            if (inBetween.match(/^(\s*[,;])?\s*$/)) {
              if (!node.trailingComments) {
                node.trailingComments = [];
              }
              (node.trailingComments as any).push(comment);
              unseenComments.splice(unseenComments.indexOf(comment), 1);
            }
          }
        }
      }
    });
    if (unseenComments.length > 0) {
      console.error(
        "The following comments couldn't be added back into the AST"
      );
      console.error(unseenComments);
      throw new Error('Failed to move all comments into the AST; aborting');
    }
    console.log('Successfully backfilled comments into the AST');
  }
}

/**
 * @internal
 */
export async function convert(
  ast: File,
  code: string
): Promise<[Warning[], File]>;
export async function convert<T extends Node>(
  ast: T,
  code: string
): Promise<[Warning[], Node]>;
export async function convert<T extends Node>(
  ast: T,
  code: string
): Promise<[Warning[], Node]> {
  let warnings: Warning[] = [];

  backfillMissingComments(ast, code);

  const outAst = toTs(ast, warnings);
  const visit: VisitNode<any, any> = path => {
    path.replaceWith(toTs(path.node, warnings));
  };
  const visitor: Visitor<Node> = {
    ExportNamedDeclaration: visit,
    FunctionTypeAnnotation: visit,
    GenericTypeAnnotation: visit,
    ImportDeclaration: visit,
    InterfaceDeclaration: visit,
    NullableTypeAnnotation: visit,
    ObjectTypeAnnotation: visit,
    ObjectTypeIndexer: visit,
    ObjectTypeProperty: visit,
    OpaqueType: visit,
    TypeAlias: visit,
    TypeAnnotation: visit,
    TypeCastExpression: visit,
    TypeParameterDeclaration: visit,
    VoidTypeAnnotation: visit
  };
  traverse(outAst, visitor);
  return [warnings, outAst];
}

function stripAtFlowAnnotation(ast: File): File {
  if (!ast.program.body.length) {
    return ast;
  }
  let { leadingComments } = ast.program.body[0];
  if (leadingComments) {
    let index = leadingComments.findIndex(_ => _.value.trim() === '@flow');
    if (index > -1) {
      pullAt(leadingComments, index);
    }
  }
  return ast;
}

function addTrailingSpace(file: string): string {
  if (file.endsWith(EOL)) {
    return file;
  }
  return file + EOL;
}

function trimLeadingNewlines(file: string): string {
  return dropWhile(file.split(EOL), _ => !_).join(EOL);
}
