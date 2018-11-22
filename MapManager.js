/**
 * 地图控制工具类， 控制marker和polyline
 *
 <!-- 地图 -->
 <map
 class="map"
 id="userMap"
 polyline="{{polyline}}"
 markers="{{markers}}"
 onRegionChange="regionchange"
 include-points="{{includePoints}}"
 show-location="{{showLocation}}"
 longitude ="{{longitude}}"
 latitude="{{latitude}}"
 scale="{{scale}}"
 >
 </map>
 *
 */
import Utils from "./Utils";

const app = getApp();

const ICON_STOP = "/images/marker_stop.png"; //普通站点
const ICON_STOP_SELECTED = "/images/marker_stop_selected.png"; // 选中站点
const ICON_STOP_SUBWAY = "/images/marker_subway.png"; // 地铁
const ICON_STOP_EXCHANGE = "/images/marker_exchange.png"; // 换乘
const ICON_STOP_ROUOTE = "/images/marker_routestop.png"; // 线路中的站点
const ICON_DEPART = "/images/marker_depart.png"; // 出发站
const ICON_ARRIVE = "/images/marker_arrive.png"; //到达站
const ICON_START = "/images/marker_start.png"; // 路线起点
const ICON_END = "/images/marker_end.png"; //路线终点
const LINE_ICON_START = "/images/line_marker_start.png"; //路线终点
const LINE_ICON_END = "/images/line_marker_end.png"; //路线终点
const ICON_BUS = "/images/marker_bus.png";
const ICON_HOME = "/images/marker_home.png";
const ICON_COMPANY = "/images/marker_company.png";

const COLOR_ROUTE_NORMAL = "#0091ff";  // 公交线路默认颜色
const COLOR_ROUTE_SUBWAY = "#0091ff";  // 地铁颜色
const COLOR_ROUTE_WALK = "#34BAF8";  // 步行颜色
const POLYLINE_WIDTH_BUS = 10;  // 线宽
const POLYLINE_WIDTH_WALK = 6;  // 线宽

// MAP_LEVEL_10_10kM = (int)MapZoomLevel_10KM,
// MAP_LEVEL_11_5kM = (int)MapZoomLevel_5KM,
// MAP_LEVEL_12_2kM = (int)MapZoomLevel_2KM,
// MAP_LEVEL_13_1kM = (int)MapZoomLevel_1KM,
// MAP_LEVEL_14_500M = (int)MapZoomLevel_500Meters,
// MAP_LEVEL_15_200M = (int)MapZoomLevel_200Meters,
// MAP_LEVEL_16_100M = (int)MapZoomLevel_100Meters,
// MAP_LEVEL_17_50M = (int)MapZoomLevel_50Meters,
// MAP_LEVEL_18_25M = (int)MapZoomLevel_25Meters,
// MAP_LEVEL_19_10M = (int)MapZoomLevel_10Meters,
// MAP_LEVEL_20_5M = (int)MapZoomLevel_5Meters,
// 附近站站名在50米比例尺展示
// 附近站icon在1km比例尺下展示
// 途径站icon及站名在200米比例尺开始展示
// 线路详情或方案详情的 始发站，上车站，换乘站，下车站，目的地icon，线路轨迹始终展示

const MAP_LEVEL_10_10kM = 10;
const MAP_LEVEL_11_5kM = 11;
const MAP_LEVEL_12_2kM = 12;
const MAP_LEVEL_13_1kM = 13;
const MAP_LEVEL_14_500M = 14;
const MAP_LEVEL_15_200M = 15;
const MAP_LEVEL_16_100M = 16;
const MAP_LEVEL_17_50M = 17;
const MAP_LEVEL_18_25M = 18;
const MAP_LEVEL_19_10M = 19;
const MAP_LEVEL_20_5M = 20;

const SHOW_SCALE_BUSSTOP = MAP_LEVEL_13_1kM;
const SHOW_SCALE_BUSSTOP_LABEL = MAP_LEVEL_17_50M;
const SHOW_SCALE_BUS = MAP_LEVEL_11_5kM;
const SHOW_SCALE_ROUTESTOP = MAP_LEVEL_15_200M;


const SHOW_SCALE_MAXSTOP = 3;

// 小程序里markerId是数字，不能添加字符串区分
const MARKERID_PREFIX_STOP = "stop_";  // 公交站点markerId前缀，适用于addBusstopsMarker接口添加的marker
const MARKERID_PREFIX_BUS = "bus_";  // 公交车markerId前缀

// 选中站点图片样式
const STYLE_SELECTED_STOP_ICON = {
    width: app.px(60),
    height: app.px(72),
    anchorX: 0.5,
    anchorY: 0.8,  // 这里不能是1， 因为选中的图片并不是最底部作为经纬度点
};

const MARKER_LEVEL = {
    normal: 1,
    select: 10
};

