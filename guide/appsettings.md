# 配置

本项目使用appsettings.json作为配置文件，插件所需要的配置文件也将添加到此

在接下来讲解 **API本体(Core API)** 的配置项，具体插件配置请查看插件介绍

---

### 默认配置

```json {4,8-12}
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",   //题Issue时请切换到Trace
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "Urls": "http://localhost:5000",    //监听地址
  "ApiInfo": {          //API信息
    "Name": "Sharw's API",    //在访问"/"时，将会返回的API Name和API Version
    "Version": "0.1.0"
  }
}
```