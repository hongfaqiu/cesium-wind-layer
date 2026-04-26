import { useEffect, useRef, useState } from 'react';
import { Viewer, Rectangle, ArcGisMapServerImageryProvider, ImageryLayer, Ion, CesiumTerrainProvider } from 'cesium';
import { WindLayer, WindLayerOptions, WindData } from 'cesium-wind-layer';
import { ControlPanel } from '@/components/ControlPanel';
import styled from 'styled-components';
import { colorSchemes } from '@/components/ColorTableInput';
import { SpeedQuery } from '@/components/SpeedQuery';

Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhY2IzNzQzNi1iOTVkLTRkZjItOWVkZi1iMGUyYTUxN2Q5YzYiLCJpZCI6NTUwODUsImlhdCI6MTcyNTQyMDE4NX0.yHbHpszFexPrxX6_55y0RgNrHjBQNu9eYkW9cXKUTPk';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;

const CesiumContainer = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
`;

const SwitchButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 8px 16px;
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  z-index: 1000;

  &:hover {
    background-color: rgba(255, 255, 255, 0.9);
  }
`;

// Add data configurations
const dataConfigs = {
  wind: {
    options: {
      domain: {
        min: 0,
        max: 8,
      },
      speedFactor: 0.8,
      lineWidth: { min: 1, max: 2 },
      lineLength: { min: 10, max: 100 },
      particleHeight: 100,
    },
    file: '/wind.json'
  },
  ocean: {
    options: {
      domain: {
        min: 0,
        max: 1,
      },
      speedFactor: 8,
      lineWidth: { min: 1, max: 4 },
      lineLength: { min: 20, max: 50 },
      particleHeight: 10,
    },
    file: '/ocean.json'
  }
};

const defaultOptions: Partial<WindLayerOptions> = {
  ...WindLayer.defaultOptions,
  particlesTextureSize: 200,
  colors: colorSchemes.find(item => item.value === 'cool')?.colors.reverse(),
  flipY: true,
  useViewerBounds: true,
  dynamic: true,
};

export function Earth() {
  const viewerRef = useRef<Viewer | null>(null);
  const windLayerRef = useRef<WindLayer | null>(null);
  const [, setIsWindLayerReady] = useState(false);
  const windDataFiles = [dataConfigs.wind.file, dataConfigs.ocean.file];
  const isFirstLoadRef = useRef(true);
  const [currentDataIndex, setCurrentDataIndex] = useState(0);
  const [currentOptions, setCurrentOptions] = useState<WindLayerOptions>({
    ...defaultOptions,
    ...dataConfigs.wind.options
  } as WindLayerOptions);

  useEffect(() => {
    let isComponentMounted = true;

    // Create viewer only if it doesn't exist
    if (!viewerRef.current) {
      viewerRef.current = new Viewer('cesiumContainer', {
        baseLayer: ImageryLayer.fromProviderAsync(ArcGisMapServerImageryProvider.fromUrl(
          'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
          { enablePickFeatures: false }
        ), {}),
        baseLayerPicker: false,
        animation: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        selectionIndicator: true,
        timeline: false,
        navigationHelpButton: false,
        shouldAnimate: true,
        useBrowserRecommendedResolution: false,
        sceneModePicker: false,
      });
    }
    // Add terrain
    CesiumTerrainProvider.fromIonAssetId(1).then(terrainProvider => {
      if (viewerRef.current) {
        viewerRef.current.terrainProvider = terrainProvider;
      }
    });

    viewerRef.current.scene.globe.depthTestAgainstTerrain = true;
    // Optional: Add exaggeration to make terrain features more visible
    // viewerRef.current.scene.verticalExaggeration = 2;
    // viewerRef.current.sceneModePicker.viewModel.duration = 0;
    
    const initWindLayer = async () => {
      try {
        const res = await fetch(windDataFiles[0]);
        const data = await res.json();

        if (!isComponentMounted || !viewerRef.current) return;

        const windData: WindData = {
          ...data,
          bounds: {
            west: data.bbox[0],
            south: data.bbox[1],
            east: data.bbox[2],
            north: data.bbox[3],
          }
        };

        // Apply initial options with wind configuration
        const initialOptions = {
          ...defaultOptions,
          ...dataConfigs.wind.options
        };
        setCurrentOptions(initialOptions as WindLayerOptions);

        if (isFirstLoadRef.current && windData.bounds) {
          const rectangle = Rectangle.fromDegrees(
            windData.bounds.west,
            windData.bounds.south,
            windData.bounds.east,
            windData.bounds.north
          );
          viewerRef.current.camera.flyTo({
            destination: rectangle,
            duration: 0,
          });
          isFirstLoadRef.current = false;
        }

        const layer = new WindLayer(viewerRef.current, windData, initialOptions);
        
        // Add event listeners
        layer.addEventListener('dataChange', (data) => {
          console.log('Wind data updated:', data);
          // Handle data change
        });

        layer.addEventListener('optionsChange', (options) => {
          console.log('Options updated:', options);
          // Handle options change
        });

        windLayerRef.current = layer;
        setIsWindLayerReady(true);
      } catch (error) {
        console.error('Failed to initialize wind layer:', error);
      }
    };

    // Initialize wind layer
    initWindLayer();

    return () => {
      isComponentMounted = false;
      isFirstLoadRef.current = true;
      
      if (windLayerRef.current) {
        windLayerRef.current.destroy();
        windLayerRef.current = null;
        setIsWindLayerReady(false);
      }

      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  const handleOptionsChange = (changedOptions: Partial<WindLayerOptions>) => {
    setCurrentOptions({
      ...currentOptions,
      ...changedOptions
    });
  };

  const handleSwitchData = async () => {
    try {
      const nextIndex = (currentDataIndex + 1) % windDataFiles.length;
      const res = await fetch(windDataFiles[nextIndex]);
      const data = await res.json();

      if (!windLayerRef.current) return;

      const windData: WindData = {
        ...data,
        bounds: {
          west: data.bbox[0],
          south: data.bbox[1],
          east: data.bbox[2],
          north: data.bbox[3],
        }
      };

      // Get the correct configuration based on the next index
      const configKey = nextIndex === 0 ? 'wind' : 'ocean';
      const newOptions = {
        ...currentOptions, // Keep current options
        ...dataConfigs[configKey].options // Only override specific options
      };

      // Update both the wind data and options
      windLayerRef.current.updateOptions(newOptions);
      windLayerRef.current.updateWindData(windData);
      setCurrentOptions(newOptions);
      setCurrentDataIndex(nextIndex);
    } catch (error) {
      console.error('Failed to switch wind data:', error);
    }
  };

  return (
    <PageContainer>
      <SpeedQuery windLayer={windLayerRef.current} viewer={viewerRef.current} />
      <CesiumContainer id="cesiumContainer">
        <SwitchButton onClick={handleSwitchData}>
          Switch to {currentDataIndex === 0 ? 'Ocean' : 'Wind'} Data
        </SwitchButton>
        <ControlPanel
          windLayer={windLayerRef.current}
          initialOptions={currentOptions}
          onOptionsChange={handleOptionsChange}
        />
      </CesiumContainer>
    </PageContainer>
  );
}
