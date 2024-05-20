import {
  trafficLevels,
  translateType,
  translateSubtype,
  selectIcon,
  jamTranslate,
  delaySecondsToMinutes,
  metersPerSecondToKilometersPerHour,
  zipObjects,
  translateLevel,
} from "../../jsScripts/waze/wazeUtils.js";

var trafficBar = null;
var trafficViewInterval = null;
// Usar múltiplos que dêem razões inteiras, por conta de time series e de series size.
// Outros valores que funcionam: 10 minute rate e 3 hours monitored
const TIME_SERIES_FETCH_MINUTE_RATE = 5;
const TIME_SERIES_HOURS_MONITORED = 2;
const TIME_SERIES_MINUTES_MONITORED = TIME_SERIES_HOURS_MONITORED * 60;
const TRAFFIC_VIEW_RETRIEVAL_INTERVAL = 60000;

const handle = document.getElementById("handle");
const sidebar = document.getElementById("trafficViewTableContainer");
let isResizing = false;

handle.addEventListener("mousedown", (e) => {
  isResizing = true;
  document.addEventListener("mousemove", resizeSidebar);
  document.addEventListener("mouseup", stopResize);
});

function resizeSidebar(e) {
  if (isResizing) {
    const sidebarWidth = e.clientX - sidebar.offsetLeft;
    sidebar.style.width = sidebarWidth + "px";
  }
}

function stopResize() {
  isResizing = false;
  document.removeEventListener("mousemove", resizeSidebar);
  document.removeEventListener("mouseup", stopResize);
}

window.Apex = {};

var style = getComputedStyle(document.body);

const seriesSize =
  TIME_SERIES_MINUTES_MONITORED / TIME_SERIES_FETCH_MINUTE_RATE;

const initialSeriesArray = new Array(seriesSize).fill(0);
var seriesData = {
  0: initialSeriesArray.slice(),
  1: initialSeriesArray.slice(),
  2: initialSeriesArray.slice(),
  3: initialSeriesArray.slice(),
  4: initialSeriesArray.slice(),
};

const categoryData = new Array(seriesSize).fill("Sem info").slice();

var trafficViewTimeSeriesChartOptions = {
  colors: [
    style.getPropertyValue("--level4"),
    style.getPropertyValue("--level3"),
    style.getPropertyValue("--level2"),
    style.getPropertyValue("--level1"),
    style.getPropertyValue("--level0"),
  ],
  series: [
    {
      name: translateLevel[4].descricao,
      data: seriesData[4],
    },
    {
      name: translateLevel[3].descricao,
      data: seriesData[3],
    },
    {
      name: translateLevel[2].descricao,
      data: seriesData[2],
    },
    {
      name: translateLevel[1].descricao,
      data: seriesData[1],
    },
    {
      name: translateLevel[0].descricao,
      data: seriesData[0],
    },
  ],
  chart: {
    type: "area",
    height: 350,
    stacked: true,
    background: "#0000",
    foreColor: "#fff",
    fontFamily: "Kanit, sans-serif",
    id: "area-1",
    group: "usersOnJamsApexCharts",
  },
  title: {
    text: `Série temporal - Usuários por nível de congestionamento (${
      TIME_SERIES_MINUTES_MONITORED / 60
    } horas / ${TIME_SERIES_FETCH_MINUTE_RATE} minutos)`,
    align: "center",
  },
  dataLabels: {
    enabled: false,
  },
  legend: {
    show: false,
  },
  xaxis: {
    categories: categoryData,
    labels: {
      rotate: -45,
      rotateAlways: true,
    },
  },
  yaxis: {
    labels: {
      minWidth: 40,
      formatter: function (value) {
        return `${value}%`;
      },
    },
    max: 100,
  },
  fill: {
    opacity: 1,
    type: "solid",
  },
  stroke: { curve: "monotoneCubic" },
};

var trafficViewTimeSeriesChart = new ApexCharts(
  usersOnJamsTimeSeriesContainer,
  trafficViewTimeSeriesChartOptions
);
trafficViewTimeSeriesChart.render();

