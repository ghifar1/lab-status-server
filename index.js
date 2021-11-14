const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const CryptoJS = require("crypto-js");

const app = express();
app.use(express.static("public"));
const httpServer = createServer(app);
const io = new Server(httpServer, {
  /* options */
});

let activePC = [];

io.on("connection", (socket) => {
  console.log("new socket connected");
  let encrypt = CryptoJS.AES.encrypt(JSON.stringify(activePC), "wadidaw").toString();
   io.emit("refresh", encrypt);
  socket.on("disconnect", () => {
    Object.keys(activePC).forEach((val, idx) => {
      if (activePC[idx]["socket_id"] === socket.id) {
        activePC[idx]["is_active"] = false;
      }
    });
    let encrypt = CryptoJS.AES.encrypt(JSON.stringify(activePC), "wadidaw").toString();
     socket.broadcast.emit("refresh", encrypt);
  });

  socket.on("pc-update", (data) => {
    Object.keys(activePC).forEach((val, idx) => {
      if (activePC[idx]["socket_id"] === socket.id) {
        activePC[idx]["uptime"] = data["uptime"];
        activePC[idx]["state"] = data["state"];
        activePC[idx]["last_seen"] = Date.now();
      }
    });
    let encrypt = CryptoJS.AES.encrypt(JSON.stringify(activePC), "wadidaw").toString();
     socket.broadcast.emit("refresh", encrypt);
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
        state: pc["state"],
        last_seen: Date.now(),
      };

      activePC.push(obj);
    }
    let encrypt = CryptoJS.AES.encrypt(JSON.stringify(activePC), "wadidaw").toString();
    socket.broadcast.emit("refresh", encrypt);
  });
});

httpServer.listen(3010);
console.log("server listen on 3010");

//express

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: __dirname });
});
