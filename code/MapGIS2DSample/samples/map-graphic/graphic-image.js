import React, { Component } from 'react';
import { View } from 'react-native';
import styles from '../styles';
import { MAPX_FILE_PATH } from '../utils';
import { IMG_FILE_PATH } from '../utils';
import {
  MGMapView,
  Dot,
  Image,
  GraphicImage,
} from '@mapgis/uniform-core-react-native';

export default class MapGraphicImage extends Component {
  static navigationOptions = { title: '坐标添加图像' };
  onGetInstance = mapView => {
    this.mapView = mapView;
    this.openMap();
  };

  openMap = async () => {
    await this.mapView.loadFromFile(MAPX_FILE_PATH);
    let center = await Dot.createInstance(12751000.589636726, 3568000.453292473);
    let img = await Image.createInstanceByLocalPath(IMG_FILE_PATH);
    this.graphicImage = await GraphicImage.createInstance();
    await this.graphicImage.setImage(img);
    await this.graphicImage.setPoint(center);

    this.graphicsOverlay = await this.mapView.getGraphicsOverlay();
    await this.graphicsOverlay.addGraphic(this.graphicImage);
    await this.mapView.refresh();
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
