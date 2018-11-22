/**
 * 配置类。用于配置isDebug，appId等
 */


const APP_VERSION = "2.0.0";
const APP_VERSION_BUILD = "20181121234157";

const REQUEST_HOST = {
    test: "http://maps.testing.amap.com",
    pre: "http://maps.testing.amap.com",
    public: "https://m5.amap.com",
};

const REQUEST_PATH = {
    address: "/ws/shield/maps/mapapi/navigation/address", //常去地址
    newbus: "/ws/mapapi/poi/newbus", //路线详情
    reversecode: "/ws/mapapi/geo/reversecode", //逆地理
    tipslite: "/ws/mapapi/poi/tipslite", //搜索提示
    infolite: "/ws/mapapi/poi/infolite", // poi搜索
    lines: "/ws/shield/maps/mapapi/realtimebus/search/lines", //公交线路
    linestation: "/ws/mapapi/realtimebus/linestation", //实时公交
    busext: "/ws/transfer/auth/navigation/bus-ext", //通勤线路
    roadupdate: "/ws/shield/navigation/bus/roadUpdate", //路况
    nearbylines: "/ws/shield/maps/mapapi/realtimebus/search/nearby-lines", //周边路线
};

export default class Config {
    //TODO: 发版时需要修改此值
  static isDebug = true;
    //发版时需要修改此值为public
  static HTTP_ENVIRONMENT = "test"; // test, public, pre

  static  getRequestHost() {
      return REQUEST_HOST[Config.HTTP_ENVIRONMENT];
  }

  static getRequestUrl(requestName) {
      let host = Config.getRequestHost();
      let path = REQUEST_PATH[requestName];
      let url = host + path;

      // console.log("getRequestUrl :", url);
      return url;
  }

  static getVersionString() {
      if (Config.isDebug) {
          return "Ver: " + APP_VERSION + "." + APP_VERSION_BUILD;
      }
      else {
          return null;
      }
  }

}