// 目前文字颜色只支持rgb, 背景色支持rgba
const STYLE_MARKER = {
    stationTextColor: '#547eff',
    stationBgColor: '#ffffff',
    selectStationTextColor: '#ffffff',
    selectStationBgColor: '#547eff',

    calloutBgColor: '#00000080',
    calloutTextColor: '#ffffff',
    calloutTextGreyColor: '#212121',
    busCalloutBgColor: '#ffffff',
    busCalloutTitleColor: '#212121',
    busCalloutTitleSize: 12,
    busCalloutSubtitleColor: '#2bbb9d',
    busCalloutSubtitleInvalidColor: '#fb8d35',
    busCalloutSubtitleSize: 13,

    routeStationColor: '#000000',
    routeStationLineColor: '#ffffff',

    markerPadding: {
        paddingTop: app.px(3),
        paddingLeft: app.px(10),
        paddingBottom: app.px(3),
        paddingRight: app.px(10)
    },
    unselectMarkerPadding: {
        paddingTop: app.px(3),
        paddingLeft: app.px(7),
        paddingBottom: app.px(3),
        paddingRight: app.px(7)
    },
    stationCalloutPadding: {
        paddingTop: app.px(3),
        paddingLeft: app.px(14),
        paddingBottom: app.px(3),
        paddingRight: app.px(14)
    },

    calloutTitilePadding: {
        paddingTop: 9,
        paddingLeft: 9,
        paddingBottom: 2,
        paddingRight: 9
    },
    calloutSubtitilePadding: {
        paddingTop: 2,
        paddingLeft: 9,
        paddingBottom: 9,
        paddingRight: 9
    },
    calloutBusStationsTitlePadding: {
        paddingTop: 0,
        paddingLeft: 0,
        paddingBottom: 2,
        paddingRight: 0
    },
    calloutBusStationsSubTitlePadding: {
        paddingTop: 2,
        paddingLeft: 4,
        paddingBottom: 2,
        paddingRight: 4
    }
};

export default class MapManager {
    constructor(delegate) {

        // 原始数据
        this._stations = null;

        // 图面元素
        this._currentMapScale = 0;
        this._selectedStopIndex = -1;
        this._nearestStopIndex = -1;
        this._delegate = delegate;
        this._stops = [];
        this._buses = [];

        this._busRoute = {
            // stops: []  点站marker
            //   startEndMarker: [], 起终点marker
            // polyline: {}
        };
        this._routeStations = null; // 路线站点原始数据
        this._nearestRouteStopIndex = -1; // 路线站点高亮索引


        //通勤路线
        this._travel = {
            // stops: []  换乘点站
            // polylines: [polyline]
        }

        this._needMapRegionUpdate = true;
        this._prevIncludePoints = null;
        this._isAfterFirstRegionChange = false; // 第一次regionchange的值是默认值，需要抛弃。

        //   let systemInfo = my.getSystemInfoSync();
        // console.log("systemInfo : ", systemInfo);
    }

// regionchange回调中需要记录一下地图状态，用于进行全览设置
    mapRegionDidChange(e) {
        // console.log("mapRegionDidChange:" , e, this._needMapRegionUpdate, this._isAfterFirstRegionChange);
        if (this._isAfterFirstRegionChange) {
            this._scale = e.scale;
            this._latitude = e.latitude;
            this._longitude = e.longitude;

            this._needMapRegionUpdate = false;
        }
        this._isAfterFirstRegionChange = true;
    }

    /**
     * 添加站点marker
     * includePoints 缩放地图可见坐标点
     {
      "bus_alias": "A",
      "businfo_alias": "",
      "businfo_angles": "182.485426",
      "businfo_expect_dates": ";;;;;;;;;;;;;;;;",
      "businfo_line_alias": "",
      "businfo_line_keys": "15路;24路;36路;。。。",
      "businfo_line_names": "15路(汽车北站--植物园);24路(杭州高级中学--蒋村公交中心站);。。。",
      "businfo_line_types": "6;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1",
      "businfo_lineids": "900000095869;330100013224;330100013275...
      "businfo_mesh": "H51F021001",
      "businfo_realbus": "0;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;0",
      "businfo_road_id": "650147",
      "businfo_station_status": "0;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1",
      "businfo_stationids": "900000095869015;330100013224014;330100013275013。。。"
      "businfo_ui_colors": ";;;;;;;;;;;;;;;;",
      "name": "东方通信大厦",
      "new_type": "150700",
      "poiid": "BS10361405",
      "poiid2": "BV10184051",
      "x": "120.127144",
      "y": "30.276667",
      "distance": 153.841
    },

     nearestIndex = -1 时取第一个为最近。
     */
    addBusstopsMarker(stopArray, includePoints, nearestIndex = -1) {

        console.log(`add bus stops : ${stopArray.length}`);
        let stops = [];
        let count = stopArray.length;

        this._selectedStopIndex = nearestIndex;
        if (this._selectedStopIndex < 0 || this._selectedStopIndex >= count) {
            this._selectedStopIndex = 0;
        }

        this._nearestStopIndex = this._selectedStopIndex;

        for (let i = 0; i < count; ++i) {
            let stop = stopArray[i];
            let location = {
                latitude: stop.y,
                longitude: stop.x
            };

            // 由于只有公交站marker响应点击事件，所以这里只设置公交站marker的id。
            let markerprops = this.getNormalMarkerProps(stop.name);
            if(i == this._selectedStopIndex) {
                markerprops = this.getSelectMarkerProps(stop.name);
            }
            let oneMarker = {
                id: i,
                hideOnScale: SHOW_SCALE_BUSSTOP,
                latitude: location.latitude,
                longitude: location.longitude,
                ...markerprops
            };

            stops.push(oneMarker);

        } // end for

        //最近站点
        if(stops.length > 0) {

            let nearestStop = stops[this._nearestStopIndex];
            let nearestSupplementary = this.getMarkerCalloutProps("最近", SHOW_SCALE_BUSSTOP);
            nearestStop.supplementaries.push(nearestSupplementary);
        }

        this._stations = stopArray;
        this._stops = stops;

        this.addElementsToMap(includePoints);

    }

    /**
     * 清除站点marker
     */
    clearBusstopsMarker(){
        this._stops = [];
        this.addElementsToMap();
    }

    getStopIndexByMarkerId(markerId) {
        // let idx = -1;
        // if(markerId.length > MARKERID_PREFIX_STOP.length) {
        //   let idxString = markerId.substring(MARKERID_PREFIX_STOP.length);
        //   idx = parseInt(idxString, 10);
        // }
        // return idx;
        return markerId;
    }

