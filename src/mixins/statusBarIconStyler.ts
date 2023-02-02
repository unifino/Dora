declare var android;
import { B_W }                          from "../../types/myTypes"

export let statusBarIconStyleApplier: Function;

statusBarIconStyleApplier = ( type: B_W ): void => {

    let application = require( "application" );
    var color       = require( "color" );

    let View        = android.view.View;
    
    let window      = application.android.startActivity.getWindow();
    let decorView   = window.getDecorView();
    let flags       = decorView.getSystemUiVisibility();
    
    // -- set STATUSBAR Vivid
    let transparent = new color.Color('TRANSPARENT').android;
    window.setStatusBarColor( transparent );

    // -- set value of STATUSBAR Icons ( BLACK / WHITE )
    if ( type === B_W.Black ) flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
    if ( type === B_W.White ) flags &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
    
    // -- apply the settings
    decorView.setSystemUiVisibility( flags );

}