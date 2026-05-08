+++
date = '2026-05-08T23:46:11+08:00'
draft = false
tags = ["代码片段", "Godot","网络","GDScript"]
title = '用GDScript实现扫码登陆Bilibili获取到SESSDATA'
+++
# Godot中使用GDScript 实现 Bilibili 扫码登录获取 SESSDATA 流程

本文档总结 Godot 项目中通过 Bilibili 扫码登录获取 `SESSDATA` 的核心逻辑，代码位于脚本的 `需要用户登陆` 区域。

## 功能概述
- 调用 Bilibili 官方接口生成登录二维码，在应用内展示。
- 定时轮询二维码扫描状态，检测用户是否已扫码并确认登录。
- 扫码成功后通过登录链接交换得到 `SESSDATA`，并持久化到项目存储中。
- 提供回调机制通知调用方登录结果（成功/失败）。
## 源代码
```
# 扫码登录相关变量
var qr_window: Window = null
var _poll_timer: Timer
var on_qr_login_result: Callable

func start_qr_login(login_callback: Callable) -> void:
	on_qr_login_result = login_callback
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(_on_qr_generated)
	var err = http.request("https://passport.bilibili.com/x/passport-login/web/qrcode/generate", PackedStringArray(), HTTPClient.METHOD_GET)

func _on_qr_generated(result: int, response_code: int, _headers: PackedStringArray, body: PackedByteArray) -> void:
	if response_code != 200: return
	var json = JSON.new()
	if json.parse(body.get_string_from_utf8()) != OK: return
	var data = json.get_data()["data"]
	var url = data["url"]
	var qrcode_key = data["qrcode_key"]
	_display_qrcode(url)
	_poll_login_status(qrcode_key)

func _display_qrcode(content: String) -> void:
	qr_window = preload("res://Scene/Log_in.tscn").instantiate()
	qr_window.close_requested.connect(_on_qr_window_closed)
	add_child(qr_window)
	var encoded = content.uri_encode()
	var qr_api = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encoded
	var img_request = HTTPRequest.new()
	add_child(img_request)
	img_request.request_completed.connect(func(_r, _c, _h, body):
		if not is_instance_valid(qr_window):
			return
		var img = Image.new()
		if img.load_png_from_buffer(body) == OK:
			var tex = ImageTexture.create_from_image(img)
			qr_window.get_node("QRImage").texture = tex
		else:
			push_error("二维码图片加载失败")
	)
	img_request.request(qr_api, PackedStringArray(), HTTPClient.METHOD_GET)

func _on_qr_window_closed() -> void:
	if qr_window:
		qr_window.queue_free()
		qr_window = null
	if _poll_timer:
		_poll_timer.stop()
		_poll_timer.queue_free()
		_poll_timer = null
	if on_qr_login_result:
		on_qr_login_result.call(false)

func _close_qr_window() -> void:
	if qr_window:
		qr_window.queue_free()
		qr_window = null
	if _poll_timer:
		_poll_timer.stop()
		_poll_timer.queue_free()
		_poll_timer = null

func _poll_login_status(qrcode_key: String) -> void:
	_poll_timer = Timer.new()
	_poll_timer.wait_time = 2.0
	_poll_timer.autostart = true
	_poll_timer.timeout.connect(_check_qr_status.bind(qrcode_key))
	add_child(_poll_timer)

func _check_qr_status(qrcode_key: String) -> void:
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(func(result, response_code, headers, body):
		if response_code != 200: return
		var json = JSON.new()
		if json.parse(body.get_string_from_utf8()) != OK: return
		var data = json.get_data()["data"]
		var code = data["code"]
		if code == 0:
			_exchange_cookie(data["url"])
			if on_qr_login_result:
				on_qr_login_result.call(true)
			_close_qr_window()
		elif code == 86038:
			if on_qr_login_result:
				on_qr_login_result.call(false)
			_close_qr_window()
	)
	http.request("https://passport.bilibili.com/x/passport-login/web/qrcode/poll?qrcode_key=" + qrcode_key, PackedStringArray(), HTTPClient.METHOD_GET)

func _exchange_cookie(login_url: String) -> void:
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(func(result, response_code, headers, body):
		for header in headers:
			if header.begins_with("Set-Cookie: SESSDATA="):
				var sess = header.split("=")[1].split(";")[0]
				GdScriptFunc.set_data("AccountData","SESSDATA",sess)
				break
	)
	http.request(login_url, PackedStringArray(), HTTPClient.METHOD_GET)
```
## 核心流程
1. **发起登录**  
   调用 `start_qr_login(login_callback)` 开始流程，传入一个回调函数用于接收登录结果。

