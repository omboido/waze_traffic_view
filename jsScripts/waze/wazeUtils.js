// Recebe usersOnJams
class trafficLevels {
  constructor(e) {
    var t, n, r;
    (t = this),
      (n = "jamStatsMap"),
      (r = new Map()),
      n in t
        ? Object.defineProperty(t, n, {
            value: r,
            enumerable: !0,
            configurable: !0,
            writable: !0,
          })
        : (t[n] = r);
    var o = null == e ? void 0 : e.reduce((e, t) => e + t.wazersCount, 0);
    0 === o || void 0 === o
      ? this.jamStatsMap.set(Or.Free, 100)
      : e
          // .filter((e) => e.wazersCount > 0)
          .forEach((e) => {
            this.jamStatsMap.set(
              e.jamLevel,
              Math.round((e.wazersCount / o) * 100)
            );
          });
  }
  get jamStats() {
    return Array.from(this.jamStatsMap.entries()).map((e) => {
      var [t, n] = e;
      return {
        jamLevel: t,
        percent: n,
      };
    });
  }
  get level() {
    var e = ta.find(
      (e) =>
        e.jamLevelsToConsider.reduce((e, t) => {
          var n;
          return (
            e + (null !== (n = this.jamStatsMap.get(t)) && void 0 !== n ? n : 0)
          );
        }, 0) > e.minJamLevelsPercent
    );
    return null == e ? void 0 : e.trafficLevel;
  }
}

const jamTranslate = {
  0: "Fluxo livre",
  1: "Trânsito leve",
  2: "Trânsito moderado",
  3: "Trânsito pesado",
  4: "Trânsito parado",
  5: "Via bloqueada",
};

// fibonacci distances yield natural results
const translateLevel = {
  0: { descricao: "Sem impedimentos", distancia: 34 },
  1: { descricao: "Congestionamento leve", distancia: 21 },
  2: { descricao: "Congestionamento moderado", distancia: 13 },
  3: { descricao: "Congestionamento pesado", distancia: 8 },
  4: { descricao: "Trânsito parado", distancia: 5 },
  5: { descricao: "Via bloqueada", distancia: 0 },
};

function translateRoadType(type) {
  const dict = {
    1: "Via urbana", // Rua
    2: "Via urbana", // Rua principal
    3: "Autoestrada",
    4: "Acesso a rodovia", // Pista
    5: "Trilho",
    6: "Rodovia", // Primária
    7: "Rodovia", // Secundária
    8: "Trilha 4X4",
    14: "Trilha 4X4",
    15: "Travessia de ferry",
    9: "Passarela",
    10: "Pedestre",
    11: "Saída",
    16: "Escadaria",
    17: "Estrada privada",
    18: "Ferrovia",
    19: "Pista de Aterrissagem/Taxiamento",
    20: "Acesso a estacionamento",
    21: "Estrada de serviço",
  };

  return dict[type];
}

function confidenceScore(reportRating, confidence, reliability) {
  var userLevel = reportRating
    ? `<br>Nível do usuário: ${"★".repeat(reportRating).padEnd(6, "☆")}`
    : "";
  var confidence = confidence
    ? `<br>Nível de certeza: ${"★".repeat(confidence).padEnd(10, "☆")}`
    : "";
  var reliability = reliability
    ? `<br>Nível de confiança: ${"★".repeat(reliability).padEnd(10, "☆")}`
    : "";

  return `${userLevel}${confidence}${reliability}`;
}

function delaySecondsToMinutes(delay) {
  var [minutes, seconds] = [Math.trunc(delay / 60), delay % 60];
  seconds >= 31 ? (minutes += 1) : void 0;
  return minutes;
}

function delaySecondsToHoursMinutes(delay) {
  // Convert delay to hours, minutes, and seconds
  const hours = Math.floor(delay / 3600);
  const remainingSeconds = delay % 3600;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  // If seconds are greater than or equal to 30, round up minutes
  if (seconds >= 30) {
    minutes += 1;
  }

  return {
    hours: hours,
    minutes: minutes,
    seconds: seconds,
  };
}

