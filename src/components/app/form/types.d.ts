import type { FormItemRule, SelectOption } from 'naive-ui'

interface FormItemBase {
  label: string
  placeholder?: string
  required?: boolean
  span?: number
  rules?: FormItemRule | FormItemRule[]
}

interface FormSpace {
  type: 'space'
  span?: number
}

interface FormItemCheckbox extends Omit<FormItemBase, 'label' | 'placeholder'> {
  label?: string
  type: 'checkbox'
  content: string
}

interface FormItemDate extends FormItemBase {
  type: 'date'
}

interface FormItemInput extends FormItemBase {
  type: 'input'
  mono?: boolean
  prefix?: string
  suffix?: string
}

interface FormItemNumber extends FormItemBase {
  type: 'number'
  buttons?: boolean
  min?: number
  max?: number
  prefix?: string
  suffix?: string
}

interface FormItemRadio extends FormItemBase {
  type: 'radio'
  options: {
    label: string
    value: string | number
  }[]
}

interface FormItemSelect extends FormItemBase {
  type: 'select'
  custom?: boolean
  multiple?: boolean
  options: SelectOption[]
}

interface FormItemTextarea extends FormItemBase {
  type: 'textarea'
  mono?: boolean
}

interface FormItemTime extends FormItemBase {
  type: 'time'
}

export type FormItem = FormSpace | FormItemDate | FormItemCheckbox | FormItemInput | FormItemNumber | FormItemRadio | FormItemSelect | FormItemTextarea | FormItemTime

export interface FormSchema {
  [path: string]: FormItem
}

export interface FormFeedback {
  [path: string]: Array<string>
}
