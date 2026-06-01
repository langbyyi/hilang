---
title: "Pkeep：一款简洁高效的 Linux 权限维持工具分享"
date: "2025-08-07 14:24:52"
updated: "2026-05-30 19:24:37"
categories: ["文章", "工具资源"]
tags: ["权限维持"]
thumbnail: ""
first_image_as_thumbnail: true
excerpt: ""
after_post: ""
comments: true
wp_id: "794"
---
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">在网络安全领域，权限维持是渗透测试和安全评估中的重要环节。今天要给大家介绍一款名为 Pkeep 的工具，它是一个用 Python 编写的 Linux 权限维持脚本，旨在帮助安全从业者在合法授权的测试环境中实现高效的权限维持操作。</div>
<h2 class="header-vfC6AV auto-hide-last-sibling-br">工具简介</h2>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">Pkeep 是一款专注于 Linux 系统权限维持的脚本工具，采用 Python3 开发，提供了多种实用功能，帮助测试人员在获取系统权限后进行持久化操作。项目目前托管在 GitHub 上（<a class="link-ZNPgAX" href="https://github.com/S-ixpence/Pkeep" target="_blank" rel="noopener">https://github.com/S-ixpence/Pkeep</a>），具有开源、易用、隐蔽性强等特点。</div>
<h2 class="header-vfC6AV auto-hide-last-sibling-br">核心功能</h2>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">Pkeep 提供了丰富的权限维持手段，主要包括以下功能：</div>
<ol class="auto-hide-last-sibling-br">
 	<li><strong>添加特权账户</strong>：创建具有管理员权限的隐藏账户</li>
 	<li><strong>授予账户 sudo 权限</strong>：为指定用户添加无密码 sudo 权限</li>
 	<li><strong>创建隐藏的 SUID shell</strong>：生成具有 SUID 权限的隐藏 bash</li>
 	<li><strong>SSH 软链接后门</strong>：通过软链接创建隐蔽的 SSH 后门</li>
 	<li><strong>定时任务持久化</strong>：利用 crontab 创建定时反向 Shell</li>
 	<li><strong>SSH 密钥注入</strong>：向目标系统注入 SSH 公钥实现免密登录</li>
 	<li><strong>systemd 服务持久化</strong>：通过系统服务实现持久化反向连接</li>
</ol>
<h2 class="header-vfC6AV auto-hide-last-sibling-br">技术特点</h2>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">2025 年 3 月，该工具通过深度重构，带来了多项重要改进：</div>
<h3 class="header-vfC6AV auto-hide-last-sibling-br">1. 面向对象重构</h3>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">采用类的方式组织代码，提高了代码的可维护性和扩展性，便于后续功能迭代。</div>
<h3 class="header-vfC6AV auto-hide-last-sibling-br">2. 增强的隐蔽性</h3>
<ul class="auto-hide-last-sibling-br">
 	<li>使用更隐蔽的文件名（如<code>systemd-network.service</code>）</li>
 	<li>实现文件时间戳伪装</li>
 	<li>利用<code>chattr +i</code>进行文件属性锁定，防止被意外删除</li>
</ul>
<h3 class="header-vfC6AV auto-hide-last-sibling-br">3. 完善的错误处理</h3>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">使用<code>subprocess</code>替代<code>os.system</code>，增加了错误检查机制，提高了工具的稳定性。</div>
<h3 class="header-vfC6AV auto-hide-last-sibling-br">4. 安全性改进</h3>
<ul class="auto-hide-last-sibling-br">
 	<li>使用 openssl 生成安全的密码哈希</li>
 	<li>通过<code>/etc/sudoers.d/</code>目录配置 sudo 权限，更符合安全最佳实践</li>
</ul>
<h3 class="header-vfC6AV auto-hide-last-sibling-br">5. 良好的用户体验</h3>
<ul class="auto-hide-last-sibling-br">
 	<li>提供清晰的菜单交互界面</li>
 	<li>支持自定义用户名 / 密码</li>
 	<li>操作提示友好，降低使用门槛</li>
