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
      token: null,
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
