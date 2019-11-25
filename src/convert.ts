import {
  booleanLiteral,
  Flow,
  FlowType,
  FunctionTypeAnnotation,
  identifier,
  Identifier,
  isTSTypeParameter,
  isTypeParameter,
  Node,
  numericLiteral,
  objectTypeIndexer,
  QualifiedTypeIdentifier,
  stringLiteral,
  tsAnyKeyword,
  tsArrayType,
  tsAsExpression,
  tsBooleanKeyword,
  tsFunctionType,
  TSFunctionType,
  tsIntersectionType,
  tsLiteralType,
  tsNullKeyword,
  tsNumberKeyword,
  tsPropertySignature,
  tsQualifiedName,
  TSQualifiedName,
  tsStringKeyword,
  tsThisType,
  tsTupleType,
  TSType,
  tsTypeAliasDeclaration,
  tsTypeAnnotation,
  TSTypeElement,
  tsTypeLiteral,
  tsTypeParameter,
  tsTypeParameterDeclaration,
  tsTypeParameterInstantiation,
  tsTypeQuery,
  tsTypeReference,
  tsUndefinedKeyword,
  tsUnionType,
  tsUnknownKeyword,
  TypeAnnotation,
  TypeParameter,
  ObjectTypeIndexer,
  tsIndexSignature,
  TSTypeParameter,
  TSTypeAliasDeclaration,
  TypeAlias,
  tsInterfaceDeclaration,
  TSExpressionWithTypeArguments,
  tsInterfaceBody,
  ObjectTypeAnnotation,
  ObjectTypeProperty,
  TSPropertySignature,
  InterfaceExtends,
  tsParenthesizedType,
  RestElement,
  FunctionTypeParam,
  restElement,
  tsTypeOperator,
  File,
  Program,
  Statement,
  typeAlias,
  importDeclaration,
  tsVoidKeyword,
  FunctionDeclaration,
  ArrayPattern,
  AssignmentPattern,
  ObjectPattern,
  TSParameterProperty,
  functionDeclaration
} from '@babel/types'
import { generateFreeIdentifier } from './utils'
import { file } from '@babel/types'
import { program } from '@babel/types'
import { Warning } from '.'
import { exportNamedDeclaration } from '@babel/types'

interface ToTsContext {
  functionReturnType?: boolean
}

export function typeAliasToTsTypeAliasDeclaration(
  node: TypeAlias,
  warnings: Warning[]
): TSTypeAliasDeclaration {
  const typeParameters = node.typeParameters
    ? tsTypeParameterDeclaration(
        node.typeParameters.params.map(param =>
          toTsTypeParameter(param, warnings)
        )
      )
    : null
  return tsTypeAliasDeclaration(
    node.id,
    typeParameters,
    toTs(node.right, warnings)
  )
}

