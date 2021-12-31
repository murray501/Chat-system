# Chat system 
option 1:  using directiory `server` and `client`.
## How to run ? (option 1)
1. cd server
2. npm start  -> server run (http://localhost:5000)
3. cd client
4. npm start -> client run (http://localhost:3000)
5. In the browser, enter username.
6. Then chat screen shows up.
7. Enter message. click `Send` button.
8. Can choose multiple receivers.
9. Messages are grouped by `public` or `private`.

## What are implemented ? (option1)
`socket.io` is used for communication between server and client.

### Server
`node-express` is used.
To get dog's photo, `Dog API`(https://dog.ceo/api/breeds/image/random) is used.

### Client
`react` is used.
To make CSS, `bulma` is used.










