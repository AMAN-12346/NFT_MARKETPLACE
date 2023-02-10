import Express from "express";
import * as http from "http";
import * as path from "path";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import useragent from "express-useragent";
import morgan from 'morgan';
import mongoose from 'mongoose';
import apiErrorHandler from "../helper/apiErrorHandler";
import practiceController from "../api/v1/controllers/practice/controller";
import eventController from '../api/v1/controllers/event/controller';
import chatController from "../api/v1/controllers/chat/controller";
import socket from 'socket.io';
import string from "joi/lib/types/string";
const { getUserPosition,emptyArray } = require('../helper/user');

//*****************************Cron importy function ***********************************/
// import eventCron from '../api/v1/controllers/cron/gameEvent';
//**************************************************************************************/

const app = new Express();
const server = http.Server(app);
var io = socket(server);
const root = path.normalize(`${__dirname}/../..`);

class ExpressServer {
  constructor() {
    app.use(Express.json());
    app.use(Express.urlencoded({
      extended: true
    }))

    app.use(morgan('dev'))
    app.use(helmet.contentSecurityPolicy({
      reportOnly: true
    }));
    app.use(useragent.express());
    // app.use(Express.static(`${root}/views`));

    app.use(
      cors({
        allowedHeaders: ["Content-Type", "token", "authorization"],
        exposedHeaders: ["token", "authorization"],
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
      })
    );

  }
  router(routes) {
    routes(app);
    return this;
  }

  configureSwagger(swaggerDefinition) {
    const options = {
      // swaggerOptions : { authAction :{JWT :{name:"JWT", schema :{ type:"apiKey", in:"header", name:"Authorization", description:""}, value:"Bearer <JWT>"}}},
      swaggerDefinition,
      apis: [
        path.resolve(`${root}/server/api/v1/controllers/**/*.js`),
        path.resolve(`${root}/api.yaml`),
      ],
    };

    function requireLogin(request, response, next) {
      // console.log('request rec',process.env.swaggerLogin)
      if (Date.now() - process.env.swaggerLogin < 15 * 60 * 1000 || true) {
        next();
      } else {
        console.log("else part\n\n");
        process.env.swaggerLogin = 0;
        response.sendFile(path.resolve(`${root}/views/login.html`));
      }
    }
    app.use(
      "/api-docs",
      requireLogin,
      swaggerUi.serve,
      swaggerUi.setup(swaggerJSDoc(options))
    );
    app.get('/postman-collection', function (req, res) {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerJSDoc(options));
    });
    return this;
  }

  handleError() {
    app.use(apiErrorHandler);
    return this;
  }
  configureDb(dbUrl) {
    return new Promise((resolve, reject) => {
      mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }, (err) => {
        if (err) {
          console.log(`Error in mongodb connection ${err.message}`);
          return reject(err);
        }
        console.log("Mongodb connection established");
        return resolve(this);
      });
    });
  }
  configureUI() {
    app.get("/admin/*", function (req, res) {
      res.sendFile(path.join(root, "build", "index.html"));
    });
    return this;
  }

  listen(port) {
    server.listen(port, () => {
      console.log(`secure app is listening @port ${port}`);
    });
    return app;
  }
}

