# cesium-wind-layer

## 0.8.0

### Minor Changes

- 770381e: feat: add dynamic option to control particle animation

  - Add new `dynamic` option to WindLayerOptions to control particle animation state
  - Add dynamic switch control in ControlPanel component
  - Set default value of dynamic option to true
  - Update types and documentation

  This change allows users to toggle between animated and static particle states.

## 0.7.6

### Patch Changes

- fix: normalize particle speed and length across different refresh rates

  - Add frameRateAdjustment uniform to normalize particle movement
  - Adjust trail length calculation based on frame rate
  - Ensure consistent particle behavior regardless of display refresh rate

## 0.7.5

### Patch Changes

- fix: reduce unnecessary texture recreation

## 0.7.4

### Patch Changes

- fix: optimize frame rate calculation and shader performance

  - Remove redundant interval uniform from shader
  - Calculate interval directly in shader to reduce data transfer
  - Only update frame rate when FPS > 50 to avoid performance degradation
  - Replace requestAnimationFrame with setInterval for stable frame rate updates

## 0.7.3

### Patch Changes

- fix: frame rate calculate

## 0.7.2

### Patch Changes

- fix: resolve options deep copy issue in deepMerge function

## 0.7.1

### Patch Changes

- fix: update readme, add displayRange param

## 0.7.0

### Minor Changes

- feat: add domain and displayRange options for wind layer
  Changes:

  1. domain controls the rendering range for color mapping
  2. displayRange controls particle visibility
  3. Both options fallback to data's min/max when undefined
  4. Early visibility check in fragment shader for better performance

## 0.6.0

### Minor Changes

- feat: add event system for wind layer

  - Add event system for data and options changes
  - Add WindLayerEventType and WindLayerEventCallback types
  - Implement addEventListener and removeEventListener methods
  - Add event dispatching for data and options updates
  - Improve texture recreation when updating wind data

## 0.5.3

### Patch Changes

- fix: calculate frame rate only during initialization

  - Move frame rate calculation to initialization phase
  - Use timestamp array to measure frames in the last second
  - Calculate FPS once with 120 frames sample for better accuracy
  - Store frame rate adjustment factor for consistent particle speed

## 0.5.2

### Patch Changes

- fix: fix default render options

## 0.5.1

### Patch Changes

- fix: adjust particle speed based on actual frame rate

  - Add real-time frame rate measurement to normalize particle speed
  - Update frame rate calculation every 500ms for better performance
  - Apply frame rate adjustment (60/fps) to maintain consistent particle movement speed across different devices

## 0.5.0

### Minor Changes

- feat: enhance wind layer visualization and data query

  - Improve particle system performance and coverage

    - Fix particle distribution in certain areas
    - Optimize particle generation algorithm
    - Adjust particle visibility calculation
    - Add 5% buffer to view range for smoother transitions

  - Enhance wind data query functionality
    - Refactor WindDataAtLonLat interface with clear structure
    - Add bilinear interpolation for wind data
    - Separate original and interpolated data in query results
    - Add detailed JSDoc comments for better type documentation

  BREAKING CHANGE: WindDataAtLonLat interface structure has changed. Now returns data in 'original' and 'interpolated' sub-objects.

## 0.4.3

### Patch Changes

- Tilting the camera angle still displays particles

## 0.4.2

### Patch Changes

- Color correctly represents speed

## 0.4.1

### Patch Changes

- fix: quickly adapt to camera changes

## 0.4.0

### Minor Changes

- feat: add useViewerBounds option and improve UI

  - Add useViewerBounds option to control particle generation range
  - Move layer visibility control to title bar
  - Update default line width to 10.0
  - Add base pixel size offset to prevent particles from being too small
  - Update types and documentation

## 0.3.0

### Minor Changes

- feat: Terrain occlusion support & add zoomTo method

## 0.2.0

### Minor Changes

- options change available

## 0.1.3

### Patch Changes

- add mit license

## 0.1.2

### Patch Changes

- update readme

## 0.1.1

### Patch Changes

- initial package
