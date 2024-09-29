const VEHICLETITLE = document.querySelector(".trees__vehicle_title");
const GEOFENCESTITLE = document.querySelector(".trees__geofences_title");
const VEHICLEITEMS = document.querySelectorAll(".tree__vehicle_item");

var map = L.map("map").setView([58.967006, 67.652982], 5);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

// var marker = L.marker([55.20167281540249, 61.53177591334961]).addTo(map);

function zeroPad(value) {
  return value.toString().padStart(2, "0");
}

const date = new Date();
const gmd = `${date.getFullYear()}${zeroPad(date.getMonth() + 1)}${zeroPad(
  date.getDate()
)}`;
const gmdhm = `${date.getFullYear()}${zeroPad(date.getMonth() + 1)}${zeroPad(
  date.getDate()
)}-${zeroPad(date.getHours())}${zeroPad(date.getMinutes())}`;
const UTCOffset = date.getTimezoneOffset();

// console.log(gmd);
// console.log(gmdhm);
// console.log(UTCOffset);

let requestResult = "";

// /ServiceJSON/Login Метод Login аутентифицирует пользователя по логину/паролю и возвращает токен,
// который используется во всех последующих запросах.
// В случае успешной аутентификации возвращается строка-токен.
// В случае ошибочной аутентификации возвращается пустая строка и HTTP Status Code = 401.

let token = "";

