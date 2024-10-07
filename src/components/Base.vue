<template>
<AbsoluteLayout class="fx" ref="root" @swipe="swipeControl" >

<!---------------------------------------------------------------------------------------->

    <BeautyBG class="fx" />

<!---------------------------------------------------------------------------------------->

    <Frame class="fx" id="base" ref="base"><Page /></Frame>

<!---------------------------------------------------------------------------------------->

    <MenuPanel ref="menuPanel" />

<!---------------------------------------------------------------------------------------->

    <Frame id="salon_F" ref="salon_F" ><Page /></Frame>
    <Frame id="room" ref="room" ><Page /></Frame>
    <!-- <SearchPanel ref="SearchPanel" /> -->

<!---------------------------------------------------------------------------------------->

    <Downloading />

<!---------------------------------------------------------------------------------------->

    <Scope ref="scope" class="fx" />

<!---------------------------------------------------------------------------------------->

    <Frame id="iPanel" class="fx" ><Page /></Frame>

<!---------------------------------------------------------------------------------------->

    <Welcome ref="welcome" class="fx"/>

<!---------------------------------------------------------------------------------------->

    <FirstMeet ref="firstMeet" class="fx" @restart="init()" />

<!---------------------------------------------------------------------------------------->

</AbsoluteLayout>
</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

import { Vue, Component, Prop }         from "vue-property-decorator"
import * as NS                          from "@nativescript/core"
import * as TS                          from "@/../types/myTypes"
import * as TM                          from "@/mixins/themeManager"
import store                            from "@/mixins/store"
// * npm i nativescript-permissions
import permissions                      from "nativescript-permissions"
import * as tools                       from "@/mixins/tools"
import * as storage                     from "@/mixins/storageHandler"
import FirstMeet                        from "@/components/SETUPFirstMeet/FirstMeet.vue"
import Institute                        from "@/components/Institute.vue"
import Downloading                      from "@/components/tools/Downloading.vue"
import ServerWindow                     from "@/components/ServerWindow/IPanel.vue"
import Welcome                          from "@/components/Welcome.vue"
import Bus                              from "@/mixins/bus"
import BeautyBG                         from "@/components/tools/BeautyBG.vue"
import MenuPanel                        from "@/components/Menu/Panel.vue"
import SearchPanel                      from "@/components/Salon/S/SearchPanel.vue"
import { myPurchasedItems }             from "@/mixins/user"
import Scope                            from "@/components/Scope/Scope.vue"
import * as shopping                    from "@/mixins/shopping"
import * as tnsPLY                      from "@/mixins/audioPlayer"
import IPanel from "@/components/ServerWindow/IPanel.vue"
let application = require('application');

// -- =====================================================================================

@Component ( {
    components: {
        FirstMeet,
        Institute,
        MenuPanel,
        Welcome,
        Downloading,
        BeautyBG,
        Scope,
        SearchPanel
    }
} )

// -- =====================================================================================

