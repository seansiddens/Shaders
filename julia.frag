#define MAX_ITERATIONS 500
#define C_MAP 0
#define TILE 0
#define MANDELBROT 0

float colormap_red(float x) {
    if (x < 0.7) {
        return 4.0 * x - 1.5;
    } else {
        return -4.0 * x + 4.5;
    }
}

float colormap_green(float x) {
    if (x < 0.5) {
        return 4.0 * x - 0.5;
    } else {
        return -4.0 * x + 3.5;
    }
}

float colormap_blue(float x) {
    if (x < 0.3) {
       return 4.0 * x + 0.5;
    } else {
       return -4.0 * x + 2.5;
    }
}

vec4 colormap_jet(float x) {
    float r = clamp(colormap_red(x), 0.0, 1.0);
    float g = clamp(colormap_green(x), 0.0, 1.0);
    float b = clamp(colormap_blue(x), 0.0, 1.0);
    return vec4(r, g, b, 1.0);
}
vec2 squareImaginary(vec2 n) {
    return vec2((n.x * n.x) - (n.y * n.y), 2.0 * n.x * n.y);
}

vec3 iterate(vec2 z, vec2 c) {

    int iterations = 0;

    while (length(z) < 2.0 && iterations < MAX_ITERATIONS) {
    
        z = squareImaginary(z) + c;
        iterations++;
    }
    
    z = squareImaginary(z); iterations++;    // a couple of extra iterations helps
    z = squareImaginary(z); iterations++;    // decrease the size of the error term.
    float l = length(z);
    float m = float(MAX_ITERATIONS);
    float i = float(iterations);
    float mu = i - (log (log (l)))/ log (2.0);

    vec3 col = colormap_jet(mu * .03).rgb;
    // vec3 col = vec3(0.0);
    // if (iterations >= MAX_ITERATIONS) col = vec3(1.0);
    return col;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    float t = iTime;

    // Define window of the complex plane to render Julias
    float x = 0.;
    vec2 jRealRange = vec2(-2.0 + x, 2.0 - x);
    vec2 jCompRange = jRealRange * iResolution.y / iResolution.x;
    // Define window of the complex plane to render Mandelbrot
    vec2 mRealRange = vec2(-2.5, 1.0);
    vec2 mCompRange = mRealRange * iResolution.y / iResolution.x;
    
    // Normalized pixel coordinates from 0 to 1
    vec2 st  = fragCoord/iResolution.xy;


    // Coordinates scaled and shifted to complex plane
    vec2 uv = st;

    #if TILE==1
    // Number of tiles
    // float n = 1.;
    float n = floor(exp(mod(0.2 * t, 5.))) + 1.0;
    uv *= n;
    uv = fract(uv);
    // vec2 c = floor(uv) + 0.5;
    #endif

    #if MANDELBROT==0
    uv *= length(jRealRange);
    uv.y *= iResolution.y / iResolution.x;
    uv -= vec2(length(jRealRange) / 2.0, length(jCompRange) / 2.0);

    #else
    uv.x *= 2.0;
    uv.x = fract(uv.x);
    if (fragCoord.x >= iResolution.x / 2.0) {
        uv *= length(jRealRange);
        uv.y *= iResolution.y / iResolution.x * 2.0;
        uv -= vec2(length(jRealRange) / 2.0, length(jCompRange));
    }
    else {
        uv *= length(mRealRange);
        uv.y *= iResolution.y / iResolution.x * 2.0;
        uv -= vec2(length(mRealRange) / 2.0 + 0.5, length(mCompRange));
    }
    #endif


    #if C_MAP==1 && TILE==1
    // c value map
    vec2 c = st;
    c *= length(mRealRange);
    c.y *= iResolution.y / iResolution.x;
    c -= vec2(length(mRealRange) / 2.0 + 0.5, length(mCompRange) / 2.0);

    #elif MANDELBROT==1

    vec2 c = iMouse.xy / iResolution.xy;
    c.x *= 2.0;
    c.x = fract(c.x);
    c *= length(mRealRange);
    c.y *= iResolution.y / iResolution.x * 2.0;
    c -= vec2(length(mRealRange) / 2.0 + 0.5, length(mCompRange));
    
    #else

    // Overwrite c val
    float r = 0.5;
    vec2 c = vec2(r * cos(iTime), r * sin(iTime));
    // vec2 c = vec2(2.0, 2.0);

    #endif

    #if MANDELBROT==0
    vec3 col = iterate(uv, c);
    #else
    vec3 col = vec3(0.0);
    if (fragCoord.x >= iResolution.x / 2.0) {
        col = iterate(uv, c);
    }
    else {
        col = iterate(vec2(0.), uv);
    }

    #endif

    // Output to screen
    fragColor = vec4(col,1.0);
}