const getToken = async (url = "", data = {}) => {
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

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    // console.log("Получено", value);
    token = new TextDecoder().decode(value);
  }
  // console.log(token);
  // console.log("Ответ полностью получен");

  requestResult = await getData(
    "https://test.agweb.cloud/ServiceJSON/EnumSchemas",
    {
      session: `${token}`, // Токен аутентификации который возвращает метод Login
    }
  );

  const enumSchemas = JSON.parse(requestResult)[0].ID;
  // console.log(enumSchemas);

  await getData("https://test.agweb.cloud/ServiceJSON/EnumDevices", {
    session: `${token}`, // Токен аутентификации который возвращает метод Login
    schemaID: `${enumSchemas}`, //ID схемы, которые возвращаются EnumSchemas
    // parentIDs: "2fbde714-b3fe-4c74-874e-9017359a8ce2", // string (query) ID корневого элемента иерархии
  }).then((data) => {
    const devicesList = JSON.parse(data).Items;
    // console.log(devicesList);

    let div = document.createElement("div");
    div.id = "vehicle";
    document.body.append(div); // добавляем div на страницу

    function renderDevicesList(devicesList) {
      let ul = document.createElement("ul");
      devicesList.forEach((elems) => {
        let li = document.createElement("li");
        li.classList.add("tree__vehicle_item");
        li.textContent = `${elems.ID}`;
        ul.append(li);
      });
      return ul; // возвращаем список
    }

    let devicesUl = renderDevicesList(devicesList); // получаем список
    document.getElementById("vehicle").append(devicesUl); // добавляем список на страницу в div с id=root

    VEHICLETITLE.textContent = "Список транспортных средств";

    let vehicles = document.querySelectorAll(".tree__vehicle_item");
    for (let i = 0; i < vehicles.length; i++) {
      vehicles[i].addEventListener("click", function () {
        try {
          getData("https://test.agweb.cloud/ServiceJSON/GetTrack", {
            session: `${token}`, // Токен аутентификации который возвращает метод Login
            schemaID: `${enumSchemas}`, // ID схемы, которые возвращаются EnumSchemas
            IDs: `${vehicles[i].textContent}`, //Список идентификаторов ТС (их можно получить с помощью EnumDevices – поле ID в классе RGroupItem)
            SD: `${gmd}`, //Начало временного периода. Время с учетом UTCOffset заданном в методе «Login» в формате yyyyMMdd или yyyyMMdd-HHmm
            ED: `${gmdhm}`, //Конец временного периода. Время с учетом UTCOffset заданном в методе «Login» в формате yyyyMMdd или yyyyMMdd-HHmm
            // tripSplitterIndex, //integer($int32) (query) Идентификатор разбиения на рейсы (по умолчанию 0), -1 если не разбивать на рейсы
          }).then((data) => {
            const trackLatList = JSON.parse(data.slice(41, -2)).Lat;
            const trackLngList = JSON.parse(data.slice(41, -2)).Lng;
            console.log(trackLatList);
            console.log(trackLngList);
            const coordinates = [];
            // if ((trackLatList.length = 0)) {
            //   console.log("no data");
            //   vehicles[i].textContent = "нет данных за текущие UTC сутки";
            // }
            for (let index = 0; index < trackLatList.length; index++) {
              let coordinate = [trackLatList[index], trackLngList[index]];
              coordinates.push(coordinate);
              var circle = L.circle(coordinate, {
                color: "red",
                fillColor: "#f03",
                fillOpacity: 0.5,
                radius: 5,
              }).addTo(map);
            }
            console.log(coordinates);
            var marker = L.marker(coordinates[0])
              .addTo(map)
              .bindPopup(vehicles[i].textContent)
              .openPopup();
            // var polygon = L.polygon(coordinates).addTo(map);
            console.log(vehicles[i].textContent);
          });
        } catch (error) {
          console.log("no data");
        }
      });
    }
  });

  await getData("https://test.agweb.cloud/ServiceJSON/EnumGeoFences", {
    session: `${token}`, // Токен аутентификации который возвращает метод Login
    schemaID: `${enumSchemas}`, // ID схемы, которые возвращаются EnumSchemas
    parentIDs: "3e9582ea-5b41-42eb-9ecd-062c674cfadd", // string (query) ID корневого элемента иерархии
    // ПОКА ВЫБЕРУ ТОЛЬКО ЧАСТЬ ДАННЫХ ЧТОБЫ НЕ УТОНУТЬ В НИХ
  }).then((data) => {
    const geoFencesList = JSON.parse(data).Items;
    // console.log(geoFencesList);

    let div = document.createElement("div");
    div.id = "geofences";
    document.body.append(div); // добавляем div на страницу

    function renderGeoFencesList(geoFencesList) {
      let ul = document.createElement("ul");
      geoFencesList.forEach((elems) => {
        let li = document.createElement("li");
        li.classList.add("tree__geofences_item");
        li.textContent = `ID: ${elems.ID}`;
        ul.append(li);
      });
      return ul; // возвращаем список
    }

    let geofencesUl = renderGeoFencesList(geoFencesList); // получаем список
    document.getElementById("geofences").append(geofencesUl); // добавляем список на страницу в div с id=root
    GEOFENCESTITLE.textContent = "Список геозон";

    let geofences = document.querySelectorAll(".tree__geofences_item");
    for (let i = 0; i < geofences.length; i++) {
      geofences[i].addEventListener("click", function () {
        getData("https://test.agweb.cloud/ServiceJSON/GetGeofences", {
          session: `${token}`, // Токен аутентификации который возвращает метод Login
          schemaID: `${enumSchemas}`, // ID схемы, которые возвращаются EnumSchemas
          IDs: `${geofences[i].textContent}`, // (query) ID геозон через запятую. Если параметр не задан, используются все геозоны схемы.
        }).then((data) => {
          const geofencesLatList = JSON.parse(data.slice(41, -2)).Lat;
          const geofencesLngList = JSON.parse(data.slice(41, -2)).Lng;
          console.log(geofencesLatList);
          console.log(geofencesLngList);
          const coordinates = [];
          // if ((trackLatList.length = 0)) {
          //   console.log("no data");
          //   geofences[i].textContent = "нет данных за текущие UTC сутки";
          // }
          for (let index = 0; index < geofencesLatList.length; index++) {
            let coordinate = [geofencesLatList[index], trackLngList[index]];
            coordinates.push(coordinate);
            var circle = L.circle(coordinate, {
              color: "red",
              fillColor: "#f03",
              fillOpacity: 0.5,
              radius: 5,
            }).addTo(map);
          }
          console.log(coordinates);
          var marker = L.marker(coordinates[0])
            .addTo(map)
            .bindPopup(geofences[i].textContent)
            .openPopup();
          // var polygon = L.polygon(coordinates).addTo(map);
          console.log(geofences[i].textContent);
        });
      });
    }
  });

  // .then(
  //   getData("https://test.agweb.cloud/ServiceJSON/GetGeofences", {
  //     session: `${token}`, // Токен аутентификации который возвращает метод Login
  //     schemaID: `${enumSchemas}`, // ID схемы, которые возвращаются EnumSchemas
  //     IDs: "008d5d49-e952-47a0-85bf-ecc9ce1e25ec", // (query) ID геозон через запятую. Если параметр не задан, используются все геозоны схемы.
  //   })
  // );
};