var userCount = 0;
var countdown = 10;
io.sockets.on("connection", async (socket) => {
  userCount++;
  const transport = socket.conn.transport.name;

  console.log("my socket id is >>>>>", socket.id, userCount, transport);



  socket.on('gamePosition', async function (data) {
    if (typeof data == 'string') {
      data = JSON.parse(data);
    }
    const events = await getUserPosition(socket.id, data); // add user with socket id and room info
    console.log("line 140 events==>>", events);
    io.sockets.in(socket.id).emit("gamePosition", events);


  });

  socket.on('gamePositionBroadCast', async function (data) {
    if (typeof data == 'string') {
      data = JSON.parse(data);
    }
    const events = await getUserPosition(socket.id, data); // add user with socket id and room info
    console.log("line 140 events==>>", events);

    socket.broadcast.emit('gamePositionBroadCast', JSON.parse(JSON.stringify(events)));

  });

  socket.on('eventEmpty', async function (data) {
    if (typeof data == 'string') {
      data = JSON.parse(data);
    }
    const events = await emptyArray(socket.id, data); // add user with socket id and room info
    console.log("line 140 new events==>>", events);
    io.sockets.in(socket.id).emit("eventEmpty", events);

    // socket.broadcast.emit('gamePosition', JSON.parse(JSON.stringify(events)));

  });


  //..........................practice mode details........................//

  socket.on("practiceRaceDetails", async (data) => {
    try {
      if (typeof data == 'string') {
        data = JSON.parse(data);
      }
      let practiceResult = await practiceController.practiceRaceDetails(data);
      io.sockets.in(socket.id).emit("practiceRaceDetails", practiceResult);
    } catch (error) {
      console.log("In practice details event===>>>", error);
    }
  });

  //..........................practice mode moves........................//

  socket.on("practiceMove", async (data) => {
    try {
      if (typeof data == 'string') {
        data = JSON.parse(data);
      }
      let practiceMoveResult = await practiceController.practiceMove(data);
      io.sockets.in(socket.id).emit("practiceMove", practiceMoveResult);
    } catch (error) {
      console.log("In practice move event===>>>", error);
    }
  });


  //..........................practice mode rotates........................//

  socket.on("practiceRotate", async (data) => {
    try {
      if (typeof data == 'string') {
        data = JSON.parse(data);
      }
      let practiceRotateResult = await practiceController.practiceRotate(data);
      io.sockets.in(socket.id).emit("practiceRotate", practiceRotateResult);
    } catch (error) {
      console.log("In practice rotate socket event===>>>", error);
    }
  });


  //..........................practice mode time status........................//

  socket.on("practiceTimeStatus", async (data) => {
    try {
      if (typeof data == 'string') {
        data = JSON.parse(data);
      }
      let practiceTimeResult = await practiceController.practiceTimeStatus(data);
      io.sockets.in(socket.id).emit("practiceTimeStatus", practiceTimeResult);
    } catch (error) {
      console.log("In practice time socket event===>>>", error);
    }
  });

  //..........................practice mode complete........................//

  socket.on("practiceModeComplete", async (data) => {
    try {
      if (typeof data == 'string') {
        data = JSON.parse(data);
      }
      let practiceStatusResult = await practiceController.practiceModeComplete(data);
      io.sockets.in(socket.id).emit("practiceModeComplete", practiceStatusResult);
    } catch (error) {
      console.log("In practice mode complete socket event===>>>", error);
    }
  });

  //..........................event race cars details........................//

  socket.on("eventRaceAllDetails", async (data) => {
    try {
      if (typeof data == 'string') {
        data = JSON.parse(data);
      }
      let eventResult = await eventController.eventRaceAllDetails(data);
      if (eventResult.data) {
        eventResult.data.serverTime = new Date().toISOString();
      }
      io.sockets.in(socket.id).emit("eventRaceAllDetails", eventResult);
    } catch (error) {
      console.log("In event racing move===>>>", error);
    }
  });

  socket.on("liveEventDetails", async (data) => {
    try {
      if (data == 'true') {
        let eventResult = await eventController.liveEventDetails();
        if (eventResult.data) {
          eventResult.data.serverTime = new Date().toISOString();
        }
        io.sockets.in(socket.id).emit("liveEventDetails", eventResult);
      }
    } catch (error) {
      console.log("In liveEventDetails ===>>>", error);
    }
  });

  //..........................event race moves........................//

  socket.on("eventRaceMove", async (data) => {
    try {
      if (typeof data == 'string') {
        data = JSON.parse(data);
      }
      let eventMoveResult = await eventController.eventRaceMove(data);
      io.sockets.in(socket.id).emit("eventRaceMove", eventMoveResult);
    } catch (error) {
      console.log("In event racing move===>>>", error);
    }
  });


  //..........................event race rotates........................//

  socket.on("eventRaceRotate", async (data) => {
    try {
      if (typeof data == 'string') {
        data = JSON.parse(data);
      }
      let eventRotateResult = await eventController.eventRaceRotate(data);
      io.sockets.in(socket.id).emit("eventRaceRotate", eventRotateResult);
    } catch (error) {
      console.log("In event racing rotate===>>>", error);
    }
  });


  //..........................event race time status........................//

  socket.on("eventRaceTimeStatus", async (data) => {
    try {
      if (typeof data == 'string') {
        data = JSON.parse(data);
      }
      // console.log('eventRaceTimeStatus: ', data)
      let eventTimeResult = await eventController.eventRaceTimeStatus(data);
      io.sockets.in(socket.id).emit("eventRaceTimeStatus", eventTimeResult);
    } catch (error) {
      console.log("In event racing time===>>>", error);
    }
  });

  //..........................event race complete........................//

  socket.on("eventRaceComplete", async (data) => {
    try {
      if (typeof data == 'string') {
        data = JSON.parse(data);
      }
      // console.log("eventRaceComplete: ", data)
      let eventStatusResult = await eventController.eventRaceComplete(data);
      io.sockets.in(socket.id).emit("eventRaceComplete", eventStatusResult);
    } catch (error) {
      console.log("In event racing complete socket event===>>>", error);
    }
  });

  //..........................disconnect from race........................//

  socket.on("disconnectFromRace", async (data) => {
    try {
      if (typeof data == 'string') {
        data = JSON.parse(data);
      }
      let disconnectRaceResult = await eventController.disconnectFromRace(data);
      io.sockets.in(socket.id).emit("disconnectFromRace", disconnectRaceResult);
    } catch (error) {
      console.log("In disconnect from race socket event===>>>", error);
    }
  });

  //..........................event race status........................//

  socket.on("eventRaceStatus", async (data) => {
    try {
      if (typeof data == 'string') {
        data = JSON.parse(data);
      }
      let eventRaceResult = await eventController.eventRaceStatus(data);
      io.sockets.in(socket.id).emit("eventRaceStatus", eventRaceResult);
    } catch (error) {
      console.log("In event race status socket event===>>>", error);
    }
  });

  socket.on("practiceRaceStatus", async (data) => {
    try {
      if (typeof data == 'string') {
        data = JSON.parse(data);
      }
      let eventRaceResult = await practiceController.practiceRaceStatus(data);
      io.sockets.in(socket.id).emit("practiceRaceStatus", eventRaceResult);
    } catch (error) {
      console.log("In event race status socket event===>>>", error);
    }
  });

  socket.on("disconnect", async (reason) => {
    userCount--;
    socket.broadcast.emit('destroy', socket.id);
    console.log("disconnected socketId", socket.id, userCount, reason);
  });




  //  ...............................................online user..............................................//

  socket.on("onlineUser", async (data) => {
    try {
      let chatData = await chatController.onlineUser(data);
      io.sockets.in(socket.id).emit("onlineUser", chatData);
    } catch (error) {
      console.log("In onlineUser===>>>", error);
    }
  });

  //  ...............................................offline user..............................................//

  socket.on("offlineUser", async (data) => {
    try {
      let chatData = await chatController.offlineUser(data);
      io.sockets.in(socket.id).emit("offlineUser", chatData);
    } catch (error) {
      console.log("In offlineUser===>>>", error);
    }
  });

  //  ...............................................last seen user..............................................//

  socket.on("lastSeen", async (data) => {
    try {
      let chatData = await chatController.lastSeen(data);
      io.sockets.in(socket.id).emit("lastSeen", chatData);
    } catch (error) {
      console.log("In lastSeen===>>>", error);
    }
  });

  //  ...............................................chat History..............................................//

  socket.on("chatHistory", async (data) => {
    try {
      let chatData = await chatController.ChattingHistory(data);
      io.sockets.in(socket.id).emit("chatHistory", chatData);
      // io.sockets.emit('chatHistory', chatData)
    } catch (error) {
      console.log("In ChatHistory===>>>", error);
    }
  });

  //...............................................viewChat History.........//

  socket.on("viewChat", async (data) => {
    try {
      let chatData = await chatController.chatById(data);
      io.sockets.in(socket.id).emit("viewChat", chatData);
    } catch (error) {
      console.log("In viewChat===>>>", error);
    }
  });

  //************* send Chat one to one ****************** */
  socket.on("oneToOneChat", async (data) => {
    try {
      let chatSend = await chatController.oneToOneChat(data);
      console.log("I am here to send CHAT >>>>>", chatSend);
      io.sockets.in(socket.id).emit("oneToOneChat", chatSend);
    } catch (error) {
      // throw error;
      console.log("In OneToOneChat===>>>", error);
    }
  });

  //************* send Chat group ****************** */

  socket.on("groupChat", async (data) => {
    try {
      let chatSend = await chatController.groupChat(data);
      console.log("I am here to send CHAT >>>>>", chatSend);
      io.sockets.in(socket.id).emit("groupChat", chatSend);
    } catch (error) {
      console.log("In groupChat===>>>", error);
    }
  });


  //************** reply chat ********************** */

  socket.on("replyChat", async (data) => {
    try {
      let chatSend = await chatController.replyChat(data);
      console.log("I am here to send CHAT >>>>>", chatSend);
      io.sockets.in(socket.id).emit("replyChat", chatSend);
    } catch (error) {
      console.log("In replyChat===>>>", error);
    }
  });

  //..........................unity provided race events........................//

  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name: username, room }); // add user with socket id and room info

    if (error) return callback(error);

    socket.join(user.room);

    socket.emit('message', {
      user: 'adminX',
      text: `${user.name.toUpperCase()}, Welcome to ${user.room} room.`
    });
    socket.broadcast.to(user.room).emit('message', {
      user: 'adminX',
      text: `${user.name.toUpperCase()} has joined!`
    });

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room) // get user data based on user's room
    });

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('message', { user: user.name, text: message });

    callback();
  });



  // socket.on('disconnect', () => {
  //   const user = removeUser(socket.id);

  //   if (user) {
  //     io.to(user.room).emit('message', {
  //       user: 'adminX',
  //       text: `${user.name.toUpperCase()} has left.`
  //     });
  //     io.to(user.room).emit('roomData', {
  //       room: user.room,
  //       users: getUsersInRoom(user.room)
  //     });
  //   }

  // socket.on('gamePosition', async function (data) {
  //   const events = await getUserPosition(socket.id, data); // add user with socket id and room info
  //   console.log("line 489 events==>>", events);
  //   socket.broadcast.emit('gamePosition', JSON.parse(JSON.stringify(events)));

  // });

  socket.on('move', function (x, y, z) {
    socket.broadcast.emit('move', socket.id, x, y, z);
  });

  socket.on('rotate', function (x, y, z, w) {
    socket.broadcast.emit('rotate', socket.id, x, y, z, w);
  });

  socket.on('colorchang', function (count) {
    socket.broadcast.emit('colorchang', socket.id, count);
  });  
  socket.on('position', function (count) {
    console.log("POSITION: " + count);
    socket.broadcast.emit('position', socket.id, count);
  });

  socket.on('talk', function (message) {
    socket.broadcast.emit('talk', socket.id, message);
  });

  socket.on('changemodale', function (count) {
    console.log("changeModale: " + count);
    socket.broadcast.emit('changemodale', socket.id, count);
  });
  
})

export default ExpressServer;
