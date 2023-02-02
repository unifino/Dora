declare var android

import * as NS                          from "@nativescript/core"
export let fullScreenApplier: Function;

fullScreenApplier = () => {

    // -- apply for IOS                                                         
    
    // if ( application.ios ) {

    //     let utils = require( "utils/utils" );
    //     let UIStatusBarStyle: any;
    //     let UIApplication: any;

    //     utils.ios.getter(
    //         UIApplication, 
    //         UIApplication.sharedApplication
    //     ).statusBarStyle = UIStatusBarStyle.LightContent;

    // }
      
    // -- apply for ANDROID                                                    

    if ( NS.Application.android && NS.Device.sdkVersion >= "21" ) {

        let View        = android.view.View;
        let window      = NS.Application.android.startActivity.getWindow();
        let decorView   = window.getDecorView();
        let flags       = decorView.getSystemUiVisibility();
        
        flags |=   
            View.SYSTEM_UI_FLAG_IMMERSIVE           |
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY    |
            // View.SYSTEM_UI_FLAG_FULLSCREEN          |
            View.SYSTEM_UI_FLAG_HIDE_NAVIGATION     |
            View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN   |
            View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION;
        
        decorView.setSystemUiVisibility( flags );

    }

}