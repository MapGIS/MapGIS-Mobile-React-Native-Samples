import React, { Component } from 'react';
import { View, ToastAndroid } from 'react-native';
import styles from '../styles';
import { OGC_WMTS_PATH } from '../utils';
import {
  MGMapView,
  Map,
  MapServer,
  ImageLayer,
  Rect,
} from '@mapgis/uniform-core-react-native';

/**
 * @content 在线WMTS地图示例
 * @author xiaoying 2019-11-25
 */
export default class OnlineWMtsMap extends Component {
  static navigationOptions = { title: '在线WMTS地图' };
  onGetInstance = mapView => {
    this.mapView = mapView;
    this.showMap();
  };

  showMap = async () => {
    this.map = await Map.createInstance();

    let mapServer = await ImageLayer.createMapServer(
      MapServer.MapServerType.MAPSERVER_TYPE_OGC_WMTS,
    );
    await mapServer.setName('wmts');
    await mapServer.setURL(OGC_WMTS_PATH);

    let serverLayerObj = await ImageLayer.createInstance();
    await serverLayerObj.setMapServer(mapServer);

    await this.map.append(serverLayerObj);
    let isFinish = await this.mapView.setMapAsync(this.map);
    if (isFinish) {
      ToastAndroid.show('地图加载完成', ToastAndroid.SHORT);
      //   let rectObj = await Rect.createInstance(
      //     7423643.921033,
      //     -3891328.011782,
      //     16136710.477754,
      //     9855954.777711
      //   );

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