function metersPerSecondToKilometersPerHour(meters, seconds) {
  // Convert meters to kilometers (1 kilometer = 1000 meters)
  const kilometers = meters / 1000;

  // Convert seconds to hours (1 hour = 3600 seconds)
  const hours = seconds / 3600;

  // Calculate speed in kilometers per hour (km/h)
  const speedKmPerHour = kilometers / hours;

  return speedKmPerHour;
}

function zipObjects(obj1, obj2) {
  const result = [];

  // Iterate over a range of jamLevel values from 0 to 5
  for (let level = 0; level <= 5; level++) {
    // Find matching items in obj1 and obj2
    const item1 = obj1.find((item) => item.jamLevel === level);
    const item2 = obj2.find((item) => item.jamLevel === level);

    // If both items are found, add them to the result array
    if (item1 !== undefined && item2 !== undefined) {
      result.push({
        jamLevel: level,
        wazersCount: item1.wazersCount,
        jamLength: item2.jamLength,
      });
    } else if (item1 !== undefined) {
      //If only item1 is found, add it with undefined for item2
      result.push({
        jamLevel: level,
        wazersCount: item1.wazersCount,
        jamLength: null,
      });
    } else if (item2 !== undefined) {
      // If only item2 is found, add it with undefined for item1
      result.push({
        jamLevel: level,
        wazersCount: null,
        jamLength: item2.jamLength,
      });
    }
  }

  return result;
}

const translateType = {
  ACCIDENT: "Acidente",
  JAM: "Congestionamento",
  WEATHERHAZARD: "Problema na via",
  HAZARD: "Problema na via",
  CONSTRUCTION: "Obra na via",
  ROAD_CLOSED: "Via interditada",
  MISC: "Outros",
};

function translateSubtype(subtype) {
  const dict = {
    ACCIDENT_MINOR: "Acidente pequeno",
    ACCIDENT_MAJOR: "Acidente grande",
    JAM_MODERATE_TRAFFIC: "Congestionamento moderado",
    JAM_HEAVY_TRAFFIC: "Congestionamento pesado",
    JAM_STAND_STILL_TRAFFIC: "Trânsito parado",
    JAM_LIGHT_TRAFFIC: "Congestionamento leve",
    HAZARD_ON_ROAD: "Perigo na via",
    HAZARD_ON_SHOULDER: "Perigo no acostamento",
    HAZARD_WEATHER: "Evento climático",
    HAZARD_ON_ROAD_OBJECT: "Objeto na via",
    HAZARD_ON_ROAD_POT_HOLE: "Buraco na via",
    HAZARD_ON_ROAD_ROAD_KILL: "Atropelamento",
    HAZARD_ON_SHOULDER_CAR_STOPPED: "Veículo parado no acostamento",
    HAZARD_ON_SHOULDER_ANIMALS: "Animal no acostamento",
    HAZARD_ON_SHOULDER_MISSING_SIGN: "Sinalização ausente",
    HAZARD_WEATHER_FOG: "Nevoeiro",
    HAZARD_WEATHER_HAIL: "Granizo",
    HAZARD_WEATHER_HEAVY_RAIN: "Chuva forte",
    HAZARD_WEATHER_HEAVY_SNOW: "Neve",
    HAZARD_WEATHER_FLOOD: "Inundação",
    HAZARD_WEATHER_MONSOON: "Vento forte",
    HAZARD_WEATHER_TORNADO: "Tornado",
    HAZARD_WEATHER_HEAT_WAVE: "Onda de calor",
    HAZARD_WEATHER_HURRICANE: "Furacão",
    HAZARD_WEATHER_FREEZING_RAIN: "Chuva congelante",
    HAZARD_ON_ROAD_LANE_CLOSED: "Faixa interditada",
    HAZARD_ON_ROAD_OIL: "Óleo na pista",
    HAZARD_ON_ROAD_ICE: "Gelo na pista",
    HAZARD_ON_ROAD_CONSTRUCTION: "Obra na via",
    HAZARD_ON_ROAD_CAR_STOPPED: "Veículo parado na via",
    HAZARD_ON_ROAD_TRAFFIC_LIGHT_FAULT: "Problema com semáforo",
    ROAD_CLOSED_HAZARD: "Via interditada",
    ROAD_CLOSED_CONSTRUCTION: "Via em obras",
    ROAD_CLOSED_EVENT: "Evento na via",
    NO_SUBTYPE: "Sem subtipo",
  };

  return subtype != "" ? dict[subtype] : "Sem subtipo";
}

