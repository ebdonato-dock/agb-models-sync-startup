# Models Sync Startup

Extensão para o [Pi](https://pi.dev), em um único arquivo JavaScript, que executa o comando abaixo toda vez que o Pi é iniciado:

```bash
agentic-bus models sync
```

## Funcionamento

- Executa o comando no diretório de trabalho do Pi, via `cmd.exe` no Windows e Bash nos demais sistemas.
- Executa durante o carregamento assíncrono da extensão e aguarda o término do comando antes de concluir esse carregamento.
- Confirma que o `models.json` existe, pode ser lido e contém JSON válido.
- Em caso de falha do comando ou da validação, retorna um erro de carregamento da extensão, que o Pi reporta ao usuário com os detalhes disponíveis.
- Em caso de sucesso, não exibe notificações.

### Disponibilidade dos modelos na inicialização

No Pi 1.1.0, a escolha inicial do modelo acontece antes do evento `session_start`. Por isso, sincronizar nesse evento pode criar o arquivo tarde demais e ainda resultar no aviso `No models available`.

A extensão usa uma função de inicialização assíncrona: o Pi aguarda a sincronização e a validação do arquivo durante o carregamento das extensões. Nessa versão, o Pi relê o catálogo após esse carregamento e antes de selecionar o modelo inicial. Não há atraso fixo nem espera indefinida pela criação do arquivo.

O arquivo validado é `~/.pi/agent/models.json`. Se a variável `PI_CODING_AGENT_DIR` estiver definida, a extensão valida `models.json` nesse diretório. Configure o `agentic-bus` para gravar no mesmo local utilizado pelo Pi.

A sincronização ocorre sempre que a extensão é carregada, incluindo `/reload`, comandos como `pi --list-models` e operações de sessão que recriem o runtime de extensões.

JSON válido não garante modelos utilizáveis: a validação da configuração e a resolução das credenciais continuam sendo feitas pelo Pi. O aviso de ausência de modelos ainda pode aparecer se não houver modelos válidos e autenticados.

## Requisitos

- Pi com suporte a extensões JavaScript e inicialização assíncrona (fluxo conferido no Pi 1.1.0).
- `agentic-bus` disponível no `PATH` do processo do Pi.
- Nos demais sistemas, `bash` também deve estar disponível no `PATH`.
- No Windows, o comando deve estar instalado e acessível pelo `cmd.exe` (incluindo executáveis e scripts `.cmd` ou `.bat`).

## Instalação

Copie o arquivo [`agb-models-sync-startup.js`](./agb-models-sync-startup.js) para a pasta de extensões do usuário:

```text
~/.pi/agent/extensions/agb-models-sync-startup.js
```

Se a pasta ainda não existir, crie-a. O Pi carregará a extensão automaticamente nas próximas inicializações.

No Windows, `~` corresponde à pasta do usuário, por exemplo:

```text
C:\Users\seu-usuario\.pi\agent\extensions\agb-models-sync-startup.js
```

### Carregamento direto

Para carregar a extensão sem copiá-la para a pasta de extensões, execute no diretório deste projeto:

```bash
pi --extension ./agb-models-sync-startup.js
```

Não é necessário compilar o arquivo nem instalar dependências adicionais para a extensão.

## Feedback de erro

Ainda não há interface disponível durante essa etapa. O feedback aparece como erro de carregamento da extensão, em vez de uma notificação do evento `session_start`. No CLI do Pi 1.1.0, erros de carregamento impedem a inicialização de continuar.

Se o comando retornar um código diferente de zero, os detalhes incluem:

```text
Falha ao executar agentic-bus models sync:
Código de saída: 1.
<saída do comando>
```

Execuções interrompidas e exceções durante a execução também são reportadas ao usuário. Se o comando terminar com sucesso, mas o arquivo estiver ausente, ilegível ou contiver JSON inválido, o erro informa o caminho esperado do `models.json`.

### Erro de logon do WSL no Windows

Uma chamada a `bash` no Windows pode iniciar o WSL e falhar com o código `Bash/Service/CreateInstance/CreateVm/HCS/0x80070569`, acompanhado da mensagem de que o usuário não possui o tipo de logon solicitado.

A extensão usa `cmd.exe` no Windows para evitar essa dependência do WSL. Se você recebeu esse erro com uma versão anterior, substitua o arquivo instalado pela versão atual e reinicie o Pi. O `agentic-bus` precisa estar disponível no Windows; uma instalação apenas dentro do WSL não fica automaticamente acessível pelo `cmd.exe`.
