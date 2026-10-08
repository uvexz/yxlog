---
title: "免费公共 DNS 服务器大全 | Free Public DNS Server List"
description: "收集全球公共 DNS 服务器 IP，我们不提供 DNS，只做 DNS 的搬运工。"
pubDate: 2025-10-04
updatedDate: 2025-12-15
tags: ["Notes"]
---

收集全球公共 DNS 服务器 IP，我们不提供 DNS，只做 DNS 的搬运工。

## 备注

博主使用的 DNS 列表：

| 主 DNS | 备 DNS |
|---|---|
| 180.184.1.1 | 119.29.29.29 |

👍 为推荐使用

## 墙内 DNS 服务器

**⚪ 火山引擎**

由字节跳动火山引擎提供的公共免费 DNS，暂未提供 DOT、DOH。

主 DNS | 备 DNS
---|---
👍 180.184.1.1 | 180.184.2.2

**⚪ 腾讯 DNS (DNSPod)**

由 DNSPod 提供的公共免费 DNS，后来 DNSPod 被腾讯(Tencent)收购，现在属于腾讯公司所有，稳定性和连通性也是不错的，经测试国外也可以使用。

主 DNS | IPv6
---|---
👍 119.29.29.29 | 2402:4e00::

DOH | DOT
---|---
`https://doh.pub/dns-query` | dot.pub

**⚪ 阿里 DNS (Alidns)**

这组 DNS 是由阿里巴巴提供的，国内连通性还是不错的，国外部分地区连通性不是特别好，具体可以测试一下。

主 DNS | 备 DNS
---|---
👍 223.5.5.5 | 223.6.6.6
2400:3200::1 | 2400:3200:baba::1

DOH | DOT
---|---
`https://dns.alidns.com/dns-query` | dns.alidns.com

**⚪ 114DNS**

南京信风运营的免费公共 DNS。

主 DNS | 备 DNS
---|---
114.114.114.114 | 114.114.115.115

**⚪ CNNIC DNS**

是由中国互联网信息中心 CNNIC 提供的免费公共 DNS。

主 DNS | 备 DNS
---|---
1.2.4.8 | 210.2.4.8
2001:dc7:1000::1 |

**⚪ OneDNS**

北京微步在线科技有限公司提供的 DNS 服务，提供纯净版和广告、有害信息拦截版 DNS。
纯净版 | 备 DNS
---|---
117.50.10.10 | 117.50.20.20

拦截版 | 备 DNS
---|---
117.50.11.11 | 117.50.22.22

**⚪ 清华大学 TUNA 协会 DNS 服务器**

IPV4 DNS | IPV6 DNS
---|---
101.6.6.6 | 2001:da8::666


## 墙外 DNS 服务器

**⚪ Google Public DNS**

Google 提供的公共免费 DNS，应该是最流行的公共 DNS 了，不过国内主 DNS 可能无法正常使用。

主 DNS | 备 DNS
---|---
8.8.8.8 | 👍 8.8.4.4
2001:4860:4860::8888 | 2001:4860:4860::8844

DOH | DOT
---|---
`https://dns.google/dns-query` | dns.google

**⚪ Cloudflare DNS**

Cloudflare DNS 是 Cloudflare 与 APNIC 联合推出的号称全球最快的 DNS 服务。APNIC 是一个管理亚太与大洋洲地区 IP 地址分配的非盈利性组织，1.1.1.1 归 APNIC 所有，现在交给 Cloudflare 来提供 DNS 服务。

主 DNS | 备 DNS
---|---
1.1.1.1 | 👍 1.0.0.1
2606:4700:4700::1111 | 2606:4700:4700::1001

**⚪ Quad9 DNS**

IBM 发起的 Quad9 提供的公共免费 DNS.

主 DNS | 备 DNS
---|---
9.9.9.9 | 149.112.112.112
2620:fe::fe | 2620:fe::9

**⚪ OpenDNS**

OpenDNS 是由老牌通信设备商 Cisco 提供的公共免费 DNS 服务。

主 DNS | 备 DNS
---|---
208.67.222.222 | 208.67.220.220
2620:0:ccc::2 | 2620:0:ccd::2

**⚪ TWNIC Quad101**

台湾 TWNIC 提供的 DNS，速度不错。

主 DNS | 备 DNS
---|---
101.101.101.101 | 101.102.103.104
2001:de4::101 | 2001:de4::102

**⚪ Freenom World DNS**

.tk .ga 等免费域名提供商提供的 DNS，在香港有服务器速度不错。

主 DNS | 备 DNS
---|---
80.80.80.80 | 80.80.81.81

---

大部分参考至 [1](https://dns.icoa.cn/)
