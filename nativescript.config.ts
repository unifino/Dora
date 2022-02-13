import { NativeScriptConfig } from '@nativescript/core'

export default {
    id: 'ir.fitored.dora',
    appPath: 'src',
    appResourcesPath: 'App_Resources',
    android: {
        v8Flags: '--expose_gc',
        markingMode: 'none',
        codeCache: true,
        maxLogcatObjectSize: 204800
    },
    ios: {
        codeCache: true
    }
} as NativeScriptConfig
