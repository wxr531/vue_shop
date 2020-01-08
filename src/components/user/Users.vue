<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>用户列表</span>
        <el-button style="float: right; padding: 3px 0" type="text">操作按钮</el-button>
      </div>
      <!--搜索与添加-->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserrList">
            <el-button slot="append" icon="el-icon-search" @click="getUserrList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table :data="userlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="mg_state">
          <!--作用域插槽-->
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChanged(scope.row)"
              active-color="#13ce66"
              inactive-color="#ff4949"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="medium"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!--编辑按钮-->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="medium"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!--删除按钮-->
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                @click="setRole(scope.row)"
                type="warning"
                icon="el-icon-setting"
                size="medium"
              ></el-button>
              <!--设置按钮-->
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!--添加用户对话框-->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="65px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!--修改用户对话框-->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
      :before-close="handleClose"
      @close="editDialogClosed"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!--分配角色对话框-->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClosed"
    >
      <div>
        <p>当前用户：{{userInfo.username}}</p>
        <p>当前角色：{{userInfo.role_name}}</p>
        <p>
          分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择待分配角色">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="savaRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { userInfo } from 'os'
export default {
  data() { // 组件私有数据
    var checkemail = (rule, value, cb) => { // 验证邮箱规则[规则，校验值，回调函数]
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return cb()
      } else {
        cb(new Error('请输入合法邮箱'))
      }
    }
    var checkmobile = (rule, value, cb) => { // 验证手机号规则
      const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return cb()
      } else {
        cb(new Error('请输入合法手机号'))
      }
    }
    return {
      drawer: false,
      direction: 'rtl',
      // 获取get参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userlist: [],
      total: 0,
      addDialogVisible: false,
      editDialogVisible: false,
      addForm: { // 添加用户表单数据
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormRules: { // 添加用户表单数据规则
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '请输入3-10字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '请输入6-15字符之间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkemail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkmobile, trigger: 'blur' }
        ]
      },
      editForm: { // editDialog查询到的数据信息对象
      },
      editFormRules: { // 添加用户表单数据规则
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkemail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkmobile, trigger: 'blur' }
        ]
      },
      setRoleDialogVisible: false,
      userInfo: [], // 需要被分配的用户信息
      rolesList: [],
      selectedRoleId: '' // 已选择的角色id值
    }
  },
  created() { // 生命周期函数
    this.getUserrList()
  },
  methods: { // 组件事件处理函数
    async getUserrList() {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })// get函数会返回promise对象，使用async和await简化操作
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表信息出错')
      }
      this.userlist = res.data.users
      this.total = res.data.total
      console.log(res)
    },
    handleSizeChange(newSize) { // 监听pagesize改变
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUserrList()
    },
    handleCurrentChange(newPage) { // 监听页码值改变
      // console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserrList()
    },
    async userStateChanged(userinfo) { // 监听switch开关打开的状态
      // console.log(userinfo)
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`) // ''修改为
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => { })
    },
    addDialogClosed() { // 监听添加用户对话框的监听事件
      this.$refs.addFormRef.resetFields() // 拿到表单的引用，并调用表单的引用函数
    },
    addUser() {
      this.$refs.addFormRef.validate(async valid => { // 表单引用的正则校验，传入valid
        if (!valid) return // 校验通过，可以发起真正的用户添加操作
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        } else {
          this.$message.success('添加用户成功')
        }
        this.addDialogVisible = false
        this.getUserrList()
      })
    },
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields() // 拿到引用，重置整个表单
    },
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => { // 表单引用的正则校验，传入valid
        if (!valid) return // 校验通过，可以发起真正的用户添加操作
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (res.meta.status !== 200) {
          this.$message.error('更新用户信息失败')
        } else {
          this.$message.success('更新用户信息成功')
        }
        this.editDialogVisible = false
        this.getUserrList()
      })
    },
    async removeUserById(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      } else {
        const { data: res } = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除用户失败')
        } else {
          this.$message.success('已成功删除')
          this.getUserrList()
        }
      }
    },
    async setRole(userInfo) {
      this.userInfo = userInfo
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        this.$message.error('获取角色列表失败')
      } else {
        this.rolesList = res.data
        console.log('rolesList', this.rolesList)
        this.setRoleDialogVisible = true
      }
    },
    async savaRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择分配角色')
      } else {
        const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
        if (res.meta.status !== 200) {
          return this.$message.error('更新角色失败')
        } else {
          this.$message.success('更新角色成功')
          this.getUserrList()
          this.setRoleDialogVisible = false
        }
      }
      // await this.$http.
    },
    setRoleDialogClosed() {
      this.selectedRoleId = ''
      this.userInfo = []
    }
  }
}
</script>
<style lang="less" scoped>
</style>
