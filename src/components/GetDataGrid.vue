 <template>
    <div>
        <label for="token">token </label><input id='token' v-model='token' type="text">
        <Grid   ref="grid"
                class='grid'
                :style="{height: '100%'}"
                :data-items="gridData"
                :edit-field="'inEdit'"
                :column-menu="true"
                :sortable="true"
                :pageable="true"
                :groupable='true'
                :group="group"
                :filter='filter'
                :take="take"
                :skip="skip"
                :sort="sort"
                :total="total"
                @itemchange="itemChange"
                @datastatechange="dataStateChange"
                :columns="columns">
                <grid-no-records>
                    There is no data available custom
                </grid-no-records>
        </Grid>
    </div>
</template>

<script>
import { Grid, GridNoRecords } from '@progress/kendo-vue-grid'
import { toDataSourceRequestString, translateDataSourceResultGroups } from '@progress/kendo-data-query'
// import { process } from '@progress/kendo-data-query'
// import CommandCell from './CommandCell';
import '@progress/kendo-theme-material/dist/all.css'

import axios from 'axios'
export default {
  components: {
    Grid,
    GridNoRecords
  },
  data: function () {
    return {
      token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ik9NZzNCcDJ6b1g0b3pJZEJfdHc1ZlEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MDY4OTEzMjEsImV4cCI6MTYwNjg5NDkyMSwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS1kZXYuc3luY29ib3guY29tIiwiYXVkIjoicGFubzphbGwiLCJjbGllbnRfaWQiOiJzeW5jb2JveC1hcGktc3dhZ2dlciIsInN1YiI6ImU0MjIxYjA0LTM3ZjgtNDQzNy1hMDkzLTdlZmI0ZWFjNTk0NCIsImF1dGhfdGltZSI6MTYwNjg4ODU2MSwiaWRwIjoibG9jYWwiLCJBc3BOZXQuSWRlbnRpdHkuU2VjdXJpdHlTdGFtcCI6IllLSTdVR0o3Q0VJQlJMTUo2U1lXTEhUQlFUNllSS1JEIiwiZm9yZ2VfZXhwaXJlc19kYXRlIjoiMDAwMeW5tDHmnIgx5pelIOaYn-acn-S4gCIsInByZWZlcnJlZF91c2VybmFtZSI6ImRhbmllbGhzaWVoQHN5bmNvYm94LmNvbSIsIm5hbWUiOiJkYW5pZWxoc2llaEBzeW5jb2JveC5jb20iLCJlbWFpbCI6ImRhbmllbGhzaWVoQHN5bmNvYm94LmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6ImU0MjIxYjA0LTM3ZjgtNDQzNy1hMDkzLTdlZmI0ZWFjNTk0NCIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJkYW5pZWxoc2llaEBzeW5jb2JveC5jb20iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJkYW5pZWxoc2llaEBzeW5jb2JveC5jb20iLCJzY29wZSI6WyJwYW5vOmFsbCJdLCJhbXIiOlsicHdkIl19.BljSXevx2xKKHMhpXx7krRw5v4PVjCL_R9QdRv4tKfemv5k30zbETOd2Ur5CZzI1_-XWlQv10yYd0VPlvHtsMQRxrR99eZvWgH8ozKBedzV8A_rIlNIksPYdXYs975wW5hpvmfKPY7D3cjCz6C06MXf90W_bKrDn-rgQyXDkbXAUh1aDp1uljKbuBNFMnKgq8QXSjscYmd3M1H8LEV8XyhFo7AFBtOeDNuX3Y_gDsKwYCFNi7qmIPqm8Ixf-NHKXEgMZ7MM17SfagNip5tuJQIaoLE2PimNX37aEd01t7RieCQuFTZ0AvDh3AxX2EEvw8PisS5XW1eWKx3OjV51sWQ',
      filter: null,
      sort: null,
      group: null,
      skip: 0,
      take: 10,
      total: 0,
      gridData: [],
      updatedData: [],
      columns: [
        { field: 'name', filterable: false, editable: false, title: 'name' },
        { field: 'category.name', title: 'category' }, // appliedVersion
        { field: 'appliedVersion.createdDate', title: 'createdDate' },
        { field: 'note', title: 'note' }
      ]
    }
  },
  computed: {
    projectId () {
      return this.$route.params.projectId
    }
  },
  created: function () {
    this.getData()
  },
  methods: {
    itemChange: function (e) {
      if (e.dataItem.ProductID) {
        const index = this.gridData.findIndex(p => p.ProductID === e.dataItem.ProductID)
        const updated = Object.assign({}, this.gridData[index], { [e.field]: e.value })
        this.gridData.splice(index, 1, updated)
      } else {
        e.dataItem[e.field] = e.value
      }
    },
    insert () {
      const dataItem = { inEdit: true }
      this.gridData.splice(0, 0, dataItem)
    },
    edit: function (e) {
      const index = this.gridData.findIndex(p => p.ProductID === e.dataItem.ProductID)
      const updated = Object.assign({}, this.gridData[index], { inEdit: true })
      this.gridData.splice(index, 1, updated)
    },
    save: function (e) {
      const index = this.gridData.findIndex(p => p.ProductID === e.dataItem.ProductID)
      const item = this.gridData[index]
      const updated = Object.assign(this.update(this.gridData.slice(), item), { inEdit: undefined })
      this.gridData.splice(index, 1, updated)
      const updateDataIndex = this.updatedData.findIndex(p => p.ProductID === e.dataItem.ProductID)
      this.updatedData.splice(updateDataIndex, 1, updated)
    },
    update (data, item, remove) {
      let updated
      let index = data.findIndex(p => item.ProductID && p.ProductID === item.ProductID)
      if (index >= 0) {
        updated = Object.assign({}, item)
        data[index] = updated
      } else {
        let id = 1
        this.updatedData.forEach(p => { if (p.ProductID) { id = Math.max(p.ProductID + 1, id) } })
        updated = Object.assign({}, item, { ProductID: id })
        data.unshift(updated)
        index = 0
      }

      if (remove) {
        data = data.splice(index, 1)
      }
      return data[index]
    },
    cancel (e) {
      if (e.dataItem.ProductID) {
        const index = this.gridData.findIndex(p => p.ProductID === e.dataItem.ProductID)
        const updateDataIndex = this.updatedData.findIndex(p => p.ProductID === e.dataItem.ProductID)
        const updated = Object.assign(this.updatedData[updateDataIndex], { inEdit: undefined })
        this.gridData.splice(index, 1, updated)
      } else {
        const index = this.gridData.findIndex(p => JSON.stringify(e.dataItem) === JSON.stringify(p))

        this.gridData.splice(index, 1)
      }
    },
    remove (e) {
      e.dataItem.inEdit = undefined
      this.update(this.gridData, e.dataItem, true)
      this.update(this.updatedData, e.dataItem, true)
      this.gridData = this.gridData.slice()
    },
    cancelChanges () {
      const editedItems = this.updatedData.filter(p => p.inEdit === true)
      if (editedItems.length) {
        editedItems.forEach(
          item => {
            item.inEdit = undefined
          })
      }
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
      console.log('toDataSourceRequestString', toDataSourceRequestString)
      const queryStr = `${toDataSourceRequestString(dataState)}` // Serialize the state.
      const hasGroups = dataState.group && dataState.group.length
      const CONFIG = {
        params: { test: 321 },
        ...this.$API.config.getAuthorization()
      }

      const gridDataSource = await axios.get(`https://api-dev.syncobox.com/Project/${this.projectId}/Photo?${queryStr}`, CONFIG)
      this.gridData = hasGroups ? translateDataSourceResultGroups(gridDataSource.data) : gridDataSource.data
      this.total = gridDataSource.total
    },
    createAppState: function (dataState) {
      this.group = dataState.group
      this.take = dataState.take
      this.skip = dataState.skip
      this.filter = dataState.filter
      this.sort = dataState.sort
      this.getData()
    },
    dataStateChange: function (event) {
      this.createAppState(event.data)
    }
  },
  watch: {
    token: {
      immdiate: false,
      handler: function () {
        this.gridData = []
        this.$API.config.token = this.token
        this.getData()
      }
    }
  }
}
</script>

<style scoped>
    .grid {
        text-align: left;
    }
</style>
