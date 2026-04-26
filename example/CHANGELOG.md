# example

## 0.7.1

### Patch Changes

- e7808e9: Compatibility with recent Cesium releases
- Updated dependencies [e7808e9]
  - cesium-wind-layer@0.10.1

## 0.7.0

### Minor Changes

- feat(wind-layer): refactor lineWidth to support min-max range

  BREAKING CHANGE: lineWidth option now requires min-max range object instead of single number

  - Change lineWidth type from number to { min: number, max: number }
  - Set default lineWidth range to { min: 1, max: 2 }
  - Update shader to support dynamic line width based on particle speed
  - Update types and documentation
  - Update example to demonstrate new lineWidth configuration
  - Add lineWidth range control in ControlPanel component

  This change allows for more dynamic and visually appealing particle trails by varying
  the line width based on wind speed, similar to how line length works.

### Patch Changes

- Updated dependencies
  - cesium-wind-layer@0.10.0

## 0.6.0

### Minor Changes

- feat: add line length range control

  - Add lineLength option to control particle trail length range
  - Change lineLength type from number to { min: number; max: number }
  - Set default lineLength range to { min: 20, max: 100 }
  - Set default lineWidth to 5.0
  - Update control panel UI to support lineLength range adjustment
  - Add different lineLength ranges for wind and ocean data

### Patch Changes

- Updated dependencies
  - cesium-wind-layer@0.9.0

## 0.5.0

### Minor Changes

- 770381e: feat: add dynamic option to control particle animation

  - Add new `dynamic` option to WindLayerOptions to control particle animation state
  - Add dynamic switch control in ControlPanel component
  - Set default value of dynamic option to true
  - Update types and documentation

  This change allows users to toggle between animated and static particle states.

### Patch Changes

- Updated dependencies [770381e]
- Updated dependencies [7fc0dbf]
  - cesium-wind-layer@0.8.0

## 0.4.7

### Patch Changes

- Updated dependencies
  - cesium-wind-layer@0.7.6

## 0.4.6

### Patch Changes

- fix: reduce unnecessary texture recreation
- Updated dependencies
  - cesium-wind-layer@0.7.5

## 0.4.5

### Patch Changes

- Updated dependencies
  - cesium-wind-layer@0.7.4

## 0.4.4

### Patch Changes

- Updated dependencies
  - cesium-wind-layer@0.7.3

## 0.4.3

### Patch Changes

- Updated dependencies
  - cesium-wind-layer@0.7.2

## 0.4.2

### Patch Changes

- Updated dependencies
  - cesium-wind-layer@0.7.1

## 0.4.1

### Patch Changes

- Updated dependencies
  - cesium-wind-layer@0.7.0

## 0.4.0

### Minor Changes

- feat: add event system for wind layer

  - Add event system for data and options changes
  - Add WindLayerEventType and WindLayerEventCallback types
  - Implement addEventListener and removeEventListener methods
  - Add event dispatching for data and options updates
  - Improve texture recreation when updating wind data

### Patch Changes

- Updated dependencies
  - cesium-wind-layer@0.6.0

## 0.3.7

### Patch Changes

- Updated dependencies
  - cesium-wind-layer@0.5.3

## 0.3.6

### Patch Changes

- Updated dependencies
  - cesium-wind-layer@0.5.2

## 0.3.5

### Patch Changes

- Updated dependencies
  - cesium-wind-layer@0.5.1

## 0.3.4

### Patch Changes

- Updated dependencies
  - cesium-wind-layer@0.5.0

## 0.3.3

### Patch Changes

- Updated dependencies
  - cesium-wind-layer@0.4.3

## 0.3.2

### Patch Changes

- Updated dependencies
  - cesium-wind-layer@0.4.2

## 0.3.1

### Patch Changes

- Updated dependencies
  - cesium-wind-layer@0.4.1

## 0.3.0

### Minor Changes

- feat: add useViewerBounds option and improve UI

  - Add useViewerBounds option to control particle generation range
  - Move layer visibility control to title bar
  - Update default line width to 10.0
  - Add base pixel size offset to prevent particles from being too small
  - Update types and documentation

### Patch Changes

- Updated dependencies
  - cesium-wind-layer@0.4.0

## 0.2.0

### Minor Changes

- feat: Terrain occlusion support & add zoomTo method

### Patch Changes

- Updated dependencies
  - cesium-wind-layer@0.3.0

## 0.1.0

### Minor Changes

- options change available

### Patch Changes

- Updated dependencies
  - cesium-wind-layer@0.2.0

## 0.0.3

### Patch Changes

- Updated dependencies
  - cesium-wind-layer@0.1.3

## 0.0.2

### Patch Changes

- Updated dependencies
  - cesium-wind-layer@0.1.2

## 0.0.1

### Patch Changes

- Updated dependencies
  - cesium-wind-layer@0.1.1
