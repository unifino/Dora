<template>

    <nButton
        :myClass="'opt-item ram fas ' + profile.iconColor"
        :myLabel="String.fromCharCode( '0x' + profile.icon )"
        @tap="ram"
        @long-press="longPressed"
    />

</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

// * npm i --save vue-class-component vue-property-decorator
import { Vue, Component, Prop }         from "vue-property-decorator"
import store                            from "@/mixins/store"
import nButton                          from "@/components/tools/n_Button.vue"
import Bus                              from "@/mixins/bus"
import * as storage                     from "@/mixins/storageHandler"
import * as NS                          from "@nativescript/core"
import { myRam, _ram }                  from "@/mixins/user"
import * as tools                       from "@/mixins/tools"
import * as TS                          from "@/../types/myTypes"

// -- =====================================================================================

@Component ( {
    components: { nButton }
} )

// -- =====================================================================================

export default class Ram extends Vue {

profiles: TS.RamProfiles = {
    init:   { name: "init" , icon: "f141", iconColor: "init"   } ,
    empty:  { name: "empty", icon: "f093", iconColor: "blue"   } ,
    full:   { name: "full" , icon: "f019", iconColor: "orange" } ,
    error:  { name: "error", icon: "f188", iconColor: "red"    } ,
}

profile = { ...this.profiles.init };

// -- =====================================================================================

getRamStatus (): Promise<TS.RamProfile> {

    return new Promise ( (rs, rx) => {

        let url = tools.ssd + 'getRamStatus';

        NS.Http.request( {
            url: url ,
            method: "POST",
            headers: { "Content-Type": "application/json" },
            content: JSON.stringify( {
                e: store.state.appConfig.email,
                k: tools.key(),
            } )
        } )
        .then(
            res => {

                let x = res.content.toJSON() as TS.SSD_Res;

                if ( x.status === 200 ) {
                    let ram = x.answer;
                    rs( this.profile = ram ? this.profiles.full : this.profiles.empty );
                }
                else rx( this.profile = { ...this.profiles.error } );

            },
            e => rx( this.profile = { ...this.profiles.error } )
        )
        .catch( e => rx( this.profile = { ...this.profiles.error  } ) );

    } );

}

// -- =====================================================================================

mounted () {
    Bus.$off( "Ram_Init" );
    Bus.$on( "Ram_Init", this.init );
}

// -- =====================================================================================

init () {
    this.getRamStatus();
}

// -- =====================================================================================

ram () {

    let action: TS.RamActions;

    switch ( this.profile.name ) {

        case "init" : tools.toaster( "wait ..." );      return;
        case "error": tools.toaster( "ram error!" );    return;

        case "empty": action = "upload";                break;
        case "full" : action = "download";              break;

    }

    // .. initiate transfer animation
    Bus.$emit( "Base_HeadToIPanel" );

    myRam( action ).then( async ram => {

        Bus.$emit( "IPanel_Result" );

        // .. beautifying
        await new Promise( _ => setTimeout( _ , 180 ) );

        // .. if : ram data is downloaded
        if ( ram ) {
            // .. data is implanted successfully
            if ( _ram(ram) ) {
                this.profile = this.profiles.empty;
                // .. reload Data
                tools.dAO( store.state.inHand.institute );
            }
            // .. data is corrupted!
            else this.profile = this.profiles.error;
        }
        // .. if : data is uploaded to the Ram
        else this.profile = this.profiles.full;

        // .. confirm everything is synced
        tools.syncConfirm();

    } )
    .catch ( e => Bus.$emit( "IPanel_Result", e.reason || e ) );

}

// -- =====================================================================================

longPressed () {

    // .. purge it if it full
    if ( this.profile.name === "full" ) {
        myRam( "purge" )
        .then( ram => {
            this.profile = this.profiles.empty;
            tools.toaster( "Ram is Free!" );
        } )
        .catch ( e => Bus.$emit( "IPanel_Result", e.reason || e ) );
    }

    // .. just report it if it not full
    else this.getRamStatus();

}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */

    .light .init        { color: #95c5ce }
    .light .blue        { color: #0e9bd3 }
    .light .orange      { color: #f06735 }
    .light .red         { color: #f03535 }

    .dark  .init        { color: #747e80 }
    .dark  .blue        { color: #0169ad }
    .dark  .orange      { color: #d44714 }
    .dark  .red         { color: #991616 }

    .ram {
        font-size: 29;
    }

    .opt-item { margin: 0 -15 0 0 }

</style>