function selectIcon({ leadAlert = {}, typeSubtype = null }) {
  if (typeSubtype) {
    leadAlert.type = typeSubtype[0];
    leadAlert.subtype = typeSubtype[1];
  }

  var icon = null;

  if (leadAlert["subType"]) {
    leadAlert["subtype"] = leadAlert["subType"];
  }
  switch (leadAlert["subtype"]) {
    case "ACCIDENT_MAJOR":
      icon = "./img/waze/map-pin-accident-major.svg";
      break;
    case "ACCIDENT_MINOR":
      icon = "./img/waze/map-pin-accident-minor.svg";
      break;
    case "JAM_STAND_STILL_TRAFFIC":
      icon = "./img/waze/map-pin-jam-level-4.svg";
      break;
    case "JAM_HEAVY_TRAFFIC":
      icon = "./img/waze/map-pin-jam-level-3.svg";
      break;
    case "JAM_MODERATE_TRAFFIC":
      icon = "./img/waze/map-pin-jam-level-2.svg";
      break;
    case "JAM_LIGHT_TRAFFIC":
      icon = "./img/waze/map-pin-jam-level-1.svg";
      break;
    case "HAZARD_ON_SHOULDER_ANIMALS":
      icon = "./img/waze/map-pin-animals.svg";
      break;
    case "HAZARD_WEATHER_FLOOD":
      icon = "./img/waze/map-pin-flood.svg";
      break;
    case "HAZARD_WEATHER_FOG":
      icon = "./img/waze/map-pin-fog.svg";
      break;
    case "HAZARD_WEATHER_HAIL":
      icon = "./img/waze/map-pin-hail.svg";
      break;
    case "HAZARD_ON_SHOULDER_MISSING_SIGN":
      icon = "./img/waze/map-pin-missing-sign.svg";
      break;
    case "HAZARD_ON_ROAD_OBJECT":
      icon = "./img/waze/map-pin-object-on-road.svg";
      break;
    case "HAZARD_ON_ROAD_POT_HOLE":
      icon = "./img/waze/map-pin-pothole.svg";
      break;
    case "HAZARD_ON_ROAD_ROAD_KILL":
      icon = "./img/waze/map-pin-roadkill.svg";
      break;
    case "HAZARD_ON_ROAD_CONSTRUCTION":
      icon = "./img/waze/map-pin-construction.svg";
      break;
    case "HAZARD_ON_SHOULDER_CAR_STOPPED":
    case "HAZARD_ON_ROAD_CAR_STOPPED":
      icon = "./img/waze/map-pin-vehicle-stopped.svg";
      break;
    case "HAZARD_ON_ROAD_TRAFFIC_LIGHT_FAULT":
      icon = "./img/waze/map-pin-broken-light.svg";
      break;
    case undefined:
    case "":
    case "NO_SUBTYPE":
    default:
      switch (leadAlert["type"]) {
        case "ACCIDENT":
          icon = "./img/waze/map-pin-accident-minor.svg";
          break;
        case "JAM":
          icon = "./img/waze/map-pin-jam-level-1.svg";
          break;
        case "CONSTRUCTION":
          icon = "./img/waze/map-pin-construction.svg";
          break;
        case "ROAD_CLOSED":
          icon = "./img/waze/map-pin-closure.svg";
          break;
        case "WEATHERHAZARD":
        case "HAZARD":
        case "MISC":
        default:
          icon = "./img/waze/map-pin-hazard.svg";
      }
  }
  return icon;
}

export {
  trafficLevels,
  translateType,
  translateSubtype,
  selectIcon,
  confidenceScore,
  delaySecondsToMinutes,
  delaySecondsToHoursMinutes,
  metersPerSecondToKilometersPerHour,
  jamTranslate,
  translateLevel,
  translateRoadType,
  zipObjects,
};
