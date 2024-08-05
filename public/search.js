search.oninput = () => {
  let request = new XMLHttpRequest();
  request.onload = () => {
    if (request.status == 200 && request.readyState == 4) {
      let resD = JSON.parse(request.responseText);
      if (resD.content.length > 0) {
        results.innerHTML = "";
        resD.content.forEach((element) => {
          results.innerHTML +=
            `${element.Main_URL} : <a href="/` +
            element.Shorter_URL +
            `" class='text-info'>${element.Shorter_URL}</a> `;
        });
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
