import * as NS                          from "@nativescript/core"
import * as tools                       from "@/mixins/tools"
import store                            from "@/mixins/store"
import Bus                              from "@/mixins/bus"

// -- =====================================================================================

export function inShop ( institute: string, title: string, filter: string[] ) {

    // if ( !store.state.shopDB[ institute ] ) {
    //     tools.toaster( "wait..." );
    //     return;
    // }

    store.state.mode = "shopping"; 
    let path 
    // = store.state.inHand.path[ institute ];
    path.push( title );
    // .. Generate new Folder-List
    // Bus.$emit( "Institute_ShopListCalculator", filter );

}

// -- =====================================================================================

export function backOrExitShop ( institute: string, msg?: string ) {
    let path 
    // = store.state.inHand.path[ institute ];
    path.pop();
    if ( msg ) tools.toaster( msg );
    // .. Generate new Folder-List
    // if ( path.length ) Bus.$emit( "Institute_ShopListCalculator" );
    // else {
    //     store.state.mode = "idle";
    //     Bus.$emit( "Institute_FolderListCalculator" );
    // }
}

// -- =====================================================================================
