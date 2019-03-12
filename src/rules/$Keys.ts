import {
  GenericTypeAnnotation,
  tsTypeOperator,
  tsTypeReference
} from '@babel/types'
import { addRule } from '../'
import { getId } from '../convert'

addRule('$Keys', () => ({
  GenericTypeAnnotation(path) {
    if (path.node.id.name !== '$Keys') {
      return
    }
    let { id } = path.node.typeParameters.params[0] as GenericTypeAnnotation
    let op = tsTypeOperator(tsTypeReference(getId(id)))
    path.replaceWith(op)
  }
}))
