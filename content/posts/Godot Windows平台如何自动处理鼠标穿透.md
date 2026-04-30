+++
date = '2026-05-01T00:36:24+08:00'
draft = false
title = 'Godot Windows平台如何自动处理鼠标穿透'
tags = ["代码片段", "Godot","Windows平台","C#"]
+++
## 可以利用DllImport导入SetWindowLong来设置窗口样式
### 具体代码:

`WindowsApiManager.cs`
```csharp
using System.Runtime.InteropServices;
using Godot;

public partial class WindowsApiManager : Node
{
	private nint _hWnd;

	[DllImport("user32.dll")]
	public static extern nint GetActiveWindow();

	[DllImport("user32.dll")]
	private static extern int SetWindowLong(nint hWnd, int nIndex, uint dwNewLong);

	public override void _Ready()
	{
		_hWnd = GetActiveWindow();
		_ = SetWindowLong(_hWnd, -20, 524416u);
	}

	public void SetClickThrough(bool clickthrough)
	{
		if (clickthrough)
		{

			_ = SetWindowLong(_hWnd, -20, 524448u);
		}
		else
		{
			_ = SetWindowLong(_hWnd, -20, 524416u);
		}
	}
}
```

`MouseDetection.cs`
```csharp
using Godot;

public partial class MouseDetection : Node
{
	private WindowsApiManager _api;

	private bool _clickthrough = true;

	public override void _Ready()
	{
		_api = GetNode<WindowsApiManager>("/root/WindowsApiManager");
		_api.SetClickThrough(clickthrough: true);
	}

	public override void _PhysicsProcess(double _)
	{
		DetectPassthrough();
	}

	private void DetectPassthrough()
	{
		Viewport viewport = GetViewport();
		Image img = viewport.GetTexture().GetImage();
		Rect2 rect = viewport.GetVisibleRect();
		Vector2 mousePosition = viewport.GetMousePosition();
		int viewX = (int)((int)mousePosition.X + rect.Position.X);
		int viewY = (int)((int)mousePosition.Y + rect.Position.Y);
		int x = (int)(img.GetSize().X * viewX / rect.Size.X);
		int y = (int)(img.GetSize().Y * viewY / rect.Size.Y);
		if (x < img.GetSize().X && x >= 0 && y < img.GetSize().Y && y >= 0)
		{
			SetClickability(img.GetPixel(x, y).A >= 1f);
		}
		img.Dispose();
	}

	private void SetClickability(bool clickable)
	{
		if (clickable != _clickthrough)
		{
			_clickthrough = clickable;
			_api.SetClickThrough(!clickable);
		}
	}
}
```
### 使用方法:
将`WindowsApiManager.cs`设为自动加载脚本
### 整体思路:
每帧获取当前窗口图像,并判断鼠标指针是否在图像了,如果在则设置窗口不可穿透,反之穿透