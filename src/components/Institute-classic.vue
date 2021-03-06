<template>
<Page @navigatedTo="$store.state.here='Institute'" >
<AbsoluteLayout height="100%" width="100%" ref="wall" >

<!---------------------------------------------------------------------------------------->

    <ScrollView 
        ref="folderBox" 
        verticalAlignment="middle" 
        @swipe="swipePass=true"
        height="100%"
        @scroll=railSnap
        scrollBarIndicatorVisible="false"
    >

        <FlexBoxLayout
            ref="folderRail"
            width="200"
            class="miniFolder"
            flexWrap="wrap" 
            flexDirection="row"
            justifyContent="center"
        >

            <Folder 
                ref="folder" 
                v-for="(folder,i) of dir" 
                :key="folder.type+i+folder.path.join()"
                :myProp="folder"
                :hidden=folder.hidden
            />


        </FlexBoxLayout>

    </ScrollView>

<!---------------------------------------------------------------------------------------->

    <Label ref="pointer" class="pointer" />

    <iSummery ref="iSummery" />

<!---------------------------------------------------------------------------------------->

</AbsoluteLayout>
</Page>
</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

import { Vue, Component, Prop }         from "vue-property-decorator"
import * as NS                          from "@nativescript/core"
import * as TS                          from "@/../types/myTypes"
import store                            from "@/mixins/store"
import Folder                           from "@/components/tools/Folder.vue"
import * as _                           from "@/mixins/_dir"
import iSummery                         from "@/components/tools/iSummery.vue"
import * as tools                       from "@/mixins/tools"
import * as storage                     from "@/mixins/storageHandler"
import Bus                              from "@/mixins/bus"
// * npm i nativescript-exit
import { exit }                         from "nativescript-exit";
import * as shopping                    from "@/mixins/shopping"

// -- =====================================================================================

@Component( { 
    components: { Folder, iSummery }
} )

// -- =====================================================================================