    /**
     * 更新选中站点样式，参数为 markerId
     */
    updateSelectedStop(markerId) {
        // console.log('updateSelectedStop - markerId :' + markerId);
        let idx = this.getStopIndexByMarkerId(markerId);

        if(idx === undefined || idx < 0 || idx >= this._stops.length) {
            console.log('updateSelectedStop - error : invalid index :' + idx);
            return;
        }

        console.log('updateSelectedStop - idx :' + idx + ", prev: " + this._selectedStopIndex);

        let prevSelectStop = this._selectedStopIndex >= 0 ? this._stops[this._selectedStopIndex] : null;
        let selectStop = this._stops[idx];

        if (prevSelectStop) {
            this._stops[this._selectedStopIndex] = {
                id: prevSelectStop.id,
                hideOnScale: prevSelectStop.hideOnScale,
                latitude: prevSelectStop.latitude,
                longitude: prevSelectStop.longitude,
                ...this.getNormalMarkerProps(this._stations[this._selectedStopIndex].name)
            }
        }

        if (selectStop) {
            this._stops[idx] = {
                id: selectStop.id,
                hideOnScale: selectStop.hideOnScale,
                latitude: selectStop.latitude,
                longitude: selectStop.longitude,
                ...this.getSelectMarkerProps(this._stations[idx].name)
            }
        }

        if (this._selectedStopIndex == this._nearestStopIndex || idx == this._nearestStopIndex) {
            let nearestSupplementary = this.getMarkerCalloutProps("最近", SHOW_SCALE_BUSSTOP);
            this._stops[this._nearestStopIndex].supplementaries.push(nearestSupplementary);
        }

        // console.log(`updateSelectedStop preselected : ${JSON.stringify(this._stops[this._selectedStopIndex])}`);
        // console.log(`updateSelectedStop selected : ${JSON.stringify(this._stops[idx])}`);

        this._selectedStopIndex = idx;

        if (prevSelectStop || selectStop) {
            this.addElementsToMap();
        }
    }


    getSelectMarkerProps(stopName) {
        return {
            iconPath: ICON_STOP_SELECTED,
            markerLevel: MARKER_LEVEL.select,
            ...STYLE_SELECTED_STOP_ICON,
            supplementaries: [{
                direction: 2,
                hideOnScale: SHOW_SCALE_BUSSTOP_LABEL,
                backgroundColor: STYLE_MARKER.selectStationBgColor,
                backgroundRadius: app.px(4),
                showBottomTriangle: false,
                shadowSize: app.px(2),
                shadowColor: '#00000033',
                offsetY: app.px(-6),
                items: [{
                    contents: [
                        {
                            size: app.px(28),
                            bold: true,
                            color: STYLE_MARKER.selectStationTextColor,
                            text: this.translateBuslineNameToMarkerContent(stopName),
                        }
                    ],
                    textAlignment: 1,
                    ...STYLE_MARKER.markerPadding
                }]
            }]
        }
    }

    getNormalMarkerProps(stopName) {
        return {
            iconPath: ICON_STOP,
            markerLevel: MARKER_LEVEL.normal,
            width: app.px(44),
            height: app.px(44),
            anchorX: 0.5,
            anchorY: 1,
            supplementaries: [{
                direction: 2,
                hideOnScale: SHOW_SCALE_BUSSTOP_LABEL,
                backgroundColor: STYLE_MARKER.stationBgColor,
                backgroundRadius: app.px(4),
                showBottomTriangle: false,
                shadowSize: app.px(2),
                shadowColor: '#00000033',
                offsetY: app.px(-4),
                items: [{
                    contents: [
                        {
                            size: app.px(26),
                            bold: false,
                            color: STYLE_MARKER.stationTextColor,
                            text: this.translateBuslineNameToMarkerContent(stopName),
                        }
                    ],
                    ...STYLE_MARKER.unselectMarkerPadding
                }]
            }]
        }
    }

// 获取marker顶部黑色气泡样式
    getMarkerCalloutProps(text, showScale = 0) {
        return {
            direction: 0,
            hideOnScale: showScale,
            backgroundColor: STYLE_MARKER.calloutBgColor,
            // backgroundRadius: 18,
            // 为了兼容安卓，因此将弧度改成一个较大值
            backgroundRadius: 36,
            showBottomTriangle: true,
            bottomTriangleWidth: app.px(16),
            bottomTriangleHeight: app.px(8),
            offsetY: 4,
            items: [{
                contents: [
                    {
                        size: 12,
                        color: STYLE_MARKER.calloutTextColor,
                        text: text
                    }
                ],
                ...STYLE_MARKER.stationCalloutPadding
            }]
        }
    }

    /********公交线路********/
    /**
     * 添加公交marker，数组。
     * busRotateArray 公交车方向数组，数量应该和busArray一样。
     * lineName 对应路线名称.
     * includePoints 缩放地图可见坐标点
     url: mapapi/realtimebus/linestation
     */
    addBusMarker(busArray, busRotateArray, lineName, includePoints, params = {}) {
        console.log(`add bus : ${JSON.stringify(busArray)}, busline: ${lineName}`);

        let buses = [];
        let count = busArray.length;

        for(let i = 0; i < count; ++i) {
            let bus = busArray[i];
            let oneMarker = {};
            oneMarker.id = -1;
            // oneMarker.width = 30;
            oneMarker.width = 35;
            // oneMarker.height = 52;
            oneMarker.height = 65;
            oneMarker.latitude = bus.y;
            oneMarker.longitude = bus.x;
            oneMarker.anchorX = 0.5;
            oneMarker.anchorY = 0.6;
            oneMarker.iconPath = ICON_BUS;
            oneMarker.hideOnScale = SHOW_SCALE_BUS;
            oneMarker.markerLevel = count - i;

            if (busRotateArray && i < busRotateArray.length) {
                oneMarker.rotate = busRotateArray[i]
            }

            // 暂时只有第一个加气泡
            !params.isCalloutHidden && !i && (oneMarker.supplementaries = [this.generateBusCalloutProps(bus, lineName)]);
// console.log("addBusMarker-","   -- ", (new Date()).getTime() );
            buses.push(oneMarker);

        } // end for

        this._buses = buses;
        // console.log(`add buses : ${JSON.stringify(buses)}`);
        this.addElementsToMap(includePoints);
    }

