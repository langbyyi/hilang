---
title: "Linux 防火墙 firewalld 不生效？解决 Docker 映射端口拦截问题"
date: "2024-03-31 19:10:04"
updated: "2026-05-30 19:32:31"
categories: ["文章", "学习笔记"]
tags: ["防火墙"]
thumbnail: ""
first_image_as_thumbnail: true
excerpt: ""
after_post: ""
comments: true
wp_id: "583"
---
<p class="md-end-block md-p"><span class="md-plain">在 CentOS 服务器上运维时，遇到了一个棘手的问题：明明防火墙没开放 8103 端口，外部却能正常访问该端口对应的服务。一番排查后，发现问题根源和 Docker 与防火墙的交互有关，这里把解决过程整理成笔记，供遇到类似问题的同学参考。</span></p>

<h2 class="md-end-block md-heading"><span class="md-plain">一、问题现象：防火墙未开放端口却能被访问</span></h2>
<p class="md-end-block md-p"><span class="md-plain">CentOS 服务器上的 firewalld 防火墙显示未开放 8103 端口，通过</span><span class="md-pair-s" spellcheck="false"><code>firewall-cmd --list-all</code></span><span class="md-plain">查看 public 区域配置，开放的端口只有 8822/tcp，服务也仅包含 dhcpv6-client 和 ssh。但实际测试中，外部仍能访问 8103 端口对应的服务，重启防火墙和服务器也无法解决。</span></p>

<h2 class="md-end-block md-heading"><span class="md-plain">二、问题根源：Docker 自动修改 iptables 规则</span></h2>
<p class="md-end-block md-p"><span class="md-plain">排查发现，问题出在 Docker 与 iptables 的交互上。firewalld 底层基于 iptables 实现，而当使用</span><span class="md-pair-s" spellcheck="false"><code>docker run -p</code></span><span class="md-plain">命令映射端口时，Docker 会自动向 iptables 添加规则，相当于直接 “绕过” firewalld 开放了端口，导致防火墙配置失效。</span></p>
<p class="md-end-block md-p"><span class="md-plain">此外，重启 firewalld 时可能会删除 Docker 添加的 iptables 规则，甚至导致 Docker 容器无法启动（需重启 Docker 服务恢复，但这与本次端口拦截问题无关）。</span></p>

<h2 class="md-end-block md-heading"><span class="md-plain">三、解决步骤：禁用 Docker 的 iptables 整合</span></h2>
<p class="md-end-block md-p"><span class="md-plain">要让 firewalld 完全掌控端口访问，需禁用 Docker 对 iptables 的自动配置，具体操作如下：</span></p>

<ol class="ol-list">
 	<li class="md-list-item">
<p class="md-end-block md-p md-focus"><span class="md-pair-s "><strong><span class="md-plain">修改 Docker 服务配置文件</span></strong></span> <span class="md-plain">编辑 Docker 服务的系统配置文件：</span></p>



```bash
vi /usr/lib/systemd/system/docker.service
```


</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">添加禁用 iptables 的参数</span></strong></span> <span class="md-plain">在</span><span class="md-pair-s" spellcheck="false"><code>[Service]</code></span><span class="md-plain">段落的</span><span class="md-pair-s" spellcheck="false"><code>ExecStart</code></span><span class="md-plain">行中，添加</span><span class="md-pair-s" spellcheck="false"><code>--iptables=false</code></span><span class="md-plain">，修改后如下：</span></p>



```ini
[Service]
ExecStart=/usr/bin/dockerd --iptables=false  # 关键：禁用Docker自动修改iptables
```


<p class="md-end-block md-p"><span class="md-plain">（原配置可能为</span><span class="md-pair-s" spellcheck="false"><code>ExecStart=/usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock</code></span><span class="md-plain">，在其后添加参数即可）</span></p>
</li>
 	<li class="md-list-item">
<p class="md-end-block md-p"><span class="md-pair-s"><strong><span class="md-plain">重载配置并重启 Docker</span></strong></span></p>



```bash
systemctl daemon-reload  # 重新加载服务配置
systemctl restart docker  # 重启Docker使配置生效
```


<p class="md-end-block md-p"><span class="md-plain">完成后，firewalld 即可正常拦截未开放的端口🔶5-24🔶。</span></p>
</li>
</ol>
<h2 class="md-end-block md-heading"><span class="md-plain">四、注意事项：恢复容器网络通信</span></h2>
<p class="md-end-block md-p"><span class="md-plain">禁用 Docker 的 iptables 整合后，会出现新问题：容器间无法互相访问，且容器内无法访问外部网络。可通过以下步骤解决：</span></p>
<p class="md-end-block md-p"><span class="md-pair-s "><strong><span class="md-plain">添加 NAT 转发规则（masquerade）</span></strong></span><span class="md-plain">：</span></p>



```bash
# 永久开启public区域的地址伪装（类似NAT，实现容器网络转发）
firewall-cmd --permanent --zone=public --add-masquerade
# 重启防火墙生效
firewall-cmd --reload
```


<h2 class="md-end-block md-heading"><span class="md-plain">五、方案缺点：客户端真实 IP 不可见</span></h2>
<p class="md-end-block md-p"><span class="md-plain">该方案虽解决了防火墙可控性问题，但存在一个明显缺点：由于使用了 NAT 转发，容器内无法获取客户端的真实 IP（例如 Nginx 日志中会记录 docker0 子网的 IP）。因此，该方案更适合对客户端 IP 无要求的场景，若需获取真实 IP，需考虑其他替代方案（如使用 host 网络模式，但安全性较低）。</span></p>

<h2 class="md-end-block md-heading"><span class="md-plain">总结</span></h2>
<p class="md-end-block md-p md-focus"><span class="md-plain md-expand">当 Docker 映射端口无视 firewalld 规则时，核心原因是 Docker 自动修改了 iptables。通过禁用 Docker 的 iptables 整合，可让防火墙重新掌控端口访问，但需权衡 “网络可控性” 与 “客户端 IP 可见性”。实际使用中，可根据业务对客户端 IP 的依赖程度选择是否采用该方案。</span></p>
