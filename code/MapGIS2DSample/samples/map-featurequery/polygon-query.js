import React, { Component } from 'react';
import {
  View,
  ToastAndroid,
  TouchableOpacity,
  Text,
  DeviceEventEmitter,
} from 'react-native';
import styles from '../styles';
import { MAPX_FILE_PATH } from '../utils';
import {
  Rect,
  MGMapView,
  Dot,
  Dots,
  GeoPolygon,
  IntList,
  SpaQueryMode,
  QueryDef,
  FeatureQuery,
  GraphicPolygon,
} from '@mapgis/mobile-react-native';

/**
 * @content 多边形查询
 * @author  2019-10-25 下午2:52:36
 */
export default class MapPolygonQuery extends Component {
  static navigationOptions = { title: '多边形查询' };

  constructor() {
    super();
    this.state = {
      points: [],
    };
  }

  onGetInstance = mapView => {
    this.mapView = mapView;
    this.openMap();
  };

  openMap = async () => {
    await this.mapView.registerMapLoadListener();
    await this.mapView.loadFromFile(MAPX_FILE_PATH);

    let dotArray = [];

    let dot0 = await Dot.createInstance(12725970, 3590399);
    let dot1 = await Dot.createInstance(12720256, 3581161);
    let dot2 = await Dot.createInstance(12722050, 3575104);
    let dot3 = await Dot.createInstance(12736232, 3577852);
    let dot4 = await Dot.createInstance(12736260, 3579983);

    dotArray.push(dot0);
    dotArray.push(dot1);
    dotArray.push(dot2);
    dotArray.push(dot3);
    dotArray.push(dot4);
    dotArray.push(dot0);

    this.setState({ points: dotArray });

    let graphicPolygon = await GraphicPolygon.createInstance();

    await graphicPolygon.setColor('rgba(0, 0, 0, 180)');
    await graphicPolygon.setBorderlineColor('rgba(100, 200, 0, 90)');
    await graphicPolygon.setBorderlineWidth(12);
    await graphicPolygon.appendPoints(dotArray);

    let graphicsOverlay = await this.mapView.getGraphicsOverlay();
    await graphicsOverlay.addGraphic(graphicPolygon);

    await this.mapView.refresh();
  };

  componentDidMount() {
    this.mapLoadListener = DeviceEventEmitter.addListener(
      'com.mapgis.RN.Mapview.LoadMapListener_Finish',
      async res => {
        if (res.DidFinishLoadingMap) {
          let mapRange = await Rect.createInstance(
            12713494.101,
            3558023.0138,
            12743347.8314,
            3605125.566
          );
          await this.mapView.zoomToRange(mapRange, true);
        }
      }
    );
  }

  componentWillUnmount() {
    this.mapLoadListener.remove();
  }

  _featureQuery = async () => {
    let queryBound = this.state.points;

    let map = await this.mapView.getMap();
    let vectorLayer = null;
    //获取查询图层对象（指定区图层）
    for (let i = 0; i < (await map.getLayerCount()); i++) {
      let mapLayer = await map.getLayer(i);
      if ((await mapLayer.getName()) == '水域') {
        vectorLayer = mapLayer;
        break;
      }
    }
    if (vectorLayer != null) {
      let query = await FeatureQuery.createInstanceByVectorLayer(vectorLayer);

      let geoPolygon = await GeoPolygon.createInstance();
      let dots = await Dots.createInstance();
      for (let i = 0; i < queryBound.length; i++) {
        await dots.append(queryBound[i]);
      }
      let intList = await IntList.createInstance();
      let size = await dots.size();
      await intList.append(size);
      await geoPolygon.setDots(dots, intList);

      let queryDef = await QueryDef.createInstance();
      await queryDef.setPagination(0, 10000);
      await queryDef.setWithSpatial(true);
      await queryDef.setSubFields('*');
      await queryDef.setSpatial(geoPolygon, SpaQueryMode.ModeIntersect);
      await query.setQueryDef(queryDef);

      let featurePagedResult = await query.query();
      let getTotalFeatureCount = await featurePagedResult.getTotalFeatureCount();

      let graphicArry = [];
      let featureLst = await featurePagedResult.getPage(1);
      for (let i = 0; i < featureLst.length; i++) {
        let feature = await featureLst[i];
        let graphicList = await feature.toGraphics(true);
        for (let j = 0; j < graphicList.length; j++) {
          graphicArry.push(graphicList[j]);
        }
      }
      this.graphicsOverlay = await this.mapView.getGraphicsOverlay();
      await this.graphicsOverlay.addGraphics(graphicArry);
      await this.mapView.refresh();
      ToastAndroid.show(
        '查询结果总数为：' + getTotalFeatureCount,
        ToastAndroid.SHORT
      );
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <MGMapView
          ref="mapView"
          onGetInstance={this.onGetInstance}
          style={styles.mapView}
        />
        <View style={styles.buttons}>
          <View style={styles.button}>
            <TouchableOpacity onPress={this._featureQuery}>
              <Text style={styles.text}>多边形查询</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}
