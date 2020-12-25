<template>
  <div class="apartment">
    <canvas id="canvas" :height="canvasHeight" :style="{'cursor': cursor}" :width="canvasWidth"
      @mousedown="onCanvasMousedown" @mouseup="onCanvasMouseup" @mousemove="onCanvasMousemove"></canvas>
    <div class="left-control">

      <!--画图菜单-->
      <div class="menu" v-if="operation === 'none' && !selectObj">

        <div class="background-image">
          <div class="item-top">底图</div>
          <div class="item-bottom">
            <div class="input-file flex1">
              本地
              <input type="file" @change="onLocalImgClick" id="input_image">
            </div>
            <div class="flex1 border-left" @click="onRulerClick">比例</div>
            <div class="flex1 border-left">新增</div>
          </div>
        </div>

        <div class="apartment-info">
          <div class="item-top">楼盘</div>
          <div class="item-bottom1">
            <div class="flex1-plus">
              <el-select v-model="real_estate_id" filterable placeholder="选择楼盘" default-first-option
                :remote-method="searchEstate" remote @change="chooseRealName">
                <el-option v-for="item in realNameList" :key="item.id" :label="item.real_estate_name" :value="item.id">
                </el-option>
              </el-select>
            </div>
            <div class="flex1">
              户型编号
              <select v-model="selectOption" @change="loadOnlineImage">
                <option :value="item" v-for="(item,index) in apartmentList" :key="index">{{item.imgName2}}</option>
              </select>
            </div>
            <div class="flex1">
              建筑面积
              <input class="input-text" v-model="selectOption.imgName1" type="number">
            </div>
          </div>
        </div>

        <div class="mode">
          <div class="item-top">模式</div>
          <div class="item-bottom">
            <div class="flex1" :class="{'acolor': mode === '单层'}" @click="changeMode('单层')">单层</div>
            <div class="flex1 border-left" :class="{'acolor': mode === '多层'}" @click="changeMode('多层')">多层</div>
          </div>
        </div>

        <div class="add-floor" v-if="mode === '多层'">
          <div class="item-top">新建楼层</div>
          <div class="item-bottom">
            <div class="flex1" @click="addFloor(-2)">-2</div>
            <div class="flex1 border-left" @click="addFloor(-1)">-1</div>
            <div class="flex1 border-left" @click="addFloor(1)">1</div>
            <div class="flex1 border-left" @click="addFloor(2)">2</div>
            <div class="flex1 border-left" @click="addFloor(3)">3</div>
          </div>
          <div class="item-bottom">
            <div class="flex1 border-left" @click="addFloor('阁楼')">阁楼</div>
            <div class="flex1 border-left" @click="addFloor('夹层')">夹层</div>
          </div>
        </div>

        <div class="switch-floor" v-if="mode === '多层' && multi_data.length > 0">
          <div class="item-top">切换楼层</div>
          <div class="item-bottom">
            <div class="flex1" :class="{'border-left': index > 0, 'acolor': floor.floor === current_floor}"
              @click="switchFloor(floor.floor)" v-for="(floor,index) in multi_data" :key="floor.floor"
              @dblclick="delFloor(floor.floor)"
              @contextmenu="onFloorMenu($event, floor.floor)">{{floor.floor}}
            </div>
          </div>
        </div>

        <div class="wall">
          <div class="item-top">画墙</div>
          <div class="item-bottom">
            <div class="flex1" @click="setOperation('wall', 'real')">实际</div>
            <div class="flex1 border-left" @click="setOperation('wall', 'empty')">虚拟</div>
            <div class="flex1 border-left" @click="setOperation('wall', 'free')">赠送</div>
          </div>
        </div>

        <div class="chuang">
          <div class="item-top">画窗</div>
          <div class="item-bottom">
            <div class="flex1" @click="setOperation('chuang', 'light')">普通窗</div>
            <div class="flex1 border-left" @click="setOperation('chuang', 'dark')">光井窗</div>
          </div>
        </div>

        <div class="door">
          <div class="item-top">画门</div>
          <div class="item-bottom">
            <div class="flex2" @click="setOperation('door', '单开')">单开</div>
            <div class="flex2 border-left" @click="setOperation('door', '移门')">移门</div>
            <div class="flex2 border-left" @click="setOperation('door', '双开')">双开</div>
          </div>
        </div>

        <div class="cabinet">
          <div class="item-top">画柜子</div>
          <div class="item-bottom">
            <div class="flex2" @click="setOperation('cabinet', '一字型')">一字型</div>
            <div class="flex2 border-left" @click="setOperation('cabinet', 'L型')">L型</div>
            <div class="flex2 border-left" @click="setOperation('cabinet', 'U型')">U型</div>
          </div>
        </div>

        <div class="tool">
          <div class="item-top">工具</div>
          <div class="item-bottom">
            <div class="flex2" @click="toClear">清除</div>
            <div class="flex2 border-left"  @click="redrawAll({onlyUnderImage:true})" :class="{acolor: onlyUnderImage}">看底图</div>
            <div class="flex2 border-left"  @click="redrawAll({noUnderImage:true})" :class="{acolor: noUnderImage}">无底图</div>

            <div class="flex2" @click="adsorb = !adsorb" :class="{acolor: adsorb}">吸附</div>
            <div class="flex2 border-left" @click="orthogonal = !orthogonal" :class="{acolor: orthogonal}">正交</div>
            <div class="flex2 border-left" @click="setOperation('move')">移动</div>
          </div>
        </div>

        <div class="make">
          <div class="item-top">生成</div>
          <div class="item-bottom">
            <div class="flex1" @click="setOperation('define_room')">功能</div>
            <div class="flex1 border-left" @click="setOperation('define_free')">赠送</div>
            <div class="flex1 border-left" @click="setOperation('define_pass')">过渡</div>
          </div>
        </div>

        <div class="out-data">
          <div class="item-top">网络</div>
          <div class="item-bottom">
            <div class="flex1" @click="leadingOut()">上传</div>
            <!-- <div class="flex1 border-left" @click="updateCanvasData">保存</div>   -->
            <div class="flex1 border-left" @click="brightlight">保存</div>
            <!-- <div class="flex1 border-left">更新所有</div> -->
          </div>
        </div>

      </div>
      <!--/画图菜单-->

      <!--比例尺属性-->
      <div v-if="operation === 'ruler'">
        <div class="item-top">设置比例</div>
        <div class="item-bottom1">
          <div class="flex1">缩放至实际尺寸</div>
          <div class="flex1">
            实际尺寸
            <input class="item-four" v-model="sizeInUnderImage" v-focus @blur="keepFocus" @keydown.enter="setPxMmRate">
          </div>
        </div>
      </div>
      <!--/比例尺属性-->

      <!--墙属性-->
      <div v-if="operation === 'wall'">
        <div class="item-top">墙属性</div>
        <div class="item-bottom1">
          <div class="flex1" :class="{'acolor': wallRadius === 100/2}" @click="setWallRadius(100)">100</div>
          <div class="flex1" :class="{'acolor': wallRadius === 200/2}" @click="setWallRadius(200)">200</div>
        </div>
      </div>
      <div v-if="selectObj && selectObj.claass === 'wall' && operation !== 'wall'">
        <div class="item-top">墙属性</div>
        <div class="item-bottom1">
          <div class="flex1">{{selectObj.name}}</div>
          <div class="flex1" @click="changeWallRadius(100)">100</div>
          <div class="flex1" @click="changeWallRadius(200)">200</div>
          <div class="flex1" @click="delObj()">删除</div>
        </div>
      </div>
      <!--/墙属性-->

      <!--窗属性-->
      <div v-if="operation.includes('chuang')">
        <div class="item-top">画窗</div>
      </div>
      <div v-if="selectObj && selectObj.claass === 'chuang' && !operation.includes('chuang')">
        <div class="item-top">窗属性</div>
        <div class="item-bottom1">
          <div class="flex1">
            窗宽
            <input class="item-four" v-model="chuangWidth" disabled>
          </div>
          <div class="flex1">删除</div>
        </div>
      </div>
      <!--/墙属性-->

      <!--房间属性-->
      <div v-if="selectObj && selectObj.claass === 'room'">
        <div class="item-top">功能区域属性</div>
        <div class="item-bottom1">
          <div class="flex1">
            类型
            <select v-model="roomType" @change="onRoomTypeChange">
              <option value="未定义">未定义</option>
              <option value="主卧">主卧</option>
              <option value="次卧">次卧</option>
              <option value="书房">书房</option>
              <option value="客厅">客厅</option>
              <option value="餐厅">餐厅</option>
              <option value="客餐厅">客餐厅</option>
              <option value="厨房">厨房</option>
              <option value="主卫">主卫</option>
              <option value="客卫">客卫</option>
              <option value="阳台">阳台</option>
              <option value="露台">露台</option>
              <option value="花园">花园</option>
              <option value="辅助房间">辅助房间</option>
            </select>
          </div>
          <div class="flex1">
            名称
            <input class="item-four" v-model="roomName" @keydown.enter="onRoomNameChange">
          </div>
          <div class="flex1" v-if="selectObj.type === '阳台'">
            <button :class="{'acolor': selectObj.special === '不赠送'}" @click="specialBalcony">不赠送</button>
          </div>
          <div class="flex1" @click="delObj()">删除</div>
        </div>
      </div>
      <div v-if="selectObj && selectObj.claass === 'free'">
        <div class="item-top">赠送区域属性</div>
        <div class="item-bottom1">
          <div class="flex1">
            类型
            <select v-model="roomType" @change="onRoomTypeChange">
              <option value="未定义">未定义</option>
              <option value="设备平台">设备平台</option>
              <option value="飘窗">飘窗</option>
              <option value="阳台">阳台</option>
              <option value="消防前室">消防前室</option>
              <option value="露台">露台</option>
              <option value="上空">上空</option>
            </select>
          </div>
          <div class="flex1">
            名称
            <input class="item-four" v-model="roomName" @keydown.enter="onRoomNameChange">
          </div>
          <div class="flex1" @click="delObj()">删除</div>
        </div>
      </div>
      <div v-if="selectObj && selectObj.claass === 'pass'">
        <div class="item-top">过渡区域属性</div>
        <div class="item-bottom1">
          <div class="flex1">
            类型
            <select v-model="roomType" @change="onRoomTypeChange">
              <option value="未定义">未定义</option>
              <option value="室内楼梯">室内楼梯</option>
              <option value="室内电梯">室内电梯</option>
              <option value="走道">走道</option>
              <option value="玄关">玄关</option>
              <option value="储物间">储物间</option>
              <option value="电梯">电梯</option>
              <option value="采光井">采光井</option>
            </select>
          </div>
          <div class="flex1">
            名称
            <input class="item-four" v-model="roomName" @keydown.enter="onRoomNameChange">
          </div>
          <div class="flex1" @click="delObj()">删除</div>
        </div>
      </div>
      <!--/房间属性-->

      <!--门属性-->
      <div v-if="operation.includes('door')">
        <div class="item-top">画门</div>
      </div>
      <div v-if="selectObj && selectObj.claass === 'door' && !operation.includes('door')">
        <div class="item-top">门属性</div>
        <div class="item-bottom1">
          <div class="flex1">
            门宽
            <input class="item-four" v-model="doorWidth" disabled>
          </div>
          <div class="flex1">翻转</div>
          <div class="flex1">删除</div>
        </div>
      </div>
      <!--/门属性-->

      <!--柜子属性-->
      <div v-if="operation.includes('cabinet')">
        <div class="item-top">画柜子</div>
      </div>
      <div v-if="selectObj && selectObj.claass === 'cabinet' && !operation.includes('cabinet')">
        <div class="item-top" @click="turnCabinet">柜子属性</div>
        <div class="item-bottom1">
          <div class="flex1">
            宽度
            <input class="item-four"  v-focus @blur="keepFocus" v-model="cabinetWidth" @keydown.enter="setCabinetWidth">
          </div>
          <div class="flex1">
            长度
            <input class="item-four" v-model="cabinetLength" disabled>
          </div>
        </div>
      </div>
      <!--/柜子属性-->

    </div>
    <div id='wall_length' ref='input_wall' v-show="wallLength >= minWallLength && (drawing || (['door','chuang'].includes(operation) && !first))"
      :style="{'top': input_top, 'left': input_left}">
      <div contenteditable="true" @keydown="onWallLengthInput">
        {{wallLength}}
      </div>
    </div>
    <div class="image-background" v-if="outImageData">
      <div class="image-preview">
        <img :src="outImageData" preview="6" :width="outImageWidth" :height="outImageHeight">
        <div class="image-handle">
          <el-button type="primary" plain @click="outImageData = null">取消</el-button>
          <el-button type="success" plain @click="toUpdate">上传</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        realNameList: [], // 所有楼盘的数组
        real_estate_id: '', // 选中的楼盘id
        real_estate_name: '', // 选中的楼盘名
        apartmentList: [], // 户型数据列表
        selectOption: {}, // 选中的户型编号

        canvas: null, // 画布dom
        context: null, // 画布对象，有各种绘制方法
        cursor: 'default', // 鼠标样式
        canvasWidth: window.innerWidth - 20, // 画布标签宽度
        canvasHeight: window.innerHeight - 10, // 画布标签高度

        zoom: 1, // px_mm_rate,像素和毫米的比率, 默认是1(1px = 20mm)
        points: {}, // 点
        walls: {}, // 墙
        doors: {}, // 门
        chuangs: {}, // 窗
        areas: {}, // 各种封闭区域
        cabinets: {}, // 柜子

        colorConfig: { // 颜色配置
          wall: { // 墙
            length: '#ffffff', // 墙长度文字
            base: { // 未选中时
              real_draw: 'rgba(178,34,34, 0.3)', // 实际墙, 画的时候
              real_show: '#625c5c', // 实际墙, 用于展示
              free: 'rgba(78, 36, 210, 0.3)', // 赠送墙
              empty: 'rgba(180, 110, 77, 0.3)' // 虚拟墙
            },
            active: 'rgba(134, 188, 255, 0.5)', // 选中时
            line: 'rgba(180, 180, 180, 1)'
          },
          area: {
            base: {
              room: 'rgba(248, 248, 118, 0.7)', // 卧室
              toilet: 'rgba(132, 183, 251, 0.7)', // 厕所、厨房
              living: 'rgba(251, 251, 200, 0.8)', // 客餐厅、阳台
              pass: 'rgba(200, 200, 200, 0.7)', // 走道、玄关
              free: 'rgba(0,255,255, 0.5)',
              allFree: '#fe8a77', // 全赠送
              halfFree: 'rgba(98,138,206, 1)' // 半赠送
            },
            active: 'rgba(255, 160, 122, 0.5)' // 选中时
          },
          window: {
            light: {
              base: 'rgba(183, 210, 254, 1)',
              active: 'rgba(187, 255, 255, 1)'
            },
            dark: {
              base: 'rgba(98,138,206, 1)',
              active: 'rgba(187, 255, 255, 1)'
            }
          }, // 窗户
          door: { // 门
            base: 'rgba(255, 255, 255, 1)',
            active: 'rgba(59, 26, 255, 1)'
          },
          point: { // 点
            base: 'rgba(200, 200, 200, 0.8)',
            active: 'red'
          },
          cabinet: {
            base: 'rgba(248, 225, 118, 0.8)',
            active: 'rgba(0, 0, 255, 0.5)',
            dot: 'rgba(255, 217, 41, 0.5)',
            line: 'rgba(180, 180, 180, 1)'
          },
          sRed: '#fe8a77'
        },
        ruler: null, // 比例尺
        operation: 'none', // 当前进行的操作
        selectObj: null, // 点击选中的对象, 要操作的对象
        result: {}, // 操作比例尺时,判断的结果
        mousedown: null, // 存放按下点的坐标
        movingDot: null, // 画墙时在移动的哪个点
        underImage: null, // 底图,户型图
        drawing: false, // true标识正在画墙中 
        first: true, // 标记在画线段时，是第一次点击，还是第二次点击。true是第一次，false是第二次
        disabled: false, // 是不是不给画墙
        adsorb: true, // 是否吸附, 默认是吸附的
        orthogonal: true, // 是否正交, 默认是正交的
        sizeInUnderImage: '', // 底图中的尺寸, 用于设定px_mm_rate, 让墙和底图重合, 单位mm
        wallLength: '0', // 墙长度, 单位mm
        wallRadius: 0, // 墙半径, 单位mm
        wallType: '', // 墙类型
        input_top: 0,
        input_left: 0,
        chuangWidth: '', // 窗的宽度, 单位mm
        doorWidth: '', // 门的宽度, 单位mm
        roomType: '', // 房间类型
        roomName: '', // 房间名称
        doorShape: 'none', // 门类型：卧室、厕所、进户
        chuangType: '',
        cabinetShape: '',

        scale_rate: 1, // 最终的放大缩小比例
        translateX: 0, // 水平方向累计移动
        translateY: 0, // 竖直方向累计移动

        mode: '单层',
        multi_data: [], // 多层的数据
        current_floor: -5, // 多层时当前绘制的楼层
        outImageData: null, // 导出图片的base64数据
        outImageWidth: 'auto', // 导出图片显示的宽度
        outImageHeight: 'auto', // 导出图片显示的高度

        squareLevelParam: { // 不同房间有不同的舒适等级标准
          '主卧': [8, 12, 18],
          '次卧': [8, 12, 18],
          '书房': [5, 7, 9],
          '客餐厅': [20, 25, 36],
          '客厅': [10, 15, 20],
          '餐厅': [8, 12, 18],
          '厨房': [5, 6, 8],
          '主卫': [3.5, 4, 6],
          '客卫': [3.5, 4, 6],
          '阳台': [4, 6, 12],
        },
        roomSort: { // 不同房间展示的顺序
          '客餐厅': 20,
          '客厅': 20,
          '餐厅': 18,
          '主卧': 16,
          '次卧': 14,
          '书房': 12,
          '厨房': 10,
          '主卫': 8,
          '客卫': 6,
          '阳台': 4,
          '储物间': 3,
          '储物柜': 2.5,
          '玄关': 2,
          '走道': 1,
          '辅助房间': 11
        },

        accuracy: 0.01, // 精度

        minWallLength: 100, // 墙的最短长度
        minChuangWidth: 300, // 墙的最短长度

        currentTime: null, // 当前时间戳，用于生成唯一id

        lock: false,

        noUnderImage: false,
        onlyUnderImage: false,

        cabinet: null,
        cabinetLength: '',
        cabinetWidth: '',
        cabinetDot: -1,

        csbMap: {},

        imgScale: 1
      }
    },

    mounted() {
      this.init();
    },

    methods: {
      init() { // 初始化，进入页面就执行
        let that = this;

        // 画布和上下文对象, 全局共用
        that.canvas = document.getElementById('canvas');
        that.context = that.canvas.getContext('2d');

        // 注册事件
        that.canvas.oncontextmenu = that.onRightClick;
        document.onkeydown = that.onKeyDown;
        that.canvas.onmousewheel = that.onMouseWheel;
      },

      // <menu-event>
      searchEstate(search) {
        let that = this;
        if (search) {
          that.$axios.get(that.$url_prefix + 'searchAllEstateName', {
            params: {
              search: search
            }
          }).then(res => {
            that.realNameList = res.data.data;
          })
        }
      },
      chooseRealName(id) { // 选择要画的楼盘
        let that = this
        that.$axios.post(that.$url_prefix + 'queryOneData', {
          match: {
            id: id
          },
          db: 'WpRealEstateModel',
          projection: '-_id apartment real_estate_name'
        }).then(function (res) {
          console.log('查询楼盘信息返回', res);
          that.real_estate_name = res.data.data.real_estate_name;
          that.underImage = null;
          let keys = Object.keys(that.selectOption);
          for (let i = 0, len = keys.length; i < len; i++) {
            delete that.selectOption[keys[i]];
          }
          that.clear();
          if (res.data.data.apartment) {
            that.apartmentList = JSON.parse(res.data.data.apartment).imgList || [];
          } else {
            that.apartmentList = [];
          }
        }).catch(function (res) {
          that.$message.error('查询户型列表失败');
          console.log('查询户型列表失败', res)
        })
      },
      loadOnlineImage() { // 选择户型编号，自动加载网络图片
        let that = this
        let ctx = that.context
        let cvs = that.canvas
        console.log('that.selectOption', that.selectOption);
        if (JSON.stringify(that.selectOption) === "{}") {
          console.log('没有选择户型')
          return;
        }
        let img = new Image();
        img.setAttribute("crossOrigin", 'Anonymous')
        img.src = that.selectOption.img.replace('_mini.jpg', '')
        img.onload = function () {
          ctx.drawImage(img, 250, 0)
          that.underImage = img
          that.$axios.get(that.$url_prefix + 'queryApartmentDetail', {
            params: {
              real_estate_id: that.real_estate_id,
              serial_number: that.selectOption.imgName2
            }
          }).then(function (res) {
            console.log('查询户型数据返回', res)
            that.clear();
            that.multi_data = [];
            that.mode = '单层';
            if (res.data.success) {
              that.mode = res.data.data.mode || '单层'
              if (res.data.data.mode === '多层') {
                let multi_data = [];
                if (res.data.data.multi_data) {
                  multi_data = JSON.parse(res.data.data.multi_data)
                  // 判断一下是不是旧版
                  if (!multi_data[0].points && multi_data[0].walls.length > 0) {
                    for (let i=0; i<multi_data.length; i++) {
                      let temp = that.changeVersion(multi_data[i]);
                      temp.floor = multi_data[i].floor;
                      multi_data[i] = temp;
                    }
                  }
                  let first = multi_data[0];
                  that.current_floor = first.floor
                  if (first.zoom) {
                    that.zoom = first.zoom;
                  }
                  if (first.imgScale) {
                    that.imgScale = first.imgScale;
                  }
                  if (first.points) {
                    that.points = JSON.parse(JSON.stringify(first.points));
                  }
                  if (first.walls) {
                    that.walls = JSON.parse(JSON.stringify(first.walls));
                  }
                  if (first.doors) {
                    that.doors = JSON.parse(JSON.stringify(first.doors));
                  }
                  if (first.chuangs) {
                    that.chuangs = JSON.parse(JSON.stringify(first.chuangs));
                  }
                  if (first.areas) {
                    that.areas = JSON.parse(JSON.stringify(first.areas));
                  }
                  if (first.cabinets) {
                    that.cabinets = JSON.parse(JSON.stringify(first.cabinets));
                  }
                }
                that.multi_data = multi_data;
              } else {
                that.multi_data = []
                that.current_floor = -5
                if (res.data.data.canvas_data) {
                  let temp = JSON.parse(res.data.data.canvas_data)
                  // 判断一下是不是旧版
                  if (!temp.points && temp.walls.length > 0) {
                    temp = that.changeVersion(temp);
                  }
                  that.zoom = temp.zoom;
                  that.imgScale = temp.imgScale || 1;
                  that.points = temp.points || {};
                  that.areas = temp.areas || {};
                  that.walls = temp.walls || {};
                  that.chuangs = temp.chuangs || {};
                  that.doors = temp.doors || {};
                  that.cabinets = temp.cabinets || {};
                }
              }
              that.redrawAll();
            }
          }).catch(function (res) {
            that.$message.error('查询户型数据失败');
            console.log('查询户型数据失败', res)
          })
        }
      },
      onLocalImgClick(event) { // 点击本地，打开本地图片，在画布上绘制本地图片作为底图
        let that = this;
        let ctx = that.context;
        if (!event.target.files[0]) {
          console.log('没有选择图片')
          return
        }
        let file = event.target.files[0]
        if (!file.type.includes('image')) {
          alert('请确认图片格式')
          return;
        }
        that.clearClient();
        let reader = new FileReader();
        let img = new Image();
        reader.onload = function (e) {
          img.src = this.result
          img.onload = function () {
            ctx.drawImage(img, 250, 0)
            that.underImage = img
          }
        }
        reader.readAsDataURL(file);
      },
      setOperation(operation, type) { // 设定要进行的操作
        if (operation !== 'move') { 
          this.cursor = 'crosshair';
        }
        this.operation = operation;
        if (operation === 'wall') {
          this.first = true;
          this.wallType = type;
          if (!this.wallRadius) {
            this.setWallRadius(200);
          }
        } else if (operation === 'chuang') {
          this.first = true;
          this.chuangType = type;
          this.redrawAll();
        } else if (operation === 'door') {
          this.first = true;
          this.doorShape = type;
          this.redrawAll();
        } else if (operation === 'cabinet') {
          this.cabinetShape = type;
        }
      },
      setWallRadius(thickness) { // 设定墙半径, 单位mm, 传入墙厚度
        this.wallRadius = thickness / 2;
      },
      changeWallRadius(radius) {
        // let wall = this.walls[this.selectObj.id];
        // wall.radius = parseInt(radius / 2);
        // this.setVertex(wall);
      },
      onWallLengthInput(e) {
        let allow = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        let key = e.key;
        if (!allow.includes(key)) {
          e.preventDefault();
          if (key === 'Enter') {
            if (this.operation === 'wall') {
              this.addNewWall(e.target.innerText, 'enter');
            } else {
              this.addNewChuang(e.target.innerText, 'enter');
            }
          }
        }
      },
      addNewWall(wallLength, type) { // 新建一堵墙
        let length_mm = parseInt(wallLength);
        if (!length_mm || wallLength < this.minWallLength) { // 长度不能太小
          console.log('长度不对');
          return;
        }
        this.wallLength = '0';
        let length_px = wallLength / 20 / this.zoom;
        let start = this.mousedown;

        // 确定终点
        let end = {};
        if (type === 'click') {
          end = this.movingDot;
        } else {
          let temp_length = this.getLength(this.movingDot, start, 'mm');
          if (Math.abs(temp_length - length_mm) < this.accuracy) {
            end = this.movingDot;
          } else {
            let atan2_end = this.atan2(this.movingDot, start);
            end.x = Math.cos(atan2_end) * length_px + start.x;
            end.y = -Math.sin(atan2_end) * length_px + start.y;
            let mlength = this.adsorb? this.minWallLength: this.minWallLength/2;
            let dot = this.isInDot(end, mlength, 'mm');
            if (dot) {
              end = dot;
            } else {
              let result = this.isMoveInWalls(end, true);
              if (result) {
                end = result;
              }
            }
          }
        }

        let newWalls = [];
        let startWall = start.wall;
        let endWall = end.wall;

        if (!start.id) {
          start = new this.Point({
            that: this,
            x: start.x,
            y: start.y
          });
          this.points[start.id] = start;
        }
        if (!end.id) {
          end = new this.Point({
            that: this,
            x: end.x,
            y: end.y
          })
          this.points[end.id] = end;
        }

        // 判断端点是否在墙内
        if (startWall) {
          this.delObj(startWall, true);
          this.delWall(this.points[startWall.start_id], startWall.id);
          this.delWall(this.points[startWall.end_id], startWall.id);
          newWalls.push(
            new this.Wall({
              that: this,
              start_id: startWall.start_id,
              end_id: start.id,
              radius: startWall.radius,
              type: startWall.type
            })
          );
          newWalls.push(
            new this.Wall({
              that: this,
              start_id: start.id,
              end_id: startWall.end_id,
              radius: startWall.radius,
              type: startWall.type
            })
          );
        }
        if (endWall) {
          this.delObj(endWall, true);
          this.delWall(this.points[endWall.start_id], endWall.id);
          this.delWall(this.points[endWall.end_id], endWall.id);
          newWalls.push(
            new this.Wall({
              that: this,
              start_id: endWall.start_id,
              end_id: end.id,
              radius: endWall.radius,
              type: endWall.type
            })
          );
          newWalls.push(
            new this.Wall({
              that: this,
              start_id: end.id,
              end_id: endWall.end_id,
              radius: endWall.radius,
              type: endWall.type
            })
          );
        }

        // 判断有没有交叉的墙
        let crossList = [];
        let walls = Object.values(this.walls);
        walls.forEach(wall => {
          let cross = this.isAcross(this.points[wall.start_id], this.points[wall.end_id], start, end)
          if (cross) {
            cross.dis = this.getLength(cross, start, 'px');
            cross.wall = wall;
            crossList.push(cross);
            let point = new this.Point({
              that: this,
              x: cross.x,
              y: cross.y
            })
            this.points[point.id] = point;
            cross.pointId = point.id;
            this.delObj(wall, true);
            this.delWall(this.points[wall.start_id], wall.id);
            this.delWall(this.points[wall.end_id], wall.id);
          }
        })
        if (crossList.length === 0) {
          newWalls.push(
            new this.Wall({
              that: this,
              start_id: start.id,
              end_id: end.id,
              radius: this.wallRadius,
              type: this.wallType
            })
          );
        } else {
          crossList.sort((a, b) => a.dis - b.dis);
          // 起点连第一个，终点连最后一个
          newWalls.push(new this.Wall({
            that: this,
            start_id: start.id,
            end_id: crossList[0].pointId,
            radius: this.wallRadius,
            type: this.wallType
          }))
          newWalls.push(new this.Wall({
            that: this,
            start_id: crossList[crossList.length - 1].pointId,
            end_id: end.id,
            radius: this.wallRadius,
            type: this.wallType
          }))
          // 交点按顺序相连
          for (let i = 0; i < crossList.length - 1; i++) {
            newWalls.push(new this.Wall({
              that: this,
              start_id: crossList[i].pointId,
              end_id: crossList[i + 1].pointId,
              radius: this.wallRadius,
              type: this.wallType
            }))
          }
          crossList.forEach(cross => {
            newWalls.push(
              new this.Wall({
                that: this,
                start_id: cross.wall.start_id,
                end_id: cross.pointId,
                radius: cross.wall.radius,
                type: cross.wall.type
              })
            );
            newWalls.push(
              new this.Wall({
                that: this,
                start_id: cross.pointId,
                end_id: cross.wall.end_id,
                radius: cross.wall.radius,
                type: cross.wall.type
              })
            );
          })
        }

        // 要判断有没有完全重合的墙

        for (let i=0; i<newWalls.length; i++) {
          let wall = newWalls[i];
          let length = Math.round(this.getLength(this.points[wall.start_id],this.points[wall.end_id], 'mm'));
          if (length < 100) {
            console.log('有小于100的墙', length);
            return;
          }
        }

        newWalls.forEach(new_wall => {
          this.walls[new_wall.id] = new_wall;
          this.addWall(this.points[new_wall.start_id], new_wall.id);
          this.addWall(this.points[new_wall.end_id], new_wall.id);
          this.toSetVertex(new_wall);
        })

        this.mousedown = end;
        this.redrawAll();
      },
      addNewChuang(wallLength, type) { // 添加新的窗或者门
        let length_mm = parseInt(wallLength);
        if (!length_mm || wallLength < this.minChuangWidth) { // 长度不能太小
          console.log('长度不对');
          return;
        }
        this.wallLength = '0';
        let length_px = wallLength / 20 / this.zoom;
        let start = this.mousedown;

        let wall = start.wall;

        // 确定终点
        let end = {};
        if (type === 'click') {
          end = this.movingDot;
        } else {
          let temp_length = this.getLength(this.movingDot, start, 'mm');
          if (Math.abs(temp_length - length_mm) < this.accuracy) {
            end = this.movingDot;
          } else {
            let atan2_end = this.atan2(this.movingDot, start);
            end.x = Math.cos(atan2_end) * length_px + start.x;
            end.y = -Math.sin(atan2_end) * length_px + start.y;
          }
        }
        // 要判断是画窗还是画门
        if (this.operation === 'door') {
          let door = new this.Door({
            that: this,
            start: {
              x: start.x,
              y: start.y
            },
            end: {
              x: end.x,
              y: end.y
            },
            radius: wall.radius,
            shape: this.doorShape,
            wall_id: wall.id
          })
          this.setVertex(door);
          this.doors[door.id] = door;
          this.first = true;
        } else {
          let chuang = new this.Chuang({
            that: this,
            start: {
              x: start.x,
              y: start.y
            },
            end: {
              x: end.x,
              y: end.y
            },
            radius: wall.radius,
            type: this.chuangType,
            shape: '一字型',
            wall_id: wall.id
          })
          this.setVertex(chuang);
          this.chuangs[chuang.id] = chuang;
          this.first = true;
        }
        // 要判断有没有超出墙的范围

        this.redrawAll();
      },
      delObj(obj, isAdd) { // 删除
        if (!obj) {
          obj = this.selectObj;
          this.selectObj = null;
        }
        if (obj.claass === 'wall') {
          let start = this.points[obj.start_id];
          let end = this.points[obj.end_id];
          start.walls = start.walls.filter(x => x !== obj.id);
          end.walls = end.walls.filter(x => x !== obj.id);
          if (!isAdd && start.walls.length === 0) {
            delete this.points[start.id];
          } else {
            start.walls.forEach(x => {
              this.toSetVertex(this.walls[x]);
            })
          }
          if (!isAdd && end.walls.length === 0) {
            delete this.points[end.id];
          } else {
            end.walls.forEach(x => {
              this.toSetVertex(this.walls[x]);
            })
          }

          // 删除对应的门窗
          for (let key in this.chuangs) {
            if (this.chuangs[key].wall_id === obj.id) {
              delete this.chuangs[key];
            }
          }
          for (let key in this.doors) {
            if (this.doors[key].wall_id === obj.id) {
              delete this.doors[key];
            }
          }

          // 删除对应的房间
          for (let key in this.areas) {
            let find = this.areas[key].walls.find(x => x.id === obj.id);
            if (find) {
              delete this.areas[key];
            }
          }
        } else if (obj.claass === 'point') {
          obj.walls.forEach(x => this.delObj(this.walls[x]));
        }
        if (['room','free','pass'].includes(obj.claass)) {
          delete this.areas[obj.id];
        } else {
          delete this[obj.claass + 's'][obj.id];
        }
        this.redrawAll()
      },
      toClear() {
        let that = this;
        that.$confirm('确定要清除当前全部画的吗', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          that.clear();
        }).catch((err) => {
          console.log('cancel',err);
        });
      },
      onRulerClick() { // 点击比例尺
        this.operation = 'ruler'
        this.ruler = {
          start: {
            x: 400,
            y: 300
          },
          end: {
            x: 400,
            y: 700
          },
          radius: 200,
          claass: 'ruler'
        }
        this.selectObj = this.ruler
        this.drawRuler();
      },
      setPxMmRate() {
        let length_mm = parseInt(this.sizeInUnderImage);
        if (!length_mm) {
          return;
        }
        let length_px = this.getLength(this.ruler.start, this.ruler.end);
        //默认缩放比例是1，1px等于20毫米
        this.zoom = length_mm / (length_px * 20);
        let walls = Object.values(this.walls);
        for (let i = 0, len = walls.length; i < len; i++) {
          this.setVertex(walls[i], {
            zoom: this.zoom,
            points: this.points,
            walls: this.walls
          });
        }
        this.operation = 'none';
        this.sizeInUnderImage = '';
        this.selectObj = null;
        this.redrawAll();
      },
      // 改变模式, 单层或者多层
      changeMode(mode) {
        this.mode = mode;
      },
      // 多层模式, 增加楼层
      addFloor(floor) {
        if (this.multi_data.length === 0) {
          this.current_floor = floor;
        }
        let match = this.multi_data.find(x => x.floor === floor);
        if (!match) {
          this.multi_data.push({
            floor: floor
          })
        }
      },
      // 多层模式, 切换楼层
      switchFloor(floor) {
        if (floor === this.current_floor) {
          return;
        }
        let index = this.multi_data.findIndex(x => x.floor === this.current_floor);
        let next = this.multi_data.findIndex(x => x.floor === floor);
        this.multi_data[index].zoom = this.zoom;
        this.multi_data[index].points = JSON.parse(JSON.stringify(this.points));
        this.multi_data[index].walls = JSON.parse(JSON.stringify(this.walls));
        this.multi_data[index].doors = JSON.parse(JSON.stringify(this.doors));
        this.multi_data[index].chuangs = JSON.parse(JSON.stringify(this.chuangs));
        this.multi_data[index].areas = JSON.parse(JSON.stringify(this.areas));
        this.multi_data[index].cabinets = JSON.parse(JSON.stringify(this.cabinets));

        if (this.multi_data[next].zoom) {
          this.zoom = this.multi_data[next].zoom;
        }
        if (this.multi_data[next].points) {
          this.points = JSON.parse(JSON.stringify(this.multi_data[next].points));
        } else {
          this.points = {};
        }
        if (this.multi_data[next].walls) {
          this.walls = JSON.parse(JSON.stringify(this.multi_data[next].walls));
        } else {
          this.walls = {};
        }
        if (this.multi_data[next].doors) {
          this.doors = JSON.parse(JSON.stringify(this.multi_data[next].doors));
        } else {
          this.doors = {};
        }
        if (this.multi_data[next].chuangs) {
          this.chuangs = JSON.parse(JSON.stringify(this.multi_data[next].chuangs));
        } else {
          this.chuangs = {};
        }
        if (this.multi_data[next].areas) {
          this.areas = JSON.parse(JSON.stringify(this.multi_data[next].areas));
        } else {
          this.areas = {};
        }
        if (this.multi_data[next].cabinets) {
          this.cabinets = JSON.parse(JSON.stringify(this.multi_data[next].cabinets));
        } else {
          this.cabinets = {};
        }
        this.redrawAll();
        this.current_floor = floor;
      },
      onFloorMenu(e, floor) {
        e.preventDefault();
        let that = this;
        that.$prompt('楼层重命名', '', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValue: ''
        }).then(({
          value
        }) => {
          value = value && value.trim()
          if (value) {
            if (value !== '夹层' && value !== '阁楼') {
              value = Number(value);
            }
          }
          if (['阁楼','夹层',-1,-2,1,2,3].includes(value)) {
            let match = that.multi_data.find(x => x.floor === value);
            if (match) {
              that.$message.error('楼层重复');
            } else {
              let index = that.multi_data.findIndex(x => x.floor === floor);
              that.multi_data[index].floor = value;
            }
          } else {
            that.$message.error('输入错误');
          }
        }).catch(() => {
          console.log('取消修改');
        })
      },
      // 删除楼层
      delFloor(floor) {
        let that = this;
        that.$confirm(`确定删除楼层(${floor})吗`, '提示', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (floor !== this.current_floor) {
            return;
          }
          let index = this.multi_data.findIndex(x => x.floor === floor);
          this.multi_data.splice(index, 1);
          if (this.multi_data.length === 0) {
            return;
          }
          if (this.multi_data[0].zoom) {
            this.zoom = this.multi_data[0].zoom;
          }
          if (this.multi_data[0].points) {
            this.points = JSON.parse(JSON.stringify(this.multi_data[0].points));
          } else {
            this.points = {};
          }
          if (this.multi_data[0].walls) {
            this.walls = JSON.parse(JSON.stringify(this.multi_data[0].walls));
          } else {
            this.walls = {};
          }
          if (this.multi_data[0].doors) {
            this.doors = JSON.parse(JSON.stringify(this.multi_data[0].doors));
          } else {
            this.doors = {};
          }
          if (this.multi_data[0].chuangs) {
            this.chuangs = JSON.parse(JSON.stringify(this.multi_data[0].chuangs));
          } else {
            this.chuangs = {};
          }
          if (this.multi_data[0].areas) {
            this.areas = JSON.parse(JSON.stringify(this.multi_data[0].areas));
          } else {
            this.areas = {};
          }
          if (this.multi_data[0].cabinets) {
            this.cabinets = JSON.parse(JSON.stringify(this.multi_data[0].cabinets));
          } else {
            this.cabinets = {};
          }
          this.redrawAll();
          this.current_floor = this.multi_data[0].floor
        }).catch((err) => {
          console.log('cancel',err);
        });
      },
      onRoomTypeChange() {
        this.selectObj.type = this.roomType
        this.roomName = this.roomType
        this.selectObj.name = this.roomName
        this.redrawAll()
      },
      onRoomNameChange() {
        this.selectObj.name = this.roomName
        this.redrawAll()
      },
      specialBalcony() {
        if (this.selectObj.special === '不赠送') {
          this.$set(this.selectObj, 'special', '')
        } else {
          this.$set(this.selectObj, 'special', '不赠送')
        }
      },
      setCabinetWidth() {
        let value = parseInt(this.cabinetWidth);
        if (value) {
          this.selectObj.width = value;
          let target = this.setCabinetDots(this.selectObj);
          this.redrawAll();
        }
      },
      // </menu-event>

      // <class>
      Point(option) {
        //绑定一个唯一的id作为标识
        this.id = option.that.createId(); //that 是vue实例
        this.x = option.x;
        this.y = option.y;
        this.walls = []; // 用到这个点的墙
        this.claass = 'point';
      },
      addWall(target, wall) {
        if (wall && !target.walls.includes(wall)) {
          target.walls.push(wall);
        }
      },
      delWall(target, wall) {
        if (wall) {
          target.walls = target.walls.filter(x => {
            return x !== wall;
          })
        }
      },
      Wall(option) {
        this.id = option.that.createId() //that 是vue实例
        this.start_id = option.start_id //起始点id
        this.end_id = option.end_id //结束点id
        this.radius = option.radius //墙体半径
        this.type = option.type // real(实墙),free(赠送墙),empty(虚拟墙)
        if (option.type === 'real') {
          this.name = '实际墙'
        } else if (option.type === 'free') {
          this.name = '赠送墙'
        } else if (option.type === 'empty') {
          this.name = '虚拟墙'
        }
        this.claass = 'wall'
      },
      Chuang(option) {
        this.id = option.that.createId() //that 是vue实例
        this.start = option.start //起始点 {x,y}
        this.end = option.end //结束点 {x,y}
        this.radius = option.radius //墙体半径
        this.type = option.type // light(明窗),dark(暗窗)
        this.shape = option.shape // U型, L型, 一字型, 弧形
        this.control = option.control; // 二次贝塞尔曲线的控制点
        this.wall_id = option.wall_id //在哪个墙上
        this.claass = 'chuang';
      },
      Door(option) {
        this.id = option.that.createId() //that 是vue实例
        this.start = option.start //起始点 {x,y}
        this.end = option.end //结束点 {x,y}
        this.radius = option.radius //墙体半径
        this.shape = option.shape // 单开、双开、移门
        this.wall_id = option.wall_id //在哪个墙上
        this.claass = 'door'
      },
      Area(option) {
        this.id = option.that.createId() //that 是vue实例
        this.walls = option.walls;
        this.type = '未定义' //房间类型，卧室、卫生间、、、
        this.name = '未命名'
        this.square = option.that.getSquare(option.walls, option.that.zoom)
        this.center = option.center;
        this.claass = option.claass;
      },
      Cabinet(option) {
        this.id = option.that.createId() //that 是vue实例
        this.path = option.path // 柜子宽度
        this.width = option.width // 柜子宽度
        this.shape = option.shape // 一字型, L型, U型
        this.claass = 'cabinet'
      },
      // </class>

      // <draw>
      drawRuler() {
        let ctx = this.context;
        let ruler = this.ruler;
        let radius_mm = ruler.radius;
        let start = ruler.start;
        let end = ruler.end;
        let {
          A,
          B,
          C,
          D
        } = this.getRectVertex(start, end, radius_mm);
        ruler.A = A;
        ruler.B = B;
        ruler.C = C;
        ruler.D = D;

        // 画矩形
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.lineTo(C.x, C.y);
        ctx.lineTo(D.x, D.y);
        ctx.closePath();
        ctx.fillStyle = 'red';
        ctx.fill();

        // 画圆圈
        let radius_px = radius_mm * 0.6 / 20;
        ctx.strokeStyle = "#808080"
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(start.x, start.y, radius_px, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(end.x, end.y, radius_px, 0, 2 * Math.PI);
        ctx.stroke();
      },
      drawMovingDot(dot) { // 画移动点
        let ctx = this.context;
        let radius = 8;
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.strokeStyle = '#444444';
        ctx.lineWidth = 2 / this.scale_rate;
        if (dot.id || dot.wall) {
          radius = 7;
          ctx.fillStyle = 'blue';
          ctx.strokeStyle = '#ffffff';
        }
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius / this.scale_rate, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
      },
      drawLine(ends, start) { // 画对齐线, 水平垂直线
        let ctx = this.context;
        let cvs = this.canvas;
        let height = cvs.height / this.scale_rate;
        let width = cvs.width / this.scale_rate;

        for (let i = 0, len = ends.length; i < len; i++) {
          let temp = ends[i];
          let dis = this.getLength(start, temp, 'mm');
          if (dis < this.minWallLength) {
            continue
          }
          let end = {};
          if (Math.abs(temp.x - start.x) < this.accuracy) { // 竖直
            end.x = start.x;
            if (temp.y > start.y) { // 向下
              end.y = height - this.translateY
            } else { // 向上
              end.y = -this.translateY
            }
          } else if (Math.abs(temp.y - start.y) < this.accuracy) { // 水平
            end.y = start.y;
            if (temp.x > start.x) { // 向右
              end.x = width - this.translateX
            } else { // 向左
              end.x = -this.translateX
            }
          } else {
            continue;
          }

          // 画线
          ctx.beginPath();
          ctx.lineWidth = 1;
          ctx.strokeStyle = 'rgb(120, 120, 120)'
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();

          // 画点
          if (!this.drawing) {
            this.drawMovingDot(start);
          }
        }
      },
      drawDrawingWall(end) { // 画动态的墙
        let ctx = this.context;
        let start = this.mousedown;
        let length = this.getLength(start, end, 'mm').toFixed(0); // 墙的长度 单位mm
        this.wallLength = length;
        let div_input_box = this.$refs.input_wall;
        if (!div_input_box) {
          return;
        }
        this.$nextTick(() => {
          let div_input = div_input_box.children[0];
          let selection = window.getSelection();
          let range = document.createRange();
          range.selectNodeContents(div_input);
          selection.removeAllRanges();
          selection.addRange(range);
        })
        let type = this.wallType;
        let {
          A,
          B,
          C,
          D,
          E
        } = this.getRectVertex(start, end, this.wallRadius, true);
        let offsetX = div_input_box.offsetWidth / 2;
        let offsetY = div_input_box.offsetHeight / 2;
        this.input_top = E.y - offsetY + 'px';
        this.input_left = E.x - offsetX + 'px';

        if (length < this.minWallLength) {
          return;
        }

        // 画矩形
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.lineTo(C.x, C.y);
        ctx.lineTo(D.x, D.y);
        ctx.closePath();
        let colorKey = this.wallType;
        if (colorKey === 'real') {
          colorKey = 'real_draw'
        }
        ctx.fillStyle = this.colorConfig.wall.base[colorKey];
        ctx.fill();

        // 画中轴线
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgb(120, 120, 120)'
        ctx.setLineDash([10 / this.zoom]);
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.restore();
      },
      drawDrawingChuang(end) { // 画动态窗和门
        let ctx = this.context;
        let start = this.mousedown;
        let length = this.getLength(start, end, 'mm').toFixed(0); // 墙的长度 单位mm
        this.wallLength = length;
        let div_input_box = this.$refs.input_wall;
        if (!div_input_box) {
          return;
        }
        this.$nextTick(() => {
          let div_input = div_input_box.children[0];
          let selection = window.getSelection();
          let range = document.createRange();
          range.selectNodeContents(div_input);
          selection.removeAllRanges();
          selection.addRange(range);
        })
        let type = this.wallType;
        let {
          A,
          B,
          C,
          D,
          E
        } = this.getRectVertex(start, end, start.wall.radius, true);
        let offsetX = div_input_box.offsetWidth / 2;
        let offsetY = div_input_box.offsetHeight / 2;
        this.input_top = E.y - offsetY + 'px';
        this.input_left = E.x - offsetX + 'px';

        if (length < this.minWallLength) {
          return;
        }

        // 画矩形
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.lineTo(C.x, C.y);
        ctx.lineTo(D.x, D.y);
        ctx.closePath();
        if (this.operation === 'chuang') {
          let colorKey = this.chuangType;
          ctx.fillStyle = this.colorConfig.window[colorKey].base;
        } else {
          ctx.fillStyle = 'rgba(180,180,180,0.5)';
        }
        
        ctx.fill();

        // 画中轴线
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgb(120, 120, 120)'
        ctx.setLineDash([10 / this.zoom]);
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.restore();
      },
      drawPoint(target) { // 画点
        let ctx = this.context;
        let radius = 6;
        ctx.beginPath();
        if (target.walls.length > 1) {
          ctx.fillStyle = this.colorConfig.point.base;
        } else {
          ctx.fillStyle = '#ffd929';
        }
        if (this.selectObj && this.selectObj.id === target.id) {
          ctx.fillStyle = this.colorConfig.point.active;
          radius = 7;
        }
        ctx.arc(target.x, target.y, radius / this.scale_rate, 0, 2 * Math.PI);
        ctx.fill();
      },
      drawWall(target, points, over) { // 画固定的墙
        let ctx = this.context;
        let start = points[target.start_id];
        let end = points[target.end_id];
        let A = target.A;
        let B = target.B;
        let C = target.C;
        let D = target.D;

        // 画矩形
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.lineTo(end.x, end.y);
        ctx.lineTo(C.x, C.y);
        ctx.lineTo(D.x, D.y);
        ctx.closePath();
        if (over) { //  最终出结果
          ctx.fillStyle = this.colorConfig.wall.base.real_show;
        } else {
          if (this.selectObj && this.selectObj.id === target.id) {
            ctx.fillStyle = this.colorConfig.wall.active;
          } else {
            let colorKey = target.type;
            if (colorKey === 'real') {
              colorKey = 'real_draw'
            }
            ctx.fillStyle = this.colorConfig.wall.base[colorKey];
          }
        }
        ctx.fill();
        
        if (target.type == 'empty') {
          // 画中轴线
          ctx.beginPath()
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.closePath();
          ctx.lineWidth = 1;
          ctx.strokeStyle = 'red';
          ctx.stroke();
        }
      },
      drawLength(target, points, zoom, areas) { // 画墙的长度文字
        let ctx = this.context;
        let radius = target.radius;
        let fontSize = 12 / zoom;
        ctx.font = fontSize + 'px SimHei';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#000000';
        ctx.lineWidth = 1;
        let start = points[target.start_id];
        let end = points[target.end_id];
        let length = this.getLength(start, end, 'mm', zoom).toFixed(0); // 墙的长度 单位mm
        let tempE = {
          x: (start.x + end.x) / 2,
          y: (start.y + end.y) / 2
        }
        let atan2_end = this.atan2(end, start);
        let atan2_AB = atan2_end + Math.PI / 2;
        if (atan2_AB > Math.PI) {
          atan2_AB = atan2_AB - Math.PI * 2;
        }
        let roomIds = this.isOutWall(target, areas);
        let roomCenter;
        if (roomIds.length === 1) {
          roomCenter = areas[roomIds[0]].center;
        }
        let E = {};
        if (atan2_AB < 0 || Math.abs(atan2_AB-Math.PI)<Number.EPSILON) {
          E.x = -Math.cos(atan2_AB) * (((radius + 55) / 20) / zoom) + tempE.x;
          E.y = Math.sin(atan2_AB) * (((radius + 55) / 20) / zoom) + tempE.y;
          if (roomCenter) {
            if (!this.isAcross(start, end, E, roomCenter)) {
              E.x = Math.cos(atan2_AB) * (((radius + 65)*2 / 20) / zoom) + tempE.x;
              E.y = -Math.sin(atan2_AB) * (((radius + 65)*2 / 20) / zoom) + tempE.y;
            }
          }
        } else {
          E.x = Math.cos(atan2_AB) * (((radius + 55) / 20) / zoom) + tempE.x;
          E.y = -Math.sin(atan2_AB) * (((radius + 55) / 20) / zoom) + tempE.y;
          if (roomCenter) {
            if (!this.isAcross(start, end, E, roomCenter)) {
              E.x = -Math.cos(atan2_AB) * (((radius + 65)*2 / 20) / zoom) + tempE.x;
              E.y = Math.sin(atan2_AB) * (((radius + 65)*2 / 20) / zoom) + tempE.y;
            }
          }
        }
        ctx.save();
        ctx.translate(E.x, E.y);
        if (atan2_end >= Math.PI / 2 || atan2_end < -Math.PI / 2) {
          ctx.rotate(-atan2_end + Math.PI);
        } else {
          ctx.rotate(-atan2_end);
        }
        ctx.translate(-E.x, -E.y);
        ctx.fillText(length, E.x, E.y);
        ctx.restore();
      },
      drawChuang(target) {
        let ctx = this.context;
        let start = target.start;
        let end = target.end;
        let A = target.A;
        let B = target.B;
        let C = target.C;
        let D = target.D;

        // 画矩形
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.lineTo(C.x, C.y);
        ctx.lineTo(D.x, D.y);
        ctx.closePath();
        ctx.strokeStyle = this.colorConfig.wall.base.real_show;
        let type = target.type || 'light';
        if (target.id && this.selectObj && target.id === this.selectObj.id) {
          ctx.fillStyle = this.colorConfig.window[type].active;
        } else {
          ctx.fillStyle = this.colorConfig.window[type].base;
        }
        ctx.lineWidth = 0.1
        ctx.fill();
        ctx.stroke();

        // 画中轴线
        ctx.beginPath()
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.closePath();
        ctx.stroke();
      },
      drawDoor(target) {
        if (target.type === '进户') {
          this.drawEnterMark(target);
        }
        this.drawOneDoor(target);
      },
      drawEnterMark(target) { // 入户门画个三角形
        let that = this
        let zoom = this.zoom;
        let ctx = that.context
        let cvs = that.canvas
        let start = target.start;
        let end = target.end;
        let center = [(start.x + end.x) / 2, (start.y + end.y) / 2];
        let radius = target.radius / 20 / zoom;
        let direction = '水平';
        if (Math.abs(start.x - end.x) < this.accuracy) {
          direction = '竖直'
        }
        let m, n, p, roomCenter; // 三角形的三个点, 和户门所在区域的中心点
        let areas = Object.values(that.areas);
        findOutDoorArea:
          for (let i = 0, len = areas.length; i < len; i++) {
            for (let k = 0, leng = areas[i].walls.length; k < leng; k++) {
              if (areas[i].type !== '花园' && areas[i].walls[k].id === target.wall_id) {
                if (areas[i].center) {
                  roomCenter = areas[i].center;
                } else {
                  return;
                }
                break findOutDoorArea
              }
            }
          }
        if (!roomCenter) {
          return;
        }
        let step = 15 / zoom;
        if (direction === '竖直') {
          if (center[0] < roomCenter.x) {
            m = [center[0] - radius - step, center[1]]
            n = [center[0] - 3 * radius - step, center[1] - 2 * radius]
            p = [center[0] - 3 * radius - step, center[1] + 2 * radius]
          } else {
            m = [center[0] + radius + step, center[1]]
            n = [center[0] + 3 * radius + step, center[1] - 2 * radius]
            p = [center[0] + 3 * radius + step, center[1] + 2 * radius]
          }
        } else {
          if (center[1] < roomCenter.y) {
            m = [center[0], center[1] - radius - step]
            n = [center[0] - 2 * radius, center[1] - 3 * radius - step]
            p = [center[0] + 2 * radius, center[1] - 3 * radius - step]
          } else {
            m = [center[0], center[1] + radius + step]
            n = [center[0] - 2 * radius, center[1] + 3 * radius + step]
            p = [center[0] + 2 * radius, center[1] + 3 * radius + step]

          }
        }
        ctx.beginPath();
        ctx.moveTo(m[0], m[1])
        ctx.lineTo(n[0], n[1])
        ctx.lineTo(p[0], p[1])
        ctx.closePath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";
        ctx.fillStyle = 'red';
        ctx.stroke();
        ctx.fill();
      },
      drawOneDoor(target) {
        let ctx = this.context;
        let start = target.start;
        let end = target.end;
        let A = target.A;
        let B = target.B;
        let C = target.C;
        let D = target.D;

        //画矩形
        ctx.beginPath()
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.lineTo(C.x, C.y);
        ctx.lineTo(D.x, D.y);
        ctx.closePath();
        ctx.lineWidth = 0.1;
        if (target.id && this.selectObj && target.id === this.selectObj.id) {
          ctx.fillStyle = this.colorConfig.door.active;
        } else {
          ctx.fillStyle = this.colorConfig.door.base;
        }
        ctx.strokeStyle = 'black'
        ctx.fill();
        ctx.stroke();
      },
      drawArea(target, cData, option) { // 画房间等区域
        let ctx = this.context;
        let center = target.center;
        let walls = target.walls;

        let points = cData.points;
        let zoom = cData.zoom;

        option = option || {};
        let isFinish = option.isFinish;  // 出结果
        let nfree = option.nfree;  // 要画赠送
        let fillType = option.fillType;  // 填充色类型，没有就是默认; 

        // 画色块
        if (!isFinish || !nfree) {
          ctx.beginPath();
          if (isFinish) {
            ctx.moveTo(points[walls[0].start_id].x, points[walls[0].start_id].y);
            for (let i = 1; i < walls.length; i++) {
              ctx.lineTo(points[walls[i].start_id].x, points[walls[i].start_id].y);
            }
          } else {
            ctx.moveTo(walls[0].D.x, walls[0].D.y);
            ctx.lineTo(walls[0].C.x, walls[0].C.y);
            for (let i = 1; i < walls.length; i++) {
              ctx.lineTo(walls[i].D.x, walls[i].D.y);
              ctx.lineTo(walls[i].C.x, walls[i].C.y);
            }
          }
          ctx.closePath();
          if (target.id && this.selectObj && target.id === this.selectObj.id) {
            ctx.fillStyle = this.colorConfig.area.active;
            ctx.fill();
          } else {
            if (target.claass !== 'free') {
              if (target.claass === 'pass') {
                ctx.fillStyle = this.colorConfig.area.base.pass;
              } else {
                if (target.type === '主卧' || target.type === '次卧' || target.type === '书房') {
                  ctx.fillStyle = this.colorConfig.area.base.room;
                } else if (target.type === '客厅' || target.type === '餐厅' || target.type === '客餐厅' || target.type ===
                  '阳台') {
                  ctx.fillStyle = this.colorConfig.area.base.living;
                } else if (target.type === '主卫' || target.type === '客卫' || target.type === '厨房') {
                  ctx.fillStyle = this.colorConfig.area.base.toilet;
                } else {
                  ctx.fillStyle = this.colorConfig.area.base.living;
                }
              }
              
              if (target.type !== '电梯') {
                ctx.fill();
              }
            } else {
              if (!isFinish && target.type === '未定义') {
                ctx.fillStyle = this.colorConfig.area.base.free;
                ctx.fill();
              }
            }
          }
        }

        // 画虚线
        if (!isFinish || (isFinish && nfree)) {
          ctx.save();
          if ((target.claass === 'free' || target.type === '阳台' || target.type === '露台' || target.type === '花园') && target
            .special !== '不赠送' && target.type !== '未定义') {
            ctx.beginPath();
            ctx.setLineDash([10 / zoom])
            ctx.moveTo(points[walls[0].start_id].x, points[walls[0].start_id].y);
            for (let i = 1; i < walls.length; i++) {
              ctx.lineTo(points[walls[i].start_id].x, points[walls[i].start_id].y);
            }
            ctx.closePath();
            ctx.lineWidth = 4 / zoom;
            if (target.type === '阳台') {
              ctx.strokeStyle = this.colorConfig.area.base.halfFree;
            } else {
              ctx.strokeStyle = this.colorConfig.area.base.allFree;
            }
            ctx.stroke();
          }
          ctx.restore();
        }

        // 画文字 , 优劣势
        if (!isFinish || (isFinish && nfree) || (fillType && fillType != '窗深比')) {
          let fontSize1 = 14 / zoom
          let fontSize2 = 17 / zoom
          ctx.font = fontSize2 + 'px SimHei';
          ctx.textAlign = 'center'
          ctx.fillStyle = "black";
          if (target.claass !== 'free') {
            ctx.fillText(target.name, center.x, center.y - 9 / zoom);
          }
          if (fillType) {
            return;
          }
          if (target.type !== '电梯' && target.claass !== 'free') {
            ctx.fillText(target.square + "m²", center.x, center.y + 7 / zoom);
          }
          ctx.font = fontSize1 + 'px SimHei';
          let param = this.squareLevelParam[target.type]
          if (param) {
            let level = '空间' + this.getSquareLevel(target.square, target.type);
            if (target.claass !== 'free') {
              ctx.fillText(level, center.x, center.y + 21 / zoom);
            }
            let {bay,depth} = this.getBayDepth(target, cData);
            if (bay) {
              if (target.type === '主卧' || target.type === '次卧') {
                if (depth <= 3.3) {
                  ctx.fillText('进深偏小', center.x, center.y + 35 / zoom);
                }
              } else if (target.type === '阳台' && target.claass === 'room') {
                if (depth <= 1) {
                  ctx.fillText('进深偏小', center.x, center.y + 35 / zoom);
                } else if (bay >= 5) {
                  ctx.fillText('超宽阳台', center.x, center.y + 35 / zoom);
                }
              }
            }
          }
        }

        // 窗深比
        let csbObj = this.csbMap[target.id];
        if (fillType == '窗深比' && csbObj) {
          let cMap = {
            'A级': '#c6fe77',
            'B级': '#edfe77',
            'C级': '#fedd77',
            'D级': '#feb477'
          }
          let center = target.center;
          let dot = {
            x: center.x - 28,
            y: center.y - 13
          }
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, 4, 0, 2 * Math.PI);
          ctx.fillStyle = cMap[csbObj.csbl];
          ctx.fill();
          let fontSize1 = 14 / zoom
          let fontSize2 = 17 / zoom
          ctx.font = fontSize2 + 'px SimHei';
          ctx.textAlign = 'center'
          ctx.fillStyle = "black";
          ctx.fillText(csbObj.csb, center.x, center.y - 9 / zoom);
          ctx.font = fontSize1 + 'px SimHei';
          ctx.fillText(csbObj.csbl, center.x, center.y + 7 / zoom);
          ctx.fillText(target.name, center.x, center.y + 21 / zoom);
        }
      },
      redrawAll(option) { // 全部重画
        let ctx = this.context;
        option = option || {};
        this.clearClient();
        let cOrd = Boolean(this.operation == 'chuang' || this.operation == 'door');

        let scale_rate = option.scale_rate || 1,
            translateX = option.translateX || 0,
            translateY = option.translateY || 0;
        ctx.translate(translateX, translateY);
        ctx.scale(scale_rate, scale_rate)

        this.scale_rate *= scale_rate
        this.translateX += translateX
        this.translateY += translateY
        this.translateX /= scale_rate
        this.translateY /= scale_rate

        if (option.noUnderImage) {
          this.noUnderImage = !this.noUnderImage;
        } else if (option.onlyUnderImage) {
          this.onlyUnderImage = !this.onlyUnderImage;
        }

        // 画底图
        // let underImage = this.underImage;
        // if (underImage && !this.noUnderImage) { // 不看底图
        //   ctx.drawImage(underImage, 250, 0, underImage.width*this.imgScale, underImage.height*this.imgScale);
        // }

        if (this.onlyUnderImage) { // 只看底图
          return;
        }

        // 画墙
        if (true) {
          for (let key in this.walls) {
            this.drawWall(this.walls[key], this.points);
          }
        }

        // 画窗
        for (let key in this.chuangs) {
          this.drawChuang(this.chuangs[key]);
        }
        
        // 画门
        for (let key in this.doors) {
          this.drawDoor(this.doors[key]);
        }

        // 画点
        for (let key in this.points) {
          this.drawPoint(this.points[key]);
        }

        // 画房间
        // if (!cOrd && !option.noArea && (!this.selectObj || this.selectObj.claass !== 'cabinet')) {
        //   for (let key in this.areas) {
        //     this.drawArea(this.areas[key], {
        //       zoom: this.zoom,
        //       points: this.points,
        //       chuangs: this.chuangs,
        //       doors: this.doors
        //     });
        //   }
        // }

        // 画墙的长度
        for (let key in this.walls) {
          let wall = this.walls[key];
          if (wall.type === 'real') {
            this.drawLength(wall, this.points, this.zoom, this.areas);
          }
        }

        // 画柜子
        // for (let key in this.cabinets) {
        //   this.drawCabinet(this.cabinets[key]);
        // }

        // 画比例尺
        if (this.operation === 'ruler') {
          this.drawRuler()
        }

        console.log('redraw all')
      },
      drawNotes(dot, m, n, p, k) {
        let ctx = this.context;
        ctx.fillStyle = 'white';
        ctx.fillRect(m, n, p, k);
        let A,B,C,D;
        A = [dot[0] - 110 / this.zoom, dot[1]];
        B = [dot[0] - 60 / this.zoom, dot[1]];
        C = [dot[0] + 10 / this.zoom, dot[1]];
        D = [dot[0] + 60 / this.zoom, dot[1]];

        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([10 / this.zoom])
        ctx.moveTo(A[0], A[1]);
        ctx.lineTo(B[0], B[1]);
        ctx.lineWidth = 8 / this.zoom;
        ctx.strokeStyle = this.colorConfig.area.base.allFree;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(C[0], C[1]);
        ctx.lineTo(D[0], D[1]);
        ctx.strokeStyle = this.colorConfig.area.base.halfFree;
        ctx.stroke();
        ctx.restore();

        let fontSize = 14 / this.zoom
        ctx.font = fontSize + 'px SimHei';
        ctx.textAlign = 'start'
        ctx.fillStyle = "black";
        ctx.fillText('全赠送', B[0] + 5/this.zoom, B[1] + 5/this.zoom);
        ctx.fillText('半赠送', D[0] + 5/this.zoom, D[1] + 5/this.zoom);
      },
      drawDrawingCabinet(position) {
        this.redrawAll({noArea:true});
        let cabinet = null;
        let shape = this.cabinetShape;
        // 找出点所在的房间
        let area = this.isInAreas(position);
        if (area && area.claass !== 'free') {
          let walls = area.walls;
          if (shape === '一字型') {
            // 找出最近的一堵墙
            let minDis = null;
            let cWall = null;
            walls.forEach(wall => {
              let start = this.points[wall.start_id];
              let end = this.points[wall.end_id];
              let center = {
                x: (start.x + end.x) / 2,
                y: (start.y + end.y) / 2
              }
              let dis = this.getLength(position, center, 'px');
              if (minDis) {
                if (dis < minDis) {
                  minDis = dis;
                  cWall = wall;
                }
              } else {
                minDis = dis;
                cWall = wall;
              }
            })
            cabinet = this.setCabinetDots({
              path: [cWall.C, cWall.D],
              shape: '一字型',
              width: 600
            }, position);
          } else if (shape === 'L型') {
            // 找出一个角
            let minDis = null;
            let wall1 = null;
            let wall2 = null;
            walls.forEach((wall, index) => {
              let end = this.points[wall.end_id];
              let next = walls[index + 1] || walls[0];
              let result = this.tangle(this.points[wall.end_id], this.points[wall.start_id], this.points[next.end_id]);
              let dis;
              if (Math.abs(result - Math.PI / 2) < this.accuracy) { // 内L
                dis = this.getLength(position, end, 'px');
              } else if (Math.abs(result - Math.PI * 1.5) < this.accuracy) { // 外L
                dis = this.getLength(position, end, 'px');
              }
              if (dis) {
                if (minDis) {
                  if (dis < minDis) {
                    minDis = dis;
                    wall1 = wall;
                    wall2 = next;
                  }
                } else {
                  minDis = dis;
                  wall1 = wall;
                  wall2 = next;
                }
              }
            })
            cabinet = this.setCabinetDots({
              path: [wall1.D, wall1.C, wall2.C],
              shape: 'L型',
              width: 600
            }, position);
          } else if (shape === 'U型') {
            let minDis = null;
            let cWall = null;
            let index = null;
            walls.forEach((wall,i) => {
              let start = this.points[wall.start_id];
              let end = this.points[wall.end_id];
              let center = {
                x: (start.x + end.x) / 2,
                y: (start.y + end.y) / 2
              }
              let dis = this.getLength(position, center, 'px');
              if (minDis) {
                if (dis < minDis) {
                  minDis = dis;
                  cWall = wall;
                  index = i;
                }
              } else {
                minDis = dis;
                cWall = wall;
                index = i;
              }
            })
            let A,B,C,D;
            let len = walls.length;
            // 往后找 C,D
            let next = index + 1 == len? 0: index + 1;
            let nWall = cWall;
            for (let i=next; i<len; i++) {
              if (C && D) {
                break;
              }
              let wall = walls[i];
              let angle = this.tangle(this.points[nWall.end_id], this.points[nWall.start_id], this.points[wall.end_id]);
              if (Math.abs(angle - Math.PI/2) < this.accuracy) {
                if (!C) {
                  C = nWall.C;
                } else {
                  D = nWall.C;
                }
              } else if (Math.abs(angle - Math.PI*1.5) < this.accuracy) {
                if (!C) {
                  break;
                } else {
                  D = nWall.C;
                }
              }
              nWall = wall;
              if (i == len - 1) {
                i = -1;
              }
            }
            // 往前找 A,B
            let pre = index - 1 < 0? len - 1: index - 1;
            let pWall = cWall;
            for (let i=pre; i > -1; i--) {
              if (A && B) {
                break;
              }
              let wall = walls[i];
              let angle = this.tangle(this.points[wall.end_id], this.points[wall.start_id], this.points[pWall.end_id]);
              if (Math.abs(angle - Math.PI/2) < this.accuracy) {
                if (!B) {
                  B = wall.C;
                } else {
                  A = wall.C;
                }
              } else if (Math.abs(angle - Math.PI*1.5) < this.accuracy) {
                if (!B) {
                  break;
                } else {
                  A = wall.C;
                }
              }
              pWall = wall;
              if (i == 0) {
                i = len;
              }
            }
            if (A && B && C && D) {
              cabinet = this.setCabinetDots({
                path: [A, B, C, D],
                shape: 'U型',
                width: 600
              }, position);
            }
          }
        }
        if (cabinet) {
          this.cabinet = cabinet;
          this.drawCabinet(cabinet);
        } else {
          this.cabinet = null;
        }
      },
      drawCabinet(target) {
        let ctx = this.context;
        let path = target.path;
        let shape = target.shape;
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i=1; i<path.length; i++) {
          ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.closePath();
        let active = this.selectObj && this.selectObj.id === target.id;
        if (active) {
          ctx.fillStyle = this.colorConfig.cabinet.active;
        } else {
          ctx.fillStyle = this.colorConfig.cabinet.base;
        }
        ctx.lineWidth = 1;
        ctx.strokeStyle = this.colorConfig.cabinet.line;
        ctx.stroke();
        ctx.fill();

        if (active) {
          let A,B;
          if (shape === '一字型') {
            A = path[0];
            B = path[1];
          } else if (shape === 'L型') {
            A = path[0];
            B = path[2];
          } else if (shape === 'U型') {
            A = path[0];
            B = path[3];
          }
          let radius = 7;
          ctx.fillStyle = this.colorConfig.cabinet.dot;
          ctx.beginPath();
          ctx.arc(A.x, A.y, radius / this.scale_rate, 0, 2 * Math.PI);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(B.x, B.y, radius / this.scale_rate, 0, 2 * Math.PI);
          ctx.fill();
        }
      },
      // </draw>

      // <judge>
      isTheSameDot(A, B) { // 判断两个点是否重合
        // Number.EPSILON
        let distance = this.getLength(A, B, 'px');
        if (distance < this.accuracy) { // 点重合了
          return true;
        } else {
          return false;
        }
      },
      isInDot(position, radius, unit) {
        let dots = Object.values(this.points);
        if (dots.length > 0) {
          for (let i = 0, len = dots.length; i < len; i++) {
            let dis = this.getLength(position, dots[i], unit);
            if (dis < radius) {
              return dots[i];
            }
          }
        }
        return false;
      },
      isClickInWalls(position) {
        let walls = Object.values(this.walls);
        if (walls.length > 0) {
          for (let i = 0, len = walls.length; i < len; i++) {
            if (this.isInRect(position, walls[i])) {
              return walls[i];
            }
          }
        }
        return false;
      },
      isMoveInWalls(position, isAdd) {
        let walls = Object.values(this.walls);
        if (walls.length > 0) {
          for (let i = 0, len = walls.length; i < len; i++) {
            let tempWall = JSON.parse(JSON.stringify(walls[i]));
            tempWall.radius = this.adsorb ? (isAdd ? this.minWallLength : 150) : this.minWallLength/2;
            this.setVertex(tempWall, {
              zoom: this.zoom,
              points: this.points,
              walls: this.walls
            });
            if (this.isInRect(position, tempWall)) {
              let dot = this.getDotInWall(tempWall, position);
              dot.wall = walls[i];
              return dot;
            }
          }
        }
        return false;
      },
      isInRect(position, target) {
        let ctx = this.context;
        let cvs = this.canvas;
        let height = cvs.height;
        let width = cvs.width;
        let lines;
        if (Array.isArray(target)) {
          lines = target;
        } else {
          let A = target.A;
          let B = target.B;
          let C = target.C;
          let D = target.D;
          let start,end;
          if (target.start_id) {
            start = this.points[target.start_id];
            end = this.points[target.end_id];
            lines = [{
                start: start,
                end: A
              },
              {
                start: A,
                end: B
              },
              {
                start: B,
                end: end
              },
              {
                start: end,
                end: C
              },
              {
                start: C,
                end: D
              },
              {
                start: D,
                end: start
              }
            ]
          } else {
            lines = [
              {
                start: A,
                end: B
              },
              {
                start: B,
                end: C
              },
              {
                start: C,
                end: D
              },
              {
                start: D,
                end: A
              }
            ]
          }
        }
        
        let lineUp = {
          start: position,
          end: {
            x: position.x,
            y: 0
          }
        }
        let lineDown = {
          start: position,
          end: {
            x: position.x,
            y: 100000
          }
        }
        let lineLeft = {
          start: position,
          end: {
            x: 0,
            y: position.y
          }
        }
        let lineRight = {
          start: position,
          end: {
            x: 100000,
            y: position.y
          }
        }

        let resultUp = false,
          resultDown = false,
          resultLeft = false,
          resultRight = false;
        for (let i = 0, len = lines.length; i < len; i++) {
          if (this.isAcross(lineUp.start, lineUp.end, lines[i].start, lines[i].end)) {
            resultUp = true;
            break;
          }
        }
        if (!resultUp) {
          return false;
        }
        for (let i = 0, len = lines.length; i < len; i++) {
          if (this.isAcross(lineDown.start, lineDown.end, lines[i].start, lines[i].end)) {
            resultDown = true;
            break;
          }
        }
        if (!resultDown) {
          return false;
        }
        for (let i = 0, len = lines.length; i < len; i++) {
          if (this.isAcross(lineLeft.start, lineLeft.end, lines[i].start, lines[i].end)) {
            resultLeft = true;
            break;
          }
        }
        if (!resultLeft) {
          return false;
        }
        for (let i = 0, len = lines.length; i < len; i++) {
          if (this.isAcross(lineRight.start, lineRight.end, lines[i].start, lines[i].end)) {
            resultRight = true;
            break;
          }
        }
        if (!resultRight) {
          return false;
        }
        return true;
      },
      isInDoor(position) {
        let doors = Object.values(this.doors);
        if (doors.length > 0) {
          for (let i = 0, len = doors.length; i < len; i++) {
            if (this.isInRect(position, doors[i])) {
              return doors[i];
            }
          }
        }
        return false;
      },
      isInChuang(position) {
        let chuangs = Object.values(this.chuangs);
        if (chuangs.length > 0) {
          for (let i = 0, len = chuangs.length; i < len; i++) {
            if (this.isInRect(position, chuangs[i])) {
              return chuangs[i];
            }
          }
        }
        return false;
      },
      isInAreas(position) {
        let areas = Object.values(this.areas);
        let result;
        for (let i = 0; i < areas.length; i++) {
          if (this.isInArea(position, areas[i])) {
            if (!result) {
              result = areas[i];
            } else if (areas[i].claass === 'free') {
              result = areas[i];
              break;
            }
          }
        }
        return result;
      },
      isInArea(position, target) {
        let list = [];
        target.walls.forEach(x => {
          list.push({
            start: this.points[x.start_id],
            end: this.points[x.end_id]
          })
        })
        return this.isInRect(position, list);
      },
      isInRuler(position) { // 是否在比例尺中
        let ruler = this.ruler;
        let radius = ruler.radius;
        let start = ruler.start;
        let end = ruler.end;
        let result = {
          type: 'out'
        };

        if (this.getLength(position, start, 'mm') <= radius * 0.7) {
          result = {
            select: start,
            another: end,
            type: 'dot',
          }
        } else if (this.getLength(position, end, 'mm') <= radius * 0.7) {
          result = {
            select: end,
            another: start,
            type: 'dot',
          }
        } else if (this.isInRect(position, ruler)) {
          result = {
            type: 'in'
          }
        }
        console.log('result', result);
        return result;
      },
      isAcross(start1, end1, start2, end2) { // 判断两条线段是否有交点
        let dot = this.getIntersection(start1, end1, start2, end2);
        if (dot && dot.cross) {
          let length1 = this.getLength(start1, end1, 'px');
          let length2 = this.getLength(start2, end2, 'px');
          let dis1 = this.getLength(dot, start1, 'px');
          let dis2 = this.getLength(dot, end1, 'px');
          if (Math.abs(length1 - dis1 - dis2) < this.accuracy) {
            let dis3 = this.getLength(dot, start2, 'px');
            let dis4 = this.getLength(dot, end2, 'px');
            if (Math.abs(length2 - dis3 - dis4) < this.accuracy) {
              return dot;
            }
          }
        }
        return false;
      },
      isInCabinets(position) {
        let cabinets = Object.values(this.cabinets);
        for (let i = 0; i < cabinets.length; i++) {
          let list = [];
          let path = cabinets[i].path;
          for (let k=0; k<path.length-1; k++) {
            list.push({
              start: path[k],
              end: path[k + 1]
            })
          }
          list.push({
            start: path[path.length-1],
            end: path[0]
          })
          if (this.isInRect(position, list)) {
            return cabinets[i];
          }
        }
        return false;
      },
      dotOnLine(dot, M, N) { // 点dot在线段MN上
        let length = this.getLength(M, N, 'px');
        let dis1 = this.getLength(dot, M, 'px');
        let dis2 = this.getLength(dot, N, 'px');
        if (Math.abs(length - dis1 - dis2) < this.accuracy) {
          return true;
        }
        return false;
      },
      // </judge>

      // <util>
      createId() { // 生成一个唯一的id
        if (!this.currentTime) {
          this.currentTime = Date.now();
        }
        return Number(Math.random().toString().substr(3, 3) + this.currentTime++).toString(36);
      },
      windowToCanvas(x, y) { // 坐标转换
        let cvs = this.canvas;
        let box = cvs.getBoundingClientRect();
        let result = {};
        result.x = (x - box.left * (cvs.width / box.width)) / this.scale_rate - this.translateX;
        result.y = (y - box.top * (cvs.height / box.height)) / this.scale_rate - this.translateY;
        return result;
      },
      canvasToWindow(x, y) { // 坐标转换
        let cvs = this.canvas;
        let box = cvs.getBoundingClientRect();
        let result = {};
        result.x = (x + this.translateX) * this.scale_rate + box.left * (cvs.width / box.width);
        result.y = (y + this.translateY) * this.scale_rate + box.top * (cvs.height / box.height);
        return result;
      },
      clear() { // 清空画布数据
        console.log('清除所有');
        this.points = {};
        this.walls = {};
        this.doors = {};
        this.chuangs = {};
        this.areas = {};
        this.cabinets = {};
        this.redrawAll();
      },
      setMovingDot(position) { // 计算移动点的位置, 分正交和非正交
        this.redrawAll();
        let mlength = this.adsorb ? 150 : this.minWallLength / 2;
        let radius = mlength / 20 / this.zoom;
        let xdot, ydot;
        let dots = Object.values(this.points);
        let start = this.mousedown;

        function judgeOrthogonal(drawing,orthogonal,start,end,accuracy) {
          if (drawing && orthogonal) {
            if (Math.abs(start.x - end.x) > accuracy && Math.abs(start.y - end.y) > accuracy) {
              return false;
            }
          }
          return true;
        }

        if (this.drawing && this.orthogonal) {
          let atan2_abs = Math.abs(this.atan2(position, start));
          if (atan2_abs < Math.PI / 4 || atan2_abs > Math.PI * 0.75) {
            position = {
              x: position.x,
              y: start.y
            };
          } else {
            position = {
              x: start.x,
              y: position.y
            };
          }
        }

        let dot = this.isInDot(position, mlength, 'mm');
        if (dot) {
          position = dot;
        } else {
          dot = this.isMoveInWalls(position);
          let wall;
          if (dot) {
            position = dot;
            wall = dot.wall;
          }

          // 水平垂直线
          if (this.drawing && !this.orthogonal) {
            let temp1 = null;
            if (start.x - radius < position.x && position.x < start.x + radius) {
              temp1 = {
                x: start.x,
                y: position.y
              }
            } else if (start.y - radius < position.y && position.y < start.y + radius) {
              temp1 = {
                x: position.x,
                y: start.y
              }
            }
            if (temp1) {
              if (wall) {
                let temp2 = this.getIntersection(temp1, start, this.points[wall.start_id], this.points[wall.end_id]);
                if (temp2) {
                  temp2.wall = wall;
                  position = temp2;
                  this.drawLine([start], position);
                }
              } else {
                position = temp1;
                this.drawLine([start], position);
              }
            }
          }

          // 对齐线
          for (let i = 0, len = dots.length; i < len; i++) {
            if (!this.drawing || dots[i].id !== start.id) {
              if (!xdot) {
                if (dots[i].x - radius < position.x && position.x < dots[i].x + radius) {
                  xdot = dots[i];
                }
              }
              if (!ydot) {
                if (dots[i].y - radius < position.y && position.y < dots[i].y + radius) {
                  ydot = dots[i];
                }
              }
            }
          }
          if (xdot && ydot) {
            if (xdot.id !== ydot.id) {
              let temp1 = {
                x: xdot.x,
                y: ydot.y
              };
              // 判断一下在不在点内
              let tempd = this.isInDot(temp1, 1, 'px');
              let tempw = this.isClickInWalls(temp1);
              if (!tempd && !tempw && judgeOrthogonal(this.drawing, this.orthogonal, start, temp1, this.accuracy)) {
                position = temp1;
                this.drawLine([xdot, ydot], position);
              }
            }
          } else {
            let onedot = null;
            let temp1 = null;
            if (xdot) {
              onedot = xdot;
              temp1 = {
                x: xdot.x,
                y: position.y
              }
            } else if (ydot) {
              onedot = ydot;
              temp1 = {
                x: position.x,
                y: ydot.y
              }
            }
            if (temp1) {
              if (wall) {
                let temp2 = this.getIntersection(temp1, onedot, this.points[wall.start_id], this.points[wall.end_id]);
                if (temp2 && temp2.cross) {
                  temp2.wall = wall;
                  position = temp2;
                  this.drawLine([onedot], position);
                }
              } else {
                if (this.drawing) {
                  let temp2 = this.getIntersection(temp1, onedot, start, temp1);
                  if (temp2 && judgeOrthogonal(this.drawing, this.orthogonal, start, temp1, this.accuracy)) {
                    position = temp1
                    this.drawLine([onedot], position);
                  }
                } else {
                  if (judgeOrthogonal(this.drawing, this.orthogonal, start, temp1, this.accuracy)) {
                    position = temp1
                    this.drawLine([onedot], position);
                  }
                }
              }
            }
          }
        }

        // 画动态墙和点
        if (this.drawing) {
          this.drawDrawingWall(position);
        }
        if (this.drawing || dot) {
          this.drawMovingDot(position);
        }

        this.movingDot = position;
      },
      setChuangDot(position) { // 计算动态窗和门的点
        if (!this.first) {
          let wall = this.mousedown.wall;
          let pt1 = this.points[wall.start_id];
          let pt2 = this.points[wall.end_id];
          this.movingDot = this.getFoot(pt1, pt2, position)
          this.redrawAll();
          this.drawDrawingChuang(this.movingDot);
        }
      },
      getFoot(pt1, pt2, position) { // 垂足
        // 看是不是水平或竖直的
        let result;
        let direction = '';
        if (Math.abs(pt1.x - pt2.x) < this.accuracy) {
          direction = '竖直';
        } else if (Math.abs(pt1.y - pt2.y) < this.accuracy) {
          direction = '水平';
        }
        if (direction) {
          if (direction === '竖直') {
            result = {
              x: pt1.x,
              y: position.y
            }
          } else {
            result = {
              x: position.x,
              y: pt1.y
            }
          }
        } else {
          let k = ( pt2.y - pt1.y ) / (pt2.x - pt1.x );
          let x = ( k**2 * pt1.x + k * (position.y - pt1.y ) + position.x ) / ( k**2 + 1);
          let y = k * ( x - pt1.x) + pt1.y;
          result = {
            x: x,
            y: y
          }
        }
        return result;
      },
      atan2(A, B) { // 计算x轴到点A转过的弧度, B为坐标原点, 返回的是-π 到 π 之间的弧度
        // 注意canvas的Y轴方向是反的
        let result = Math.atan2(B.y - A.y, A.x - B.x);
        return result;
      },
      getLength(A, B, unit, zoom) { // 计算线段长度, 单位是px或mm, 返回浮点数
        zoom = zoom || this.zoom;
        let px = ((A.x - B.x) ** 2 + (A.y - B.y) ** 2) ** 0.5;
        if (unit === 'mm') {
          let mm = px * 20 * zoom;
          return mm;
        }
        return px;
      },
      keepFocus(e) {
        e.target.focus();
      },
      toSetVertex(target) { // 给新增的墙和相连的墙 或删除墙相连的墙 计算四个端点
        let cData = {
          zoom: this.zoom,
          points: this.points,
          walls: this.walls
        }
        this.setVertex(target, cData);
        let start = this.points[target.start_id];
        let end = this.points[target.end_id];
        let startWalls = start.walls.filter((x) => {
          return x !== target.id;
        })
        let endWalls = end.walls.filter((x) => {
          return x !== target.id;
        })
        if (startWalls.length > 0) {
          for (let i = 0, len = startWalls.length; i < len; i++) {
            this.setVertex(this.walls[startWalls[i]], cData);
          }
        }
        if (endWalls.length > 0) {
          for (let i = 0, len = endWalls.length; i < len; i++) {
            this.setVertex(this.walls[endWalls[i]], cData);
          }
        }
      },
      setVertex(target, cData, ignore) { // 计算一堵墙的四个端点
        let start, end;
        let zoom = cData && cData.zoom;
        if (target.claass === 'wall') {
          start = cData.points[target.start_id];
          end = cData.points[target.end_id];
        } else {
          start = target.start;
          end = target.end;
        }
        let {
          A,
          B,
          C,
          D
        } = this.getRectVertex(start, end, target.radius, false, zoom);

        if (target.claass === 'wall') {
          let startWalls = [];
          let endWalls = [];
          start.walls.forEach(x => {
            if (ignore) {
              if (cData.walls[x].type === 'real') {
                startWalls.push(x);
              }
            } else {
              startWalls.push(x);
            }
          })
          end.walls.forEach(x => {
            if (ignore) {
              if (cData.walls[x].type === 'real') {
                endWalls.push(x);
              }
            } else {
              endWalls.push(x);
            }
          })
          if (startWalls.length > 1) { // 需要重新计算A, D
            if (startWalls.length === 2) {
              let anotherWall = cData.walls[startWalls.filter((x) => x !== target.id)[0]];
              let anotherDot = null;
              if (anotherWall.start_id === start.id) {
                anotherDot = cData.points[anotherWall.end_id];
              } else {
                anotherDot = cData.points[anotherWall.start_id];
              }
              let vertex = this.getRectVertex(anotherDot, start, anotherWall.radius, false, zoom);
              A = this.getIntersection(A, B, vertex.A, vertex.B) || A;
              D = this.getIntersection(C, D, vertex.C, vertex.D) || D;
            } else {
              let the_atan2 = this.atan2(end, start);
              let minus = []; // 小于0
              let positive = []; // 大于0

              for (let i = 0, len = startWalls.length; i < len; i++) {
                let tempid = startWalls[i];
                if (tempid === target.id) {
                  continue;
                }
                let anotherWall = JSON.parse(JSON.stringify(cData.walls[tempid]));
                let anotherDot = null;
                if (anotherWall.start_id === start.id) {
                  anotherDot = cData.points[anotherWall.end_id];
                } else {
                  anotherDot = cData.points[anotherWall.start_id];
                }
                let ano_atan2 = this.atan2(anotherDot, start);
                let between = the_atan2 - ano_atan2;
                if (between > Math.PI) {
                  between = between - Math.PI * 2
                }
                anotherWall.between = between
                anotherWall.anotherDot = anotherDot
                if (between > 0) {
                  positive.push(anotherWall);
                } else {
                  minus.push(anotherWall);
                }
              }
              positive.sort((a, b) => {
                return a.between - b.between;
              })
              minus.sort((a, b) => {
                return b.between - a.between;
              })

              let wall_AB = null;
              let wall_CD = null;
              if (minus.length === 0) {
                wall_AB = positive[positive.length - 1];
                wall_CD = positive[0];
              } else if (positive.length === 0) {
                wall_AB = minus[0];
                wall_CD = minus[minus.length - 1];
              } else {
                wall_AB = minus[0];
                wall_CD = positive[0];
              }
              let AB_vertex = this.getRectVertex(wall_AB.anotherDot, start, wall_AB.radius, false, zoom);
              let CD_vertex = this.getRectVertex(wall_CD.anotherDot, start, wall_CD.radius, false, zoom);
              A = this.getIntersection(A, B, AB_vertex.A, AB_vertex.B) || A;
              D = this.getIntersection(C, D, CD_vertex.C, CD_vertex.D) || D;
            }
          }
          if (endWalls.length > 1) { // 需要重新计算B, C
            if (endWalls.length === 2) {
              let anotherWall = cData.walls[endWalls.filter((x) => x !== target.id)[0]];
              let anotherDot = null;
              if (anotherWall.start_id === end.id) {
                anotherDot = cData.points[anotherWall.end_id];
              } else {
                anotherDot = cData.points[anotherWall.start_id];
              }
              let vertex = this.getRectVertex(end, anotherDot, anotherWall.radius, false, zoom);
              B = this.getIntersection(A, B, vertex.A, vertex.B) || B;
              C = this.getIntersection(C, D, vertex.C, vertex.D) || C;
            } else {
              let the_atan2 = this.atan2(start, end);
              let minus = []; // 小于0
              let positive = []; // 大于0
              let wall_AB = null;
              let wall_CD = null;
              for (let i = 0, len = endWalls.length; i < len; i++) {
                let tempid = endWalls[i];
                if (tempid === target.id) {
                  continue;
                }
                let anotherWall = JSON.parse(JSON.stringify(cData.walls[tempid]));
                let anotherDot = null;
                if (anotherWall.start_id === end.id) {
                  anotherDot = cData.points[anotherWall.end_id];
                } else {
                  anotherDot = cData.points[anotherWall.start_id];
                }
                let ano_atan2 = this.atan2(anotherDot, end);
                let between = the_atan2 - ano_atan2;
                if (between > Math.PI) {
                  between = between - Math.PI * 2
                }
                anotherWall.between = between
                anotherWall.anotherDot = anotherDot
                if (between > 0) {
                  positive.push(anotherWall);
                } else {
                  minus.push(anotherWall);
                }
              }
              positive.sort((a, b) => {
                return a.between - b.between;
              })
              minus.sort((a, b) => {
                return b.between - a.between;
              })
              if (minus.length === 0) {
                wall_AB = positive[0];
                wall_CD = positive[positive.length - 1];
              } else if (positive.length === 0) {
                wall_AB = minus[minus.length - 1];
                wall_CD = minus[0];
              } else {
                wall_AB = positive[0];
                wall_CD = minus[0];
              }
              let AB_vertex = this.getRectVertex(end, wall_AB.anotherDot, wall_AB.radius, false, zoom);
              let CD_vertex = this.getRectVertex(end, wall_CD.anotherDot, wall_CD.radius, false, zoom)
              B = this.getIntersection(A, B, AB_vertex.A, AB_vertex.B) || B;
              C = this.getIntersection(C, D, CD_vertex.C, CD_vertex.D) || C;
            }
          }
        }
        target.A = A;
        target.B = B;
        target.C = C;
        target.D = D;
      },
      getRectVertex(start, end, radius, needE, zoom) { // 获取矩形的四个端点, 和显示长度输入框的点
        zoom = zoom || this.zoom;
        radius = radius / 20 / zoom; // 单位转换为px
        let A = {},
          B = {},
          C = {},
          D = {}; // 矩形的4个点, 从左往右画, A左上,B右上,C右下,D左下
        let E = {}; // 显示长度输入框的点
        let atan2_end = this.atan2(end, start);
        let atan2_AB = atan2_end + Math.PI / 2;
        if (atan2_AB > Math.PI) {
          atan2_AB = atan2_AB - Math.PI * 2;
        }
        A.x = Math.cos(atan2_AB) * radius + start.x;
        A.y = -Math.sin(atan2_AB) * radius + start.y;
        B.x = Math.cos(atan2_AB) * radius + end.x;
        B.y = -Math.sin(atan2_AB) * radius + end.y;
        C.x = -Math.cos(atan2_AB) * radius + end.x;
        C.y = Math.sin(atan2_AB) * radius + end.y;
        D.x = -Math.cos(atan2_AB) * radius + start.x;
        D.y = Math.sin(atan2_AB) * radius + start.y;
        if (needE) {
          let tempE = {
            x: (start.x + end.x) / 2,
            y: (start.y + end.y) / 2
          }
          E.x = Math.cos(atan2_AB) * (50 / this.scale_rate) + tempE.x;
          E.y = -Math.sin(atan2_AB) * (50 / this.scale_rate) + tempE.y;
          E = this.canvasToWindow(E.x, E.y);
        }
        return {
          A,
          B,
          C,
          D,
          E
        }
      },
      getVerticalLine(A, B) { // 求AB中垂线
        let center = {
          x: (A.x + B.x) / 2,
          y: (A.y + B.y) / 2
        }
        let tempx,tempy;
        if (Math.abs(A.y - B.y) < 0.01) {
          tempx = center.x;
          tempy = center.y - 10; // 10是随便写的
        } else {
          let x1 = A.x,
              y1 = A.y,
              x2 = B.x,
              y2 = B.y;
          tempx = center.x - 10;
          tempy = -(x1-x2)/(y1-y2)*tempx+(y1+y2)/2+(x1-x2)/(y1-y2)*(x1+x2)/2;
        }
        let temp = {
          x: tempx,
          y: tempy
        }
        return [center,temp];
      },
      getIntersection(A, B, M, N) { // 两条直线的交点
        // A,B 一条线; M,N 一条线
        // 要考虑分母为零的情况
        // 平行就没有交点, return false
        // 先判断有没有端点重合
        if (this.isTheSameDot(A, M) || this.isTheSameDot(A, N)) {
          return {
            x: A.x,
            y: A.y
          };
        }
        if (this.isTheSameDot(B, M) || this.isTheSameDot(B, N)) {
          return {
            x: B.x,
            y: B.y
          };
        }
        let x, y; // 交点坐标
        if (Math.abs(B.x - A.x) < this.accuracy && Math.abs(N.x - M.x) < this.accuracy) {
          return false;
        } else if (Math.abs(B.x - A.x) < this.accuracy) {
          x = B.x;
          let s = (N.y - M.y) / (N.x - M.x);
          y = s * (x - N.x) + N.y;
        } else if (Math.abs(N.x - M.x) < this.accuracy) {
          x = N.x;
          let t = (B.y - A.y) / (B.x - A.x);
          y = t * (x - B.x) + B.y;
        } else {
          let t = (B.y - A.y) / (B.x - A.x);
          let s = (N.y - M.y) / (N.x - M.x);
          if (Math.abs(t - s) < this.accuracy) {
            return false;
          }
          x = (t * B.x - B.y - s * N.x + N.y) / (t - s);
          y = t * (x - B.x) + B.y;
        }

        return {
          x,
          y,
          cross: true
        };
      },
      getDotInWall(target, position) {
        let result = {};
        let start = this.points[target.start_id];
        let end = this.points[target.end_id];
        let l = this.getLength(start, end, 'px');
        let a = this.getLength(start, position, 'px');
        let b = this.getLength(end, position, 'px');
        let dis = (b ** 2 - ((b ** 2 - a ** 2 + l ** 2) / (2 * l)) ** 2) ** 0.5;
        let atan2_end = this.atan2(end, start);
        let atan2_AB = atan2_end + Math.PI / 2;
        if (atan2_AB > Math.PI) {
          atan2_AB = atan2_AB - Math.PI * 2;
        }
        let judge = this.atan2(position, start) - atan2_end;
        if (judge < -Math.PI) {
          judge = judge + Math.PI * 2;
        } else if (judge > Math.PI) {
          judge = judge - Math.PI * 2;
        }
        if (judge > 0) {
          result.x = position.x - Math.cos(atan2_AB) * dis;
          result.y = position.y + Math.sin(atan2_AB) * dis;
        } else {
          result.x = position.x + Math.cos(atan2_AB) * dis;
          result.y = position.y - Math.sin(atan2_AB) * dis;
        }

        return result;
      },
      clearClient() { // 清除可视区域的画面
        let ctx = this.context;
        let cvs = this.canvas;
        ctx.clearRect(-this.translateX, -this.translateY, cvs.width / this.scale_rate, cvs.height / this.scale_rate);
      },
      // 定义房间
      defineRoom(position, typeList) {
        //找到点击点左侧最近的一堵墙
        let theWall,mindis;
        let roomWallList = [];
        let end = {
          x: 0,
          y: position.y
        };
        let walls = Object.values(this.walls);
        walls.forEach(wall => {
          if (typeList.includes(wall.type)) {
            let cross = this.isAcross(this.points[wall.start_id], this.points[wall.end_id], position, end)
            if (cross) {
              let dis = this.getLength(cross, position, 'px');
              if (theWall) {
                if (dis < mindis) {
                  theWall = JSON.parse(JSON.stringify(wall));
                  mindis = dis;
                }
              } else {
                theWall = JSON.parse(JSON.stringify(wall));
                mindis = dis;
              }
            }
          }
        })
        if (theWall) {
          if (this.points[theWall.start_id].y < this.points[theWall.end_id].y) {
            let mid = theWall.end_id;
            theWall.end_id = theWall.start_id;
            theWall.start_id = mid;
            this.setVertex(theWall, {
              zoom: this.zoom,
              points: this.points,
              walls: this.walls
            });
          }
          roomWallList.push(theWall)
          this.findRoomWalls(theWall, roomWallList, typeList, 1)
          if (roomWallList.length > 0) {
            let idList1 = []
            for (let i = 0; i < roomWallList.length; i++) {
              idList1.push(roomWallList[i].id)
            }
            let areas = Object.values(this.areas);
            for (let i = 0; i < areas.length; i++) {
              let idList2 = []
              let thatRoom = areas[i]
              for (let j = 0; j < thatRoom.walls.length; j++) {
                idList2.push(thatRoom.walls[j].id)
              }
              if (idList1.sort().toString() === idList2.sort().toString() && this.operation.includes(thatRoom.claass)) {
                console.log('重复定义房间')
                return;
              }
            }
            let area;
            //没有重复房间，开始定义房间
            if (this.operation === 'define_room') {
              area = new this.Area({
                that: this,
                walls: roomWallList,
                center: position,
                claass: 'room'
              })

            } else if (this.operation === 'define_free') {
              area = new this.Area({
                that: this,
                walls: roomWallList,
                center: position,
                claass: 'free'
              })
            } else if (this.operation === 'define_pass') {
              area = new this.Area({
                that: this,
                walls: roomWallList,
                center: position,
                claass: 'pass'
              })
            }
            if (!this.isInArea(position, area)) {
              console.log('假房间排除', area)
              return
            }
            this.drawArea(area, {
              zoom: this.zoom,
              points: this.points,
              chuangs: this.chuangs,
              doors: this.doors
            });
            this.areas[area.id] = area;
          }
        }
      },
      // 递归, 找到房间的所有墙
      findRoomWalls(theWall, roomWallList, typeList, flag) {
        if (flag > 30) {
          console.log('死循环了吧')
          roomWallList.splice(0, roomWallList.length)
          return
        }
        flag++
        let tan = Math.PI * 2
        let nextWall;
        let walls = [];
        this.points[theWall.end_id].walls.forEach(x => {
          if (x !== theWall.id) {
            walls.push(JSON.parse(JSON.stringify(this.walls[x])));
          }
        })
        for (let i = 0; i < walls.length; i++) {
          let wall = walls[i];
          if (typeList.includes(wall.type)) {
            if (wall.end_id === theWall.end_id) {
              let mid = wall.end_id;
              wall.end_id = wall.start_id;
              wall.start_id = mid;
              this.setVertex(wall, {
                zoom: this.zoom,
                points: this.points,
                walls: this.walls
              });
            }
            let result = this.tangle(this.points[theWall.end_id], this.points[theWall.start_id], this.points[wall.end_id]);
            if (result < tan) {
              tan = result;
              nextWall = wall;
            }
          }
        }
        if (tan === 2 * Math.PI) {
          console.log('没有相连的墙了')
          this.selectObj = theWall
          this.redrawAll()
          roomWallList.splice(0, roomWallList.length)
          return
        }
        if (nextWall.id === roomWallList[0].id) {
          console.log('找完1圈了')
          return
        }
        roomWallList.push(nextWall)
        this.findRoomWalls(nextWall, roomWallList, typeList, flag)
      },
      tangle(A, B, C) { // 反正切
        //A是交点
        //注意canvas的y坐标是反过来的
        let a = Math.atan2((A.y - C.y), (C.x - A.x)) - Math.atan2((A.y - B.y), (B.x - A.x))
        if (a < 0) {
          a += (2 * Math.PI);
        }
        return a;
      },
      getSquare(wallList, zoom) {
        let pointList = []
        let square = 0
        for (let i = 0; i < wallList.length; i++) {
          pointList.push(this.points[wallList[i].start_id])
        }
        pointList.push(this.points[wallList[0].start_id])
        for (let i = 0; i < pointList.length - 1; i++) {
          square += pointList[i].x * pointList[i + 1].y
          square -= pointList[i].y * pointList[i + 1].x
        }
        square = Math.abs(square / 2)
        //现在的面积是像素的面积，要转换成平方米。先乘以 (20*zoom)^2 是平方毫米，再除以1000^2
        return Math.round(((square * (20 * zoom) ** 2) / 1000 ** 2) * 10) / 10
      },
      getCabinetSquare(cabinets, zoom) {
        let total = 0;
        cabinets.forEach(cab => {
          let square = 0;
          let path = JSON.parse(JSON.stringify(cab.path));
          path.push(path[0]);
          for (let i = 0; i < path.length - 1; i++) {
            square += path[i].x * path[i + 1].y
            square -= path[i].y * path[i + 1].x
          }
          square = Math.abs(square / 2)
          square = (square * (20 * zoom) ** 2) / 1000 ** 2
          total += square;
        })
        if (total) {
          total = parseFloat(total.toFixed(1))
        }
        return total;
      },
      getSquareLevel(square, type) {
        let param = this.squareLevelParam[type];
        if (square < param[0]) {
          return "偏小";
        } else if (square < param[1]) {
          return "中等";
        } else if (square < param[2]) {
          return "较大";
        } else {
          return "豪华";
        }
      },
      getBayDepth(target, cData, finish) { // 计算某个房间的开间和进深
        let ctx = this.context;
        let cvs = this.canvas;
        let zoom = cData.zoom;
        let maxX,maxY,minX,minY;
        target.walls.forEach(wall => {
          let pointList = [cData.points[wall.start_id], cData.points[wall.end_id]];
          if (typeof maxX == 'undefined') {
            maxX = minX = pointList[0].x;
            maxY = minY = pointList[0].y;
          }
          pointList.forEach(point => {
            if (point.x > maxX) {
              maxX = point.x;
            }
            if (point.x < minX) {
              minX = point.x;
            }
            if (point.y > maxY) {
              maxY = point.y;
            }
            if (point.y < minY) {
              minY = point.y;
            }
          })
        })
        let lineNum = 20;
        let stepx = (maxX - minX) / lineNum;
        let stepy = (maxY - minY) / lineNum;
        let xMap = {};
        let yMap = {};
        let xList = [];
        let yList = [];
        let idMap = {};
        for (let i=1; i<lineNum; i++) {
          let liney = {
            start: {
              x: minX + stepx * i,
              y: 100000
            },
            end: {
              x: minX + stepx * i,
              y: 0
            }
          }
          let linex = {
            start: {
              x: 0,
              y: minY + stepy * i,
            },
            end: {
              x: 100000,
              y: minY + stepy * i,
            }
          }
          let crossListx = [];
          let crossListy = [];
          target.walls.forEach(wall => {
            let crossx = this.isAcross(linex.start, linex.end, cData.points[wall.start_id], cData.points[wall.end_id]);
            if (crossx) {
              for (let key in cData.chuangs) {
                let chuang = cData.chuangs[key];
                if (!idMap[chuang.id] && chuang.wall_id == wall.id) {
                  idMap[chuang.id] = 1;
                  xList.push(chuang);
                }
              }
              for (let key in cData.doors) {
                let temp = cData.doors[key];
                if (!idMap[temp.id] && temp.wall_id == wall.id) {
                  for (let akey in cData.areas) {
                    let area = cData.areas[akey];
                    if (area.claass === 'room' && ['阳台','露台','花园'].includes(area.type)) {
                      let cWall = area.walls.find(x => x.id === temp.wall_id);
                      if (cWall) {
                        idMap[temp.id] = 1;
                        xList.push(temp);
                      }
                    }
                  }
                }
              }
              crossx.wall = wall;
              crossListx.push(crossx);
            } else {
              let corssy = this.isAcross(liney.start, liney.end, cData.points[wall.start_id], cData.points[wall.end_id]);
              if (corssy) {
                for (let key in cData.chuangs) {
                  let chuang = cData.chuangs[key];
                  if (!idMap[chuang.id] && chuang.wall_id == wall.id) {
                    idMap[chuang.id] = 1;
                    yList.push(chuang);
                  }
                }
                for (let key in cData.doors) {
                  let temp = cData.doors[key];
                  if (!idMap[temp.id] && temp.wall_id == wall.id) {
                    for (let akey in cData.areas) {
                      let area = cData.areas[akey];
                      if (area.claass === 'room' && ['阳台','露台','花园'].includes(area.type)) {
                        let cWall = area.walls.find(x => x.id === temp.wall_id);
                        if (cWall) {
                          idMap[temp.id] = 1;
                          yList.push(temp);
                        }
                      }
                    }
                  }
                }
                corssy.wall = wall;
                crossListy.push(corssy);
              }
            }
          })
          if (crossListx.length == 2) {
            let dis = Math.round(this.getLength(crossListx[0], crossListx[1], 'mm', zoom));
            xMap[dis] = (xMap[dis] || 0) + 1;
          }
          if (crossListy.length == 2) {
            let dis = Math.round(this.getLength(crossListy[0], crossListy[1], 'mm', zoom));
            yMap[dis] = (yMap[dis] || 0) + 1;
          }
        }
        let xwidth, ywidth, xn, yn;
        for (let key in xMap) {
          if (xn) {
            if (xMap[key] > xn) {
              xwidth = key;
              xn = xMap[key];
            } else if (xMap[key] - xn > -3 && key > xwidth) {
              xwidth = key;
              xn = xMap[key];
            }
          } else {
            xwidth = key;
            xn = xMap[key];
          }
        }
        for (let key in yMap) {
          if (yn) {
            if (yMap[key] > yn) {
              ywidth = key;
              yn = yMap[key];
            } else if (yMap[key] - yn > -3 && key > ywidth) {
              ywidth = key;
              yn = yMap[key];
            }
          } else {
            ywidth = key;
            yn = yMap[key];
          }
        }
        let bay = xwidth;
        let depth = ywidth;
        if (['阳台','露台','花园'].includes(target.type)) {
          if (depth > bay) {
            let mid = depth;
            depth = bay;
            bay = mid;
          }
        } else {
          let face = this.roomFaceTo(target, cData);
          if (['东','西'].includes(face)) {
            bay = ywidth;
            depth = xwidth;
          }
        }

        let res = {
          bay: parseFloat((bay / 1000).toFixed(2)),
          depth: parseFloat((depth / 1000).toFixed(2)),
          rate: parseFloat((bay / depth).toFixed(2)),
        }
        
        // 窗深比
        if (finish && target.claass == 'room' && target.type != '阳台') {
          let csb = 0;
          let cList = [];
          xList.forEach(c => {
            cList.push({
              c: c,
              w: xwidth
            })
          })
          yList.forEach(c => {
            cList.push({
              c: c,
              w: ywidth
            })
          })
          cList.forEach(o => {
            let c = o.c;
            let d = parseFloat(o.w);
            let w = this.getLength(c.start, c.end, 'mm', zoom);
            // 有阳台的话要加上阳台的进深
            for (let akey in cData.areas) {
              let area = cData.areas[akey];
              if (area.claass === 'room' && ['阳台','露台','花园'].includes(area.type)) {
                let cWall = area.walls.find(x => x.id === c.wall_id);
                if (cWall) {
                  let bdObj = this.getBayDepth(area, cData);
                  d = d + bdObj.depth * 1000;
                }
              }
            }
            csb += (w / d);
          })

          res.csb = parseFloat(csb.toFixed(3));
          if (csb < 0.3) {
            res.csbl = 'D级';
          } else if (csb < 0.4) {
            res.csbl = 'C级';
          } else if (csb < 0.6) {
            res.csbl = 'B级';
          } else if (csb >= 0.6) {
            res.csbl = 'A级';
          }
        }

        return res
      },
      getBayDepthNP(target, cData, piao) { // 计算某个房间的开间和进深,不算飘窗
        let ctx = this.context;
        let cvs = this.canvas;
        let zoom = cData.zoom;

        let walls_np;
        walls_np = target.walls.slice();
        piao.walls.forEach(x => {
          let index = walls_np.findIndex(y => {
            return y.id === x.id
          })
          if (index > -1) {
            walls_np.splice(index, 1);
          } else {
            walls_np.push(x);
          }
        })

        let maxX,maxY,minX,minY;
        walls_np.forEach(wall => {
          let pointList = [cData.points[wall.start_id], cData.points[wall.end_id]];
          if (typeof maxX == 'undefined') {
            maxX = minX = pointList[0].x;
            maxY = minY = pointList[0].y;
          }
          pointList.forEach(point => {
            if (point.x > maxX) {
              maxX = point.x;
            }
            if (point.x < minX) {
              minX = point.x;
            }
            if (point.y > maxY) {
              maxY = point.y;
            }
            if (point.y < minY) {
              minY = point.y;
            }
          })
        })
        let lineNum = 20;
        let stepx = (maxX - minX) / lineNum;
        let stepy = (maxY - minY) / lineNum;
        let xMap = {};
        let yMap = {};
        for (let i=1; i<lineNum; i++) {
          let liney = {
            start: {
              x: minX + stepx * i,
              y: 100000
            },
            end: {
              x: minX + stepx * i,
              y: 0
            }
          }
          let linex = {
            start: {
              x: 0,
              y: minY + stepy * i,
            },
            end: {
              x: 100000,
              y: minY + stepy * i,
            }
          }
          let crossListx = [];
          let crossListy = [];
          walls_np.forEach(wall => {
            let crossx = this.isAcross(linex.start, linex.end, cData.points[wall.start_id], cData.points[wall.end_id]);
            if (crossx) {
              crossx.wall = wall;
              crossListx.push(crossx);
            } else {
              let corssy = this.isAcross(liney.start, liney.end, cData.points[wall.start_id], cData.points[wall.end_id]);
              if (corssy) {
                corssy.wall = wall;
                crossListy.push(corssy);
              }
            }
          })
          if (crossListx.length == 2) {
            let dis = Math.round(this.getLength(crossListx[0], crossListx[1], 'mm', zoom));
            xMap[dis] = (xMap[dis] || 0) + 1;
          }
          if (crossListy.length == 2) {
            let dis = Math.round(this.getLength(crossListy[0], crossListy[1], 'mm', zoom));
            yMap[dis] = (yMap[dis] || 0) + 1;
          }
        }
        let xwidth, ywidth, xn, yn;
        for (let key in xMap) {
          if (xn) {
            if (xMap[key] > xn) {
              xwidth = key;
              xn = xMap[key];
            } else if (xMap[key] - xn > -3 && key > xwidth) {
              xwidth = key;
              xn = xMap[key];
            }
          } else {
            xwidth = key;
            xn = xMap[key];
          }
        }
        for (let key in yMap) {
          if (yn) {
            if (yMap[key] > yn) {
              ywidth = key;
              yn = yMap[key];
            } else if (yMap[key] - yn > -3 && key > ywidth) {
              ywidth = key;
              yn = yMap[key];
            }
          } else {
            ywidth = key;
            yn = yMap[key];
          }
        }
        let bay = xwidth;
        let depth = ywidth;
        let face = this.roomFaceTo(target, cData);
        if (['东','西'].includes(face)) {
          bay = ywidth;
          depth = xwidth;
        }

        return {
          bay: parseFloat((bay / 1000).toFixed(2)),
          depth: parseFloat((depth / 1000).toFixed(2)),
        }
      },
      getPiao(target, areas) {
        for (let key in areas) {
          let area = areas[key];
          if (area.claass === 'free' && area.type === '飘窗') {
            if (area.center && this.isInArea(area.center, target)) {
              return area;
            }
          }
        }
      },
      setCabinetDots(target, position) {
        let path = target.path;
        let shape = target.shape;
        let width = target.width / 20 / this.zoom;
        if (shape === '一字型') {
          let A = path[0];
          let B = path[1];
          if (path[2]) {
            position = {
              x: path[2].x,
              y: path[2].y
            };
          }
          let atan2_end = this.atan2(B, A);
          let atan2_AB = atan2_end + Math.PI / 2;
          if (atan2_AB > Math.PI) {
            atan2_AB = atan2_AB - Math.PI * 2;
          }
          let judge = this.atan2(position, A) - atan2_end;
          if (judge < -Math.PI) {
            judge = judge + Math.PI * 2;
          } else if (judge > Math.PI) {
            judge = judge - Math.PI * 2;
          }
          let C = {};
          let D = {};
          if (judge > 0) {
            C.x = B.x + Math.cos(atan2_AB) * width;
            C.y = B.y - Math.sin(atan2_AB) * width;
            D.x = A.x + Math.cos(atan2_AB) * width;
            D.y = A.y - Math.sin(atan2_AB) * width;
          } else {
            C.x = B.x - Math.cos(atan2_AB) * width;
            C.y = B.y + Math.sin(atan2_AB) * width;
            D.x = A.x - Math.cos(atan2_AB) * width;
            D.y = A.y + Math.sin(atan2_AB) * width;
          }
          path[2] = C;
          path[3] = D;
        } else if (shape === 'L型') {
          let A = path[0],
              B = path[1],
              C = path[2];
          let D,E,F;
          let result = this.tangle(B, A, C);
          if (Math.abs(result - Math.PI / 2) < this.accuracy) { // 内L
            if (Math.abs(A.x - B.x) < this.accuracy) { // AB竖直
              let m = 1;
              if (C.x < A.x) {
                m = -1;
              }
              F = {
                x: A.x + width*m,
                y: A.y
              };
              D = {
                x: C.x,
                y: C.y + width*m
              }
              E = {
                x: F.x,
                y: D.y
              }
            } else { // AB 水平
              let m = 1;
              if (C.y < A.y) {
                m = -1;
              }
              F = {
                x: A.x,
                y: A.y + width*m
              };
              D = {
                x: C.x - width*m,
                y: C.y
              }
              E = {
                x: D.x,
                y: F.y
              }
            }
          } else { // 外L
            if (Math.abs(A.x - B.x) < this.accuracy) { // AB竖直
              let m = 1;
              if (C.x > A.x) {
                m = -1;
              }
              F = {
                x: A.x + width*m,
                y: A.y
              };
              D = {
                x: C.x,
                y: C.y - width*m
              }
              E = {
                x: F.x,
                y: D.y
              }
            } else { // AB 水平
              let m = 1;
              if (C.y > A.y) {
                m = -1;
              }
              F = {
                x: A.x,
                y: A.y + width*m
              };
              D = {
                x: C.x + width*m,
                y: C.y
              }
              E = {
                x: D.x,
                y: F.y
              }
            }
          }
          target.path = [A,B,C,D,E,F];
        } else if (shape === 'U型') {
          let A = path[0],
              B = path[1],
              C = path[2],
              D = path[3];
          let E,F,G,H;
          if (Math.abs(A.x - B.x) < this.accuracy) { // AB竖直
            if (A.y < B.y) { // A在上面
              F = {
                x: C.x + width,
                y: C.y - width
              }
              G = {
                x: B.x - width,
                y: B.y - width
              }
              H = {
                x: G.x,
                y: A.y
              }
              E = {
                x: F.x,
                y: D.y
              }
            } else {
              F = {
                x: C.x - width,
                y: C.y + width
              }
              G = {
                x: B.x + width,
                y: B.y + width
              }
              H = {
                x: G.x,
                y: A.y
              }
              E = {
                x: F.x,
                y: D.y
              }
            }
          } else { // AB 水平
            if (B.x < A.x) { // A在右边
              F = {
                x: C.x + width,
                y: C.y + width
              }
              G = {
                x: B.x + width,
                y: B.y - width
              }
              H = {
                x: A.x,
                y: G.y
              }
              E = {
                x: D.x,
                y: F.y
              }
            } else {
              F = {
                x: C.x - width,
                y: C.y - width
              }
              G = {
                x: B.x - width,
                y: B.y + width
              }
              H = {
                x: A.x,
                y: G.y
              }
              E = {
                x: D.x,
                y: F.y
              }
            }
          }
          target.path = [A,B,C,D,E,F,G,H];
        }
        
        return target;
      },
      // </util>

      // <global-event>
      onCanvasMousedown(e) { // 鼠标左键按下
        if (e.button !== 0) {
          return;
        }
        let position = this.windowToCanvas(e.clientX, e.clientY);
        let flag = this.operation;
        if (this.selectObj && this.selectObj.claass === 'cabinet') {
          let path = this.selectObj.path;
          let dots = [];
          let shape = this.selectObj.shape;
          if (shape === '一字型') {
            dots = [path[0], path[1]];
          } else if (shape === 'L型') {
            dots = [path[0], path[2]];
          } else if (shape === 'U型') {
            dots = [path[0], path[3]];
          }
          for (let i=0; i<dots.length; i++) {
            let radius = 7/this.scale_rate;
            let dis = this.getLength(position, dots[i], 'px');
            if (dis < radius) {
              this.cabinetDot = i;
              break;
            }
          }
          if (this.cabinetDot < 0) {
            let r = this.isInCabinets(position);
            if (r && r.id === this.selectObj.id) {
              position.cabinet = true;
              this.mousedown = position;
            }
          }
          return;
        }
        if (flag === 'none') {
          let result = this.isInDot(position, 8 / this.scale_rate, 'px');
          if (!result) {
            result = this.isInDoor(position);
          }
          if (!result) {
            result = this.isInChuang(position);
          }
          if (!result) {
            result = this.isClickInWalls(position);
          }
          if (!result) {
            result = this.isInCabinets(position);
          }
          if (!result) {
            result = this.isInAreas(position);
          }
          if (result) {
            if (['room','free','pass'].includes(result.claass)) {
              if (this.selectObj && this.selectObj.id === result.id) {
                this.areas[result.id].center = position;
              }
              this.roomType = this.areas[result.id].type;
              this.roomName = this.areas[result.id].name;
            } else if (['door','chuang'].includes(result.claass)) {
              let length = this.getLength(result.start, result.end, 'mm').toFixed(0);
              if (result.claass === 'door') {
                this.doorWidth = length;
              } else {
                this.chuangWidth = length;
              }
            } else if (result.claass === 'cabinet') {
              this.cabinetWidth = result.width;
            }
            this.selectObj = result;
            console.log(result)
            this.redrawAll()
            return;
          } else {
            console.log('没有选中', position);
          }
        } else if (flag === 'wall') {
          this.drawing = true;
          if (this.first) { // 第一次点击
            this.first = false;
            this.mousedown = this.movingDot;
          } else { // 不是第一次点击
            this.addNewWall(this.wallLength, 'click');
          }
        } else if (flag === 'ruler') {
          let result = this.result = this.isInRuler(position)
          if (result.type === 'dot') {
            this.mousedown = result.select
          } else {
            this.mousedown = position
          }
        } else if (flag === 'define_room') {
          this.defineRoom(position, ['real', 'empty'])
        } else if (flag === 'define_free') {
          this.defineRoom(position, ['real', 'empty', 'free'])
        } else if (flag === 'define_pass') {
          this.defineRoom(position, ['real', 'empty'])
        } else if (flag === 'chuang') {
          let dot = this.isMoveInWalls(position);
          if (dot) {
            if (this.first) { // 第一次点击
              this.mousedown = dot;
              this.first = false;
            } else { // 不是第一次点击
              this.addNewChuang(this.wallLength, 'click');
            }
          }
        } else if (flag === 'door') {
          let dot = this.isMoveInWalls(position);
          if (dot) {
            if (this.first) { // 第一次点击
              this.mousedown = dot;
              this.first = false;
            } else { // 不是第一次点击
              this.addNewChuang(this.wallLength, 'click');
            }
          }
        } else if (flag === 'cabinet') {
          if (this.cabinet) {
            // 还要判断有没有和已有的柜子重叠
            let judge =  this.isInCabinets(position);
            if (judge) {
              console.log('已经有柜子了')
            } else {
              let cabinet = new this.Cabinet({
                that: this,
                path: this.cabinet.path,
                width: 600,
                shape: this.cabinetShape
              })
              this.cabinets[cabinet.id] = cabinet;
            }
          }
        }
      },
      onCanvasMouseup(e) { // 鼠标左键抬起
        let flag = this.operation;
        let position = this.windowToCanvas(e.clientX, e.clientY);
        if (flag === 'ruler') {
          let result = this.result;
          let ruler = this.ruler;
          if (result.type === 'in') {
            let x = position.x - this.mousedown.x;
            let y = position.y - this.mousedown.y;
            ruler.start.x = ruler.start.x + x
            ruler.end.x = ruler.end.x + x
            ruler.start.y = ruler.start.y + y
            ruler.end.y = ruler.end.y + y
          } else if (result.type === 'dot') {
            ruler.start = result.another
            let atan2_abs = Math.abs(this.atan2(position, result.another));
            if (atan2_abs < Math.PI / 4 || atan2_abs > Math.PI * 0.75) {
              ruler.end = {
                x: position.x,
                y: result.another.y
              };
            } else {
              ruler.end = {
                x: result.another.x,
                y: position.y
              };
            }
          }
          this.redrawAll()
        } else if (this.selectObj && this.selectObj.claass === 'cabinet') {
          let index = this.cabinetDot;
          if (index > -1) {
            let path = this.selectObj.path;
            let shape = this.selectObj.shape;
            if (shape === '一字型') {
              path[index] = this.getFoot(path[0], path[1], position);
            } else if (shape === 'L型') {
              if (index == 1) {
                index = 2;
              }
              path[index] = this.getFoot(path[index], path[1], position);
            } else if (shape === 'U型') {
              if (index == 1) {
                index = 3;
                path[index] = this.getFoot(path[index], path[2], position);
              } else {
                path[index] = this.getFoot(path[index], path[1], position);
              }
            }
            this.setCabinetDots(this.selectObj);
            this.redrawAll();
          } else if (this.mousedown && this.mousedown.cabinet) {
            let x = position.x - this.mousedown.x;
            let y = position.y - this.mousedown.y;
            let path = JSON.parse(JSON.stringify(this.selectObj.path));
            path.forEach(dot => {
              dot.x = dot.x + x;
              dot.y = dot.y + y;
            })
            this.selectObj.path = path;
            this.redrawAll();
          }

          this.mousedown = null;
          this.cabinetDot = -1;
        }
      },
      onCanvasMousemove(e) { // 鼠标移动
        let position = this.windowToCanvas(e.clientX, e.clientY);
        if (this.operation === 'wall') { // 在画墙
          this.setMovingDot(position);
        } else if (this.operation === 'door' || this.operation === 'chuang') {
          this.setChuangDot(position);
        } else if (this.operation === 'cabinet') {
          this.drawDrawingCabinet(position);
        }
      },
      onRightClick() { // 鼠标右键点击
        if (this.first) {
          this.drawing = false;
          this.cursor = 'default';
          this.operation = 'none';
          this.selectObj = null;
        } else {
          this.first = true;
          this.drawing = false;
        }
        this.wallLength = 0;
        this.redrawAll()
        return false;
      },
      onKeyDown(e) { // 键盘按下, 主要方向键和delete
        let keyCode = e.keyCode
        let obj = this.selectObj;
        if (obj && (obj.claass === 'door' || obj.claass === 'chuang')) {
          if (Math.abs(obj.start.x - obj.end.x) < this.accuracy) {
            obj.direction = '竖直';
          } else {
            obj.direction = '水平';
          }
        }
        if (!obj && this.operation === 'none') { // 移动整个画面
          let base = 10
          if (keyCode === 38) { // 向上键
            this.redrawAll({
              translateY: -base
            });
          } else if (keyCode === 40) { // 向下键
            this.redrawAll({
              translateY: base
            });
          } else if (keyCode === 37) { // 向左键
            this.redrawAll({
              translateX: -base
            });
          } else if (keyCode === 39) { // 向右键
            this.redrawAll({
              translateX: base
            });
          }
        } else if (this.operation === 'move') {
          let base = 1;
          let mx = 0;
          let my = 0;
          if (keyCode === 38) { // 向上键
            my = -base;
          } else if (keyCode === 40) { // 向下键
            my = base;
          } else if (keyCode === 37) { // 向左键
            mx = -base;
          } else if (keyCode === 39) { // 向右键
            mx = base;
          }
          for (let key in this.points) {
            this.points[key].x += mx;
            this.points[key].y += my;
          }
          for (let key in this.walls) {
            this.toSetVertex(this.walls[key]);
          }
          for (let key in this.areas) {
            this.areas[key].center.x += mx;
            this.areas[key].center.y += my;
            let walls = this.areas[key].walls;
            this.sortRoomWall(walls, {
              zoom: this.zoom,
              points: this.points,
              walls: this.walls
            })
            this.areas[key].walls = walls;
          }
          for (let key in this.chuangs) {
            let chuang = this.chuangs[key];
            chuang.start.x += mx;
            chuang.start.y += my;
            chuang.end.x += mx;
            chuang.end.y += my;
            this.setVertex(chuang);
          }
          for (let key in this.doors) {
            let door = this.doors[key];
            door.start.x += mx;
            door.start.y += my;
            door.end.x += mx;
            door.end.y += my;
            this.setVertex(door);
          }
          for (let key in this.cabinets) {
            let cab = this.cabinets[key];
            cab.path.forEach(d => {
              d.x += mx;
              d.y += my;
            })
          }
          this.redrawAll();
        } else { // 移动比例尺.门.窗, 删除
          let base = 0.5;
          if (keyCode === 38) { // 向上键
            if (obj.claass === 'ruler') {
              if (obj.start.x === obj.end.x) {
                //竖直
                //找出上面的点
                if (obj.start.y < obj.end.y) {
                  obj.start.y = obj.start.y - base
                } else {
                  obj.end.y = obj.end.y - base
                }
              } else {
                //水平，移动
                obj.start.x = obj.start.x + base
                obj.end.x = obj.end.x + base
              }
            } else if (obj.claass === 'chuang') {
              if (obj.direction === '竖直') {
                obj.start.y -= base
                obj.end.y -= base
                this.setVertex(obj);
              }
            } else if (obj.claass === 'door') {
              if (obj.direction === '竖直') {
                obj.start.y -= base
                obj.end.y -= base
                this.setVertex(obj);
              }
            } else if (obj.claass === 'cabinet') {
              let path = JSON.parse(JSON.stringify(obj.path));
              path.forEach(dot => {
                dot.y -= base;
              })
              obj.path = path;
            }
            this.redrawAll();
          } else if (keyCode === 40) { // 向下键
            if (obj.claass === 'ruler') {
              if (obj.start.x === obj.end.x) {
                //竖直
                //找出上面的点
                if (obj.start.y < obj.end.y) {
                  obj.start.y = obj.start.y + base
                } else {
                  obj.end.y = obj.end.y + base
                }
              } else {
                //水平，移动
                obj.start.x = obj.start.x - base
                obj.end.x = obj.end.x - base
              }
            } else if (obj.claass === 'chuang') {
              if (obj.direction === '竖直') {
                obj.start.y += base
                obj.end.y += base
                this.setVertex(obj);
              }
            } else if (obj.claass === 'door') {
              if (obj.direction === '竖直') {
                obj.start.y += base
                obj.end.y += base
                this.setVertex(obj);
              }
            } else if (obj.claass === 'cabinet') {
              let path = JSON.parse(JSON.stringify(obj.path));
              path.forEach(dot => {
                dot.y += base;
              })
              obj.path = path;
            }
            this.redrawAll();
          } else if (keyCode === 37) { // 向左键
            if (obj.claass === 'ruler') {
              if (obj.start.y === obj.end.y) {
                //水平
                //找出左边的点
                if (obj.start.x < obj.end.x) {
                  obj.start.x = obj.start.x - base
                } else {
                  obj.end.x = obj.end.x - base
                }
              } else {
                //竖直，移动
                obj.start.y = obj.start.y - base
                obj.end.y = obj.end.y - base
              }
            } else if (obj.claass === 'chuang') {
              if (obj.direction === '水平') {
                obj.start.x -= base
                obj.end.x -= base
                this.setVertex(obj);
              }
            } else if (obj.claass === 'door') {
              if (obj.direction === '水平') {
                obj.start.x -= base
                obj.end.x -= base
                this.setVertex(obj);
              }
            } else if (obj.claass === 'cabinet') {
              let path = JSON.parse(JSON.stringify(obj.path));
              path.forEach(dot => {
                dot.x -= base;
              })
              obj.path = path;
            }
            this.redrawAll();
          } else if (keyCode === 39) { // 向右键
            if (obj.claass === 'ruler') {
              if (obj.start.y === obj.end.y) {
                //水平
                //找出左边的点
                if (obj.start.x < obj.end.x) {
                  obj.start.x = obj.start.x + base
                } else {
                  obj.end.x = obj.end.x + base
                }
              } else {
                //竖直，移动
                obj.start.y = obj.start.y + base
                obj.end.y = obj.end.y + base
              }
            } else if (obj.claass === 'chuang') {
              if (obj.direction === '水平') {
                obj.start.x += base
                obj.end.x += base
                this.setVertex(obj);
              }
            } else if (obj.claass === 'door') {
              if (obj.direction === '水平') {
                obj.start.x += base
                obj.end.x += base
                this.setVertex(obj);
              }
            } else if (obj.claass === 'cabinet') {
              let path = JSON.parse(JSON.stringify(obj.path));
              path.forEach(dot => {
                dot.x += base;
              })
              obj.path = path;
            }
            this.redrawAll();
          } else if (keyCode === 46 || keyCode === 8) { // 删除键
            this.delObj()
          }
        }
      },
      onMouseWheel(e) { // 鼠标滚轮控制缩放
        if (this.operation === 'move') {
          if (e.wheelDelta > 0) {
            this.imgScale = this.imgScale + 0.01;
            this.redrawAll();
          }
          if (e.wheelDelta < 0 && this.imgScale > 0.02) {
            this.imgScale = this.imgScale - 0.01;
            this.redrawAll();
          }
        } else {
          let position = this.windowToCanvas(e.clientX, e.clientY);
          if (e.wheelDelta > 0) {
            let option = {
              scale_rate: 1.1,
              translateX: -position.x * 0.1,
              translateY: -position.y * 0.1
            }
            this.redrawAll(option)
          }
          if (e.wheelDelta < 0) {
            let option = {
              scale_rate: 0.9,
              translateX: position.x * 0.1,
              translateY: position.y * 0.1
            }
            this.redrawAll(option)
          }
        }
        return false;
      },
      // </global-event>

      // <analyse>
      getAllRoomSquare(areas) {
        let total = 0;
        let piao = 0; // 飘窗
        for (let i = 0; i < areas.length; i++) {
          if (areas[i].claass !== 'free') {
            //电梯类型的房间跳过，不计入总面积
            if (areas[i].type === '电梯' || areas[i].type === '采光井') {
              continue;
            }
            total += areas[i].square
          } else {
            if (areas[i].type === '飘窗') {
              piao += areas[i].square
            }
            if (areas[i].type === '消防前室') {
              total += areas[i].square
            }
          }
        }
        let result = [total];
        if (piao > 0) {
          result.push(total - piao);
        }
        return result;
      },
      getAllFreeSquare(areas) {
        let total = 0
        for (let i = 0; i < areas.length; i++) {
          if (areas[i].claass === 'free') {
            if (areas[i].type === '阳台') {
              total += areas[i].square / 2
            } else {
              total += areas[i].square
            }

          } else if (areas[i].type === '阳台' && areas[i].special !== '不赠送') {
            total += areas[i].square / 2
          } else if (areas[i].type === '露台') {
            total += areas[i].square
          } else if (areas[i].type === '花园') {
            total += areas[i].square
          }
        }
        return parseFloat(total.toFixed(2));
      },
      houseKaijian(cData) {
        let points = cData.points;
        let zoom = cData.zoom;
        let walls = [];
        let idMap = {};
        for (let key in cData.areas) {
          let area = cData.areas[key];
          if (area.type !== '电梯' && area.type !== '花园' && area.type !== '采光井') {
            area.walls.forEach(x => {
              if (!idMap[x.id]) {
                idMap[x.id] = 1;
                walls.push(x);
              }
            })
          }
        }
        let maxX = points[walls[0].start_id].x
        let minX = points[walls[0].start_id].x
        let maxY = points[walls[0].start_id].y
        let minY = points[walls[0].start_id].y
        for (let i = 0; i < walls.length; i++) {
          if (points[walls[i].start_id].x > maxX) {
            maxX = points[walls[i].start_id].x
          }
          if (points[walls[i].start_id].x < minX) {
            minX = points[walls[i].start_id].x
          }
          if (points[walls[i].end_id].x > maxX) {
            maxX = points[walls[i].end_id].x
          }
          if (points[walls[i].end_id].x < minX) {
            minX = points[walls[i].end_id].x
          }

          if (points[walls[i].start_id].y > maxY) {
            maxY = points[walls[i].start_id].y
          }
          if (points[walls[i].start_id].y < minY) {
            minY = points[walls[i].start_id].y
          }
          if (points[walls[i].end_id].y > maxY) {
            maxY = points[walls[i].end_id].y
          }
          if (points[walls[i].end_id].y < minY) {
            minY = points[walls[i].end_id].y
          }
        }
        return {
          kaijian: parseFloat(((maxX - minX) * 20 * zoom / 1000).toFixed(2)),
          jingshen: parseFloat(((maxY - minY) * 20 * zoom / 1000).toFixed(2)),
          rate: parseFloat(((maxX - minX) / (maxY - minY)).toFixed(2))
        }
      },
      shitingwei(areas) {
        let a = 0,
          b = 0,
          c = 0;
        for (let i in areas) {
          if (areas[i].type === "主卧" || areas[i].type === "次卧" || areas[i].type === "书房") {
            a += 1;
          } else if (areas[i].type === "客厅" || areas[i].type === "餐厅") {
            b += 1;
          } else if (areas[i].type === "客餐厅") {
            b += 2;
          } else if (areas[i].type === "主卫" || areas[i].type === "客卫") {
            c += 1;
          }
        }
        return a + "室" + b + "厅" + c + "卫";
      },
      roomsToSouth(cData) {
        let total = 0;
        for (let key in cData.areas) {
          let area = cData.areas[key];
          if (area.claass === 'room') {
            if (!['阳台','露台','花园'].includes(area.type)) {
              let dirs = this.roomFaceTo(area, cData);
              if (dirs.includes('南')) {
                let {bay, depth} = this.getBayDepth(area, cData);
                let step = 1;
                if (bay >= 6 && area.type === '客餐厅' && bay > depth) {
                  step = 2;
                } else {
                  if (['客卫','主卫','厨房','辅助房间'].includes(area.type)) {
                    step = 0.5;
                  }
                }
                total += step;
              }
            }
          }
        }
        return total;
      },
      roomFaceTo(target, cData, dark) { // 判断一个房间的朝向
        let face = '';
        let wallMap = {};
        target.walls.forEach(x => wallMap[x.id] = 1);

        // 找出最宽的窗或门,门必须是通阳台的
        let wallId = null;
        let chuang = null;
        let chuangWidth = 0;
        for (let key in cData.chuangs) {
          let temp = cData.chuangs[key];
          if ((dark || temp.type == 'light') && wallMap[temp.wall_id]) {
            let width = this.getLength(temp.start, temp.end, 'px');
            if (width > chuangWidth) {
              chuangWidth = width;
              chuang = temp;
              wallId = temp.wall_id;
            }
          }
        }
        for (let key in cData.doors) {
          let temp = cData.doors[key];
          if (wallMap[temp.wall_id]) {
            for (let akey in cData.areas) {
              let area = cData.areas[akey];
              if (area.claass === 'room' && ['阳台','露台','花园'].includes(area.type)) {
                let cWall = area.walls.find(x => x.id === temp.wall_id);
                if (cWall) {
                  let width = this.getLength(temp.start, temp.end, 'px');
                  if (width > chuangWidth) {
                    chuangWidth = width;
                    chuang = temp; 
                    wallId = temp.wall_id;
                  }
                }
              }
            }
          }
        }

        if (chuang) {
          let start = chuang.start;
          let end = chuang.end;
          let center = {
            x: (start.x + end.x) / 2,
            y: (start.y + end.y) / 2
          }
          let lineUp = {
            start: center,
            end: {
              x: center.x,
              y: 0
            }
          }
          let lineDown = {
            start: center,
            end: {
              x: center.x,
              y: 10000
            }
          }
          let lineLeft = {
            start: center,
            end: {
              x: 0,
              y: center.y
            }
          }
          let lineRight = {
            start: center,
            end: {
              x: 10000,
              y: center.y
            }
          }
          
          let direction = '南北';
          let result = this.tangle(center,start,lineUp.end);
          if (result < 0.1 || Math.abs(result - Math.PI) < 0.1 || Math.abs(result - 2*Math.PI) < 0.1) {
            direction = '东西';
          }
          if (direction === '南北') {
            target.walls.forEach(wall => {
              if (wall.id !== wallId) {
                if (this.isAcross(cData.points[wall.start_id], cData.points[wall.end_id], lineUp.start, lineUp.end)) {
                  face = '南';
                }
                if (this.isAcross(cData.points[wall.start_id], cData.points[wall.end_id], lineDown.start, lineDown.end)) {
                  face = '北';
                }
              }
            })
          } else {
            target.walls.forEach(wall => {
              if (wall.id !== wallId) {
                if (this.isAcross(cData.points[wall.start_id], cData.points[wall.end_id], lineLeft.start, lineLeft.end)) {
                  face = '东';
                }
                if (this.isAcross(cData.points[wall.start_id], cData.points[wall.end_id], lineRight.start, lineRight.end)) {
                  face = '西';
                }
              }
            })
          }
        }

        return face;
      },
      roomToSouth(target, canvasData) {
        let wallList = target.wallList
        outer:
          for (let i = 0; i < wallList.length; i++) {
            //首先有水平的墙上有窗
            //其次这个窗的中点到canvas底部的连线 没有 与任何墙体相交
            if (wallList[i].direction === '水平') {
              middle: for (let j = 0; j < canvasData.chuang.length; j++) {
                if (canvasData.chuang[j].wall_id === wallList[i].id) {
                  let y = {
                    start: canvasData.chuang[j].center,
                    end: [canvasData.chuang[j].center[0], 100000]
                  }
                  inner:
                    for (let k = 0; k < canvasData.walls.length; k++) {
                      if (this.isAcross(y, canvasData.walls[k]) && canvasData.walls[k].type === 'real') {
                        continue middle
                      }
                    }
                  return true
                }
              }
            }
          }
        //看有没有朝南的阳台
        for (let i = 0; i < canvasData.areas.length; i++) {
          if (canvasData.areas[i].claass === 'room') {
            if (canvasData.areas[i].type === '阳台' || canvasData.areas[i].type === '露台') {
              let result = this.shareWall(canvasData.areas[i], target)
              if (result.type === 'yes') {
                //看这堵墙上有没有门或者窗
                for (let j = 0; j < canvasData.doors.length; j++) {
                  for (let k = 0; k < result.walls.length; k++) {
                    if (canvasData.doors[j].wall_id === result.walls[k].id) {
                      if (canvasData.doors[j].direction === '水平' && result.walls[k].roomSide === '上') {
                        // console.log('门朝南',target)
                        return true
                      }
                    }
                  }
                }
                for (let j = 0; j < canvasData.chuang.length; j++) {
                  for (let k = 0; k < result.walls.length; k++) {
                    if (canvasData.chuang[j].wall_id === result.walls[k].id) {
                      if (canvasData.chuang[j].direction === '水平' && result.walls[k].roomSide === '上') {
                        // console.log('窗朝南',target)
                        return true
                      }
                    }
                  }
                }
              }
            }
          }
        }
        // console.log(target)
        return false
      },
      roomToNorth(target, canvasData) {
        let wallList = target.wallList
        outer:
          for (let i = 0; i < wallList.length; i++) {
            //首先有水平的墙上有窗
            //其次这个窗的中点到canvas顶部的连线 没有 与任何墙体相交
            if (wallList[i].direction === '水平') {
              middle: for (let j = 0; j < canvasData.chuang.length; j++) {
                if (canvasData.chuang[j].wall_id === wallList[i].id) {
                  let y = {
                    start: canvasData.chuang[j].center,
                    end: [canvasData.chuang[j].center[0], 0]
                  }
                  inner:
                    for (let k = 0; k < canvasData.walls.length; k++) {
                      if (this.isAcross(y, canvasData.walls[k]) && canvasData.walls[k].claass === 'wall') {
                        continue middle
                      }
                    }
                  return true
                }
              }
            }
          }

        //看有没有朝南的阳台
        for (let i = 0; i < canvasData.areas.length; i++) {
          if (canvasData.areas[i].type === '阳台' && canvasData.areas[i].claass === 'room') {
            let result = this.shareWall(canvasData.areas[i], target)
            if (result.type === 'yes') {
              //看这堵墙上有没有门或者窗
              for (let j = 0; j < canvasData.doors.length; j++) {
                for (let k = 0; k < result.walls.length; k++) {
                  if (canvasData.doors[j].wall_id === result.walls[k].id) {
                    if (canvasData.doors[j].direction === '水平' && result.walls[k].roomSide === '下') {
                      return true
                    }
                  }
                }
              }
              for (let j = 0; j < canvasData.chuang.length; j++) {
                for (let k = 0; k < result.walls.length; k++) {
                  if (canvasData.chuang[j].wall_id === result.walls[k].id) {
                    if (canvasData.chuang[j].direction === '水平' && result.walls[k].roomSide === '下') {
                      return true
                    }
                  }
                }
              }
            }
          }
        }
        return false
      },
      roomToEast(target, canvasData) {
        let wallList = target.wallList
        outer:
          for (let i = 0; i < wallList.length; i++) {
            //首先有竖直的墙上有窗
            //其次这个窗的中点到canvas右边的连线 没有 与任何墙体相交
            if (wallList[i].direction === '竖直') {
              middle: for (let j = 0; j < canvasData.chuang.length; j++) {
                if (canvasData.chuang[j].wall_id === wallList[i].id) {
                  let y = {
                    start: canvasData.chuang[j].center,
                    end: [100000, canvasData.chuang[j].center[1]]
                  }
                  inner:
                    for (let k = 0; k < canvasData.walls.length; k++) {
                      if (this.isAcross(y, canvasData.walls[k]) && canvasData.walls[k].type === 'real') {
                        continue middle
                      }
                    }
                  return true
                }
              }
            }
          }
        //看有没有朝东的阳台
        for (let i = 0; i < canvasData.areas.length; i++) {
          if (canvasData.areas[i].type === '阳台' && canvasData.areas[i].claass === 'room') {
            let result = this.shareWall(canvasData.areas[i], target)
            if (result.type === 'yes') {
              //看这堵墙上有没有门或者窗
              for (let j = 0; j < canvasData.doors.length; j++) {
                for (let k = 0; k < result.walls.length; k++) {
                  if (canvasData.doors[j].wall_id === result.walls[k].id) {
                    if (canvasData.doors[j].direction === '竖直' && result.walls[k].roomSide === '左') {
                      return true
                    }
                  }
                }
              }
              for (let j = 0; j < canvasData.chuang.length; j++) {
                for (let k = 0; k < result.walls.length; k++) {
                  if (canvasData.chuang[j].wall_id === result.walls[k].id) {
                    if (canvasData.chuang[j].direction === '竖直' && result.walls[k].roomSide === '左') {
                      return true
                    }
                  }
                }
              }
            }
          }
        }
        // console.log(target)
        return false
      },
      roomToWest(target, canvasData) {
        let wallList = target.wallList
        outer:
          for (let i = 0; i < wallList.length; i++) {
            //首先有竖直的墙上有窗
            //其次这个窗的中点到canvas左边的连线 没有 与任何墙体相交
            if (wallList[i].direction === '竖直') {
              middle: for (let j = 0; j < canvasData.chuang.length; j++) {
                if (canvasData.chuang[j].wall_id === wallList[i].id) {
                  let y = {
                    start: canvasData.chuang[j].center,
                    end: [0, canvasData.chuang[j].center[1]]
                  }
                  inner:
                    for (let k = 0; k < canvasData.walls.length; k++) {
                      if (this.isAcross(y, canvasData.walls[k]) && canvasData.walls[k].type === 'real') {
                        continue middle
                      }
                    }
                  return true
                }
              }
            }
          }
        //看有没有朝西的阳台
        for (let i = 0; i < canvasData.areas.length; i++) {
          if (canvasData.areas[i].type === '阳台' && canvasData.areas[i].claass === 'room') {
            let result = this.shareWall(canvasData.areas[i], target)
            if (result.type === 'yes') {
              //看这堵墙上有没有门或者窗
              for (let j = 0; j < canvasData.doors.length; j++) {
                for (let k = 0; k < result.walls.length; k++) {
                  if (canvasData.doors[j].wall_id === result.walls[k].id) {
                    if (canvasData.doors[j].direction === '竖直' && result.walls[k].roomSide === '右') {
                      return true
                    }
                  }
                }
              }
              for (let j = 0; j < canvasData.chuang.length; j++) {
                for (let k = 0; k < result.walls.length; k++) {
                  if (canvasData.chuang[j].wall_id === result.walls[k].id) {
                    if (canvasData.chuang[j].direction === '竖直' && result.walls[k].roomSide === '右') {
                      return true
                    }
                  }
                }
              }
            }
          }
        }
        // console.log(target)
        return false
      },
      getSquareLevel(square, type) { // 根据面积得到舒适等级
        let param = this.squareLevelParam[type];
        if (square < param[0]) {
          return "偏小";
        } else if (square < param[1]) {
          return "中等";
        } else if (square < param[2]) {
          return "较大";
        } else {
          return "豪华";
        }
      },
      getSquareLevel2(square, type) {
        let param = this.squareLevelParam[type];
        if (square < param[0]) {
          return 25;
        } else if (square < param[1]) {
          return 50;
        } else if (square < param[2]) {
          return 75;
        } else {
          return 100;
        }
      },
      drd(a, b, cData) {
        let lengtha = this.getLength(a.start, a.end, 'px');
        let lengthb = this.getLength(b.start, b.end, 'px');
        if (lengtha > lengthb) {
          let line = this.getVerticalLine(b.start, b.end);
          if (this.dtd(line[0], line[1], a, lengtha, cData)) {
            return true;
          }
          if (this.dtd(b.B, b.C, a, lengtha, cData)) {
            return true;
          }
          if (this.dtd(b.A, b.D, a, lengtha, cData)) {
            return true;
          }
        } else {
          let line = this.getVerticalLine(a.start, a.end);
          if (this.dtd(line[0], line[1], b, lengthb, cData)) {
            return true;
          }
          if (this.dtd(a.B, a.C, b, lengthb, cData)) {
            return true;
          }
          if (this.dtd(a.A, a.D, b, lengthb, cData)) {
            return true;
          }
        }
        return false;
      },
      dtd(A, B, a, lengtha, cData) {
        let cross = this.getIntersection(A, B, a.start, a.end);
        if (cross) {
          let dis1 = this.getLength(cross, a.start, 'px');
          let dis2 = this.getLength(cross, a.end, 'px');
          if (Math.abs(lengtha - dis1 - dis2) < this.accuracy) {
            // 判断中间有没有墙
            if (!cData) {
              return true;
            }
            let judge = false;
            for (let key in cData.walls) {
              let wall = cData.walls[key];
              if (wall.type === 'real') {
                if (this.isAcross(A, cross, cData.points[wall.start_id], cData.points[wall.end_id])) {
                  judge = true;
                  break;
                }
              }
            }
            if (!judge) {
              return true;
            }
          }
        }
        return false;
      },
      doorinroomss(target, doors) {
        let wallList = target.walls
        for (let i = 0; i < wallList.length; i++) {
          for (let j = 0; j < doors.length; j++) {
            if (doors[j].wall_id === wallList[i].id) {
              return {
                type: 'yes',
                door: doors[j],
                wall: wallList[i]
              }
            }
          }
        }
        return {
          type: 'no'
        }
      },
      windowsinroomss(target, chuangs) {
        let wallList = target.walls
        for (let i = 0; i < wallList.length; i++) {
          for (let j in chuangs) {
            if (chuangs[j].wall_id === wallList[i].id) {
              return {
                type: 'yes',
                chuang: chuangs[j],
                wall: wallList[i]
              }
            }
          }
        }
        return {
          type: 'no'
        }
      },
      shareWall(A, B) { // 两个房间有无共用的墙
        //A,B 是两个房间，判断两个房间有没有共用的墙
        //可能不只一个公用的墙，都找出来
        let result = {
          type: 'no',
          walls: []
        }
        for (let i = 0; i < A.walls.length; i++) {
          for (let j = 0; j < B.walls.length; j++) {
            if (B.walls[j].id === A.walls[i].id) {
              result.type = 'yes'
              result.walls.push(A.walls[i])
            }
          }
        }
        return result
      },
      shareWallHasDoor(A, B, doors) {
        //A,B 是两个房间，判断两个房间有没有共用的墙
        for (let i = 0; i < A.walls.length; i++) {
          for (let j = 0; j < B.walls.length; j++) {
            if (B.walls[j].id === A.walls[i].id) {
              for (let k = 0; k < doors.length; k++) {
                if (doors[k].wall_id === B.walls[j].id) {
                  return {
                    type: 'yes',
                    wall: A.walls[i]
                  }
                }
              }
            }
          }
        }
        return {
          type: 'no'
        }
      },
      goThrough(A, B, cData) { // 可从A走到B
        let doors = Object.values(cData.doors);
        let points = cData.points;
        for (let i = 0; i < A.walls.length; i++) {
          for (let j = 0; j < B.walls.length; j++) {
            let bwall = B.walls[j];
            if (bwall.id === A.walls[i].id) {
              if (bwall.type == 'empty') {
                let len = this.getLength(points[bwall.start_id],points[bwall.end_id],'mm',cData.zoom);
                if (len > 400) {
                  return bwall;
                }
              } else {
                for (let k = 0; k < doors.length; k++) {
                  if (doors[k].wall_id === bwall.id) {
                    return doors[k];
                  }
                }
              }
            }
          }
        }
      },
      lightFromWell(target, cData) {
        let result = this.windowsinroomss(target, cData.chuangs);
        if (result.type === 'yes') {
          if (result.chuang.type === 'dark') {
            return true;
          }
        }
        return false;
      },
      getLightSideNum(cData) { // 判断采光面
        let total = 0,
          north = false,
          east = false,
          west = false,
          south = false;
        for (let key in cData.areas) {
          let area = cData.areas[key];
          if (area.claass !== 'room' || ['主卫','客卫','阳台','露台','花园'].includes(area.type)) {
            continue
          }
          let dirs = this.roomFaceTo(area, cData);
          if (dirs.includes('南')) {
            if (!south) {
              south = true
              total += 1
            }
          }
          if (dirs.includes('北')) {
            if (!north) {
              north = true
              total += 1
            }
          }
          if (dirs.includes('东')) {
            if (!east) {
              east = true
              total += 1
            }
          }
          if (dirs.includes('西')) {
            if (!west) {
              west = true
              total += 1
            }
          }
        }
        return total
      },
      getWallSquare(cData) { // 内墙面积, 外墙面积
        let outer = 0;
        let inner = 0;
        let wallList = Object.values(cData.walls).filter(x => {
          return x.type === 'real';
        });
        for (let i=0,len=wallList.length; i<len; i++) {
          let judge = (this.isOutWall(wallList[i], cData.areas)).length;
          let direction = wallList[i].direction;
          let length = this.getLength(cData.points[wallList[i].start_id], cData.points[wallList[i].end_id], 'mm', cData.zoom);
          if (judge === 1) {
            outer += length;
          } else if (judge > 1) {
            inner += length;
          }
        }
        return {
          outer: outer / 1000 * 0.1,
          inner: inner / 1000 * 0.1
        }
      },
      isOutWall(wall, areas) { // 判断是否是外墙, 只被一个房间用的叫外墙
        let rooms = Object.values(areas);
        let roomIds = [];
        for (let i=0; i<rooms.length; i++) {
          if (rooms[i].claass === 'free' || rooms[i].type === '电梯' || rooms[i].type === '花园') {
            continue;
          }
          let find = rooms[i].walls.find(x => {
            return x.id === wall.id;
          })
          if (find) {
            roomIds.push(rooms[i].id);
          }
          if (roomIds.length > 1) {
            break;
          }
        }
        return roomIds;
      },
      // 计算窗深比
      windowDepth() {
        
      },
      silentAreaNum(areas, moveObj) { // 动区，静区的个数
        let that = this;
        let list = ['主卧','次卧','书房','主卫'];
        let activeList = [];
        let silentList = [];
        areas.forEach(x => {
          if (x.claass !== 'free' && !['电梯','采光井'].includes(x.type)) {
            if (list.includes(x.type)) {
              silentList.push(x);
            } else {
              activeList.push(x);
            }
          }
        })
        let activeNum = 0;
        let silentNum = 0;
        let tempa = activeList.splice(0,1);
        while (activeList.length > 0) {
          let find = null;
          for (let i=0; i<tempa.length; i++) {
            let index = activeList.findIndex(x => {
              return that.shareWall(tempa[i], x).type == 'yes';
            })
            if (index > -1) {
              find = activeList.splice(index,1)[0];
              break;
            }
          }
          if (find) {
            tempa.push(find);
          } else {
            activeNum ++;
            tempa = activeList.splice(0,1);
          }
        }
        if (tempa.length > 0) {
          activeNum ++;
        }
        let temps = silentList.splice(0,1);
        while (silentList.length > 0) {
          let find = null;
          for (let i=0; i<temps.length; i++) {
            let index = silentList.findIndex(x => {
              return that.shareWall(temps[i], x).type == 'yes';
            })
            if (index > -1) {
              find = silentList.splice(index,1)[0];
              break;
            }
          }
          if (find) {
            temps.push(find);
          } else {
            silentNum ++;
            temps = silentList.splice(0,1);
          }
        }
        if (temps.length > 0) {
          silentNum ++;
        }

        moveObj.active = activeNum;
        moveObj.silent = silentNum;
      },
      // </analyse>



      // Getbright
      brightlight() {
        let a = 0
        let cvs = this.canvas;
        let ctx = this.context;
        for(var i=489;i<712;i++){
          console.time(i);
          for(var j=384;j<551;j++){
            a = this.bright(712-489,551-384,393,712,541,712,72,(j-384),223-(i-489))
            // console.log(a);
            if(a>=16.33){
              ctx.fillStyle = "#FF0000 "
            }else if(a>=13.0025 && a<18.33){
              ctx.fillStyle = "#FFA500"
            }else if(a>=10 && a<13.0025){
              ctx.fillStyle = "#FFFF00"
            }else if(a>=8 && a<10){
              ctx.fillStyle = "#ADFF2F"
            }else if(a>=7 && a<8){
              ctx.fillStyle = "#40E0D0"
            }else if(a<7){
              ctx.fillStyle = "#0000CD"
            }
            ctx.fillRect(j,i,1,1)
          }
          console.timeEnd(i)
          console.log("  ");
        }
      },