export default class Institute extends Vue {

// -- =====================================================================================

@Prop() ins!: string;

// -- =====================================================================================

// TODO what is this?
swipePass: boolean;
dir: TS.FolderProperty[] = [];

// -- =====================================================================================

mounted () {

    store.state.mode = "idle";
    store.state.appConfig.instituteBookmark = this.ins;

    // .. touch currentPath for currentInstitute
    // if ( !store.state.inHand.path[ this.ins ] ) store.state.inHand.path[ this.ins ] = [];

    // .. refresh the list 
    // delete store.state.shopDB[ this.ins ];
    this.shopInitializer();

    this.railAdjuster();

    tools.dAO( this.ins );
    tools.glssDBUpdater( this.ins );

    this.folderListCalculator();

    Bus.$off( 'Institute_ShopListCalculator' );
    Bus.$on( 'Institute_ShopListCalculator', this.shopListCalculator );

    Bus.$off( 'Institute_ScrollToTop' );
    Bus.$on( 'Institute_ScrollToTop', this.scrollToTop );

    Bus.$off( 'Institute_FolderListCalculator' );
    Bus.$on( 'Institute_FolderListCalculator', this.folderListCalculator );

    Bus.$off( "Institute_BackOrExit" )
    Bus.$on( "Institute_BackOrExit", this.backOrExit );

}

// -- =====================================================================================

folderListCalculator () {

    let list = [],
        path ;
        // = store.state.inHand.path[ this.ins ];

    // .. convert lessonBox to List
    for ( let x of Object.values( store.state.massDB[ this.ins ] ) )
        if ( x.chromosome.vPath.length >= path.length )
            if ( path.every( (p,i) => p === x.chromosome.vPath[i] ) )
                list.push( x.chromosome.vPath[ path.length ] );

    // .. remove Duplicates
    list = [ ...new Set( list ) ];

    // .. sort Alphabetically & put Archive on the Top
    list = list.sort ( (a, b) => {
        if ( b === "Archive" ) return 1;
        if ( a.toLowerCase() == b.toLowerCase() ) return 0;
        if ( a.toLowerCase() >  b.toLowerCase() ) return 1;
        return -1;
    } );

    // .. generate and register the List
    this.dir = list.map( item =>  
        ( item === "Archive" && !path.length ) ? 
            _._archive( this.ins ) : _._ordinary( this.ins, item )
     );

    // .. add back Option
    if ( path.length ) this.dir.unshift( _._up( this.ins ) );

    // .. do in Home Page
    if ( !path.length ) {

        if ( list.length ) this.dir.push( _._divider() )

        let myRibosomes = store.state.rbssDB[ this.ins ];

        // .. convert ribosomesBox to List
        for ( let ribosome of Object.values( myRibosomes ) ) {
            this.dir.push( _._ribosome( this.ins, ribosome ) )
        }

        // ..  add Shop
        if ( Object.keys( myRibosomes ).length ) this.dir.push( _._divider() );
        // this.dir.push( _._shop( this.ins ) );

    }

    // ..  mini reAdjuster
    this.railSnap( { object: ( this.$refs.folderBox as any ).nativeView } );

}

// -- =====================================================================================

scrollToTop () {
    ( this.$refs as any ).folderBox.nativeView.scrollToVerticalOffset(0);
}

// -- =====================================================================================

shopInitializer () {

    let url = tools.ssd + 'ribosome?';
    url += "i=" + this.ins;
    url += "&e=" + store.state.appConfig.email;

    NS.Http.getJSON( url ).then(
        ( res: TS.SSD_Res ) => {
            // store.state.shopDB[ this.ins ] = res.answer as TS.Ribosomes;
            this.folderListCalculator();
        },
        // TODO .. report it
        e => {}
    )
    .catch( e => tools.toaster( e+'' ) );

}

// -- =====================================================================================

shopListCalculator ( filter: string[] = [] ) {

    let list = [];

    // .. convert shopDB to category
    if ( !filter.length ) {

        // for ( let x of Object.values( store.state.shopDB[ this.ins ] ) )
        //     list.push( x.type );

        this.dir = [];

        // .. sort list
        let order: TS.LessonType[] = [ "audio", "video", "comic", "plain", "slide" ];
        for ( let x of order )
            if ( list.includes(x) ) 
                this.dir.push ( _._category( this.ins, x ) );

    }
    else {
        // .. filter
        // for ( let x of Object.values( store.state.shopDB[ this.ins ] ) )
        //     if ( x.type === filter[0] ) list.push(x);

        this.dir = list.map( item => _._ribosome( this.ins, item ) );
    }

    // .. add back Option
    this.dir.unshift( _._up( this.ins ) );

}

// -- =====================================================================================

railAdjuster () {

    let r_h = store.state.windowSize.height,
        f_H = 105, // .. this value should be set carefully!!
        f_m = 5,  // .. this value should be set carefully!!
        f_h = f_H - f_m*2,
        p_h = 5,
        folderRail = this.$refs.folderRail as any,
        pointer    = this.$refs.pointer as any;

    folderRail.nativeView.paddingTop    = r_h/4 - f_h/2 + f_H;
    folderRail.nativeView.paddingBottom = r_h/2 - f_h/2 + f_H - f_m/4;
    folderRail.nativeView.paddingLeft   = 15;
    folderRail.nativeView.paddingRight  = 0;

    pointer.nativeView.marginTop        = r_h/4 - f_h/2 + f_H - p_h/2 + f_H/2;
    pointer.nativeView.marginLeft       = 10;

}

// -- =====================================================================================

// .. set timeouts to have better visual effects
x_TO = [50, 800];
railSnap_TO;
railSnap ( args ) {

    // .. bug Resolver
    if ( !this.$refs.folder ) return;

    this.iSummerySetter(-1);

    if ( this.railSnap_TO ) clearTimeout( this.railSnap_TO );

    this.railSnap_TO = setTimeout( () => {

        let pxx = this.pxx();

        if ( pxx.id === -1 ) pxx.id = ( this.$refs.folder as [] ).length -1;

        let folderTitle = this.$refs.folder[ pxx.id ].myProp.title;
        let r_h = store.state.windowSize.height,
            f_H = this.$refs.folder[0].nativeView.getActualSize().height || 95;
        
        // .. auto readjust in some situations:
        if ( folderTitle === "Archive" || folderTitle === ".." ) {

            pxx.diff += 105;

            // .. next one is divider!
            try { if ( this.$refs.folder[ pxx.id +1 ].myProp.type === "divider" ) 
                pxx.diff += 35 } catch (e) {}

            this.railSnap_TO = setTimeout( () => this.railSnap( args ), this.x_TO[1] );
        }

        // .. mini reAdjuster
        if ( !args.scrollY  ) args.scrollY = args.object.verticalOffset;

        args.object.scrollToVerticalOffset( args.scrollY + pxx.diff, true );

        this.iSummerySetter( pxx.id );

        this.x_TO = [200,9];

    }, this.x_TO[0] );

}

// -- =====================================================================================

pxx () {

    let pointer  = ( this.$refs.pointer as any ).nativeView;

    // .. just a bug resolver
    if ( typeof pointer.getLocationInWindow() === "undefined" ) return { id: -1, diff: -1 }
    if ( typeof this.$refs.folder === "undefined" ) return { id: -1, diff: -1 }

    let pointerC: number,
        folder,
        folderY: number,
        folderH: number,
        folderC: number;

    pointerC = pointer.getLocationInWindow().y + pointer.getActualSize().height /2;

    let id = Object.keys( this.$refs.folder ).findIndex( id => {
        folder  = ( this.$refs.folder[ id ] as any ).nativeView;
        folderH = folder.getActualSize().height;
        folderY = folder.getLocationInWindow().y;
        if ( folderY -5 <= pointerC && pointerC <= folderY + folderH +5 ) return true;
    } );

    if ( id === -1 ) return { id: -1, diff: -1 }

    folder   = ( this.$refs.folder[ id ] as any ).nativeView;
    folderH  = folder.getActualSize().height;
    folderY  = folder.getLocationInWindow().y;
    folderC  = folderY + folderH /2;

    return { id: id, diff: folderC - pointerC }

}

// -- =====================================================================================

iSummery_TO;
iSummerySetter ( id: number ) {

    if ( this.iSummery_TO ) clearTimeout( this.iSummery_TO );

    let iSummery = this.$refs.iSummery as iSummery;

    if ( id === -1 ) {
        iSummery.newData( null );
        return 0;
    }

    let data = this.dir[ id ].lesson || this.dir[ id ].ribosome ;

    if ( data ) this.iSummery_TO = setTimeout( () => iSummery.newData( data ), 50 );

}

// -- =====================================================================================

backOrExit () {

    let currentPath 
    // = store.state.inHand.path[ this.ins ];

    // .. shopping mode
    if      ( store.state.mode === "shopping" ) shopping.backOrExitShop( this.ins );
    // .. setting mode
    else if ( store.state.mode === "setting"  ) Bus.$emit( "Menu_ToggleMenu" );
    // .. idle mode
    else if ( currentPath.length ) {
        currentPath.pop();
        this.folderListCalculator();
    }
    // .. exit
    else {

        Bus.$emit( "Welcome_Slide", true );

        setTimeout( () => {

            let saveActions = [
                storage.saveMass(),
                storage.saveGlossar(),
                storage.saveRibosomes(),
                storage.saveFlashCards(),
                storage.saveAppConfig(),
            ];

            Promise.all( saveActions )
            .then( () => exit() )
            .catch( err => { 
                tools.toaster( err, "long" );
                exit();
            } );

        }, 700 );

    };

}

// -- =====================================================================================

updated () {
    setTimeout( () => this.iSummerySetter( this.pxx().id ), 50);
}

// -- =====================================================================================

beforeDestroy () {
    if ( this.railSnap_TO ) clearTimeout( this.railSnap_TO );
    if ( this.iSummery_TO ) clearTimeout( this.iSummery_TO );
}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */

    .pointer {
        height: 5;
        width: 5;
        border-radius: 5;
    }

    .light .pointer { background: #1b4f64 }
    .dark  .pointer { background: #c2c3c4 }

</style>




