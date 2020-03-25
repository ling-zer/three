<template>
  <div id="container"></div>
</template>

<script>
import * as THREE from "three";
import { OBJLoader, MTLLoader } from "three-obj-mtl-loader";
import { OrbitControls } from "../common/tool/OrbitControls";
export default {
  data() {
    return {
      /**场景 */
      scene: null,
      /**相机 */
      camera: null,
      /**渲染 */
      renderer: null,
      /**控制器 */
      controls: null,
      /**射线投射器 */
      raycaster: null,
      /**鼠标 */
      mouse: null,
      /**屋顶 */
      roof: null, 
      group: null,
      requestId: null
    };
  },
  methods: {
    /**初始化 */
    initScene() {
      this.scene = new THREE.Scene();
      const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
      this.scene.add(ambientLight);
      var axisHelper = new THREE.AxisHelper(15);
      this.scene.add(axisHelper);
    },
    initCamera() {
      const aspect = window.innerWidth / window.innerHeight; //宽高可根据实际项目要求更改
      this.camera = new THREE.PerspectiveCamera(45, aspect, 1, 2000);
      this.camera.position.set(15, 25, 20);
      this.camera.lookAt(new THREE.Vector3(0, 0, 0)); // 让相机指向原点
      const pointLight = new THREE.PointLight(0xffffff, 0.8);
      this.camera.add(pointLight);
      this.scene.add(this.camera);
    },
    initRenderer() {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(window.innerWidth, window.innerHeight); //宽高可根据实际项目要求更改
      const container = document.getElementById("container");
      container.appendChild(this.renderer.domElement);
    },
    initControl() {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.target = new THREE.Vector3(0, 0, 0);
    },
    animate() {
      var radius = this.controls.getSpherical().radius;
      if(this.roof) {
        if(radius && radius < 22) {
          this.roof.children[0].material.visible = false;
        } else {
          this.roof.children[0].material.visible = true;
        }
      }
      
      this.renderer.render(this.scene, this.camera);
      this.requestId = requestAnimationFrame(this.animate);
    },
    init() {
      this.group = new THREE.Group();
      this.initScene();
      this.initCamera();
      this.initRenderer();
      this.initControl();
      this.initRaycater();
    },
    /**加载模型 */
    loadPlant() {
      let that = this;
      let objLoader = new OBJLoader();
      let mtlLoader = new MTLLoader();
      mtlLoader.load("/static/models/厂房无盖.mtl", function(materials) {
        // materials.preload();
        objLoader.setMaterials(materials);
        objLoader.load(
          "/static/models/厂房无盖.obj",
          function(obj) {
            obj.position.set(10, 0, -6);
            obj.scale.set(0.01, 0.01, 0.01);
            that.group.add(obj);
          },
          // called while loading is progressing
          function(xhr) {
            console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
          },
          // called when loading has errors
          function(error) {
            console.log("An error happened");
          }
        );
      });
    },
    loadRoof() {
      let that = this;
      let objLoader = new OBJLoader();
      objLoader.load(
        "/static/models/厂房盖子.obj",
        function(obj) {
          obj.position.set(10, 0, -6);
          obj.scale.set(0.01, 0.01, 0.01);
          that.scene.add(obj);
          that.roof = obj;
        },
        // called while loading is progressing
        function(xhr) {
          console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        // called when loading has errors
        function(error) {
          console.log("An error happened");
        }
      );
    },
    loadModel() {
      let that = this;
      let objLoader = new OBJLoader();
      objLoader.load(
        "/static/models/亚托克斯.obj",
        function(obj) {
          obj.position.set(-10, 0.5, -2);
          obj.scale.set(0.02, 0.02, 0.02);
          // console.log(obj);
          obj.$data = { //给obj绑定信息
            name: '亚托克斯'
          }
          that.group.add(obj);
          that.scene.add(that.group);
        },
        // called while loading is progressing
        function(xhr) {
          console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        // called when loading has errors
        function(error) {
          console.log("An error happened");
        }
      );
    },
     /**绘制矩形 */
    drawRect(ctx) {
      ctx.strokeStyle = "#0864ee";
      ctx.strokeRect(0, 0, 380, 170);
      ctx.fillStyle = "rgba(10,18,51,0.8)";
      ctx.fillRect(1, 1, 378, 168);
      // ctx.scale(2, 2)
    },
    createCanvas() {
      /* 创建画布 */
      var canvas = document.createElement("canvas");
      var context = canvas.getContext("2d");
      canvas.width = 380 * 2;
      canvas.height = 170 * 2;
      context.scale(2, 2);
      this.drawRect(context);
      
      /* 字体颜色 */
      context.fillStyle = "rgba(255,255,255,1)";
      context.font = "16px bold";
      /**文字 */
      context.fillText("模型名称：", 10, 20);
      context.fillText("我是模型", 100, 20);
      context.fillText("模型：", 10, 40);
      context.fillText("ABCDEFG", 100, 40);
      return canvas;
    },
    createSprite() {
      var texture = new THREE.Texture(this.createCanvas());
      texture.needsUpdate = true;

      var spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      var sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(1.5, 1, 1);
      return sprite;
    },
    initRaycater() {
      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector3();
    },
    clickModel(event) {
      let x = (event.offsetX  / window.innerWidth) * 2 - 1;
      let y = -(event.offsetY / window.innerHeight) * 2 + 1;
      this.mouse.set(x, y, 0.5);
      this.raycaster.setFromCamera(this.mouse, this.camera);
      var intersects = this.raycaster.intersectObject(
        this.group,
        true
      ); //参数1：检测对象，参数2：是否检测该对象的children
      if(intersects.length) {
        const res = intersects.filter(res => res && res.object)[0];
        if (res && res.object && res.object.parent.$data) { //是否为绑定了自定义数据的模型
          res.object.material.color.set(0xff0000);
        }
      }
      
    },
    onResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  },
  mounted() {
    this.init();
    this.loadPlant();
    this.loadRoof();
    // this.loadBox();
    this.loadModel();
    this.animate();
    document.getElementsByTagName("canvas")[0].style.verticalAlign = "bottom"; //解决canvas底部留白问题
    window.addEventListener("click", this.clickModel, false);
    window.addEventListener("resize", this.onResize, false);
  },
  destroyed() {
    cancelAnimationFrame(this.requestId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    window.removeEventListener("resize", this.onResize, false);
    window.removeEventListener("resize", this.onResize, false);
  }
};
</script>

<style scoped>

</style>