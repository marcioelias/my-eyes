<?php

declare(strict_types=1);

return [

    'types' => [
        'text' => 'Text',
        'number' => 'Number',
        'date' => 'Date',
        'boolean' => 'Yes / No',
        'select' => 'Option',
    ],

    'operators' => [
        'eq' => 'is',
        'neq' => 'is not',
        'contains' => 'contains',
        'not_contains' => 'does not contain',
        'starts' => 'starts with',
        'ends' => 'ends with',
        'gt' => 'is greater than',
        'gte' => 'is greater than or equal to',
        'lt' => 'is less than',
        'lte' => 'is less than or equal to',
        'between' => 'is between',
        'in' => 'is one of',
        'empty' => 'is empty',
        'not_empty' => 'is not empty',
    ],

    'ui' => [
        'title' => 'Filters',
        'add' => 'Add condition',
        'remove' => 'Remove condition',
        'apply' => 'Apply',
        'clear' => 'Clear all',
        'field' => 'Field',
        'operator' => 'Operator',
        'value' => 'Value',
        'or' => 'or',
        'and' => 'and',
        'where' => 'Where',
        'empty' => 'No conditions yet. Add one to narrow the results.',
        'active' => '{1} :count filter|[2,*] :count filters',
        'comma_hint' => 'Separate values with commas',
    ],

    'table' => [
        'search' => 'Search',
        'per_page' => 'Per page',
        'showing' => 'Showing :first–:last of :total',
        'empty' => 'No records found',
        'empty_filtered' => 'No records match these filters',
        'sort_asc' => 'Sorted ascending',
        'sort_desc' => 'Sorted descending',
        'previous' => 'Previous',
        'next' => 'Next',
        'retry' => 'Retry',
    ],

];