    /**
     * 清除公交marker
     */
    clearBusMarker() {
        this._buses = [];
        this.addElementsToMap();
    }

    /**
     * 添加公交线路，包含公交路线、站点marker、起终点marker
     * trafficData 路况数据（暂时没有使用）
     * includePoints 缩放地图可见坐标点
     * nearestStationIndex 最近站点索引，如果传了则高亮显示最近站点, -1 为不显示
     url: ws/mapapi/poi/newbus
     */
    addBusRoute(routeData, trafficData, includePoints, nearestStationIndex) {

        if(!routeData || !routeData.id) {
            console.log("add bus route error : invalid route data");
            return;
        }

        // console.log("add bus route includePoints :" + JSON.stringify(includePoints) + ", index: " + nearestStationIndex);

        // polyline
        let polyline = {};
        let coors = this.pointsFromXAndY(routeData.xs, routeData.ys);
        if (coors.length > 0) {
            polyline.points = coors;
            polyline.color = COLOR_ROUTE_NORMAL;
            polyline.width = POLYLINE_WIDTH_BUS;
            // polyline.iconPath = ""

            if (trafficData) {
                polyline.multiPolyline = this.generateMultiPolyline();
            }
        }

        // markers
        let stations = routeData.stations;
        let routeStops = [];
        let startEnd = [];
        for(let i = 0; i < stations.length; ++i) {

            let station = stations[i];
            let location = this.coordinateFromString(station.xy_coords, ';');
            let markerprops = this.getRouteMarkerProps(station.name);
            if (nearestStationIndex === i) {
                markerprops = this.getRouteNearestMarkerProps(station.name);
            }

            let oneMarker = {
                id: -1,
                hideOnScale: SHOW_SCALE_ROUTESTOP,
                latitude: location.latitude,
                longitude: location.longitude,
                ...markerprops
            };

            routeStops.push(oneMarker);

            // 添加起终点
            if(i == 0 || i == stations.length - 1) {
                let xStop = {};
                xStop.id = -1;
                xStop.latitude = location.latitude;
                xStop.longitude = location.longitude;
                xStop.width = 27;
                xStop.height = 39;
                xStop.anchorX = 0.5;
                xStop.anchorY = 0.83;
                xStop.iconPath = i == 0 ? LINE_ICON_START : LINE_ICON_END;
                startEnd.push(xStop);
            }
        }

        //
        let showPoints = this.coordinateFromBounds(routeData.bounds);
        if (includePoints) {
            showPoints = includePoints;
        }
        console.log(`add bus route showPoints: ${JSON.stringify(showPoints)}`);
        // console.log(`add markers : ${JSON.stringify(routeStops)}`);

        this._busRoute.startEndMarker = startEnd;
        this._busRoute.stops = routeStops;
        this._busRoute.polyline = polyline;

        this._routeStations = stations;
        this._nearestRouteStopIndex = nearestStationIndex; // 路线站点高亮索引

        this.addElementsToMap(showPoints);
    }

    getRouteMarkerProps(stopName) {
        return {
            iconPath: ICON_STOP_ROUOTE,
            width: 13,
            height: 13,
            anchorX: 0.5,
            anchorY: 0.5,
            supplementaries: [this.getRouteStopSupplementaryProps(stopName)]
        }
    }

    getRouteNearestMarkerProps(stopName) {
        return {
            iconPath: ICON_STOP_SELECTED,
            hideOnScale: 0,
            ...STYLE_SELECTED_STOP_ICON,
            supplementaries: [this.getRouteStopSupplementaryProps(stopName, {hideScale: 0, bold: true})]
        }
    }

    updateBusRouteNearestStation(nearestStationIndex) {
        if (!this._busRoute.stops) {
            return;
        }

        if (nearestStationIndex == this._nearestRouteStopIndex) {
            return;
        }

        let length = this._busRoute.stops.length;
        if (nearestStationIndex >=0 && nearestStationIndex < length) {
            let prevStation = this._routeStations[this._nearestRouteStopIndex];
            let curStation = this._routeStations[nearestStationIndex];

            let prevLocation = this.coordinateFromString(prevStation.xy_coords, ';');

            let prevMarker = {
                id: -1,
                hideOnScale: SHOW_SCALE_ROUTESTOP,
                latitude: prevLocation.latitude,
                longitude: prevLocation.longitude,
                ...this.getRouteMarkerProps(prevStation.name),
            };

            let curLocation = this.coordinateFromString(curStation.xy_coords, ';');

            let curMarker = {
                id: -1,
                hideOnScale: SHOW_SCALE_ROUTESTOP,
                latitude: curLocation.latitude,
                longitude: curLocation.longitude,
                ...this.getRouteNearestMarkerProps(curStation.name),
            };

            this._busRoute.stops.splice(this._nearestRouteStopIndex, 1, prevMarker);
            this._busRoute.stops.splice(nearestStationIndex, 1, curMarker);

            this._nearestRouteStopIndex = nearestStationIndex;

            this.addElementsToMap();
        } //end if
    }

