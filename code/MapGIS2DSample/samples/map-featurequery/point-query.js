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
  FeatureQuery,
  QueryDef,
  GraphicPoint,
} from '@mapgis/mobile-react-native';

/**
 * @content 点击查询
 * @author  2019-10-25 下午2:52:36
 */
export default class MapGraphicPoint extends Component {
  static navigationOptions = { title: '点击查询' };

  constructor() {
    super();
    this.state = {
      qryDot: null,
    };
  }

  onGetInstance = mapView => {
    this.mapView = mapView;
    this.openMap();
  };

  openMap = async () => {
    await this.mapView.registerMapLoadListener();
    await this.mapView.loadFromFile(MAPX_FILE_PATH);

    let dot = await Dot.createInstance(12730000, 3560000);

    this.setState({ qryDot: dot });

    let graphicPoint = await GraphicPoint.createInstance();
    await graphicPoint.setColor('rgba(100, 200, 0, 12)');
    await graphicPoint.setPointAndSize(dot, 15);

    let graphicsOverlay = await this.mapView.getGraphicsOverlay();
    await graphicsOverlay.addGraphic(graphicPoint);
    await this.mapView.refresh();
  };

  componentDidMount() {
    this.mapLoadListener = DeviceEventEmitter.addListener(
      'com.mapgis.RN.Mapview.LoadMapListener_Finish',
      async res => {
        if (res.DidFinishLoadingMap) {
          let mapRange = await Rect.createInstance(
            12721012.835149,
            3545154.582956,
            12737898.505747,
            3571796.418788
          );
          await this.mapView.zoomToRange(mapRange, false);
        }
      }
    );
  }

  componentWillUnmount() {
    this.mapLoadListener.remove();
  }

  _featureQuery = async () => {
    // let queryBound = await QueryBound.createInstanceByPoint(this.state.qryDot);

    let map = await this.mapView.getMap();
    let vectorLayer = null;
    //获取查询图层对象（指定区图层）
    for (let i = 0; i < (await map.getLayerCount()); i++) {
      let mapLayer = await map.getLayer(i);
      if ((await mapLayer.getName()) === '水域') {
        vectorLayer = mapLayer;
        break;
      }
    }
    if (vectorLayer != null) {
      let query = await FeatureQuery.createInstanceByVectorLayer(vectorLayer);
      // await query.setQueryBound(queryBound);
      let queryDef = await QueryDef.createInstance();
      await queryDef.setPagination(0, 10000);
      await queryDef.setWithSpatial(true);
      await queryDef.setSubFields('*');
      await query.setQueryDef(queryDef);
      let featurePagedResult = await query.query();
      let getTotalFeatureCount = await featurePagedResult.getTotalFeatureCount();
      let graphicArry = [];
      let featureLst = await featurePagedResult.getPage(1);
      for (let j = 0; j < featureLst.length; j++) {
        let feature = await featureLst[j];
        let graphicList = await feature.toGraphics(true);
        for (let k = 0; k < graphicList.length; k++) {
          graphicArry.push(graphicList[k]);
        }
      }
      let graphicsOverlay = await this.mapView.getGraphicsOverlay();
      await graphicsOverlay.removeAllGraphics();
      await graphicsOverlay.addGraphics(graphicArry);
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
              <Text style={styles.text}>单点查询</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}
