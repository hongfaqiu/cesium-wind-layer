import React, { useEffect, useState } from 'react';
import { Card, Slider, Switch, Space, Tooltip, Typography, Form } from 'antd';
import { WindLayer, WindLayerOptions } from 'cesium-wind-layer';
import { QuestionCircleOutlined } from '@ant-design/icons';
import ColorTableInput from './ColorTableInput';
import styled from 'styled-components';
import { GithubOutlined } from '@ant-design/icons';
import { ZoomInOutlined } from '@ant-design/icons';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

const { Text } = Typography;

// Styled components for compact layout
const CompactFormItem = styled(Form.Item)`
  margin-bottom: 8px !important;
  
  .ant-form-item-label {
    padding-bottom: 4px;
    > label {
      height: 24px;
    }
  }
  
  .ant-slider {
    margin: 4px 0;
    
    @media (max-width: 767px) {
      /* 增大触摸区域 */
      padding: 8px 0;
      
      .ant-slider-handle {
        width: 20px;
        height: 20px;
        margin-top: -9px;
      }
    }
  }
  
  .ant-switch {
    @media (max-width: 767px) {
      /* 增大开关大小 */
      min-width: 44px;
      height: 24px;
      
      &::after {
        width: 20px;
        height: 20px;
      }
    }
  }
`;

const StyledCard = styled(Card)`
  .ant-card-head {
    min-height: 40px;
    padding: 0 12px;
    
    .ant-card-head-title {
      padding: 8px 0;
    }
  }
  
  &.ant-card-small > .ant-card-head {
    border-bottom: 1px solid #f0f0f0;
  }
  
  @media (max-width: 767px) {
    width: 100% !important;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
`;

const CollapseButton = styled.div<{ $collapsed: boolean }>`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    transition: transform 0.3s;
    transform: rotate(${props => props.$collapsed ? 0 : 180}deg);
  }
`;

const CardContent = styled.div<{ $collapsed: boolean }>`
  max-height: ${props => props.$collapsed ? '0' : 'calc(100vh - 150px)'};
  overflow: auto;
  transition: max-height 0.3s ease-in-out, padding 0.3s ease-in-out;
  padding: ${props => props.$collapsed ? '0 12px' : '12px'};
  
  @media (max-width: 767px) {
    max-height: ${props => props.$collapsed ? '0' : '60vh'};
    
    /* 自定义滚动条样式 */
    &::-webkit-scrollbar {
      width: 4px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 2px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 2px;
    }
  }
  
  > *:last-child {
    margin-bottom: 0;
  }
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 0;
  user-select: none;
  
  &:hover {
    opacity: 0.8;
  }
`;

const TitleText = styled.span`
  flex: 1;
`;

const ControlPanelContainer = styled.div`
  position: absolute;
  z-index: 1000;
  
  @media (min-width: 768px) {
    left: 20px;
    top: 20px;
  }
  
  @media (max-width: 767px) {
    left: 50%;
    bottom: 20px;
    transform: translateX(-50%);
    width: calc(100% - 32px);
    max-width: 400px;
  }
`;

const GithubBadge = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #ffffff;
  color: #24292e;
  border-radius: 6px;
  transition: all 0.3s;
  text-decoration: none;
  font-size: 14px;
  border: 1px solid #e1e4e8;
  
  &:hover {
    background: #f6f8fa;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    border-color: #d0d7de;
  }
  
  .github-icon {
    font-size: 16px;
    color: #24292e;
  }
  
  .repo-name {
    color: #0969da;
    font-weight: 500;
  }
  
  .stats {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left: auto;
    
    img {
      height: 16px;
    }
  }
`;

const GithubLink = () => (
  <GithubBadge
    href="https://github.com/hongfaqiu/cesium-wind-layer"
    target="_blank"
    rel="noopener noreferrer"
  >
    <GithubOutlined className="github-icon" />
    <span className="repo-name">cesium-wind-layer</span>
    <div className="stats">
      <img 
        src="https://img.shields.io/github/stars/hongfaqiu/cesium-wind-layer?style=flat&logo=github"
        alt="GitHub stars" 
      />
    </div>
  </GithubBadge>
);

const TitleActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TitleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.45);
  transition: all 0.3s;
  
  &:hover {
    color: rgba(0, 0, 0, 0.85);
    background: rgba(0, 0, 0, 0.04);
  }
  
  &:active {
    background: rgba(0, 0, 0, 0.08);
  }
`;

