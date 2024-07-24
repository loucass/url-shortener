search.oninput = () => {
  console.log("Ss");
  let request = new XMLHttpRequest();
  request.onload = () => {
    if (request.status == 200 && request.readyState == 4) {
      let resD = JSON.parse(request.responseText);
      console.log(resD.content[0]);
      if (resD.content.length > 0) {
        console.log(resD);
      }
    }
  };
  let d = JSON.stringify({
    content: search.value.length > 0 ? search.value : null,
  });
  request.open("POST", "/search");
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(d);
};
