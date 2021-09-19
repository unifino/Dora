<template>

    <nButton
        :myClass="'opt-item ram fas ' + ramStatus.iconColor"
        :myLabel="String.fromCharCode( '0x' + ramStatus.icon )"
        @tap="update"
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
import { myRam }                        from "@/mixins/user"
import * as tools                       from "@/mixins/tools"
import * as TS                          from "@/../types/myTypes"

// -- =====================================================================================

@Component ( { 
    components: { nButton }
} )

// -- =====================================================================================

export default class Ram extends Vue {

profiles = {
    init:   { icon: "f141", iconColor: "init",   textColor: "transparent" } ,
    error:  { icon: "f188", iconColor: "red",    textColor: "antiRed"     } ,
    empty:  { icon: "f7da", iconColor: "red",    textColor: "orange"      } ,
    full:   { icon: "f7da", iconColor: "green",  textColor: "antiGreen"   } ,
}

profile = { ...this.profiles.init };

// -- =====================================================================================

get ramStatus () {

    let ram = this.profile;

    return ram;

}

// -- =====================================================================================

getRamStatus (): Promise<void> {

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
                    let nrg = parseInt( x.answer as string ) ;
                    if ( nrg <   0 ) this.profile = { ...this.profiles.error };
                    if ( nrg === 0 ) this.profile = { ...this.profiles.empty };
                    if ( nrg >   0 ) this.profile = { ...this.profiles.full };
                    rs();
                }
                else rx( this.profile = { ...this.profiles.error } );

            },
            e => rx( this.profile = { ...this.profiles.error } )
        )
        .catch( e => rx( this.profile = { ...this.profiles.error  } ) );

    } );

}

// -- =====================================================================================

update () {

    // .. zip all important data to transfer
    let data = {
        mass: store.state.massDB,
        flss: store.state.flssDB,
        glss: store.state.glssDB,
    }

    let baseFolder  = NS.Folder.fromPath( NS.path.join( storage.SDCard, "Dora" ) );
    let bp      = baseFolder.path;
    let tmpFile = NS.File.fromPath( NS.path.join( bp, ".documents", "tmp"  ) );
    tmpFile.writeText( JSON.stringify( data ) )

    myRam( JSON.stringify( data ) );

}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */

    .light .init        { color: #95c5ce }
    .light .blue        { color: #0a4c83 }
    .light .orange      { color: #f06735 }
    .light .red         { color: #f03535 }
    .light .green       { color: #539912 }

    .dark  .init        { color: #747e80 }
    .dark  .blue        { color: #0169ad }
    .dark  .orange      { color: #d44714 }
    .dark  .red         { color: #991616 }
    .dark  .green       { color: #40770d }

    .ram {
        font-size: 29;
    }

    .opt-item { margin: 0 -15 0 0 }

</style>