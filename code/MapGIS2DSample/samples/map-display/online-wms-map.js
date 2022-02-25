import React, { Component } from 'react';
import { View, ToastAndroid } from 'react-native';
import styles from '../styles';
import { OGC_WMS_DOC_PATH } from '../utils';
import {
  MGMapView,
  Map,
  MapServer,
  ImageLayer,
  Rect,
} from '@mapgis/uniform-core-react-native';

/**
 * @content 在线WMS地图示例
 * @author xiaoying 2019-11-25
 */
export default class OnlineWMSMap extends Component {
  static navigationOptions = { title: '在线WMS地图' };
  onGetInstance = mapView => {
    this.mapView = mapView;
    this.showMap();
  };

  showMap = async () => {
    this.map = await Map.createInstance();

    let mapServer = await ImageLayer.createMapServer(
      MapServer.MapServerType.MAPSERVER_TYPE_OGC_WMS,
    );
    await mapServer.setName('wms');
    await mapServer.setURL(OGC_WMS_DOC_PATH);
    let serverLayerObj = await ImageLayer.createInstance();
    await serverLayerObj.setMapServer(mapServer);
    await this.map.append(serverLayerObj);
    let isFinish = await this.mapView.setMapAsync(this.map);
    if (isFinish) {
      ToastAndroid.show('地图加载完成', ToastAndroid.SHORT);
      // let rectObj = await Rect.createInstance(
      //   636138.814022,
      //   3423243.249009,
      //   641582.125568,
      //   3431831.585004
      // );

      let rectObj = await this.map.getViewRange();
      await this.mapView.zoomToRange(rectObj, false);
    } else {
      ToastAndroid.show(
        '在线地图加载失败，请确保网络已连接',
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
      </View>
    );
  }
}
