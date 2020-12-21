function bright(depth, span, length, height, width, dwidth, dheight, offAngle) {
    let result = 
        indoorDoublereflexlight(depth,span,length,height,width,dwidth,dheight,offAngle) + 
        indoorLlight(depth, span, length, height, width, dwidth, dheight, offAngle) +
        indoorReflexlight(depth,span,length,height,width,dwidth,dheight,offAngle) + 
        indoorRlight(depth, span, length, height, width, dwidth, dheight, offAngle) +
        indoorinlight(depth, span, length, height, width, dwidth, dheight, offAngle) +
        indoorlight(depth, span, length, height, width, dwidth, dheight, offAngle);
    return result
}

function indoorlight(h) {
    /**
   * 规定参数
   * a,b,c,d,e为亮度参数
   * Iz 天定亮度
   * */
    var c = 5,
        d = -2.5,
        e = 0.3;
    /**
   * 数据推导参数
   * Zs天顶值
   * i,j  分别为纵向角和横向角的不定数值
   * Q，w为纵向角和横向角
  */
    var Z = 0,
        Az = 0;
    var w = Math.asin((1.8 * Math.sqrt(h ^ 2 + 2.56)) / ((h ^ 2) + 3.37))
    var Q = Math.asin(2.56 / (Math.sqrt(3.37 + h ^ 2)))
    var pi = Math.PI
    var Zs = 14.47751218 * pi / 2
    var x = Math.acos(
        Math.cos(Zs) * Math.cos(Z) - Math.sin(Zs) * Math.sin(Z) * Math.cos(Az)
    )
    var fx = 1 + c * (Math.exp(d * x) - Math.exp(d * pi / 2)) + e * Math.cos(x) * Math.cos(
        x
    )
    var fZs = 1 + c * (Math.exp(d * Zs) - Math.exp(d * pi / 2)) + e * Math.cos(Zs) * Math.cos(
        Zs
    )
    var Lr = (fx * 2.36 * 8.5192) / (fZs)
    var sum = 0;
    for (var i = 0; i < 10; i++) {
        Z = i * Q;
        for (var j = 0; j < 10; j++) {
            Az = j * w;
            sum = sum + Lr
        }
    }
    sum = sum * Math.sin(Q);
    sum = Math.round(sum * 10 / 10);
    return sum
}

function indoorLlight(
    depth,
    span,
    length,
    height,
    width,
    dwidth,
    dheight,
    offAngle
) {
    let f = 0.8;
    return (
        indoorlight(depth, span, length, height, width, dwidth, dheight, offAngle) * f
    )
}

function indoorRlight(
    depth,
    span,
    length,
    height,
    width,
    dwidth,
    dheight,
    offAngle
) {
    let f = 0.8;
    span = 2 * width - span;
    return (
        indoorlight(depth, span, length, height, width, dwidth, dheight, offAngle) * f
    )
}

function indoorinlight(
    depth,
    span,
    length,
    height,
    width,
    dwidth,
    dheight,
    offAngle
) {
    let f = 0.8;
    return (
        indoorlight(depth, span, length, height, width, dwidth, dheight, offAngle) * f
    )
}

function indoorReflexlight(
    depth,
    span,
    length,
    height,
    width,
    dwidth,
    dheight,
    offAngle
) {
    let f = 0.8;

    return (
        indoorlight(depth, span, length, height, width, dwidth, dheight, offAngle) * f
    )
}

function indoorDoublereflexlight(
    depth,
    span,
    length,
    height,
    width,
    dwidth,
    dheight,
    offAngle
) {
    let f = 0.8;

    return (
        indoorReflexlight(depth, span, length, height, width, dwidth, dheight, offAngle) * f
    )
}