getToken("https://test.agweb.cloud/ServiceJSON/Login", {
  UserName: "", // Логин
  password: , // Пароль
  UTCOffset: UTCOffset, // Смещение от UTC в минутах
});

async function getData(url = "", data = {}) {
  requestResult = "";
  // Default options are marked with *
  const response = await fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *client
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  const reader = response.body.getReader();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    requestResult = new TextDecoder().decode(value);
  }
  // console.log(requestResult);
  // console.log("Ответ полностью получен");
  return requestResult;
}

// 767B29B61CA75611B6153695D017E79B170F47A74F0FB1B323491E58CB90F2B68F47CE7BC821431F36C03C43C56F2C15293CB5575FC123F003C837AB78BD857CE570CC43F1C720077AAD3136D229D6D6C3CF61640A29EB9E274650F4D875530745A16D0AFB4D49618E0A9441299BAD941EC6C4BE7243C0F9C8EA8720AD03D27EF60E198AB214369F0B4588708F30C3AC

// /ServiceJSON/EnumSchemas- Возвращает список доступных схем на сервере.
// ID схемы следует рассматривать просто как уникальный идентификатор схемы для текущего пользователя.
// Схема получает свой идентификатор в момент создания и никогда не меняется.

// getData("https://test.agweb.cloud/ServiceJSON/EnumSchemas", {
//   session:
//     "767B29B61CA75611B6153695D017E79B170F47A74F0FB1B323491E58CB90F2B68F47CE7BC821431F36C03C43C56F2C15293CB5575FC123F003C837AB78BD857CE570CC43F1C720077AAD3136D229D6D6C3CF61640A29EB9E274650F4D875530745A16D0AFB4D49618E0A9441299BAD941EC6C4BE7243C0F9C8EA8720AD03D27EF60E198AB214369F0B4588708F30C3AC",
// });

// /ServiceJSON/EnumDevices- Возвращает список приборов и групп в указанной схеме.
// Иерархия собирается путем сопоставления ID ⇔ ParentID и начинается с верхнего уровня, у которого ParentID=null.

// getData("https://test.agweb.cloud/ServiceJSON/EnumDevices", {
//   session:
//     "767B29B61CA75611B6153695D017E79B170F47A74F0FB1B323491E58CB90F2B68F47CE7BC821431F36C03C43C56F2C15293CB5575FC123F003C837AB78BD857CE570CC43F1C720077AAD3136D229D6D6C3CF61640A29EB9E274650F4D875530745A16D0AFB4D49618E0A9441299BAD941EC6C4BE7243C0F9C8EA8720AD03D27EF60E198AB214369F0B4588708F30C3AC",
//   schemaID: "7da40625-b13e-4fd9-9ebd-4ea9619aaafd",
//   parentIDs: "9cd9bec8-6217-4871-a901-fecab6a0f66c", // string (query) ID корневого элемента иерархии
// });

