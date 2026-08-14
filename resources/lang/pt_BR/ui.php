<?php

declare(strict_types=1);

return [

    'common' => [
        'yes' => 'Sim',
        'no' => 'Não',
        'close' => 'Fechar',
        'cancel' => 'Cancelar',
        'confirm' => 'Confirmar',
        'ok' => 'OK',
        'remove' => 'Remover',
        'save' => 'Salvar',
        'dismiss' => 'Dispensar',
    ],

    'password' => [
        'show' => 'Mostrar senha',
        'hide' => 'Ocultar senha',
    ],

    'numeric' => [
        'increase' => 'Aumentar',
        'decrease' => 'Diminuir',
    ],

    'upload' => [
        'drop' => 'Arraste arquivos aqui ou :browse',
        'browse' => 'selecione',
        'up_to' => 'até :size',
        'remove' => 'Remover',
        'too_large' => ':name é maior que :limit',
        'wrong_type' => ':name não é um tipo de arquivo aceito',
        'too_many' => 'No máximo :limit arquivos',
    ],

    'layout' => [
        'skip' => 'Ir para o conteúdo',
        'open_menu' => 'Abrir menu',
        'close_menu' => 'Fechar menu',
        'main_nav' => 'Navegação principal',
        'collapse' => 'Recolher',
        'toggle_theme' => 'Alternar tema',
        'account_menu' => 'Menu da conta',
        'profile' => 'Perfil',
        'sign_out' => 'Sair',
    ],

    'theme' => [
        'system' => 'Sistema',
        'light' => 'Claro',
        'dark' => 'Escuro',
        'theme' => 'Tema',
    ],

    'select' => [
        'search' => 'Buscar opções',
        'empty' => 'Nenhuma opção corresponde',
        'placeholder' => 'Selecione uma opção',
        'selected' => ':count selecionados',
        'clear' => 'Limpar seleção',
    ],

    'pagination' => [
        'label' => 'Paginação',
    ],

    'errors' => [
        'go_back' => 'Voltar',
        'back_home' => 'Ir para o início',
        '401' => [
            'title' => 'Não autenticado',
            'text' => 'Você precisa entrar para acessar esta página.',
        ],
        '403' => [
            'title' => 'Acesso negado',
            'text' => 'Você não tem permissão para acessar esta página.',
        ],
        '404' => [
            'title' => 'Página não encontrada',
            'text' => 'A página que você procura não existe ou foi movida.',
        ],
        '419' => [
            'title' => 'Página expirada',
            'text' => 'Sua sessão expirou por segurança. Atualize a página e tente novamente.',
        ],
        '429' => [
            'title' => 'Muitas requisições',
            'text' => 'Você fez muitas requisições em pouco tempo. Aguarde um instante e tente novamente.',
        ],
        '500' => [
            'title' => 'Algo deu errado',
            'text' => 'Ocorreu um erro inesperado do nosso lado. A equipe foi notificada.',
        ],
        '503' => [
            'title' => 'Em manutenção',
            'text' => 'Estamos realizando uma manutenção programada e voltaremos em breve.',
        ],
    ],

];
