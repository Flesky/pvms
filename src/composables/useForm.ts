import type { Ref } from 'vue'
import { ref } from 'vue'
import type { FormSchema } from '@/components/app/form/types'
import type AppForm from '@/components/app/form/index.vue'

interface _AppForm extends Ref<InstanceType<typeof AppForm>> {
  validate(): void
}

export default function useForm(schema: FormSchema) {
  // schema = Object.fromEntries(Object.entries(schema).filter(([path, item]) => item.type !== 'space'))
  const formRef = ref<_AppForm | null>(null)
  // const defaultValue = Object.keys(schema).map(key => ({ [key]: null }))

  const formValue = ref<Record<string, any>>({})
  // const formValue = ref<Record<string, unknown>>(Object.assign({}, ...defaultValue))
  const feedback = ref<Record<string, string>>({})
  function setFeedback(record: Record<string, string>) {
    feedback.value = record
  }
  function resetFeedback() {
    feedback.value = {}
  }
  function handleSubmit(callback: () => void | Promise<void>) {
    formRef.value!.form!.validate((errors: any) => {
      resetFeedback()
      if (!errors)
        callback()
    })
  }

  return { formRef, formValue, feedback, setFeedback, handleSubmit }
}
