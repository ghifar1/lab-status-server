$(() => {
  function msToTime(duration) {
    var sec_num = parseInt(duration, 10);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor(sec_num / 60) % 60;
    var seconds = sec_num % 60;

    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;

    return hours + ":" + minutes + ":" + seconds;
  }

  function diffTime(now, past) {
    let duration = now - past;
    var milliseconds = Math.floor((duration % 1000) / 100),
      seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    if (duration < 5) {
      return "less than second ago";
    } else {
      return hours + ":" + minutes + ":" + seconds + " ago";
    }
  }

  const socket = io();
  socket.on("connect", () => {
    console.log(socket.id); // x8WIv7-mJelg7on_ALbx
  });

  socket.on("refresh", (dataEncrypted) => {
    console.log(dataEncrypted);
    let bytes = CryptoJS.AES.decrypt(dataEncrypted, "wadidaw");
    var arr = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    let htmlarr = "";
    arr.forEach((element) => {
      htmlarr += `<div class="p-2 m-1 border rounded w-full md:w-auto ${
        element["is_active"] ? "bg-green-500" : "bg-red-300"
      }">
            <div class="text-center font-medium text-xl border-b mb-1 pb-1">${
              element["pc"]
            }</div>
            <div><span class="font-medium">Up time</span>: ${msToTime(
              element["uptime"]
            )}</div>
            <div><span class="font-medium">Last seen</span> : ${diffTime(
              Date.now(),
              element["last_seen"]
            )}</div>
            <div><span class="font-medium">OS</span>: ${
              element["state"]["os"]
            }</div>
            <div><span class="font-medium">State</span>: ${
              element["state"]["windowName"]
            } - ${element["state"]["windowClass"]}</div>
            </div>`;
      console.log(element);
    });

    $("#clien").html(htmlarr);
  });
});