// TODO: Add more overloads
export function _toTs(
  node: File,
  warnings: Warning[],
  context?: ToTsContext
): File
export function _toTs(
  node: Program,
  warnings: Warning[],
  context?: ToTsContext
): Program
export function _toTs(
  node: Statement,
  warnings: Warning[],
  context?: ToTsContext
): Statement
export function _toTs(
  node: ObjectTypeProperty,
  warnings: Warning[],
  context?: ToTsContext
): TSPropertySignature
export function _toTs(
  node: InterfaceExtends,
  warnings: Warning[],
  context?: ToTsContext
): TSExpressionWithTypeArguments
export function _toTs<T extends TSType>(
  node: T,
  warnings: Warning[],
  context?: ToTsContext
): T
export function _toTs(
  node: Node,
  warnings: Warning[],
  context?: ToTsContext
): TSType
export function _toTs(
  node: Flow,
  warnings: Warning[],
  context?: ToTsContext
): TSType
export function _toTs(
  node: Flow | TSType | Node,
  warnings: Warning[],
  context?: ToTsContext
): TSType | Node {
  switch (node.type) {
    // TS types
    // TODO: Why does tsTs get called with TSTypes? It should only get called with Flow types.
    case 'TSAnyKeyword':
    case 'TSArrayType':
    case 'TSBooleanKeyword':
    case 'TSConstructorType':
    case 'TSExpressionWithTypeArguments':
    case 'TSFunctionType':
    case 'TSIndexedAccessType':
    case 'TSIntersectionType':
    case 'TSLiteralType':
    case 'TSMappedType':
    case 'TSNeverKeyword':
    case 'TSNullKeyword':
    case 'TSNumberKeyword':
    case 'TSObjectKeyword':
    case 'TSParenthesizedType':
    case 'TSStringKeyword':
    case 'TSSymbolKeyword':
    case 'TSThisType':
    case 'TSTupleType':
    case 'TSTypeLiteral':
    case 'TSTypeOperator':
    case 'TSTypePredicate':
    case 'TSTypeQuery':
    case 'TSTypeReference':
    case 'TSUndefinedKeyword':
    case 'TSUnionType':
    case 'TSVoidKeyword':
    case 'TSTypeAnnotation':
    case 'TSTypeParameterDeclaration':
    case 'TSAsExpression':
    case 'TSPropertySignature':
      return node

    case 'TypeAlias':
      return typeAliasToTsTypeAliasDeclaration(node, warnings)

    case 'TypeAnnotation':
      return tsTypeAnnotation(toTsType(node, warnings, context))

    case 'InterfaceDeclaration':
      const { properties, spreads } = objectTypeAnnotationPropertiesAndSpreads(
        node.body,
        warnings
      )
      if (spreads.length) {
        throw new Error('Spreads in interfaces unsupported')
      }
      return tsInterfaceDeclaration(
        node.id,
        node.typeParameters
          ? tsTypeParameterDeclaration(
              node.typeParameters.params.map(param =>
                toTsTypeParameter(param, warnings)
              )
            )
          : null,
        node.extends && node.extends.length
          ? node.extends.map(_ => toTs(_, warnings))
          : null,
        tsInterfaceBody(properties)
      )

    // Flow types
    case 'AnyTypeAnnotation':
    case 'ArrayTypeAnnotation':
    case 'BooleanTypeAnnotation':
    case 'BooleanLiteralTypeAnnotation':
    case 'ExistsTypeAnnotation':
    case 'FunctionTypeAnnotation':
    case 'GenericTypeAnnotation':
    case 'IntersectionTypeAnnotation':
    case 'MixedTypeAnnotation':
    case 'NullableTypeAnnotation':
    case 'NullLiteralTypeAnnotation':
    case 'NumberTypeAnnotation':
    case 'StringLiteralTypeAnnotation':
    case 'StringTypeAnnotation':
    case 'ThisTypeAnnotation':
    case 'TupleTypeAnnotation':
    case 'TypeofTypeAnnotation':
    case 'ObjectTypeAnnotation':
    case 'UnionTypeAnnotation':
    case 'VoidTypeAnnotation':
    case 'NumberLiteralTypeAnnotation':
      return toTsType(node, warnings, context)

    case 'FunctionDeclaration':
      return functionDeclarationToTsType(node, warnings)

    case 'ObjectTypeIndexer':
      // return tsTypeLiteral([tsIndexSignature(node.parameters)])
      return objectTypeIndexer(
        node.id || identifier(generateFreeIdentifier([])),
        node.key,
        node.value
      )

    case 'ObjectTypeProperty':
      if (node.variance && node.variance.kind === 'plus') {
        warnings.push([
          `Contravariance can't be expressed in TypeScript`,
          'https://github.com/Microsoft/TypeScript/issues/1394',
          node.loc ? node.loc.start.line : 0,
          node.loc ? node.loc.start.column : 0
        ])
      }
      const _ = tsPropertySignature(
        node.key,
        tsTypeAnnotation(toTs(node.value, warnings))
      )
      _.optional = node.optional
      _.readonly = node.variance && node.variance.kind === 'minus'
      // TODO: anonymous indexers
      // TODO: named indexers
      // TODO: call properties
      // TODO: variance
      return _

    case 'TypeCastExpression':
      return tsAsExpression(
        node.expression,
        toTsType(node.typeAnnotation, warnings)
      )

    case 'TypeParameterDeclaration':
      let params = node.params.map((_, idx) => {
        let d = ((_ as any) as TypeParameter).default
        const { name } = _
        if (!name) {
          throw new Error(
            `TypeParameterDeclaration parameter ${idx} has no name`
          )
        }
        let p = tsTypeParameter(
          hasBound(_) ? toTsType(_.bound.typeAnnotation, warnings) : undefined,
          d ? toTs(d, warnings) : undefined,
          name
        )
        return p
      })

      return tsTypeParameterDeclaration(params)

    case 'QualifiedTypeIdentifier':
      return tsQualifiedName(toTsTypeName(node.qualification), node.id)

    case 'ClassImplements':
    case 'DeclareClass':
    case 'DeclareFunction':
    case 'DeclareInterface':
    case 'DeclareModule':
    case 'DeclareTypeAlias':
    case 'DeclareVariable':
    case 'FunctionTypeParam':
    case 'InterfaceExtends':
    case 'InterfaceDeclaration':
    case 'TypeAlias':
    case 'TypeParameterInstantiation':
    case 'ObjectTypeCallProperty':
    case 'ObjectTypeIndexer':
    case 'ClassProperty':
    case 'ExistsTypeAnnotation':
      throw new Error(`Support for '${node.type}' is not implemented yet`)

    case 'File':
      return file(toTs(node.program, warnings), node.comments, node.tokens)

    case 'Program':
      return program(
        node.body.map(statement => toTs(statement, warnings)),
        node.directives,
        node.sourceType,
        node.interpreter
      )

    case 'ImportDeclaration':
      if (node.importKind === 'type') {
        // remove the 'type' from the declaration
        return importDeclaration(node.specifiers, node.source)
      } else {
        return node
      }

    case 'ExportNamedDeclaration':
      if (node.exportKind === 'type') {
        return exportNamedDeclaration(node.declaration, node.specifiers)
      } else {
        return node
      }

    case 'OpaqueType':
      warnings.push([
        `Opaque types can't be expressed in TypeScript`,
        'https://github.com/Microsoft/TypeScript/issues/202',
        node.loc ? node.loc.start.line : 0,
        node.loc ? node.loc.start.column : 0
      ])
      return typeAlias(
        (node as any).id,
        (node as any).typeParameters,
        (node as any).impltype
      )
    default:
      return node
  }
}