interface ControlPanelProps {
  windLayer: WindLayer | null;
  initialOptions?: Partial<WindLayerOptions>;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  windLayer,
  initialOptions,
}) => {
  const [options, setOptions] = useState<WindLayerOptions>({
    ...WindLayer.defaultOptions,
    ...initialOptions,
  });
  
  const [collapsed, setCollapsed] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setOptions({
      ...WindLayer.defaultOptions,
      ...initialOptions,
    });
  }, [windLayer, initialOptions]);

  const renderLabel = (label: string, tooltip: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {label}
      <Tooltip title={tooltip}>
        <QuestionCircleOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
      </Tooltip>
    </div>
  );

  const handleValuesChange = (changedValues: Partial<WindLayerOptions>, allValues: WindLayerOptions) => {
    setOptions(allValues);
    
    if (changedValues.colors) {
      windLayer?.updateOptions({ colors: changedValues.colors });
    } else {
      windLayer?.updateOptions(changedValues);
    }
  };

  return (
    <ControlPanelContainer>
      <StyledCard
        title={
          <CardTitle onClick={() => setCollapsed(!collapsed)}>
            <TitleText>Wind Layer Controls</TitleText>
            <TitleActions>
              <TitleButton
                onClick={(e) => {
                  e.stopPropagation();
                  setVisible(!visible);
                  if (windLayer) {
                    windLayer.show = !visible;
                  }
                }}
                title={visible ? "Hide Wind Layer" : "Show Wind Layer"}
              >
                {visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              </TitleButton>
              <TitleButton
                onClick={(e) => {
                  e.stopPropagation();
                  windLayer?.zoomTo(1);
                }}
                title="Zoom to Wind Field"
              >
                <ZoomInOutlined />
              </TitleButton>
              <CollapseButton $collapsed={collapsed}>
                <svg
                  viewBox="0 0 24 24"
                  width="12"
                  height="12"
                  fill="currentColor"
                >
                  <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
                </svg>
              </CollapseButton>
            </TitleActions>
          </CardTitle>
        }
        size="small"
      >
        <CardContent $collapsed={collapsed}>
          <Form
            initialValues={initialOptions}
            onValuesChange={handleValuesChange}
            layout="vertical"
            size="small"
          >
            <Space direction="vertical" style={{ width: '100%' }} size={4}>
              <CompactFormItem
                name="particlesTextureSize"
                label={renderLabel(
                  'Particles Count',
                  'Size of the particle texture. Determines the maximum number of particles (size squared).'
                )}
                help={
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    Current: {Math.pow(options.particlesTextureSize, 2)} particles
                  </Text>
                }
              >
                <Slider min={1} max={500} />
              </CompactFormItem>

              <CompactFormItem
                name="particleHeight"
                label={renderLabel(
                  'Particle Height',
                  'Height of particles above the ground in meters.'
                )}
              >
                <Slider min={-1000} max={10000} step={100} />
              </CompactFormItem>

              <CompactFormItem
                name="lineWidth"
                label={renderLabel(
                  'Line Width',
                  'Width of particle trails in pixels. Controls the width of the particles.'
                )}
              >
                <Slider min={0.1} max={100} step={0.1} />
              </CompactFormItem>

              <CompactFormItem
                name="speedFactor"
                label={renderLabel(
                  'Speed Factor',
                  'Factor to adjust the speed of particles. Controls the movement speed of particles.'
                )}
              >
                <Slider min={0.1} max={20} step={0.1} />
              </CompactFormItem>

              <CompactFormItem
                name="dropRate"
                label={renderLabel(
                  'Drop Rate',
                  'Rate at which particles are dropped (reset). Controls the lifecycle of particles.'
                )}
              >
                <Slider min={0.001} max={0.01} step={0.001} />
              </CompactFormItem>

              <CompactFormItem
                name="dropRateBump"
                label={renderLabel(
                  'Drop Rate Bump',
                  'Additional drop rate for slow-moving particles. Increases the probability of dropping particles when they move slowly.'
                )}
              >
                <Slider min={0} max={0.2} step={0.001} />
              </CompactFormItem>

              <CompactFormItem
                name="colors"
                label={renderLabel(
                  'Color Scheme',
                  'Array of colors for particles. Can be used to create color gradients.'
                )}
              >
                <ColorTableInput 
                  value={options.colors}
                  onChange={(colors) => {
                    handleValuesChange({ colors }, { ...options, colors });
                  }}
                />
              </CompactFormItem>

              <CompactFormItem
                name="flipY"
                label={renderLabel(
                  'Flip Y Axis',
                  'Whether to flip the Y-axis of the wind data.'
                )}
                valuePropName="checked"
              >
                <Switch
                  size="small"
                  checkedChildren="Flipped"
                  unCheckedChildren="Normal"
                />
              </CompactFormItem>

              <CompactFormItem
                name="useViewerBounds"
                label={renderLabel(
                  'Use Viewer Bounds',
                  'Generate particles within the current view bounds instead of the entire wind field.'
                )}
                valuePropName="checked"
              >
                <Switch
                  size="small"
                  checkedChildren="View Bounds"
                  unCheckedChildren="Global"
                />
              </CompactFormItem>
              
              <div style={{ marginTop: 8 }}>
                <GithubLink />
              </div>
            </Space>
          </Form>
        </CardContent>
      </StyledCard>
    </ControlPanelContainer>
  );
};