export default class Base extends Vue {

// -- =====================================================================================

get myBorder () {
    return "res://my_border_" + ( store.state.appConfig.darkMode ? "dark" : "light" );
}

// -- =====================================================================================

mounted () {

    this.init();

    // console.log( NS.Device.uuid );
    // console.log( NS.Device.manufacturer + " | " + NS.Device.model );
    // 6876e8d960e83144
    // samsung | SM-N970F

    // .. back Button Ctl
    NS.Application.android.on(
        NS.AndroidApplication.activityBackPressedEvent,
        e => this.backButtonCtl(e),
    );

    // .. rotation Ctl
    application.on( application.orientationChangedEvent, this.setOrientation );

    // .. suspend Ctl
    NS.Application.android.on(
        NS.AndroidApplication.activityPausedEvent,
        () => {
            // .. pause
            tnsPLY.stopAt(0);
            // .. save
            if ( store.state.here !== "Entrance" ) {
                storage.saveMass();
                storage.saveGlossar();
                storage.saveRibosomes();
                storage.saveFlashCards();
            }
        },
    );

    // .. resume Ctl
    NS.Application.android.on(
        NS.AndroidApplication.activityResumedEvent,
        () => this.resumeCtl(),
    );

    Bus.$on( "Base_SwipeControl", this.swipeControl );
    Bus.$on( "Base_HeadToIPanel", this.headToIPanel );

}

// -- =====================================================================================

async setOrientation(args) {
    await new Promise( _ => setTimeout( _, 100 ) );
    // console.log(args.newValue);
    this.getRootWindowSize().then( () => {
        ( this.$refs.scope as Scope ).init();
    } );
}

// -- =====================================================================================

backButtonCtl (e) {

    switch ( store.state.here ) {

        case "Salon_F"          : Bus.$emit( "Salon_F_Exit" );              break;
        case "ClassRoom"        : Bus.$emit( "ClassRoom_BackOrExit" );      break;
        case "ClassRoomEntrance": Bus.$emit( "ClassRoomEntrance_Back" );    break;
        case "Institute"        : Bus.$emit( "Institute_BackOrExit" );      break;

    }

    e.cancel = true;
    // .. Entrance | ClassRoomEntrance | ClassRoom_B will | IPanel    be effected!

}

// -- =====================================================================================

resumeCtl () {

    switch ( store.state.here ) {

        case "ClassRoom":
            tnsPLY.stop();
            // .. try to reload audio
            try { tnsPLY.init( store.state.inHand.mediaPath ) } catch {}
            store.state.mode = "reading";
            break;

        case "Institute":
        Bus.$emit( "BeautyBG_Next" )
            break;

        // .. Entrance | ClassRoom_B | ClassRoomEntrance | Salon_F will be omitted!

    }

}

// -- =====================================================================================

init (): void {

    // .. just applying default theme
    TM.themeApplier( "Milky", this.$refs );

    // .. after granting storage permission further steps should be taken
    this.permissionApplier()
    .then( () => storage.pathCtr() )
    .then( () => this.appConfiguration() )
    .then( () => Bus.$emit( "BeautyBG_Init" ) )
    .then( () => Bus.$emit( "Battery_Init" ) )
    .then( () => Bus.$emit( "Ram_Init" ) )
    .then( () => myPurchasedItems() )
    // .. not resolvable situation
    .catch( msg => {

        msg = msg + "";
        if ( msg.includes( "java.net.UnknownHostException: Unable to resolve host") ) 
            msg = "Check your Internet Connection!"; 

        tools.toaster( msg );

    } );

}

// -- =====================================================================================

permissionApplier (): Promise<any> {

    return new Promise ( (rs,rx) => {

        // .. setup the Permissions 
        permissions.requestPermission ( [

            "android.permission.INTERNET"               ,
            "android.permission.READ_EXTERNAL_STORAGE"  ,
            "android.permission.WRITE_EXTERNAL_STORAGE" 

        ] )
        .then ( () => rs( "Access has been granted!" ) )
        .catch( () => rx( "No Access to Storage!") );

    } );

}

// -- =====================================================================================

appConfiguration (): Promise<void> {

    return new Promise ( (rs, rx) => {

        // .. checking existence && structure of mandatory files
        storage.readAppConfig()
        .then( async validAppConfig => {

            // .. register appConfig
            store.state.appConfig = validAppConfig;

            // ! remove this, for now app starts in black
            TM.themeApplier( "Black", this.$refs );
            // .. assign user selected theme
            // TM.themeApplier( store.state.appConfig.theme, this.$refs );

            await new Promise( _ => setTimeout( _, 100 ) );

            // .. basic steps has been resolved!
            rs();

            await new Promise( _ => setTimeout( _, 100 ) );

            // .. retrieve Ribosomes
            setTimeout( () => storage.putRibosomesInBox(), 0 );
            // .. retrieve Lessons
            setTimeout( () => storage.putLessonsInBox(), 0 );
            // .. retrieve Glossaries
            setTimeout( () => storage.putGlossariesInBox(), 0 );
            // .. retrieve FlashCards
            setTimeout( () => storage.putFlashcardsInBox(), 0 );
            // .. retrieve Favorites
            setTimeout( () => storage.putFavoritesInBox(), 0 );

            await new Promise( _ => setTimeout( _, 100 ) );

            // .. setUp app
            this.getRootWindowSize()
            .then( () => Bus.$emit( "Panel_ToggleExpansion" )            )
            .then( () => this.headToInstitute( tools.instituteTravel() ) )
            .then( () => Bus.$emit( "Welcome_Slide", false )             )
            .then( () => ( this.$refs.scope as Scope ).init()            );

        } )
        .catch( () => ( this.$refs.firstMeet as FirstMeet ).init() );

    } )

}

// -- =====================================================================================

async headToInstitute ( travelInfo: TS.travelInfo ) {

    Vue.prototype.$navigateTo( Institute, {

        frame : this.$refs.base ,

        backstackVisible : false ,

        props : {
            ins : travelInfo.institute ,
        } , 

        transition : {
            name         : travelInfo.transitionName ,
            duration     : travelInfo.duration ,
        } 

    } )
    .then( () => store.state.inHand.institute = travelInfo.institute );

}

// -- =====================================================================================

headToIPanel () {

    Vue.prototype.$navigateTo( IPanel, {
        frame : 'iPanel' ,
        backstackVisible : true ,
    } )

}

// -- =====================================================================================

swipeControl ( args: NS.SwipeGestureEventData ) {

    if ( store.state.mode === "setting" ) return 0;

    let ins = store.state.inHand.institute,
        actives = store.state.appConfig.activeInstitutes;

    if ( actives.length === 1 && actives[0] === store.state.inHand.institute ) return 0;

    if ( store.state.here === "Institute" ) {

        switch ( args.direction ) {

            case NS.SwipeDirection.right:
            case NS.SwipeDirection.left: 
                if ( store.state.mode === "shopping" ) shopping.backOrExitShop( ins );
                this.headToInstitute( tools.instituteTravel( args.direction ) ); 
                break;

        }

    }

}

// -- =====================================================================================

getRootWindowSize (): Promise<void> {

    return new Promise ( rs => {

        let root = this.$refs.root as any;
        if ( !store.state.windowSize ) store.state.windowSize = {} as any;

        store.state.windowSize.height = root.nativeView.getActualSize().height | 0;
        store.state.windowSize.width = root.nativeView.getActualSize().width | 0;

        if ( !store.state.windowSize.width || !store.state.windowSize.height ) {
            setTimeout ( () => rs( this.getRootWindowSize() ) , 10 );
        }

        else return rs();

    } );

}

// -- =====================================================================================

updated () {
    // .. getting and registering root Size
    this.getRootWindowSize();
}

// -- =====================================================================================

destroyed () {
    NS.Application.android.off( NS.AndroidApplication.activityBackPressedEvent );
    NS.Application.android.off( NS.AndroidApplication.activityPausedEvent );
    NS.Application.android.off( NS.AndroidApplication.activityResumedEvent );
    Bus.$off( "Base_SwipeControl" );
    Bus.$off( "Base_HeadToIPanel" );
}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */
    .fx {
        height: 100%;
        width: 100%;
    }

    #beauty {
        width: 50%;
        margin-top: 65%;
        /* height: 30%; */
        margin-left: 41%;
        vertical-align: bottom;
        horizontal-align: center;
    }

</style>