    /**
     * 清除公交线路
     */
    clearBusRoute() {
        this._busRoute.stops = [];
        this._busRoute.startEndMarker = [];
        this._busRoute.polyline = null;

        this._routeStations = null;
        this._nearestRouteStopIndex = -1;

        this.addElementsToMap();
    }

    /**
     * 添加通勤线路，包含分段路线、换乘marker, 上车站、终点站
     * startInfo {latitude, longitude, name} // 为我的位置
     * endInfo： {latitude, longitude, name, type}
     type: 0, // 0 home，1 company 2 recommend
     * firstBusRoute 第一段为公交路线时的补充路线数据。
     * includePoints 缩放地图可见坐标点
     */
    addTravelRoute(transitData, startInfo, endInfo, firstBusRoute, includePoints) {
        if (!transitData) {
            console.log("addTravelRoute error : invalid transit data");
            return;
        }
        let polylines = [];
        let markers = [];

        let segments = transitData.segmentlist || [];
        for(let i = 0; i < segments.length; ++i) {
            let oneSeg = segments[i];
            let walkingPolyline = this.generatePolylineWithWalking(oneSeg.walk);
            if(walkingPolyline) {
                // console.log("addTravelRoute walkingPolyline :" + JSON.stringify(walkingPolyline));
                polylines.push(walkingPolyline);
            }
            //busline
            let busPolyline = this.generatePolylineWithBusline(oneSeg);
            if (busPolyline) {
                // console.log("addTravelRoute busPolyline :" + JSON.stringify(busPolyline));
                polylines.push(busPolyline);

                let isFirst = i == 0;
                let isLast = i == segments.length - 1;
                let stopMarkers = this.generateTravelStopMarker(oneSeg, isFirst, isLast, busPolyline.points) || [];
                if (stopMarkers.length >= 2) {
                    markers = markers.concat(stopMarkers);
                }
            } // enf id busPolyline

        } // end for

        // 修改最后一个站点
        if (markers && markers.length > 2) {

            let arriveMarker = markers[markers.length - 1];
            // 终点和最终站距离小于 5 米，则不展示下站站marker。
            let distance = Utils.getDistance(arriveMarker.latitude, arriveMarker.longitude, endInfo.latitude, endInfo.longitude)
            if (distance < 5) {
                markers.pop();
            }
        }

        // end walk
        let endWalkingPolyline = this.generatePolylineWithWalking(transitData.endwalk);
        if (endWalkingPolyline) {
            // console.log("addTravelRoute endWalkingPolyline :" + JSON.stringify(endWalkingPolyline));
            polylines.push(endWalkingPolyline);
        }

        //firstBusRoute
        let firstBusPolyline = null;
        if (firstBusRoute && firstBusRoute.segList && firstBusRoute.segList.length > 0) {

            // console.log("firstBusRoute :" + JSON.stringify(firstBusRoute.segList[0]));
            firstBusPolyline = this.generatePolylineWithSegment(firstBusRoute.segList[0])

            if(firstBusPolyline) {
                // console.log("firstBusPolyline :" + JSON.stringify(firstBusPolyline));
                polylines.push(firstBusPolyline);

                let startLocation = firstBusPolyline.points[0];
                let startMarker = {
                    id: -1,
                    latitude: startLocation.latitude,
                    longitude: startLocation.longitude,
                    width: 31,
                    height: 40,
                    anchorX: 0.5,
                    anchorY: 1,
                    iconPath: ICON_START,
                };
                markers.push(startMarker);
            }
        }

        // add end
        let arrivalText = this.getTravelArraivalTextWithDuration(transitData.expensetime);

        let markerprops = this.getTravelEndMarkerProps(endInfo, arrivalText);

        let endMarker = {
            id: -1,
            latitude: endInfo.latitude,
            longitude: endInfo.longitude,
            ...markerprops
        };

        markers.push(endMarker);

        let showPoints = [
            {
                latitude: startInfo.latitude,
                longitude: startInfo.longitude
            },
            {
                latitude: endInfo.latitude,
                longitude: endInfo.longitude
            }
        ];

        if (includePoints) {
            showPoints = includePoints;
        }

        this._travel.stops = markers;
        this._travel.polylines = polylines;

        // console.log(`add polyline : polyline : ${JSON.stringify(polylines)}, include: ${JSON.stringify(showPoints)}`);
        // console.log(`add markers : ${JSON.stringify(markers)}`);

        this.addElementsToMap(showPoints);
    }

    /**
     * 清除通勤路线
     */
    clearTravelRoute() {
        this._travel.stops = [];
        this._travel.polylines = [];

        this.addElementsToMap()
    }

    /**
     * 地图缩放级别变化时，执行此方法用于更新图面上元素状态。（暂时没有使用）
     */
    updateMapItemForZoomLevel(scale) {
        this._currentMapScale = scale;
    }

    /**
     * 获取通勤线路终点marker信息。
     */
    getTravelEndMarkerProps(endInfo, calloutText) {
        if (!endInfo) {
            return {};
        }

        let iconPath = this.getTravelEndIconWithType(endInfo.type);
        let text = this.getTravelEndNameWithType(endInfo.type);
        let arrivalLabel = this.getTravelEndSupplementaryProps(text);
        let arrivalCallout = this.getMarkerCalloutProps(calloutText);

        return {
            anchorX: 0.5,
            anchorY: 1,
            width: 27,
            height: 33,
            iconPath: iconPath,
            supplementaries: [
                arrivalLabel,
                arrivalCallout,
            ]
        }

    }

