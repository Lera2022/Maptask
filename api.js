const postData = async (url = "", data = {}) => {
  // Формируем запрос
  const response = await fetch(url, {
    // Метод, если не указывать, будет использоваться GET
    method: "POST",
    // Заголовок запроса
    headers: {
      "Content-Type": "application/json",
    },
    // Данные
    body: JSON.stringify(data),
  });
  // вместо response.json() и других методов
  const reader = response.body.getReader();

  let token = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    // console.log("Получено", value);
    token = new TextDecoder().decode(value);
  }
  console.log(token);
  //   console.log("Ответ полностью получен");
  return token;
};

postData("https://test.agweb.cloud/ServiceJSON/Login", {
  UserName: "",
  password: ,
});

async function getData(url = "", currentToken = "") {
  // Default options are marked with *
  const response = await fetch(url, {
    method: "GET", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${currentToken}`,
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *client
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  return await response; // parses JSON response into native JavaScript objects
}
