const VEHICLETITLE = document.querySelector(".trees__vehicle_title");
const GEOFENCESTITLE = document.querySelector(".trees__geofences_title");
const VEHICLEITEMS = document.querySelectorAll(".tree__vehicle_item");

var map = L.map("map").setView([55.182103, 61.397747], 11);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

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

// console.log("начало текущих суток: " + gmd);
// console.log("текущее время: " + gmdhm);
// console.log(UTCOffset);

let requestResult = "";

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
    const devicesGroupsList = JSON.parse(data).Groups;
    // console.log(devicesGroupsList);
    let div = document.createElement("div");
    div.id = "vehiclegroup";
    document.body.append(div); // добавляем div на страницу

    const devicesList = JSON.parse(data).Items;
    // console.log(devicesList);

    function renderDevicesGroupsList(devicesGroupsList) {
      let div = document.createElement("div");
      div.classList.add("tree__vehiclegroup");

      for (let index = 0; index < devicesGroupsList.length; index++) {
        const result = devicesList.filter((person) =>
          person.ParentID.includes(devicesGroupsList[index].ID)
        );
        // console.log(result);
        let inputcheck = document.createElement("input");
        inputcheck.id = `${devicesGroupsList[index].ID}`;
        inputcheck.type = "checkbox";
        inputcheck.checked = true;
        inputcheck.disabled = true;
        inputcheck.classList.add("tree__vehiclegroup_item-check");
        div.append(inputcheck);
        let label = document.createElement("label");
        label.classList.add("tree__vehiclegroup_item");
        label.textContent = `${devicesGroupsList[index].Name}`;
        div.append(label);
        let div2 = document.createElement("div");
        div.append(div2);
        let devicesUl = renderDevicesList(result); // получаем список
        div.append(devicesUl); // добавляем список на страницу в div с id
      }
      return div; // возвращаем список
    }

    let devicesGroupsUl = renderDevicesGroupsList(devicesGroupsList); // получаем список
    document.getElementById("vehicle").append(devicesGroupsUl); // добавляем список на страницу в div с id
    VEHICLETITLE.textContent = "Транспортные средства";

    function renderDevicesList(devicesList) {
      let div = document.createElement("div");
      div.classList.add("tree__vehicle");
      devicesList.forEach((elems) => {
        let inputcheck = document.createElement("input");
        inputcheck.id = `${elems.ID}`;
        inputcheck.type = "checkbox";
        inputcheck.name = `${elems.Name}`;
        inputcheck.classList.add("tree__vehicle_item-check");
        div.append(inputcheck);
        let label = document.createElement("label");
        inputcheck.id = `${elems.ID}`;
        label.classList.add("tree__vehicle_item");
        label.textContent = `${elems.Name}`;
        div.append(label);
        let div2 = document.createElement("div");
        div.append(div2);
      });
      return div; // возвращаем список
    }
  });

  let vehicles = document.querySelectorAll(".tree__vehicle_item");
  let vehiclesCheck = document.querySelectorAll(".tree__vehicle_item-check");
  let allLayerGroups = [];
  let j = 0;
  for (let i = 0; i < vehicles.length; i++) {
    vehiclesCheck[i].addEventListener("change", function () {
      if (vehiclesCheck[i].checked) {
        console.log("checked");

        getData("https://test.agweb.cloud/ServiceJSON/GetTrack", {
          session: `${token}`, // Токен аутентификации который возвращает метод Login
          schemaID: `${enumSchemas}`, // ID схемы, которые возвращаются EnumSchemas
          IDs: `${vehiclesCheck[i].id}`, //Список идентификаторов ТС (их можно получить с помощью EnumDevices – поле ID в классе RGroupItem)
          SD: `${gmd}`, //Начало временного периода. Время с учетом UTCOffset заданном в методе «Login» в формате yyyyMMdd или yyyyMMdd-HHmm
          ED: `${gmdhm}`, //Конец временного периода. Время с учетом UTCOffset заданном в методе «Login» в формате yyyyMMdd или yyyyMMdd-HHmm
          // tripSplitterIndex, //integer($int32) (query) Идентификатор разбиения на рейсы (по умолчанию 0), -1 если не разбивать на рейсы
        }).then((data) => {
          // console.log(data);
          let result = JSON.parse(data);
          console.log(result);
          let deviceID = vehiclesCheck[i].id;
          console.log(deviceID);
          console.log(result[deviceID]);
          let deviceName = vehiclesCheck[i].name;
          // console.log(deviceName);
          // console.log(typeof data.slice(40, -1));
          // console.log(vehiclesCheck[i].id.toString());
          if (result[deviceID].length == 0) {
            vehicles[i].textContent = "пока нет данных за текущие UTC сутки";
          }
          // console.log(JSON.parse(data.slice(41, -2)));
          const trackLatList = JSON.parse(data.slice(41, -2)).Lat;
          const trackLngList = JSON.parse(data.slice(41, -2)).Lng;
          console.log(trackLatList);
          console.log(trackLngList);
          const coordinates = [];
          let coordinate = [trackLatList[0], trackLngList[0]];
          coordinates.push(coordinate);
          var objects = [];
          for (let index = 1; index < trackLatList.length; index++) {
            coordinate = [trackLatList[index], trackLngList[index]];
            coordinates.push(coordinate);
            var circle = L.circle(coordinate, {
              color: "red",
              fillColor: "#f03",
              fillOpacity: 0.5,
              radius: 5,
            });
            // .addTo(map);
            objects.push(circle);
            var line = L.polyline(
              [coordinates[index - 1], coordinates[index]],
              {
                color: "red",
                weight: 3,
              }
            );
            // .addTo(map);
            objects.push(line);
          }
          console.log(coordinates);
          var marker = L.marker(coordinates[0])
            // .addTo(map)
            .bindPopup(deviceName)
            .openPopup();
          // var polygon = L.polygon(coordinates).addTo(map);
          // console.log(vehicles[i].textContent);
          objects.push(marker);
          var layerGroup = L.layerGroup(objects);
          layerGroup.addTo(map);
          console.log(allLayerGroups);
          var leafletId = layerGroup._leaflet_id;
          console.log(layerGroup);
          allLayerGroups.push({ id: i, layer: leafletId });
          marker.bindPopup(deviceName).openPopup();
        });
      } else {
        console.log(allLayerGroups);
        console.log(allLayerGroups[0].layer);
      }
    });
  }

  let currentGeofence = "3e9582ea-5b41-42eb-9ecd-062c674cfadd"; // ПОКА ВЫБЕРУ ТОЛЬКО ЧАСТЬ ДАННЫХ ЧТОБЫ НЕ УТОНУТЬ В НИХ

  await getData("https://test.agweb.cloud/ServiceJSON/EnumGeoFences", {
    session: `${token}`, // Токен аутентификации который возвращает метод Login
    schemaID: `${enumSchemas}`, // ID схемы, которые возвращаются EnumSchemas
    // parentIDs: null, // string (query) ID корневого элемента иерархии
    // parentIDs: "a923e79c-eef5-428f-b6b1-8be6f2ea80dd", // string (query) ID корневого элемента иерархии
    // parentIDs: "c929f308-f0f3-4867-bced-ebe518623b87", // string (query) ID корневого элемента иерархии
    // parentIDs: "008d5d49-e952-47a0-85bf-ecc9ce1e25ec", // string (query) ID корневого элемента иерархии
    // parentIDs: "daa6e1da-bb79-4f44-adeb-c82272079923", // string (query) ID корневого элемента иерархии
    parentIDs: `${currentGeofence}`, // string (query) ID корневого элемента иерархии
  }).then((data) => {
    const geoFencesList = JSON.parse(data).Items;
    // console.log(geoFencesList);

    let div = document.createElement("div");
    div.id = "geofences";
    document.body.append(div); // добавляем div на страницу

    function renderGeoFencesList(geoFencesList) {
      let div = document.createElement("div");
      div.classList.add("tree__geofences");
      geoFencesList.forEach((elems) => {
        let inputcheck = document.createElement("input");
        inputcheck.id = `${elems.ID}`;
        inputcheck.type = "checkbox";
        inputcheck.classList.add("tree__geofences_item-check");
        div.append(inputcheck);
        let label = document.createElement("label");
        label.classList.add("tree__geofences_item");
        label.textContent = `${elems.Name}`;
        div.append(label);
        let div2 = document.createElement("div");
        div.append(div2);
      });
      return div; // возвращаем список
    }
    let geofencesUl = renderGeoFencesList(geoFencesList); // получаем список
    document.getElementById("geofences").append(geofencesUl); // добавляем список на страницу в div
    GEOFENCESTITLE.textContent = "Геозоны";
  });

  await getData("https://test.agweb.cloud/ServiceJSON/EnumGeoFences", {
    session: `${token}`, // Токен аутентификации который возвращает метод Login
    schemaID: `${enumSchemas}`, // ID схемы, которые возвращаются EnumSchemas
    // parentIDs: null, // string (query) ID корневого элемента иерархии
    // parentIDs: "a923e79c-eef5-428f-b6b1-8be6f2ea80dd", // string (query) ID корневого элемента иерархии
    // parentIDs: "c929f308-f0f3-4867-bced-ebe518623b87", // string (query) ID корневого элемента иерархии
    // parentIDs: "008d5d49-e952-47a0-85bf-ecc9ce1e25ec", // string (query) ID корневого элемента иерархии
    parentIDs: "daa6e1da-bb79-4f44-adeb-c82272079923", // string (query) ID корневого элемента иерархии
    // parentIDs: "3e9582ea-5b41-42eb-9ecd-062c674cfadd", // string (query) ID корневого элемента иерархии
    // ПОКА ВЫБЕРУ ТОЛЬКО ЧАСТЬ ДАННЫХ ЧТОБЫ НЕ УТОНУТЬ В НИХ
  }).then((data) => {
    const geoFencesLevel1 = JSON.parse(data).Groups;
    console.log(geoFencesLevel1);
    const geofencesGroupLevel1 = geoFencesLevel1.filter(
      (geoFencesLevel1) => geoFencesLevel1.ID === currentGeofence
    )[0].Name;
    console.log(geofencesGroupLevel1);
    currentGeofence = "daa6e1da-bb79-4f44-adeb-c82272079923";

    let div = document.createElement("div");
    div.classList.add("tree__geofencesgrour1");
    let inputcheck = document.createElement("input");
    inputcheck.type = "checkbox";
    inputcheck.checked = true;
    inputcheck.disabled = true;
    inputcheck.classList.add("tree__geofences_item-check");
    div.append(inputcheck);
    let label = document.createElement("label");
    label.classList.add("tree__geofences_item");
    label.textContent = geofencesGroupLevel1;
    div.append(label);
    document.getElementById("geofences").prepend(div);
  });

  await getData("https://test.agweb.cloud/ServiceJSON/EnumGeoFences", {
    session: `${token}`, // Токен аутентификации который возвращает метод Login
    schemaID: `${enumSchemas}`, // ID схемы, которые возвращаются EnumSchemas
    // parentIDs: null, // string (query) ID корневого элемента иерархии
    // parentIDs: "a923e79c-eef5-428f-b6b1-8be6f2ea80dd", // string (query) ID корневого элемента иерархии
    // parentIDs: "c929f308-f0f3-4867-bced-ebe518623b87", // string (query) ID корневого элемента иерархии
    parentIDs: "008d5d49-e952-47a0-85bf-ecc9ce1e25ec", // string (query) ID корневого элемента иерархии
    // parentIDs: "daa6e1da-bb79-4f44-adeb-c82272079923", // string (query) ID корневого элемента иерархии
    // parentIDs: "3e9582ea-5b41-42eb-9ecd-062c674cfadd", // string (query) ID корневого элемента иерархии
    // ПОКА ВЫБЕРУ ТОЛЬКО ЧАСТЬ ДАННЫХ ЧТОБЫ НЕ УТОНУТЬ В НИХ
  }).then((data) => {
    const geoFencesLevel2 = JSON.parse(data).Groups;
    console.log(geoFencesLevel2);
    const geofencesGroupLevel2 = geoFencesLevel2.filter(
      (geoFencesLevel2) => geoFencesLevel2.ID === currentGeofence
    )[0].Name;
    console.log(geofencesGroupLevel2);
    currentGeofence = "008d5d49-e952-47a0-85bf-ecc9ce1e25ec";

    let div = document.createElement("div");
    div.classList.add("tree__geofencesgrour2");
    let inputcheck = document.createElement("input");
    inputcheck.type = "checkbox";
    inputcheck.checked = true;
    inputcheck.disabled = true;
    inputcheck.classList.add("tree__geofences_item-check");
    div.append(inputcheck);
    let label = document.createElement("label");
    label.classList.add("tree__geofences_item");
    label.textContent = geofencesGroupLevel2;
    div.append(label);
    document.getElementById("geofences").prepend(div);
  });

  await getData("https://test.agweb.cloud/ServiceJSON/EnumGeoFences", {
    session: `${token}`, // Токен аутентификации который возвращает метод Login
    schemaID: `${enumSchemas}`, // ID схемы, которые возвращаются EnumSchemas
    // parentIDs: null, // string (query) ID корневого элемента иерархии
    // parentIDs: "a923e79c-eef5-428f-b6b1-8be6f2ea80dd", // string (query) ID корневого элемента иерархии
    parentIDs: "c929f308-f0f3-4867-bced-ebe518623b87", // string (query) ID корневого элемента иерархии
    // parentIDs: "008d5d49-e952-47a0-85bf-ecc9ce1e25ec", // string (query) ID корневого элемента иерархии
    // parentIDs: "daa6e1da-bb79-4f44-adeb-c82272079923", // string (query) ID корневого элемента иерархии
    // parentIDs: "3e9582ea-5b41-42eb-9ecd-062c674cfadd", // string (query) ID корневого элемента иерархии
    // ПОКА ВЫБЕРУ ТОЛЬКО ЧАСТЬ ДАННЫХ ЧТОБЫ НЕ УТОНУТЬ В НИХ
  }).then((data) => {
    const geoFencesLevel3 = JSON.parse(data).Groups;
    console.log(geoFencesLevel3);
    const geofencesGroupLevel3 = geoFencesLevel3.filter(
      (geoFencesLevel3) => geoFencesLevel3.ID === currentGeofence
    )[0].Name;
    console.log(geofencesGroupLevel3);
    currentGeofence = "c929f308-f0f3-4867-bced-ebe518623b87";

    let div = document.createElement("div");
    div.classList.add("tree__geofencesgrour3");
    let inputcheck = document.createElement("input");
    inputcheck.type = "checkbox";
    inputcheck.checked = true;
    inputcheck.disabled = true;
    inputcheck.classList.add("tree__geofences_item-check");
    div.append(inputcheck);
    let label = document.createElement("label");
    label.classList.add("tree__geofences_item");
    label.textContent = geofencesGroupLevel3;
    div.append(label);
    document.getElementById("geofences").prepend(div);
  });

  await getData("https://test.agweb.cloud/ServiceJSON/EnumGeoFences", {
    session: `${token}`, // Токен аутентификации который возвращает метод Login
    schemaID: `${enumSchemas}`, // ID схемы, которые возвращаются EnumSchemas
    // parentIDs: null, // string (query) ID корневого элемента иерархии
    parentIDs: "a923e79c-eef5-428f-b6b1-8be6f2ea80dd", // string (query) ID корневого элемента иерархии
    // parentIDs: "c929f308-f0f3-4867-bced-ebe518623b87", // string (query) ID корневого элемента иерархии
    // parentIDs: "008d5d49-e952-47a0-85bf-ecc9ce1e25ec", // string (query) ID корневого элемента иерархии
    // parentIDs: "daa6e1da-bb79-4f44-adeb-c82272079923", // string (query) ID корневого элемента иерархии
    // parentIDs: "3e9582ea-5b41-42eb-9ecd-062c674cfadd", // string (query) ID корневого элемента иерархии
    // ПОКА ВЫБЕРУ ТОЛЬКО ЧАСТЬ ДАННЫХ ЧТОБЫ НЕ УТОНУТЬ В НИХ
  }).then((data) => {
    const geoFencesLevel4 = JSON.parse(data).Groups;
    console.log(geoFencesLevel4);
    const geofencesGroupLevel4 = geoFencesLevel4.filter(
      (geoFencesLevel4) => geoFencesLevel4.ID === currentGeofence
    )[0].Name;
    console.log(geofencesGroupLevel4);
    currentGeofence = "c929f308-f0f3-4867-bced-ebe518623b87";

    let div = document.createElement("div");
    div.classList.add("tree__geofencesgrour4");
    let inputcheck = document.createElement("input");
    inputcheck.type = "checkbox";
    inputcheck.checked = true;
    inputcheck.disabled = true;
    inputcheck.classList.add("tree__geofences_item-check");
    div.append(inputcheck);
    let label = document.createElement("label");
    label.classList.add("tree__geofences_item");
    label.textContent = geofencesGroupLevel4;
    div.append(label);
    document.getElementById("geofences").prepend(div);
  });

  let geofences = document.querySelectorAll(".tree__geofences_item");
  let geofencesCheck = document.querySelectorAll(".tree__geofences_item-check");
  for (let i = 0; i < geofences.length; i++) {
    geofencesCheck[i].addEventListener("click", function () {
      console.log(geofences[i].textContent);
      getData("https://test.agweb.cloud/ServiceJSON/GetGeofences", {
        session: `${token}`, // Токен аутентификации который возвращает метод Login
        schemaID: `${enumSchemas}`, // ID схемы, которые возвращаются EnumSchemas
        IDs: `${geofencesCheck[i].id}`, // (query) ID геозон через запятую. Если параметр не задан, используются все геозоны схемы.
      }).then((data) => {
        // console.log(data);
        let response = JSON.parse(data);
        // console.log(response);
        let geofenceId = geofencesCheck[i].id;
        // console.log(response[geofenceId].Lat);
        // console.log(response[geofenceId].Lng);
        const geofencesLatList = response[geofenceId].Lat;
        const geofencesLngList = response[geofenceId].Lng;
        const coordinates = [];
        for (let index = 0; index < geofencesLatList.length; index++) {
          let coordinate = [geofencesLatList[index], geofencesLngList[index]];
          coordinates.push(coordinate);
        }
        console.log(coordinates);
        var marker = L.marker(coordinates[0])
          .addTo(map)
          .bindPopup(geofences[i].textContent)
          .openPopup();
        var polygon = L.polygon(coordinates).addTo(map);
        console.log(geofences[i].textContent);
        var circle = L.circle(coordinates[0], {
          color: "red",
          fillColor: "#f03",
          fillOpacity: 0.5,
          radius: response[geofenceId].R,
        }).addTo(map);
      });
    });
  }
};

getToken("https://test.agweb.cloud/ServiceJSON/Login", {
  UserName: "userapi", // Логин
  password: 123, // Пароль
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
