/**
 * Interface for storing and processing sRGB colors in CIELAB
 * Adapted from => https://github.com/LeaVerou/color.js
 */
export default class Color {
  constructor(...args) {
    if (Array.isArray(args[0])) {
      const [coords, space] = args;

      if (space === "lab") {
        this._lab = coords;
      } else {
        this._rgb = coords;
      }
    } else if (typeof args[0] === "string") {
      const str = args[0];

      if (str[0] === "#" && str.length === 7) {
        this._hex = str;
        this._rgb = Color.parseHex(str);
      } else if (str.startsWith("rgb(")) {
        this._rgb = Color.parseRGB(str);
      } else if (str.startsWith("rgba(")) {
        [this._rgb, this._alpha] = Color.parseRGBA(str);
      } else {
        throw new Error(`Unsupported color format: "${str}"`);
      }
    } else {
      this._rgb = [0, 0, 0];
    }
  }

  get hex() {
    this._hex = this._hex || this.toHex();
    return this._hex;
  }

  get rgb() {
    this._rgb = this._rgb || sRGB.fromLab(this._lab);
    return this._rgb;
  }

  get lab() {
    this._lab = this._lab || sRGB.toLab(this._rgb);
    return this._lab;
  }

  get lightness() {
    return this.lab[0];
  }

  get chroma() {
    const [L, a, b] = this.lab;
    return Math.sqrt(a ** 2 + b ** 2);
  }

  get alpha() {
    return this._alpha ?? 1;
  }

  deltaE(color) {
    return Math.sqrt(this.lab.reduce((a, c, i) => {
      if (isNaN(c) || isNaN(color.lab[i])) {
        return a;
      }
      return a + (color.lab[i] - c) ** 2;
    }, 0));
  }

  range(color) {
    function interpolate(start, end, p) {
      if (isNaN(start)) {
        return end;
      }
      if (isNaN(end)) {
        return start;
      }
      return start + (end - start) * p;
    }
    return p => {
      const coords = this.lab.map((start, i) => {
        const end = color.lab[i];
        return interpolate(start, end, p);
      });
      return new Color(coords, "lab");
    };
  }

  toHex(alpha = 1) {
    let hex = this.rgb.map(Color.compToHex).join("");
    if (alpha !== 1) {
      hex += Color.compToHex(alpha);
    }
    return "#" + hex;
  }

  static parseHex(str) {
    let rgba = [];
    str.replace(/[a-f0-9]{2}/gi, component => {
      rgba.push(parseInt(component, 16) / 255);
    });
    return rgba.slice(0, 3);
  }

  static parseRGB(str) {
    return Color.parseRGBA(str.replace("rgb", "rgba"))[0];
  }

  static parseRGBA(str) {
    const rgba = str.slice(5, -1).split(",");
    return [
      rgba.slice(0, 3).map(c => parseInt(c) / 255),   /* [r, g, b] */
      parseFloat(rgba.pop())                          /* alpha */
    ];
  }

  static compToHex(c) {
    c = Math.round(Math.min(Math.max(c * 255, 0), 255));
    return c.toString(16).padStart(2, "0");
  }
}
Color.white = new Color([1, 1, 1]);

/**
 * Matrices and functions for sRGB <--> CIELAB conversion
 * https://drafts.csswg.org/css-color-4/conversions.js
 */