// /ServiceJSON/EnumGeoFences- Возвращает список геозон и групп в указанной схеме (аналогично EnumDevices).
// Иерархия собирается путем сопоставления ID ⇔ ParentID и начинается с верхнего уровня, у которого ParentID=null.

// getData("https://test.agweb.cloud/ServiceJSON/EnumGeoFences", {
//   session:
//     "767B29B61CA75611B6153695D017E79B170F47A74F0FB1B323491E58CB90F2B68F47CE7BC821431F36C03C43C56F2C15293CB5575FC123F003C837AB78BD857CE570CC43F1C720077AAD3136D229D6D6C3CF61640A29EB9E274650F4D875530745A16D0AFB4D49618E0A9441299BAD941EC6C4BE7243C0F9C8EA8720AD03D27EF60E198AB214369F0B4588708F30C3AC",
//   schemaID: "7da40625-b13e-4fd9-9ebd-4ea9619aaafd",  //ID схемы, которые возвращаются EnumSchemas
//   // parentIDs string (query) ID корневого элемента иерархии
// });

// /ServiceJSON/GetTrack - Возвращает треки по запрошенным ТС за период.

// getData("https://test.agweb.cloud/ServiceJSON/GetTrack", {
//   session:
//     "767B29B61CA75611B6153695D017E79B170F47A74F0FB1B323491E58CB90F2B68F47CE7BC821431F36C03C43C56F2C15293CB5575FC123F003C837AB78BD857CE570CC43F1C720077AAD3136D229D6D6C3CF61640A29EB9E274650F4D875530745A16D0AFB4D49618E0A9441299BAD941EC6C4BE7243C0F9C8EA8720AD03D27EF60E198AB214369F0B4588708F30C3AC",
//   schemaID: "7da40625-b13e-4fd9-9ebd-4ea9619aaafd",
//   // IDs: "f0e7ea1d-ddc9-452b-ba73-9cfffbdd2edb",   //Список идентификаторов ТС (их можно получить с помощью EnumDevices – поле ID в классе RGroupItem)
//   IDs: "9cd9bec8-6217-4871-a901-fecab6a0f66c", //Список идентификаторов ТС (их можно получить с помощью EnumDevices – поле ID в классе RGroupItem)
//   SD: `${gmd}`, //Начало временного периода. Время с учетом UTCOffset заданном в методе «Login» в формате yyyyMMdd или yyyyMMdd-HHmm
//   ED: `${gmdhm}`, //Конец временного периода. Время с учетом UTCOffset заданном в методе «Login» в формате yyyyMMdd или yyyyMMdd-HHmm
//   // tripSplitterIndex, //integer($int32) (query) Идентификатор разбиения на рейсы (по умолчанию 0), -1 если не разбивать на рейсы
// });

// /ServiceJSON/GetGeofences - Возвращает информацию о геозонах (списки точки для полигонов, радиус точки, название, ....)
// если ID принадлежит группе - возвращаются ВСЕ её вложенные геозоны с полной иерархией всех нижевложенных групп,
// сами группы в результирующий набор не попадает
// если ID принадлежит элементу - возвращается информация по нему. Допускается смешивание ID элементов разных типов (групп и элементов) в одном запросе.

// getData("https://test.agweb.cloud/ServiceJSON/GetGeofences", {
//   session:
//     "767B29B61CA75611B6153695D017E79B170F47A74F0FB1B323491E58CB90F2B68F47CE7BC821431F36C03C43C56F2C15293CB5575FC123F003C837AB78BD857CE570CC43F1C720077AAD3136D229D6D6C3CF61640A29EB9E274650F4D875530745A16D0AFB4D49618E0A9441299BAD941EC6C4BE7243C0F9C8EA8720AD03D27EF60E198AB214369F0B4588708F30C3AC",
//   schemaID: "7da40625-b13e-4fd9-9ebd-4ea9619aaafd",
//  IDs string (query) ID геозон через запятую. Если параметр не задан, используются все геозоны схемы.
// });

export default getData;
