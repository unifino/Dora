<template>
<Page>
<GridLayout ref="panelCurtain" id="curtain" columns="*,auto,*" rows="*,50,auto,50,*" >

<!---------------------------------------------------------------------------------------->

    <Label class="fas endPoint" col=1 row=1 :text="String.fromCharCode( '0x' + 'f0c2' )" />

    <StackLayout orientation="vertical" col=1 row=2 margin="60 0" >

        <Dot
            v-for="x in [1,2,3,4,5,6,7,8,9]"
            :key=x
            :isOn="false"
            :isFullFil="false"
            ref="dot"
        />

    </StackLayout>

    <Label class="fas endPoint" col=1 row=3 :text="String.fromCharCode( '0x' + 'f49e' )" />

    <Label
        class="fas middlePoint"
        col=1
        rowSpan=5
        :visibility="errIcon ? 'visible' : 'collapsed'"
        :text="String.fromCharCode( '0x' + errIcon )"
    />

<!---------------------------------------------------------------------------------------->

</GridLayout>
</page>
</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

// * npm i --save vue-class-component vue-property-decorator
import { Vue, Component, Prop }         from "vue-property-decorator"
import * as NS                          from "@nativescript/core"
import * as TS                          from "@/../types/myTypes"
import store                            from "@/mixins/store"
import * as tools                       from "@/mixins/tools"
import Bus                              from "@/mixins/bus"
import Dot                              from "@/components/ServerWindow/Dot.vue"

// -- =====================================================================================

@Component ( { 
    components: { Dot } 
} )

// -- =====================================================================================

export default class IPanel extends Vue {

// -- =====================================================================================

errIcon = "";

// -- =====================================================================================

mounted () {

    this.doorCtr( "open" );
    store.state.here = "IPanel";
    Bus.$on( "IPanel_Result", this.result );

}

// -- =====================================================================================

result ( err: string|false ) {

    if ( !err ) {
        this.dots( false, true );
        setTimeout( () => this.doorCtr( "close" ), 1500 );
    }

    else {

        setTimeout( () => this.dots( false ), 100 );

        let delay = 4000;

        let ex = err.toString();

        if ( ex.includes( "No address associated with hostname" ) ) err = "no conn.";
        // if ( ex.includes( "Unknown Lesson's Pre-Model" ) ) err = "Not Compatible";
        // if ( ex.includes( "context is not iterable" ) ) err = "Not Compatible";
        if ( ex.includes( "No News" ) ) err = "No News";
        if ( ex.includes( "No more News" ) ) err = "No more News";
        // .. if "contains" reports more than actual provided lessons
        if ( ex.includes( "no more lesson" ) ) err = "no more lesson";

        switch ( err ) {

            case "insufficient charge!":
                this.errIcon = 'f244';
                tools.toaster( "Please charge your account!", "long" );
                break;

            case "No News":
                this.errIcon = "f1ea";
                tools.toaster( "News is not ready yet!\nPlease try later!", "long" );
                break;

            case "unrecognizable user!":
                this.errIcon = "f2c2";
                tools.toaster( "We can NOT verify you!", "long" );
                break;

            case "No more News":
                this.errIcon = "f0c5";
                tools.toaster( "You've already got Today News!", "long" );
                break;

            case "no more lesson":
                this.errIcon = "f2a7";
                tools.toaster( "You've already got all Lessons!", "long" );
                break;

            case "no conn.":
                this.errIcon = "f6ff";
                tools.toaster( "Check your Internet Connection!" );
                delay = 2500;
                break;

            case "Not Compatible":
                this.errIcon = "f0c7";
                tools.toaster( "Lesson & App Version: Incompatible!" );
                break;

            case "rRNA mismatched!":
            case "Ribosome Not Found!":
                this.errIcon = "f233";
                tools.toaster( "Server ERROR!\n\nPlease Contact the Developer." );
                break;

            default:
                delay = 2500;
                tools.toaster( err );
                console.log( err );
                break;

        }

        // this.errIcon = "f3ed"; // guard 

        setTimeout( () => this.doorCtr( "close" ), delay );

    }

}

// -- =====================================================================================

door_TO: NodeJS.Timeout | any;
async doorCtr ( act: 'open' | 'close' ) {

    let curtain = ( this.$refs.panelCurtain as any ).nativeView;

    if ( act === "close" ) {
        curtain.animate( { opacity: 0 } );
        this.dots( false );
        this.errIcon = null;
    }

    if ( act === "open" ) setTimeout( () => curtain.animate( { opacity: 1 } ), 200 );

    // .. after fully expanded and maximized to borders
    let myCallBack = async () => {
        if ( act === "open" ) this.dots( true );
        if ( act === "close" ) store.state.here = "Institute";
    }

    this.door_TO = setTimeout( () => myCallBack(), 100 );

}

// -- =====================================================================================

onIs = -1;
upWard = true;
iPanel_TO: NodeJS.Timeout | any;
dots ( run: boolean, fullfil = false ) {

    if ( this.iPanel_TO ) clearTimeout( this.iPanel_TO );
    let c = ( this.$refs.dot as [] ).length;
    
    for ( let dot of this.$refs.dot as [] ) {
        ( dot as any ).isOn = false;
        ( dot as any ).isFullFill = fullfil;
    }

    if ( fullfil || !run ) return 0;

    this.onIs = ( this.onIs +1 ) % c;
    let isOn = this.upWard ? (c-1) -this.onIs : this.onIs;
    
    if ( this.onIs === c-1 ) this.upWard = !this.upWard;

    this.$refs.dot[ isOn ].isOn = true;
    
    this.iPanel_TO = setTimeout( () => this.dots( true ), 110 );

}

// -- =====================================================================================

destroyed () {
    if ( this.door_TO ) clearTimeout( this.door_TO );
    if ( this.iPanel_TO ) clearTimeout( this.iPanel_TO );
    Bus.$off( "IPanel_Result" );
}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */

    /* // TODO all class tarnsforms to id if possible */
    #curtain {
       background-color: rgba(24, 23, 23, 0.985);
       opacity: 0;
    }

    .middlePoint {
        font-size: 45;
        color: rgb(236, 85, 15);
        background-color: rgba(24, 23, 23, 0.985);
        text-align: center;
        height: 45;
        margin-top: -4;
    }

    .endPoint {
        font-size: 50;
    }


</style>