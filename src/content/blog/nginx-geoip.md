---
title: "为 Nginx 开启 Geoip 模块以屏蔽特定国家/地区的访问"
description: "因为之前是通过 apt-get 方式安装的 Nginx，默认没有带 geoip module，需要安装："
pubDate: 2022-09-09
updatedDate: 2025-12-16
tags: ["Notes"]
---

因为之前是通过 apt-get 方式安装的 Nginx，默认没有带 geoip module，需要安装：

```
apt-get install nginx-module-geoip
```

![](https://i.loli.net/2017/06/30/5955d7e83c006.png)

然后编辑 `/etc/nginx/nginx.conf`

```
vim /etc/nginx/nginx.conf
```

按 `i` 进入编辑模式，在最上方新增一行：

```
load_module modules/ngx_http_geoip_module.so;
```

在 `http{` 下方新增以下几行

```
geoip_country /usr/share/GeoIP/GeoIP.dat;
map $geoip_country_code $allowed_country {
    default yes;
    CN no;
    MY no;
}
// 默认允许访问，但是中国大陆地区不允许访问
```

**或者**

```
geoip_country /usr/share/GeoIP/GeoIP.dat;
map $geoip_country_code $allowed_country {
    default no;
    CN yes;
    HK yes;
    TW yes;
    MO yes;
}
// 默认不允许访问，只允许大中华区访问
```

按 `ESC` 输入 `:wq` 退出编辑

![](https://i.loli.net/2017/06/30/5955d87fdbee7.png)

接下来，安装 Geoip 数据库

```
apt-get install geoip-database libgeoip1 && mv /usr/share/GeoIP/GeoIP.dat /usr/share/GeoIP/GeoIP.dat_bak && cd /usr/share/GeoIP/ && wget http://geolite.maxmind.com/download/geoip/database/GeoLiteCountry/GeoIP.dat.gz && gunzip GeoIP.dat.gz
```

编辑网站的 Nginx 配置文件

```
vim /etc/nginx/conf.d/xx.conf   // 按照你自己的配置文件打开
```

在 `server {` 之后， `location{}` 内部或者外部新增

```
if ($allowed_country = no) {
    return 403;
}
```

重启 Nginx 即可

```
service nginx restart
```