const Matrices = {
  lin_sRGB_to_XYZ: [
    [ 0.41239079926595934, 0.357584339383878,   0.1804807884018343  ],
    [ 0.21263900587151027, 0.715168678767756,   0.07219231536073371 ],
    [ 0.01933081871559182, 0.11919477979462598, 0.9505321522496607  ]
  ],
  XYZ_to_lin_sRGB: [        /* inverse of above */
    [  3.2409699419045226,  -1.537383177570094,   -0.4986107602930034  ],
    [ -0.9692436362808796,   1.8759675015077202,   0.04155505740717559 ],
    [  0.05563007969699366, -0.20397695888897652,  1.0569715142428786  ]
  ],
  /* Bradford CAT */
  D65_to_D50: [
    [  1.0479298208405488,    0.022946793341019088,  -0.05019222954313557 ],
    [  0.029627815688159344,  0.990434484573249,     -0.01707382502938514 ],
    [ -0.009243058152591178,  0.015055144896577895,   0.7518742899580008  ]
  ],
  D50_to_D65: [             /* inverse of above */
    [  0.9554734527042182,   -0.023098536874261423,  0.0632593086610217   ],
    [ -0.028369706963208136,  1.0099954580058226,    0.021041398966943008 ],
    [  0.012314001688319899, -0.020507696433477912,  1.3303659366080753   ]
  ],

  /**
   * Simple matrix (and vector) multiplication
   * https://drafts.csswg.org/css-color-4/multiply-matrices.js
   * @author Lea Verou 2020 MIT License
   */
  multiply(A, B) {
    const m = A.length;
    /* if A is vector, convert to [[a, b, c, ...]] */
    if (!Array.isArray(A[0])) {
      A = [A];
    }
    /* if B is vector, convert to [[a], [b], [c], ...]] */
    if (!Array.isArray(B[0])) {
      B = B.map(x => [x]);
    }
    const p = B[0].length;
    const B_cols = B[0].map((_, i) => B.map(x => x[i]));  /* transpose B */

    let product = A.map(row => B_cols.map(col => {
      if (!Array.isArray(row)) {
        return col.reduce((a, c) => a + c * row, 0);
      }
      return row.reduce((a, c, i) => a + c * (col[i] || 0), 0);
    }));
    if (m === 1) {
      product = product[0];   /* Avoid [[a, b, c, ...]] */
    }
    if (p === 1) {
      return product.map(x => x[0]);  /* Avoid [[a], [b], [c], ...]] */
    }
    return product;
  }
}

/* Gamma-corrected sRGB to CIE Lab and back */
const sRGB = {
  toXYZ_M: Matrices.multiply(Matrices.D65_to_D50, Matrices.lin_sRGB_to_XYZ),
  fromXYZ_M: Matrices.multiply(Matrices.XYZ_to_lin_sRGB, Matrices.D50_to_D65),
  whites: {
    /* ASTM E308-01: [0.96422, 1.00000, 0.82521] */
    D50: [0.3457 / 0.3585, 1.00000, (1.0 - 0.3457 - 0.3585) / 0.3585]
  },
  CIE_fracs: {
    ε: 216/24389,  /* 6^3/29^3 */
    ε3: 24/116,    /*  6 / 29  */
    κ: 24389/27    /* 29^3/3^3 */
  },

  toLab(RGB) {
    return this.XYZtoLab(this.toXYZ(this.toLinear(RGB)));
  },

  toLinear(RGB) {  /* sRGB values [0 - 1] */
    return RGB.map(function (val) {
      const sign = val < 0? -1 : 1;
      const abs = Math.abs(val);
      if (abs < 0.04045) {
        return val / 12.92;
      }
      return sign * (Math.pow((abs + 0.055) / 1.055, 2.4));
    });
  },

  toXYZ(linRGB) {
    return Matrices.multiply(this.toXYZ_M, linRGB);
  },

  XYZtoLab(XYZ) {
    const white = this.whites.D50;
    const {κ, ε} = this.CIE_fracs;
    const xyz = XYZ.map((value, i) => value / white[i]);

    const f = xyz.map(value => {
      return value > ε ? Math.cbrt(value) : (κ * value + 16)/116;
    });
    return [
      (116 * f[1]) - 16,   /* L */
      500 * (f[0] - f[1]), /* a */
      200 * (f[1] - f[2])  /* b */
    ];
  },

  fromLab(Lab) {
    return this.toGamma(this.fromXYZ(this.LabToXYZ(Lab)));
  },

  LabToXYZ(Lab) {
    const white = this.whites.D50;
    const {κ, ε3} = this.CIE_fracs;
    let f = [];

    f[1] = (Lab[0] + 16)/116;
    f[0] = Lab[1]/500 + f[1];
    f[2] = f[1] - Lab[2]/200;
    /* κ * ε  = 2^3 = 8 */
    const xyz = [
      f[0]   > ε3  ?  Math.pow(f[0],3)            : (116*f[0]-16)/κ,
      Lab[0] > 8   ?  Math.pow((Lab[0]+16)/116,3) : Lab[0]/κ,
      f[2]   > ε3  ?  Math.pow(f[2],3)            : (116*f[2]-16)/κ
    ];
    return xyz.map((value, i) => value * white[i]);
  },

  fromXYZ(XYZ) {
    return Matrices.multiply(this.fromXYZ_M, XYZ);
  },

  toGamma(RGB) {   /* linear-light sRGB values [0 - 1] */
    return RGB.map(function (val) {
      const sign = val < 0? -1 : 1;
      const abs = Math.abs(val);
      if (abs > 0.0031308) {
        return sign * (1.055 * Math.pow(abs, 1/2.4) - 0.055);
      }
      return 12.92 * val;
    });
  }
}