bright(alength, awidth, beginx, beginy, endx, endy, endz, Random_x, Random_y) {
    var length = endz;
    var width = awidth;
    beginx =beginx-384
    endx =endx-384 
    var dwidth = 0,
        lleft = 0
    if (beginx == endx) {
        var sp = Random_y
        var depth = Random_x
        dwidth = Math.abs(endy - beginy);
        lleft = Math.abs(beginy) 
                - dwidth/3
    } else {
        var depth = Random_y
        var sp = Random_x
        dwidth = Math.abs(endx - beginx);
        lleft = Math.abs(beginx) 
                + dwidth*5/8
    }     
    var result = 
    this.indoorlight(depth, sp, alength, width, length, dwidth, lleft,1)
    +this.indoorLlight(depth, sp, alength,  width, length, dwidth, lleft,0.7) 
    +this.indoorRlight(depth, sp, alength,  width, length, dwidth, lleft,0.8) 
    +this.indoorinlight(depth, sp, alength,  width, length, dwidth, lleft,0.85);
    return result
},

indoorlight(depth, sp, alength, width, length, dwidth, lleft,k) {
    var c = 5,
        d = -2.5,
        e = 0.3;
    var Z = 0,
        Az = 54 * Math.PI / 180,
        HL = 0,
        HR = 0,
        wl = 0,
        wr = 0,
        pi = Math.PI,
        Left = lleft,
        Dwdith = dwidth,
        Q = 0,
        x = 0,
        fx = 0,
        fZs = 0,
        io = 0,
        Lr = 0,
        Zs = 37 * pi / 180;
    //求和
    var sum = 0,
        G = 0,
        a = 0;
    var count = 0;
    for (var i = 0; i < 100; i++) {
        wr = Math.sqrt((dwidth + lleft - sp) * (dwidth + lleft - sp) + depth * depth)
        HR = Math.sqrt(length * length + wr * wr)
        if(k==1){
          G=1
        }else{
          G =  Math.abs(i*length*k/100)
        }
        for (var j = 0; j < 100; j++) {
            wl = Math.sqrt((sp - lleft) * (sp - lleft) + depth * depth)
            //侧边角Q
            Q = Math.abs(Math.atan(length / wl) / 100);
            // 左侧边
            HL = Math.sqrt(length * length + wl * wl)
            // 上角w
            var w = Math.abs(
                Math.acos((HL * HL + HR * HR - dwidth * dwidth) / (2 * HL * HR)) / 100
            )
            x = Math.abs(
                Math.acos(Math.cos(Zs) * Math.sin(Z) - Math.sin(Zs) * Math.sin(Z) * Math.cos(Az))
            )
            //  散射指标
            fx = (1 + c * (Math.exp(d * x) - Math.exp(d * pi / 2)) + e * Math.cos(x) * Math.cos(x))
            //  天顶值
            fZs = Math.abs(
                1 + c * (Math.exp(d * Zs) - Math.exp(d * pi / 2)) + e * Math.cos(Zs) * Math.cos(Zs)
            )
            //  标准渐变
            io = Math.abs((1 - Math.exp((-0.55) / Math.sin(Z))) / (1 - Math.exp(-0.55)))
            //  天空亮度
            Lr = Math.abs(fx * ((1 - Math.exp((-0.55) / Math.sin(Z))) / (1 - Math.exp(-0.55))) * 8.5192 / Math.abs(1 + c * (Math.exp(d * Zs) - Math.exp(d * pi / 2)) + e * Math.cos(Zs) * Math.cos(Zs)))
            Z = Q
            Az = Math.abs(Az + (100 - j) * w)
            a = Math.sin(Q) * Lr 
                  * G /10
            sum = (sum + a);
            // console.log(sum);
            lleft += Dwdith / 100
            dwidth = dwidth - Dwdith / 100
        }
        lleft = Left
        dwidth = Dwdith
    }
    sum = sum * Math.sin(Q);
    return sum
},
// 左侧反光
 indoorLlight(depth, sp, alength,  width, length, dwidth, lleft,k) {
    var f = 0.8;
    sp = sp * (-0.8)
    return (
        this.indoorlight(depth, sp, alength,  width, length, dwidth, lleft,k) * f
    )
},

