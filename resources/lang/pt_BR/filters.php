<?php

declare(strict_types=1);

return [

    'types' => [
        'text' => 'Texto',
        'number' => 'Número',
        'date' => 'Data',
        'boolean' => 'Sim / Não',
        'select' => 'Opção',
    ],

    'operators' => [
        'eq' => 'é',
        'neq' => 'não é',
        'contains' => 'contém',
        'not_contains' => 'não contém',
        'starts' => 'começa com',
        'ends' => 'termina com',
        'gt' => 'é maior que',
        'gte' => 'é maior ou igual a',
        'lt' => 'é menor que',
        'lte' => 'é menor ou igual a',
        'between' => 'está entre',
        'in' => 'é um de',
        'empty' => 'está vazio',
        'not_empty' => 'não está vazio',
    ],

    'ui' => [
        'title' => 'Filtros',
        'add' => 'Adicionar condição',
        'remove' => 'Remover condição',
        'apply' => 'Aplicar',
        'clear' => 'Limpar tudo',
        'field' => 'Campo',
        'operator' => 'Operador',
        'value' => 'Valor',
        'or' => 'ou',
        'and' => 'e',
        'where' => 'Onde',
        'empty' => 'Nenhuma condição ainda. Adicione uma para refinar os resultados.',
        'active' => '{1} :count filtro|[2,*] :count filtros',
        'comma_hint' => 'Separe os valores por vírgula',
    ],

    'table' => [
        'search' => 'Buscar',
        'per_page' => 'Por página',
        'showing' => 'Exibindo :first–:last de :total',
        'empty' => 'Nenhum registro encontrado',
        'empty_filtered' => 'Nenhum registro corresponde a estes filtros',
        'sort_asc' => 'Ordenado crescente',
        'sort_desc' => 'Ordenado decrescente',
        'previous' => 'Anterior',
        'next' => 'Próxima',
    ],

];