    /**
     * 获取通勤线路站点信息label样式。
     */
    getTravelMarkerSupplementaryProps(stopName, lineName, lineColor, hideOnScale = SHOW_SCALE_MAXSTOP) {

        return {
            direction: 3,
            hideOnScale: hideOnScale,
            offsetX: 6,
            offsetY: 0,
            items: [{
                contents: [
                    {
                        size: 13,
                        color: STYLE_MARKER.routeStationColor,
                        text: stopName,
                        bold: true
                    }
                ],
                ...STYLE_MARKER.calloutBusStationsTitlePadding
            },
                {
                    contents: [
                        {
                            size: 10,
                            color: STYLE_MARKER.routeStationLineColor,
                            text: lineName
                        }
                    ],
                    backgroundColor: lineColor,
                    backgroundRadius: 7,
                    ...STYLE_MARKER.calloutBusStationsSubTitlePadding
                }]
        }
    }

    getTravelEndSupplementaryProps(text) {
        return {
            direction: 2,
            offsetY: 0,
            items: [{
                contents: [
                    {
                        size: 12,
                        color: STYLE_MARKER.routeStationColor,
                        text: text,
                        bold: true
                    }
                ],
                ...STYLE_MARKER.markerPadding
            }]
        }
    }

    resetMap() {
        this._stations = null;
        this._selectedStopIndex = -1;
        this._stops = [];
        this._buses = [];

        this._busRoute = {
            stops: [],
            polyline: null,
        };

        //通勤路线
        this._travel = {
            stops: [],
            polylines: [],
        };
        this.addElementsToMap();
    }

    /**
     * 获取起终点之间一个随机点
     * @param startPoint
     * @param endPoint
     * @returns {{longitude: number, latitude: number}}
     * @private
     */
    _getRandomPoints(startPoint = {}, endPoint = {}){

        let random = Math.random();
        let randomPointLng = parseFloat(startPoint.longitude) + random * (parseFloat(endPoint.longitude) - parseFloat(startPoint.longitude));
        let randomPointLat = parseFloat(startPoint.latitude) + random * (parseFloat(endPoint.latitude) - parseFloat(startPoint.latitude));
        let randomPoint = {longitude: randomPointLng, latitude: randomPointLat};

        return randomPoint;
    }

    /**
     * 将地图按照之前的点重置到视野内
     */
    resetMapRegion(){
        let _prevIncludePoints = this._prevIncludePoints || [];
        let mapData = {};

        let pointsLen = _prevIncludePoints.length;

        if(pointsLen > 1){
            let startPoint = _prevIncludePoints[0];
            let endPoint = _prevIncludePoints[pointsLen - 1];

            let randomPoint = this._getRandomPoints(startPoint, endPoint);

            mapData.includePoints = [startPoint, endPoint, randomPoint];

            this._delegate.setData(mapData);
        }

    }

    //helpers
    addElementsToMap(includePoints) {
        let finalStops = this._stops;

        if (this._travel && this._travel.stops && this._travel.stops.length > 0) {
            finalStops = finalStops.concat(this._travel.stops);
        }

        if (this._busRoute && this._busRoute.stops && this._busRoute.stops.length > 0) {
            finalStops = finalStops.concat(this._busRoute.stops);

            if (this._busRoute.startEndMarker && this._busRoute.startEndMarker.length > 0) {
                finalStops = finalStops.concat(this._busRoute.startEndMarker);
            }
        }

        if (this._buses && this._buses.length > 0) {
            finalStops = finalStops.concat(this._buses);
        }

        let finalPolylines = [];

        if (this._busRoute && this._busRoute.polyline) {
            finalPolylines.push(this._busRoute.polyline);
        }

        if (this._travel && this._travel.polylines && this._travel.polylines.length > 0) {
            finalPolylines = finalPolylines.concat(this._travel.polylines);
        }

        let mapData = {
            polyline: finalPolylines,
            markers: finalStops,
        };

        // console.log("addElementsToMap 1 :", this._needMapRegionUpdate, includePoints, this._prevIncludePoints);

        if (this._needMapRegionUpdate && !includePoints) {
            includePoints = this._prevIncludePoints;
        }

        if (includePoints) {
            mapData.includePoints = includePoints;
            this._prevIncludePoints = includePoints;

            // 设置region信息需要更新，有可能region回调没执行，导致后续设置的经纬度还是旧的。
            this._needMapRegionUpdate = true;
        }
        else {
            mapData.includePoints = [];
            mapData.scale = this._scale;
            mapData.latitude = this._latitude;
            mapData.longitude = this._longitude;
        }

        // console.log("addElementsToMap 2 :", this._needMapRegionUpdate, mapData.scale, mapData.latitude, mapData.longitude, mapData.includePoints);
        // console.log("addElementsToMap includePoints:" + JSON.stringify(includePoints));

        // console.log("addElementsToMap :" + JSON.stringify(mapData));
          console.log("addElementsToMap :", mapData.polyline.length, mapData.markers.length, mapData.includePoints);
        this._delegate.setData(mapData);
    }

    coordinateFromString(coorStr, separator=',') {
        if(coorStr.length == 0) {
            return null;
        }

        let coords = coorStr.split(separator) || [];
        if (coords.length == 2) {
            return {
                latitude: coords[1],
                longitude: coords[0]
            }
        }

        return null;
    }

    /**
     * 解析经纬度字符串到数组 (longitude1,latitude1,longitude2,latitude2,...)
     */
    pointsFromString(coorStr = '') {
        if (coorStr.length == 0) {
            return null;
        }

        // console.log("coorStr : " + JSON.stringify(coorStr));
        let coords = coorStr.split(',') || [];
        // console.log("coords : " + JSON.stringify(coords));

        let points = [];
        for (let i = 0; i < coords.length - 1; i=i+2) {
            let onePoint = {
                latitude: coords[i + 1],
                longitude: coords[i]
            };
            points.push(onePoint);
        }
        return points;
    }

