<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>角色列表</span>
        <el-button style="float: right; padding: 3px 0" type="text">操作按钮</el-button>
      </div>
      <!--添加角色-->
      <el-row :gutter="20">
        <el-col :span="4">
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="rolesList" border stripe>
        <!--展开列-->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1, index1) in scope.row.children"
              :key="item1.id"
              :class="['bdbottom', 'vcenter', index1 === 0 ? 'bdtop': '']"
            >
              <!--渲染一级权限-->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--渲染二级和三级权限-->
              <el-col :span="19">
                <el-row
                  v-for="(item2, index2) in item1.children"
                  :key="item2.id"
                  :class="['vcenter',index2 === 0 ? '': 'bdtop']"
                >
                  <!--通过for循环渲染二级权限-->
                  <el-col :span="6">
                    <!--二级权限-->
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!--三级权限-->
                    <!--二级权限-->
                    <el-tag
                      v-for="(item3, index3) in item2.children"
                      :key="item3.id"
                      :class="[index3 === 0 ? '': '']"
                      type="warning"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!--<pre>
                {{scope.row.children}}
            </pre>pre标签渲染json数据-->
          </template>
        </el-table-column>
        <!--索引列-->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="medium"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="medium"></el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="medium"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <el-tree
        :data="rightList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      rolesList: [],
      setRightDialogVisible: false,
      rightList: [],
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      defKeys: [], // 默认展开节点
      roleId: '' // 当前即将分配权重的id
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      } else {
        this.rolesList = res.data
        console.log('this.rolesList', this.rolesList)
      }
    },
    async removeRightById(role, rightId) {
      // 弹框提示是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除操作')
      } else {
        console.log('确认了删除')
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除权限失败')
        } else {
          // this.getRolesList()
          role.children = res.data
        }
      }
    },
    async showSetRightDialog(role) { // 展示分配权限的对话框
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      this.setRightDialogVisible = true
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败！')
      } else {
        this.rightList = res.data
        console.log('this.rightList', this.rightList)
        this.getLeafKeys(role, this.defKeys)
        this.setRightDialogVisible = true
      }
    },
    getLeafKeys(node, arr) { // 递归展开数组，保存id到数组
      if (!node.children) {
        return arr.push(node.id) // 若当前节点不包含child则为三级节点
      } else {
        node.children.forEach(element => this.getLeafKeys(element, arr))
      }
    },
    setRightDialogClosed() {
      this.defKeys = []
    },
    async allotRights() { // 点击事件为角色分配权重
      const keys = [ // ‘...’展开运算符
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // console.log('keys', keys)
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      } else {
        this.$message.success('分配权限成功')
        this.getRolesList()
        this.setRightDialogVisible = false
      }
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top-width: 1px;
  border-top-style: solid;
  border-top-color: #eee;
}
.bdbottom {
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
