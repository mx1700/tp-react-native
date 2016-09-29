app 初始化整理


复制 js 文件夹
复制 index.ios 文件内容，注意最后一行不复制

安装无 native 组件
base-64 moment react-native-keyboard-spacer react-native-navbar react-native-swipe-list-view react-native-root-toast 
react-native-gesture-responder react-native-scroller react-addons-pure-render-mixin
无 native 模块：

"base-64": "^0.1.0",
//"js-md5": "^0.4.1",
 "moment": "^2.14.1”,
react-native-keyboard-spacer
react-native-navbar
react-native-swipe-list-view 列表滑动按钮
react-native-root-toast
react-addons-pure-render-mixin  可以不用
react-native-gesture-responder 拖动相关，自动安装
react-native-scroller  未知

---------------------------------------
有 native 模块

react-native-code-push
react-native-device-info

react-native-fabric
react-native-fabric-crashlytics

react-native-image-picker
react-native-image-resize
react-native-vector-icons


codepush:
1. npm install --save react-native-code-push@latest
2. react-native link react-native-code-push
3. 输入部署 key

device-info：
1. npm install --save react-native-device-info
2. react-native link react-native-device-info

image-picker:
1. npm install react-native-image-picker@latest --save
2. react-native link react-native-image-picker

image-resizer:
1. npm install --save react-native-image-resizer
2. react-native link react-native-image-resizer

vector-icons:
1. npm install react-native-vector-icons --save
2. react-native link react-native-vector-icons



xcode 配置
General 里
Display Name 胶囊日记
Bundle Identifier net.timepill.diary-app

启动 fabric
按照引导安装
npm install react-native-fabric react-native-fabric-crashlytics --save
react-native link react-native-fabric

启动页

增加相册与相机访问权限

修改语言

应用图标

增加 http 权限
在NSAppTransportSecurity下添加NSAllowsArbitraryLoads类型Boolean,值设为YES

编译失败解决：
http://blog.it985.com/13723.html
进到项目目录，把DerivedData文件夹删了，重新编译


---------

---------

npm i react-native-image-crop-picker@master --save
react-native link react-native-image-crop-picker

有个 bug，在有键盘的时候调用摄像头会报错，0.9.5还未修复，master 已经修复，可以从 master 复制代码到 node_mudule 文件夹里

Drag and drop the ios/ImageCropPickerSDK folder to your xcode project. (Make sure Copy items if needed IS ticked)
上边一部可以不用做
Click on project General tab
Under Deployment Info set Deployment Target to 8.0
Under Embedded Binaries click + and add RSKImageCropper.framework and QBImagePicker.framework


-----------
jpush

自动安装有问题，最后两个 objc 的方法没有复制进去，需要手动复制
PushNotificationIOS 需要手动安装


------------
0.33 & 0.34 有一个 图片 的崩溃 bug
https://github.com/facebook/react-native/pull/10147
解决办法是手动改代码