    // xs 为经度列表，ys为纬度列表，长度需保持一致. 返回polyline需要的经纬度对象数组
    pointsFromXAndY(xs, ys) {
        if(!xs || !ys || xs.length == 0 || ys.length == 0) {
            console.log("pointsFromXAndY error : invalid data");
            return null;
        }
        let xArray = xs.split(',') || [];
        let yArray = ys.split(',') || [];
        let length = xArray.lenght < yArray.length ? xArray.length : yArray.length;

        let points = [];
        for(let i = 0; i < length; ++i) {
            let oneCoor = {
                latitude: yArray[i],
                longitude: xArray[i]
            };
            points.push(oneCoor);
        }

        return points;

    }

// "bounds": "116.411736;40.02058;116.461594;40.141853"
    coordinateFromBounds(coorStr) {
        if (coorStr.length == 0) {
            return null;
        }

        let coords = coorStr.split(';') || [];
        if (coords.length == 4) {
            return [{
                latitude: coords[1],
                longitude: coords[0]
            },{
                latitude: coords[3],
                longitude: coords[2]
            }]
        }

        return null;
    }

    // 生成多彩线数据
    generateMultiPolyline() {
        return null;
    }

    // 生成公交车气泡信息
    generateBusCalloutProps(bus, routeName) {

        if (!bus) {
            return {};
        }

        const HalfHour = 1800;

        let {info, color, arrival} = bus;

        let subtitleText = info;

        // > 1800 超过半小时到达
        let subtitleColor = arrival > HalfHour? STYLE_MARKER.busCalloutSubtitleInvalidColor: STYLE_MARKER.busCalloutSubtitleColor;
        let arrivalLabel = arrival && arrival <= HalfHour && arrival > 60? ' 到达': '';

        let items = [
            {
                contents: [
                    {
                        size: STYLE_MARKER.busCalloutTitleSize,
                        color: STYLE_MARKER.busCalloutTitleColor,
                        text: routeName,
                        bold: true
                    }
                ],
                ...STYLE_MARKER.calloutTitilePadding
            },
            {
                contents: [
                    {
                        size: STYLE_MARKER.busCalloutSubtitleSize,
                        color: subtitleColor,
                        text: subtitleText,
                        bold: true
                    }, {
                        size: STYLE_MARKER.busCalloutTitleSize,
                        color: STYLE_MARKER.calloutTextGreyColor,
                        text: arrivalLabel,
                        bold: false
                    },
                ],
                ...STYLE_MARKER.calloutSubtitilePadding
            }
        ];

        return {
            direction: 0,
            hideOnScale: SHOW_SCALE_BUS,
            backgroundColor: STYLE_MARKER.busCalloutBgColor,
            backgroundRadius: 5,
            shadowSize: 2,
            shadowColor: '#00000029',
            showBottomTriangle: true,
            bottomTriangleWidth: 12,
            bottomTriangleHeight: 6,
            offsetY: -25,
            items: items
        }
    }

// 获取路线上站点marker的supplementaries
    getRouteStopSupplementaryProps(stopName, params = {}) {
        let hideScale = typeof params.hideScale == 'undefined'? SHOW_SCALE_ROUTESTOP: params.hideScale;
        let bold = params.bold || false;

        return {
            direction: 3,
            hideOnScale: hideScale,
            // backgroundColor: STYLE_MARKER.stationBgColor,
            // backgroundRadius: 2,
            showBottomTriangle: false,
            offsetX: 2,
            shadowSize: 2,
            items: [{
                contents: [
                    {
                        size: 12,
                        color: STYLE_MARKER.routeStationColor,
                        text: stopName,
                        bold: bold
                    }
                ],
                ...STYLE_MARKER.markerPadding
            }]
        }
    }

    //
    generatePolylineWithWalking(walkingData) {
        let steps = walkingData && walkingData.infolist || [];

        if (steps.length == 0) {
            return null;
        }

        let pointsStr = steps[0].coord;
        for(let i = 1; i < steps.length; ++i) {
            pointsStr = pointsStr + "," + steps[i].coord;
        }
        let polyline = {};
        let coors = this.pointsFromString(pointsStr);
        if (coors.length > 0) {
            polyline.points = coors;
            polyline.color = COLOR_ROUTE_WALK;
            polyline.width = POLYLINE_WIDTH_WALK;
            polyline.dottedLine = true;

            return polyline;
        }

        return null;

    }

