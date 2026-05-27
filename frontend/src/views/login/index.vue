<template>
    <div class="fd-login">
        <div class="fd-login__bg" aria-hidden="true">
            <span class="fd-login__blob fd-login__blob--1" />
            <span class="fd-login__blob fd-login__blob--2" />
            <span class="fd-login__blob fd-login__blob--3" />
            <span class="fd-login__grain" />
        </div>

        <div class="fd-login__inner">
            <header class="fd-login__header fd-login__animate fd-login__animate--1">
                <div class="fd-login__logo-wrap">
                    <div class="fd-login__logo-icon">
                        <el-icon :size="28">
                            <House />
                        </el-icon>
                    </div>
                    <span class="fd-login__logo-badge">home</span>
                </div>
                <h1 class="fd-login__title">
                    家享收纳
                </h1>
                <p class="fd-login__subtitle">
                    温暖的家，从整理开始
                </p>
                <p class="fd-login__tagline">
                    cozy · organize · everyday
                </p>
            </header>

            <el-card class="fd-login__card fd-login__animate fd-login__animate--2" shadow="never">
                <div class="fd-login__card-body">
                    <p class="fd-login__card-greeting">
                        欢迎回来
                    </p>

                    <el-form ref="formRef" :model="formModel" :rules="rules" label-position="top" class="fd-login__form"
                        @submit.prevent="submit">
                        <el-form-item label="邮箱" prop="email" class="fd-login__form-item">
                            <el-input v-model="formModel.email" type="email" autocomplete="email" placeholder="请输入邮箱"
                                size="large" />
                        </el-form-item>

                        <el-form-item label="密码" prop="password" class="fd-login__form-item">
                            <el-input v-model="formModel.password" type="password" autocomplete="current-password"
                                placeholder="请输入密码" size="large" show-password />
                        </el-form-item>

                        <el-form-item class="fd-login__form-item fd-login__form-item--submit">
                            <el-button type="primary" size="large" class="fd-login__submit" :loading="loading"
                                native-type="submit">
                                登录
                            </el-button>
                        </el-form-item>
                    </el-form>

                    <div class="fd-login__demo">
                        <el-button link type="primary" class="fd-login__demo-btn" @click="fillDemoAccount">
                            使用演示账号快速登录
                        </el-button>
                        <p class="fd-login__demo-hint">
                            演示账号：admin@example.com / password
                        </p>
                    </div>
                </div>
            </el-card>

            <p class="fd-login__footer fd-login__animate fd-login__animate--3">
                把琐碎收进温柔角落
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { House } from '@element-plus/icons-vue'
import { useLoginForm } from './index.ts'

const {
    formRef,
    formModel,
    rules,
    loading,
    submit,
    fillDemoAccount,
} = useLoginForm()
</script>

<style lang="less" src="./index.less"></style>
