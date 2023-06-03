# English 
<h2>Backend Server - ( NLW spacetime )</h2>

This project was made during the event called of NLW - spacetime, at rocketseat platform.

<h2>how I used this project</h2>

I have two front-end projects, of type mobile and web, I was able to use both in this same backend project.

<h2>Built with</h2>

<ul>
  <li>Node Js</li>
  <li>Fastify</li>
  <li>TypeScript</li>
  <li>Prisma</li>
  <li>SQLite database</li>
  <li>Axios</li>
  <li>Zod</li>
</ul>

<h2>How can you clone this project, it's simple</h2>


<p> ⌨ Clone the repository</p>

```
git clone https://github.com/MiguelSperle/Backend-server-spacetime.git
```

<p> 📂 Access at folder</p>

```
cd Backend-server-spacetime
```


<p> 📡 install dependencies</p>

```
npm install or yarn install
```

<p>📡 Now, you're going to use this command for database</p>

```
npx prisma migrate deploy
```



<p> ⭐ Start the project</p>

```
npm run start / yarn run start
```


<h2>Now, for finish...</h2>
<p>Remember, to use the front-end project you must first run this project in your computer.</p>



<h2>Oauth Application</h2>
<p>You must have two apps in Oauth Apps, the first is for web and the second is for mobile. </p>
<p>To have client_id and client_secret, you must create a Oauth Apps in developer settings on github and you're going to copy.</p>

Configuration in Oauth Application:

```
Application name: name you want
```

```
Homepage URL: http://localhost:3000
```

```
Authorization callback URL: http://localhost:3000/api/auth/callback
```

<h2>File .env on backend project</h2>

```
# Database
DATABASE_URL="file:./dev.db"
```

```
#  Github (web)
GITHUB_CLIENT_ID=123456789 ``` This number is example ```
GITHUB_CLIENT_SECRET="1234567890abcdefg1234" ``` This number is example ```
```

```
# Github (mobile)
GITHUB_CLIENT_ID=123456789 ``` This number is example ```
GITHUB_CLIENT_SECRET="1234567890abcdefg1234" ``` This number is example ```
```

<h2>Attention</h2>
<p>
If you wanta to use the web project, you must comment the env mobile 
and if you want to use the mobile project, you must comment the env web.
</p>

-----------------------------------------------------------------------------------------------------------------------

# Portuguese 

Este projeto foi feito durante o evento chamado de NLW - spacetime, na plataforma rocketseat.

<h2>como eu usei este projeto</h2>

Eu tenho dois projetos front-end, do tipo mobile e web, consegui utilizar ambos neste mesmo projeto backend.








