# GOOCHI BACK
# Componentes do sistema
Foram usados na criação do sistema os componentes, utilizando o vscode para escrever o código.
- Node 8.11.2
- Banco de dados PSQL  10.3

# Como executar

####Para executar o código:
 - Instale o banco de dados PSQ, talvez o link https://websiteforstudents.com/installing-postgresql-10-on-ubuntu-16-04-17-10-18-04/https://websiteforstudents.com/installing-postgresql-10-on-ubuntu-16-04-17-10-18-04/ seja útil.
 - Crie uma database no localhost do seu psql com o nome de trabalho
-  Instale o node versão 9.3
 - Baixe o repositório
 - Execute o comando npm i ou npm install para instalar todos os pacotes e dependências do sistema.
 - Execute o comando npm run migrate (esse comando executa as migrações do sistema, criando as tabelas e susas respectivas colunas)
 - Você pode utilizar o debug do vs code, na barra lateral esquerda sob o símbolo de um inseto clique em Launch program, na seta verde para executar o código.

# Urls do sistema

- A url base do sistema é
		http://localhost:3000/api/v1
- Os endpoints de usuário  começam com user (formando http://localhost:3000/api/v1/user)
- user/create enviando 
um Json contendo as chaves
 - nome
 - email
 - password
 - email
- Como payload.
Os únicos endpoints que não necessitam de token a ser inserido nos headers da requisição são, criação e login de usuário.
O restante necessita que seja feito um cadastro e um login de um usuário para que o token possa ser gerado e passado no header, na chave Authorization.

Outras url disponíveis são

post 
/login recebe username e password e retorna um token e outros detalhes do usuário.

post 
/user/update edita um usuário
get 
/user/show mostra os dados do usuário atual
post 
/user/delete deleta um usuário

post 
/world/create cria um mundo recebe a cor do ceu, do chao e o texto da plaquinha
post 
/world/update/{world_id} edita um mundo (não é salvo quem edita o mundo somente a edição)
post 
/world/delete deleta um usuário

post 
/visitor/{username} dado um username que deve ser passado na url, visita o mundo deste usuário
get
/visitor mostra todos os mundos disponíveis.



