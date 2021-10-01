import Vue                              from 'nativescript-vue'
import Base                             from './components/Base.vue'
import store                            from './mixins/store'
import * as NS                          from "@nativescript/core"

// ..  preinstalled AppConfig
store.state.appConfig = {
	appConfigVersion    : "2.0.1"               ,
    // institutes          : [ "de", "en", "it" ]  ,
    institutes          : [ "de" ]              ,
    instituteBookmark   : null                  ,
	activeInstitutes    : []                    ,
	theme               : "Milky"               ,
	fontFace            : "Farsan-Regular"      ,
	fontSize            : 17.5                  ,
	sortCode            : 1                     ,
	baseTime            : 3                     ,
	minNumberLength     : 3                     ,
    email               : ""                    ,
    dictionaries        : [ "en", "fa" ]        ,
    beautyBGs           : [ "tree" ]            ,
}
// TODO select default dic

declare var android; // required if tns-platform-declarations is not installed

// import VueDevtools                      from 'nativescript-vue-devtools'
// if( TNS_ENV !== 'production' ) { Vue.use( VueDevtools ) }
// Vue.config.silent = (TNS_ENV === 'production')

// -- =====================================================================================

if ( NS.isAndroid ) {

    NS.TextBase.prototype[ NS.fontSizeProperty.setNative ] = function ( value ) {

        if ( !this.formattedText || ( typeof value !== "number" ) ) {
            if ( typeof value === "number" ) {
                this.nativeTextViewProtected
                .setTextSize( android.util.TypedValue.COMPLEX_UNIT_DIP, value );
            }
            else {
                this.nativeTextViewProtected
                .setTextSize( android.util.TypedValue.COMPLEX_UNIT_PX, value.nativeSize );
            }
        }

    };

}

// -- =====================================================================================

new Vue( {

store ,

// -- =====================================================================================

template: `

    <GridLayout backgroundColor="#125689">
        <Base />
    </GridLayout>` ,

// -- =====================================================================================

components: { Base } ,

// -- =====================================================================================

} ).$start();


// import Vue from 'nativescript-vue'
// import Base from './components/Base.vue'
// import store from './mixins/store'


// // -- =====================================================================================
// // -- =====================================================================================

// new Vue( {
    
// store: store.original ,

// // -- =====================================================================================

// template: `
    
//     <GridLayout backgroundColor="#125689">
//         <Base />
//     </GridLayout>` ,

// // -- =====================================================================================

// components: { Base } ,

// // -- =====================================================================================

// } ).$start();

