// // /ServiceJSON/Login Метод Login аутентифицирует пользователя по логину/паролю и возвращает токен,
// который используется во всех последующих запросах.
// В случае успешной аутентификации возвращается строка-токен.
// В случае ошибочной аутентификации возвращается пустая строка и HTTP Status Code = 401.

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
