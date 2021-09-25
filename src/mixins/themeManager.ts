import * as NS                          from "@nativescript/core"
import * as TS                          from "@/../types/myTypes"
import store                            from "@/mixins/store"
import { fullScreenApplier }            from "@/mixins/fullscreen"
import { statusBarIconStyleApplier }    from "@/mixins/statusBarIconStyler"
import * as storage                     from "@/mixins/storageHandler"

// -- =====================================================================================

interface themeValues {
    rootBG: string,
    statusBarIconsColor: {},
    name: string,
    contrast: TS.B_W,
}

let themeValues = function ( color: string ): themeValues{

    return {
        rootBG: TS.BGColors[ color ],
        statusBarIconsColor: TS.contentColorType[ color ],
        name: color,
        contrast: TS.contentColorType[ color ],
    }

};

// -- =====================================================================================

export function 
themeApplier ( colorName: TS.ThemaName, refs ): void {

    // .. get values of the Theme and Element(s)
    let palette = themeValues( colorName );
    // .. this elements need to be cared of
    let obj = [ "root", "room", "salon_F" ];

    // .. apply root ClassName
    refs[ obj[0] ].nativeView.className = palette.contrast + ' ' + palette.name;

    // .. apply Background values
    for ( let x of obj ) refs[x].nativeView.backgroundColor = palette.rootBG;

    // .. register Theme
    store.state.appConfig.theme = colorName as TS.ThemaName;

    // .. register DarkMode
    store.state.darkMode = palette.contrast === "dark" ? true : false;

    // .. applying barIcon Color
    statusBarIconStyleApplier( palette.statusBarIconsColor );
    // .. applying fullScreen Policy
    fullScreenApplier();

}

// -- =====================================================================================

export function darkModeToggler ( refs ) {

    store.state.darkMode = !store.state.darkMode;

    // TODO                               it should be completed
    const newTheme: TS.ThemaName = store.state.darkMode ? "DarkGreen" : "Milky";
    themeApplier( newTheme, refs );

    // .. save config File
    storage.saveAppConfig();

}

// -- =====================================================================================
