# kendo-vue-guide

為降低使用kendoVue Grid的學習成本，特別將主要應用功能與後端串接的方法撰寫成文件，供開發者使用。


## 基本欄位設定(columns)

為了配合後端的篩選正確，需要先設定grid的**columns**，每個欄位的field與filter屬性需與後端的一致。

### field

資料的屬性，若為物件則需定義該物件的特定屬性。

``` javascript
computed:{
    columns:[
         { field: "systemUser.name", filter: "text", width: "280px"}
    ]
}
```

### filter

篩選的類別，分別分別有以下類型，分別是 **text**, **numeric**, **boolean**, **date**。

``` javascript
computed:{
    columns:[
        { field: "createdDate", filter: "date", width: "300px"},
        { field: "versionNumber", filter: "numeric", width: "200px"},
    ]
}
```
## Kendo Grid props 與 component data 設定
### 分頁(Paging)

- grid props
    - pageable: boolean true
    - take: number 10
    - skip: number 0
- component data
    - take: 一頁多少筆資料
    - skip: 當前第一筆資料的位置
### 篩選(Filtering)

- grid props
    - filterable: boolean true
    - filter : array []

```json
[{"filters":[{"logic":"and","filters":[{"field":"name","operator":"contains","value":"rac"}]}],"logic":"and"}]
```
- component data
    - filter: 篩選的物件陣列, 若預設不需要則設定為null
### 排序(Sorting)

- grid props
    - sortable: boolean true
    - sort : array []

```json
[{"field":"name","dir":"desc"}]
```

- component data
    - sort: 排序的物件陣列, 若預設不需要則設定為null
### 分群(Grouping)

- grid props
    - groupable: boolean true
    - group : array []

```json
 [{"field":"name"}]
```
- component data
    - group: 分群的物件陣列, 若預設不需要則設定為null




## 向後端取得資料的方法(getData())
### 將狀態序列化需引用到的模組

```javascript
import { toDataSourceRequestString, translateDataSourceResultGroups } from '@progress/kendo-data-query';
```

### 利用狀態改變的事件 (datastatechange) 到後端拿資料

``` javascript
//grid event

@datastatechange="dataStateChange"
```

```javascript
//methods

    dataStateChange: function (event) {
      this.createAppState(event.data)
    },
    createAppState: function (dataState) {
      this.group = dataState.group
      this.take = dataState.take
      this.skip = dataState.skip
      this.filter = dataState.filter
      this.sort = dataState.sort
      this.getData()
    },
    getData: async function () {
      const dataState = {
        take: this.take,
        skip: this.skip,
        filter: this.filter,
        sort: this.sort,
        group: this.group
      }
      const queryStr = `${toDataSourceRequestString(dataState)}` // Serialize the state.
      const hasGroups = dataState.group && dataState.group.length
      const bimSetId = '3485777f-cf14-4584-a542-bda43b2bec4d'
      const gridDataSource = await this.$API.api.bim.bimSet.getBIMVersions(bimSetId, queryStr).then(res => res.data)
      // const gridDataSource = await this.$API.api.main.systemUser.post(queryStr).then(res => res.data)
      this.gridData = hasGroups ? translateDataSourceResultGroups(gridDataSource.data) : gridDataSource.data
      this.total = gridDataSource.total
    },
```



## 參考連結

- [kendoReact 與 ASP.NET Core 整合範例](https://www.telerik.com/kendo-react-ui/components/dataquery/mvc-integration/)
- [github repository](https://github.com/SyncoBox/kendo-vue-grid-server-side-operation-demo)