// 右侧反光
 indoorRlight(depth, sp, alength,  width, length, dwidth, lleft,k) {
    var f = 0.8;
    sp = 1.8 * width - sp;
    return (
        this.indoorlight(depth, sp, alength,  width, length, dwidth, lleft,k) * f
    )
},

//直射反光
indoorinlight(depth, sp, alength,  width, length, dwidth, lleft,k) {
    var f = 0.3;
    depth = 1.3 * alength - depth
    return (
        this.indoorlight(depth, sp, alength,  width, length, dwidth, lleft,k) * f
    )
},
      

      // 出一些结果
      updateCanvasData() { // 保存画布数据
        let that = this
        if (that.lock) {
          return false;
        }
        that.lock = !that.lock
        if (!this.selectOption.imgName2 || this.selectOption.imgName2.length === 0) {
          console.log('没有户型编号')
          that.lock = !that.lock
          return
        }
        if (this.real_estate_id.length === 0) {
          console.log('没有楼盘id')
          that.lock = !that.lock
          return
        }

        let obj = {
          serial_number: this.selectOption.imgName2,
          real_estate_id: this.real_estate_id,
          mode: this.mode
        };

        if (that.mode === '单层') {
          let canvasData = {
            zoom: this.zoom,
            points: this.points,
            walls: this.walls,
            doors: this.doors,
            chuangs: this.chuangs,
            areas: this.areas,
            cabinets: this.cabinets,
            imgScale: this.imgScale
          };
          obj.canvas_data = JSON.stringify(canvasData);
        } else {
          let index = this.multi_data.findIndex(x => x.floor === this.current_floor);
          this.multi_data[index].zoom = this.zoom;
          this.multi_data[index].points = JSON.parse(JSON.stringify(this.points));
          this.multi_data[index].walls = JSON.parse(JSON.stringify(this.walls));
          this.multi_data[index].doors = JSON.parse(JSON.stringify(this.doors));
          this.multi_data[index].chuangs = JSON.parse(JSON.stringify(this.chuangs));
          this.multi_data[index].areas = JSON.parse(JSON.stringify(this.areas));
          this.multi_data[index].cabinets = JSON.parse(JSON.stringify(this.cabinets));
          this.multi_data.forEach(x => {
            x.imgScale = that.imgScale;
          })
          obj.multi_data = JSON.stringify(this.multi_data);
        }

        let param = {
          'db': 'WpApartmentModel',
          'model': 'apartment',
          'item': JSON.stringify(obj),
        };

        this.$axios.post(that.$url_prefix + 'updateData', param).then(function (res) {
          that.lock = !that.lock
          console.log('上传画布数据返回', res)
          that.$message({
            type: 'success',
            message: '保存成功'
          })
        }).catch(function (res) {
          that.lock = !that.lock
          console.log('上传画布数据失败', res)
          that.$message.error('保存失败');
        })

      },

      async leadingOut(debug) {
        let that = this;
        let real_estate_id = that.real_estate_id
        let serial_number = that.selectOption.imgName2
        let buildingSquare = parseInt(that.selectOption.imgName1)
        if (!real_estate_id || real_estate_id === '未定义') {
          console.log('没有楼盘id')
          return;
        } else if (!serial_number) {
          console.log('没有户型编号')
          return;
        } else if (!buildingSquare) {
          console.log('没有建筑面积')
          return;
        }
        let cData; // 画布数据
        let errMap = {
          points: '点',
          walls: '墙',
          chuangs: '窗',
          areas: '房间',
          doors: '门',
          cabinets: '柜子'
        }
        if (that.mode === '多层') {
          cData = {
            points: {},
            walls: {},
            chuangs: {},
            areas: {},
            doors: {},
            cabinets: {}
          }
          let multi_data = that.multi_data;
          for (let key in cData) {
            for (let i=0; i<multi_data.length; i++) {
              let fData = multi_data[i];
              if (!fData[key]) {
                fData[key] = {};
              }
              if (!(fData.floor < 0 || fData.floor == '夹层')) {
                if (key !== 'cabinets' && key !== 'chuangs' && Object.keys(fData[key]).length == 0) {
                  that.$message.error('没有' + errMap[key]);
                  return;
                }
                if (key == 'areas') {
                  for (let q in fData.areas) {
                    let area = fData.areas[q];
                    if (area.claass === 'room') {
                      // 判断有没有门
                      let has = false;
                      findDoor:
                      for (let j in fData.doors) {
                        for (let k = 0; k < area.walls.length; k++) {
                          if (fData.doors[j].wall_id === area.walls[k].id) {
                            // 房间的门应该通向公共区域
                            let ispb = false;
                            if (['主卧','次卧','书房'].includes(area.type)) {
                              find_pb:
                              for (let m in fData.areas) {
                                if (['餐厅','客餐厅','客厅','走道','玄关','室内楼梯'].includes(fData.areas[m].type)) {
                                  for (let n=0; n<fData.areas[m].walls.length; n++) {
                                    if (area.walls[k].id === fData.areas[m].walls[n].id) {
                                      ispb = true;
                                      break find_pb;
                                    }
                                  }
                                }
                              }
                            } else {
                              ispb = true;
                            }
                            if (ispb) {
                              has = true;
                              break findDoor;
                            }
                          }
                        }
                      }
                      if (!has) {
                        that.$message.error(area.name + '没有门');
                        return;
                      }
                      
                      // 判断朝向
                      if (!['花园','阳台','露台','客卫','主卫','辅助房间','餐厅'].includes(area.type)) {
                        let face = that.roomFaceTo(area, fData, true);
                        if (!face) {
                          that.$message.error(area.name + '没有朝向');
                          return;
                        }
                      }
                    }
                  }
                }
              }
              Object.assign(cData[key], fData[key]);
            }
          }
          if (Object.keys(cData.cabinets).length == 0) {
            that.$message.error('没有柜子');
          }
          cData.multi_data = multi_data;
        } else {
          cData = {
            points: that.points,
            walls: that.walls,
            chuangs: that.chuangs,
            areas: that.areas,
            doors: that.doors,
            cabinets: that.cabinets
          }
          for (let key in cData) {
            if (Object.keys(cData[key]).length == 0) {
              that.$message.error('没有' + errMap[key]);
              if (key != 'cabinets') {
                return;
              }
            }
          }
          for (let q in cData.areas) {
            let area = cData.areas[q];
            if (area.claass === 'room') {
              // 判断有没有门
              let has = false;
              findDoor:
              for (let j in cData.doors) {
                for (let k = 0; k < area.walls.length; k++) {
                  if (cData.doors[j].wall_id === area.walls[k].id) {
                    // 房间的门应该通向公共区域
                    let ispb = false;
                    if (['主卧','次卧','书房'].includes(area.type)) {
                      find_pb:
                      for (let m in cData.areas) {
                        if (['餐厅','客餐厅','客厅','走道','玄关','室内楼梯'].includes(cData.areas[m].type)) {
                          for (let n=0; n<cData.areas[m].walls.length; n++) {
                            if (area.walls[k].id === cData.areas[m].walls[n].id) {
                              ispb = true;
                              break find_pb;
                            }
                          }
                        }
                      }
                    } else {
                      ispb = true;
                    }
                    if (ispb) {
                      has = true;
                      break findDoor;
                    }
                  }
                }
              }
              if (!has) {
                that.$message.error(area.name + '没有门');
                return;
              }
              
              // 判断朝向
              if (!['花园','阳台','露台','客卫','主卫','辅助房间','餐厅'].includes(area.type)) {
                let face = that.roomFaceTo(area, cData, true);
                if (!face) {
                  that.$message.error(area.name + '没有朝向');
                  return;
                }
              }
            }
          }
        }

        // 判断户门
        let tList = ['玄关','走道','餐厅','客餐厅','客厅'];
        let hasDoor = false; // 有户门
        dOut:
        for (let k=0; k<tList.length; k++) {
          for (let rkey in cData.areas) {
            let room = cData.areas[rkey];
            if (room.type === tList[k]) {
              for (let i=0; i<room.walls.length; i++) {
                for (let dkey in cData.doors) {
                  let door = cData.doors[dkey];
                  if (door.wall_id === room.walls[i].id) {
                    if ((this.isOutWall(room.walls[i], cData.areas)).length === 1) {
                      door.type = '进户';
                      hasDoor = true;
                      if (debug) {
                        this.getMoves(Object.values(cData.areas), door, true);
                        return;
                      }
                      break dOut;
                    }
                  }
                }
              }
            }
          }
        }
        if (!hasDoor) {
          that.$message.error('没有户门');
          return;
        }

        cData = JSON.parse(JSON.stringify(cData));
        cData.zoom = this.zoom;
        if (cData.multi_data) {
          cData.multi_data.forEach(fData => {
            for (let key in fData.walls) {
              let wall = fData.walls[key];
              if (wall.type === 'real') {
                this.setVertex(wall, fData, true);
              }
            }
          })
        } else {
          for (let key in cData.walls) {
            let wall = cData.walls[key];
            if (wall.type === 'real') {
              this.setVertex(wall, cData, true);
            }
          }
        }

        let codeSrc;
        try {
          codeSrc = (await this.$axios.get(that.$url_prefix + 'getApartCode', {
            params: {
              estate_id: this.real_estate_id,
              serial_number: serial_number
            }
          })).data.data;
        } catch (err) {
          console.log('get code image fail', err);
          this.$message.error('获取小程序码失败');
          return;
        }
        if (!codeSrc) {
          console.log('get code image fail');
          this.$message.error('获取小程序码失败');
          return;
        }

        let codeImage = new Image();
        codeImage.onload = function () {
          let cvs = document.createElement('canvas')
          that.canvas = cvs;
          that.context = cvs.getContext('2d')
          let imageSize = that.drawOutData(cData, codeImage, serial_number);
          let dataURL = cvs.toDataURL("image/jpeg", 0.3);
          if (imageSize.width > imageSize.height) {
            that.outImageWidth = '500px'
            that.outImageHeight = 'auto'
          } else {
            that.outImageWidth = 'auto'
            that.outImageHeight = '500px'
          }
          that.outImageData = dataURL

          // 还原
          let oldcvs = document.getElementById('canvas');
          that.canvas = oldcvs;
          that.context = oldcvs.getContext('2d');
        }
        codeImage.onerror = function (err) {
          console.log('load code image err', err);
        }
        codeImage.src = codeSrc
      },
      drawOutData(cData, codeImage, serial_number) {
        let multi_data = cData.multi_data;
        delete cData.multi_data;
        let cvs = this.canvas;
        let ctx = this.context;
        let sizeObj = this.getTotalSize(Object.values(cData.points));
        let xlength = sizeObj.maxX - sizeObj.minX;
        let ylength = sizeObj.maxY - sizeObj.minY;
        let minLength = Math.min(xlength, ylength);
        let scale_num = parseFloat((1600 / minLength).toFixed(1));
        let space = 150; // 页边距
        let noteH = 100; // 注释高度
        let floorH = 50; // 多层画楼层的高度
        let infoH = 600; // 二维码，楼盘名，面积等信息的高度
        cvs.width = xlength * scale_num + space*2;
        let height = ylength * scale_num + space*2 + noteH + infoH;
        if (multi_data) {
          height = height + floorH;
        }
        cvs.height = height;

        ctx.clearRect(0, 0, 100000, 100000);
        ctx.save();

        let translateX = scale_num * sizeObj.minX - space;
        let translateY = scale_num * sizeObj.minY - space;
        ctx.translate(-translateX, -translateY);
        ctx.scale(scale_num, scale_num)

        // 画底色，出现了墙超出底图的情况，所以先垫一个底色
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, cvs.width, cvs.height);

        //画底图户型图
        let underImage = this.underImage;
        if (underImage) {
          ctx.drawImage(underImage, 250, 0, underImage.width*this.imgScale, underImage.height*this.imgScale);
        }

        if (multi_data) {
          multi_data.forEach(fData => {
            //画房间
            for (let key in fData.areas) {
              this.drawArea(fData.areas[key], fData, {
                isFinish: true
              });
            }
            //画墙
            for (let key in fData.walls) {
              let wall = fData.walls[key];
              if (wall.type === 'empty') {
                ctx.beginPath();
                ctx.moveTo(fData.points[wall.start_id].x, fData.points[wall.start_id].y);
                ctx.lineTo(fData.points[wall.end_id].x, fData.points[wall.end_id].y);
                ctx.strokeStyle = this.colorConfig.wall.line;
                ctx.lineWidth = 1 / fData.zoom;;
                ctx.stroke();
              }
            }
            for (let key in fData.walls) {
              let wall = fData.walls[key];
              if (wall.type === 'real') {
                this.drawWall(wall, fData.points, true);
              }
            }
            //画窗
            for (let key in fData.chuangs) {
              this.drawChuang(fData.chuangs[key])
            }
            //画门
            for (let key in fData.doors) {
              this.drawDoor(fData.doors[key])
            }
            //画柜子
            for (let key in fData.cabinets) {
              this.drawCabinet(fData.cabinets[key]);
            }
            //画赠送
            for (let key in fData.areas) {
              this.drawArea(fData.areas[key], fData, {
                isFinish: true,
                nfree: true
              });
            }
            //画墙的长度
            for (let key in fData.walls) {
              let wall = fData.walls[key];
              if (wall.type === 'real') {
                this.drawLength(wall, fData.points, fData.zoom, fData.areas);
              }
            }
          })

          let notes_dot = [(sizeObj.maxX + sizeObj.minX) / 2, sizeObj.maxY + (200 / scale_num)];
          this.drawNotes(notes_dot, 0, sizeObj.maxY + 100 / scale_num, sizeObj.maxX + 200 / scale_num, sizeObj.maxY + 250 / scale_num);

          // 画楼层
          for (let i=0; i<multi_data.length; i++) {
            let mSize = this.getTotalSize(Object.values(multi_data[i].points));
            let notes_dot = [(mSize.maxX + mSize.minX) / 2, mSize.maxY + (125 / scale_num)];

            let fontSize = 20 / cData.zoom
            ctx.font = fontSize + 'px SimHei';
            ctx.textAlign = 'start'
            ctx.fillStyle = "#000000";
            let floorStr = multi_data[i].floor + '层';
            if (['阁楼','夹层'].includes(multi_data[i].floor)) {
              floorStr = multi_data[i].floor;
            }
            let x = notes_dot[0] + 5/cData.zoom;
            let y = notes_dot[1] + 5/cData.zoom;
            let w = 40/cData.zoom;
            let h = 20/cData.zoom;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(x, y - h, w, h);
            ctx.fillStyle = "#000000";
            ctx.fillText(floorStr, x, y);
          }
        } else {
          //画房间
          for (let key in cData.areas) {
            this.drawArea(cData.areas[key], cData, {
              isFinish: true
            });
          }
          //画墙
          for (let key in cData.walls) {
            let wall = cData.walls[key];
            if (wall.type === 'empty') {
              ctx.beginPath();
              ctx.moveTo(cData.points[wall.start_id].x, cData.points[wall.start_id].y);
              ctx.lineTo(cData.points[wall.end_id].x, cData.points[wall.end_id].y);
              ctx.strokeStyle = this.colorConfig.wall.line;
              ctx.lineWidth = 1 / cData.zoom;;
              ctx.stroke();
            }
          }
          for (let key in cData.walls) {
            let wall = cData.walls[key];
            if (wall.type === 'real') {
              this.drawWall(wall, cData.points, true);
            }
          }
          //画窗
          for (let key in cData.chuangs) {
            this.drawChuang(cData.chuangs[key])
          }
          //画门
          for (let key in cData.doors) {
            this.drawDoor(cData.doors[key])
          }
          //画柜子
          for (let key in cData.cabinets) {
            this.drawCabinet(cData.cabinets[key]);
          }
          //画赠送
          for (let key in cData.areas) {
            this.drawArea(cData.areas[key], cData, {
              isFinish: true,
              nfree: true
            });
          }
          //画墙的长度
          for (let key in cData.walls) {
            let wall = cData.walls[key];
            if (wall.type === 'real') {
              this.drawLength(wall, cData.points, cData.zoom, cData.areas);
            }
          }

          let notes_dot = [(sizeObj.maxX + sizeObj.minX) / 2, sizeObj.maxY + (150 / scale_num)];
          this.drawNotes(notes_dot, 0, sizeObj.maxY + 100 / scale_num, sizeObj.maxX + 200 / scale_num, sizeObj.maxY + 200 / scale_num);
        }

        // 水印
        ctx.font = 50 / this.zoom + 'px SimHei';
        ctx.fillStyle = 'rgba(220,220,220,0.5)';
        ctx.textAlign = 'center';
        ctx.fillText('小鸡选房', (sizeObj.maxX + sizeObj.minX) / 2, (sizeObj.maxY + sizeObj.minY) / 2);

        ctx.restore();

        let sy = cvs.height - infoH;
        let codeWidth = 500;
        let sx = 50;
        ctx.drawImage(codeImage, sx, sy + 50, codeWidth, codeWidth);
        ctx.font = 90 + 'px SimHei';
        let serialStr = (this.selectOption.nick || serial_number) + '户型，' + this.selectOption.imgName1 + 'm²';
        let serialw = ctx.measureText(serialStr).width;
        ctx.fillText(serialStr, sx + infoH, sy + 250);
        ctx.font = 45 + 'px SimHei';
        ctx.fillText('(建面)', sx + infoH + serialw, sy + 250);
        ctx.font = 90 + 'px SimHei';
        ctx.fillText(this.real_estate_name, sx + infoH, sy + 390);
        
        return {
          width: cvs.width,
          height: cvs.height
        }
      },
      drawOtherImage(cData, type) {
        let cvs = this.canvas;
        let ctx = this.context;
        let sizeObj = this.getTotalSize(Object.values(cData.points));
        let xlength = sizeObj.maxX - sizeObj.minX;
        let ylength = sizeObj.maxY - sizeObj.minY;
        let minLength = Math.min(xlength, ylength);
        let scale_num = parseFloat((2000 / minLength).toFixed(1));
        cvs.width = xlength * scale_num + 200;
        cvs.height = ylength * scale_num + 200;

        ctx.clearRect(0, 0, 100000, 100000);

        let translateX = scale_num * sizeObj.minX - 100;
        let translateY = scale_num * sizeObj.minY - 100;
        ctx.translate(-translateX, -translateY);
        ctx.scale(scale_num, scale_num)

        //画底图户型图
        let underImage = this.underImage;
        if (underImage) {
          ctx.drawImage(underImage, 250, 0, underImage.width*this.imgScale, underImage.height*this.imgScale);
        }

        //画房间
        for (let key in cData.areas) {
          this.drawArea(cData.areas[key], cData, {
            isFinish: true,
            fillType: type
          });
        }
        //画墙
        for (let key in cData.walls) {
          let wall = cData.walls[key];
          if (wall.type === 'real') {
            this.drawWall(wall, cData.points, true);
          }
        }
        //画窗
        for (let key in cData.chuangs) {
          this.drawChuang(cData.chuangs[key])
        }
        //画门
        for (let key in cData.doors) {
          this.drawDoor(cData.doors[key])
        }
        //画墙的长度
        for (let key in cData.walls) {
          let wall = cData.walls[key];
          if (wall.type === 'real') {
            this.drawLength(wall, cData.points, cData.zoom, cData.areas);
          }
        }
      },
      getTotalSize(points) {
        let maxX = points[0].x;
        let minX = points[0].x;
        let maxY = points[0].y;
        let minY = points[0].y;
        for (let i = 0; i < points.length; i++) {
          if (points[i].x > maxX) {
            maxX = points[i].x
          }
          if (points[i].x < minX) {
            minX = points[i].x
          }

          if (points[i].y > maxY) {
            maxY = points[i].y
          }
          if (points[i].y < minY) {
            minY = points[i].y
          }
        }
        return {
          maxX,
          minX,
          maxY,
          minY
        }
      },
      async uploadImage(base_file) {
        let that = this;

        function dataURItoBlob(base64Data) {
          let byteString;
          if (base64Data.split(",")[0].indexOf("base64") >= 0) {
            byteString = atob(base64Data.split(",")[1]);
          } else {
            byteString = unescape(base64Data.split(",")[1]);
          }
          let mimeString = base64Data
            .split(",")[0]
            .split(":")[1]
            .split(";")[0];
          let ia = new Uint8Array(byteString.length);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          return new Blob([ia], {
            type: mimeString
          });
        };

        function randomNum(n) {
          let rnd = '';
          for (let i = 0; i < n; i++) {
            rnd += Math.floor(Math.random() * 10);
          }
          return rnd;
        };
        let upload_file = dataURItoBlob(base_file)
        console.log('image size KB', parseInt(upload_file.size/1000));
        let param = new FormData();
        const name = 'canvas_apartment' + that.real_estate_id + '_' + randomNum(6) + '.' + upload_file.type.split('/')[
          1]
        param.append('pic', upload_file, name);
        let config = {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        };
        let res;
        try {
          res = await that.$axios.post(that.$url_image, param, config);
        } catch (err) {
          console.log('upload image err', err);
          that.$close();
          this.$message.error('图片上传失败');
          return;
        }
        let img_url = that.$imageBase + res.data.url;
        return img_url;
      },

      async toUpdate() {
        this.$open();
        let img_url;
        if (this.outImageData) {
          img_url = await this.uploadImage(this.outImageData);
          if (!img_url) {
            return;
          }
          this.outImageData = null;
        }
        this.updateOne(img_url);
      },
      // 上传结果
      async updateOne(canvasImage) {
        let that = this
        let real_estate_id = that.real_estate_id
        let serial_number = that.selectOption.imgName2
        let buildingSquare = parseInt(that.selectOption.imgName1)

        let obj = {
          serial_number: serial_number,
          real_estate_id: real_estate_id,
          square: buildingSquare,
          version: 2
        };
        if (that.selectOption.house_type) {
          obj.house_type = that.selectOption.house_type
        }
        if (canvasImage) {
          obj.canvasImage = canvasImage;
        }
        if (that.mode === '多层') {
          let result = that.makeMultiData(that.multi_data, serial_number, buildingSquare, real_estate_id)
          if (!result.success) {
            alert(result.type)
            that.$close();
            return;
          }
          obj.building = JSON.stringify(result.baseInfoList);
          obj.multi_room = JSON.stringify(result.multi_room);
          if (result.label) {
            obj.label = JSON.stringify(result.label);
          } else {
            obj.label = '';
          }
          obj.mode = '多层';
          obj.room = '';
          obj.logical = '';

        } else {
          let canvasData = {
            zoom: this.zoom,
            points: this.points,
            walls: this.walls,
            doors: this.doors,
            chuangs: this.chuangs,
            areas: this.areas,
            cabinets: this.cabinets
          }
          let result = await that.makeData(canvasData, serial_number, buildingSquare, real_estate_id)
          if (!result.success) {
            alert(result.type)
            that.$close();
            return;
          }
          obj.building = JSON.stringify(result.baseInfoList);
          obj.room = JSON.stringify(result.roomInfoList);
          obj.logical = JSON.stringify(result.logicalInfoList);
          if (result.label) {
            obj.label = JSON.stringify(result.label);
          } else {
            obj.label = '';
          }
          obj.mode = '单层';
          obj.move = result.moveObj;
        }

        let param = {
          'db': 'WpApartmentModel',
          'model': 'apartment',
          'item': JSON.stringify(obj)
        };
        that.$axios.post(that.$url_prefix + 'updateData', param).then(function (res) {
          console.log('上传数据返回', res)
          that.$close();
          that.$message({
            type: 'success',
            message: '上传成功'
          })
        }).catch(function (res) {
          that.$close();
          console.log('上传数据失败', res);
        })

      },

      // 计算单层的数据
      async makeData(cData, serial_number, buildingSquare, consoleTarget) {
        let that = this
        let baseInfoList = []; //户型基本信息
        let label = { // 优劣势标签
          good: [],
          bad: [],
          tese: []
        };
        let squareArr = that.getAllRoomSquare(Object.values(cData.areas));
        let withinSquare = parseFloat(squareArr[0].toFixed(2))
        let defanglv = parseFloat((withinSquare / buildingSquare).toFixed(2))
        let defang = (defanglv * 100).toFixed(0) + '%'
        let allZengsong = that.getAllFreeSquare(Object.values(cData.areas))
        let zongkaijianObj = that.houseKaijian(cData)
        let chaonan = that.roomsToSouth(cData);
        let {outer, inner} = this.getWallSquare(cData);
        let noOutWall_s = parseFloat((withinSquare - outer).toFixed(1));
        let noOutWall_r = Math.round(noOutWall_s / buildingSquare * 100) + '%';
        let noWall_s = parseFloat((withinSquare - outer - inner).toFixed(1));
        let noWall_r = Math.round(noWall_s / buildingSquare * 100) + '%';
        let fzl =  parseFloat(((withinSquare**0.5 * 4) / (outer / 0.1)).toFixed(2));

        let shiweiting = that.shitingwei(Object.values(cData.areas));
        baseInfoList.push({
          buildingNumber: serial_number, //户型编号
          buildingSquare: buildingSquare, //建筑面积
          allRoomSquare: withinSquare, //赠送后实际套内面积
          defanglv: defanglv, //赠送后实际得房率
          defang: defang, //赠送后实际得房率
          allZengsong: allZengsong, //总赠送面积
          shiweiting: shiweiting, //户型配置：四室两厅两卫
          chaonan: chaonan, //朝南开间数
          zongkaijian: zongkaijianObj.kaijian,
          zongjinshen: zongkaijianObj.jingshen,
          zongrate: zongkaijianObj.rate,
          lightSide: that.getLightSideNum(cData),
          noOutWall_s,
          noOutWall_r,
          noWall_s,
          noWall_r,
          fzl
        });
        if (squareArr[1]) {
          baseInfoList[0].nopiao = (squareArr[1] / buildingSquare * 100).toFixed(0) + '%';
        }

        let roomInfoList = []; //房间信息列表
        let roomObj = {} //所有房间组成的对象，用来逻辑判断时方便取用，所有claass是room的、电梯、玄关、采光井
        let aisleFlag = false
        let aisle; //走道 合成一个
        let areas = Object.values(cData.areas);
        let doors = Object.values(cData.doors);
        this.csbMap = {};
        for (let i = 0; i < areas.length; i++) {
          if (areas[i].type === '未定义') {
            console.log('有未定义的', consoleTarget, serial_number)
            return {
              success: false,
              type: '有未定义的'
            }
          }
          if (areas[i].claass === 'room') {
            if (areas[i].type !== '辅助房间' && areas[i].type !== '花园' && areas[i].type !==
              '露台') {
              
              let bayDepth = that.getBayDepth(areas[i], cData, true)
              areas[i].kaijian = bayDepth.bay
              areas[i].jingshen = bayDepth.depth
              let pushObj = {
                name: areas[i].name,
                square: areas[i].square,
                kaijian: bayDepth.bay,
                jingshen: bayDepth.depth,
                rate: bayDepth.rate, //计算得分用的
                type: areas[i].type, //计算得分用的
                rate2: that.getSquareLevel(areas[i].square, areas[i].type),
                rate2_score: that.getSquareLevel2(areas[i].square, areas[i].type),
                sort: that.roomSort[areas[i].type]
              }
              if (bayDepth.csb) {
                this.csbMap[areas[i].id] = {
                  csb: (bayDepth.csb * 100).toFixed(1) + '%',
                  csbl: bayDepth.csbl
                }
                pushObj.csb = bayDepth.csb;
                pushObj.csbl = bayDepth.csbl;
              }
              if (['主卧','次卧'].includes(areas[i].type)) {
                let piao = that.getPiao(areas[i], cData.areas);
                if (piao) {
                  let bayDepthNP = this.getBayDepthNP(areas[i], cData, piao);
                  pushObj.depthNP = bayDepthNP.depth;
                }
                if (this.hasCabinet(areas[i])) {
                  pushObj.ymj = true;
                }
              }
              roomInfoList.push(pushObj);
            } else {
              roomInfoList.push({
                type: areas[i].type,
                name: areas[i].name,
                square: areas[i].square,
                sort: that.roomSort[areas[i].type]
              })
            }
            
            if (roomObj[areas[i].type]) {
              //已经有这个类别了
              roomObj[areas[i].type].push(areas[i])
            } else {
              roomObj[areas[i].type] = [areas[i]]
            }
          } else if (areas[i].type === '储物间') {
            roomInfoList.push({
              type: areas[i].type,
              name: areas[i].name,
              square: areas[i].square,
              sort: that.roomSort[areas[i].type]
            })
          } else if (areas[i].type === '走道') {
            if (!aisleFlag) {
              aisle = {
                name: '走道',
                square: areas[i].square,
                sort: that.roomSort[areas[i].type]
              }
              aisleFlag = true
            } else {
              aisle.square += areas[i].square
            }
          } else if (areas[i].type === '玄关') {
            roomInfoList.push({
              type: areas[i].type,
              name: areas[i].name,
              square: areas[i].square,
              sort: that.roomSort[areas[i].type]
            })
            if (roomObj[areas[i].type]) {
              //已经有这个类别了
              roomObj[areas[i].type].push(areas[i])
            } else {
              roomObj[areas[i].type] = [areas[i]]
            }
          } else if (areas[i].type === '电梯' || areas[i].type === '采光井') {
            if (roomObj[areas[i].type]) {
              //已经有这个类别了
              roomObj[areas[i].type].push(areas[i])
            } else {
              roomObj[areas[i].type] = [areas[i]]
            }
          }
        }
        if (aisle) {
          aisle.square = Math.round(aisle.square * 10) / 10
          roomInfoList.push(aisle)
        }
        let cabSquare = this.getCabinetSquare(Object.values(cData.cabinets), cData.zoom);
        if (cabSquare > 0) {
          roomInfoList.push({
            name: '储物柜',
            square: cabSquare,
            sort: that.roomSort['储物柜']
          })
        }

        //没有值的键给加上默认值
        for (let i = 0; i < roomInfoList.length; i++) {
          if (!roomInfoList[i].kaijian) {
            roomInfoList[i].kaijian = '/'
          }
          if (!roomInfoList[i].jingshen) {
            roomInfoList[i].jingshen = '/'
          }
          if (!roomInfoList[i].rate2) {
            roomInfoList[i].rate2 = '/'
          }
          if (!roomInfoList[i].rate2_score) {
            roomInfoList[i].rate2_score = 0
          }

        }

        //上传的房间信息列表排一下顺序，客厅在最前面
        roomInfoList.sort((a, b) => {
          let a1 = a.sort || 0
          let b1 = b.sort || 0
          return b1 - a1
        })

        //开始逻辑判断
        let sight_good = 0; // 用于判断 视线设计好坏
        let sight_bad = 0; // 用于判断 视线设计好坏
        let logicalInfoList = []; //逻辑判断信息列表
        let logicalInfoObj = {}; //某项逻辑判断
        let houseDoor; //户门
        let well = roomObj['采光井']; //采光井
        doors.forEach(door => {
          if (door.type === '进户') {
            houseDoor = door;
          }
        })

        let moveObj = await this.getMoves(areas, houseDoor);
        this.silentAreaNum(areas, moveObj);

        //判断是客厅还是客餐厅,客餐厅当做客厅
        let sitting_room;
        if (roomObj['客餐厅']) {
          logicalInfoObj = {
            o: '客餐厅',
            a: ['客餐厅一体化，整体大气'],
            b: []
          }
          //判断餐厅是否与厨房相邻
          if (roomObj['厨房']) {
            if (that.shareWall(roomObj['客餐厅'][0], roomObj['厨房'][0]).type === 'yes') {
              logicalInfoObj.a.push('餐厅和厨房相邻，方便使用')
            } else {
              logicalInfoObj.b.push('餐厅与厨房不相邻，使用略微不便')
            }
          }
          //当做客厅，判断有没有房间或者客卫的门开向客厅
          sitting_room = roomObj['客餐厅'][0]
          if (roomObj['厨房']) {
            //判断是否南北通透
            
          }

        } else {
          if (roomObj['客厅']) {
            logicalInfoObj = {
              o: '客厅',
              a: ['客厅与餐厅独立分开'],
              b: []
            }
            sitting_room = roomObj['客厅'][0]
            if (roomObj['餐厅'] && roomObj['厨房']) {
              //判断是否南北通透
              
            }
          }
          //判断餐厅是否与厨房相邻
          if (roomObj['餐厅'] && roomObj['厨房']) {
            if (that.shareWall(roomObj['餐厅'][0], roomObj['厨房'][0]).type === 'yes') {
              logicalInfoList.push({
                o: '餐厅',
                a: ['餐厅和厨房相邻，方便使用'],
                b: []
              })
            } else {
              logicalInfoList.push({
                o: '餐厅',
                a: [],
                b: ['餐厅与厨房不相邻，使用略微不便']
              })
            }
          }
        }
        //判断客厅有无阳台，是否南北通透
        if (sitting_room) {
          //判断有无阳台
          if (roomObj['阳台']) {
            for (let i = 0; i < roomObj['阳台'].length; i++) {
              if (that.shareWall(sitting_room, roomObj['阳台'][i]).type === 'yes') {
                logicalInfoObj.a.push('客厅与阳台相邻，方便晾晒与休闲')
                label.good.push('客厅带阳台');
                break
              }
            }
            if (logicalInfoObj.a.length < 2) {
              logicalInfoObj.b.push('客厅不与阳台相邻，不方便晾晒')
              label.bad.push('客厅不带阳台');
            }
          } else {
            logicalInfoObj.b.push('客厅不与阳台相邻，不方便晾晒')
            label.bad.push('客厅不带阳台');
          }

          logicalInfoList.push(logicalInfoObj)
        }
        let bedroom_big = true;
        //判断主卧：是否与电梯相邻，是否与户门相对，是否门直接开向客厅或者餐厅
        if (roomObj['主卧']) {
          for (let i = 0; i < roomObj['主卧'].length; i++) {
            if (that.getSquareLevel2(roomObj['主卧'][i].square, '主卧') < 75) {
              bedroom_big = false;
            }
            if (roomObj['主卧'][i].jingshen <= 3.3) {
              label.bad.push('卧室进深偏小');
            }
            logicalInfoObj = {
              o: roomObj['主卧'][i].name,
              a: [],
              b: []
            }
            if (roomObj['电梯']) {
              if (that.shareWall(roomObj['主卧'][i], roomObj['电梯'][0]).type === 'yes') {
                logicalInfoObj.b.push('与有噪声振动的电梯等设备用房直接相邻，可能有噪声影响')
                label.bad.push('卧室与电梯相邻')
              } else {
                logicalInfoObj.a.push('不与有噪声振动的电梯等设备用房直接相邻')
              }
            }
            if (houseDoor) {
              let result = that.doorinroomss(roomObj['主卧'][i], doors)
              if (result.type === 'yes') {
                if (that.drd(houseDoor, result.door, cData)) {
                  logicalInfoObj.b.push('主卧门与户门相对，隐私有干扰')
                  sight_bad ++;
                } else {
                  logicalInfoObj.a.push('主卧门不与户门相对，无隐私干扰')
                  sight_good ++;
                }
              }
            }
            if (sitting_room) {
              if (that.shareWallHasDoor(sitting_room, roomObj['主卧'][i], doors).type === 'yes') {
                logicalInfoObj.b.push('主卧的门开向客厅，对卧室有干扰')
                sight_bad ++;
              } else {
                logicalInfoObj.a.push('主卧的门不直接开向客厅，对卧室无干扰')
                sight_good ++;
              }
            }
            if (roomObj['餐厅']) {
              if (that.shareWallHasDoor(roomObj['餐厅'][0], roomObj['主卧'][i], doors).type === 'yes') {
                logicalInfoObj.b.push('主卧室的门开向餐厅，对卧室有干扰')
                sight_bad ++;
              } else {
                logicalInfoObj.a.push('主卧室的门不直接开向餐厅，对卧室无干扰')
                sight_good ++;
              }
            }
            if (logicalInfoObj.a.length > 0 || logicalInfoObj.b.length > 0) {
              logicalInfoList.push(logicalInfoObj)
            }
          }
        } else {
          bedroom_big = false;
        }
        //判断次卧：是否与电梯相邻，是否与户门相对，是否门直接开向客厅或者餐厅, 是否通过采光井采光
        if (roomObj['次卧']) {
          for (let i = 0; i < roomObj['次卧'].length; i++) {
            if (that.getSquareLevel2(roomObj['次卧'][i].square, '次卧') < 75) {
              bedroom_big = false;
            }
            if (roomObj['次卧'][i].jingshen <= 3.3) {
              label.bad.push('卧室进深偏小');
            }
            logicalInfoObj = {
              o: roomObj['次卧'][i].name,
              a: [],
              b: []
            }
            if (roomObj['电梯']) {
              if (that.shareWall(roomObj['次卧'][i], roomObj['电梯'][0]).type === 'yes') {
                logicalInfoObj.b.push('与有噪声振动的电梯等设备用房直接相邻，可能有噪声影响')
                label.bad.push('卧室与电梯相邻')
              } else {
                logicalInfoObj.a.push('不与有噪声振动的电梯等设备用房直接相邻')
              }
            }
            if (houseDoor) {
              let result = that.doorinroomss(roomObj['次卧'][i], doors)
              if (result.type === 'yes') {
                if (that.drd(houseDoor, result.door, cData)) {
                  logicalInfoObj.b.push('次卧室门与户门相对，对卧室内隐私有干扰')
                  sight_bad ++;
                } else {
                  logicalInfoObj.a.push('次卧室门不与户门相对，卧室无隐私视线干扰')
                  sight_good ++;
                }
              }
            }
            if (sitting_room) {
              if (that.shareWallHasDoor(sitting_room, roomObj['次卧'][i], doors).type === 'yes') {
                logicalInfoObj.b.push('次卧室的门开向客厅，对卧室有干扰')
                sight_bad ++;
              } else {
                logicalInfoObj.a.push('次卧室的门不直接开向客厅，对卧室无干扰')
                sight_good ++;
              }
            }
            if (roomObj['餐厅']) {
              if (that.shareWallHasDoor(roomObj['餐厅'][0], roomObj['次卧'][i], doors).type === 'yes') {
                logicalInfoObj.b.push('次卧室的门开向餐厅，对卧室有干扰')
                sight_bad ++;
              } else {
                logicalInfoObj.a.push('次卧室的门不直接开向餐厅，对卧室无干扰')
                sight_good ++;
              }
            }
            if (that.lightFromWell(roomObj['次卧'][i], cData)) {
              logicalInfoObj.b.push('次卧通过采光井采光')
            } else {
              logicalInfoObj.a.push('次卧直接对外采光')
            }
            if (logicalInfoObj.a.length > 0 || logicalInfoObj.b.length > 0) {
              logicalInfoList.push(logicalInfoObj)
            }
          }
        } else {
          bedroom_big = false;
        }
        if (bedroom_big) {
          label.good.push('卧室较大');
        }
        //判断书房：是否与电梯相邻，是否与厨房相邻，是否门直接开向客厅或者餐厅, 是否通过采光井采光
        if (roomObj['书房']) {
          for (let i = 0; i < roomObj['书房'].length; i++) {
            logicalInfoObj = {
              o: roomObj['书房'][i].name,
              a: [],
              b: []
            }
            if (roomObj['电梯']) {
              if (that.shareWall(roomObj['书房'][i], roomObj['电梯'][0]).type === 'yes') {
                logicalInfoObj.b.push('与有噪声振动的电梯等设备用房直接相邻，可能有噪声影响')
                label.bad.push('书房与电梯相邻')
              } else {
                logicalInfoObj.a.push('不与有噪声振动的电梯等设备用房直接相邻')
              }
            }
            if (roomObj['厨房']) {
              if (that.shareWall(roomObj['书房'][i], roomObj['厨房'][0]).type === 'yes') {
                logicalInfoObj.b.push('书房与厨房相邻，厨房操作及热水器可能有噪声的影响')
              } else {
                logicalInfoObj.a.push('书房不与厨房相邻，没有厨房操作及热水器噪声的影响 ')
              }
            }
            if (sitting_room) {
              if (that.shareWallHasDoor(sitting_room, roomObj['书房'][i], doors).type === 'yes') {
                logicalInfoObj.b.push('书房的门开向客厅，对书房有干扰')
                sight_bad ++;
              } else {
                logicalInfoObj.a.push('书房的门不直接开向客厅，对书房无干扰')
                sight_good ++;
              }
            }
            if (roomObj['餐厅']) {
              if (that.shareWallHasDoor(roomObj['餐厅'][0], roomObj['书房'][i], doors).type === 'yes') {
                logicalInfoObj.b.push('书房的门开向餐厅，对书房有干扰')
                sight_bad ++;
              } else {
                logicalInfoObj.a.push('书房的门不直接开向餐厅，对书房无干扰')
                sight_good ++;
              }
            }
            if (that.lightFromWell(roomObj['书房'][i], cData)) {
              logicalInfoObj.b.push('书房通过采光井采光')
            } else {
              logicalInfoObj.a.push('书房直接对外采光')
            }
            if (logicalInfoObj.a.length > 0 || logicalInfoObj.b.length > 0) {
              logicalInfoList.push(logicalInfoObj)
            }
          }
        }
        let toilet_num = 0;
        let toilet_all_bright = true;
        let toilet_dark = 0;
        //判断主卫，是明还是暗, 是否通过采光井采光
        if (roomObj['主卫']) {
          for (let i = 0; i < roomObj['主卫'].length; i++) {
            toilet_num ++;
            if (that.windowsinroomss(roomObj['主卫'][i], cData.chuangs).type === 'yes') {
              logicalInfoObj = {
                o: roomObj['主卫'][i].name,
                a: ['有窗，自然通风良好'],
                b: []
              }
              if (that.lightFromWell(roomObj['主卫'][i], cData)) {
                logicalInfoObj.b.push('主卫通过采光井采光')
              } else {
                logicalInfoObj.a.push('主卫直接对外采光')
              }
              logicalInfoList.push(logicalInfoObj)
            } else {
              logicalInfoList.push({
                o: roomObj['主卫'][i].name,
                a: [],
                b: ['无窗，自然通风排气略有不足']
              })
              toilet_dark ++;
              toilet_all_bright = false;
            }
          }
        }
        //判断客卫，是明还是暗，是否直接开向餐厅客厅, 是否通过采光井采光
        if (roomObj['客卫']) {
          for (let i = 0; i < roomObj['客卫'].length; i++) {
            toilet_num ++;
            logicalInfoObj = {
              o: roomObj['客卫'][i].name,
              a: [],
              b: []
            }
            if (that.windowsinroomss(roomObj['客卫'][i], cData.chuangs).type === 'yes') {
              logicalInfoObj.a.push('有窗，自然通风良好')
              if (that.lightFromWell(roomObj['客卫'][i], cData)) {
                logicalInfoObj.b.push('客卫通过采光井采光')
              } else {
                logicalInfoObj.a.push('客卫直接对外采光')
              }
            } else {
              logicalInfoObj.b.push('无窗，自然通风排气略有不足')
              toilet_dark ++;
              toilet_all_bright = false;
            }
            if (sitting_room) {
              if (that.shareWallHasDoor(sitting_room, roomObj['客卫'][i], doors).type === 'yes') {
                logicalInfoObj.b.push('卫生间门直接开向客厅，影响雅观')
                sight_bad ++;
              } else {
                logicalInfoObj.a.push('卫生间门不直接开向客厅，无影响')
                sight_good ++;
              }
            }
            if (roomObj['餐厅']) {
              if (that.shareWallHasDoor(roomObj['餐厅'][0], roomObj['客卫'][i], doors).type === 'yes') {
                logicalInfoObj.b.push('卫生间门直接开向餐厅，影响雅观')
                sight_bad ++;
              } else {
                logicalInfoObj.a.push('卫生间门没有直接开向餐厅，无影响')
                sight_good ++;
              }
            }
            logicalInfoList.push(logicalInfoObj)
          }
        }
        if (toilet_num >=3) {
          label.good.push(toilet_num + '个卫生间');
        }
        if (toilet_all_bright) {
          label.good.push('全明卫')
        }
        if (toilet_num > 0) {
          let tr = toilet_dark / toilet_num;
          if (tr > 0.49) {
            label.bad.push('暗卫');
          }
        }
        //有没有宽阳台
        if (roomObj['阳台']) {
          if (roomObj['阳台'].length >= 2) {
            label.good.push(roomObj['阳台'].length + '个阳台');
          }
          for (let i = 0; i < roomObj['阳台'].length; i++) {
            if (roomObj['阳台'][i].kaijian >= 5) {
              label.tese.push('大阳台');
              label.good.push('阳台宽' + roomObj['阳台'][i].kaijian.toFixed(1) + '米');
              logicalInfoList.push({
                o: roomObj['阳台'][i].name,
                a: ['宽阳台，视野开阔舒适'],
                b: []
              })
            }
          }
        }
        //有无玄关
        if (roomObj['玄关']) {
          logicalInfoList.push({
            o: '玄关',
            a: ['入口处设置玄关，有利于室内外空间过渡，保护室内隐私'],
            b: []
          })
          label.good.push('有玄关');
        } else {
          logicalInfoList.push({
            o: '玄关',
            a: [],
            b: ['入口处未设置玄关，不利于室内外空间过渡，保护室内隐私']
          })
          label.bad.push('无玄关');
        }

        // 特色
        if (roomObj['花园']) {
          label.tese.push('花园');
        } else if (roomObj['露台']) {
          label.tese.push('露台');
        }

        // 优劣势标签
        if (defanglv >= 0.9) {
          label.good.push('得房率' + defang);
        }
        if (zongkaijianObj.kaijian >= 10) {
          label.good.push('总开间' + zongkaijianObj.kaijian + '米');
        }
        if (chaonan >= 3) {
          label.good.push(chaonan + '个朝南开间');
        }
        if (roomObj['客餐厅']) {
          if (that.getSquareLevel2(roomObj['客餐厅'][0].square, '客餐厅') >= 75) {
            label.good.push('客餐厅较大');
          }
        } else if (roomObj['客厅'] && roomObj['餐厅']) {
          if (that.getSquareLevel2(roomObj['客厅'][0].square, '客厅') >= 75) {
            label.good.push('客厅较大');
          }
          if (that.getSquareLevel2(roomObj['餐厅'][0].square, '餐厅') >= 75) {
            label.good.push('餐厅较大');
          }
        }
        if (roomObj['厨房'] && houseDoor) {
          logicalInfoObj = {
            o: '厨房',
            a: [],
            b: []
          }
          let result = that.doorinroomss(roomObj['厨房'][0], doors)
          if (result.type === 'yes') {
            let rcenter = {
              x: (result.door.start.x + result.door.end.x) / 2,
              y: (result.door.start.y + result.door.end.y) / 2
            }
            let hcenter = {
              x: (houseDoor.start.x + houseDoor.end.x) / 2,
              y: (houseDoor.start.y + houseDoor.end.y) / 2
            }
            let pxDistance = Math.abs(rcenter.x - hcenter.x) + Math.abs(rcenter.y - hcenter.y);
            let mDistance = pxDistance * 20 * cData.zoom / 1000;
            if (mDistance <= 5) {
              label.good.push('户门到厨房近');
              logicalInfoObj.a.push('户门到厨房近')
            } else if (mDistance >= 8) {
              label.bad.push('户门到厨房远')
              logicalInfoObj.b.push('户门到厨房远')
            }
          }
          let cabs = that.cabinetInRoom(roomObj['厨房'][0]);
          if (cabs.length === 1) {
            let cab = cabs[0];
            if (cab.shape === 'L型') {
              logicalInfoObj.b.push('L型厨房')
            } else if (cab.shape === 'U型') {
              logicalInfoObj.a.push('U型厨房')
              label.good.push('U型厨房');
            }
          }
          logicalInfoList.push(logicalInfoObj);
        }
        if (sight_good > 0 && sight_bad === 0) {
          label.good.push('视线设计好');
        } else if (sight_bad > 3) {
          label.bad.push('视线设计差');
        }


        // 计算得分
        let f11 = baseInfoList[0].defanglv * 20;
        if (f11 > 20) {
          f11 = 20;
        }
        let roomNum = parseInt(shiweiting);
        let f12 = roomNum / 4 * 10;
        if (f12 > 10) {
          f12 = 10;
        }
        let f13 = chaonan / 4 * 10;
        if (f13 > 10) {
          f13 = 10;
        }
        let f1 = f11 + f12 + f13;
        let f2 = 0;
        for (let i = 0; i < roomInfoList.length; i++) {
          if (roomInfoList[i].type === '主卧') {
            let x = roomInfoList[i].rate / 0.85
            if (x > 1) {
              x = 1
            }
            f2 = f2 + (roomInfoList[i].square / 15) * 10 * x * 0.19

          } else if (roomInfoList[i].type === '次卧') {
            let x = roomInfoList[i].rate / 0.85
            if (x > 1) {
              x = 1
            }
            f2 = f2 + (roomInfoList[i].square / 12) * 10 * x * 0.06

          } else if (roomInfoList[i].type === '书房') {
            let x = roomInfoList[i].rate / 1
            if (x > 1) {
              x = 1
            }
            f2 = f2 + (roomInfoList[i].square / 9) * 10 * x * 0.04

          } else if (roomInfoList[i].type === '客餐厅') {
            let x = roomInfoList[i].rate / 0.7
            if (x > 1) {
              x = 1
            }
            f2 = f2 + (roomInfoList[i].square / 15) * 10 * x * 0.29

          } else if (roomInfoList[i].type === '客厅') {
            let x = roomInfoList[i].rate / 0.85
            if (x > 1) {
              x = 1
            }
            f2 = f2 + (roomInfoList[i].square / 15) * 10 * x * 0.21

          } else if (roomInfoList[i].type === '餐厅') {
            let x = roomInfoList[i].rate / 0.85
            if (x > 1) {
              x = 1
            }
            f2 = f2 + (roomInfoList[i].square / 12) * 10 * x * 0.08

          } else if (roomInfoList[i].type === '厨房') {
            f2 = f2 + (roomInfoList[i].square / 7.5) * 10 * 0.14

          } else if (roomInfoList[i].type === '主卫') {
            f2 = f2 + (roomInfoList[i].square / 5) * 10 * 0.15

          } else if (roomInfoList[i].type === '次卫') {
            f2 = f2 + (roomInfoList[i].square / 5) * 10 * 0.15

          } else if (roomInfoList[i].type === '阳台') {
            f2 = f2 + (roomInfoList[i].square / 9) * 10 * 0.13

          }
        }
        f2 = f2 * 3 / 1.3 * 0.75; // 0.75是总分从40分变成30分
        if (f2 > 30) {
          f2 = 30;
        }
        baseInfoList[0].space_score = parseInt(f2 / 30 * 100);
        let goodCount = 0;
        let badCount = 0;
        for (let i = 0; i < logicalInfoList.length; i++) {
          goodCount = goodCount + logicalInfoList[i].a.length
          badCount = badCount + logicalInfoList[i].b.length
        }
        let f3 = goodCount - badCount;
        if (f3 > 30) {
          f3 = 30;
        }
        let f = f1 + f2 + f3
        if (f > 100) {
          f = 100
        } else {
          f = Math.round(f)
        }

        baseInfoList[0].f1 = parseFloat((f1 / 40 * 5).toFixed(1));
        baseInfoList[0].f2 = parseFloat((f2 / 30 * 5).toFixed(1));
        baseInfoList[0].f3 = parseFloat((f3 / 30 * 5).toFixed(1));

        if (!f) {
          console.log('没有得分', consoleTarget, serial_number)
          return {
            success: false,
            type: '计算得分失败'
          }
        }

        baseInfoList[0].score = f + '分'

        let allData = {
          success: true,
          logicalInfoList: logicalInfoList,
          roomInfoList: roomInfoList,
          baseInfoList: baseInfoList,
          moveObj: moveObj
        }

        if (label.good.length > 0 || label.bad.length > 0 || label.tese.length > 0) {
          let last_label = {};
          if (label.good.length > 0) {
            last_label.good = Array.from(new Set(label.good));
          }
          if (label.bad.length > 0) {
            last_label.bad = Array.from(new Set(label.bad));
          }
          if (label.tese.length > 0) {
            last_label.tese = Array.from(new Set(label.tese));
          }
          if (Object.keys(last_label).length > 0) {
            allData.label = last_label;
          }
        }

        return allData;
      },
      hasCabinet(target) { // 判断衣帽间
        let num = 0;
        for (let key in this.cabinets) {
          if (num >= 2) {
            break;
          }
          let cab = this.cabinets[key];
          for (let i=0; i<cab.path.length; i++) {
            let dot = cab.path[i];
            if (this.isInArea(dot, target)) {
              if (cab.shape == 'L型' || cab.shape == 'U型') {
                num += 2;
              } else {
                num += 1;
              }
              break;
            }
          }
        }
        return num >= 2;
      },
      cabinetInRoom(target) {
        let list = [];
        for (let key in this.cabinets) {
          let cab = this.cabinets[key];
          for (let i=0; i<cab.path.length; i++) {
            let dot = cab.path[i];
            if (this.isInArea(dot, target)) {
              list.push(cab);
              break;
            }
          }
        }
        return list;
      },

      // 计算多层的数据
      makeMultiData(multiData, serial_number, buildingSquare, consoleTarget) {
        let that = this
        let squareInfo = [];
        let multi_room = [];
        let withinSquare = 0;
        let allZengsong = 0;
        let lightSide = 0;
        let wholeBaseInfo = {};
        let chaonan = 0;
        let allAreas = [];
        let label = { // 优劣势标签
          good: [],
          bad: [],
          tese: []
        };
        for (let i = 0, len = multiData.length; i < len; i++) {
          let floor = multiData[i].floor;
          allAreas = allAreas.concat(Object.values(multiData[i].areas));
          let makeBack = that.makeMultiDataOne(multiData[i], serial_number, consoleTarget);
          if (!makeBack.success) {
            return {
              success: false
            };
          }
          let baseInfo = makeBack.baseInfo;
          squareInfo.push({
            floor: floor,
            roomSquare: baseInfo.allRoomSquare,
            zengsong: baseInfo.allZengsong
          })
          multi_room.push({
            floor: floor,
            room: makeBack.roomInfoList
          })
          if (![-1,-2,'夹层'].includes(floor)) {
            if (baseInfo.lightSide > lightSide) {
              lightSide = baseInfo.lightSide;
            }
            chaonan += baseInfo.chaonan
          }
          
          withinSquare += baseInfo.allRoomSquare
          allZengsong += baseInfo.allZengsong
          if (floor === 1) {
            wholeBaseInfo.zongkaijian = baseInfo.zongkaijian
            wholeBaseInfo.zongjinshen = baseInfo.zongjinshen
            wholeBaseInfo.zongrate = baseInfo.zongrate
          }

          let label_one = makeBack.label;
          label.good = label.good.concat(label_one.good);
          label.bad = label.bad.concat(label_one.bad);
          label.tese = label.tese.concat(label_one.tese);
        }

        wholeBaseInfo.buildingNumber = serial_number
        wholeBaseInfo.buildingSquare = buildingSquare
        wholeBaseInfo.allRoomSquare = withinSquare.toFixed(1)
        wholeBaseInfo.allZengsong = allZengsong.toFixed(1)
        wholeBaseInfo.chaonan = chaonan
        wholeBaseInfo.lightSide = lightSide
        wholeBaseInfo.defanglv = parseFloat((withinSquare / buildingSquare).toFixed(2))
        wholeBaseInfo.defang = Math.round((withinSquare / buildingSquare) * 100) + '%'
        wholeBaseInfo.shiweiting = that.shitingwei(allAreas)
        wholeBaseInfo.multi_square = squareInfo
       
        let allData = {
          success: true,
          multi_room: multi_room,
          baseInfoList: [wholeBaseInfo]
        }

        if (label.good.length > 0 || label.bad.length > 0 || label.tese.length > 0) {
          let last_label = {};
          if (label.good.length > 0) {
            last_label.good = Array.from(new Set(label.good));
          }
          if (label.bad.length > 0) {
            last_label.bad = Array.from(new Set(label.bad));
          }
          if (label.tese.length > 0) {
            last_label.tese = Array.from(new Set(label.tese));
          }
          if (Object.keys(last_label).length > 0) {
            allData.label = last_label;
          }
        }

        return allData;
      },
      // 计算多层的其中一层的数据
      makeMultiDataOne(cData, serial_number, consoleTarget) {
        let that = this
        let label = { // 优劣势标签
          good: [],
          bad: [],
          tese: []
        };
        let zongkaijianObj = that.houseKaijian(cData)
        let baseInfo = {
          chaonan: that.roomsToSouth(cData), //朝南开间数
          zongkaijian: zongkaijianObj.kaijian,
          zongjinshen: zongkaijianObj.jingshen,
          zongrate: zongkaijianObj.rate,
          lightSide: that.getLightSideNum(cData)
        }
        let squareArr = that.getAllRoomSquare(Object.values(cData.areas));
        baseInfo.allRoomSquare = parseFloat(squareArr[0].toFixed(2))
        if (cData.floor < 0 || cData.floor === '阁楼' || cData.floor === '夹层') {
          baseInfo.allZengsong = baseInfo.allRoomSquare
        } else {
          baseInfo.allZengsong = that.getAllFreeSquare(Object.values(cData.areas))
        }

        let roomInfoList = []; //房间信息列表
        let aisleFlag = false
        let aisle; //走道 合成一个
        let areas = Object.values(cData.areas);
        let doors = Object.values(cData.doors);
        for (let i = 0; i < areas.length; i++) {
          if (areas[i].type === '未定义') {
            console.log('有未定义的', consoleTarget, serial_number)
            return {
              success: false,
              type: '有未定义的'
            }
          }
          if (areas[i].claass === 'room') {
            if (areas[i].type !== '辅助房间' && areas[i].type !== '花园' && areas[i].type !==
              '露台') {
              let bayDepth = that.getBayDepth(areas[i], cData)
              areas[i].kaijian = bayDepth.bay
              areas[i].jingshen = bayDepth.depth
              roomInfoList.push({
                type: areas[i].type,
                name: areas[i].name,
                square: areas[i].square,
                kaijian: bayDepth.bay,
                jingshen: bayDepth.depth,
                rate2: that.getSquareLevel(areas[i].square, areas[i].type),
                rate2_score: that.getSquareLevel2(areas[i].square, areas[i].type),
                sort: that.roomSort[areas[i].type]
              })
            } else {
              if (areas[i].type == '花园') {
                label.tese.push('花园');
              } else if (areas[i].type == '露台') {
                label.tese.push('露台');
              }
              roomInfoList.push({
                type: areas[i].type,
                name: areas[i].name,
                square: areas[i].square,
                sort: that.roomSort[areas[i].type]
              })
            }

          } else if (['储物间','玄关','室内楼梯','室内电梯'].includes(areas[i].type)) {
            roomInfoList.push({
              type: areas[i].type,
              name: areas[i].name,
              square: areas[i].square,
              sort: that.roomSort[areas[i].type]
            })
          } else if (areas[i].type === '走道') {
            if (!aisleFlag) {
              aisle = {
                name: '走道',
                square: areas[i].square,
                sort: that.roomSort[areas[i].type]
              }
              aisleFlag = true
            } else {
              aisle.square += areas[i].square
            }
          }
        }
        if (aisle) {
          aisle.square = Math.round(aisle.square * 10) / 10
          roomInfoList.push(aisle)
        }
        let cabSquare = this.getCabinetSquare(Object.values(cData.cabinets), cData.zoom);
        if (cabSquare > 0) {
          roomInfoList.push({
            name: '储物柜',
            square: cabSquare,
            sort: that.roomSort['储物柜']
          })
        }

        //没有值的键给加上默认值
        for (let i = 0; i < roomInfoList.length; i++) {
          if (!roomInfoList[i].kaijian) {
            roomInfoList[i].kaijian = '/'
          }
          if (!roomInfoList[i].jingshen) {
            roomInfoList[i].jingshen = '/'
          }
          if (!roomInfoList[i].rate2) {
            roomInfoList[i].rate2 = '/'
          }
          if (!roomInfoList[i].rate2_score) {
            roomInfoList[i].rate2_score = 0
          }
        }

        //上传的房间信息列表排一下顺序，客厅在最前面
        roomInfoList.sort((a, b) => {
          let a1 = a.sort || 0
          let b1 = b.sort || 0
          return b1 - a1
        })

        return {
          success: true,
          roomInfoList: roomInfoList,
          baseInfo: baseInfo,
          label: label
        }
      },

      changeVersion(cData) { // 把前一版的数据格式转化为新版格式
        console.log('cData', cData);
        let that = this
        let points = {};
        let walls = {};
        let doors = {};
        let chuangs = {};
        let areas = {};
        let zoom = cData.zoom;
        cData.walls.forEach(wall => {
          let start = {
            x: wall.start[0],
            y: wall.start[1]
          };
          let end = {
            x: wall.end[0],
            y: wall.end[1]
          };
          let same = false;
          for (let key in points) {
            if (that.isTheSameDot(start, points[key])) {
              same = true;
              wall.start_id = key;
              if (!points[key].walls.includes(wall.id)) {
                points[key].walls.push(wall.id);
              }
              break;
            }
          }
          if (!same) {
            let point = new that.Point({
              that: that,
              x: start.x,
              y: start.y
            })
            points[point.id] = point;
            wall.start_id = point.id;
            point.walls.push(wall.id);
          }
          same = false;
          for (let key in points) {
            if (that.isTheSameDot(end, points[key])) {
              same = true;
              wall.end_id = key;
              if (!points[key].walls.includes(wall.id)) {
                points[key].walls.push(wall.id);
              }
              break;
            }
          }
          if (!same) {
            let point = new that.Point({
              that: that,
              x: end.x,
              y: end.y
            })
            points[point.id] = point;
            wall.end_id = point.id;
            point.walls.push(wall.id);
          }
          let nWall = new that.Wall({
            that: that,
            start_id: wall.start_id,
            end_id: wall.end_id,
            radius: Math.round(wall.radius * 20 * zoom),
            type: wall.type
          });
          nWall.id = wall.id;
          walls[wall.id] = nWall;
        })
        let shapeMap = {
          "move_door": '移门',
          "one_door": '单开',
          "two_door": '双开',
        }
        cData.doors.forEach(door => {
          let center = door.center;
          if (!door.start) {
            let half = door.width / 2 / 20 / zoom;
            if (door.direction === '水平') {
              door.start = [center[0]-half,center[1]];
              door.end = [center[0]+half,center[1]];
            } else {
              door.start = [center[0],center[1]-half];
              door.end = [center[0],center[1]+half];
            }
          }
          let nDoor = new that.Door({
            that: that,
            start: {
              x: door.start[0],
              y: door.start[1]
            },
            end: {
              x: door.end[0],
              y: door.end[1]
            },
            radius: Math.round(door.radius * 20 * zoom),
            shape: shapeMap[door.shape],
            wall_id: door.wall_id
          })
          nDoor.id = door.id;
          that.setVertex(nDoor, {
            zoom: zoom
          })
          doors[nDoor.id] = nDoor;
        })
        cData.chuang.forEach(chuang => {
          let center = chuang.center;
          if (!chuang.start) {
            let half = chuang.width / 2 / 20 / zoom;
            if (chuang.direction === '水平') {
              chuang.start = [center[0]-half,center[1]];
              chuang.end = [center[0]+half,center[1]];
            } else {
              chuang.start = [center[0],center[1]-half];
              chuang.end = [center[0],center[1]+half];
            }
          }
          let nDoor = new that.Chuang({
            that: that,
            start: {
              x: chuang.start[0],
              y: chuang.start[1]
            },
            end: {
              x: chuang.end[0],
              y: chuang.end[1]
            },
            radius: Math.round(chuang.radius * 20 * zoom),
            shape: '一字型',
            type: chuang.type,
            wall_id: chuang.wall_id
          })
          nDoor.id = chuang.id;
          that.setVertex(nDoor, {
            zoom: zoom
          })
          chuangs[nDoor.id] = nDoor;
        })
        for (let key in walls) {
          let wall = walls[key];
          that.setVertex(wall, {
            zoom: zoom,
            points: points,
            walls: walls
          })
        }
        cData.areas.forEach(area => {
          let wallList = area.wallList;
          if (wallList) {
            delete area.wallList;
            let center = area.center;
            if (!center) {
              center = wallList[0].start;
            }
            area.center = {
              x: center[0],
              y: center[1]
            }
            for (let i=0; i<wallList.length; i++) {
              wallList[i] = JSON.parse(JSON.stringify(walls[wallList[i].id]));
            }
            that.sortRoomWall(wallList, {
              zoom: zoom,
              points: points,
              walls: walls
            })
            area.walls = wallList;
            areas[area.id] = area;
          }
        })
        return {
          zoom: zoom,
          points: points,
          walls: walls,
          doors: doors,
          chuangs: chuangs,
          areas: areas
        }
      },

      sortRoomWall(walls, cData) {
        let theWall = walls[0];
        if (cData.points[theWall.start_id].y < cData.points[theWall.end_id].y) {
          let mid = theWall.end_id;
          theWall.end_id = theWall.start_id;
          theWall.start_id = mid;
        }
        this.setVertex(theWall, cData);
        for (let i=1; i<walls.length; i++) {
          let wall = walls[i];
          if (wall.end_id === theWall.end_id) {
            let mid = wall.end_id;
            wall.end_id = wall.start_id;
            wall.start_id = mid;
          }
          this.setVertex(wall, cData);
          theWall = wall;
        }
      },

      turnCabinet() {
        let target = this.selectObj;
        console.log('turnCabinet');
        if (target.shape === 'L型') {
          let path = JSON.parse(JSON.stringify(target.path));
          let A = path[0],
              B = path[1],
              C = path[2];
          let y;
          if (Math.abs(A.y - B.y) < this.accuracy) {
            y = (B.y + C.y) / 2;
          } else {
            y = (A.y + B.y) / 2;
          }
          path.forEach(p => {
            let dif = p.y - y;
            p.y = p.y - dif*2;
          })
          let temp = path[0];
          path[0] = path[2];
          path[2] = temp;
          temp = path[3];
          path[3] = path[5];
          path[5] = temp;
          target.path = path;
          this.redrawAll();
        }
      },

      async getMoves(areas, houseDoor, debug) {
        let openArea = [];
        let chuf = null;
        let kw = null;
        let moves = [];
        areas.forEach(one => {
          if (one.type === '厨房') {
            chuf = one;
          } else if (one.type === '客卫') {
            kw = one;
          }
          if (one.claass == 'pass') {
            openArea.push(one);
          } else if (['客厅','餐厅','客餐厅'].includes(one.type)) {
            openArea.push(one);
          }
        })
        areas.forEach(one => {
          if (kw && ['次卧','书房'].includes(one.type)) {  // 房间到公卫
            moves.push({
              openArea: openArea.concat([kw]),
              from: one,
              to: kw,
              plans: [{
                from: one,
                to: kw,
                pass: {},
                path: []
              }]
            })
          }
        })
        // 户门到厨房
        if (chuf && houseDoor) {
          moves.push({
            openArea: openArea.concat([chuf]),
            from: houseDoor,
            to: chuf,
            plans: [{
              from: houseDoor,
              to: chuf,
              pass: {},
              path: []
            }]
          })
        }

        let result = [];
        for (let k=0; k<moves.length; k++) {
          let move = moves[k];
          let openArea = move.openArea;
          let plans = move.plans;
          jMove:
          while (true) {
            let newPlans = []; 
            for (let i=0; i<plans.length; i++) {
              let plan = plans[i];
              let nexts = this.getNextRooms(plan.from, openArea, plan.pass);
              for (let n =0; n<nexts.length; n++) {
                let next = nexts[n];
                let room = next.room;
                let tplan = JSON.parse(JSON.stringify(plan));
                tplan.pass[room.id] = 1;
                tplan.from = room;
                tplan.path.push(next);
                if (room.id == tplan.to.id) {
                  move.path = tplan.path;
                  result.push(move);
                  break jMove;
                } else {
                  newPlans.push(tplan);
                }
              }
            }
            if (newPlans.length === 0) {
              break;
            }
            plans = newPlans;
          }
        }

        if (debug) {
          for (let i=0; i<result.length; i++) {
            let move = result[i];
            this.drawPath(result[i].path);
          }
          return;
        }

        let cData = {
          points: this.points,
          walls: this.walls,
          chuangs: this.chuangs,
          areas: this.areas,
          doors: this.doors,
          cabinets: this.cabinets
        }

        cData = JSON.parse(JSON.stringify(cData));
        cData.zoom = this.zoom;
        for (let key in cData.walls) {
          let wall = cData.walls[key];
          if (wall.type === 'real') {
            this.setVertex(wall, cData, true);
          }
        }

        let lightImage = await this.getLightImage(cData);
        // let detailImage = await this.getDetailImage(cData);

        let cvs = document.createElement('canvas');
        this.canvas = cvs;
        this.context = cvs.getContext('2d')
        this.drawOtherImage(cData, '动线');
        let detail = [];
        for (let i=0; i<result.length; i++) {
          let move = result[i];
          let dis = this.drawPath(move.path);
          let level;
          if (dis < 3) {
            level = 'A级';
          } else if (dis < 6) {
            level = 'B级';
          } else if (dis >= 6) {
            level = 'C级';
          }
          if (move.from.claass == 'door') {
            detail.push({
              way: '户门到' + move.to.name,
              dis: dis,
              level: level
            })
          } else {
            detail.push({
              way: move.from.name + '到' + move.to.name,
              dis: dis,
              level: level
            })
          }
        }
        let dataURL = cvs.toDataURL("image/jpeg", 0.3);
        let img_url = await this.uploadImage(dataURL);

        // 还原
        let oldcvs = document.getElementById('canvas');
        this.canvas = oldcvs;
        this.context = oldcvs.getContext('2d');

        return {
          detail: detail,
          image: img_url,
          lightImage: lightImage,
          // detailImage: detailImage
        }
      },
      getNextRooms(from, openArea, pass) {
        let rooms = [];
        for (let i=0; i<openArea.length; i++) {
          let area = openArea[i];
          
          if (!pass[area.id]) {
            if (from.claass === 'door') {
              let r = area.walls.find(x => x.id == from.wall_id);
              if (r) {
                rooms.push({
                  room: area,
                  way: from
                });
              }
            } else {
              let result = this.goThrough(from, area, {
                zoom: this.zoom,
                points: this.points,
                doors: this.doors
              })
              if (result) {
                rooms.push({
                  room: area,
                  way: result
                });
              }
            }
          }
        }
        return rooms;
      },
      drawPath(path) {
        let dotList = [];
        while (dotList.length === 0) {
          for (let i=0; i<path.length; i++) {
            let way = path[i].way;
            let start = way.start || this.points[way.start_id];
            let end = way.end || this.points[way.end_id];
            let center = {
              x: (start.x + end.x) / 2,
              y: (start.y + end.y) / 2
            }
            if (path[i].center) {
              center = path[i].center;
            }
            dotList.push(center);
            if (i < path.length - 1) {
              let nway = path[i+1].way;
              let nstart = nway.start || this.points[nway.start_id];
              let nend = nway.end || this.points[nway.end_id];
              let ncenter = {
                x: (nstart.x + nend.x) / 2,
                y: (nstart.y + nend.y) / 2
              }
              let dot = this.getVerticalCross(start,end,nstart,nend, center, ncenter);
              if (dot) {
                dotList.push(dot);
              } else {
                if (path[i+1].center) {
                  ncenter = path[i+1].center;
                }
                // 在同一水平或竖直线上
                let move = 400 / 20 / this.zoom;
                let room = path[i].room;
                if (Math.abs(ncenter.x - center.x) < 0.01 && Math.abs(ncenter.x - start.x) < 0.01) { // 竖直
                  let dot1,dot2;
                  if (room.center.x - center.x > 0.01) {
                    dot1 = {
                      x: center.x + move,
                      y: center.y
                    }
                    dot2 = {
                      x: ncenter.x + move,
                      y: ncenter.y
                    }
                  } else {
                    dot1 = {
                      x: center.x - move,
                      y: center.y
                    }
                    dot2 = {
                      x: ncenter.x - move,
                      y: ncenter.y
                    }
                  }
                } else if (Math.abs(ncenter.y - center.y) < 0.01 && Math.abs(ncenter.y - start.y) < 0.01) { // 水平
                  let dot1,dot2;
                  if (room.center.y - center.y > 0.01) {
                    dot1 = {
                      x: center.x,
                      y: center.y + move
                    }
                    dot2 = {
                      x: ncenter.x,
                      y: ncenter.y + move
                    }
                  } else {
                    dot1 = {
                      x: center.x,
                      y: center.y - move
                    }
                    dot2 = {
                      x: ncenter.x,
                      y: ncenter.y - move
                    }
                  }
                  dotList.push(dot1);
                  dotList.push(dot2);
                } else {
                  // 看相对还是不相对
                  if (way.claass !== 'door') {
                    way = JSON.parse(JSON.stringify(way));
                    way.start = this.points[way.start_id];
                    way.end = this.points[way.end_id];
                  }
                  if (nway.claass !== 'door') {
                    nway = JSON.parse(JSON.stringify(nway));
                    nway.start = this.points[nway.start_id];
                    nway.end = this.points[nway.end_id];
                  }
                  let wan = true;
                  if (this.drd(way, nway)) {
                    let difx = Math.abs(ncenter.x - center.x);
                    let dify = Math.abs(ncenter.y - center.y);
                    let pre = {
                      x: center.x,
                      y: center.y
                    }
                    if (difx - dify < 0) {
                      pre.x = ncenter.x;
                    } else {
                      pre.y = ncenter.y;
                    }
                    if (this.dotOnLine(pre, start, end)) {
                      wan = false;
                      let tempc = {
                        x: pre.x,
                        y: pre.y
                      }
                      if (!path[i].center) {
                        path[i].center = tempc;
                        dotList = [];
                        break;
                      } else {
                        if (Math.abs(path[i].center.x - tempc.x) > 0.01 || Math.abs(path[i].center.y - tempc.y)) {
                          path[i].center = tempc;
                          dotList = [];
                          break;
                        }
                      }
                    }
                  }
                  if (wan) {
                    let dot1,dot2;
                    if (Math.abs(start.x - end.x) < 0.01) { // 竖直
                      dot1 = {
                        x: (center.x + ncenter.x) / 2,
                        y: center.y
                      }
                      dot2 = {
                        x: dot1.x,
                        y: ncenter.y
                      }
                    } else { // 水平
                      dot1 = {
                        x: center.x,
                        y: (center.y + ncenter.y) / 2
                      }
                      dot2 = {
                        x: ncenter.x,
                        y: dot1.y
                      }
                    }
                    dotList.push(dot1);
                    dotList.push(dot2);
                  }
                }
              }
            }
          }
        }

        let first = dotList[0];
        let last = dotList[dotList.length - 1];

        let ctx = this.context;
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([5 / this.zoom])
        let totalDis = 0;
        ctx.moveTo(first.x,first.y);
        for (let i=1; i<dotList.length; i++) {
          ctx.lineTo(dotList[i].x, dotList[i].y);
          let dis = this.getLength(dotList[i], dotList[i-1], 'mm');
          totalDis += dis;
        }
        ctx.lineWidth = 4;
        ctx.strokeStyle = this.colorConfig.sRed;
        ctx.stroke();
        ctx.restore();

        let radius = 4;
        ctx.fillStyle = this.colorConfig.sRed;
        ctx.beginPath();
        ctx.arc(first.x, first.y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(last.x, last.y, radius, 0, 2 * Math.PI);
        ctx.fill();

        return parseFloat((totalDis / 1000).toFixed(1));
      },
      getVerticalCross(A,B,M,N, center1, center2) { // A,B的中垂线 与 M,N的中垂线的交点
        let dir1 = '水平';
        let dir2 = '水平';
        if (Math.abs(A.x - B.x) < 0.01) {
          dir1 = '竖直';
        }
        if (Math.abs(M.x - N.x) < 0.01) {
          dir2 = '竖直';
        }
        if (dir1 == dir2) {
          return false;
        }
        let dot = {};
        if (dir1 == '水平') {
          return {
            x: center1.x,
            y: center2.y
          }
        } else {
          return {
            x: center2.x,
            y: center1.y
          }
        }
      },

      async getLightImage(cData) {
        let cvs = document.createElement('canvas');
        this.canvas = cvs;
        this.context = cvs.getContext('2d')
        this.drawOtherImage(cData, '窗深比');
        
        let dataURL = cvs.toDataURL("image/jpeg", 0.3);
        let img_url = await this.uploadImage(dataURL);

        return img_url;
      },
      async getDetailImage(cData) {
        // let cvs = document.createElement('canvas');
        // this.canvas = cvs;
        // this.context = cvs.getContext('2d')
        // this.drawOtherImage(cData, '细节');
        
        // let dataURL = cvs.toDataURL("image/jpeg", 0.3);
        // let img_url = await this.uploadImage(dataURL);

        // return img_url;
      },

    },
  }

