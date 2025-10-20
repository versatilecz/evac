import { useSort, type $SortRule } from '@evac/shared'
import { computed, inject, provide, toValue, type ComputedRef, type MaybeRefOrGetter, type Ref, type StyleValue } from 'vue'

type Field = {
  key: string
  visible?: MaybeRefOrGetter<boolean>
  fill?: MaybeRefOrGetter<boolean>
}

type Options = {
  initialSort: $SortRule
  fields?: Field[]
}

const LIST_CONTEXT = Symbol('list')

type ListContext = {
  gridStyle: ComputedRef<StyleValue>
  rowStyle: ComputedRef<StyleValue>
  sort: Ref<$SortRule>
  sortBy: ReturnType<typeof useSort>['sortBy']
  visible: ComputedRef<Record<string, boolean>>
}

export function defineListFields(...fields: Field[]): Field[] {
  return fields
}

export function useList({ initialSort, fields }: Options): ListContext {
  const { sort, sortBy } = useSort({ initial: initialSort })

  const visibleFields = computed(() => {
    return [...filterVisibleFields(toValue(fields))]
  })

  const visible = computed(() => {
    return Object.fromEntries(toFieldsVisibilityEntries(visibleFields.value))
  })

  const gridStyle = computed(() => {
    const fields = visibleFields.value
    console.log('visible', fields)
    const columns = fields.map((field) => (field.fill ? '1fr' : 'max-content'))
    return {
      display: 'grid',
      'grid-template-columns': columns.join(' '),
    } satisfies StyleValue
  })

  const rowStyle = computed(() => {
    const count = visibleFields.value.length
    return {
      'grid-column': `span ${count} / span ${count}`,
    } satisfies StyleValue
  })

  provide(LIST_CONTEXT, { gridStyle, rowStyle, sort, sortBy, visible } satisfies ListContext)

  return {
    gridStyle,
    rowStyle,
    sort,
    sortBy,
    visible,
  } satisfies ListContext
}

function* toFieldsVisibilityEntries(fields: Iterable<Field> = []): Iterable<[string, boolean]> {
  for (const field of fields ?? []) {
    yield [field.key, isFieldVisible(field)]
  }
}

function* filterVisibleFields(fields: Iterable<Field> = []) {
  for (const field of fields ?? []) {
    if (!isFieldVisible(field)) continue
    yield field
  }
}

function isFieldVisible(field: Field): boolean {
  if (typeof field.visible === 'undefined') {
    return true
  }
  return toValue(field.visible) ?? false
}

export function useListContext(shouldAssert: true): ListContext
export function useListContext(shouldAssert?: false): ListContext | undefined
export function useListContext(shouldAssert?: boolean): ListContext | undefined {
  const context = inject<ListContext>(LIST_CONTEXT)

  if (shouldAssert && !context) {
    throw new Error('useListContext must be used within a useList provider')
  }

  console.log(context)

  return context
}
