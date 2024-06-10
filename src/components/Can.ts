import { createContext } from 'react'
import { createContextualCan } from '@casl/react'
import ability from '@/utils/ability.ts'

export const AbilityContext = createContext(ability([]))
export const Can = createContextualCan(AbilityContext.Consumer)