</ul>
<h2 class="header-vfC6AV auto-hide-last-sibling-br">使用方法</h2>
<ol class="auto-hide-last-sibling-br">
 	<li>首先需要确保在 root 权限下运行：</li>
</ol>
<div class="relative w-fit custom-code-block-canvas-wrapper w-full">
<div class="code-block-element-YDlfvc light custom-code-block-container--bash hide-indicator disable-theme-style custom-code-block-container">
<div class="code-area-tZtDgG code-area" dir="ltr">
<div class="header-wrapper-UnnlXS">
<div class="header-cGu84a"></div>
</div>
<div class="content-EGRozu code-content light-scrollbar-TbsSwi">


```bash
<code class="language-bash">sudo python3 Pkeep.py</code>
```


</div>
</div>
</div>
</div>
<ol class="auto-hide-last-sibling-br" start="2">
 	<li>运行后会显示主菜单，根据需求选择对应的功能编号即可：</li>
</ol>
<div class="relative w-fit custom-code-block-canvas-wrapper w-full">
<div class="code-block-element-YDlfvc light custom-code-block-container--plaintext hide-indicator disable-theme-style custom-code-block-container">
<div class="code-area-tZtDgG code-area" dir="ltr">
<div class="header-wrapper-UnnlXS">
<div class="header-cGu84a"></div>
</div>
<div class="content-EGRozu code-content light-scrollbar-TbsSwi">


```plaintext
<code class="language-plaintext">         _____    _  __  ______   ______   _____ 
        |  __ \  | |/ / |  ____| |  ____| |  __ \ 
        | |__) | | &#039; /  | |__    | |__    | |__) |
        |  ___/  |  &lt;   |  __|   |  __|   |  ___/
        | |      | . \  | |____  | |____  | |     
        |_|      |_|\_\ |______| |______| |_|     by fangao
        
        请选择持久化方式：
            [1] 添加特权账户
            [2] 授予账户sudo权限
            [3] 创建隐藏的SUID shell
            [4] SSH软链接后门
            [5] 定时任务持久化
            [6] SSH密钥注入
            [7] systemd服务持久化
            [q] 退出</code>
```


</div>
</div>
</div>
</div>
<ol class="auto-hide-last-sibling-br" start="3">
 	<li>根据每个功能的提示输入必要的参数（如用户名、端口、IP 等），即可完成相应操作。</li>
</ol>
<h2 class="header-vfC6AV auto-hide-last-sibling-br">注意事项</h2>
<ol class="auto-hide-last-sibling-br">
 	<li><strong>合法使用</strong>：本工具仅限在合法授权的测试环境中使用，使用前请确保已获得充分授权，遵守当地法律法规。</li>
 	<li><strong>环境要求</strong>：需要 Python3 环境，且必须以 root 权限运行。</li>
 	<li><strong>隐蔽性</strong>：工具已针对关键文件做了防删除保护和隐蔽性处理，但在实际使用中仍需结合具体场景进行调整。</li>
 	<li><strong>兼容性</strong>：支持多数主流 Linux 发行版，工具会自动处理部分依赖项检查。</li>
</ol>
<h2 class="header-vfC6AV auto-hide-last-sibling-br">总结</h2>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">Pkeep 作为一款专注于 Linux 权限维持的工具，通过简洁的界面和丰富的功能，为安全测试人员提供了便捷的权限维持解决方案。其面向对象的代码结构和不断优化的隐蔽性设计，使得它在同类工具中具有一定的优势。</div>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">当然，权限维持技术本身是一把双刃剑，既可以用于合法的安全测试，也可能被恶意利用。因此，再次强调：请务必在合法授权的前提下使用该工具，共同维护网络安全秩序。</div>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space">如果你对网络安全、权限维持技术感兴趣，不妨关注这个项目，了解其实现原理，这对于提升自身的安全技能会有所帮助。</div>
