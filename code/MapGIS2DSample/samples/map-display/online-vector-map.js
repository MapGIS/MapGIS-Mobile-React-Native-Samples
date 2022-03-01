import React, { Component } from 'react';
import { View, ToastAndroid } from 'react-native';
import styles from '../styles';
import { SERVER_DOC_URL_PATH } from '../utils';
import { Rect, MGMapView, ImageLayer, MapServer, Map } from '@mapgis/mobile-react-native';

export default class OfflineVectorMap extends Component {
  static navigationOptions = { title: '在线矢量地图' };
  onGetInstance = mapView => {
    this.mapView = mapView;
    this.openMap();
  };

  openMap = async () => {
    // await this.mapView.loadFromFileAsync(SERVER_DOC_MAPX_PATH);

    this.map = await Map.createInstance();

    let mapServer = await ImageLayer.createMapServer(
      MapServer.MapServerType.MAPSERVER_TYPE_IGSERVER_VECTOR,
    );
    await mapServer.setName('docs');
    await mapServer.setURL(SERVER_DOC_URL_PATH);

    let serverLayerObj = await ImageLayer.createInstance();
    await serverLayerObj.setMapServer(mapServer);
    await this.map.append(serverLayerObj);

    let isFinish = await this.mapView.setMapAsync(this.map);
    if (isFinish) {
      ToastAndroid.show('地图加载完成', ToastAndroid.SHORT);
      let rectObj = await Rect.createInstance(
        115.404485,
        39.417817,
        117.4652,
        41.057802
      );

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