function copyCommentsToFrom(to: TSType | Node, from: FlowType | TSType | Node) {
  to.leadingComments = from.leadingComments
  to.innerComments = from.innerComments
  to.trailingComments = from.trailingComments
  to.start = from.start
  to.end = from.end
  to.loc = from.loc
}

export const toTs: typeof _toTs = (
  node: any,
  warnings: Warning[],
  context?: ToTsContext
) => {
  const newNode = _toTs(node, warnings, context)
  if (newNode !== node) {
    copyCommentsToFrom(newNode, node)
  }
  return newNode
}

export function toTsTypeName(
  node: Identifier | QualifiedTypeIdentifier
): Identifier | TSQualifiedName {
  switch (node.type) {
    case 'Identifier':
      return node
    case 'QualifiedTypeIdentifier':
      return tsQualifiedName(toTsTypeName(node.qualification), node.id)
  }
  throw new Error('Could not convert to TS identifier')
}

export function _toTsType(
  node: FlowType | Node,
  warnings: Warning[],
  context?: ToTsContext
): TSType {
  if (node.type.match(/^TS[A-Z]/)) {
    // @ts-ignore A `TS*` type has somehow made it into here; something's not obeying the types.
    return node
  }
  switch (node.type) {
    case 'Identifier':
    case 'QualifiedTypeIdentifier':
      throw new Error(
        `'${node.type}' passed to toTsType, instead use \`tsTypeReference(toTsTypeName(node))\``
      )

    case 'TypeAnnotation':
      return toTsType(node.typeAnnotation, warnings, context)

    case 'AnyTypeAnnotation':
      return tsAnyKeyword()
    case 'ArrayTypeAnnotation':
      return tsArrayType(toTsType(node.elementType, warnings))
    case 'BooleanTypeAnnotation':
      return tsBooleanKeyword()
    case 'BooleanLiteralTypeAnnotation':
      return tsLiteralType(booleanLiteral(node.value!))
    case 'FunctionTypeAnnotation':
      return functionToTsType(node, warnings)
    case 'GenericTypeAnnotation': {
      if (node.id.type === 'Identifier' && node.id.name === '$Exact') {
        warnings.push([
          `$Exact types can't be expressed in TypeScript`,
          'https://github.com/Microsoft/TypeScript/issues/12936',
          node.loc ? node.loc.start.line : 0,
          node.loc ? node.loc.start.column : 0
        ])
        return toTsType(node.typeParameters!.params[0], warnings)
      } else if (node.id.type === 'Identifier' && node.id.name === '$Keys') {
        const op = tsTypeOperator(
          toTsType(node.typeParameters!.params[0], warnings)
        )
        op.operator = 'keyof'
        return op
      } else if (
        node.id.type === 'Identifier' &&
        node.id.name === '$ReadOnly'
      ) {
        // Rename to 'Readonly'
        node.id.name = 'Readonly'
        return toTsType(node, warnings)
      } else if (node.typeParameters && node.typeParameters.params.length) {
        return tsTypeReference(
          toTsTypeName(node.id),
          tsTypeParameterInstantiation(
            node.typeParameters.params.map(p => toTsType(p, warnings, context))
          )
        )
      } else {
        return tsTypeReference(toTsTypeName(node.id))
      }
    }
    case 'IntersectionTypeAnnotation':
      return tsIntersectionType(
        node.types.map(type => toTsType(type, warnings))
      )
    case 'MixedTypeAnnotation':
      return tsUnknownKeyword()
    case 'NullLiteralTypeAnnotation':
      return tsNullKeyword()
    case 'NullableTypeAnnotation':
      return tsUnionType([
        toTsType(node.typeAnnotation, warnings),
        tsNullKeyword(),
        tsUndefinedKeyword()
      ])
    case 'NumberLiteralTypeAnnotation':
      return tsLiteralType(numericLiteral(node.value!))
    case 'NumberTypeAnnotation':
      return tsNumberKeyword()
    case 'StringLiteralTypeAnnotation':
      return tsLiteralType(stringLiteral(node.value!))
    case 'StringTypeAnnotation':
      return tsStringKeyword()
    case 'ThisTypeAnnotation':
      return tsThisType()
    case 'TupleTypeAnnotation':
      return tsTupleType(node.types.map(type => toTsType(type, warnings)))
    case 'TypeofTypeAnnotation':
      return tsTypeQuery(getId(node.argument))

    case 'ObjectTypeAnnotation': {
      if (node.exact) {
        warnings.push([
          `Exact types can't be expressed in TypeScript`,
          'https://github.com/Microsoft/TypeScript/issues/12936',
          node.loc ? node.loc.start.line : 0,
          node.loc ? node.loc.start.column : 0
        ])
      }
      const { properties, spreads } = objectTypeAnnotationPropertiesAndSpreads(
        node,
        warnings
      )
      const propertyType = tsTypeLiteral(properties)
      return spreads.length
        ? tsIntersectionType([
            ...(properties.length ? [propertyType] : []),
            ...spreads
          ])
        : propertyType
    }
    case 'UnionTypeAnnotation':
      return tsUnionType(
        node.types.map(type => {
          const tsType = toTs(type, warnings, context)
          if (tsType.type === 'TSFunctionType') {
            return tsParenthesizedType(tsType)
          }
          return tsType
        })
      )
    case 'VoidTypeAnnotation':
      if (context && context.functionReturnType) {
        // Void is only appropriate as a function return type
        return tsVoidKeyword()
      } else {
        return tsUndefinedKeyword()
      }
    case 'ExistsTypeAnnotation':
      return tsAnyKeyword()
    default:
      throw new Error(`Didn't understand type '${node.type}'`)
  }
}

