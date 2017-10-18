import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import {
  BackgroundLayout,
  CircleLayout,
  FillExtrusionLayout,
  FillLayout,
  GeoJSONSource,
  GeoJSONSourceRaw,
  ImageSource,
  Layer,
  LineLayout,
  RasterLayout,
  RasterSource,
  SymbolLayout,
  VectorSource,
  VideoSource,
  BackgroundPaint,
  FillPaint,
  FillExtrusionPaint,
  LinePaint,
  SymbolPaint,
  RasterPaint,
  CirclePaint,
  MapMouseEvent
} from 'mapbox-gl';
import { MapService } from '../map/map.service';

@Component({
  selector: 'mgl-layer',
  template: ''
})
export class LayerComponent implements OnInit, OnDestroy, OnChanges, Layer {
  /* Init inputs */
  @Input() id: string;
  @Input() source?: string | VectorSource | RasterSource | GeoJSONSource | ImageSource | VideoSource | GeoJSONSourceRaw;
  @Input() type?: 'symbol' | 'fill' | 'line' | 'circle' | 'fill-extrusion' | 'raster' | 'background';
  @Input() metadata?: any;
  @Input() sourceLayer?: string;

  /* Dynamic inputs */
  @Input() filter?: any[];
  @Input() layout?: BackgroundLayout | FillLayout | FillExtrusionLayout | LineLayout | SymbolLayout | RasterLayout | CircleLayout;
  @Input() paint?: BackgroundPaint | FillPaint | FillExtrusionPaint | LinePaint | SymbolPaint | RasterPaint | CirclePaint;
  @Input() before?: string;
  @Input() minzoom?: number;
  @Input() maxzoom?: number;

  @Output() click = new EventEmitter<MapMouseEvent>();
  @Output() mouseEnter = new EventEmitter<MapMouseEvent>();
  @Output() mouseLeave = new EventEmitter<MapMouseEvent>();

  private layerAdded = false;

  constructor(
    private MapService: MapService
  ) { }

  ngOnInit() {
    this.MapService.mapLoaded$.subscribe(() => {
      this.MapService.addLayer({
        layerOptions: {
          id: this.id,
          type: this.type,
          source: this.source,
          metadata: this.metadata,
          'source-layer': this.sourceLayer,
          minzoom: this.minzoom,
          maxzoom: this.maxzoom,
          filter: this.filter,
          layout: this.layout,
          paint: this.paint
        },
        layerEvents: {
          click: this.click,
          mouseEnter: this.mouseEnter,
          mouseLeave: this.mouseLeave
        }
      }, this.before);
      this.layerAdded = true;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.layerAdded) {
      return;
    }
    if (changes.paint && !changes.paint.isFirstChange()) {
      this.MapService.setAllLayerPaintProperty(this.id, changes.paint.currentValue!);
    }
    if (changes.layout && !changes.layout.isFirstChange()) {
      this.MapService.setAllLayerLayoutProperty(this.id, changes.layout.currentValue!);
    }
    if (changes.filter && !changes.filter.isFirstChange()) {
      this.MapService.setLayerFilter(this.id, changes.filter.currentValue!);
    }
    if (changes.before && !changes.before.isFirstChange()) {
      this.MapService.setLayerBefore(this.id, changes.before.currentValue!);
    }
    if (
      changes.minzoom && !changes.minzoom.isFirstChange() ||
      changes.maxzoom && !changes.maxzoom.isFirstChange()
    ) {
      this.MapService.setLayerZoomRange(this.id, this.minzoom, this.maxzoom);
    }
  }

  ngOnDestroy() {
    this.MapService.removeLayer(this.id);
  }
}
