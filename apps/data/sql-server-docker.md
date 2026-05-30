# Como criar e rodar SQL Server via Docker

## 1. Requisitos

Antes de comecar, confirme que o Docker esta instalado e rodando na maquina.

```bash
docker --version
```

## 2. Baixar a imagem do SQL Server

Use a imagem oficial da Microsoft:

```bash
docker pull mcr.microsoft.com/mssql/server:2022-latest
```

## 3. Criar e iniciar o container

Execute o comando abaixo para criar um container chamado `sqlserver`:

```bash
docker run -e "ACCEPT_EULA=Y" \
  -e "MSSQL_SA_PASSWORD=SuaSenha@123" \
  -p 1433:1433 \
  --name sqlserver \
  -d mcr.microsoft.com/mssql/server:2022-latest
```

Parametros principais:

- `ACCEPT_EULA=Y`: aceita os termos de uso do SQL Server.
- `MSSQL_SA_PASSWORD`: define a senha do usuario administrador `sa`.
- `-p 1433:1433`: expõe a porta padrao do SQL Server.
- `--name sqlserver`: define o nome do container.
- `-d`: executa o container em segundo plano.

> A senha precisa atender aos requisitos de complexidade do SQL Server: letras maiusculas, minusculas, numeros e caractere especial.

## 4. Verificar se o container esta rodando

```bash
docker ps
```

Se o container aparecer na lista, o SQL Server esta em execucao.

Para ver os logs:

```bash
docker logs sqlserver
```

Procure uma mensagem indicando que o SQL Server esta pronto para aceitar conexoes.

## 5. Conectar no SQL Server

Dados de conexao:

- Host: `localhost`
- Porta: `1433`
- Usuario: `sa`
- Senha: `SuaSenha@123`

Exemplo de string de conexao:

```txt
Server=localhost,1433;Database=master;User Id=sa;Password=SuaSenha@123;TrustServerCertificate=True;
```

## 6. Parar e iniciar novamente

Para parar o container:

```bash
docker stop sqlserver
```

Para iniciar novamente:

```bash
docker start sqlserver
```

## 7. Remover o container

Se precisar apagar o container:

```bash
docker rm -f sqlserver
```

Isso remove o container, mas nao remove a imagem baixada.

Para remover a imagem:

```bash
docker rmi mcr.microsoft.com/mssql/server:2022-latest
```

## 8. Opcional: usar docker-compose

Crie um arquivo `docker-compose.yml` com o conteudo abaixo:

```yaml
services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: sqlserver
    environment:
      ACCEPT_EULA: "Y"
      MSSQL_SA_PASSWORD: "SuaSenha@123"
    ports:
      - "1433:1433"
```

Suba o container:

```bash
docker compose up -d
```

Pare o container:

```bash
docker compose down
```

## 9. Opcional: manter os dados com volume

Para nao perder os dados ao recriar o container, use um volume:

```yaml
services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: sqlserver
    environment:
      ACCEPT_EULA: "Y"
      MSSQL_SA_PASSWORD: "SuaSenha@123"
    ports:
      - "1433:1433"
    volumes:
      - sqlserver_data:/var/opt/mssql

volumes:
  sqlserver_data:
```

Depois, suba com:

```bash
docker compose up -d
```
