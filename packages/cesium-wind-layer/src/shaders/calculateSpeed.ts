export const calculateSpeedShader = /*glsl*/`#version 300 es

// the size of UV textures: width = lon, height = lat
uniform sampler2D U; // eastward wind 
uniform sampler2D V; // northward wind
uniform sampler2D currentParticlesPosition; // (lon, lat, lev)

uniform vec2 dimension; // (lon, lat)
uniform vec2 minimum; // minimum of each dimension
uniform vec2 maximum; // maximum of each dimension
uniform vec2 interval; // interval of each dimension

uniform float speedScaleFactor;

in vec2 v_textureCoordinates;

vec2 mapPositionToNormalizedIndex2D(vec2 lonLat) {
    // ensure the range of longitude and latitude
    lonLat.x = clamp(lonLat.x, minimum.x, maximum.x);
    lonLat.y = clamp(lonLat.y,  minimum.y, maximum.y);

    vec2 index2D = vec2(0.0);
    index2D.x = (lonLat.x - minimum.x) / interval.x;
    index2D.y = (lonLat.y - minimum.y) / interval.y;

    vec2 normalizedIndex2D = vec2(index2D.x / dimension.x, index2D.y / dimension.y);
    return normalizedIndex2D;
}

float getWindComponent(sampler2D componentTexture, vec2 lonLat) {
    vec2 normalizedIndex2D = mapPositionToNormalizedIndex2D(lonLat);
    float result = texture(componentTexture, normalizedIndex2D).r;
    return result;
}

float interpolateTexture(sampler2D componentTexture, vec2 lonLat) {
    float lon = lonLat.x;
    float lat = lonLat.y;

    float lon0 = floor(lon / interval.x) * interval.x;
    float lon1 = lon0 + 1.0 * interval.x;
    float lat0 = floor(lat / interval.y) * interval.y;
    float lat1 = lat0 + 1.0 * interval.y;

    float lon0_lat0 = getWindComponent(componentTexture, vec2(lon0, lat0));
    float lon1_lat0 = getWindComponent(componentTexture, vec2(lon1, lat0));
    float lon0_lat1 = getWindComponent(componentTexture, vec2(lon0, lat1));
    float lon1_lat1 = getWindComponent(componentTexture, vec2(lon1, lat1));

    float lon_lat0 = mix(lon0_lat0, lon1_lat0, lon - lon0);
    float lon_lat1 = mix(lon0_lat1, lon1_lat1, lon - lon0);
    float lon_lat = mix(lon_lat0, lon_lat1, lat - lat0);
    return lon_lat;
}

vec2 getWindComponents(vec2 lonLat) {
    vec2 normalizedIndex2D = mapPositionToNormalizedIndex2D(lonLat);
    float u = texture(U, normalizedIndex2D).r;
    float v = texture(V, normalizedIndex2D).r;
    return vec2(u, v);
}

vec2 bilinearInterpolation(vec2 lonLat) {
    float lon = lonLat.x;
    float lat = lonLat.y;

    // Calculate grid cell coordinates
    float lon0 = floor(lon / interval.x) * interval.x;
    float lon1 = lon0 + interval.x;
    float lat0 = floor(lat / interval.y) * interval.y;
    float lat1 = lat0 + interval.y;

    // Get wind vectors at four corners
    vec2 v00 = getWindComponents(vec2(lon0, lat0));
    vec2 v10 = getWindComponents(vec2(lon1, lat0));
    vec2 v01 = getWindComponents(vec2(lon0, lat1));
    vec2 v11 = getWindComponents(vec2(lon1, lat1));

    // Calculate interpolation weights
    float s = (lon - lon0) / interval.x;
    float t = (lat - lat0) / interval.y;

    // Perform bilinear interpolation on vector components
    vec2 v0 = mix(v00, v10, s);
    vec2 v1 = mix(v01, v11, s);
    return mix(v0, v1, t);
}

vec2 lengthOfLonLat(vec2 lonLat) {
    // unit conversion: meters -> longitude latitude degrees
    // see https://en.wikipedia.org/wiki/Geographic_coordinate_system#Length_of_a_degree for detail

    // Calculate the length of a degree of latitude and longitude in meters
    float latitude = radians(lonLat.y);

    float term1 = 111132.92;
    float term2 = 559.82 * cos(2.0 * latitude);
    float term3 = 1.175 * cos(4.0 * latitude);
    float term4 = 0.0023 * cos(6.0 * latitude);
    float latLength = term1 - term2 + term3 - term4;

    float term5 = 111412.84 * cos(latitude);
    float term6 = 93.5 * cos(3.0 * latitude);
    float term7 = 0.118 * cos(5.0 * latitude);
    float longLength = term5 - term6 + term7;

    return vec2(longLength, latLength);
}

vec2 convertSpeedUnitToLonLat(vec2 lonLat, vec2 speed) {
    vec2 lonLatLength = lengthOfLonLat(lonLat);
    float u = speed.x / lonLatLength.x;
    float v = speed.y / lonLatLength.y;
    vec2 windVectorInLonLat = vec2(u, v);

    return windVectorInLonLat;
}

vec2 calculateSpeedByRungeKutta2(vec2 lonLat) {
    // see https://en.wikipedia.org/wiki/Runge%E2%80%93Kutta_methods#Second-order_methods_with_two_stages for detail
    const float h = 0.5;

    vec2 y_n = lonLat;
    vec2 f_n = bilinearInterpolation(lonLat);
    vec2 midpoint = y_n + 0.5 * h * convertSpeedUnitToLonLat(y_n, f_n) * speedScaleFactor;
    vec2 speed = h * bilinearInterpolation(midpoint) * speedScaleFactor;

    return speed;
}


float calculateWindNorm(vec2 speed) {
    vec3 percent = vec3(0.0);
    vec2 uRange = vec2(-1.0, 1.0);
    vec2 vRange = vec2(-1.0, 1.0);
    if(length(speed.xy) == 0.0){
      return 0.0;
    }

    percent.x = (abs(speed.x) - uRange.x) / (uRange.y - uRange.x);
    percent.y = (abs(speed.y) - vRange.x) / (vRange.y - vRange.x);
    float norm = length(percent);

    return norm;
}

out vec4 fragColor;

void main() {
    // texture coordinate must be normalized
    vec2 lonLat = texture(currentParticlesPosition, v_textureCoordinates).rg;
    vec2 speedOrigin = bilinearInterpolation(lonLat);
    vec2 speed = calculateSpeedByRungeKutta2(lonLat);
    vec2 speedInLonLat = convertSpeedUnitToLonLat(lonLat, speed);

    vec3 particleSpeed = vec3(speedInLonLat, calculateWindNorm(speed / speedScaleFactor));
    fragColor = vec4(speedInLonLat, calculateWindNorm(speedOrigin), 0.0);
}
`;