export const toTsType: typeof _toTsType = (
  node,
  warnings: Warning[],
  context?: ToTsContext
) => {
  const newNode = _toTsType(node, warnings, context)
  copyCommentsToFrom(newNode, node)
  return newNode
}

function _toTsIndexSignature(
  indexer: ObjectTypeIndexer,
  warnings: Warning[]
): TSTypeElement {
  const id = indexer.id ? indexer.id : identifier(generateFreeIdentifier([]))
  id.typeAnnotation = tsTypeAnnotation(toTsType(indexer.key, warnings))
  return tsIndexSignature(
    [id],
    tsTypeAnnotation(toTsType(indexer.value, warnings))
  )
}

const toTsIndexSignature: typeof _toTsIndexSignature = (
  indexer,
  warnings: Warning[]
) => {
  const newNode = _toTsIndexSignature(indexer, warnings)
  copyCommentsToFrom(newNode, indexer)
  return newNode
}

function toTsTypeParameter(
  typeParameter: TypeParameter,
  warnings: Warning[]
): TSTypeParameter {
  // TODO: How is this possible?
  if (isTSTypeParameter(typeParameter)) {
    return typeParameter
  }

  let constraint = typeParameter.bound
    ? toTsType(typeParameter.bound, warnings)
    : undefined
  let default_ = typeParameter.default
    ? toTs(typeParameter.default, warnings)
    : undefined
  if (!typeParameter.name) {
    throw new Error('toTsTypeParameter: no name in type parameter')
  }
  let param = tsTypeParameter(constraint, default_, typeParameter.name)
  return param
}

