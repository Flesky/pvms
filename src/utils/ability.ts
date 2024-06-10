import type { PureAbility } from '@casl/ability'
import { AbilityBuilder, createAliasResolver, createMongoAbility } from '@casl/ability'

type Roles = 'PVMS-management' | 'PVMS-upload' | 'PVMS-viewer'

/*
  * Actions are the CRUD operations
  * read: view
  * create: add
  * update: edit
  * delete: remove
  * modify: add, edit, remove
  * manage: all
 */
export type Actions = 'view' | 'create' | 'update' | 'delete' | 'modify' | 'manage'

/*
  * Subjects are the resources
  * all: all resources
 */
export type Subjects = 'Vouchers' | 'Batch Order' | 'Management' | 'all'

type AppAbility = PureAbility<[Actions, Subjects]>

const resolveAction = createAliasResolver({
  modify: ['create', 'update', 'delete'],
})

export default function defineAbilityFor(roles: Roles[]) {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility)

  if (roles.includes('PVMS-management'))
    can('manage', 'all')

  if (roles.includes('PVMS-upload')) {
    can('manage', 'Batch Order')
    can('view', 'Vouchers')
  }

  if (roles.includes('PVMS-viewer'))
    can('view', 'all')

  return build({
    resolveAction,
  })
}
