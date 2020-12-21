function no(params) {
    
   
    //左侧边
    H1=Math.sqrt(depth^2+wl^2+span^2)
    //右侧边
    H2=Math.sqrt(depth^2+wr^2)
    //wl
    wl=span-(width-dwidth)/2
    //wr
    wr=dwidth-wl
    
    //上角w
    w=Math.acos((H1*H1-H2*H2-dwidth*dwidth)/(2*H1*H2))
    //侧边角Q
    Q=Math.atan(dwidth/Math.sqrt(dwidth/(H1*H1+(span-(width-dwidth)/2))))
}