const usersOnJamsData = {
  0: initialSeriesArray.slice(),
  1: initialSeriesArray.slice(),
  2: initialSeriesArray.slice(),
  3: initialSeriesArray.slice(),
  4: initialSeriesArray.slice(),
};

var usersOnJamsCountTimeSeriesChartOptions = {
  colors: [
    style.getPropertyValue("--level4"),
    style.getPropertyValue("--level3"),
    style.getPropertyValue("--level2"),
    style.getPropertyValue("--level1"),
    style.getPropertyValue("--level0"),
  ],
  series: [
    {
      name: translateLevel[4].descricao,
      data: usersOnJamsData[4],
    },
    {
      name: translateLevel[3].descricao,
      data: usersOnJamsData[3],
    },
    {
      name: translateLevel[2].descricao,
      data: usersOnJamsData[2],
    },
    {
      name: translateLevel[1].descricao,
      data: usersOnJamsData[1],
    },
    {
      name: translateLevel[0].descricao,
      data: usersOnJamsData[0],
    },
  ],
  chart: {
    height: 200,
    type: "area",
    background: "#0000",
    stacked: true,
    foreColor: "#fff",
    fontFamily: "Kanit, sans-serif",
    id: "area-2",
    group: "usersOnJamsApexCharts",
    zoom: {
      enabled: false,
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: "monotoneCubic",
  },
  fill: {
    opacity: 1,
    type: "solid",
  },
  legend: { show: false },
  title: {
    text: `Série temporal - Total de usuários Waze (${
      TIME_SERIES_MINUTES_MONITORED / 60
    } horas / ${TIME_SERIES_FETCH_MINUTE_RATE} minutos)`,
    align: "center",
  },
  xaxis: {
    categories: categoryData,
    labels: {
      rotate: -45,
      rotateAlways: true,
    },
  },
  yaxis: {
    labels: {
      minWidth: 40,
    },
  },
};

var usersOnJamsCountTimeSeriesChart = new ApexCharts(
  usersOnJamsCountTimeSeriesContainer,
  usersOnJamsCountTimeSeriesChartOptions
);
usersOnJamsCountTimeSeriesChart.render();

var monitoredKmData = {
  1: initialSeriesArray.slice(),
  2: initialSeriesArray.slice(),
  3: initialSeriesArray.slice(),
  4: initialSeriesArray.slice(),
};

var monitoredKmTimeSeriesChartOptions = {
  colors: [
    style.getPropertyValue("--level4"),
    style.getPropertyValue("--level3"),
    style.getPropertyValue("--level2"),
    style.getPropertyValue("--level1"),
  ],
  series: [
    {
      name: translateLevel[4].descricao,
      data: monitoredKmData[4],
    },
    {
      name: translateLevel[3].descricao,
      data: monitoredKmData[3],
    },
    {
      name: translateLevel[2].descricao,
      data: monitoredKmData[2],
    },
    {
      name: translateLevel[1].descricao,
      data: monitoredKmData[1],
    },
  ],
  chart: {
    height: 200,
    type: "area",
    stacked: true,
    background: "#0000",
    foreColor: "#fff",
    fontFamily: "Kanit, sans-serif",
    id: "area-3",
    group: "usersOnJamsApexCharts",
    zoom: {
      enabled: false,
    },
  },
  legend: {
    show: false,
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: "monotoneCubic",
  },
  fill: {
    opacity: 1,
    type: "solid",
  },
  title: {
    text: `Série temporal - Extensão de congestionamento por nível em quilômetros (${
      TIME_SERIES_MINUTES_MONITORED / 60
    } horas / ${TIME_SERIES_FETCH_MINUTE_RATE} minutos)`,
    align: "center",
  },
  xaxis: {
    categories: categoryData,
    labels: {
      rotate: -45,
      rotateAlways: true,
    },
  },
  yaxis: {
    labels: {
      minWidth: 40,
      formatter: function (value) {
        return `${Math.round(value)} km`;
      },
    },
    tickAmount: 2,
  },
};

var monitoredKmTimeSeriesChart = new ApexCharts(
  monitoredKmTimeSeriesContainer,
  monitoredKmTimeSeriesChartOptions
);
monitoredKmTimeSeriesChart.render();

var maxTotalUsers = new Array(seriesSize).fill(0).slice();
var sumOfLengths = null;
var sumOfUsers = null;
var maxSumOfLengths = new Array(seriesSize).fill(0).slice();

function wazeTrafficData() {
  try {
    async function plotTrafficView() {
      // Substitua fetchAPIURL pela URL do feed do traffic view
      trafficBar = await fetch(fetchAPIURL("waze-traffic-view-feed"))
        .then((response) => response.json())
        .then((wazeFeed) => {
          wazeometerRow.innerHTML = "";
          wazelengthsRow.innerHTML = "";
          const trafficViewList = document.getElementById("trafficViewList");
          trafficViewList.innerHTML = "";

          const { usersOnJams, routes, lengthOfJams, irregularities } =
            wazeFeed;

          let traffic = new trafficLevels(usersOnJams);

          irregularities.length
            ? irregularities.map((irr) => {
                if (irr.historicTime) {
                  const trafficViewIrregularityTr =
                    document.createElement("tr");
                  trafficViewIrregularityTr.style.fontSize = "10px";
                  const jamLevel = irr.jamLevel;
                  const name = `${irr.name ? irr.name : ""}`;
                  const fromTo = `${irr.fromName ? "de " + irr.fromName : ""}${
                    irr.toName ? " até " + irr.toName : ""
                  }`;
                  const length = irr.length ? irr.length / 1000 : 0;

                  const usualDelay = delaySecondsToMinutes(irr.historicTime);
                  const totalDelay = delaySecondsToMinutes(irr.time);
                  const totalSpeed = metersPerSecondToKilometersPerHour(
                    irr.length,
                    irr.time
                  );
                  const usualSpeed = metersPerSecondToKilometersPerHour(
                    irr.length,
                    irr.historicTime
                  );
                  const actualDelay = delaySecondsToMinutes(
                    irr.time - irr.historicTime
                  );
                  const trafficViewIrregularityTdLeft =
                    document.createElement("td");
                  trafficViewIrregularityTdLeft.innerHTML = [
                    `<strong>${name}</strong>`,
                    fromTo,
                    `${length.toFixed(2)} km`,
                  ].join("<br />");
                  let hasLeadAlert = false;
                  let icon, subtype, type;
                  if (irr.leadAlert) {
                    hasLeadAlert = true;
                    icon = selectIcon({ leadAlert: irr.leadAlert });
                    subtype = translateSubtype(irr.leadAlert.subType);
                    type = translateType[irr.leadAlert.type];
                  }

                  const alternateRoute = irr.alternateRoute
                    ? encodeURI(JSON.stringify(irr.alternateRoute))
                    : null;

                  trafficViewIrregularityTdLeft.style = `border-left: 5px solid var(--level${jamLevel}); padding: 8px`;
                  trafficViewIrregularityTr.append(
                    trafficViewIrregularityTdLeft
                  );
                  const trafficViewIrregularityTdRight =
                    document.createElement("td");
                  trafficViewIrregularityTdRight.style = `border-right: 5px solid var(--level${jamLevel}); display: flex; align-items: center; padding: 8px`;

                  const link = document.createElement("a");
                  const { minY, minX, maxY, maxX } = irr.bbox;
                  link.href = `../../?minY=${minY}&minX=${minX}&maxY=${maxY}&maxX=${maxX}&layer=waze&alternateRoute=${alternateRoute}`;
                  link.target = "_blank";

                  const goImg = document.createElement("img");
                  goImg.src = "../img/favicon.svg";
                  goImg.width = "30";
                  link.append(goImg);

                  const trafficViewIrregularityTdRightDiv =
                    document.createElement("div");
                  trafficViewIrregularityTdRightDiv.style = "flex-grow: 1";
                  trafficViewIrregularityTdRightDiv.innerHTML =
                    `<p style="margin: 0px; color: var(--level${jamLevel})">` +
                    [
                      `<strong>Atraso: ${actualDelay} min</strong>`,
                      translateLevel[jamLevel].descricao,
                      `No momento: ${totalDelay} min | ${totalSpeed.toFixed(
                        2
                      )} km/h`,
                      `Habitual: ${usualDelay} min | ${usualSpeed.toFixed(
                        2
                      )} km/h`,
                    ].join("<br />") +
                    "</p>";
                  trafficViewIrregularityTdRight.append(
                    trafficViewIrregularityTdRightDiv
                  );
                  trafficViewIrregularityTdRight.append(link);
                  if (hasLeadAlert) {
                    const div = document.createElement("div");
                    div.style =
                      "display: flex; align-items: center; margin: 5px 0px";
                    const iconImg = document.createElement("img");
                    iconImg.src = `.${icon}`;
                    iconImg.width = "30";
                    iconImg.style = "";
                    const alertEngagementRate = document.createElement("p");
                    alertEngagementRate.style = "flex-grow: 1; margin: 0px 5px";
                    alertEngagementRate.innerHTML = `${
                      irr.leadAlert.description
                        ? irr.leadAlert.description + "<br />"
                        : ""
                    }Comentários: ${
                      irr.leadAlert.numComments
                    }<br />Confirmações: ${
                      irr.leadAlert.numThumbsUp
                    }<br />Contestações: ${irr.leadAlert.numNotThereReports}`;
                    div.append(iconImg);
                    div.append(alertEngagementRate);
                    trafficViewIrregularityTdRightDiv.append(div);
                    trafficViewIrregularityTdRightDiv.innerHTML += `<p style="margin: 0px"><strong>Alerta associado:</strong> ${type} - ${subtype}</p>`;
                  }
                  const alternateRouteName = irr.alternateRoute
                    ? irr.alternateRoute.name
                    : null;
                  if (alternateRouteName) {
                    const alternateRouteJamLevel = irr.alternateRoute.jamLevel;
                    trafficViewIrregularityTdRightDiv.innerHTML += `<p style="margin: 5px 0px 0px 0px; color: var(--alternate-route)"><strong>Rota alternativa:</strong> ${alternateRouteName} com <strong>${jamTranslate[
                      alternateRouteJamLevel
                    ].toLowerCase()}</strong></p>`;
                  }

                  trafficViewIrregularityTr.append(
                    trafficViewIrregularityTdRight
                  );
                  trafficViewIrregularityTr.style.backgroundColor = "#fff"; //`#e8eaed`;
                  trafficViewList.append(trafficViewIrregularityTr);
                } else {
                  console.log(irr);
                }
              })
            : void 0;

          if (trafficViewList.innerHTML) {
            const irregularitiesTitleTr = document.createElement("tr");
            const irregularitiesTitleTd = document.createElement("td");
            irregularitiesTitleTd.innerHTML = "ANOMALIAS DE TRÂNSITO";
            irregularitiesTitleTd.colSpan = 2;
            irregularitiesTitleTd.style =
              "text-align: center; background-color: #ffa700";
            irregularitiesTitleTr.append(irregularitiesTitleTd);
            trafficViewList.insertBefore(
              irregularitiesTitleTr,
              trafficViewList.firstChild
            );

            const spacerTr = document.createElement("tr");
            const spacerTd = document.createElement("td");
            spacerTd.innerHTML = "<br />";
            spacerTr.append(spacerTd);
            trafficViewList.append(spacerTr);
          }

          const routesTitleTr = document.createElement("tr");
          const routesTitleTd = document.createElement("td");
          routesTitleTd.innerHTML = "LISTA DE ACOMPANHAMENTO";
          routesTitleTd.colSpan = 2;
          routesTitleTd.style = "text-align: center; background-color: #9f9f9f";
          routesTitleTr.append(routesTitleTd);
          trafficViewList.append(routesTitleTr);

          routes.length
            ? routes.map((route) => {
                if (route.historicTime) {
                  const trafficViewRouteTr = document.createElement("tr");
                  trafficViewRouteTr.style.fontSize = "10px";
                  const jamLevel = route.jamLevel;
                  const name = `${route.name ? route.name : ""}`;
                  const fromTo = `${
                    route.fromName ? "de " + route.fromName : ""
                  }${route.toName ? " até " + route.toName : ""}`;
                  const length = route.length ? route.length / 1000 : 0;
                  const delay = delaySecondsToMinutes(route.time);
                  const usualDelay = delaySecondsToMinutes(route.historicTime);
                  const totalDelay = delaySecondsToMinutes(route.time);
                  const totalSpeed = metersPerSecondToKilometersPerHour(
                    route.length,
                    route.time
                  );
                  const usualSpeed = metersPerSecondToKilometersPerHour(
                    route.length,
                    route.historicTime
                  );
                  const trafficViewRouteTdLeft = document.createElement("td");
                  trafficViewRouteTdLeft.innerHTML = [
                    `<strong>${name}</strong>`,
                    fromTo,
                    `${length.toFixed(2)} km`,
                  ].join("<br />");
                  trafficViewRouteTdLeft.style = `border-left: 5px solid var(--level${jamLevel}); padding: 8px`;
                  trafficViewRouteTr.append(trafficViewRouteTdLeft);
                  const trafficViewRouteTdRight = document.createElement("td");
                  trafficViewRouteTdRight.style = `border-right: 5px solid var(--level${jamLevel}); display: flex; align-items: center; padding: 8px`;
                  const link = document.createElement("a");
                  const { minY, minX, maxY, maxX } = route.bbox;
                  link.href = `../../?minY=${minY}&minX=${minX}&maxY=${maxY}&maxX=${maxX}&layer=waze`;
                  link.target = "_blank";
                  const goImg = document.createElement("img");
                  goImg.src = "../img/favicon.svg";
                  goImg.width = "30";
                  link.append(goImg);
                  trafficViewRouteTdRight.innerHTML =
                    `<div style="flex-grow:1"><p style="margin: 0px; color: var(--level${jamLevel})">` +
                    [
                      `<strong>${
                        jamTranslate[jamLevel]
                      }</strong></p><p style="margin-top: 0px">No momento: ${totalDelay} min | ${totalSpeed.toFixed(
                        2
                      )} km/h`,
                      `Habitual: ${usualDelay} min | ${usualSpeed.toFixed(
                        2
                      )} km/h`,
                    ].join("<br />") +
                    "</p></div>";
                  trafficViewRouteTdRight.append(link);
                  trafficViewRouteTr.append(trafficViewRouteTdRight);
                  trafficViewRouteTr.style.backgroundColor = "#fff"; //`#e8eaed`;
                  trafficViewList.append(trafficViewRouteTr);
                } else {
                  console.log(route);
                }
              })
            : void 0;

          // Plot waze-o-meter to page
          // let oi = traffic.jamStats.reduce((e, t) => e + t.percent + "fr ", "");
          // console.log(oi);

          let colspan = 0;

          traffic.jamStats.map((t) => {
            if (t.percent > 0) {
              let level = document.createElement("td");
              level.innerHTML = `&nbsp;${t.percent}%&nbsp;`;
              level.style.width = `${t.percent}%`;
              level.classList.add(`trafficmeter${t.jamLevel}`);
              wazeometerRow.appendChild(level);
              colspan += 1;
            }
          });

          let trafficLength = (lengthOfJams) => {
            let sumLengths = null;
            lengthOfJams.map((e) => {
              sumLengths += e.jamLength;
            });
          };

          let trafficUsers = (usersOnJams, lengthOfJams) => {
            let blockLengthTitle = "Não se soma ao total congestionado";
            let gapTitle =
              "Comprimento de um veículo mais sua distância do veículo à frente, estimado por nível de congestionamento";
            let occupancyTitle =
              "Produto dos usuários Waze pelo gap, estimado por nível de congestionamento";
            let percentTitle =
              "Porcentagem de usuários Waze por nível de congestionamento";
            let lengthTitle =
              "Extensão dos congestionamentos, segundo apurada pelo Waze. Sem impedimentos, não há extensão de congestionamento. Vias bloqueadas afetam, mas não se somam ao total de congestionamento.";
            let usersTitle = "Quantidade de usuários utilizando o app Waze";
            let totalLength = null;
            let blockedRoadKm = null;
            let totalOccupancyRate = null;
            let totalUsers = null;
            let percent = null;

            let blockedRoadStyle;

            const zippedTrafficInfo = zipObjects(usersOnJams, lengthOfJams);

            usersOnJamsTableBody.innerHTML = `<tr style="background-color: black;"><th>Nível de congestionamento</th><th title="${usersTitle}">Usuários Waze</th><th title="${lengthTitle}">Extensão</th><th title="${percentTitle}">≈ %</th><th title="${gapTitle}">≈ Gap</th><th title="${occupancyTitle}">≈ Ocupação da via</th></tr>`;

            zippedTrafficInfo.map((e) => {
              totalUsers += e.wazersCount;

              totalLength += e.jamLength;
              totalOccupancyRate +=
                e.wazersCount * translateLevel[e.jamLevel].distancia;
              percent = traffic.jamStats.find((i) => i.jamLevel === e.jamLevel);
              percent = percent ? percent.percent : 0;

              blockedRoadKm = e.jamLevel == 5 ? e.jamLength : 0;
              blockedRoadStyle =
                e.jamLevel == 5
                  ? `style="color: black; background-color: gray" title="${blockLengthTitle}"`
                  : "";

              let description = translateLevel[e.jamLevel].descricao;
              let wazeUsers = e.wazersCount ? Math.round(e.wazersCount) : "-";
              let length = e.jamLength ? Math.round(e.jamLength / 1000) : "-";
              let gap = Math.round(translateLevel[e.jamLevel].distancia);
              let occupancy = Math.round(
                (e.wazersCount * translateLevel[e.jamLevel].distancia) / 1000
              );

              let usersPerLevelTr = document.createElement("tr");
              usersPerLevelTr.classList.add(`trafficmeter${e.jamLevel}`);
              usersPerLevelTr.innerHTML = `<td>${description}</td>`;
              usersPerLevelTr.innerHTML += `<td title="${usersTitle}">${wazeUsers}</td>`;
              usersPerLevelTr.innerHTML += `<td ${blockedRoadStyle} title="${lengthTitle}">${length} km</td>`;
              usersPerLevelTr.innerHTML += `<td title="${percentTitle}">${percent}%</td>`;
              usersPerLevelTr.innerHTML += `<td title="${gapTitle}">${gap} m</td>`;
              usersPerLevelTr.innerHTML += `<td title="${occupancyTitle}">${occupancy} km</td>`;
              usersOnJamsTableBody.append(usersPerLevelTr);
            });

            wazelengthsRow.colSpan = colspan;
            wazelengthsRow.innerHTML = `${Math.round(
              totalUsers
            )} usuários Waze por nível de congestionamento`;
            wazelengthsRow.style.textAlign = "center";
            let totalUsersOnJamsTr = document.createElement("tr");
            totalUsersOnJamsTr.innerHTML = `<td>Total congestionado</td>`;
            totalUsersOnJamsTr.innerHTML += `<td>${Math.round(
              totalUsers
            )}</td>`;
            totalUsersOnJamsTr.innerHTML += `<td>+ ${Math.round(
              (totalLength - blockedRoadKm) / 1000
            )} km</td>`;
            totalUsersOnJamsTr.innerHTML += `<td>100%</td>`;
            totalUsersOnJamsTr.innerHTML += `<td>-</td>`;
            totalUsersOnJamsTr.innerHTML += `<td>≈ ${Math.round(
              totalOccupancyRate / 1000
            )} km</td>`;
            totalUsersOnJamsTr.classList.add(`body-bg`);
            totalUsersOnJamsTr.style.color = "black";
            usersOnJamsTableBody.append(totalUsersOnJamsTr);
          };

          const now = new Date();
          const minutes = now.getMinutes();
          if (minutes % TIME_SERIES_FETCH_MINUTE_RATE == 0) {
            traffic.jamStats.map((t) => {
              let index = t.jamLevel;
              seriesData[index].shift();
              seriesData[index].push(t.percent);
            });

            categoryData.shift();
            categoryData.push(now.toLocaleTimeString());

            ApexCharts.exec("area-1", "updateOptions", {
              series: [
                { data: seriesData[4] },
                { data: seriesData[3] },
                { data: seriesData[2] },
                { data: seriesData[1] },
                { data: seriesData[0] },
              ],
              xaxis: {
                categories: categoryData,
              },
            });

            sumOfUsers = 0;
            usersOnJams.map((u) => {
              if (u.jamLevel != 5) {
                let level = u.jamLevel;
                let users = Math.round(u.wazersCount);
                usersOnJamsData[level].shift();
                usersOnJamsData[level].push(users);
                sumOfUsers += users;
              }
            });

            maxTotalUsers.shift();
            maxTotalUsers.push(sumOfUsers);

            // Só funcionou assim.
            // Não funcionou usando diretamente o updateOptions.
            // Pode ser por causa dos synchronized charts
            ApexCharts.exec("area-2", "updateOptions", {
              series: [
                { data: usersOnJamsData[4] },
                { data: usersOnJamsData[3] },
                { data: usersOnJamsData[2] },
                { data: usersOnJamsData[1] },
                { data: usersOnJamsData[0] },
              ],
              xaxis: {
                categories: categoryData,
              },
              yaxis: {
                max: Math.max(...maxTotalUsers),
                min: 0,
                tickAmount: 2,
              },
              title: {
                text: `Série temporal - Total de usuários Waze (${
                  TIME_SERIES_MINUTES_MONITORED / 60
                } horas / ${TIME_SERIES_FETCH_MINUTE_RATE} minutos) - Máximo da amostra: ${Math.max(
                  ...maxTotalUsers
                )} usuários`,
              },
            });

            sumOfLengths = 0;

            lengthOfJams.map((t) => {
              if (t.jamLevel != 5 && t.jamLevel != 0) {
                let level = t.jamLevel;
                let length = parseFloat((t.jamLength / 1000).toFixed(2));
                monitoredKmData[level].shift();
                monitoredKmData[level].push(length);
                sumOfLengths += length;
              }
            });

            maxSumOfLengths.shift();
            maxSumOfLengths.push(sumOfLengths.toFixed(2));

            ApexCharts.exec("area-3", "updateOptions", {
              series: [
                { data: monitoredKmData[4] },
                { data: monitoredKmData[3] },
                { data: monitoredKmData[2] },
                { data: monitoredKmData[1] },
              ],
              xaxis: {
                categories: categoryData,
              },
              yaxis: {
                max: Math.round(Math.max(...maxSumOfLengths)) + 1,
                min: 0,
                tickAmount: 2,
                labels: {
                  formatter: function (value) {
                    return `${value} km`;
                  },
                },
              },
              title: {
                text: `Série temporal - Extensão de congestionamento por nível em quilômetros (${
                  TIME_SERIES_MINUTES_MONITORED / 60
                } horas / ${TIME_SERIES_FETCH_MINUTE_RATE} minutos) - Máximo da amostra: ${Math.max(
                  ...maxSumOfLengths
                ).toFixed(2)} km`,
              },
            });
          }

          trafficLength(lengthOfJams);
          trafficUsers(usersOnJams, lengthOfJams);
        });
    }

    plotTrafficView();
    trafficViewInterval = setInterval(
      plotTrafficView,
      TRAFFIC_VIEW_RETRIEVAL_INTERVAL
    );
  } catch {
    alert("Há algum problema com o Waze Traffic View. Reporte ao suporte.");
  }
}

wazeTrafficData();
