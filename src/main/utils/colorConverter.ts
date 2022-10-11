/* eslint-disable no-restricted-globals */
/* eslint-disable no-restricted-properties */
/* eslint-disable @typescript-eslint/no-throw-literal */

/*
* Conversions for the sRGB color space.
* See: http://en.wikipedia.org/wiki/Srgb
*/

export interface XyBri
{
  x: number; // chromaticity coordinate
  y: number; // chromaticity coordinate
  bri: number; // luminance/brightness
}

export interface Rgb
{
  r: number; // red
  g: number; // green
  b: number; // blue
}

export function xyBriToRgb(xyb : XyBri) : Rgb {

  // parameter validation
  if (xyb.x < 0 || xyb.x > .8)
    throw `x property must be between 0 and .8, but is: ${  xyb.x}`;
  if (xyb.y < 0 || xyb.y > 1)
    throw `y property must be between 0 and 1, but is: ${  xyb.y}`;
  if (xyb.bri < 0 || xyb.bri > 1)
    throw `bri property must be between 0 and 1, but is: ${  xyb.bri}`;

  // init
  const {x} = xyb;
  const {y} = xyb;
  const z = 1.0 - x - y;

  const Y = xyb.bri;
  const X = (Y / y) * x;
  const Z = (Y / y) * z;

  // Wide gamut D65 conversion
  let r = X  * 1.612 - Y * 0.203 - Z * 0.302;
  let g = -X * 0.509 + Y * 1.412 + Z * 0.066;
  let b = X  * 0.026 - Y * 0.072 + Z * 0.962;

  // Apply gamma correction
  r = r <= 0.0031308 ? 12.92 * r : (1.0 + 0.055) * Math.pow(r, (1.0 / 2.4)) - 0.055;
  g = g <= 0.0031308 ? 12.92 * g : (1.0 + 0.055) * Math.pow(g, (1.0 / 2.4)) - 0.055;
  b = b <= 0.0031308 ? 12.92 * b : (1.0 + 0.055) * Math.pow(b, (1.0 / 2.4)) - 0.055;

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const cap = (x: any) => Math.max(0, Math.min(1, x));

  return { r: cap(r), g: cap(g), b: cap(b) };
}

export function rgbToXyBri(rgb : Rgb) : XyBri {

  // parameter validation
  if (rgb.r < 0 || rgb.r > 1
    || rgb.g < 0 || rgb.g > 1
    || rgb.b < 0 || rgb.b > 1)
    throw "r, g, and, b properties must be between 0 and 1";

  // init
  const red = rgb.r;
  const green = rgb.g;
  const blue = rgb.b;

  // Apply gamma correction
  const r = (red   > 0.04045) ? Math.pow((red   + 0.055) / (1.0 + 0.055), 2.4) : (red   / 12.92);
  const g = (green > 0.04045) ? Math.pow((green + 0.055) / (1.0 + 0.055), 2.4) : (green / 12.92);
  const b = (blue  > 0.04045) ? Math.pow((blue  + 0.055) / (1.0 + 0.055), 2.4) : (blue  / 12.92);

  // Wide gamut conversion D65
  const X = r * 0.649926 + g * 0.103455 + b * 0.197109;
  const Y = r * 0.234327 + g * 0.743075 + b * 0.022598;
  const Z = r * 0.0000000 + g * 0.053077 + b * 1.035763;

  let cx = X / (X + Y + Z);
  let cy = Y / (X + Y + Z);

  if (isNaN(cx)) {
    cx = 0.0;
  }

  if (isNaN(cy)) {
    cy = 0.0;
  }

  return { x: cx, y: cy, bri: Y };
}

export function rgbToHexString(rgb : Rgb) : string {

  function f(x: any) {
    // eslint-disable-next-line no-param-reassign
    x = Math.round(x * 255);
    const s = `0${  x.toString(16)}`;
    return s.substr(-2);
  }

  return f(rgb.r) + f(rgb.g) + f(rgb.b);
}

export function hexStringToRgb(s : string) : Rgb {
  return {
    r : parseInt(s.substring(0, 2), 16) / 255,
    g : parseInt(s.substring(2, 4), 16) / 255,
    b : parseInt(s.substring(4, 6), 16) / 255
  };
}

export function hexStringToXyBri(s : string) : XyBri {
  return rgbToXyBri(hexStringToRgb(s));
}

export interface Point
{
  x: number;
  y: number;
}

interface Triangle
{
  r: Point;
  g: Point;
  b: Point;
}

const hueBulbs = ['LCT001'];
const livingColors = [
  'LLC006', // Bol
  'LLC007', // Aura
];

function triangleForModel(model : string) : Triangle {
  if (hueBulbs.indexOf(model) > -1)
    // Hue bulbs color gamut triangle
    return {
        r: { x: .675,  y: .322 },
        g: { x: .4091, y: .518 },
        b: { x: .167,  y: .04 },
      };
  if (livingColors.indexOf(model) > -1)
    // LivingColors color gamut triangle
    return {
        r: { x: .704,  y: .296 },
        g: { x: .2151, y: .7106 },
        b: { x: .138,  y: .08 },
      };
  return {
        r: { x: 1, y: 0 },
        g: { x: 0, y: 1 },
        b: { x: 0, y: 0 },
      };
}

function crossProduct(p1 : Point, p2 : Point) : number {
  return (p1.x * p2.y - p1.y * p2.x);
}

function isPointInTriangle(p : Point, triangle : Triangle) : boolean {
  const red = triangle.r;
  const green = triangle.g;
  const blue = triangle.b;

  const v1 = { x: green.x - red.x, y: green.y - red.y };
  const v2 = { x: blue.x - red.x,  y: blue.y - red.y };

  const q = { x: p.x - red.x, y: p.y - red.y };

  const s = crossProduct(q, v2) / crossProduct(v1, v2);
  const t = crossProduct(v1, q) / crossProduct(v1, v2);

  return (s >= 0.0) && (t >= 0.0) && (s + t <= 1.0);
}

function closestPointOnLine(a : Point, b: Point, p : Point) : Point {
  const ap = { x: p.x - a.x, y: p.y - a.y };
  const ab = { x: b.x - a.x, y: b.y - a.y };
  const ab2 = ab.x * ab.x + ab.y * ab.y;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const ap_ab = ap.x * ab.x + ap.y * ab.y;

  let t = ap_ab / ab2;
  t = Math.min(1, Math.max(0, t));

  return { x: a.x + ab.x * t, y: a.y + ab.y * t };
}

function distance(p1 : Point, p2: Point) : number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  return dist;
}

export function xyForModel(xy : Point, model : string) : Point {
  const triangle = triangleForModel(model);
  if (isPointInTriangle(xy, triangle))
    return xy;

  const pAB = closestPointOnLine(triangle.r, triangle.g, xy);
  const pAC = closestPointOnLine(triangle.b, triangle.r, xy);
  const pBC = closestPointOnLine(triangle.g, triangle.b, xy);

  // Get the distances per point and see which point is closer to our Point.
  const dAB = distance(xy, pAB);
  const dAC = distance(xy, pAC);
  const dBC = distance(xy, pBC);

  let lowest = dAB;
  let closestPoint = pAB;

  if (dAC < lowest) {
    lowest = dAC;
    closestPoint = pAC;
  }
  if (dBC < lowest) {
    lowest = dBC;
    closestPoint = pBC;
  }

  return closestPoint;
}

export function xyBriForModel(xyb : XyBri, model : string) : XyBri {
  const xy = xyForModel(xyb, model);
  return { x: xy.x, y: xy.y, bri: xyb.bri };
}