2. **生成二维码**  
   请求 `/x/passport-login/web/qrcode/generate` 接口，获取 `url`（登录页面链接）和 `qrcode_key`（轮询标识）。
   - URL 被编码后作为参数调用第三方二维码生成 API（`api.qrserver.com`），生成二维码图片并显示在 UI 窗口上。

3. **展示二维码窗口**  
   实例化一个预制的场景（`res://Scene/Log_in.tscn`），将二维码图片设置到 `QRImage` 节点上，并监听窗口关闭事件以终止流程。

4. **轮询扫码状态**  
   启动一个 `Timer`，每 2 秒请求 `/x/passport-login/web/qrcode/poll` 接口，携带 `qrcode_key`。
   - 若返回 `code == 0` 表示登录成功，执行 `_exchange_cookie` 兑换 `SESSDATA`。
   - 若返回 `code == 86038` 表示二维码已失效，终止流程。
   - 其他状态继续轮询。

5. **兑换 SESSDATA**  
   使用回调返回的 `url`（登录票据链接）发送 GET 请求，从响应头 `Set-Cookie` 中提取 `SESSDATA` 字段。
   - `GdScriptFunc.set_data("AccountData", "SESSDATA", sess)` 将值持久化。

6. **回调通知**  
   无论成功或失败（二维码过期/窗口关闭），最终调用 `on_qr_login_result` 回调函数，传入布尔值表示登录是否成功。

## 关键函数说明

### `start_qr_login(login_callback: Callable)`
- 入口函数，保存回调、创建 `HTTPRequest` 发起生成二维码的请求。

### `_on_qr_generated(result, response_code, headers, body)`
- 解析二维码生成接口的响应，获取 `url` 和 `qrcode_key`，然后调用 `_display_qrcode` 和 `_poll_login_status`。

### `_display_qrcode(content: String)`
- 实例化 UI 窗口（`Log_in.tscn`），通过第三方 API 将登录链接转为二维码图片并加载到窗口纹理上。

### `_poll_login_status(qrcode_key: String)`
- 创建定时器，每 2 秒触发 `_check_qr_status` 轮询。

### `_check_qr_status(qrcode_key: String)`
- 调用轮询接口，根据返回的 `code` 决定下一步：
  - `code == 0`：登录成功，调用 `_exchange_cookie` 并关闭窗口，回调 `true`。
  - `code == 86038`：失效，关闭窗口，回调 `false`。
  - 其他：继续等待。

### `_exchange_cookie(login_url: String)`
- 请求登录票据 URL，从响应头中解析 `SESSDATA`，存入 `AccountData`。

### `_on_qr_window_closed()`
- 窗口关闭时的清理：销毁窗口、停用定时器，并回调 `false`。

## 环境依赖
- **Godot Engine** 4.x（使用 `HTTPRequest`、`Timer`、`Window` 等节点）
- **项目全局方法** `GdScriptFunc.set_data/get_data` 用于数据持久化
- **UI 模板** `res://Scene/Log_in.tscn` 必须包含名为 `QRImage` 的 `TextureRect` 节点用于展示二维码
- **流程图**
```
start_qr_login()
  ├─ HTTP GET /qrcode/generate
  │    └─ 获取 url, qrcode_key
  ├─ _display_qrcode(url)
  │    └─ 显示二维码窗口
  └─ _poll_login_status(qrcode_key)
       └─ 定时器每2s → _check_qr_status()
            ├─ code == 0 → _exchange_cookie(login_url)
            │                └─ 提取并保存 SESSDATA → 回调 success(true)
            ├─ code == 86038 → 回调 success(false)
            └─ 其他 → 继续轮询
```
## 注意事项
- 轮询间隔固定 2 秒，可根据实际需求调整。
- 二维码生成使用了外部 API，需确保网络畅通且遵守服务条款。
- `SESSDATA` 的有效期由 Bilibili 控制，过期后需重新登录。
- 若二维码窗口被用户主动关闭，会视为登录放弃并回调 `false`。
- 整个流程依赖 Godot 的场景树和异步机制，应在主线程环境（如 `Node` 子类）中执行。

## 示例调用
```gdscript
start_qr_login(func(success: bool):
    if success:
        print("登录成功，SESSDATA 已保存")
    else:
        print("登录失败或取消")
)