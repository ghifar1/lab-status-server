const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  /* options */
});

let activePC = [];

io.on("connection", (socket) => {
  console.log("new socket connected");
  io.emit("refresh", activePC);

  socket.on("disconnect", () => {
    Object.keys(activePC).forEach((val, idx) => {
      if (activePC[idx]["socket_id"] === socket.id) {
        activePC[idx]["is_active"] = false;
      }
    });
    socket.broadcast.emit("refresh", activePC);
  });

  socket.on("uptime-update", (uptime) => {
    Object.keys(activePC).forEach((val, idx) => {
      if (activePC[idx]["socket_id"] === socket.id) {
        activePC[idx]["uptime"] = uptime;
        activePC[idx]["last_seen"] = Date.now();
      }
    });
    socket.broadcast.emit("refresh", activePC);
  });

  socket.on("active-pc", (pc) => {
    console.log(pc);
    let found = false;
    let key = undefined;
    Object.keys(activePC).forEach((val, idx) => {
      if (activePC[idx]["pc"] === pc["hostname"]) {
        found = true;
        key = idx;
      }
    });

    if (found) {
      activePC[key]["is_active"] = true;
      activePC[key]["socket_id"] = socket.id;
      activePC[key]["last_seen"] = Date.now();
    } else {
      let obj = {
        pc: pc["hostname"],
        is_active: true,
        uptime: pc["uptime"],
        socket_id: socket.id,
        last_seen: Date.now()
      };

      activePC.push(obj);
    }
    socket.broadcast.emit("refresh", activePC);
  });
});

httpServer.listen(3000);
console.log("server listen on 3000");

//express

app.get("/", (req, res) => {
  res.sendFile('index.html', {root: __dirname})
});