</script>

<style scoped>
  .left-control {
    width: 200px;
    position: fixed;
    left: 0;
    top: 0;
    text-align: center;
    user-select: none;
  }

  input {
    outline: none;
  }

  .input-file {
    overflow: hidden;
    position: relative;

  }

  #input_image {
    position: absolute;
    right: 0;
    top: 0;
    font-size: 200px;
    opacity: 0;
  }

  .result-box {
    background-color: #fff;
    height: 400px;
    overflow-y: auto;
    position: absolute;
    z-index: 2;
    width: 100%;
  }


  /* 公共 */
  .item-top {
    background-color: #e7e7e7;
    height: 30px;
    line-height: 30px;
    border-bottom: 1px solid #000;
  }

  .item-bottom {
    display: flex;
    flex-wrap: wrap;
    background-color: #acfff5;
  }

  .item-bottom1 {
    background-color: #acfff5;
  }

  .flex1 {
    flex: 1;
    height: 30px;
    line-height: 30px;
    border-bottom: 1px solid #000;
  }

  .flex1-plus {
    flex: 1;
    height: 40px;
    line-height: 40px;
    border-bottom: 1px solid #000;
  }

  .flex2 {
    width: 33.3%;
    height: 30px;
    line-height: 30px;
    border-bottom: 1px solid #000;
    box-sizing: border-box;
  }

  .border-left {
    border-left: 1px solid #000;
  }

  .input-text {
    height: 20px;
    width: 50%;
    line-height: 40px;
  }

  .acolor {
    background: #FF1493;
  }

  .image-background {
    position: fixed;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    background-color: rgba(169, 169, 169, 0.8);
    z-index: 8;
    text-align: center;
  }

  .image-preview {
    margin-top: 200px;
    background-color: #fff;
    text-align: center;
    border: 1px solid #865ea7;
    padding: 10px;
    display: inline-block;
  }

  .image-handle {
    border-top: 1px solid #865ea7;
    padding-top: 10px;
  }

  #wall_length {
    position: absolute;
    left: 0;
    top: 0;
    display: inline-block;
    padding: 1px 4px;
    border: 1px solid #9fb7db;
    background-color: #ffffff;
  }

  #wall_length div {
    overflow: hidden;
    outline: none;
    line-height: 15px;
    font-size: 15px;
    padding-left: 2px;
  }

</style>
