<template>

    <nButton
        :myClass="'opt-item dictionary fas ' + profile.iconColor"
        :myLabel="String.fromCharCode( '0x' + profile.icon )"
    />

</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

// * npm i --save vue-class-component vue-property-decorator
import { Vue, Component, Prop }         from "vue-property-decorator"
import store                            from "@/mixins/store"
import nButton                          from "@/components/tools/n_Button.vue"
import MenuPanel                        from "@/components/Menu/Panel.vue"
import Ram                              from "@/components/Menu/Ram.vue"
import Bus                              from "@/mixins/bus"
import * as storage                     from "@/mixins/storageHandler"
import * as NS                          from "@nativescript/core"
import * as tools                       from "@/mixins/tools"
import * as TS                          from "@/../types/myTypes"

// -- =====================================================================================

@Component ( {
    components: { nButton }
} )

// -- =====================================================================================

export default class Dictionary extends Vue {

profiles: TS.DictionaryProfiles = {
    init:       { name: "init",         icon: "f141", iconColor: "init"   } ,
    updating:   { name: "updating",     icon: "f558", iconColor: "blue"   } ,
    ready:      { name: "ready",        icon: "f558", iconColor: "hide"   } ,
    exceedQuota:{ name: "exceedQuota",  icon: "f558", iconColor: "red"    } ,
    error:      { name: "error",        icon: "f188", iconColor: "red"    } ,
}

profile = { ...this.profiles.init };

// -- =====================================================================================

mounted () {
}

// -- =====================================================================================

init ( ins: string ) {

    let menuPanel = this.$parent.$parent.$refs.menuPanel as MenuPanel;
    let Ram = menuPanel.$refs.Ram as Ram;

    Ram.getRamStatus()
    .then( ramProfile => {
        if( ramProfile.name === "empty" ) {
            this.profile = this.profiles.updating;
            tools.glssDBUpdater( ins )
            .then( stats => {
                if ( !stats.fuse_Quota ) this.profile = this.profiles.exceedQuota;
                else if ( stats.fuse_AllSet ) this.profile = this.profiles.ready;
                else tools.toaster( stats+"", "long" );
            } ).catch( e => {
                this.profile = this.profiles.error;
                tools.toaster( e+"", "long" );
            } );
        }
    } )
    .catch( e => this.profile = this.profiles.error );

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
    .light .red         { color: #f03535 }

    .dark  .init        { color: #747e80 }
    .dark  .blue        { color: #0169ad }
    .dark  .red         { color: #991616 }

    .dark  .hide        { color: transparent }

    .dictionary {
        margin-right: -10;
        font-size: 25;
    }

    .opt-item { margin: 0 -15 0 0 }

</style>