export function getId(node: Identifier | QualifiedTypeIdentifier): Identifier
export function getId(node: FlowType): Identifier
export function getId(
  node: Identifier | QualifiedTypeIdentifier | FlowType
): Identifier {
  switch (node.type) {
    case 'Identifier':
      return node
    case 'QualifiedTypeIdentifier':
      // TODO: convert this properly!
      // @ts-ignore
      return node
    case 'GenericTypeAnnotation':
      if (node.id.type === 'Identifier') {
        return node.id
      } else {
        // TODO: convert this properly!
        console.warn(
          `Unimplemented in 'getId': GenericTypeAnnotation with node.id.type === '${node.id.type}'`
        )
        // @ts-ignore
        return node.id
      }
    default:
      throw ReferenceError('typeof query must reference a node that has an id')
  }
}

function functionDeclarationToTsType(
  node: FunctionDeclaration,
  warnings: Warning[]
): FunctionDeclaration {
  let typeParams

  if (node.typeParameters && node.typeParameters.type !== 'Noop') {
    typeParams = tsTypeParameterDeclaration(
      (node.typeParameters.params as (TypeParameter | TSTypeParameter)[]).map(
        param => {
          if (param.type === 'TSTypeParameter') {
            return param
          } else {
            return toTsTypeParameter(param, warnings)
          }
        }
      )
    )
  }

  const returnTypeType = node.returnType
    ? toTs(node.returnType, warnings, { functionReturnType: true })
    : null
  if (node.returnType && !returnTypeType) {
    throw new Error(`Could not convert return type '${node.returnType.type}'`)
  }
  let paramNames = node.params
    .map((_: any) => _.name)
    .filter(_ => _ !== null)
    .map(_ => (_ as Identifier).name)
  const parameters: Array<
    | Identifier
    | RestElement
    | AssignmentPattern
    | ObjectPattern
    | ArrayPattern
    | TSParameterProperty
  > = node.params.map(_ => {
    if (_.type === 'ArrayPattern') {
      return _
    }
    if (_.type === 'AssignmentPattern') {
      return _
    }
    if (_.type === 'RestElement') {
      return _
    }
    if (_.type === 'ObjectPattern') {
      return _
    }
    if (_.type === 'TSParameterProperty') {
      return _
    }
    let name = _.name

    // Generate param name? (Required in TS, optional in Flow)
    if (name == null) {
      name = generateFreeIdentifier(paramNames)
      paramNames.push(name)
    }

    let id = identifier(name)

    if (_.typeAnnotation) {
      id.typeAnnotation = tsTypeAnnotation(toTsType(_.typeAnnotation, warnings))
    }

    return id
  })
  const fn = functionDeclaration(node.id, parameters, node.body)
  fn.returnType = returnTypeType ? (returnTypeType as any) : undefined
  fn.typeParameters = typeParams || null
  fn.async = node.async
  fn.declare = node.declare
  fn.generator = node.generator
  return fn
}

