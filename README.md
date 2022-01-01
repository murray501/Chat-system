# Chat system 
1.  `option 1`: using directory `server` and `client`.
2.  `option 2`: using directory `chat`
## How to run ? (option 1)
1. cd server
2. npm install 
3. npm start  -> server run (http://localhost:5000)
4. cd client
5. npm install
6. npm start -> client run (http://localhost:3000)
7. In the browser, enter username.
8. Then chat screen shows up.
9. Enter message. click `Send` button.
10. Can choose multiple receivers.
11. Messages are grouped by `public` or `private`.

## How to run ? (option2)
1. cd chat
2. npm install
3. npm start -> server run (http://localhost:3000)
4. acess from the browser
5. same as option1

## What are implemented ? (option1)
`socket.io` is used for communication between server and client.

### Server
`node-express` is used.
To get dog's photos, `Dog API`(https://dog.ceo/api/breeds/image/random) is used.

### Client
`React` is used.
To work on CSS, `bulma` is used.

## What are implemented ? (option2)
`NextJS` is used, so that server and client are merged.










