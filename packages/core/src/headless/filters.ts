/*
 * The data model behind the advanced filter builder.
 *
 * Framework-free on purpose: the Blade binding, and later the Vue and React
 * components, all drive the same shapes. The server sends the schema, so the
 * set of filterable fields and their operators is decided in one place (the
 * column definitions) and cannot drift from what the query will accept.
 */

export interface FilterOperatorSchema {
    value: string
    label: string
    /** How many value inputs this operator needs: 0, 1 or 2. */
    values: number
}

export interface FilterFieldSchema {
    key: string
    label: string
    type: 'text' | 'number' | 'date' | 'boolean' | 'select'
    inputType: string
    operators: FilterOperatorSchema[]
    options: Record<string, string>
}

export interface FilterCondition {
    field: string
    operator: string
    values: string[]
}

export function findField(schema: FilterFieldSchema[], key: string): FilterFieldSchema | undefined {
    return schema.find((field) => field.key === key)
}

export function findOperator(field: FilterFieldSchema, value: string): FilterOperatorSchema | undefined {
    return field.operators.find((operator) => operator.value === value)
}

/**
 * A blank condition for a field, defaulting to its first operator.
 */
export function blankCondition(field: FilterFieldSchema): FilterCondition {
    return {
        field: field.key,
        operator: field.operators[0]?.value ?? '',
        values: [],
    }
}

/**
 * Reconciles a condition after its field changed: the previously chosen
 * operator may not exist for the new field, and values from a date field are
 * meaningless on a select.
 */
export function retargetCondition(condition: FilterCondition, field: FilterFieldSchema): FilterCondition {
    const operator = findOperator(field, condition.operator) ?? field.operators[0]

    return {
        field: field.key,
        operator: operator?.value ?? '',
        values: [],
    }
}

/**
 * Trims or pads the values array to what the operator expects, so a condition
 * never carries a stale second value after switching away from "between".
 */
export function fitValues(values: string[], count: number): string[] {
    const fitted: string[] = []

    for (let index = 0; index < count; index++) {
        fitted.push(values[index] ?? '')
    }

    return fitted
}
