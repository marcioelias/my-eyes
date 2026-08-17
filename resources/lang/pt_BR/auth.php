<?php

declare(strict_types=1);

return [

    'login' => [
        'heading' => 'Entrar',
        'subheading' => 'Bem-vindo de volta. Informe seus dados para continuar.',
        'remember' => 'Lembrar de mim',
        'forgot' => 'Esqueceu a senha?',
        'submit' => 'Entrar',
        'no_account' => 'Ainda não tem uma conta?',
        'sign_up' => 'Cadastre-se',
        'or' => 'ou',
    ],

    'two_factor' => [
        'title' => 'Autenticação em duas etapas',
        'text' => 'Adicione uma segunda etapa ao seu login, usando um aplicativo autenticador.',
        'off' => 'Desativada',
        'pending' => 'Aguardando confirmação',
        'on' => 'Ativada',
        'enable' => 'Ativar',
        'disable' => 'Desativar',
        'confirm' => 'Confirmar',
        'scan_text' => 'Leia este código no seu aplicativo autenticador e informe o código exibido.',
        'secret' => 'Ou informe esta chave manualmente',
        'code' => 'Código de autenticação',
        'recovery_code' => 'Código de recuperação',
        'recovery_codes' => 'Códigos de recuperação',
        'recovery_text' => 'Guarde-os em local seguro. Cada um permite um único login caso você perca o autenticador. Gerar novos invalida os anteriores.',
        'regenerate' => 'Gerar novos',
        'challenge_heading' => 'Autenticação em duas etapas',
        'challenge_subheading' => 'Informe o código do seu aplicativo autenticador.',
        'challenge_recovery_subheading' => 'Informe um dos códigos de recuperação que você guardou.',
        'challenge_submit' => 'Continuar',
        'use_recovery' => 'Usar um código de recuperação',
        'use_code' => 'Usar um código de autenticação',
    ],

    'passkeys' => [
        'title' => 'Chaves de acesso',
        'text' => 'Entre com sua digital, rosto ou bloqueio de tela, sem senha.',
        'name' => 'Dê um nome a este dispositivo',
        'name_placeholder' => 'Notebook do trabalho',
        'add' => 'Adicionar chave de acesso',
        'empty' => 'Nenhuma chave de acesso ainda.',
        'last_used' => 'Usada :when',
        'never' => 'nunca',
        'sign_in' => 'Entrar com chave de acesso',
        'confirm' => 'Confirmar com chave de acesso',
        'failed' => 'Não foi possível usar a chave de acesso. Tente de novo ou use sua senha.',
        'name_required' => 'Dê um nome a esta chave de acesso primeiro.',
    ],

    'register' => [
        'heading' => 'Crie sua conta',
        'subheading' => 'Leva menos de um minuto.',
        'submit' => 'Criar conta',
        'have_account' => 'Já tem uma conta?',
    ],

    'forgot' => [
        'heading' => 'Esqueceu sua senha?',
        'subheading' => 'Informe seu e-mail e enviaremos um link para redefini-la.',
        'submit' => 'Enviar link de redefinição',
        'back' => 'Voltar para o login',
    ],

    'reset' => [
        'heading' => 'Escolha uma nova senha',
        'subheading' => 'Use algo que você ainda não tenha usado.',
        'submit' => 'Redefinir senha',
    ],

    'verify' => [
        'heading' => 'Verifique seu e-mail',
        'subheading' => 'Enviamos um link de verificação para sua caixa de entrada.',
        'text' => 'Clique no link do e-mail para concluir o cadastro. Se não chegou, podemos enviar outro.',
        'sent' => 'Um novo link de verificação foi enviado para seu e-mail.',
        'resend' => 'Reenviar e-mail de verificação',
    ],

    'confirm' => [
        'heading' => 'Confirme sua senha',
        'subheading' => 'Esta é uma área protegida. Confirme sua senha para continuar.',
        'submit' => 'Confirmar',
    ],

    'fields' => [
        'name' => 'Nome',
        'email' => 'E-mail',
        'password' => 'Senha',
        'new_password' => 'Nova senha',
        'current_password' => 'Senha atual',
        'confirm_password' => 'Confirme a senha',
    ],

    'profile' => [
        'heading' => 'Perfil',
        'subheading' => 'Gerencie os dados e a segurança da sua conta.',
        'information' => 'Dados do perfil',
        'information_text' => 'Atualize seu nome, e-mail e foto.',
        'avatar' => 'Foto',
        'avatar_text' => 'JPG, PNG ou WebP.',
        'unverified' => 'Seu e-mail ainda não foi verificado.',
        'resend' => 'Reenviar o e-mail de verificação',
        'password' => 'Atualizar senha',
        'password_text' => 'Use uma senha longa e aleatória para se manter seguro.',
        'delete' => 'Excluir conta',
        'delete_text' => 'Após a exclusão, todos os dados são removidos permanentemente. Isso não pode ser desfeito.',
        'delete_confirm' => 'Confirme sua senha para continuar',
        'delete_prompt' => 'Excluir esta conta permanentemente?',
    ],

    'dashboard' => [
        'heading' => 'Painel',
        'subheading' => 'Uma visão geral do que está acontecendo.',
        'welcome' => 'Bem-vindo de volta',
        'welcome_text' => 'Esta página é um ponto de partida — substitua pelo seu conteúdo.',
        'components_text' => 'Os componentes ficam em x-me::*. Veja o README do my-eyes para a lista completa.',
        'new_item' => 'Novo item',
    ],

    'nav' => [
        'account' => 'Conta',
        'settings' => 'Configurações',
        'general' => 'Geral',
        'members' => 'Membros',
    ],

];
