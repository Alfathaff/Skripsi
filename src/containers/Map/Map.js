import React, { Component } from 'react';
import 'ol/ol.css';
import './Map.css';
import { Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Draw } from 'ol/interaction';
import { Fill, Stroke, Style } from 'ol/style';
import { transformExtent } from 'ol/proj';
import { fromExtent } from 'ol/geom/Polygon';

class MapComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      center: [0, 0],
      zoom: 1,
      bboxCoordinates: [],
      drawing: false,
    };

    this.map = null;
    this.mapRef = React.createRef();
    this.bboxSource = new VectorSource();
    this.bboxLayer = new VectorLayer({
      source: this.bboxSource,
      style: new Style({
        stroke: new Stroke({
          color: 'red',
          width: 2,
        }),
        fill: new Fill({
          color: 'rgba(255, 0, 0, 0.1)',
        }),
      }),
    });

    this.drawInteraction = new Draw({
      source: this.bboxSource,
      type: 'Circle',
      geometryFunction: this.createBox,
      style: new Style({
        stroke: new Stroke({
          color: 'red',
          width: 2,
        }),
        fill: new Fill({
          color: 'rgba(255, 0, 0, 0.1)',
        }),
      }),
    });
  }

  componentDidMount() {
    this.map = new Map({
      target: this.mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        this.bboxLayer,
      ],
      view: new View({
        center: this.state.center,
        zoom: this.state.zoom,
      }),
    });

    this.map.on('moveend', () => {
      const center = this.map.getView().getCenter();
      const zoom = this.map.getView().getZoom();
      this.setState({ center, zoom });
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.drawing !== this.state.drawing) {
      if (this.state.drawing) {
        this.map.addInteraction(this.drawInteraction);
      } else {
        this.map.removeInteraction(this.drawInteraction);
      }
    }
  }

  createBox = (coordinates, geometry) => {
    const center = coordinates[0];
    const extent = [
      center[0] - 2000000,
      center[1] - 1000000,
      center[0] + 2000000,
      center[1] + 1000000,
    ];
    if (!geometry) {
      geometry = fromExtent(extent);
    } else {
      geometry.setCoordinates(fromExtent(extent).getCoordinates());
    }
    this.updateBboxCoordinates(extent);
    return geometry;
  };

  updateBboxCoordinates = (bbox) => {
    this.bboxSource.clear();

    const transformedBbox = transformExtent(bbox, 'EPSG:3857', 'EPSG:4326');
    const [minX, minY, maxX, maxY] = transformedBbox;
    const bboxCoordinates = [
      [minX, minY],
      [minX, maxY],
      [maxX, maxY],
      [maxX, minY],
      [minX, minY],
    ];
    this.setState({ bboxCoordinates }, () => {
      this.zoomToBbox(transformedBbox);
    });
  };

  zoomToBbox = (bbox) => {
    const extent = transformExtent(bbox, 'EPSG:4326', 'EPSG:3857');
    this.map.getView().fit(extent, {
      padding: [50, 50, 50, 50], // Optional: Padding around the bbox
      duration: 1000, // Optional: Animation duration in milliseconds (default is 400)
    });
  };

  clearBbox = () => {
    this.bboxSource.clear();
    this.setState({ bboxCoordinates: [], drawing: false });
  };

  startDrawing = () => {
    this.setState({ drawing: true });
  };

  render() {
    const { bboxCoordinates, drawing } = this.state;

    return (
      <div className="map-container">
        <div ref={this.mapRef} className="map" />
        <div className="bbox-coordinates">
          {bboxCoordinates.length > 0 && (
            <React.Fragment>
              <span>Bbox Coordinates:</span>
              {bboxCoordinates.map((coord, index) => (
                <span key={index}>
                  [{coord[0].toFixed(4)}, {coord[1].toFixed(4)}]
                  {index < bboxCoordinates.length - 1 && ','}
                </span>
              ))}
            </React.Fragment>
          )}
        </div>
        <div className="button-container">
          {!drawing && (
            <button onClick={this.startDrawing}>
              Draw Bbox
            </button>
          )}
          <button onClick={this.clearBbox} disabled={bboxCoordinates.length === 0}>
            Clear Bbox
          </button>
        </div>
      </div>
    );
  }
}

export default MapComponent;
