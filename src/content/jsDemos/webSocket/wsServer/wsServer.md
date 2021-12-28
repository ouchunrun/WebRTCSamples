
# webSocket server

A simple chat demo for webSocket server

## How to use

```
$ cd webSocket/wsServer
$ npm install
$ npm install ws
$ node wsServer.js
```

And point your browser to `http://localhost:3000`. Optionally, specify a port by supplying the `PORT` env variable.
Or you can connect to `ws://localhost:3000` to create a webSocket.

## Features

- Multiple users can join a chat room by each entering a unique username on website load.
- Users can type chat messages to the chat room.
- A notification is sent to all users when a user joins or leavesthe chatroom.