    generatePolylineWithBusline(buslineData) {

        let pointsStr = buslineData.drivercoord;
        let polyline = {};
        let coors = this.pointsFromString(pointsStr);
        if (coors.length > 0) {
            polyline.points = coors;
            polyline.width = POLYLINE_WIDTH_BUS;

            let color = buslineData.color;
            if (color) {
                color = "#"+color;
            }
            else {
                color = COLOR_ROUTE_NORMAL;
                if (buslineData.bustype == 2) { // 地铁线路
                    color = COLOR_ROUTE_SUBWAY;
                }
            }

            polyline.color = color;
            return polyline;
        }

        return null;
    }

// 通过路况接口数据生成polyline
    generatePolylineWithSegment(segment) {
        let pointsStr = segment.etaCoords;
        let polyline = {};

        let coors = this.pointsFromString(pointsStr) || [];

        if (coors.length > 0) {
            polyline.points = coors;
            polyline.width = POLYLINE_WIDTH_BUS;

            let color = COLOR_ROUTE_NORMAL; // 公交默认颜色

            polyline.color = color;
            return polyline;
        }

        return null;
    }

// busPolyline 用于获取起终站点的经纬度
    generateTravelStopMarker(segment, isFirst, isLast, busPolyline) {

        if (!segment || !busPolyline || busPolyline.length < 2) {
            console.log("generateTravelStopMarker error : invalid busline data :" + JSON.stringify(segment));
            return null;
        }

        let result = [];

        let startMarker = {};
        startMarker.id = -1;
        let location = busPolyline[0];
        if (location) {
            startMarker.latitude = location.latitude;
            startMarker.longitude = location.longitude;
        }

        let buslineColor = segment.color;
        if (buslineColor) {
            buslineColor = "#"+buslineColor;
        }
        else {
            buslineColor = COLOR_ROUTE_NORMAL;
            if (segment.bustype == 2) { // 地铁线路
                buslineColor = COLOR_ROUTE_SUBWAY;
            }
        }

        if(isFirst) { // 第一个站点需要特殊处理
            startMarker.iconPath = ICON_STOP_SELECTED;
            startMarker.width = STYLE_SELECTED_STOP_ICON.width;
            startMarker.height = STYLE_SELECTED_STOP_ICON.height;
            startMarker.anchorX = STYLE_SELECTED_STOP_ICON.anchorX;
            startMarker.anchorY = STYLE_SELECTED_STOP_ICON.anchorY;
            startMarker.hideOnScale = SHOW_SCALE_MAXSTOP;

            let nameSuffix = "(上车)";
            if (segment.bustype == 2) { // 地铁线路
                startMarker.iconPath = ICON_STOP_SUBWAY;
                startMarker.width = 26;
                startMarker.height = 40;
                startMarker.anchorX = 0.5;
                startMarker.anchorY = 0.81;

                nameSuffix = "(进站)";
            }

            let stopName = segment.startname + nameSuffix;

            let supplementary = this.getTravelMarkerSupplementaryProps(stopName, segment.bus_key_name, buslineColor);
            startMarker.supplementaries = [supplementary];
        }
        else {

            // 上车换乘站marker的显隐级别需要特除处理
            startMarker = {
                ...startMarker,
                ...this.getTravelExchangeMarkerProps(segment.startname, segment.bus_key_name, buslineColor, SHOW_SCALE_MAXSTOP),
            };
        }

        result.push(startMarker);

        //via stops passdepotname passdepotcoord
        let via_names = (segment.passdepotname && segment.passdepotname.split(" ")) || [];
        let via_coords = this.pointsFromString(segment.passdepotcoord) || [];

        // console.log("generateTravelStopMarker via_names :" + via_names.length + "via_coords: " + via_coords.length);
        for (let i = 0; i < via_names.length; ++i) {
            let marker = {};
            let location = via_coords[i];
            marker.latitude = location.latitude;
            marker.longitude = location.longitude;
            marker.hideOnScale = SHOW_SCALE_ROUTESTOP;
            marker.anchorX = 0.5;
            marker.anchorY = 0.5;
            marker.width = 10;
            marker.height = 10;
            marker.iconPath = ICON_STOP_ROUOTE;

            let supplementary = this.getRouteStopSupplementaryProps(via_names[i]);
            marker.supplementaries = [supplementary]

            result.push(marker);
        }

        //end marker
        let endLocation = busPolyline[busPolyline.length - 1];
        let endMarkerProps = this.getTravelExchangeMarkerProps(segment.endname, segment.bus_key_name, buslineColor, SHOW_SCALE_ROUTESTOP);
        if (isLast) {
            endMarkerProps = this.getTravelTerminalMarkerProps(segment.endname);
        }

        let endMarker = {
            id: -1,
            latitude: endLocation.latitude,
            longitude: endLocation.longitude,
            ...endMarkerProps
        };
        result.push(endMarker);

        return result;
    }

    getTravelExchangeMarkerProps(stopName, busName, buslineColor, hideOnScale = SHOW_SCALE_ROUTESTOP) {
        let supplementary = this.getTravelMarkerSupplementaryProps(stopName, busName, buslineColor, hideOnScale);
        return {
            hideOnScale: hideOnScale,
            anchorX: 0.5,
            anchorY: 0.5,
            width: 19,
            height: 19,
            iconPath: ICON_STOP_EXCHANGE,
            supplementaries: [supplementary],
        }
    }

    getTravelTerminalMarkerProps(stopName){
        let supplementary = this.getRouteStopSupplementaryProps(stopName);
        return {
            hideOnScale: SHOW_SCALE_MAXSTOP,
            anchorX: 0.5,
            anchorY: 0.5,
            width: 19,
            height: 19,
            iconPath: ICON_ARRIVE,
            supplementaries: [supplementary],
        }
    }

    getTravelEndIconWithType(type) {
        if(type == 0) {
            return ICON_HOME;
        }

        if(type == 1) {
            return ICON_COMPANY;
        }

        return ICON_END;
    }

    getTravelEndNameWithType(type) {
        if (type == 0) {
            return "家";
        }

        if (type == 1) {
            return "公司";
        }

        return "常去地址";
    }

    // 单位秒
    getTravelArraivalTextWithDuration(duration) {
        // 约hh小时mm分钟到达”或“约mm分钟到达
        let h = 0;
        let m = Math.round(duration / 60);
        if (m < 1) {
            m = 1;
        }

        if (m >= 60) {
            h = Math.floor(m / 60); // 小时需要向下取整
            m = Math.round(m % 60);
        }
        let hStr = h > 0 ? h + "小时" : "";
        let mStr = m > 0 ? m + "分钟" : "";

        return "约" + hStr + mStr + "到达";
    }

    translateBuslineNameToMarkerContent(content) {
        if (content.length > 16) {
            content = `${content.slice(0, 8)}\n${content.slice(8, 16)}...`
        } else if (content.length > 8) {
            let firstLineLength = Math.floor(content.length / 2)
            content = `${content.slice(0, firstLineLength)}\n${content.slice(firstLineLength)}`
        }

        return content
    }

}