function functionToTsType(
  node: FunctionTypeAnnotation,
  warnings: Warning[]
): TSFunctionType {
  let typeParams

  if (node.typeParameters) {
    typeParams = tsTypeParameterDeclaration(
      node.typeParameters.params.map(param =>
        toTsTypeParameter(param, warnings)
      )
    )
  }

  const returnTypeType = node.returnType
    ? toTs(node.returnType, warnings, { functionReturnType: true })
    : null
  if (node.returnType && !returnTypeType) {
    throw new Error(`Could not convert return type '${node.returnType.type}'`)
  }
  let paramNames = node.params
    .map(_ => _.name)
    .filter(_ => _ !== null)
    .map(_ => (_ as Identifier).name)
  const parameters: Array<Identifier | RestElement> = node.params.map(_ => {
    let name = _.name && _.name.name

    // Generate param name? (Required in TS, optional in Flow)
    if (name == null) {
      name = generateFreeIdentifier(paramNames)
      paramNames.push(name)
    }

    let id = identifier(name)

    if (_.typeAnnotation) {
      id.typeAnnotation = tsTypeAnnotation(toTsType(_.typeAnnotation, warnings))
    }

    return id
  })
  if (node.rest) {
    parameters.push(toTsRestParameter(node.rest, warnings))
  }
  return tsFunctionType(
    typeParams,
    parameters,
    node.returnType ? tsTypeAnnotation(returnTypeType as any) : undefined
  )
}

function toTsRestParameter(
  rest: FunctionTypeParam,
  warnings: Warning[]
): RestElement {
  if (!rest.name) {
    throw new Error('Rest parameter must have name')
  }
  const restEl = restElement(getId(rest.name))
  restEl.typeAnnotation = tsTypeAnnotation(
    toTsType(rest.typeAnnotation, warnings)
  )
  return restEl
}

function hasBound(node: Node): node is BoundedTypeParameter {
  return isTypeParameter(node) && node.bound != null
}

interface BoundedTypeParameter extends TypeParameter {
  bound: TypeAnnotation
}

function objectTypeAnnotationPropertiesAndSpreads(
  node: ObjectTypeAnnotation,
  warnings: Warning[]
): { properties: TSTypeElement[]; spreads: TSType[] } {
  const spreads: TSType[] = []
  const properties: TSTypeElement[] = []

  node.properties.forEach(_ => {
    if (_.type === 'ObjectTypeSpreadProperty') {
      spreads.push(toTs(_.argument, warnings))
    } else {
      properties.push(toTs(_, warnings))
    }
  })

  if (node.indexers) {
    node.indexers.forEach(_ => {
      properties.push(toTsIndexSignature(_, warnings))
    })
  }

  return {
    properties,
    spreads
  }
}
